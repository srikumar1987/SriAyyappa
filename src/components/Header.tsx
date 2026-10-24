'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const navLinkClass = 'text-white hover:text-gold transition-colors';

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
            <p className="text-white/90 text-sm mt-1">{t('tagline')}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={navLinkClass}>{t('home')}</Link>
          <Link href="/catalogue" className={navLinkClass}>{t('catalogue')}</Link>
          <Link href="/kerala" className={navLinkClass}>{t('kerala')}</Link>
          <Link href="/about" className={navLinkClass}>{t('about')}</Link>
          <Link href="/contact" className={navLinkClass}>{t('contact')}</Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
