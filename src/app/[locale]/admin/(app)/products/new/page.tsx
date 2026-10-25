import ProductForm from '@/components/admin/ProductForm';
import { t } from '@/admin/messages';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default function NewProductPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-serif text-deep-red mb-6">{t(locale, 'productTitle')}</h1>
      <ProductForm locale={locale} />
    </section>
  );
}
