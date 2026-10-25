import { NextResponse } from 'next/server';
import { findIn, getProducts } from '@/lib/catalogue';
import { mrpOf } from '@/data/products';
import { newId, updateStore } from '@/data/repo';
import { allocateFifo, InsufficientStockError } from '@/domain/fifo';
import { lotStocks } from '@/domain/stockView';
import { isAdminSession } from '@/lib/auth';
import { saleSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, messageKey: 'notSignedIn' }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (raw && raw.unitPrice === '') delete raw.unitPrice;
  const parsed = saleSchema.safeParse(raw);
  const product = parsed.success ? findIn(await getProducts(), parsed.data.productId) : undefined;
  if (!parsed.success || !product) {
    return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
  }

  const d = parsed.data;
  const unitPrice = d.unitPrice ?? mrpOf(product);
  const saleId = newId('S');
  const soldAt = new Date().toISOString();

  try {
    // The FIFO check and the write happen inside one update, so a sale that is too large writes nothing.
    await updateStore((data) => {
      const slices = allocateFifo(lotStocks(data.lots, data.sales, d.productId), d.qty);
      slices.forEach((s, i) => {
        data.sales.push({
          saleId,
          sliceNo: i + 1,
          soldAt,
          productId: d.productId,
          lotId: s.lotId,
          qty: s.qty,
          unitPrice,
          unitCost: s.unitCost,
          payment: d.payment,
          customerName: d.customerName,
          customerPhone: d.customerPhone,
        });
      });
    });
  } catch (e) {
    if (e instanceof InsufficientStockError) {
      return NextResponse.json(
        { ok: false, messageKey: 'insufficient', vars: { available: e.available } },
        { status: 409 }
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true, messageKey: 'saleSaved' });
}
