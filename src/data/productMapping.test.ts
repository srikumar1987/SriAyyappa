import { describe, expect, it } from 'vitest';
import type { StoreData } from './repo';
import { rowsToAppend, storeFromValues } from './sheetMapping';
import { categoryFromText } from './products';

const empty: StoreData = { lots: [], sales: [], overhead: [], quotes: [], products: [] };

describe('categoryFromText', () => {
  it('accepts the sheet label and the code key', () => {
    expect(categoryFromText('Kerala Snacks')).toBe('kerala-snacks');
    expect(categoryFromText('kerala-snacks')).toBe('kerala-snacks');
    expect(categoryFromText('  idols ')).toBe('idols');
  });

  it('returns undefined for an unknown category', () => {
    expect(categoryFromText('Toys')).toBeUndefined();
  });
});

describe('product rows', () => {
  it('round-trips an admin-added product through the sheet layout', () => {
    const after: StoreData = {
      ...empty,
      products: [
        {
          productId: 'P-ABC-1234',
          category: 'kerala-snacks',
          price: 120,
          mrp: 150,
          unit: 'pack',
          manufacturer: 'Local maker',
          description: 'Crisp and salted',
          names: { ml: 'ശർക്കര വരട്ടി', en: 'Sarkara varatti' },
          imageUrl: 'https://lh3.googleusercontent.com/d/abc=w800',
        },
      ],
    };
    const values = rowsToAppend(empty, after, () => 'E');
    expect(values.products[0]).toHaveLength(15); // A..O
    expect(values.products[0][14]).toBe('pack'); // Unit
    expect(values.products[0][7]).toBe('Kerala Snacks'); // category written as the sheet label
    expect(storeFromValues(values).products).toEqual(after.products);
  });

  it('appends only products added since the last save', () => {
    const one = { productId: 'P-1', category: 'idols', price: 1, mrp: 0, unit: 'piece', manufacturer: '', description: '', names: { en: 'A' }, imageUrl: '' };
    const two = { ...one, productId: 'P-2' };
    const values = rowsToAppend({ ...empty, products: [one] }, { ...empty, products: [one, two] }, () => 'E');
    expect(values.products.map((r) => r[0])).toEqual(['P-2']);
  });
});
