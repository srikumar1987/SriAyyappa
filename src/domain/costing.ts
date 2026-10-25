/** Rounds money to 2 decimal places, avoiding floating-point drift (e.g. 0.1 + 0.2). */
export function round2(value: number): number {
  return Math.round(Number((value * 100).toPrecision(15))) / 100;
}

/** Cost per unit including the lot's transport, packaging and other expenses. */
export function landedCostUnit(buyPriceUnit: number, qtyReceived: number, lotExpensesTotal: number): number {
  if (!Number.isFinite(qtyReceived) || qtyReceived <= 0) {
    throw new RangeError('Quantity received must be a positive number');
  }
  return round2((buyPriceUnit * qtyReceived + lotExpensesTotal) / qtyReceived);
}

export interface SoldSlice {
  qty: number;
  unitPrice: number;
  unitCost: number;
}

/** Profit on sold slices before overhead. */
export function grossProfit(slices: SoldSlice[]): number {
  return round2(slices.reduce((sum, s) => sum + s.qty * (s.unitPrice - s.unitCost), 0));
}
