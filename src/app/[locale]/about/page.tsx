import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';

export default async function AboutPage() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-deep-red mb-6">{t('aboutTitle')}</h2>
          <p className="text-lg text-dark-brown leading-relaxed">{t('aboutText')}</p>
        </div>
      </section>
    </div>
  );
}
