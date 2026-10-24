import { landedCostUnit } from './costing';
import type { LotStock } from './fifo';
import { stockStatus, type StockStatus } from './stock';

export interface LotLike {
  lotId: string;
  productId: string;
  receivedOn: string; // YYYY-MM-DD
  qtyReceived: number;
  buyPriceUnit: number;
  lotExpensesTotal: number;
}

export interface SaleLike {
  productId: string;
  lotId: string;
  qty: number;
  soldAt: string; // ISO timestamp
}

export interface ProductStockRow {
  productId: string;
  remaining: number;
  lastSoldAt: string | null;
  daysSinceLastSale: number; // since last sale, or since receipt if never sold
  status: StockStatus;
}

const DAY_MS = 86_400_000;

/** Remaining quantity and landed cost for each lot of one product. Derived, never stored. */
export function lotStocks(lots: LotLike[], sales: SaleLike[], productId: string): LotStock[] {
  return lots
    .filter((lot) => lot.productId === productId)
    .map((lot) => {
      const sold = sales.filter((s) => s.lotId === lot.lotId).reduce((n, s) => n + s.qty, 0);
      return {
        lotId: lot.lotId,
        receivedOn: lot.receivedOn,
        remaining: lot.qtyReceived - sold,
        unitCost: landedCostUnit(lot.buyPriceUnit, lot.qtyReceived, lot.lotExpensesTotal),
      };
    });
}

export function stockRows(
  productIds: string[],
  lots: LotLike[],
  sales: SaleLike[],
  now: Date
): Record<string, ProductStockRow> {
  const rows: Record<string, ProductStockRow> = {};
  for (const productId of productIds) {
    const remaining = lotStocks(lots, sales, productId).reduce((n, l) => n + l.remaining, 0);

    const soldAts = sales.filter((s) => s.productId === productId).map((s) => s.soldAt);
    const lastSoldAt = soldAts.length ? soldAts.reduce((a, b) => (a > b ? a : b)) : null;

    const receivedDates = lots.filter((l) => l.productId === productId).map((l) => l.receivedOn);
    const lastReceived = receivedDates.length ? receivedDates.reduce((a, b) => (a > b ? a : b)) : null;
    const since = lastSoldAt ?? (lastReceived ? `${lastReceived}T00:00:00Z` : null);

    const daysSinceLastSale = since
      ? Math.max(0, Math.floor((now.getTime() - new Date(since).getTime()) / DAY_MS))
      : 0;

    rows[productId] = {
      productId,
      remaining,
      lastSoldAt,
      daysSinceLastSale,
      status: stockStatus({ remaining, daysSinceLastSale }),
    };
  }
  return rows;
}
