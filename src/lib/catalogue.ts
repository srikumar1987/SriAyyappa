import { products as builtIn, categoryFromText, type Category, type Product } from '@/data/products';
import { aliases } from '@/data/aliases';
import { readStore, type ProductRecord } from '@/data/repo';
import { locales, type Locale } from '@/i18n';
import type { SearchableProduct } from '@/domain/search';

export function recordToProduct(r: ProductRecord): Product {
  const en = r.names.en ?? r.names.ml ?? r.productId;
  const name = Object.fromEntries(locales.map((l: Locale) => [l, r.names[l] || en])) as Record<Locale, string>;
  return {
    id: r.productId,
    name,
    category: categoryFromText(r.category) ?? 'pooja',
    price: r.price,
    image: r.imageUrl || '/images/placeholder.svg',
  };
}

/** Built-in products plus products added by the admin. Built-in ids win if the sheet repeats them. */
export async function getProducts(): Promise<Product[]> {
  const store = await readStore();
  const builtInIds = new Set(builtIn.map((p) => p.id));
  const added = store.products.filter((r) => !builtInIds.has(r.productId)).map(recordToProduct);
  return [...builtIn, ...added];
}

export function findIn(list: Product[], id: string): Product | undefined {
  return list.find((p) => p.id === id);
}

export function toSearchable(list: Product[]): SearchableProduct[] {
  return list.map((p) => ({
    id: p.id,
    category: p.category as Category,
    price: p.price,
    names: locales.map((l) => p.name[l]),
    aliases: aliases[p.id] ?? [],
  }));
}
