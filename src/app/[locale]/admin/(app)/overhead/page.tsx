import AdminForm from '@/components/admin/AdminForm';
import { readStore } from '@/data/repo';
import { t } from '@/admin/messages';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const inputClass = 'mt-2 w-full text-xl border-2 border-saffron rounded-xl p-3 bg-white';
const TYPES = ['rent', 'electricity', 'staff', 'other'] as const;
const TYPE_KEY: Record<(typeof TYPES)[number], string> = {
  rent: 'overheadRent',
  electricity: 'overheadElectricity',
  staff: 'overheadStaff',
  other: 'overheadOther',
};

export default async function OverheadPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const now = new Date();
  const month = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7);
  const data = await readStore();
  const entries = data.overhead.filter((o) => o.month === month);
  const total = entries.reduce((n, o) => n + o.amount, 0);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-serif text-deep-red">{t(locale, 'overheadTitle')}</h1>

      <AdminForm endpoint="/api/admin/overhead" locale={locale} submitKey="saveOverhead">
        <label className="block text-lg font-medium">
          {t(locale, 'overheadMonth')}
          <input name="month" type="month" required defaultValue={month} className={inputClass} />
        </label>
        <label className="block text-lg font-medium">
          {t(locale, 'overheadType')}
          <select name="type" required defaultValue="rent" className={inputClass}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {t(locale, TYPE_KEY[type])}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-lg font-medium">
          {t(locale, 'overheadAmount')}
          <input name="amount" type="number" inputMode="decimal" min={1} step="0.01" required className={inputClass} />
        </label>
        <label className="block text-lg font-medium">
          {t(locale, 'overheadNote')}
          <input name="note" maxLength={200} className={inputClass} />
        </label>
      </AdminForm>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-lg font-medium">
          {month}: ₹{total}
        </p>
        <ul className="mt-2 space-y-1">
          {entries.map((o) => (
            <li key={o.overheadId}>
              {t(locale, TYPE_KEY[o.type as (typeof TYPES)[number]] ?? 'overheadOther')} — ₹{o.amount}
              {o.note ? ` · ${o.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
