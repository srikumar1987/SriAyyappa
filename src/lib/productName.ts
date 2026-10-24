import type { Product } from '@/data/products';
import type { Locale } from '@/i18n';

export function productName(product: Product, locale: string): string {
  return product.name[locale as Locale] ?? product.name.en;
}
