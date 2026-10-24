'use client';

import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: {
    en: string;
    hi: string;
    kn: string;
    ml: string;
    te: string;
    ta: string;
  };
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('common');

  const productName = product.name[locale as keyof typeof product.name] || product.name.en;

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${productName} (₹${product.price}). Is it available?`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="product-card scroll-reveal">
      <div className="product-image relative rounded-lg overflow-hidden mb-4 bg-cream">
        <img
          src={product.image}
          alt={productName}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <h3 className="font-serif text-lg text-dark-brown mb-2">
        {productName}
      </h3>

      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-deep-red">
          ₹{product.price}
        </span>
        <div className="flex text-gold">
          ⭐⭐⭐⭐⭐
        </div>
      </div>

      <div className="flex gap-2">
        <button className="sacred-button flex-1 text-sm">
          {t('addToQuote')}
        </button>
        <button
          onClick={handleWhatsApp}
          className="sacred-button px-4 text-sm"
          title={t('whatsapp')}
        >
          📱
        </button>
      </div>
    </div>
  );
}
