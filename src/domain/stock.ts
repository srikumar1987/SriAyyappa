export type StockStatus = 'out' | 'low' | 'slow' | 'ok';

export interface StockInput {
  remaining: number;
  /** Days since the last sale, or since receipt if the item has never sold. */
  daysSinceLastSale: number;
  lowStockQty?: number; // default 5
  slowDays?: number; // default 30
}

export function stockStatus({ remaining, daysSinceLastSale, lowStockQty = 5, slowDays = 30 }: StockInput): StockStatus {
  if (remaining <= 0) return 'out';
  if (remaining <= lowStockQty) return 'low';
  if (daysSinceLastSale >= slowDays) return 'slow';
  return 'ok';
}

export type ReorderStatus = 'order-now' | 'order-soon' | 'ok';

export interface ReorderInput {
  soldLast60Days: number;
  remaining: number;
  leadDays: number;
}

export interface ReorderSuggestion {
  dailyRate: number;
  daysCover: number; // Infinity when nothing has sold
  suggestedQty: number;
  status: ReorderStatus;
}

const ANALYSIS_DAYS = 60;
const BUFFER_DAYS = 30;
const SOON_WINDOW_DAYS = 14;

/** Reorder rule from docs/ARCHITECTURE.md section 5.4. */
export function reorderSuggestion({ soldLast60Days, remaining, leadDays }: ReorderInput): ReorderSuggestion {
  const dailyRate = soldLast60Days / ANALYSIS_DAYS;
  if (dailyRate === 0) {
    return { dailyRate: 0, daysCover: Infinity, suggestedQty: 0, status: 'ok' };
  }
  const daysCover = remaining / dailyRate;
  const suggestedQty = Math.max(0, Math.ceil(dailyRate * (leadDays + BUFFER_DAYS) - remaining));
  const status: ReorderStatus =
    daysCover < leadDays ? 'order-now' : daysCover < leadDays + SOON_WINDOW_DAYS ? 'order-soon' : 'ok';
  return { dailyRate, daysCover, suggestedQty, status };
}
