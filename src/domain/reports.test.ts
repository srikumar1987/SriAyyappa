import { describe, expect, it } from 'vitest';
import { bestSellers, overheadAllocation, rethinkList, reorderList, salesTotals, type SaleFact } from './reports';
import type { LotLike } from './stockView';

const NOW = new Date('2026-06-01T00:00:00Z');

const sales: SaleFact[] = [
  { productId: 'P1', lotId: 'L1', qty: 10, soldAt: '2026-05-20T10:00:00Z', unitPrice: 200, unitCost: 150 },
  { productId: 'P2', lotId: 'L2', qty: 3, soldAt: '2026-05-25T10:00:00Z', unitPrice: 100, unitCost: 40 },
  { productId: 'P1', lotId: 'L1', qty: 2, soldAt: '2026-01-05T10:00:00Z', unitPrice: 200, unitCost: 150 },
];

describe('salesTotals', () => {
  it('adds up quantity, revenue and profit for sales since the date', () => {
    const totals = salesTotals(sales, new Date('2026-05-01T00:00:00Z'));
    expect(totals.find((t) => t.productId === 'P1')).toEqual({ productId: 'P1', qty: 10, revenue: 2000, profit: 500 });
    expect(totals.find((t) => t.productId === 'P2')).toEqual({ productId: 'P2', qty: 3, revenue: 300, profit: 180 });
  });
});

describe('bestSellers', () => {
  it('ranks by profit when asked', () => {
    const top = bestSellers(sales, new Date('2026-05-01T00:00:00Z'), 'profit');
    expect(top.map((t) => t.productId)).toEqual(['P1', 'P2']);
  });

  it('ranks by quantity when asked', () => {
    const top = bestSellers(sales, new Date('2026-05-01T00:00:00Z'), 'qty', 1);
    expect(top.map((t) => t.productId)).toEqual(['P1']);
  });
});

describe('rethinkList', () => {
  const lots: LotLike[] = [
    // P1: received 100 on 1 Feb (120 days before NOW), 12 sold -> 12% sell-through, stock left -> old stock
    { lotId: 'L1', productId: 'P1', receivedOn: '2026-02-01', qtyReceived: 100, buyPriceUnit: 10, lotExpensesTotal: 0 },
    // P2: received 50 on 1 Apr (61 days), 40 sold -> 80% sell-through, healthy
    { lotId: 'L2', productId: 'P2', receivedOn: '2026-04-01', qtyReceived: 50, buyPriceUnit: 10, lotExpensesTotal: 0 },
    // P3: received 50 on 20 Mar (72 days), 5 sold -> 10% sell-through, 60-89 days -> slow sell-through
    { lotId: 'L3', productId: 'P3', receivedOn: '2026-03-20', qtyReceived: 50, buyPriceUnit: 10, lotExpensesTotal: 0 },
  ];
  const stockSales: SaleFact[] = [
    { productId: 'P1', lotId: 'L1', qty: 12, soldAt: '2026-05-01T00:00:00Z', unitPrice: 20, unitCost: 10 },
    { productId: 'P2', lotId: 'L2', qty: 40, soldAt: '2026-05-01T00:00:00Z', unitPrice: 20, unitCost: 10 },
    { productId: 'P3', lotId: 'L3', qty: 5, soldAt: '2026-05-01T00:00:00Z', unitPrice: 20, unitCost: 10 },
  ];

  it('flags old stock and slow sellers, not healthy items', () => {
    const items = rethinkList(['P1', 'P2', 'P3'], lots, stockSales, NOW);
    expect(items).toEqual([
      { productId: 'P1', reason: 'old-stock', remaining: 88, received: 100, sellThroughPct: 12 },
      { productId: 'P3', reason: 'slow-sell-through', remaining: 45, received: 50, sellThroughPct: 10 },
    ]);
  });
});

describe('reorderList', () => {
  it('suggests an order for items that will run out before the lead time ends', () => {
    // 150 received, 120 sold in the last 60 days -> 30 left
    const lots: LotLike[] = [
      { lotId: 'L1', productId: 'P1', receivedOn: '2026-04-01', qtyReceived: 150, buyPriceUnit: 10, lotExpensesTotal: 0 },
    ];
    // 120 sold in 60 days = 2 a day; 30 left = 15 days cover; lead 7 -> order soon; suggested ceil(2*37 - 30) = 44
    const recent: SaleFact[] = [
      { productId: 'P1', lotId: 'L1', qty: 120, soldAt: '2026-05-15T00:00:00Z', unitPrice: 20, unitCost: 10 },
    ];
    const items = reorderList(['P1'], lots, recent, NOW, 7);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productId: 'P1', remaining: 30, status: 'order-soon', suggestedQty: 44 });
  });

  it('leaves out items with no recent sales', () => {
    const lots: LotLike[] = [
      { lotId: 'L1', productId: 'P1', receivedOn: '2026-01-01', qtyReceived: 30, buyPriceUnit: 10, lotExpensesTotal: 0 },
    ];
    expect(reorderList(['P1'], lots, [], NOW, 7)).toEqual([]);
  });
});

describe('overheadAllocation', () => {
  it('splits monthly overhead in proportion to that month revenue', () => {
    const monthSales: SaleFact[] = [
      { productId: 'P1', lotId: 'L1', qty: 10, soldAt: '2026-05-10T00:00:00Z', unitPrice: 100, unitCost: 50 }, // 1000
      { productId: 'P2', lotId: 'L2', qty: 30, soldAt: '2026-05-11T00:00:00Z', unitPrice: 100, unitCost: 50 }, // 3000
    ];
    expect(overheadAllocation(4000, monthSales, '2026-05')).toEqual([
      { productId: 'P1', amount: 1000 },
      { productId: 'P2', amount: 3000 },
    ]);
  });

  it('allocates nothing when the month had no sales', () => {
    expect(overheadAllocation(4000, sales, '2026-07')).toEqual([]);
  });
});
