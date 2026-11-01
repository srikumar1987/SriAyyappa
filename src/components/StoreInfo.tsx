import { getTranslations } from 'next-intl/server';
import { business, directionsUrl, mapEmbedUrl } from '@/lib/business';

export default async function StoreInfo() {
  const t = await getTranslations('common');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-serif text-deep-red mb-2">📍 {t('addressLabel')}</h3>
          <address className="not-italic text-dark-brown leading-relaxed">
            <strong>{business.name}</strong>
            {business.addressLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </address>
        </div>
        <div>
          <h3 className="text-xl font-serif text-deep-red mb-2">📞 {t('phoneLabel')}</h3>
          <a href={`tel:${business.phoneTel}`} className="text-dark-brown hover:text-deep-red underline">
            {business.phoneDisplay}
          </a>
        </div>
        <div>
          <h3 className="text-xl font-serif text-deep-red mb-2">🕰️ {t('hoursLabel')}</h3>
          <p className="text-dark-brown">{t('hoursValue')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${business.phoneTel}`} className="sacred-button inline-block px-6 py-3">
            {t('callUs')}
          </a>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="sacred-button inline-block px-6 py-3">
            {t('getDirections')}
          </a>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden shadow-lg border-2 border-gold min-h-[320px]">
        <iframe
          title={t('mapTitle')}
          src={mapEmbedUrl}
          className="w-full h-full min-h-[320px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={business.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-deep-red bg-white py-2 hover:underline"
        >
          {t('openInMaps')}
        </a>
      </div>
    </div>
  );
}
