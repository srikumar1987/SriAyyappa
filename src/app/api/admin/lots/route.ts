import { NextResponse } from 'next/server';
import { findIn, getProducts } from '@/lib/catalogue';
import { mrpOf } from '@/data/products';
import { newId, updateStore } from '@/data/repo';
import { isAdminSession } from '@/lib/auth';
import { lotSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, messageKey: 'notSignedIn' }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (raw && raw.sellingPriceUnit === '') delete raw.sellingPriceUnit;
  const parsed = lotSchema.safeParse(raw);
  const product = parsed.success ? findIn(await getProducts(), parsed.data.productId) : undefined;
  if (!parsed.success || !product) {
    return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
  }

  const d = parsed.data;
  await updateStore((data) => {
    data.lots.push({
      lotId: newId('L'),
      productId: d.productId,
      receivedOn: d.receivedOn,
      supplier: d.supplier,
      qtyReceived: d.qtyReceived,
      buyPriceUnit: d.buyPriceUnit,
      sellingPriceUnit: d.sellingPriceUnit ?? mrpOf(product),
      lotExpensesTotal: d.lotExpensesTotal,
      expenseNote: d.expenseNote,
    });
  });

  return NextResponse.json({ ok: true, messageKey: 'lotSaved' });
}
