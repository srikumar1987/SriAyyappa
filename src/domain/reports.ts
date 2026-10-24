import { round2 } from './costing';
import { reorderSuggestion, type ReorderSuggestion } from './stock';
import type { LotLike, SaleLike } from './stockView';

export interface SaleFact extends SaleLike {
  unitPrice: number;
  unitCost: number;
}

const DAY_MS = 86_400_000;
const daysBetween = (from: Date, to: Date) => Math.floor((to.getTime() - from.getTime()) / DAY_MS);

export interface ProductSalesTotal {
  productId: string;
  qty: number;
  revenue: number;
  profit: number;
}

export function salesTotals(sales: SaleFact[], since: Date): ProductSalesTotal[] {
  const byProduct = new Map<string, ProductSalesTotal>();
  for (const s of sales) {
    if (new Date(s.soldAt) < since) continue;
    const t = byProduct.get(s.productId) ?? { productId: s.productId, qty: 0, revenue: 0, profit: 0 };
    t.qty += s.qty;
    t.revenue = round2(t.revenue + s.qty * s.unitPrice);
    t.profit = round2(t.profit + s.qty * (s.unitPrice - s.unitCost));
    byProduct.set(s.productId, t);
  }
  return [...byProduct.values()];
}

export function bestSellers(
  sales: SaleFact[],
  since: Date,
  by: 'qty' | 'profit',
  limit = 10
): ProductSalesTotal[] {
  return salesTotals(sales, since)
    .sort((a, b) => b[by] - a[by] || a.productId.localeCompare(b.productId))
    .slice(0, limit);
}

export interface RethinkItem {
  productId: string;
  reason: 'old-stock' | 'slow-sell-through';
  remaining: number;
  received: number;
  sellThroughPct: number;
}

/** Items to think about before ordering again. */
export function rethinkList(productIds: string[], lots: LotLike[], sales: SaleFact[], now: Date): RethinkItem[] {
  const items: RethinkItem[] = [];
  for (const productId of productIds) {
    const productLots = lots.filter((l) => l.productId === productId);
    if (productLots.length === 0) continue;

    const received = productLots.reduce((n, l) => n + l.qtyReceived, 0);
    const sold = sales.filter((s) => s.productId === productId).reduce((n, s) => n + s.qty, 0);
    const remaining = received - sold;
    const oldestAge = daysBetween(new Date(`${productLots.map((l) => l.receivedOn).sort()[0]}T00:00:00Z`), now);
    const sellThroughPct = received > 0 ? Math.round((sold / received) * 100) : 0;

    if (remaining > 0 && oldestAge >= 90) {
      items.push({ productId, reason: 'old-stock', remaining, received, sellThroughPct });
    } else if (oldestAge >= 60 && sellThroughPct < 30) {
      items.push({ productId, reason: 'slow-sell-through', remaining, received, sellThroughPct });
    }
  }
  return items;
}

export interface ReorderItem extends ReorderSuggestion {
  productId: string;
  remaining: number;
}

/** Products that need ordering, most urgent first. Items with no sales in 60 days are left out. */
export function reorderList(
  productIds: string[],
  lots: LotLike[],
  sales: SaleFact[],
  now: Date,
  leadDays: number
): ReorderItem[] {
  const since = new Date(now.getTime() - 60 * DAY_MS);
  const items: ReorderItem[] = [];
  for (const productId of productIds) {
    const remaining = lots
      .filter((l) => l.productId === productId)
      .reduce((n, l) => n + l.qtyReceived, 0) -
      sales.filter((s) => s.productId === productId).reduce((n, s) => n + s.qty, 0);
    const soldLast60Days = sales
      .filter((s) => s.productId === productId && new Date(s.soldAt) >= since)
      .reduce((n, s) => n + s.qty, 0);
    const suggestion = reorderSuggestion({ soldLast60Days, remaining, leadDays });
    if (suggestion.status !== 'ok' && suggestion.suggestedQty > 0) {
      items.push({ productId, remaining, ...suggestion });
    }
  }
  return items.sort((a, b) => a.daysCover - b.daysCover);
}

export interface OverheadShare {
  productId: string;
  amount: number;
}

/** Splits one month's overhead across products in proportion to that month's revenue. */
export function overheadAllocation(overheadTotal: number, sales: SaleFact[], month: string): OverheadShare[] {
  const monthSales = sales.filter((s) => s.soldAt.startsWith(month));
  const revenueByProduct = new Map<string, number>();
  for (const s of monthSales) {
    revenueByProduct.set(s.productId, (revenueByProduct.get(s.productId) ?? 0) + s.qty * s.unitPrice);
  }
  const totalRevenue = [...revenueByProduct.values()].reduce((a, b) => a + b, 0);
  if (totalRevenue <= 0 || overheadTotal <= 0) return [];
  return [...revenueByProduct.entries()].map(([productId, revenue]) => ({
    productId,
    amount: round2((overheadTotal * revenue) / totalRevenue),
  }));
}
