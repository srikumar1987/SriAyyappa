# Ayyappa Pooja Store - Architecture & Test Design

Status: **Proposal for review.** This document replaces the earlier summary files
(`IMPLEMENTATION_SUMMARY.md`, `KERALA_ITEMS_UPDATE.md`, `GOOGLE_DRIVE_INTEGRATION_SUMMARY.md`).

---

## 1. Requirements (consolidated)

| # | Requirement | Design answer |
|---|---|---|
| R1 | Run by an older Uncle and Aunty; minimal input after setup | Admin UI is large-button, Malayalam-first, voice-assisted; one screen per daily task |
| R2 | Easy to add inventory and to track what is left | Product wizard (photo -> details -> save); Stock screen with status colours |
| R3 | Buying and selling price per **lot**, plus other expenses per lot | Lots + Lot Expenses; landed cost per unit drives profit |
| R4 | Overhead costs (rent, power, staff) | Overhead sheet, allocated to lots by revenue share per month |
| R5 | Six languages (en, hi, kn, ml, te, ta), good translation, not literal | Per-language product names and descriptions; curated glossary; reviewer workflow |
| R6 | Product name in each language | Name fields per language, with search aliases |
| R7 | Photo from phone or better camera, price card, manufacturer, description | Admin photo capture; fields for MRP, selling price, manufacturer, description |
| R8 | Beautified product images | Client-side enhancement at upload (white balance, contrast, crop); optional background removal later |
| R9 | Search by text and by voice, any supported language; show related items | Normalised search index; Web Speech API; related = same category + tags + price band |
| R10 | Catalogue, preorder, quotation | Public catalogue; quote basket; quote record; printable quote page |
| R11 | WhatsApp to an individual customer | Pre-filled `wa.me` links from product, quote and admin screens (free) |
| R12 | Analytics: best sellers, slow movers, what to rethink before ordering, reorder suggestions, list of remaining items | Pure TypeScript analytics over the ledger; reports screen |
| R13 | Devotional look and feel with effects | Theme tokens, animations that respect reduced-motion, no autoplay audio |
| R14 | Storage: Google Drive for images and sheet; GitHub for code | Drive folder per product; Google Sheets as the database; GitHub -> Vercel |
| R15 | Kerala items (snacks, sweets, products) | Categories are data, not code |

---

## 2. Architecture overview

```
                 +-----------------------------+
 Customers --->  |  Public site (Next.js, ISR) |  catalogue, search, quote basket
 (6 languages)   +--------------+--------------+
                                |  server-only reads (cached 5 min)
                                v
 Uncle/Aunty --> +-----------------------------+      +--------------------------+
 (phone, admin)  |  Admin app (Next.js)        |----->|  Google Sheets           |
                 |  Google sign-in (allowlist) |      |  (database, 1 workbook)  |
                 +--------------+--------------+      +--------------------------+
                                |                      +--------------------------+
                                +--------------------->|  Google Drive            |
                                  upload / list        |  (product photos)        |
                                                       +--------------------------+
 Browser-only: Web Speech API (voice), canvas (image enhancement), wa.me (WhatsApp)
```

Key principles
- **Single source of truth:** the Google Sheet. The site never keeps its own database.
- **Append-only ledger:** sales, lot receipts and expenses are only added, never edited in place. Stock and profit are *derived*, so they cannot drift.
- **Domain logic is pure code:** FIFO costing, profit, analytics, search and reorder rules live in `src/domain/` with no I/O. They are the most important things to test.
- **Secrets stay on the server:** the service account key is read only in server code (`import 'server-only'`).
- **Cheap and free where possible:** Sheets, Drive, wa.me links, browser speech and canvas. Paid services are optional later.

---

## 3. Routes

Public (locale-prefixed, `as-needed`: English has no prefix)

| Route | Purpose |
|---|---|
| `/` | Home: hero, featured, Kerala and pooja entry points |
| `/catalogue` | All products, category filter, pagination (24 per page) |
| `/kerala` | Kerala categories only |
| `/product/[id]` | Photos, names, description, price, manufacturer, related items, WhatsApp, add to quote |
| `/search?q=` | Text and voice search results with related suggestions |
| `/quote` | Quote basket, customer details, creates a quote, WhatsApp hand-off, printable page |
| `/quote/[id]` | Printable quotation |
| `/about`, `/contact` | Static content from translation files |

Admin (not locale-prefixed; Malayalam-first, English available in settings)

| Route | Purpose |
|---|---|
| `/admin` | Home: four big buttons (Add product, Stock arrived, Sale, Reports) + today's summary |
| `/admin/products/new` | Camera/photo -> enhance -> names -> prices -> save |
| `/admin/products/[id]` | Edit product, photos, translations, hide/show |
| `/admin/lots/new` | Stock arrived: product, supplier, buy price, qty, selling price, lot expenses |
| `/admin/sales/new` | Voice or search product -> quantity -> FIFO preview -> confirm |
| `/admin/stock` | Remaining items list with status (OK / Low / Out / Slow) |
| `/admin/reports` | Best sellers, slow movers, rethink before ordering, reorder suggestions, profit |
| `/admin/quotes` | Open quotes, status (Draft / Sent / Accepted / Expired), WhatsApp follow-up |
| `/admin/overhead` | Monthly overhead entry |
| `/admin/import` | Bulk product import from CSV (the template) |
| `/api/*` | Only for writes that need the server (upload, sale, lot, quote); all validated with zod |

---

## 4. Data model (Google Sheets workbook)

Each sheet has a fixed header row. The header names are a **contract**: the code reads columns by name, and a test checks the template matches the code.

| Sheet | One row is | Key columns |
|---|---|---|
| `Products` | a product | `Product_ID`, `Category`, `Name_en/hi/kn/ml/te/ta`, `Desc_en/hi/kn/ml/te/ta`, `Manufacturer`, `MRP`, `Selling_Price`, `Tags`, `Aliases`, `Visible` (Y/N), `Translation_Status` (Draft / Reviewed), `Updated_At` |
| `Images` | a photo | `Product_ID`, `Drive_File_ID`, `Position`, `Is_Primary` |
| `Lots` | a stock receipt | `Lot_ID`, `Product_ID`, `Received_On`, `Supplier`, `Buy_Price_Unit`, `Qty_Received`, `Selling_Price_Unit`, `Lot_Expenses_Total` (SUMIF of Expenses), `Landed_Cost_Unit` (formula) |
| `Expenses` | a cost against a lot | `Expense_ID`, `Lot_ID`, `Type` (Transport/Packaging/Loading/Tax/Other), `Amount`, `Date`, `Note` |
| `Overhead` | a monthly running cost | `Overhead_ID`, `Month` (YYYY-MM), `Type`, `Amount`, `Note` |
| `Sales` | one **FIFO slice** of a sale | `Sale_ID`, `Slice_No`, `Sold_At`, `Product_ID`, `Lot_ID`, `Qty`, `Unit_Price`, `Unit_Cost` (landed cost of that lot), `Payment` (Cash/UPI/Bank/WhatsApp), `Customer_Name`, `Customer_Phone` |
| `Quotes` | a quotation header | `Quote_ID`, `Created_At`, `Customer_Name`, `Customer_Phone`, `Language`, `Status`, `Valid_Till`, `Items_JSON`, `Total` |
| `Glossary` | a term in six languages | `Term_en`, `hi`, `kn`, `ml`, `te`, `ta`, `Notes`, `Reviewed_By` |
| `Settings` | key/value | `Store_Name`, `WhatsApp_Number`, `UPI_ID`, `Low_Stock_Days`, `Supplier_Lead_Days` |
| `AuditLog` | an admin action | `At`, `Who`, `Action`, `Entity_ID`, `Detail` |

Why slices in `Sales`: one customer order can consume several lots. Storing each slice keeps cost of goods exact per lot, which is what makes lot-level profit correct.

IDs: generate as `P-<base36 timestamp>-<4 random chars>` (not `Date.now()` alone, which can collide when two saves happen in the same millisecond).

---

## 5. Core domain rules (pure functions, unit-tested)

**5.1 FIFO allocation** `allocateFifo(lots, qty) -> slices`
- Consumes the oldest `Received_On` first (ties broken by `Lot_ID`).
- Skips lots with zero remaining. Splits a lot when needed.
- Throws `InsufficientStock` if total remaining < qty. The sale is never partially written.

**5.2 Landed cost**
`Landed_Cost_Unit = (Buy_Price_Unit * Qty_Received + Lot_Expenses_Total) / Qty_Received`

**5.3 Profit**
- Gross profit per slice = `Qty * (Unit_Price - Unit_Cost)`
- Overhead for a month is allocated to products by their share of that month's revenue.
- Net profit = gross profit - allocated overhead.

**5.4 Analytics**
- `Sold_60d(product)`: quantity sold in the last 60 days.
- Best sellers: top N by quantity and by profit, for the chosen period.
- Slow movers: stock > 0 and no sale in `Slow_Days` (default 30). Shows stock value at risk.
- Rethink before ordering (any of):
  - sell-through < 30 % of received after 60 days
  - margin below the category average
  - stock older than 90 days
- Reorder suggestion:
  - `Daily_Rate = Sold_60d / 60`
  - `Days_Cover = Remaining / Daily_Rate`
  - `Suggested_Qty = ceil(Daily_Rate * (Lead_Days + 30) - Remaining)` (never negative)
  - Status: Order now (Days_Cover < lead time), Order soon (< lead + 14), OK.

**5.5 Stock status**
Out (0) / Low (`Remaining <= Low_Stock_Qty`) / Slow (rule 5.4) / OK.

**5.6 Pricing**
- Stored as integer paise or rupees with no decimals in the sheet; display as `₹1,250` using `en-IN` formatting in every language (number formatting is the same in all six, so one function is enough).

---

## 6. Multi-language and translation

- **Source language for entry:** Malayalam or English. The admin form asks for the name in the language the uncle is most comfortable with.
- **Other languages:** pre-filled from the **glossary first** (curated, correct terms such as the Malayalam for camphor, coconut oil, jaggery). Anything not in the glossary can use an auto-translation suggestion (MyMemory free tier, with limits), and it is saved as `Draft`.
- **Review:** a product shows its `Draft` label to customers only if the setting "show drafts" is on. A reviewer marks it `Reviewed`.
- **Descriptions** are written in the language, not translated word for word. The glossary notes explain the cultural meaning where a direct translation would be wrong.
- **Locale files** hold UI text only. Every key must exist in all six files (a test enforces it).
- **Fonts:** each language has its own script font (already set up in `globals.css`), so text never falls back to system fonts.
- **Unicode:** all search text is normalised with NFC, and Malayalam chillu forms are normalised (for example `ൻ` and `ന്‍`), so the same word typed two ways is found.

---

## 7. Search and voice

Pipeline
1. Input: typed text or speech transcript.
2. Normalise: NFC, lowercase Latin, trim, collapse spaces, strip punctuation.
3. Expand with aliases from `Aliases` and the glossary (for example `vilakku`, `vilakk`, `dheepam`, `വിളക്ക്` all map to the brass lamp).
4. Match: exact, then prefix, then fuzzy (Fuse.js, threshold tuned by tests) over all six names, tags and aliases.
5. Result: best matches first, then related items (same category, shared tags, price within +/-30 %).

Voice
- Web Speech API with language codes `ml-IN`, `hi-IN`, `kn-IN`, `te-IN`, `ta-IN`, `en-IN`.
- The user chooses the language from the language switcher. Voice is hidden where the browser does not support it, and a text box is always shown.
- Show the transcript and let the user edit it before searching.

Known limits (be explicit with the client): accuracy varies by phone, browser and accent. Chrome on Android is best. iOS Safari support is partial.

---

## 8. Quotes, preorders and WhatsApp

- **Quote basket:** customers add products (with quantity) from any page. The basket is stored in the browser.
- **Submit:** creates a row in `Quotes` with status `Draft` and a Quote ID. The store is notified by a pre-filled WhatsApp message to the store number.
- **Customer hand-off:** the customer opens the printable quote page and sends it by WhatsApp (pre-filled `wa.me` message to the customer's number, or to the store).
- **Preorder:** a quote with a requested date and a deposit note. No stock is reserved automatically; the uncle confirms in admin, which then records the sale.
- **WhatsApp to an individual:** every product, quote and sale screen in admin has a "Send on WhatsApp" button with a pre-filled message in the customer's chosen language.
- Upgrade path: WhatsApp Business Cloud API (automatic messages). It needs Meta business verification and has costs, so it is not in the first release.

---

## 9. Image pipeline

1. Admin takes or picks a photo (`<input type="file" accept="image/*" capture="environment">`).
2. Browser resizes to max 1200 px and enhances (brightness/contrast, slight sharpen, auto-crop to the object). No upload of the raw 12 MP file.
3. Server receives the JPEG (validated: type, size under 1 MB), uploads to the product's Drive folder with the service account.
4. `Images` row is added. Customer pages use `https://lh3.googleusercontent.com/d/<FILE_ID>=w800` URLs and set `loading="lazy"` with explicit width/height to avoid layout shift.
5. Later: background removal (client-side model) if the uncle wants pure white backgrounds.

Drive layout: `Ayyappa Pooja Store / Images / <Product_ID>_<slug>/`.

---

## 10. Security and privacy

- Service account key: environment variable only, never in the repo. `.env*.local` is git-ignored (already set).
- Admin access: **Google sign-in (Auth.js) with an allowlist** of the family's Gmail addresses. The alternative is a PIN, which is simpler but weaker; the choice is in the decisions list.
- Server routes validate every input with zod and check the session.
- Rate-limit `/api/*` writes.
- Customer phone numbers are personal data: shown only in admin, not in public URLs, and exportable/deletable on request.
- Sheet and Drive folder shared only with the service account and the admin accounts.
- Backups: a weekly copy of the workbook in `Backups/` (Drive "Make a copy", or a scheduled GitHub Action that exports CSVs).
- Dependencies: pin versions, review updates; avoid packages published in the last 7 days.

---

## 11. Performance and reliability

- Reads from Sheets are cached (ISR revalidate 300 s; admin writes call `revalidateTag`). Sheets has per-minute read quotas, so caching is required, not optional.
- Writes go through one server function that re-reads the affected rows before writing (optimistic check), so two simultaneous sales cannot both use the last item. Sheets has no transactions, so this is a mitigation, not a guarantee. The design accepts this for one shop; a move to Postgres is the path if volume grows.
- Admin forms save locally first and retry if the network is down (offline queue). Malayalam-speaking users see a clear "saved, sending..." message.
- Target: Lighthouse mobile performance >= 85 on the catalogue page; images under 150 KB each.

---

## 12. Test strategy (QE view)

Test pyramid

| Level | What | Tooling | Gate |
|---|---|---|---|
| Unit (domain) | FIFO, landed cost, profit, overhead allocation, reorder, stock status, search normalisation, aliases, ID generation, price format | Vitest | 100 % of domain branches; run on every commit |
| Contract | Sheet headers match the template; row <-> object mapping round-trips; zod schemas reject bad input | Vitest + template file | Every commit |
| Content | All 6 locale files have identical keys; no empty values; `{placeholders}` identical across languages; every product has all 6 names and descriptions (or a `Draft` flag) | Vitest | Every commit |
| Integration | Sheets/Drive repository against a **test copy** of the workbook; upload then list; sale then stock | Vitest with a test service account | Nightly / before release |
| E2E | Language switch keeps the same page; catalogue filter; text search; mocked voice; add product; add lot; sale with FIFO; WhatsApp link content | Playwright, at 360 px, 768 px and 1280 px, in all 6 locales | Every pull request |
| Accessibility | axe-core on every route: no serious/critical issues; keyboard navigation; reduced-motion respected | Playwright + axe | Every pull request |
| Performance | Lighthouse CI on catalogue and product pages | Lighthouse CI | Every release |
| Usability (UAT) | Scripted tasks done by Uncle and Aunty: add product, record sale, check remaining stock, send quote. Measure time and errors | Manual, observed | Before launch |

Critical test cases (must exist)
- FIFO: sale spanning two lots uses the older lot first; exact-quantity sale empties a lot; sale larger than stock is rejected with no partial writes.
- Profit: a lot with expenses has a higher landed cost; margins match hand calculations.
- Search: `vilakku`, `വിളക്ക്`, `दीया` all find Brass Lamp; the same Malayalam word typed with different Unicode forms matches; a misspelling still finds the item.
- Voice: transcript in each language reaches the same search; unsupported browser shows the text box only.
- WhatsApp: message text is correctly encoded per language (emoji and Indic script survive); the number is required and validated.
- Language switch: switching on `/product/P001` stays on that product; no 404s for any link in any locale.
- Images: oversized file is rejected; enhanced file is smaller than 1 MB; missing image shows the placeholder without a broken icon.
- Permissions: an unlisted Google account cannot open `/admin` or call any `/api` write.
- Concurrency: two sales of the last unit at once -> exactly one succeeds (simulated in integration tests).
- Data quality: duplicate Product_ID, negative stock, price 0, missing translation are reported in an admin "Data check" screen.

Test data: a synthetic workbook with 1,000 products (generated) for performance and search-ranking tests; the real product list for UAT.

Definition of done for a feature
1. Domain tests pass. 2. E2E for the happy path and one failure path. 3. Malayalam UI text reviewed by a native speaker. 4. Works at 360 px width. 5. Uncle/Aunty can complete the task in the UAT script.

---

## 13. Delivery plan

| Phase | Scope | Exit criteria |
|---|---|---|
| 0. Accounts | Drive folder, Sheet (from template), service account, Vercel plan decision, domain | Repo can read the test sheet |
| 1. Foundation | Sheets/Drive repository, zod schemas, domain library, locale tests, CI (lint, typecheck, unit, build) | CI green; domain tests cover section 5 |
| 2. Public catalogue | Home, catalogue, Kerala, product page, search (text + voice), related items, quote basket | E2E green in 6 locales; Lighthouse target met |
| 3. Admin core | Sign-in, add product with photo, add lot + expenses, sales with FIFO, stock list | UAT tasks 1-3 completed by the family |
| 4. Insight | Reports (best/slow/rethink/reorder), overhead, profit | Reports match hand calculation on test data |
| 5. Quotes & WhatsApp | Quote records, printable quote, WhatsApp hand-offs | Quote flow works end to end on a phone |
| 6. Translation & launch | Glossary, native review, UAT, backups, launch | Sign-off by store owners |
| 7. Later | WhatsApp Cloud API, auto-translation, background removal, barcodes, multi-branch | Separate decision |

---

## 14. Risks and open issues

| Risk | Impact | Mitigation |
|---|---|---|
| **Vercel Hobby plan is for non-commercial use.** A shop selling products is commercial. | Terms breach / forced upgrade | Choose a plan that allows commercial use (Vercel Pro, or Cloudflare Pages / Netlify). Verify current terms before launch. |
| Sheets as database has no transactions | Rare double-sell | Optimistic re-read; single-writer per product; test; move to Postgres if volume grows |
| Sheets/Drive API quotas | Slow or failed pages | Caching, batching, retry with back-off |
| Voice accuracy in Indic languages | Search misses | Editable transcript, text fallback, alias list grows from real searches (log misses) |
| Translation quality | Customers see awkward text | Glossary first, native review, Draft flag |
| Uncle/Aunty adoption | Data not entered | Voice input, four-button home, UAT with them, phone-first layout, a "help" video in Malayalam |
| Connectivity in the shop | Lost entries | Offline queue, saved-state indicator |
| Customer phone data | Privacy | Admin-only, access control, deletion on request |
| Current codebase | Mock data, `Date.now()` IDs, no tests, manual `Lot_ID` on sales | Rebuild per this design (phases 1-3) |

---

## 15. Decisions needed from you

1. **Hosting:** Vercel Pro (simplest, paid) or Cloudflare Pages / Netlify (free for commercial use, a little more setup)?
2. **Admin sign-in:** Google account allowlist (recommended) or a 4-digit PIN for the shop tablet?
3. **WhatsApp to customers:** pre-filled links sent by the uncle (free, recommended to start) or the Business Cloud API (automatic, needs setup and may cost money)?
4. **Auto-translation:** on (MyMemory suggestions saved as Draft) or off (uncle and glossary only)?
5. **Phase order:** start with the admin (inventory and sales first, recommended) or with the public catalogue?
