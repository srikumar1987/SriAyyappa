import AdminForm from '@/components/admin/AdminForm';
import { getProducts } from '@/lib/catalogue';
import { t } from '@/admin/messages';
import { productName } from '@/lib/productName';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const inputClass = 'mt-2 w-full text-xl border-2 border-saffron rounded-xl p-3 bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-lg font-medium">
      {label}
      {children}
    </label>
  );
}

export default async function NewLotPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const products = await getProducts();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-serif text-deep-red mb-6">{t(locale, 'stockArrived')}</h1>
      <AdminForm endpoint="/api/admin/lots" locale={locale} submitKey="saveLot">
        <Field label={t(locale, 'product')}>
          <select name="productId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              {t(locale, 'selectProduct')}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {productName(p, locale)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t(locale, 'supplier')}>
          <input name="supplier" required maxLength={80} className={inputClass} />
        </Field>

        <Field label={t(locale, 'receivedOn')}>
          <input name="receivedOn" type="date" required defaultValue={today} className={inputClass} />
        </Field>

        <Field label={t(locale, 'qtyReceived')}>
          <input name="qtyReceived" type="number" inputMode="decimal" min={0.001} step="0.001" required className={inputClass} />
        </Field>

        <Field label={t(locale, 'buyPrice')}>
          <input name="buyPriceUnit" type="number" inputMode="decimal" min={0} step="0.01" required className={inputClass} />
        </Field>

        <Field label={t(locale, 'sellingPrice')}>
          <input name="sellingPriceUnit" type="number" inputMode="decimal" min={0} step="0.01" placeholder={t(locale, 'priceDefaultHint')} className={inputClass} />
        </Field>

        <Field label={t(locale, 'otherExpenses')}>
          <input name="lotExpensesTotal" type="number" inputMode="decimal" min={0} step="0.01" defaultValue={0} className={inputClass} />
        </Field>

        <Field label={t(locale, 'expenseNote')}>
          <input name="expenseNote" maxLength={200} className={inputClass} />
        </Field>
      </AdminForm>
    </section>
  );
}
