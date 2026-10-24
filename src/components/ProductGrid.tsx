'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import { categoryKeys, type Category, type Product } from '@/data/products';

interface ProductGridProps {
  products: Product[];
  filterCategories?: Category[];
}

export default function ProductGrid({ products, filterCategories }: ProductGridProps) {
  const t = useTranslations('common');
  const [active, setActive] = useState<Category | 'all'>('all');

  const categories = useMemo(
    () => filterCategories ?? (Array.from(new Set(products.map((p) => p.category))) as Category[]),
    [products, filterCategories]
  );

  const visible = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category === active)),
    [active, products]
  );

  const buttonClass = (isActive: boolean) =>
    `px-6 py-2 rounded-full border-2 border-saffron transition-all ${
      isActive ? 'bg-saffron text-white font-medium' : 'bg-white text-dark-brown hover:bg-saffron hover:text-white'
    }`;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <button onClick={() => setActive('all')} className={buttonClass(active === 'all')}>
            {t('all')}
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setActive(c)} className={buttonClass(active === c)}>
              {t(categoryKeys[c])}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-center text-dark-brown">{t('noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visible.map((product, index) => (
            <div key={product.id} className="scroll-reveal" style={{ animationDelay: `${index * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
