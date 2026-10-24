import { NextResponse } from 'next/server';
import { products } from '@/data/products';
import { newId, updateStore } from '@/data/repo';
import { isAdminSession } from '@/lib/auth';
import { lotSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, messageKey: 'notSignedIn' }, { status: 401 });
  }

  const parsed = lotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !products.some((p) => p.id === parsed.data.productId)) {
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
      sellingPriceUnit: d.sellingPriceUnit,
      lotExpensesTotal: d.lotExpensesTotal,
      expenseNote: d.expenseNote,
    });
  });

  return NextResponse.json({ ok: true, messageKey: 'lotSaved' });
}
