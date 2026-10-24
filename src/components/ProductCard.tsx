'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/data/products';
import type { Locale } from '@/i18n';

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;

  const productName = product.name[locale] || product.name.en;

  const handleWhatsApp = () => {
    const message = t('whatsappMessage', { product: productName, price: product.price });
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="product-card">
      <div className="product-image relative rounded-lg overflow-hidden mb-4 bg-cream">
        <img src={product.image} alt={productName} className="w-full h-48 object-cover" />
      </div>

      <h3 className="font-serif text-lg text-dark-brown mb-2">{productName}</h3>

      <div className="mb-4">
        <span className="text-2xl font-bold text-deep-red">₹{product.price}</span>
      </div>

      <div className="flex gap-2">
        <button className="sacred-button flex-1 text-sm">{t('addToQuote')}</button>
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
