'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: Locale) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-button"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <span className="flag">{localeFlags[locale]}</span>
        <span className="name">{localeNames[locale]}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="language-dropdown">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                className={`language-option ${lang === locale ? 'active' : ''}`}
              >
                <span className="flag">{localeFlags[lang]}</span>
                <span className="name">{localeNames[lang]}</span>
                {lang === locale && <span className="check">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
