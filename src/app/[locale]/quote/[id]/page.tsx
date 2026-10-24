import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PrintButton from '@/components/PrintButton';
import { readStore } from '@/data/repo';
import { findProduct } from '@/lib/catalogue';
import { productName } from '@/lib/productName';
import { safeLocale } from '@/lib/paths';
import { localeNames, type Locale } from '@/i18n';

export const dynamic = 'force-dynamic';

export default async function PrintableQuotePage({ params }: { params: { locale: string; id: string } }) {
  const locale = safeLocale(params.locale);
  const data = await readStore();
  const quote = data.quotes.find((q) => q.quoteId === params.id);
  if (!quote) notFound();

  const t = await getTranslations('shop');
  const common = await getTranslations('common');
  const lang = safeLocale(quote.language);
  const date = new Date(quote.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  return (
    <div className="min-h-screen p-6 md:p-10 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center border-b-2 border-saffron pb-4">
          <p className="font-serif text-2xl text-deep-red">{localeNames[locale]}</p>
          <p className="text-lg">
            {t('quoteNumber')}: <strong>{quote.quoteId}</strong> · {date}
          </p>
          <p>
            {quote.customerName} · {quote.customerPhone}
          </p>
        </header>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-saffron">
              <th className="py-2">#</th>
              <th className="py-2" />
              <th className="py-2 text-right">{t('qty')}</th>
              <th className="py-2 text-right">{common('price')}</th>
              <th className="py-2 text-right">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, i) => {
              const product = findProduct(item.productId);
              return (
                <tr key={item.productId} className="border-b">
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">{product ? productName(product, lang) : item.productId}</td>
                  <td className="py-2 text-right">{item.qty}</td>
                  <td className="py-2 text-right">{item.unitPrice}</td>
                  <td className="py-2 text-right">{item.qty * item.unitPrice}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="py-3 text-right font-bold">
                {t('total')}
              </td>
              <td className="py-3 text-right font-bold text-deep-red">₹{quote.total}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-center">
          <PrintButton label={t('printQuote')} />
        </div>
      </div>
    </div>
  );
}
