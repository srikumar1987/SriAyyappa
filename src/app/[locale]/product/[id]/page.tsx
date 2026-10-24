import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Product } from '@/data/products';
import Header from '@/components/Header';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';
import { locales, localeNames, type Locale } from '@/i18n';
import { relatedProducts } from '@/domain/search';
import { findProduct, toSearchable } from '@/lib/catalogue';
import { productName } from '@/lib/productName';
import { safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { locale: string; id: string } }) {
  const locale = safeLocale(params.locale);
  const product = findProduct(params.id);
  if (!product) notFound();

  const t = await getTranslations('shop');
  const index = toSearchable();
  const related = relatedProducts(index.find((i) => i.id === product.id)!, index, 4)
    .map((r) => findProduct(r.id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={product.image}
            alt={productName(product, locale)}
            width={400}
            height={300}
            className="w-full rounded-2xl bg-cream object-cover"
          />
          <div className="space-y-5">
            <h2 className="text-3xl font-serif text-deep-red">{productName(product, locale)}</h2>
            <p className="text-3xl font-bold text-deep-red">₹{product.price}</p>
            <ProductActions product={product} />
            <ul className="space-y-1 text-dark-brown">
              {locales.map((l) => (
                <li key={l}>
                  <span className="text-sm text-dark-brown/70">{localeNames[l as Locale]}: </span>
                  {product.name[l]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-deep-red">{t('relatedItems')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
