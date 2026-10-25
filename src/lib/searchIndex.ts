// Browser-safe: no server imports, so the catalogue can search instantly on the phone.
import type { Category, Product } from '@/data/products';
import { aliases } from '@/data/aliases';
import { locales } from '@/i18n';
import type { SearchableProduct } from '@/domain/search';

export function toSearchable(list: Product[]): SearchableProduct[] {
  return list.map((p) => ({
    id: p.id,
    category: p.category as Category,
    price: p.price,
    names: locales.map((l) => p.name[l]),
    aliases: aliases[p.id] ?? [],
  }));
}
