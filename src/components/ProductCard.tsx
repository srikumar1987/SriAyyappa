'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/data/products';
import type { Locale } from '@/i18n';
import { addToBasket } from '@/lib/basket';
import { productName } from '@/lib/productName';
import { Link } from '@/navigation';

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('common');
  const shop = useTranslations('shop');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  const name = productName(product, locale);

  const handleWhatsApp = () => {
    const message = t('whatsappMessage', { product: name, price: product.price });
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAdd = () => {
    addToBasket(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="block">
        <div className="product-image relative rounded-lg overflow-hidden mb-4 bg-cream">
          <img src={product.image} alt={name} className="w-full h-48 object-cover" />
        </div>
        <h3 className="font-serif text-lg text-dark-brown mb-2">{name}</h3>
      </Link>

      <div className="mb-4">
        <span className="text-2xl font-bold text-deep-red">₹{product.price}</span>
      </div>

      <div className="flex gap-2">
        <button onClick={handleAdd} className="sacred-button flex-1 text-sm">
          {added ? shop('addedToQuote') : t('addToQuote')}
        </button>
        <button
          onClick={handleWhatsApp}
          className="sacred-button px-4 text-sm"
          title={t('orderOnWhatsapp')}
          aria-label={t('orderOnWhatsapp')}
        >
          📱
        </button>
      </div>
    </div>
  );
}
