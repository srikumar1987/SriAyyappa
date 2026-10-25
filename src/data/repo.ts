import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Local development store. Replaced by the Google Sheets repository (same shape) in Phase 1b.
export interface LotRecord {
  lotId: string;
  productId: string;
  receivedOn: string;
  supplier: string;
  qtyReceived: number;
  buyPriceUnit: number;
  sellingPriceUnit: number;
  lotExpensesTotal: number;
  expenseNote: string;
}

export interface SaleRecord {
  saleId: string;
  sliceNo: number;
  soldAt: string;
  productId: string;
  lotId: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  payment: string;
  customerName: string;
  customerPhone: string;
}

export interface OverheadRecord {
  overheadId: string;
  month: string; // YYYY-MM
  type: string;
  amount: number;
  note: string;
}

export interface QuoteItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface QuoteRecord {
  quoteId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  language: string;
  items: QuoteItem[];
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'expired';
}

export interface ProductRecord {
  productId: string;
  category: string; // a Category key, e.g. 'kerala-snacks'
  price: number;
  mrp: number;
  unit: string; // a Unit, e.g. 'kg'
  manufacturer: string;
  description: string;
  names: Partial<Record<'en' | 'hi' | 'kn' | 'ml' | 'te' | 'ta', string>>;
  imageUrl: string;
}

export interface StoreData {
  lots: LotRecord[];
  sales: SaleRecord[];
  overhead: OverheadRecord[];
  quotes: QuoteRecord[];
  products: ProductRecord[]; // products added by the admin, on top of the built-in list
}

const FILE = path.join(process.cwd(), '.local', 'store.json');
const emptyStore = (): StoreData => ({ lots: [], sales: [], overhead: [], quotes: [], products: [] });

async function readLocalStore(): Promise<StoreData> {
  try {
    return { ...emptyStore(), ...(JSON.parse(await readFile(FILE, 'utf8')) as Partial<StoreData>) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return emptyStore();
    throw e;
  }
}

// Writes run one at a time, so a read-check-write sequence cannot interleave with another request.
let queue: Promise<unknown> = Promise.resolve();

/** Applies `mutate` to the stored data and saves it. If `mutate` throws, nothing is saved. */
function updateLocalStore(mutate: (data: StoreData) => void): Promise<void> {
  const run = queue.then(async () => {
    const data = await readLocalStore();
    mutate(data);
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(data, null, 2));
  });
  queue = run.catch(() => undefined);
  return run;
}

// DATA_BACKEND=sheets uses the Google Sheet; anything else uses the local file (development).
const useSheets = () => process.env.DATA_BACKEND === 'sheets';

export async function readStore(): Promise<StoreData> {
  if (useSheets()) return (await import('./sheetsRepo')).readSheetStore();
  return readLocalStore();
}

export async function updateStore(mutate: (data: StoreData) => void): Promise<void> {
  if (useSheets()) return (await import('./sheetsRepo')).updateSheetStore(mutate, newId);
  return updateLocalStore(mutate);
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}
