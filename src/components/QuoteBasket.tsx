'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/data/products';
import type { Locale } from '@/i18n';
import { clearBasket, readBasket, removeFromBasket, setBasketQty, type BasketItem } from '@/lib/basket';
import { localePath } from '@/lib/paths';
import { productName } from '@/lib/productName';

export default function QuoteBasket({ products }: { products: Product[] }) {
  const t = useTranslations('shop');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;

  const [items, setItems] = useState<BasketItem[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setItems(readBasket());
    load();
    setReady(true);
    window.addEventListener('basket-changed', load);
    return () => window.removeEventListener('basket-changed', load);
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p] as [string, Product])), [products]);
  const lines = items
    .map((i) => ({ product: byId.get(i.productId), qty: i.qty }))
    .filter((l): l is { product: Product; qty: number } => Boolean(l.product));
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: form.get('customerName'),
          customerPhone: form.get('customerPhone'),
          language: locale,
          items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        }),
      });
      const data = (await res.json()) as { ok: boolean; quoteId?: string };
      if (data.ok && data.quoteId) {
        clearBasket();
        setQuoteId(data.quoteId);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  if (!ready) return null;

  if (quoteId) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
        <p className="text-xl text-green-700">{t('quoteCreated', { id: quoteId })}</p>
        <a href={localePath(locale, `/quote/${quoteId}`)} className="sacred-button inline-block px-6 py-3">
          {t('printQuote')}
        </a>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-lg text-dark-brown">{t('quoteEmpty')}</p>
        <a href={localePath(locale, '/catalogue')} className="sacred-button inline-block px-6 py-3">
          {t('backToCatalogue')}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="space-y-3">
        {lines.map(({ product, qty }) => (
          <li key={product.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-lg font-medium">{productName(product, locale)}</p>
              <p className="text-dark-brown">₹{product.price}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <span className="text-sm">{t('qty')}</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={qty}
                  onChange={(e) => {
                    if (e.target.value) setBasketQty(product.id, Number(e.target.value));
                  }}
                  className="w-24 text-lg border-2 border-saffron rounded-lg p-2"
                />
              </label>
              <button
                onClick={() => removeFromBasket(product.id)}
                className="text-deep-red underline"
              >
                {t('remove')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-2xl font-bold text-deep-red">
        {t('total')}: ₹{total}
      </p>

      <form onSubmit={submit} className="space-y-4 max-w-md">
        <input
          name="customerName"
          required
          maxLength={80}
          placeholder={t('customerName')}
          aria-label={t('customerName')}
          className="w-full text-lg border-2 border-saffron rounded-xl p-3 bg-white"
        />
        <input
          name="customerPhone"
          type="tel"
          required
          pattern="[0-9+ ]{8,15}"
          placeholder={t('customerPhone')}
          aria-label={t('customerPhone')}
          className="w-full text-lg border-2 border-saffron rounded-xl p-3 bg-white"
        />
        {error && <p role="alert" className="text-deep-red">{common('tryAgain')}</p>}
        <button type="submit" disabled={pending} className="sacred-button w-full py-4 text-lg disabled:opacity-60">
          {t('submitQuote')}
        </button>
      </form>
    </div>
  );
}
