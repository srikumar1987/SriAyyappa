'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const navLinkClass = 'text-white hover:text-gold transition-colors whitespace-nowrap';

export default function Header() {
  const t = useTranslations('common');
  const shop = useTranslations('shop');

  return (
    <header className="sacred-header">
      <div className="header-content relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="om-symbol text-3xl md:text-4xl text-gold">ॐ</span>
            <div className="min-w-0">
              <h1 className="store-name text-2xl md:text-3xl font-serif text-gold drop-shadow-lg leading-tight">
                {t('storeName')}
              </h1>
              <p className="text-white/90 text-xs md:text-sm mt-1">{t('tagline')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm md:text-base">
          <Link href="/" className={navLinkClass}>{t('home')}</Link>
          <Link href="/catalogue" className={navLinkClass}>{t('catalogue')}</Link>
          <Link href="/kerala" className={navLinkClass}>{t('kerala')}</Link>
          <Link href="/about" className={navLinkClass}>{t('about')}</Link>
          <Link href="/contact" className={navLinkClass}>{t('contact')}</Link>
          <Link href="/quote" className={navLinkClass}>{shop('quoteBasket')}</Link>
        </nav>
      </div>
    </header>
  );
}
