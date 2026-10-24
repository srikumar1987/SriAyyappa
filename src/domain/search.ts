const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

// Malayalam chillu letters (standalone consonants) and their base-consonant-plus-virama spelling.
const CHILLU_TO_BASE: Record<string, string> = {
  '\u0D7A': '\u0D23', // ൺ -> ണ്
  '\u0D7B': '\u0D28', // ൻ -> ന്
  '\u0D7C': '\u0D30', // ർ -> ര്
  '\u0D7D': '\u0D32', // ൽ -> ല്
  '\u0D7E': '\u0D33', // ൾ -> ള്
  '\u0D7F': '\u0D15', // ൿ -> ക്
};

/** Makes typed search text comparable: Unicode form, zero-width marks, chillu spelling, case, punctuation. */
export function normalizeSearch(input: string): string {
  return input
    .normalize('NFC')
    .replace(ZERO_WIDTH, '')
    .replace(/[\u0D7A-\u0D7F]/g, (c) => `${CHILLU_TO_BASE[c]}\u0D4D`)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export interface SearchableProduct {
  id: string;
  category: string;
  price: number;
  names: string[]; // one per language
  aliases: string[]; // extra spellings, e.g. "vilakku", "deepam"
}

function wordsOf(item: SearchableProduct): string[] {
  return normalizeSearch([...item.names, ...item.aliases].join(' ')).split(' ').filter(Boolean);
}

/** Score for one query word against the item's words. 0 means no match. */
function tokenScore(token: string, words: string[]): number {
  let best = 0;
  for (const w of words) {
    if (w === token) return 3;
    if (token.length >= 2 && w.startsWith(token)) best = Math.max(best, 2);
    else if (token.length >= 4 && Math.abs(w.length - token.length) <= 1 && levenshtein(w, token) <= 1) {
      best = Math.max(best, 1);
    } else if (token.length >= 3 && w.includes(token)) best = Math.max(best, 1);
  }
  return best;
}

/** Every word typed must match something (AND). Best matches first. */
export function searchProducts(query: string, items: SearchableProduct[]): { id: string; score: number }[] {
  const tokens = normalizeSearch(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const results: { id: string; score: number }[] = [];
  for (const item of items) {
    const words = wordsOf(item);
    const scores = tokens.map((t) => tokenScore(t, words));
    if (scores.every((s) => s > 0)) {
      results.push({ id: item.id, score: scores.reduce((a, b) => a + b, 0) });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/** Same category first, then similar price (within 30%). */
export function relatedProducts(target: SearchableProduct, items: SearchableProduct[], limit = 4): SearchableProduct[] {
  return items
    .filter((p) => p.id !== target.id)
    .map((p) => {
      const sameCategory = p.category === target.category ? 2 : 0;
      const similarPrice = Math.abs(p.price - target.price) <= 0.3 * target.price ? 1 : 0;
      return { p, score: sameCategory + similarPrice };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(a.p.price - target.price) - Math.abs(b.p.price - target.price))
    .slice(0, limit)
    .map((x) => x.p);
}
