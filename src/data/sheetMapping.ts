import type { LotRecord, OverheadRecord, QuoteRecord, SaleRecord, StoreData } from './repo';

// Column layout of the Google Sheet. Must match scripts/make_sheet_template.py.
// Only the value columns are written; formula columns (Lot totals, Qty_Sold, Total...) are left to the sheet.
export const TABS = {
  lots: 'Lots',
  sales: 'Sales',
  expenses: 'Expenses',
  overhead: 'Overhead',
  quotes: 'Quotes',
} as const;

export const READ_RANGES = {
  lots: 'A2:M',
  sales: 'A2:L',
  expenses: 'A2:F',
  overhead: 'A2:E',
  quotes: 'A2:H',
} as const;

export const APPEND_RANGES = {
  lots: 'A:H',
  sales: 'A:K',
  expenses: 'A:F',
  overhead: 'A:E',
  quotes: 'A:H',
} as const;

export type Rows = string[][];
export interface SheetValues {
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

  return { lots, sales, overhead, quotes };
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

  return {
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
