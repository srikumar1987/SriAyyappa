'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { locales, defaultLocale, localeNames, localeFlags, type Locale } from '@/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = (newLocale: string) => {
    localStorage.setItem('preferred-language', newLocale);

    const segments = pathname.split('/');
    if (newLocale === defaultLocale) {
      segments.splice(1, 1);
    } else {
      segments[1] = newLocale;
    }
    const newPath = segments.join('/').replace(/\/+/g, '/') || '/';

    router.push(newPath);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <div className="language-button">
        <span className="flag">{localeFlags[locale]}</span>
        <span className="name">{localeNames[locale]}</span>
        <span className="arrow">▼</span>
      </div>
    );
  }

  return (
    <div className="language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-button"
        aria-label="Switch language"
      >
        <span className="flag">{localeFlags[locale]}</span>
        <span className="name">{localeNames[locale]}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
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
