import { describe, expect, it } from 'vitest';
import type { StoreData } from './repo';
import { rowsToAppend, storeFromValues, type SheetValues } from './sheetMapping';

const empty: StoreData = { lots: [], sales: [], overhead: [], quotes: [] };

const after: StoreData = {
  lots: [
    {
      lotId: 'L-1',
      productId: 'P001',
      receivedOn: '2026-06-01',
      supplier: 'Kumar Traders',
      qtyReceived: 50,
      buyPriceUnit: 150,
      sellingPriceUnit: 200,
      lotExpensesTotal: 500,
      expenseNote: 'Lorry',
    },
  ],
  sales: [
    {
      saleId: 'S-1',
      sliceNo: 1,
      soldAt: '2026-06-02T10:00:00.000Z',
      productId: 'P001',
      lotId: 'L-1',
      qty: 2,
      unitPrice: 200,
      unitCost: 160,
      payment: 'upi',
      customerName: 'Ravi',
      customerPhone: '9876543210',
    },
  ],
  overhead: [{ overheadId: 'O-1', month: '2026-06', type: 'rent', amount: 8000, note: '' }],
  quotes: [
    {
      quoteId: 'Q-1',
      createdAt: '2026-06-03T09:00:00.000Z',
      customerName: 'Asha',
      customerPhone: '9123456780',
      language: 'ml',
      items: [{ productId: 'P001', qty: 3, unitPrice: 200 }],
      total: 600,
      status: 'draft',
    },
  ],
};

describe('sheet rows', () => {
  it('round-trips: what we write is what we read back', () => {
    let n = 0;
    const values: SheetValues = rowsToAppend(empty, after, (p) => `${p}-${++n}`);
    expect(storeFromValues(values)).toEqual(after);
  });

  it('writes a new lot expense as an Expenses row', () => {
    const values = rowsToAppend(empty, after, () => 'E-1');
    expect(values.expenses).toEqual([['E-1', 'L-1', 'Other', '500', '2026-06-01', 'Lorry']]);
  });

  it('appends only the records added since the last save', () => {
    const values = rowsToAppend(after, { ...after, sales: [...after.sales, { ...after.sales[0], saleId: 'S-2' }] }, () => 'x');
    expect(values.sales).toHaveLength(1);
    expect(values.sales[0][0]).toBe('S-2');
    expect(values.lots).toEqual([]);
    expect(values.quotes).toEqual([]);
  });

  it('never writes formula columns', () => {
    const values = rowsToAppend(empty, after, () => 'E');
    expect(values.lots[0]).toHaveLength(8); // A..H only
    expect(values.sales[0]).toHaveLength(11); // A..K only; Total is column L
  });

  it('reads empty rows and blank cells safely', () => {
    const store = storeFromValues({
      lots: [['L-9', 'P002', '2026-01-01', '', '', '', '', '']],
      sales: [],
      expenses: [],
      overhead: [],
      quotes: [],
    });
    expect(store.lots[0]).toMatchObject({ buyPriceUnit: 0, qtyReceived: 0, lotExpensesTotal: 0 });
  });
});
