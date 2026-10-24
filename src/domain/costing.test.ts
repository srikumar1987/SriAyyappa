import { describe, expect, it } from 'vitest';
import { grossProfit, landedCostUnit, round2 } from './costing';

describe('landedCostUnit', () => {
  it('spreads lot expenses across the units received', () => {
    // 50 lamps at Rs 150 = 7500, plus Rs 500 transport and loading = 8000, / 50 = 160
    expect(landedCostUnit(150, 50, 500)).toBe(160);
  });

  it('equals the buy price when there are no expenses', () => {
    expect(landedCostUnit(15, 100, 0)).toBe(15);
  });

  it('rounds to paise', () => {
    // (10 x 3 + 1) / 3 = 10.333... -> 10.33
    expect(landedCostUnit(10, 3, 1)).toBe(10.33);
  });

  it('rejects a lot with no units', () => {
    expect(() => landedCostUnit(10, 0, 0)).toThrow(RangeError);
  });
});

describe('grossProfit', () => {
  it('adds up margin across all sold slices', () => {
    // 10 x (200 - 160) = 400 ; 2 x (200 - 120) = 160 ; total 560
    expect(
      grossProfit([
        { qty: 10, unitPrice: 200, unitCost: 160 },
        { qty: 2, unitPrice: 200, unitCost: 120 },
      ])
    ).toBe(560);
  });

  it('is zero for no sales', () => {
    expect(grossProfit([])).toBe(0);
  });

  it('can be negative when selling below cost', () => {
    expect(grossProfit([{ qty: 3, unitPrice: 50, unitCost: 60 }])).toBe(-30);
  });
});

describe('round2', () => {
  it('avoids floating-point drift', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(1.005)).toBe(1.01);
  });
});
