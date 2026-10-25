import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import CatalogueExplorer from '@/components/CatalogueExplorer';
import { getProducts } from '@/lib/catalogue';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  const t = await getTranslations('catalogue');
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-maroon via-deep-red to-saffron px-4 py-14 text-center text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_30%,#FFD700_0,transparent_35%),radial-gradient(circle_at_80%_70%,#FFF8E7_0,transparent_30%)]"
        />
        <p className="relative text-5xl" aria-hidden="true">🪔</p>
        <h2 className="relative mt-3 font-serif text-4xl text-gold drop-shadow md:text-5xl">{t('heroTitle')}</h2>
        <p className="relative mx-auto mt-3 max-w-2xl text-lg text-white/90">{t('heroText')}</p>
      </section>
      <section className="px-4 pb-16">
        <CatalogueExplorer products={products} />
      </section>
    </div>
  );
}
