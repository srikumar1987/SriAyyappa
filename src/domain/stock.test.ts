import { describe, expect, it } from 'vitest';
import { reorderSuggestion, stockStatus } from './stock';

describe('stockStatus', () => {
  it('is out when nothing is left', () => {
    expect(stockStatus({ remaining: 0, daysSinceLastSale: 0 })).toBe('out');
  });

  it('is low at or below the low-stock quantity', () => {
    expect(stockStatus({ remaining: 5, daysSinceLastSale: 0 })).toBe('low');
    expect(stockStatus({ remaining: 6, daysSinceLastSale: 0 })).toBe('ok');
  });

  it('is slow after 30 days without a sale, not before', () => {
    expect(stockStatus({ remaining: 6, daysSinceLastSale: 29 })).toBe('ok');
    expect(stockStatus({ remaining: 6, daysSinceLastSale: 30 })).toBe('slow');
  });

  it('out takes priority over slow', () => {
    expect(stockStatus({ remaining: 0, daysSinceLastSale: 200 })).toBe('out');
  });

  it('honours custom thresholds', () => {
    expect(stockStatus({ remaining: 8, daysSinceLastSale: 0, lowStockQty: 10 })).toBe('low');
    expect(stockStatus({ remaining: 8, daysSinceLastSale: 10, slowDays: 10 })).toBe('slow');
  });
});

describe('reorderSuggestion', () => {
  it('suggests nothing for an item that never sells', () => {
    expect(reorderSuggestion({ soldLast60Days: 0, remaining: 40, leadDays: 7 })).toEqual({
      dailyRate: 0,
      daysCover: Infinity,
      suggestedQty: 0,
      status: 'ok',
    });
  });

  it('says order soon when cover is inside lead time plus two weeks', () => {
    // 120 sold in 60 days = 2/day. 30 left = 15 days cover. Lead 7.
    // Suggested = ceil(2 * (7 + 30) - 30) = ceil(44) = 44.
    expect(reorderSuggestion({ soldLast60Days: 120, remaining: 30, leadDays: 7 })).toEqual({
      dailyRate: 2,
      daysCover: 15,
      suggestedQty: 44,
      status: 'order-soon',
    });
  });

  it('says order now when cover is shorter than the lead time', () => {
    // 2/day, 10 left = 5 days cover, lead 7 -> order now. Suggested = ceil(74 - 10) = 64.
    const result = reorderSuggestion({ soldLast60Days: 120, remaining: 10, leadDays: 7 });
    expect(result.status).toBe('order-now');
    expect(result.suggestedQty).toBe(64);
  });

  it('never suggests a negative quantity when stock is plentiful', () => {
    const result = reorderSuggestion({ soldLast60Days: 120, remaining: 200, leadDays: 7 });
    expect(result.status).toBe('ok');
    expect(result.suggestedQty).toBe(0);
  });
});
