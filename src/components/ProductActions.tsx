'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/data/products';
import type { Locale } from '@/i18n';
import { addToBasket } from '@/lib/basket';
import { productName } from '@/lib/productName';

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function ProductActions({ product }: { product: Product }) {
  const t = useTranslations('common');
  const shop = useTranslations('shop');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  const name = productName(product, locale);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => {
          addToBasket(product.id);
          setAdded(true);
        }}
        className="sacred-button px-6 py-3"
      >
        {added ? shop('addedToQuote') : t('addToQuote')}
      </button>
      <button
        onClick={() => {
          const message = t('whatsappMessage', { product: name, price: product.price });
          window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        }}
        className="sacred-button px-6 py-3"
      >
        📱 {t('orderOnWhatsapp')}
      </button>
    </div>
  );
}
