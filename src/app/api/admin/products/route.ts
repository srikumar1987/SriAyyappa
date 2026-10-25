import { NextResponse } from 'next/server';
import { z } from 'zod';
import { newId, updateStore } from '@/data/repo';
import { saveProductImage } from '@/data/imageStore';
import { categoryLabel, type Category } from '@/data/products';
import { isAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const optionalName = z.string().trim().max(120).default('');
const CATEGORY_KEYS = Object.keys(categoryLabel) as [Category, ...Category[]];

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
  price: z.coerce.number().nonnegative().max(1000000),
  mrp: z.coerce.number().nonnegative().max(1000000).default(0),
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

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
  }
  const d = parsed.data;
  const names = Object.fromEntries(Object.entries(d.names).filter(([, v]) => v));
  if (!names.en && !names.ml) {
    return NextResponse.json({ ok: false, messageKey: 'nameRequired' }, { status: 400 });
  }

  const productId = newId('P');
  const imageUrl = d.imageDataUrl
    ? await saveProductImage(productId, Buffer.from(d.imageDataUrl.split(',')[1], 'base64'))
    : '';

  await updateStore((data) => {
    data.products.push({
      productId,
      category: d.category,
      price: d.price,
      mrp: d.mrp,
      manufacturer: d.manufacturer,
      description: d.description,
      names,
      imageUrl,
    });
  });

  return NextResponse.json({ ok: true, messageKey: 'productSaved', vars: { id: productId } });
}
