import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { newId, updateStore } from '@/data/repo';
import { saveProductImage } from '@/data/imageStore';
import { categoryLabel, type Category } from '@/data/products';
import { allowsDecimal, UNITS } from '@/data/units';
import { isAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const optionalName = z.string().trim().max(120).default('');
const CATEGORY_KEYS = Object.keys(categoryLabel) as [Category, ...Category[]];

// MRP is the price the store sets and sells at. Every product is added with the price it was bought for.
const productSchema = z.object({
  names: z.object({
    ml: optionalName,
    en: optionalName,
    ta: optionalName,
    kn: optionalName,
    te: optionalName,
    hi: optionalName,
  }),
  category: z.enum(CATEGORY_KEYS),
  unit: z.enum(UNITS),
  mrp: z.coerce.number().positive().max(1000000),
  buyPrice: z.coerce.number().nonnegative().max(1000000),
  openingQty: z.coerce.number().positive().max(100000),
  supplier: z.string().trim().max(80).default(''),
  manufacturer: z.string().trim().max(80).default(''),
  description: z.string().trim().max(500).default(''),
  imageDataUrl: z
    .string()
    .max(2_000_000)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, messageKey: 'notSignedIn' }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (raw && raw.buyPrice === '') delete raw.buyPrice;
  if (raw && raw.openingQty === '') delete raw.openingQty;

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const missing = parsed.error.issues.some((i) => i.path[0] === 'buyPrice' || i.path[0] === 'openingQty');
    return NextResponse.json({ ok: false, messageKey: missing ? 'buyPriceRequired' : 'invalidInput' }, { status: 400 });
  }
  const d = parsed.data;
  const names = Object.fromEntries(Object.entries(d.names).filter(([, v]) => v));
  if (!names.en && !names.ml) {
    return NextResponse.json({ ok: false, messageKey: 'nameRequired' }, { status: 400 });
  }
  if (!allowsDecimal(d.unit) && !Number.isInteger(d.openingQty)) {
    return NextResponse.json({ ok: false, messageKey: 'wholeNumberQty' }, { status: 400 });
  }

  const productId = newId('P');
  const imageUrl = d.imageDataUrl
    ? await saveProductImage(productId, Buffer.from(d.imageDataUrl.split(',')[1], 'base64'))
    : '';
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  await updateStore((data) => {
    data.products.push({
      productId,
      category: d.category,
      price: d.mrp,
      mrp: d.mrp,
      unit: d.unit,
      manufacturer: d.manufacturer,
      description: d.description,
      names,
      imageUrl,
    });
    // The purchase becomes the first lot, so stock, cost and profit work from day one.
    data.lots.push({
      lotId: newId('L'),
      productId,
      receivedOn: today,
      supplier: d.supplier || 'Opening stock',
      qtyReceived: d.openingQty,
      buyPriceUnit: d.buyPrice,
      sellingPriceUnit: d.mrp,
      lotExpensesTotal: 0,
      expenseNote: '',
    });
  });

  revalidateTag('products');

  return NextResponse.json({ ok: true, messageKey: 'productSaved', vars: { id: productId } });
}
