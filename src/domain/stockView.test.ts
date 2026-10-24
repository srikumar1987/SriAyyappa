import { describe, expect, it } from 'vitest';
import { allocateFifo } from './fifo';
import { lotStocks, stockRows, type LotLike, type SaleLike } from './stockView';

const lots: LotLike[] = [
  { lotId: 'L1', productId: 'P1', receivedOn: '2026-01-01', qtyReceived: 10, buyPriceUnit: 100, lotExpensesTotal: 0 },
  { lotId: 'L2', productId: 'P1', receivedOn: '2026-02-01', qtyReceived: 20, buyPriceUnit: 120, lotExpensesTotal: 0 },
  { lotId: 'L3', productId: 'P2', receivedOn: '2026-01-01', qtyReceived: 5, buyPriceUnit: 50, lotExpensesTotal: 0 },
  { lotId: 'L4', productId: 'P3', receivedOn: '2026-01-01', qtyReceived: 4, buyPriceUnit: 10, lotExpensesTotal: 0 },
  { lotId: 'L5', productId: 'P4', receivedOn: '2026-01-01', qtyReceived: 10, buyPriceUnit: 10, lotExpensesTotal: 0 },
];

const sales: SaleLike[] = [
  { productId: 'P1', lotId: 'L1', qty: 10, soldAt: '2026-02-10T10:00:00.000Z' },
  { productId: 'P2', lotId: 'L3', qty: 5, soldAt: '2026-01-20T10:00:00.000Z' },
];

describe('lotStocks', () => {
  it('subtracts sold units from each lot and includes landed cost', () => {
    expect(lotStocks(lots, sales, 'P1')).toEqual([
      { lotId: 'L1', receivedOn: '2026-01-01', remaining: 0, unitCost: 100 },
      { lotId: 'L2', receivedOn: '2026-02-01', remaining: 20, unitCost: 120 },
    ]);
  });

  it('feeds straight into FIFO: a sale of 15 spans both lots', () => {
    const slices = allocateFifo(lotStocks(lots, [], 'P1'), 15);
    expect(slices).toEqual([
      { lotId: 'L1', qty: 10, unitCost: 100 },
      { lotId: 'L2', qty: 5, unitCost: 120 },
    ]);
  });
});

describe('stockRows', () => {
  it('reports remaining, last sale and status', () => {
    const rows = stockRows(['P1', 'P2', 'P3', 'P4'], lots, sales, new Date('2026-03-13T00:00:00Z'));

    expect(rows.P1).toMatchObject({ remaining: 20, lastSoldAt: '2026-02-10T10:00:00.000Z' });
    expect(rows.P1.daysSinceLastSale).toBe(30);
    // 30 days since last sale is the slow threshold; P1 has stock, so this is 'slow'
    expect(rows.P1.status).toBe('slow');

    expect(rows.P2).toMatchObject({ remaining: 0, status: 'out' });

    expect(rows.P3).toMatchObject({ remaining: 4, status: 'low', lastSoldAt: null });
  });

  it('counts days since receipt for items that have never sold', () => {
    const rows = stockRows(['P4'], lots, sales, new Date('2026-02-01T00:00:00Z'));
    expect(rows.P4.daysSinceLastSale).toBe(31);
    expect(rows.P4.status).toBe('slow');
  });

  it('shows a recent sale as OK', () => {
    const rows = stockRows(['P1'], lots, sales, new Date('2026-02-12T00:00:00Z'));
    expect(rows.P1.daysSinceLastSale).toBe(1);
    expect(rows.P1.status).toBe('ok');
  });
});
