import { Link } from '@/navigation';
import { readStore } from '@/data/repo';
import { t } from '@/admin/messages';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default async function QuotesPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const data = await readStore();
  const quotes = [...data.quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-serif text-deep-red">{t(locale, 'quotesTitle')}</h1>

      {quotes.length === 0 && <p className="text-lg">{t(locale, 'noQuotes')}</p>}

      <ul className="space-y-3">
        {quotes.map((q) => (
          <li key={q.quoteId} className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-medium">
                {q.quoteId} · {t(locale, 'customerLabel')}: {q.customerName}
              </p>
              <p className="text-dark-brown">
                {q.customerPhone} · {t(locale, 'quoteTotal')}: ₹{q.total} ·{' '}
                {new Date(q.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gold text-dark-brown text-sm">
                {t(locale, `quoteStatus_${q.status}`)}
              </span>
              <Link href={`/quote/${q.quoteId}`} className="text-deep-red underline">
                {t(locale, 'viewQuote')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
