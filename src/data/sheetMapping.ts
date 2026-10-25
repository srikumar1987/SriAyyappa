import type { LotRecord, OverheadRecord, ProductRecord, QuoteRecord, SaleRecord, StoreData } from './repo';
import { categoryFromText, categoryLabel, type Category } from './products';

// Column layout of the Google Sheet. Must match scripts/make_sheet_template.py.
// Only the value columns are written; formula columns (Lot totals, Qty_Sold, Total...) are left to the sheet.
export const TABS = {
  products: 'Products',
  lots: 'Lots',
  sales: 'Sales',
  expenses: 'Expenses',
  overhead: 'Overhead',
  quotes: 'Quotes',
} as const;

export const READ_RANGES = {
  products: 'A2:O',
  lots: 'A2:M',
  sales: 'A2:L',
  expenses: 'A2:F',
  overhead: 'A2:E',
  quotes: 'A2:H',
} as const;

export const APPEND_RANGES = {
  products: 'A:O',
  lots: 'A:H',
  sales: 'A:K',
  expenses: 'A:F',
  overhead: 'A:E',
  quotes: 'A:H',
} as const;

export type Rows = string[][];
export interface SheetValues {
  products: Rows;
  lots: Rows;
  sales: Rows;
  expenses: Rows;
  overhead: Rows;
  quotes: Rows;
}

const num = (s: string | undefined) => {
  const n = Number(s ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export function storeFromValues(v: SheetValues): StoreData {
  const expenseByLot = new Map<string, number>();
  for (const r of v.expenses.filter((r) => r[0])) {
    expenseByLot.set(r[1], (expenseByLot.get(r[1]) ?? 0) + num(r[3]));
  }

  const lots: LotRecord[] = v.lots
    .filter((r) => r[0])
    .map((r) => ({
      lotId: r[0],
      productId: r[1],
      receivedOn: r[2],
      supplier: r[3] ?? '',
      buyPriceUnit: num(r[4]),
      qtyReceived: num(r[5]),
      sellingPriceUnit: num(r[6]),
      expenseNote: r[7] ?? '',
      lotExpensesTotal: expenseByLot.get(r[0]) ?? 0,
    }));

  const sales: SaleRecord[] = v.sales
    .filter((r) => r[0])
    .map((r) => ({
      saleId: r[0],
      sliceNo: num(r[1]),
      soldAt: r[2],
      productId: r[3],
      lotId: r[4],
      qty: num(r[5]),
      unitPrice: num(r[6]),
      unitCost: num(r[7]),
      payment: r[8] ?? '',
      customerName: r[9] ?? '',
      customerPhone: r[10] ?? '',
    }));

  const overhead: OverheadRecord[] = v.overhead
    .filter((r) => r[0])
    .map((r) => ({ overheadId: r[0], month: r[1], type: r[2], amount: num(r[3]), note: r[4] ?? '' }));

  const quotes: QuoteRecord[] = v.quotes
    .filter((r) => r[0])
    .map((r) => ({
      quoteId: r[0],
      createdAt: r[1],
      customerName: r[2] ?? '',
      customerPhone: r[3] ?? '',
      language: r[4] ?? 'en',
      status: (r[5] || 'draft') as QuoteRecord['status'],
      total: num(r[6]),
      items: JSON.parse(r[7] || '[]'),
    }));

  const products: ProductRecord[] = v.products
    .filter((r) => r[0])
    .map((r) => ({
      productId: r[0],
      names: { ml: r[1], en: r[2], ta: r[3], kn: r[4], te: r[5], hi: r[6] },
      category: categoryFromText(r[7] ?? '') ?? 'pooja',
      price: num(r[8]),
      mrp: num(r[10]),
      manufacturer: r[11] ?? '',
      description: r[12] ?? '',
      imageUrl: r[13] ?? '',
      unit: r[14] || 'piece',
    }))
    .map((p) => ({ ...p, names: Object.fromEntries(Object.entries(p.names).filter(([, v]) => v)) }));

  return { lots, sales, overhead, quotes, products };
}

/**
 * Rows to add to the sheet after `after` replaces `before`. The store is append-only,
 * so the new records are the ones past the old length. A new lot's expenses become Expenses rows.
 */
export function rowsToAppend(before: StoreData, after: StoreData, makeId: (prefix: string) => string): SheetValues {
  const newLots = after.lots.slice(before.lots.length);
  const newSales = after.sales.slice(before.sales.length);
  const newOverhead = after.overhead.slice(before.overhead.length);
  const newQuotes = after.quotes.slice(before.quotes.length);

  const newProducts = after.products.slice(before.products.length);

  return {
    products: newProducts.map((p) => [
      p.productId,
      p.names.ml ?? '',
      p.names.en ?? '',
      p.names.ta ?? '',
      p.names.kn ?? '',
      p.names.te ?? '',
      p.names.hi ?? '',
      categoryLabel[p.category as Category] ?? p.category,
      String(p.price),
      '',
      String(p.mrp),
      p.manufacturer,
      p.description,
      p.imageUrl,
      p.unit,
    ]),
    lots: newLots.map((l) => [
      l.lotId,
      l.productId,
      l.receivedOn,
      l.supplier,
      String(l.buyPriceUnit),
      String(l.qtyReceived),
      String(l.sellingPriceUnit),
      l.expenseNote,
    ]),
    expenses: newLots
      .filter((l) => l.lotExpensesTotal > 0)
      .map((l) => [makeId('E'), l.lotId, 'Other', String(l.lotExpensesTotal), l.receivedOn, l.expenseNote]),
    sales: newSales.map((s) => [
      s.saleId,
      String(s.sliceNo),
      s.soldAt,
      s.productId,
      s.lotId,
      String(s.qty),
      String(s.unitPrice),
      String(s.unitCost),
      s.payment,
      s.customerName,
      s.customerPhone,
    ]),
    overhead: newOverhead.map((o) => [o.overheadId, o.month, o.type, String(o.amount), o.note]),
    quotes: newQuotes.map((q) => [
      q.quoteId,
      q.createdAt,
      q.customerName,
      q.customerPhone,
      q.language,
      q.status,
      String(q.total),
      JSON.stringify(q.items),
    ]),
  };
}
