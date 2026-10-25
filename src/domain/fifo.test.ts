import { describe, expect, it } from 'vitest';
import { allocateFifo, InsufficientStockError, type LotStock } from './fifo';

const lotA: LotStock = { lotId: 'L001', receivedOn: '2026-01-01', remaining: 10, unitCost: 100 };
const lotB: LotStock = { lotId: 'L002', receivedOn: '2026-02-01', remaining: 20, unitCost: 120 };

describe('allocateFifo', () => {
  it('takes from the oldest lot first and spills into the next', () => {
    expect(allocateFifo([lotA, lotB], 15)).toEqual([
      { lotId: 'L001', qty: 10, unitCost: 100 },
      { lotId: 'L002', qty: 5, unitCost: 120 },
    ]);
  });

  it('uses only the oldest lot when it covers the sale exactly', () => {
    expect(allocateFifo([lotA, lotB], 10)).toEqual([{ lotId: 'L001', qty: 10, unitCost: 100 }]);
  });

  it('sorts by received date, not by input order', () => {
    expect(allocateFifo([lotB, lotA], 12)).toEqual([
      { lotId: 'L001', qty: 10, unitCost: 100 },
      { lotId: 'L002', qty: 2, unitCost: 120 },
    ]);
  });

  it('breaks date ties by lot id', () => {
    const sameDay1 = { lotId: 'L010', receivedOn: '2026-03-01', remaining: 5, unitCost: 50 };
    const sameDay2 = { lotId: 'L009', receivedOn: '2026-03-01', remaining: 5, unitCost: 60 };
    expect(allocateFifo([sameDay1, sameDay2], 3)).toEqual([{ lotId: 'L009', qty: 3, unitCost: 60 }]);
  });

  it('skips lots that have nothing left', () => {
    const empty = { lotId: 'L000', receivedOn: '2025-12-01', remaining: 0, unitCost: 90 };
    expect(allocateFifo([empty, lotA], 4)).toEqual([{ lotId: 'L001', qty: 4, unitCost: 100 }]);
  });

  it('does not change the lots it is given', () => {
    const lots = [lotB, lotA];
    allocateFifo(lots, 5);
    expect(lots).toEqual([lotB, lotA]);
    expect(lotA.remaining).toBe(10);
  });

  it('rejects a sale larger than stock, reporting both numbers', () => {
    expect(() => allocateFifo([lotA, lotB], 31)).toThrow(InsufficientStockError);
    try {
      allocateFifo([lotA, lotB], 31);
    } catch (e) {
      expect(e).toMatchObject({ requested: 31, available: 30 });
    }
  });

  it('rejects zero and negative quantities', () => {
    expect(() => allocateFifo([lotA], 0)).toThrow(RangeError);
    expect(() => allocateFifo([lotA], -2)).toThrow(RangeError);
  });

  it('handles part quantities for items sold by weight or volume', () => {
    const kg1 = { lotId: 'K1', receivedOn: '2026-01-01', remaining: 1.5, unitCost: 80 };
    const kg2 = { lotId: 'K2', receivedOn: '2026-02-01', remaining: 2, unitCost: 90 };
    expect(allocateFifo([kg1, kg2], 2.25)).toEqual([
      { lotId: 'K1', qty: 1.5, unitCost: 80 },
      { lotId: 'K2', qty: 0.75, unitCost: 90 },
    ]);
  });

  it('does not drift with decimal arithmetic', () => {
    const lot = { lotId: 'L', receivedOn: '2026-01-01', remaining: 0.3, unitCost: 10 };
    expect(allocateFifo([lot], 0.1 + 0.2)).toEqual([{ lotId: 'L', qty: 0.3, unitCost: 10 }]);
  });

  it('rejects any sale when there is no stock at all', () => {
    expect(() => allocateFifo([], 1)).toThrow(InsufficientStockError);
  });
});
