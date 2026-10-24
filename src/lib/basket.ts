// Quote basket kept in the customer's browser. Prices are never stored here; the server prices the quote.
export interface BasketItem {
  productId: string;
  qty: number;
}

const KEY = 'ayyappa-quote-basket';
const MAX_QTY = 1000;

export function readBasket(): BasketItem[] {
  try {
    const items = JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as BasketItem[];
    return Array.isArray(items) ? items.filter((i) => i.productId && i.qty > 0) : [];
  } catch {
    return [];
  }
}

function writeBasket(items: BasketItem[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('basket-changed'));
}

export function addToBasket(productId: string, qty = 1): void {
  const items = readBasket();
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
  else items.push({ productId, qty: Math.min(MAX_QTY, qty) });
  writeBasket(items);
}

export function setBasketQty(productId: string, qty: number): void {
  const clamped = Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
  writeBasket(
    readBasket()
      .map((i) => (i.productId === productId ? { ...i, qty: clamped } : i))
      .filter((i) => i.qty > 0)
  );
}

export function removeFromBasket(productId: string): void {
  writeBasket(readBasket().filter((i) => i.productId !== productId));
}

export function clearBasket(): void {
  writeBasket([]);
}
