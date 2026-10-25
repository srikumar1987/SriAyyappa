import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Link } from '@/navigation';
import { getProducts } from '@/lib/catalogue';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const t = await getTranslations('common');
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative py-20 px-4 text-center animate-sacred-light">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🙏</div>
          <h2 className="text-4xl md:text-5xl font-serif text-deep-red mb-4">{t('welcome')}</h2>
          <p className="text-xl text-dark-brown mb-8">{t('tagline')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogue" className="sacred-button text-lg px-8 py-4 text-center">
              {t('browseCatalogue')}
            </Link>
            <Link href="/kerala" className="sacred-button text-lg px-8 py-4 text-center bg-white text-deep-red">
              {t('viewKerala')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-serif text-center text-deep-red mb-12">{t('featuredProducts')}</h3>
          <ProductGrid products={products.slice(0, 8)} filterCategories={[]} />
          <div className="text-center mt-12">
            <Link href="/catalogue" className="sacred-button px-8 py-3 inline-block">
              {t('browseCatalogue')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-serif text-center text-deep-red mb-12">{t('whyChooseUs')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🪔', title: 'feature1Title', text: 'feature1Text' },
              { icon: '🙏', title: 'feature2Title', text: 'feature2Text' },
              { icon: '�', title: 'feature3Title', text: 'feature3Text' },
            ].map((f) => (
              <div key={f.title} className="text-center scroll-reveal">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h4 className="text-xl font-serif text-deep-red mb-2">{t(f.title)}</h4>
                <p className="text-dark-brown">{t(f.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-deep-red text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-4xl mb-4">🪷</div>
          <p className="text-gold font-serif text-xl mb-2">{t('storeName')}</p>
          <p className="text-white/80 text-sm">© 2026 {t('rightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
}
