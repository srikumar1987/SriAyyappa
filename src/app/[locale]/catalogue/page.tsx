import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { products } from '@/data/products';

export default async function CataloguePage() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-deep-red mb-3">{t('catalogueTitle')}</h2>
          <p className="text-center text-dark-brown mb-10">{t('catalogueText')}</p>
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
