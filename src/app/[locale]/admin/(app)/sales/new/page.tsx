import AdminForm from '@/components/admin/AdminForm';
import { getProducts } from '@/lib/catalogue';
import { readStore } from '@/data/repo';
import { stockRows } from '@/domain/stockView';
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

export default async function NewSalePage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  const products = await getProducts();
  const data = await readStore();
  const rows = stockRows(
    products.map((p) => p.id),
    data.lots,
    data.sales,
    new Date()
  );

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-serif text-deep-red mb-6">{t(locale, 'sale')}</h1>
      <AdminForm endpoint="/api/admin/sales" locale={locale} submitKey="saveSale">
        <Field label={t(locale, 'product')}>
          <select name="productId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t(locale, 'selectProduct')}
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {productName(p, locale)} ({t(locale, 'left')}: {rows[p.id]?.remaining ?? 0})
              </option>
            ))}
          </select>
        </Field>

        <Field label={t(locale, 'qty')}>
          <input name="qty" type="number" inputMode="decimal" min={0.001} step="0.001" required className={inputClass} />
        </Field>

        <Field label={t(locale, 'unitPrice')}>
          <input name="unitPrice" type="number" inputMode="decimal" min={0} step="0.01" placeholder={t(locale, 'priceDefaultHint')} className={inputClass} />
        </Field>

        <Field label={t(locale, 'payment')}>
          <select name="payment" required defaultValue="cash" className={inputClass}>
            <option value="cash">{t(locale, 'cash')}</option>
            <option value="upi">{t(locale, 'upi')}</option>
            <option value="whatsapp">{t(locale, 'whatsapp')}</option>
            <option value="bank">{t(locale, 'bank')}</option>
          </select>
        </Field>

        <Field label={t(locale, 'customerName')}>
          <input name="customerName" maxLength={80} className={inputClass} />
        </Field>

        <Field label={t(locale, 'customerPhone')}>
          <input name="customerPhone" type="tel" maxLength={15} className={inputClass} />
        </Field>
      </AdminForm>
    </section>
  );
}
