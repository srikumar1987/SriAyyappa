import { describe, expect, it } from 'vitest';
import { levenshtein, normalizeSearch, relatedProducts, searchProducts, type SearchableProduct } from './search';

const items: SearchableProduct[] = [
  { id: 'P001', category: 'pooja', price: 200, names: ['Brass Lamp', 'पीतल का दीया', 'പിത്തള വിളക്ക്'], aliases: ['vilakku', 'deepam', 'diya'] },
  { id: 'P002', category: 'incense', price: 15, names: ['Agarbatti', 'अगरबत्ती', 'അഗർബത്തി'], aliases: ['agarbathi'] },
  { id: 'P003', category: 'pooja', price: 250, names: ['Pooja Thali', 'പൂജാ താലം'], aliases: ['thali'] },
  { id: 'P004', category: 'pooja', price: 30, names: ['Kumkum', 'കുങ്കുമം'], aliases: ['kunkuma'] },
  { id: 'P005', category: 'pooja', price: 20, names: ['Camphor', 'കർപ്പൂരം'], aliases: ['karpooram', 'kapoor'] },
  { id: 'P006', category: 'idols', price: 500, names: ['Brass Idol', 'പിത്തള വിഗ്രഹം'], aliases: ['vigraham'] },
  { id: 'K007', category: 'kerala-sweets', price: 180, names: ['Payasam Mix', 'പായസം മിക്സ്'], aliases: ['payasam'] },
];

describe('normalizeSearch', () => {
  it('treats composed and decomposed accents as the same', () => {
    expect(normalizeSearch('e\u0301cole')).toBe(normalizeSearch('\u00e9cole'));
  });

  it('treats the two ways of writing a Malayalam chillu n as the same', () => {
    expect(normalizeSearch('ന്\u200D')).toBe(normalizeSearch('ൻ'));
  });

  it('ignores case, punctuation and extra spaces', () => {
    expect(normalizeSearch('  Brass,   LAMP! ')).toBe('brass lamp');
  });
});

describe('levenshtein', () => {
  it('counts single-letter changes', () => {
    expect(levenshtein('vilakku', 'vilakk')).toBe(1);
    expect(levenshtein('camphor', 'camphor')).toBe(0);
  });
});

describe('searchProducts', () => {
  const ids = (q: string) => searchProducts(q, items).map((r) => r.id);

  it('finds by English name', () => {
    expect(ids('camphor')).toEqual(['P005']);
  });

  it('finds by Malayalam name', () => {
    expect(ids('വിളക്ക്')).toEqual(['P001']);
  });

  it('finds by Hindi name', () => {
    expect(ids('दीया')).toEqual(['P001']);
  });

  it('finds by a common alternative spelling', () => {
    expect(ids('vilakku')).toEqual(['P001']);
    expect(ids('deepam')).toEqual(['P001']);
  });

  it('finds with a one-letter typo', () => {
    expect(ids('camphr')).toEqual(['P005']);
    expect(ids('karpoorm')).toEqual(['P005']);
  });

  it('finds partial words as the customer types', () => {
    expect(ids('vila')).toEqual(['P001']);
  });

  it('requires every typed word to match', () => {
    expect(ids('brass lamp')).toEqual(['P001']);
    expect(ids('brass camphor')).toEqual([]);
  });

  it('returns nothing for an empty query', () => {
    expect(ids('   ')).toEqual([]);
  });

  it('returns every product with an exact word match, in a stable order', () => {
    const result = searchProducts('brass', items);
    expect(result.map((r) => r.id)).toEqual(['P001', 'P006']);
    expect(result.every((r) => r.score === 3)).toBe(true);
  });
});

describe('relatedProducts', () => {
  it('prefers the same category and a similar price', () => {
    const target = items.find((p) => p.id === 'P001')!;
    expect(relatedProducts(target, items).map((p) => p.id)).toEqual(['P003', 'P004', 'P005', 'K007']);
  });

  it('never includes the item itself', () => {
    const target = items.find((p) => p.id === 'P001')!;
    expect(relatedProducts(target, items).map((p) => p.id)).not.toContain('P001');
  });
});
