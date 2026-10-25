import { Link } from '@/navigation';
import LogoutButton from '@/components/admin/LogoutButton';
import { t } from '@/admin/messages';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default function AdminHomePage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);

  const tiles = [
    { href: '/admin/lots/new', label: t(locale, 'stockArrived'), enabled: true },
    { href: '/admin/sales/new', label: t(locale, 'sale'), enabled: true },
    { href: '/admin/stock', label: t(locale, 'stock'), enabled: true },
    { href: '/admin/reports', label: t(locale, 'reports'), enabled: true },
    { href: '/admin/quotes', label: t(locale, 'quotesTitle'), enabled: true },
    { href: '/admin/overhead', label: t(locale, 'overheadTitle'), enabled: true },
    { href: '/admin/products/new', label: t(locale, 'addProduct'), enabled: false },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-deep-red">{t(locale, 'home')}</h1>
        <LogoutButton locale={locale} label={t(locale, 'logout')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) =>
          tile.enabled ? (
            <Link
              key={tile.href}
              href={tile.href}
              className="block text-center text-2xl py-8 rounded-2xl bg-deep-red text-white shadow-md hover:bg-maroon"
            >
              {tile.label}
            </Link>
          ) : (
            <div
              key={tile.href}
              className="text-center text-xl py-8 rounded-2xl bg-white/60 text-dark-brown border-2 border-dashed border-saffron"
            >
              {tile.label} <span className="text-sm">({t(locale, 'comingSoon')})</span>
            </div>
          )
        )}
      </div>
    </section>
  );
}
