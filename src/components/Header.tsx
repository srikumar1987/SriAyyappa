'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('common');

  return (
    <header className="sacred-header">
      <div className="header-content relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="om-symbol text-4xl text-gold">ൠ</span>
          <div>
            <h1 className="store-name text-3xl font-serif text-gold drop-shadow-lg">
              {t('storeName')}
            </h1>
            <p className="text-white/90 text-sm mt-1">
              {t('tagline')}
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-white hover:text-gold transition-colors">
            {t('home')}
          </a>
          <a href="/catalogue" className="text-white hover:text-gold transition-colors">
            {t('catalogue')}
          </a>
          <a href="/kerala" className="text-white hover:text-gold transition-colors">
            {t('keralaProducts')}
          </a>
          <a href="/about" className="text-white hover:text-gold transition-colors">
            {t('about')}
          </a>
          <a href="/contact" className="text-white hover:text-gold transition-colors">
            {t('contact')}
          </a>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
