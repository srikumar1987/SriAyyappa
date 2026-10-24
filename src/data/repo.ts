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

export interface StoreData {
  lots: LotRecord[];
  sales: SaleRecord[];
}

const FILE = path.join(process.cwd(), '.local', 'store.json');

export async function readStore(): Promise<StoreData> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8')) as StoreData;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { lots: [], sales: [] };
    throw e;
  }
}

// Writes run one at a time, so a read-check-write sequence cannot interleave with another request.
let queue: Promise<unknown> = Promise.resolve();

/** Applies `mutate` to the stored data and saves it. If `mutate` throws, nothing is saved. */
export function updateStore(mutate: (data: StoreData) => void): Promise<void> {
  const run = queue.then(async () => {
    const data = await readStore();
    mutate(data);
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(data, null, 2));
  });
  queue = run.catch(() => undefined);
  return run;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}
