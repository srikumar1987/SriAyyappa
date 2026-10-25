import { google, type sheets_v4 } from 'googleapis';
import type { StoreData } from './repo';
import { APPEND_RANGES, READ_RANGES, TABS, rowsToAppend, storeFromValues, type SheetValues } from './sheetMapping';

// Google Sheets as the database. Used when DATA_BACKEND=sheets.
// Credentials: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (hosting), or GOOGLE_APPLICATION_CREDENTIALS
// pointing at the JSON key file (local development only).

// drive.file: only files this app creates (the product photos). The sheet is covered by spreadsheets.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'];

export function driveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials: email && key ? { client_email: email, private_key: key } : undefined,
  });
  return google.drive({ version: 'v3', auth });
}

function sheetsClient(): sheets_v4.Sheets {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials: email && key ? { client_email: email, private_key: key } : undefined,
  });
  return google.sheets({ version: 'v4', auth });
}

function spreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set');
  return id;
}

async function readValues(sheets: sheets_v4.Sheets): Promise<SheetValues> {
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId(),
    ranges: [
      `${TABS.products}!${READ_RANGES.products}`,
      `${TABS.lots}!${READ_RANGES.lots}`,
      `${TABS.sales}!${READ_RANGES.sales}`,
      `${TABS.expenses}!${READ_RANGES.expenses}`,
      `${TABS.overhead}!${READ_RANGES.overhead}`,
      `${TABS.quotes}!${READ_RANGES.quotes}`,
    ],
  });
  const [products, lots, sales, expenses, overhead, quotes] = (res.data.valueRanges ?? []).map(
    (r) => (r.values ?? []) as string[][]
  );
  return { products, lots, sales, expenses, overhead, quotes };
}

export async function readSheetStore(): Promise<StoreData> {
  return storeFromValues(await readValues(sheetsClient()));
}

// Writes run one at a time within this server process.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Same contract as the local store: `mutate` changes a copy; if it throws, nothing is written.
 * The sheet has no transactions, so the new rows are appended only after the whole change is validated.
 */
export function updateSheetStore(mutate: (data: StoreData) => void, makeId: (p: string) => string): Promise<void> {
  const run = queue.then(async () => {
    const sheets = sheetsClient();
    const values = await readValues(sheets);
    const before = storeFromValues(values);
    const after = storeFromValues(values);
    mutate(after);
    const rows = rowsToAppend(before, after, makeId);
    await appendRows(sheets, rows);
  });
  queue = run.catch(() => undefined);
  return run;
}

async function appendRows(sheets: sheets_v4.Sheets, rows: SheetValues): Promise<void> {
  for (const key of Object.keys(rows) as (keyof SheetValues)[]) {
    if (rows[key].length === 0) continue;
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId(),
      range: `${TABS[key]}!${APPEND_RANGES[key]}`,
      valueInputOption: 'RAW', // keeps dates and IDs as typed text
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows[key] },
    });
  }
}
