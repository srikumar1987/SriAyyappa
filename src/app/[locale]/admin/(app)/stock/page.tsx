import { getProducts } from '@/lib/catalogue';
import { mrpOf, unitOf } from '@/data/products';
import { unitShort } from '@/data/units';
import { readStore } from '@/data/repo';
import { stockRows } from '@/domain/stockView';
import type { StockStatus } from '@/domain/stock';
import { t } from '@/admin/messages';
import { productName } from '@/lib/productName';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const ORDER: Record<StockStatus, number> = { out: 0, low: 1, slow: 2, ok: 3 };
const BADGE: Record<StockStatus, string> = {
  out: 'bg-deep-red text-white',
  low: 'bg-saffron text-white',
  slow: 'bg-gold text-dark-brown',
  ok: 'bg-green-100 text-green-800',
};

export default async function StockPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const products = await getProducts();
  const data = await readStore();
  const rows = stockRows(products.map((p) => p.id), data.lots, data.sales, new Date());

  // Buying price of the most recent lot for each product.
  const latestBuy: Record<string, number> = {};
  for (const lot of [...data.lots].sort((a, b) => a.receivedOn.localeCompare(b.receivedOn))) {
    latestBuy[lot.productId] = lot.buyPriceUnit;
  }

  const sorted = products
    .map((p) => ({ product: p, row: rows[p.id] }))
    .sort((a, b) => ORDER[a.row.status] - ORDER[b.row.status] || a.row.remaining - b.row.remaining);

  return (
    <section>
      <h1 className="text-3xl font-serif text-deep-red mb-6">{t(locale, 'stock')}</h1>
      <ul className="space-y-3">
        {sorted.map(({ product, row }) => (
          <li key={product.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-medium">{productName(product, locale)}</p>
              <p className="text-base text-dark-brown">
                {t(locale, 'remaining')}:{' '}
                <strong>
                  {Math.round(row.remaining * 1000) / 1000} {unitShort[unitOf(product)]}
                </strong>
                {' · '}
                {t(locale, 'mrpLabel')} ₹{mrpOf(product)}
                {latestBuy[product.id] !== undefined && (
                  <>
                    {' · '}
                    {t(locale, 'buyPriceLabel')} ₹{latestBuy[product.id]}
                  </>
                )}
                {' · '}
                {t(locale, 'lastSale')}:{' '}
                {row.lastSoldAt
                  ? t(locale, 'daysAgo', { days: row.daysSinceLastSale })
                  : t(locale, 'neverSold')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${BADGE[row.status]}`}>
              {t(locale, `status_${row.status}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
