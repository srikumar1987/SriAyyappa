import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';

export default async function ContactPage() {
  const t = await getTranslations('common');
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-deep-red mb-6">{t('contactTitle')}</h2>
          <p className="text-lg text-dark-brown leading-relaxed mb-8">{t('contactText')}</p>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sacred-button inline-block px-8 py-3"
            >
              📱 {t('whatsapp')}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
