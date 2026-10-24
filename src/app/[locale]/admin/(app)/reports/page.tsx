import { products } from '@/data/products';
import { readStore } from '@/data/repo';
import { bestSellers, overheadAllocation, rethinkList, reorderList } from '@/domain/reports';
import { stockRows } from '@/domain/stockView';
import { t } from '@/admin/messages';
import { findProduct } from '@/lib/catalogue';
import { productName } from '@/lib/productName';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const LEAD_DAYS = 7;

function nameOf(productId: string, locale: string): string {
  const p = findProduct(productId);
  return p ? productName(p, locale) : productId;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="text-xl font-serif text-deep-red">{title}</h2>
      {children}
    </section>
  );
}

export default async function ReportsPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const data = await readStore();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86_400_000);
  const ids = products.map((p) => p.id);
  const month = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7);

  const byQty = bestSellers(data.sales, since30, 'qty', 5);
  const byProfit = bestSellers(data.sales, since30, 'profit', 5);
  const rethink = rethinkList(ids, data.lots, data.sales, now);
  const reorder = reorderList(ids, data.lots, data.sales, now, LEAD_DAYS);
  const slow = Object.values(stockRows(ids, data.lots, data.sales, now)).filter((r) => r.status === 'slow');

  const monthOverhead = data.overhead.filter((o) => o.month === month).reduce((n, o) => n + o.amount, 0);
  const share = overheadAllocation(monthOverhead, data.sales, month);

  const reasonText = (r: string) => t(locale, r === 'old-stock' ? 'rethinkOld' : 'rethinkSlow');
  const emptyText = t(locale, 'nothing');

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-serif text-deep-red">{t(locale, 'reportsTitle')}</h1>

      <Section title={t(locale, 'best30')}>
        <p className="font-medium">{t(locale, 'byQty')}</p>
        <ol className="list-decimal pl-6 space-y-1">
          {byQty.map((r) => (
            <li key={r.productId}>
              {nameOf(r.productId, locale)} — {t(locale, 'units', { qty: r.qty })}
            </li>
          ))}
          {byQty.length === 0 && <li>{emptyText}</li>}
        </ol>
        <p className="font-medium pt-2">{t(locale, 'byProfit')}</p>
        <ol className="list-decimal pl-6 space-y-1">
          {byProfit.map((r) => (
            <li key={r.productId}>
              {nameOf(r.productId, locale)} — ₹{r.profit}
            </li>
          ))}
          {byProfit.length === 0 && <li>{emptyText}</li>}
        </ol>
      </Section>

      <Section title={t(locale, 'rethink')}>
        <ul className="space-y-2">
          {rethink.map((r) => (
            <li key={r.productId}>
              <strong>{nameOf(r.productId, locale)}</strong> — {reasonText(r.reason)} ·{' '}
              {t(locale, 'sellThrough', { pct: r.sellThroughPct })} · {t(locale, 'units', { qty: r.remaining })}
            </li>
          ))}
          {rethink.length === 0 && <li>{emptyText}</li>}
        </ul>
      </Section>

      <Section title={t(locale, 'reorder')}>
        <ul className="space-y-2">
          {reorder.map((r) => (
            <li key={r.productId}>
              <strong>{nameOf(r.productId, locale)}</strong> —{' '}
              {r.status === 'order-now' ? t(locale, 'reorderNow') : t(locale, 'reorderSoon')} ·{' '}
              {t(locale, 'units', { qty: r.suggestedQty })}
            </li>
          ))}
          {reorder.length === 0 && <li>{emptyText}</li>}
        </ul>
      </Section>

      <Section title={t(locale, 'slowMovers')}>
        <ul className="list-disc pl-6">
          {slow.map((r) => (
            <li key={r.productId}>
              {nameOf(r.productId, locale)} — {t(locale, 'units', { qty: r.remaining })}
            </li>
          ))}
          {slow.length === 0 && <li>{emptyText}</li>}
        </ul>
      </Section>

      <Section title={`${t(locale, 'overheadShare')} (${month})`}>
        <p>
          ₹{monthOverhead} → {share.length === 0 ? emptyText : ''}
        </p>
        <ul className="list-disc pl-6">
          {share.map((s) => (
            <li key={s.productId}>
              {nameOf(s.productId, locale)} — ₹{s.amount}
            </li>
          ))}
        </ul>
      </Section>
    </section>
  );
}
