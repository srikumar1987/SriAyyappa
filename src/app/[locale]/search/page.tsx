import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SearchBox from '@/components/SearchBox';
import type { Product } from '@/data/products';
import { relatedProducts, searchProducts } from '@/domain/search';
import { findIn, getProducts, toSearchable } from '@/lib/catalogue';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const locale = safeLocale(params.locale);
  const t = await getTranslations('shop');
  const query = (searchParams.q ?? '').slice(0, 100);

  const all = await getProducts();
  const index = toSearchable(all);
  const matches = searchProducts(query, index)
    .map((r) => findIn(all, r.id))
    .filter((p): p is Product => Boolean(p));

  const first = matches[0];
  const related = first
    ? relatedProducts(index.find((i) => i.id === first.id)!, index, 8)
        .filter((r) => !matches.some((m) => m.id === r.id))
        .map((r) => findIn(all, r.id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <h2 className="text-3xl font-serif text-deep-red">{t('searchTitle')}</h2>
        <SearchBox locale={locale} initialQuery={query} />

        {query && matches.length === 0 && <p className="text-dark-brown text-lg">{t('noMatch')}</p>}

        {matches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-deep-red">{t('relatedItems')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
