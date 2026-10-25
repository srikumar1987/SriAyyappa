import { NextResponse } from 'next/server';
import { z } from 'zod';
import { newId, updateStore, type QuoteItem } from '@/data/repo';
import { round2 } from '@/domain/costing';
import { findIn, getProducts } from '@/lib/catalogue';
import { locales } from '@/i18n';

export const dynamic = 'force-dynamic';

const quoteSchema = z.object({
  customerName: z.string().trim().min(1).max(80),
  customerPhone: z.string().trim().regex(/^[0-9+ ]{8,15}$/),
  language: z.enum(locales),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(20),
        qty: z.coerce.number().int().min(1).max(1000),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  const parsed = quoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
  }

  // Merge repeated products and take every price from the catalogue, never from the browser.
  const all = await getProducts();
  const merged = new Map<string, number>();
  for (const item of parsed.data.items) {
    if (!findIn(all, item.productId)) {
      return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
    }
    merged.set(item.productId, Math.min(1000, (merged.get(item.productId) ?? 0) + item.qty));
  }

  const items: QuoteItem[] = [...merged].map(([productId, qty]) => ({
    productId,
    qty,
    unitPrice: findIn(all, productId)!.price,
  }));
  const total = round2(items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0));
  const quoteId = newId('Q');

  await updateStore((data) => {
    data.quotes.push({
      quoteId,
      createdAt: new Date().toISOString(),
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      language: parsed.data.language,
      items,
      total,
      status: 'draft',
    });
  });

  return NextResponse.json({ ok: true, quoteId });
}
