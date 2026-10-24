import { products, type Product } from '@/data/products';
import { aliases } from '@/data/aliases';
import { locales } from '@/i18n';
import type { SearchableProduct } from '@/domain/search';

export function toSearchable(list: Product[] = products): SearchableProduct[] {
  return list.map((p) => ({
    id: p.id,
    category: p.category,
    price: p.price,
    names: locales.map((l) => p.name[l]),
    aliases: aliases[p.id] ?? [],
  }));
}

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
