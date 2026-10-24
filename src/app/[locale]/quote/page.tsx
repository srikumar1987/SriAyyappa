import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import QuoteBasket from '@/components/QuoteBasket';
import { products } from '@/data/products';

export const dynamic = 'force-dynamic';

export default async function QuotePage() {
  const t = await getTranslations('shop');

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h2 className="text-3xl font-serif text-deep-red">{t('quoteBasket')}</h2>
        <QuoteBasket products={products} />
      </section>
    </div>
  );
}
