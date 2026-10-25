'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import { categoryKeys, mrpOf, type Category, type Product } from '@/data/products';
import { searchProducts } from '@/domain/search';
import { toSearchable } from '@/lib/searchIndex';
import { productName } from '@/lib/productName';
import { useSpeech } from '@/lib/useSpeech';

const ICON: Record<Category, string> = {
  pooja: '🪔',
  idols: '🛕',
  incense: '🌿',
  'kerala-snacks': '🍌',
  'kerala-sweets': '🍮',
  'kerala-products': '🥥',
};

type Sort = 'relevance' | 'mrpLow' | 'mrpHigh' | 'name';

interface Props {
  products: Product[];
  categories?: Category[];
}

export default function CatalogueExplorer({ products, categories }: Props) {
  const t = useTranslations('catalogue');
  const common = useTranslations('common');
  const shop = useTranslations('shop');
  const locale = useLocale();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<Sort>('relevance');
  const { supported, listening, start } = useSpeech(locale, setQuery);

  const index = useMemo(() => toSearchable(products), [products]);
  const cats = useMemo(
    () => categories ?? (Array.from(new Set(products.map((p) => p.category))) as Category[]),
    [products, categories]
  );

  // Exact, prefix and approximate (one-letter typo) matches in all six languages and common spellings.
  const results = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p] as [string, Product]));
    let list: Product[] = query.trim()
      ? searchProducts(query, index)
          .map((r) => byId.get(r.id))
          .filter((p): p is Product => Boolean(p))
      : products;
    if (active !== 'all') list = list.filter((p) => p.category === active);
    const sorted = [...list];
    if (sort === 'mrpLow') sorted.sort((a, b) => mrpOf(a) - mrpOf(b));
    if (sort === 'mrpHigh') sorted.sort((a, b) => mrpOf(b) - mrpOf(a));
    if (sort === 'name') sorted.sort((a, b) => productName(a, locale).localeCompare(productName(b, locale), locale));
    return sorted;
  }, [query, index, products, active, sort, locale]);

  const chip = (isActive: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-deep-red text-white shadow-md'
        : 'bg-white text-dark-brown ring-1 ring-saffron/30 hover:ring-saffron hover:bg-cream'
    }`;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-4 border-b border-saffron/20 bg-cream/90 px-4 py-3 backdrop-blur">
        <div className="relative mx-auto max-w-3xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden="true">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchHint')}
            aria-label={shop('searchTitle')}
            maxLength={100}
            className="w-full rounded-full border-2 border-saffron/40 bg-white py-4 pl-12 pr-32 text-lg shadow-sm outline-none transition focus:border-deep-red focus:ring-4 focus:ring-saffron/20"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {query && (
              <button onClick={() => setQuery('')} className="rounded-full px-3 py-2 text-sm text-dark-brown/70 hover:bg-cream">
                {t('clear')}
              </button>
            )}
            {supported && (
              <button
                onClick={start}
                aria-label={shop('voiceSearch')}
                title={shop('voiceSearch')}
                className={`grid h-11 w-11 place-items-center rounded-full text-white shadow transition ${
                  listening ? 'animate-pulse bg-deep-red' : 'bg-saffron hover:bg-deep-red'
                }`}
              >
                🎤
              </button>
            )}
          </div>
        </div>

        {cats.length > 1 && (
          <div className="mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto pb-1">
            <button onClick={() => setActive('all')} className={chip(active === 'all')}>
              ✨ {t('all')}
            </button>
            {cats.map((c) => (
              <button key={c} onClick={() => setActive(c)} className={chip(active === c)}>
                {ICON[c]} {common(categoryKeys[c])}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="text-dark-brown/70">{t('results', { count: results.length })}</p>
        <label className="flex items-center gap-2 text-sm text-dark-brown">
          {t('sortBy')}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-saffron/40 bg-white px-3 py-2"
          >
            <option value="relevance">{t('sortRelevance')}</option>
            <option value="mrpLow">{t('sortMrpLow')}</option>
            <option value="mrpHigh">{t('sortMrpHigh')}</option>
            <option value="name">{t('sortName')}</option>
          </select>
        </label>
      </div>

      {listening && <p className="text-center text-deep-red">{shop('listening')}</p>}

      {results.length === 0 ? (
        <div className="space-y-4 py-16 text-center">
          <div className="text-6xl" aria-hidden="true">🪔</div>
          <p className="text-lg text-dark-brown">{t('noMatch', { q: query })}</p>
          <button
            onClick={() => {
              setQuery('');
              setActive('all');
            }}
            className="rounded-full bg-deep-red px-6 py-3 text-white shadow"
          >
            {t('clear')}
          </button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {results.map((p, i) => (
            <div key={p.id} className="scroll-reveal" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
