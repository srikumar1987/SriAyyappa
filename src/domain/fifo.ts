export interface LotStock {
  lotId: string;
  receivedOn: string; // ISO date, YYYY-MM-DD
  remaining: number;
  unitCost: number; // landed cost per unit
}

export interface SaleSlice {
  lotId: string;
  qty: number;
  unitCost: number;
}

export class InsufficientStockError extends Error {
  constructor(
    public readonly requested: number,
    public readonly available: number
  ) {
    super(`Insufficient stock: requested ${requested}, available ${available}`);
    this.name = 'InsufficientStockError';
  }
}

/** Splits a sale across lots, oldest first. Throws before anything is written if stock is short. */
export function allocateFifo(lots: LotStock[], qty: number): SaleSlice[] {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new RangeError('Quantity must be a positive whole number');
  }

  const available = lots.reduce((sum, lot) => sum + Math.max(0, lot.remaining), 0);
  if (available < qty) {
    throw new InsufficientStockError(qty, available);
  }

  const oldestFirst = lots
    .filter((lot) => lot.remaining > 0)
    .sort((a, b) => a.receivedOn.localeCompare(b.receivedOn) || a.lotId.localeCompare(b.lotId));

  const slices: SaleSlice[] = [];
  let left = qty;
  for (const lot of oldestFirst) {
    if (left === 0) break;
    const take = Math.min(left, lot.remaining);
    slices.push({ lotId: lot.lotId, qty: take, unitCost: lot.unitCost });
    left -= take;
  }
  return slices;
}
