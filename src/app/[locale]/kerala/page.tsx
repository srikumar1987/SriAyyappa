import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import CatalogueExplorer from '@/components/CatalogueExplorer';
import { keralaCategories } from '@/data/products';
import { getProducts } from '@/lib/catalogue';

export const revalidate = 60; // Revalidate product data every 60 seconds

export default async function KeralaPage() {
  const t = await getTranslations('common');
  const products = await getProducts();
  const keralaProducts = products.filter((p) => keralaCategories.includes(p.category));

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-saffron px-4 py-14 text-center text-white">
        <p className="text-5xl" aria-hidden="true">🥥</p>
        <h2 className="mt-3 font-serif text-4xl text-gold drop-shadow md:text-5xl">{t('keralaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">{t('keralaText')}</p>
      </section>
      <section className="px-4 pb-16">
        <CatalogueExplorer products={keralaProducts} categories={keralaCategories} />
      </section>
    </div>
  );
}
