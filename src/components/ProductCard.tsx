'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { categoryKeys, mrpOf, unitOf, type Product } from '@/data/products';
import { unitPer } from '@/data/units';
import type { Locale } from '@/i18n';
import { addToBasket } from '@/lib/basket';
import { productName } from '@/lib/productName';
import { Link } from '@/navigation';

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('common');
  const shop = useTranslations('shop');
  const c = useTranslations('catalogue');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  const name = productName(product, locale);
  const secondName = locale === 'en' ? product.name.ml : product.name.en;
  const mrp = mrpOf(product);
  const saving = Math.max(0, Math.round((mrp - product.price) * 100) / 100);
  const per = unitPer[unitOf(product)][locale];

  const handleAdd = () => {
    addToBasket(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = t('whatsappMessage', { product: name, price: product.price });
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-saffron/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-saffron/60">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#FFF3CD,#FFF8E7_60%,#FDE7C4)]">
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-2xl bg-deep-red px-3 py-1.5 text-white shadow-lg">
            <span className="block text-[10px] uppercase tracking-widest opacity-80">{c('mrp')}</span>
            <span className="block text-xl font-bold leading-none">{inr(mrp)}</span>
          </div>
          {saving > 0 && (
            <div className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-dark-brown shadow">
              {c('youSave', { amount: saving })}
            </div>
          )}
        </div>
        <div className="px-4 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-saffron">
            {t(categoryKeys[product.category])}
          </span>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-dark-brown">{name}</h3>
          {secondName && secondName !== name && (
            <p className="line-clamp-1 text-sm text-dark-brown/60">{secondName}</p>
          )}
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4 pt-3">
        <p className="text-sm text-dark-brown/80">
          {saving > 0 && (
            <>
              {c('ourPrice')}: <strong className="text-base text-dark-brown">{inr(product.price)}</strong>{' '}
            </>
          )}
          <span className="text-dark-brown/60">{per}</span>
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 rounded-full bg-gradient-to-r from-saffron to-deep-red px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:shadow-md active:scale-95"
          >
            {added ? shop('addedToQuote') : t('addToQuote')}
          </button>
          <button
            onClick={handleWhatsApp}
            aria-label={t('orderOnWhatsapp')}
            title={t('orderOnWhatsapp')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow transition hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
