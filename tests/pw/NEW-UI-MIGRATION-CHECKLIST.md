# New-UI migration checklist — legacy vendor dashboard → React SPA

**Generated:** 2026-08-14 · **Suite:** `tests/pw` on `develop` (dokan-lite @ `ef722e86f`, dokan-pro @ `b57f4e3c9` / 5.0.12)

This file is the running tracker for converting the legacy vendor-dashboard e2e specs to the React
vendor dashboard (`/dashboard/new/#/<route>`). It supersedes the branch-only `CONVERSION-LOG.md`
(last on `qa/new-ui-suite-wave-4`). The original audit and wave plan remain at
`~/.claude/skills/dokan-qa/automation-handoff/dokan-lite-new-ui-conversion-handoff.md`.

**Every test case of every in-scope spec is listed below** — including the ones that need no work —
so a case cannot be lost between waves. Tick a row when its React parity is green 3×.

## How to convert one spec

1. **Read the house style first:** `tests/e2e/NEW_UI_HOUSE_STYLE.md` (§1 self-containment, §5 list-ready contract).
2. **Folder shape (D1):** `tests/e2e/<feature>/new<Feature>.spec.ts` + `new<Feature>Page.ts`. Spec folders never import each other — only `@utils/*`.
3. **Reuse, do not re-derive:** `@utils/dataViews` (DataViews rows/tabs/filters/row-action menus, `waitForRootReady`, `waitForListReady`, `hasNoPhpFatal`), `@utils/authStates` (storage-state paths), `closeAnnouncementModal` from `@utils/helpers`.
4. **Selectors must be verified live** against the running site and the comment must cite the rendering component. Many legacy page objects are no-op stubs, so their "passing" cases prove nothing — porting means writing real assertions, not translating selectors.
5. **Seeding stays API/db-first** (`ApiUtils`, `payloads`, `dbUtils`). The React rewrite changed the driving surface, not the data layer. Keep the money oracle: `Order Total == Vendor earning + Admin commission`.
6. **Tags are a mandatory tuple:** `{ tag: ['@lite'|'@pro', '@vendor'|'@admin'|'@customer', '@new-ui'] }`. `@new-ui` is allowed **only** if the test navigates `/dashboard/new/#/` or asserts the SPA root mount.
7. **Gate:** green 3× (1 headed, 2 headless) against Docker `:9999` before the legacy block gets `test.describe.skip` with a comment naming its React replacement. Never skip admin/storefront cases along with the vendor ones.
8. **Then update `feature-map/feature-map.yml`** — add the byte-exact new test titles under the page entry's `vendor (new UI):` group (`false` only for a case that exists but is skipped).

Run just the converted suite: `npm run test:e2e:newui` (= `e2e_tests` project, grep `@new-ui`).

## Action vocabulary

| Action | Meaning |
|---|---|
| `PORT` | No React parity exists — write the React case in the target spec. |
| `PORT (un-skip)` | Same, and the legacy case is skipped, so the behaviour is unverified on **both** UIs. |
| `VERIFY-DEDUPE → RETIRE` | React parity looks complete — confirm the assertions carry over, then `describe.skip` the legacy case. |
| `DONE` | React parity exists and is running. |
| `RELABEL (D4)` | Case claims "(React)" but navigates a legacy URL. Repoint at the React route or delete it — a lying label hides a coverage hole. |
| `RETAG (@new-ui)` | Genuinely drives the React SPA but is missing the tag, so `test:e2e:newui` never runs it. |
| `MOVE (D1)` | Real React case sitting in a legacy folder — relocate into the `new*` spec. |
| `FIX` | Defect in the test itself (wrong surface). |
| `STAYS-LEGACY` | Surface has no React route — do not convert. |
| `out of scope` | Admin / storefront / customer case in a mixed file — unaffected by the vendor rewrite. |

## Live React vendor routes (verified 2026-08-14 against plugin source)

**Lite** (`dokan-lite/src/routing/routes.tsx`): `/products` · `/products/create` · `/products/:productId/edit` · `/orders` · `/withdraw` · `/withdraw-requests` · `/reverse-withdrawal`

**Pro** (25 injection points via `wp.hooks.applyFilters('dokan-dashboard-routes')`): `/coupons(+/create,/update/:id)` · `/seller-badge` · `/orders/new` · `/orders/edit/:id` · `/settings/seo` · `/settings/social` · `/settings/shipping(+/:zoneID,/settings,/:zoneID/table-rate|distance-rate/:instanceID)` · `/settings/verification` · `/settings/delivery-time` · `/settings/product-addon` · `/settings/shipstation` · `/announcement(+/:id,/create)` · `/reviews` · `/analytics` · `/auction` · `/auction-activity` · `/booking(+/calendar,/my-bookings,/resources)` · `/delivery-time-dashboard` · `/followers` · `/product-questions-answers(+/:questionId)` · `/requested-quotes` · `/return-request(+/:requestId)` · `/staffs(+/create,/permissions/:id,/update/:id)` · `/subscription(+/orders)` · `/support(+/:ticketId)` · `/user-subscription(+/:subscriptionId)` · `/vendor-support(+/:id)`

**Still legacy — do NOT convert:** vendor dashboard home + analytics *shell* (`?path=/analytics/...`) · Reports · Tools / import-export · Store settings · Payment settings · RMA settings · vendor inbox · SPMV · Printful · edit-account · registration / setup wizard · dashboard chrome & colors.

> `#/analytics` (React) and `?path=%2Fanalytics%2F…` (legacy shell) are **different surfaces**. The React one exists and is uncovered; the legacy one is what `dashboard.spec.ts` Test Cases 1-9 drive.

### Route accounting — all 52 vendor routes

Extracted from every pro file registering on `dokan-dashboard-routes` plus `dokan-lite/src/routing/routes.tsx`, then grepped against every spec and page object:

| | Count | |
|---|---|---|
| Navigated by at least one spec | 48 | covered |
| `settings/shipping/settings` (Shipping Policy) | 1 | covered indirectly — `newShipping.spec.ts` clicks through and asserts the `#/settings/shipping/settings` hash, so a literal-URL grep misses it |
| `analytics` · `orders/edit/:id` · `settings/delivery-time` | 3 | **no spec navigates them** — each has a row in the tables below |

So every vendor React route is either covered or tracked here. Route coverage is not the same as behavioural coverage: a route counts as "navigated" even if only a mount smoke touches it, which is exactly what the per-case tables below break down.

## Defects this audit found (fix these first — they are cheap and they hide coverage holes)

| # | Defect | Evidence | Fix |
|---|---|---|---|
| 1 | **`/reviews` is product reviews, and its only React coverage was misfiled** — the spec seeded via `createProductReview` and read `/dokan/v1/reviews`, yet was named, titled and foldered as *store* reviews, while `product-reviews/productReviews.spec.ts` sat unported. | `dokan-pro/src/features/reviews/index.tsx` registers `/reviews` on `dokan-dashboard-routes` (cap `dokan_view_review_menu`) | **PARTLY FIXED** — moved to `product-reviews/newProductReviews.spec.ts` with its page object, class, data const and the four mislabelled titles renamed; the 9 legacy moderation cases remain to port (tracked below) |
| 2 | ~~**D5 swapped subscription URLs are still swapped on `develop`.**~~ **FIXED** — URLs swapped in both specs and the misleading "targets the new React surfaces" comment above each block corrected. `vendorSubscriptions.spec.ts` (vendor packs) navigates `dashboard/user-subscription/`; `vendorProductSubscription.spec.ts` (product subscriptions) navigates `dashboard/subscription/`. | Both files, React "Test Case" blocks | Swap the two URLs. Wave 0 fixed this on the branch; the fix did not survive the merge |
| 3 | ~~**13 React auction cases never run in the new-UI mode.**~~ **FIXED** — all 13 now carry `@new-ui`. `product-form-manager/newProductFormAuction.spec.ts` drives the React product form but no case carries `@new-ui`. | `grep @new-ui newProductFormAuction.spec.ts` → 0 hits | Add the tag |
| 4 | **Genuine React cases missing `@new-ui`,** so `test:e2e:newui` never ran them: `withdraws` Test Cases 1-5, `reverse-withdraws` Test Cases 3-4, and the 4 `rank-math` cases that open the React editor. | each navigates `/dashboard/new/#/…` yet was untagged | **FIXED** — 11 tagged here, plus the 13 from defect 3 = 24 total. See the corrections note below: two `dashboard.spec.ts` cases first listed here are NOT React, and rank-math has 4 such cases, not 10 |
| 5 | ~~**The Wave 0 D6 retires never landed.**~~ **FIXED** — both files `describe.skip`ped with a comment naming the React spec that supersedes them. `social-linking/socialLinking.spec.ts` and `store-seo/storeSeo.spec.ts` are still active, still titled "(React)", still on the legacy settings URLs. | Both files, `test.describe('… (React) Tests')` | Retire — `newSocial` / `newStoreSeo` exceed them |
| 6 | ~~`NEW_UI_HOUSE_STYLE.md` was missing from `develop`~~ **FIXED in this pass** — restored from `qa/new-ui-suite-wave-4`, with a layout note reconciling its `new-<feature>/` folder paths against the co-located layout the merge produced. | five merged page objects cite it as normative | done |
| 7 | ~~**`rank-math` navigates a malformed hash**~~ **FIXED** — now `#/products/:id/edit`, matching every other spec. — `dashboard/new/#products/${productId}/edit` (missing the `/` after `#`). | `rankMathPage.ts` | Verify it still routes; fix to `#/products/…` |
| 8 | **Cases carrying no role tag,** so role-based greps miss them: 3 in `manual-order/manualOrder.spec.ts`. | extraction pass | **MOOT** — that spec is now retired (defect 11). The 2 cases flagged in `newVendorStaff.spec.ts` carry `@staff` deliberately and needed no fix |
| 9 | ~~**A hollow test reports green.**~~ **FIXED** — converted to `test.fixme` so it no longer counts as a pass. `coupons/newCoupons.spec.ts` → "vendor can create a fixed-cart-discount coupon (React)" has an empty body (`// Intentionally skipped — see note above`), because `fixed_cart` is not a creatable type in the React form. An empty body **passes**, so it inflates the pass count. | `newCoupons.spec.ts:129` | `test.fixme(...)` or delete it — the feature-map already records it as `false` |
| 10 | ~~**Orphan page object left by the merge.**~~ **FIXED** — `tests/e2e/new-seller-badge/` deleted. `tests/e2e/new-seller-badge/newSellerBadgePage.ts` is the only file in that folder, nothing imports it, and it differs from the live `seller-badges/newSellerBadgePage.ts`. | `grep -rl new-seller-badge` → no importers | Delete it — a stale second copy invites edits that change nothing |
| 11 | **An all-stub page object made three tests report green for nothing.** Every method in `manual-order/manualOrderPage.ts` is an empty no-op and `isAddNewOrderButtonVisible()` returns a hard `false`, so both admin cases asserted **nothing at all** and the vendor case always fell to a bare "Orders" text check. Found while fixing defect 8. | `manualOrderPage.ts` — 12 empty methods | **FIXED** — spec `describe.skip`ped; `newManualOrder.spec.ts` covers all three behaviours for real |

#### Two corrections to this table (found while fixing it)

- **Defect 4 was overstated.** `dashboard.spec.ts` "vendor lands on new dashboard React shell" and "…direct deep link" navigate `dashboard/?path=%2Fanalytics%2F…` — the LEGACY analytics shell, not the SPA — so they must NOT be tagged; they need retitling instead. And `rank-math` has 4 editor-driving cases, not 10; the other 6 vendor cases are REST-only. Only the genuinely-SPA cases were tagged: 13 auction + 4 rank-math + 5 withdraw + 2 reverse-withdraw = **24**.
- **Defect 8 was half wrong.** The two "untagged" cases in `newVendorStaff.spec.ts` carry `@staff`, a deliberate role tag for a staff user — nothing to fix. Only `manualOrder.spec.ts` genuinely lacked role tags, and that file is now retired (defect 11), so the tags are moot.

### Feature-map state (checked 2026-08-14)

`feature-map/feature-map.yml` was reconciled against the specs in this pass and is now **drift-free**: every `@new-ui` test on disk has a leaf, and every `(new UI)` leaf matches a test title byte-exactly (405 leaves ↔ 406 tagged tests; the 4-row difference is the announcements admin/customer cases that are deliberately untagged because they drive the wp-admin SPA).

Fixed in this pass: 33 missing leaves added (the `/dashboard/new/` shell cases, the in-file React smokes in `orders.spec.ts`, all 17 `addProduct.spec.ts` cases, `newWithdrawB15`, `productVariations`, `intelligence`); 1 renamed leaf (auction row-Edit now opens the React editor, not the legacy one); 1 superseded leaf replaced by the two `test.fixme` quick-create cases; 3 pseudo-rows in Reverse Withdrawal that carried an annotation instead of a test title turned into comments.

Three leaves read `false` while the test is not statically skipped — all three are correct and were left alone: two are runtime `test.skip(condition)` (WC-Blocks checkout recalculation, the blocked subscription-pack seeder) and the third is defect 9 above.

**Convention for this file going forward:** it records tests that exist. A migration that has not been written yet gets a row in *this checklist*, not a leaf in the feature map — add the leaves when the spec lands, using the byte-exact titles (` [lite]` suffix on `@lite` cases, `false` only for a case that exists but is skipped).

## Group 1 — Product editor & product list

### `tests/e2e/products-details/productsDetails.spec.ts` — 95 cases

**React route:** /products/:productId/edit  
**Target spec:** product-form-manager/newProductFormEdit.spec.ts (split a `newProductFormEditPro.spec.ts` for the @pro half)  
**Why:** The biggest single gap in the suite: 95 edit-form cases, only 10 React edit cases exist. Legacy page object is a real (de-stubbed) jQuery driver, so port = write React panel/DokanModal interactions, not selector translation.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | vendor can update product title | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can edit the product title on the edit form (React)". |
| ☐ | vendor can update product permalink | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product price | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set a product price on the edit form (React)". |
| ☑ | vendor can update product price | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set a product price on the edit form (React)". |
| ☐ | vendor can remove product price | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product discount price | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can add a discount sale price on the edit form (React)". |
| ☐ | vendor can add product discount price (with schedule) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product discount price | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product discount price (with schedule) | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can't add product discount price higher than price | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor cannot set a sale price above the regular price (React)". |
| ☐ | vendor can remove product discount price | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product discount schedule | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can update product category (single) | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can change the product category on the edit form (React)". |
| ☐ | vendor can add product category (multiple) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product category (multiple) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add multi-step product category (last category) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add multi-step product category (any category) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can't add multi-step product category (any category) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product tags | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product tags | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can create product tags | @pro @vendor | — | `PORT` |  |
| ☑ | vendor can add product cover image | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can add a feature image on the edit form (React)". |
| ☐ | vendor can update product cover image | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product cover image | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product gallery image | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product gallery image | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product gallery image | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product short description | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can edit the short and long descriptions on the edit form (React)". |
| ☐ | vendor can update product short description | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product short description | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can update product description | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can edit the short and long descriptions on the edit form (React)". |
| ☐ | vendor can add product downloadable options | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product downloadable options | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product downloadable file | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product virtual option | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can make a product virtual on the edit form (React)". |
| ☐ | vendor can remove product virtual option | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product inventory options (SKU) | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set the SKU on the edit form (React)" (add only; update/remove still PORT). |
| ☑ | vendor can update product inventory options (SKU) | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set the SKU on the edit form (React)" (add only; update/remove still PORT). |
| ☑ | vendor can remove product inventory options (SKU) | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set the SKU on the edit form (React)" (add only; update/remove still PORT). |
| ☐ | vendor can add product inventory options (stock status) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product inventory options (stock management) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product inventory options (stock management) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product inventory options (stock management) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product inventory options (allow single quantity) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product inventory options (allow single quantity) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product other options (product status) | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can add product other options (visibility) | @lite @vendor | — | `DONE` | newProductFormEdit — "vendor can set catalog visibility to hidden on the edit form (React)". |
| ☐ | vendor can add product other options (purchase note) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can update product other options (purchase note) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product other options (purchase note) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product other options (product review) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product other options (product review) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product catalog mode | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product catalog mode (with price hidden) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product catalog mode | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can remove product catalog mode (price hidden option) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product tax | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product tax (with tax class) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product linked products (up-sells) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product linked products (cross-sells) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product linked products (up-sells) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product linked products (cross-sells) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can't add already added product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can create product attribute term | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product attribute term | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product bulk discount options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update product bulk discount options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product bulk discount options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product EU compliance data | @pro @vendor | `test.skip` | `PORT (un-skip)` | B22. Legacy case is `.skip`; port to the React EU fields on the edit form. |
| ☐ | vendor can update product EU compliance data | @pro @vendor | `test.skip` | `PORT (un-skip)` | B22. Legacy case is `.skip`; port to the React EU fields on the edit form. |
| ☐ | vendor can remove product EU compliance data | @pro @vendor | `test.skip` | `PORT (un-skip)` | B22. Legacy case is `.skip`; port to the React EU fields on the edit form. |
| ☐ | vendor can add product addon | @pro @vendor | — | `PORT` | Per-product addons. newProductAddons covers the GLOBAL addon list only. |
| ☐ | vendor can import product addon | @pro @vendor | — | `PORT` | Per-product addons. newProductAddons covers the GLOBAL addon list only. |
| ☐ | vendor can export product addon | @pro @vendor | — | `PORT` | Per-product addons. newProductAddons covers the GLOBAL addon list only. |
| ☐ | vendor can remove product addon | @pro @vendor | — | `PORT` | Per-product addons. newProductAddons covers the GLOBAL addon list only. |
| ☐ | vendor can add product rma options (no warranty) | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can override the default RMA settings" covers the override toggle — port the 4 warranty variants. |
| ☐ | vendor can add product rma options (warranty included limited) | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can override the default RMA settings" covers the override toggle — port the 4 warranty variants. |
| ☐ | vendor can add product rma options (warranty included lifetime) | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can override the default RMA settings" covers the override toggle — port the 4 warranty variants. |
| ☐ | vendor can add product rma options (warranty as addon) | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can override the default RMA settings" covers the override toggle — port the 4 warranty variants. |
| ☐ | vendor can remove product rma options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can override the default RMA settings" covers the override toggle — port the 4 warranty variants. |
| ☐ | vendor can add product wholesale options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can enable wholesale" + newProductFormWholesale (2) cover enable/persist — port only update + remove. |
| ☐ | vendor can update product wholesale options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can enable wholesale" + newProductFormWholesale (2) cover enable/persist — port only update + remove. |
| ☐ | vendor can remove product wholesale options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormAdvanced "vendor can enable wholesale" + newProductFormWholesale (2) cover enable/persist — port only update + remove. |
| ☐ | vendor can add product min-max options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormValidation "accepts a valid min/max quantity range" covers the happy path — port update/remove/limit-guard. |
| ☐ | vendor can update product min-max options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormValidation "accepts a valid min/max quantity range" covers the happy path — port update/remove/limit-guard. |
| ☐ | vendor can't add product min limit grater than max limit | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormValidation "accepts a valid min/max quantity range" covers the happy path — port update/remove/limit-guard. |
| ☐ | vendor can remove product min-max options | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductFormValidation "accepts a valid min/max quantity range" covers the happy path — port update/remove/limit-guard. |

_95 rows = 95 `test(` calls in the file._ DONE: 14 · PORT: 66 · PORT (un-skip): 3 · VERIFY-DEDUPE → RETIRE: 12

### `tests/e2e/products-details-auction/productsDetailsAuction.spec.ts` — 50 cases

**React route:** /products/:productId/edit (Auction Options card)  
**Target spec:** product-form-manager/newProductFormAuction.spec.ts  
**Why:** RE-CLASSIFIED 2026-08-14. The July audit called the auction editor "legacy only". It is not: newProductFormAuction.spec.ts already creates, validates and re-opens auction products in the React form (`setProductType('auction')`, auction round-trip). This 50-case legacy matrix drives `/dashboard/auction/?product_id=<id>&action=edit` and is now portable. VERIFY each field exists on the React Auction Options card before porting it.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | vendor can update auction product title | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product category (single) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product category (multiple) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product category (multiple) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add multi-step auction product category (last category) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add multi-step auction product category (any category) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can't add multi-step product category (any category) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product tags | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product tags | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can create auction product tags | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product cover image | @pro @vendor | `test.skip` | `PORT` |  |
| ☐ | vendor can update auction product cover image | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product cover image | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product gallery image | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product gallery image | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product gallery image | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product short description | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product short description | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product short description | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product description | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product downloadable options | @pro @vendor | `test.skip` | `PORT` |  |
| ☐ | vendor can update auction product downloadable options | @pro @vendor | `test.skip` | `PORT` |  |
| ☐ | vendor can remove auction product downloadable file | @pro @vendor | `test.skip` | `PORT` |  |
| ☐ | vendor can add product virtual option | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product virtual option | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update product general options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can enable product relist options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update product relist options | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product inventory options (SKU) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product inventory options (SKU) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product inventory options (SKU) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product other options (product status) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product other options (visibility) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product shipping | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product tax | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product tax (with tax class) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can't add already added auction product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can create auction product attribute term | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product attribute | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product attribute term | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add auction product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can update auction product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product geolocation (individual) | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can import auction product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can export auction product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove auction product addon | @pro @vendor | — | `PORT` |  |

_50 rows = 50 `test(` calls in the file._ PORT: 50

### `tests/e2e/products-details-bookings/productsDetailsBookings.spec.ts` — 2 cases

**React route:** /products/create + /booking  
**Target spec:** vendor-booking/newBooking.spec.ts  
**Why:** A1 in the July audit. VERIFY FIRST: the React product form has no booking product type today (no booking reference in newProductFormPage.ts). If the React form cannot create a bookable product, this stays legacy and only the delete leg ports.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Vendor can add a virtual booking product | @pro @vendor @booking-product @bookingProduct-001 | — | `PORT` |  |
| ☐ | Delete the Booking Virtual Product from Vendor | @pro @vendor @booking-product @bookingProduct-002 | — | `PORT` |  |

_2 rows = 2 `test(` calls in the file._ PORT: 2

### `tests/e2e/products/products.spec.ts` — 33 cases

**React route:** /products  
**Target spec:** products/newProducts.spec.ts (+ newProductsProActions)  
**Why:** List surface is largely converted (29 + 3 React cases). The remaining gap is product-type creation and the Tools-backed import/export.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can add product category | @lite @admin | — | `out of scope` |  |
| ☑ | admin can add product attribute | @lite @admin | — | `out of scope` |  |
| ☑ | admin can add simple product | @lite @admin | — | `out of scope` |  |
| ☑ | admin can add variable product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add simple subscription product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add variable subscription product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add external product | @lite @admin | — | `out of scope` |  |
| ☑ | admin can add vendor subscription | @pro @admin | — | `out of scope` |  |
| ☑ | vendor can view product menu page | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can view add new product page | @lite @vendor | — | `DONE` | newProductForm / newProductFormTypes cover the create form and simple/virtual/downloadable. |
| ☑ | vendor can add simple product | @lite @vendor | — | `DONE` | newProductForm / newProductFormTypes cover the create form and simple/virtual/downloadable. |
| ☐ | vendor can add variable product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add simple subscription product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add variable subscription product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add external product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add group product | @pro @vendor | — | `PORT` |  |
| ☑ | vendor can add downloadable product | @lite @vendor | — | `DONE` | newProductForm / newProductFormTypes cover the create form and simple/virtual/downloadable. |
| ☑ | vendor can add virtual product | @lite @vendor | — | `DONE` | newProductForm / newProductFormTypes cover the create form and simple/virtual/downloadable. |
| ☑ | vendor can search product | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can filter products by date | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can filter products by category | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can filter products by type | @pro @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can filter products by other | @pro @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can reset filter | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☐ | vendor can import products | @pro @vendor | — | `STAYS-LEGACY` | Import/export lives on the legacy Tools page — no React route. |
| ☐ | vendor can export products | @pro @vendor | — | `STAYS-LEGACY` | Import/export lives on the legacy Tools page — no React route. |
| ☑ | vendor can duplicate product | @pro @vendor | — | `DONE` | products/newProductsProActions.spec.ts covers duplicate + quick-edit. |
| ☑ | vendor can permanently delete product | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can view product | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can't add product without required fields | @lite @vendor | `test.skip` | `DONE` | newProductFormValidation covers empty title/price/description/category. |
| ☐ | vendor can't buy own product | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can edit product | @lite @vendor | — | `DONE` | products/newProducts.spec.ts covers list render, search, funnel filters, reset and delete. |
| ☑ | vendor can quick edit product | @pro @vendor | — | `DONE` | products/newProductsProActions.spec.ts covers duplicate + quick-edit. |

_33 rows = 33 `test(` calls in the file._ out of scope: 8 · DONE: 17 · PORT: 6 · STAYS-LEGACY: 2

### `tests/e2e/vendor-products/addProduct.spec.ts` — 18 cases

**React route:** /products/create  
**Target spec:** (already React) — fold into products/ per D1  
**Why:** 17 of 18 cases are already `@new-ui`. Only the folder shape is off-style.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | Test Case 1 - Vendor Product List Page Renders (React or legacy) | @lite @vendor | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 1 - React product list mounts at /dashboard/new/#/products | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 2 - Add new product CTA is reachable | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 3 - Product list renders rows or empty state | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 4 - Search filter narrows the list to zero rows for a non-existent product | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 5 - Row actions menu exposes Edit, Quick view, and Delete | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 6 - Quick view action opens the QuickViewModal | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 7 - Cancel delete keeps the row visible | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 8 - Page renders without PHP fatal | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 9 - Vendor announcement modal does not block list mount | @pro @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 10 - Direct deep link to /products works (HashRouter survives reload) | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 1 - Editor mounts at /products/create | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 2 - Editor renders without PHP fatal | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 3 - Editor exposes a Save / Update affordance | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 4 - Editor shows a name / title field | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 5 - Edit non-existent product shows an error / empty state | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 6 - Vendor announcement modal does not block editor mount | @pro @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |
| ☑ | Test Case 7 - Reload preserves /products/create route | @lite @vendor @new-ui | — | `DONE` | Already drives the React create form; D1 move is cosmetic. |

_18 rows = 18 `test(` calls in the file._ DONE: 18

### `tests/e2e/product-variations/productVariations.spec.ts` — 2 cases

**React route:** /products/create  
**Target spec:** product-form-manager/ (D2 fold)  
**Why:** Both cases already `@new-ui`.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | Test Case 1 - Page renders without fatal | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | Test Case 2 - Page renders content | @pro @vendor @new-ui | — | `DONE` |  |

_2 rows = 2 `test(` calls in the file._ DONE: 2

### `tests/e2e/product-bulk-edit/productBulkEdit.spec.ts` — 2 cases

**React route:** /products  
**Target spec:** products/newProductsProActions.spec.ts  
**Why:** Both "Test Case" smokes navigate the LEGACY `dashboard/products/` URL while claiming React.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | — | `RELABEL (D4)` | Legacy URL. Quick-edit parity already lives in newProductsProActions — retire after verifying. |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy URL. Quick-edit parity already lives in newProductsProActions — retire after verifying. |

_2 rows = 2 `test(` calls in the file._ RELABEL (D4): 2

### `tests/e2e/product-form-manager/newProductFormAuction.spec.ts` — 13 cases

**React route:** /products/create (Auction)  
**Target spec:** (same file)  
**Why:** FIXED 2026-08-14 — all 13 cases now carry `@new-ui`, so they run in `npm run test:e2e:newui`. They prove the React form creates, validates and re-opens auction products.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | offers Simple, Variable, External/Affiliate and Group types | @lite @vendor @new-ui | — | `DONE` |  |
| ☑ | offers the Auction type when the auction module is active | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | selecting Simple keeps the native price field | @lite @vendor @new-ui | — | `DONE` |  |
| ☑ | selecting Auction swaps the native price for the Auction Options card | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | renders every Auction Options field when the auction type is chosen | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can create an auction with the required fields | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can create an auction with every option filled | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | hides unrelated fields for the auction type | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | keeps the allow-listed fields for the auction type | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | reloads saved auction values when the product is re-opened | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | blocks save when the start price is missing | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | blocks save when the bid increment is missing | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | rejects an end date that is not after the start date | @pro @vendor @new-ui | — | `DONE` |  |

_13 rows = 13 `test(` calls in the file._ DONE: 13

### `tests/e2e/rank-math/rankMath.spec.ts` — 16 cases

**React route:** /products/:id/edit  
**Target spec:** (same file)  
**Why:** FIXED 2026-08-14 — the page object now uses the canonical `#/products/:id/edit`, and the FOUR cases that actually open the React editor carry `@new-ui`. CORRECTION: the defect table first claimed all 10 vendor cases drive the editor; only 4 do, the rest are REST-only.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable Rank Math SEO module | @pro @admin | — | `out of scope` |  |
| ☑ | vendor product editor renders without fatal error | @pro @vendor @new-ui | — | `DONE` | Opens the React editor; tagged `@new-ui`. |
| ☑ | vendor sees the Rank Math SEO card on the product editor | @pro @vendor @new-ui | — | `DONE` | Opens the React editor; tagged `@new-ui`. |
| ☑ | vendor sees the Rank Math SEO fields rendered in the panel | @pro @vendor @new-ui | — | `DONE` | Opens the React editor; tagged `@new-ui`. |
| ☑ | vendor can store the current editable post id | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |
| ☑ | admin can store the current editable post id | @pro @admin | — | `out of scope` |  |
| ☑ | vendor can read the rank math editor data for own product | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |
| ☑ | admin can read the rank math editor data | @pro @admin | — | `out of scope` |  |
| ☑ | store-current-editable-post rejects a non-existent product | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |
| ☑ | editor-data rejects a non-existent product | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |
| ☑ | Rank Math SEO section is absent when the module is disabled | @pro @vendor @new-ui | — | `DONE` | Opens the React editor; tagged `@new-ui`. |
| ☑ | guest cannot store the current editable post id | @pro @guest | — | `out of scope` |  |
| ☑ | guest cannot read the rank math editor data | @pro @guest | — | `out of scope` |  |
| ☑ | customer cannot store the current editable post id | @pro @customer | — | `out of scope` |  |
| ☑ | a vendor cannot store the editable post id for another vendor product | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |
| ☑ | a vendor cannot read editor data for another vendor product | @pro @vendor | — | `out of scope` | REST-only case — no React surface involved. |

_16 rows = 16 `test(` calls in the file._ out of scope: 12 · DONE: 4

### `tests/e2e/wholesale/wholesale.spec.ts` — 20 cases

**React route:** /products/create  
**Target spec:** product-form-manager/newProductFormWholesale.spec.ts  
**Why:** Single vendor case, `.skip`ped.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable wholesale module | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can view wholesale customers menu page | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can search wholesale customer | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can disable customer's wholesale capability | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can enable customer's wholesale capability | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can edit wholesale customer | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can view wholesale customer orders | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can delete wholesale customer | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can perform bulk action on wholesale customers | @pro @admin | `describe.skip` | `out of scope` |  |
| ☑ | customer can become a wholesale customer | @pro @customer | `describe.skip` | `out of scope` |  |
| ☑ | customer can request for become a wholesale customer | @pro @customer | `describe.skip` | `out of scope` |  |
| ☐ | vendor can create wholesale product | @pro @vendor | `test.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | all users can see wholesale price | @pro @customer | — | `out of scope` |  |
| ☑ | customer (wholesale) can only see wholesale price | @pro @customer | — | `out of scope` |  |
| ☑ | customer can see wholesale price on shop archive | @pro @admin | — | `out of scope` |  |
| ☑ | customer can't see wholesale price on shop archive | @pro @admin | — | `out of scope` |  |
| ☑ | customer (wholesale) can buy wholesale product | @pro @customer | — | `out of scope` |  |
| ☑ | admin can disable wholesale module | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 1 - Admin wholesale customer page renders | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 2 - Wholesale page renders content | @pro @admin | — | `out of scope` |  |

_20 rows = 20 `test(` calls in the file._ out of scope: 19 · VERIFY-DEDUPE → RETIRE: 1

### `tests/e2e/eu-compliance/euCompliance.spec.ts` — 21 cases

**React route:** — (store settings has no React route)  
**Target spec:** (product EU fields tracked under productsDetails)  
**Why:** The 3 vendor cases are store-settings/registration EU data, not product EU data.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable EU compliance fields module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable EU compliance fields for vendors | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable EU compliance fields on vendor registration | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable EU compliance fields for customers | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable germanized support for vendors | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable override invoice number permission for vendors | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add EU compliance data while adding a vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add EU compliance data on user profile (customer) edit | @pro @admin | — | `out of scope` |  |
| ☑ | admin can update EU compliance data on user profile (customer) edit | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add EU compliance data on user profile (vendor) edit | @pro @admin | — | `out of scope` |  |
| ☑ | admin can update EU compliance data on user profile (vendor) edit | @pro @admin | — | `out of scope` |  |
| ☑ | admin can update update EU compliance data on vendor profile edit | @pro @admin | — | `out of scope` |  |
| ☑ | admin can hide vendors EU compliance data from single store page | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can add EU compliance data on store settings | @pro @vendor | — | `STAYS-LEGACY` |  |
| ☐ | vendor can add EU compliance data on registration | @pro @vendor | — | `STAYS-LEGACY` |  |
| ☐ | vendor can update EU compliance data | @pro @vendor | — | `STAYS-LEGACY` |  |
| ☑ | customer can add EU Compliance data on billing address | @pro @customer | — | `out of scope` |  |
| ☑ | customer can update EU compliance data | @pro @customer | — | `out of scope` |  |
| ☑ | customer can add EU compliance data (vendor) while become a vendor | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view vendor EU compliance data on single store page | @pro @customer | — | `out of scope` |  |
| ☑ | admin can disable EU compliance fields module | @pro @admin | — | `out of scope` |  |

_21 rows = 21 `test(` calls in the file._ out of scope: 18 · STAYS-LEGACY: 3

### `tests/e2e/product-reviews/productReviews.spec.ts` — 13 cases

**React route:** /reviews  
**Target spec:** product-reviews/newProductReviews.spec.ts (moved here 2026-08-14)  
**Why:** NEW FINDING (not in the July audit). Pro registers `/reviews` on `dokan-dashboard-routes` (cap `dokan_view_review_menu`) and it lists PRODUCT reviews. The only React coverage of it lives in `store-reviews/newStoreReviews.spec.ts`, which is misnamed — its own page object says the surface lists product reviews and it seeds via `createProductReview`. The 9 behavioural moderation cases here are unported.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | vendor can view product reviews menu page | @pro @vendor | — | `DONE` | newStoreReviews "vendor reviews page renders with the four status tabs (React)". |
| ☐ | vendor can view product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can unApprove product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can spam product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can trash product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can approve product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can restore trashed product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can permanently-delete product review | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can perform bulk action on product reviews | @pro @vendor @serial | — | `PORT` |  |
| ☐ | Test Case 1 - Reviews page renders | @pro @vendor | — | `RELABEL (D4)` | Smoke claims React but navigates legacy `dashboard/reviews/`. Superseded by newStoreReviews list coverage. |
| ☐ | Test Case 2 - Reviews DataViews table or empty state renders | @pro @vendor | — | `RELABEL (D4)` | Smoke claims React but navigates legacy `dashboard/reviews/`. Superseded by newStoreReviews list coverage. |
| ☐ | Test Case 3 - Reviews page has heading | @pro @vendor | — | `RELABEL (D4)` | Smoke claims React but navigates legacy `dashboard/reviews/`. Superseded by newStoreReviews list coverage. |
| ☐ | Test Case 4 - Page survives reload | @pro @vendor | — | `RELABEL (D4)` | Smoke claims React but navigates legacy `dashboard/reviews/`. Superseded by newStoreReviews list coverage. |

_13 rows = 13 `test(` calls in the file._ DONE: 1 · PORT: 8 · RELABEL (D4): 4

## Group 2 — Orders, refunds, withdraw

### `tests/e2e/orders/orders.spec.ts` — 23 cases

**React route:** /orders, /orders/edit/:id  
**Target spec:** orders/newOrders.spec.ts + newOrdersGaps.spec.ts  
**Why:** List surface converted. The gap is order DETAILS (notes, tracking, shipment, downloadable permissions) and export — plus C2, the `/orders/edit/:id` route that has zero references suite-wide.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | vendor can view order menu page | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☐ | vendor can export all orders | @lite @vendor | — | `PORT` | newOrders only opens the Export dropdown; no download is asserted. |
| ☐ | vendor can export filtered orders | @lite @vendor | — | `PORT` | newOrders only opens the Export dropdown; no download is asserted. |
| ☑ | vendor can search order | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☑ | vendor can filter orders by customer | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☑ | vendor can filter orders by date range | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☑ | vendor can view order details | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☑ | vendor can update order status on order table | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☐ | vendor can update order status on order details | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add order note | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add private order note | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add tracking details to order | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can add shipment to order | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add downloadable product permission to order | @lite @vendor | — | `PORT` |  |
| ☑ | vendor can perform bulk action on orders | @lite @vendor | — | `DONE` | newOrders.spec.ts covers list, search, customer/date funnel filters, row-action status change and bulk status. |
| ☐ | vendor order list page renders (React or legacy) | @lite @vendor | — | `RELABEL (D4)` | Dual-path assertion — passes on either UI, so it proves nothing about the React list. |
| ☐ | Test Case 1 - React order list mounts at /dashboard/new/#/orders | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 2 - Order list renders rows or an empty-state banner | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 3 - Search filter narrows the list to zero rows for nonsense query | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 4 - Row actions menu exposes View and at least one status-change action | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 5 - Page renders without a PHP fatal | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 6 - Vendor announcement modal does not block list mount | @pro @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |
| ☐ | Test Case 7 - Direct deep link to /orders works (HashRouter survives reload) | @lite @vendor @new-ui | — | `MOVE (D1)` | Already `@new-ui`; D1 says these belong inside newOrders.spec.ts. Dedupe before moving. |

_23 rows = 23 `test(` calls in the file._ DONE: 7 · PORT: 8 · RELABEL (D4): 1 · MOVE (D1): 7

### `tests/e2e/refunds/refunds.spec.ts` — 10 cases

**React route:** /orders/edit/:id (refund modal)  
**Target spec:** orders/newOrders.spec.ts  
**Why:** B20. Both vendor cases drive the legacy order-details refund form.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can view refunds menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search refund requests by order-id | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search refund requests by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can approve refund request | @pro @admin | — | `out of scope` |  |
| ☑ | admin can cancel refund requests | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on refund requests | @pro @admin @serial | — | `out of scope` |  |
| ☐ | vendor can full refund | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can partial refund | @pro @vendor | — | `PORT` |  |
| ☑ | Test Case 1 - Refunds page renders | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 2 - Refunds page renders content | @pro @admin | — | `out of scope` |  |

_10 rows = 10 `test(` calls in the file._ out of scope: 8 · PORT: 2

### `tests/e2e/manual-order/manualOrder.spec.ts` — 3 cases

**React route:** /orders/new  
**Target spec:** manual-order/newManualOrder.spec.ts  
**Why:** RETIRED 2026-08-14 (defect 11). `manualOrderPage.ts` is an all-stub page object — every method is an empty no-op and `isAddNewOrderButtonVisible()` returns a hard `false`, so the two admin cases asserted NOTHING and still reported green. newManualOrder covers all three behaviours for real.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Admin Can Enable Vendor Order Creation in Global Settings @pro | _(untagged)_ | — | `RETIRED ✔` |  |
| ☐ | Vendor Can Create Manual Order @pro | _(untagged)_ | — | `RETIRED ✔` |  |
| ☐ | Admin Can Disable Vendor Order Creation in Global Settings @pro | _(untagged)_ | — | `RETIRED ✔` |  |

_3 rows = 3 `test(` calls in the file._ RETIRED ✔: 3

### `tests/e2e/manual-order-pro/manualOrderPro.spec.ts` — 2 cases

**React route:** /orders/new  
**Target spec:** manual-order/newManualOrder.spec.ts  
**Why:** Both smokes navigate legacy `dashboard/orders/?manual_order=1`.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | — | `RELABEL (D4)` |  |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` |  |

_2 rows = 2 `test(` calls in the file._ RELABEL (D4): 2

### `tests/e2e/withdraws/withdraws.spec.ts` — 24 cases

**React route:** /withdraw, /withdraw-requests  
**Target spec:** withdraws/newWithdraw.spec.ts + newWithdrawB15.spec.ts  
**Why:** Legacy block is `describe.skip`ped and fully superseded (12 + 2 React cases). The five "Test Case" smokes DO drive `/dashboard/new/#/...` but carry no `@new-ui` tag.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can view withdraw menu page | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can filter withdrawal requests by pending status | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can filter withdrawal requests by approved status | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can filter withdrawal requests by cancelled status | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can filter withdrawal requests by vendor | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can filter withdrawal requests by payment methods | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can export withdrawal requests | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can add note to withdrawal request | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can approve withdrawal request | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can cancel withdrawal request | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can delete withdrawal request | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | admin can perform bulk action on withdrawal requests | @lite @admin | `describe.skip` | `out of scope` |  |
| ☑ | vendor can view withdraw menu page | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can view withdrawal requests page | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can send withdrawal request | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can't send withdrawal request when pending request exists | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can cancel withdrawal request | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can add auto withdraw disbursement schedule | @pro @vendor | `describe.skip` | `DONE` |  |
| ☑ | vendor can add default withdraw payment methods | @lite @vendor | `describe.skip` | `DONE` |  |
| ☑ | Test Case 1 - /withdraw route mounts | @lite @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — tagged `@new-ui`; still a candidate to fold into newWithdraw (D1). |
| ☑ | Test Case 2 - /withdraw-requests route mounts | @lite @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — tagged `@new-ui`; still a candidate to fold into newWithdraw (D1). |
| ☑ | Test Case 3 - Withdraw page shows balance widget | @lite @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — tagged `@new-ui`; still a candidate to fold into newWithdraw (D1). |
| ☑ | Test Case 4 - HashRouter survives reload on /withdraw | @lite @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — tagged `@new-ui`; still a candidate to fold into newWithdraw (D1). |
| ☑ | Test Case 5 - Reverse-withdrawal route mounts | @pro @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — tagged `@new-ui`; still a candidate to fold into newWithdraw (D1). |

_24 rows = 24 `test(` calls in the file._ out of scope: 12 · DONE: 12

### `tests/e2e/reverse-withdraws/reverseWithdraws.spec.ts` — 17 cases

**React route:** /reverse-withdrawal  
**Target spec:** reverse-withdraws/newReverseWithdraw.spec.ts  
**Why:** B16. The React spec covers the widget, the transactions table and filters only — every behavioural consequence of a reverse-withdrawal rule is still legacy-only.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can view reverse withdrawal menu page | @lite @admin | — | `out of scope` |  |
| ☑ | admin can filter reverse withdrawal by store | @lite @admin | `test.skip` | `out of scope` |  |
| ☑ | admin can clear reverse withdrawal filters | @lite @admin | `test.skip` | `out of scope` |  |
| ☑ | admin can add reverse withdrawal | @lite @admin | — | `out of scope` |  |
| ☑ | vendor can view reverse withdrawal menu page | @lite @vendor | — | `DONE` | newReverseWithdraw "vendor can view reverse withdrawal menu page (React)". |
| ☐ | vendor can view reverse withdrawal notice (In grace period) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can view reverse withdrawal notice (after grace period) | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can view reverse withdrawal announcement | @pro @vendor | — | `PORT` |  |
| ☑ | vendor can filter reverse withdrawals by date | @lite @vendor | — | `DONE` | newReverseWithdraw filter-control cases cover the funnel. |
| ☐ | vendor status is inactive when reverse withdrawal rule applied | @lite @vendor | — | `PORT` |  |
| ☐ | vendor withdraw menu is hidden when reverse withdrawal rule applied | @lite @vendor | — | `PORT` |  |
| ☐ | vendor products in catalog mode when reverse withdrawal rule applied | @lite @vendor | — | `PORT` |  |
| ☐ | vendor can pay reverse withdrawal balance | @lite @vendor | — | `PORT` |  |
| ☑ | Test Case 1 - Admin /reverse-withdrawal route mounts | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 2 - Admin reverse-withdrawal shows transactions or empty state | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 3 - Vendor /reverse-withdrawal route mounts in new dashboard | @pro @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — TC3/TC4 tagged `@new-ui`. TC1/TC2 in this file drive the ADMIN SPA and correctly stay untagged. |
| ☑ | Test Case 4 - Vendor reverse-withdrawal page shows balance widget | @pro @vendor @new-ui | — | `DONE` | FIXED 2026-08-14 — TC3/TC4 tagged `@new-ui`. TC1/TC2 in this file drive the ADMIN SPA and correctly stay untagged. |

_17 rows = 17 `test(` calls in the file._ out of scope: 6 · DONE: 4 · PORT: 7

### `tests/e2e/dokan-invoice/dokanInvoice.spec.ts` — 26 cases

**React route:** /orders  
**Target spec:** (same file)  
**Why:** Five cases already `@new-ui` against `dashboard/new/#orders`; the rest are wp-admin/my-account/PDF-plugin surfaces.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | HP-customer-1 - customer sees Invoice button on at least one order row | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | HP-customer-2 - Invoice button URL returns a real PDF for the customer | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | HP-customer-3 - PDF body contains vendor1 store name (dokan-invoice shop_name rewrite) | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | HP-admin-1 - admin clicks "Invoice" button on order edit → PDF downloads | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | HP-admin-2 - admin clicks "Packing slip" button → PDF downloads | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | HP-admin-3 - completed order admin invoice still downloads | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | HP-vendor-1 - vendor /dashboard/orders renders WITHOUT a 5xx | @pro @vendor @invoice | — | `DONE` |  |
| ☑ | HP-vendor-2 - vendor REST exposes actions.invoice.url for their own order | @pro @vendor @invoice | — | `DONE` |  |
| ☑ | Body-1 - HTML preview contains the order id | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | Body-2 - HTML preview shop block carries vendor1 store name AND city (proves shop_name + shop_address filters) | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | Body-3 - HTML preview contains customer1 billing details | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | REST-1 - actions.invoice.url is well-formed and matches order | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | REST-2 - actions.packing-slip.url present when document is enabled | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | Lifecycle-1 - customer URL works for a completed order | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | Lifecycle-2 - URL stays valid across processing → completed transition | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | Asset-1 - dokan-invoice CSS bundle is enqueued on customer My Account | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | Asset-2 - dokan-invoice JS bundle is enqueued on customer pages | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | EC-customer2-cannot-access-customer1-invoice | @pro @customer @invoice | — | `out of scope` |  |
| ☑ | EC-vendor-cannot-access-other-vendor-order | @pro @vendor @invoice | — | `DONE` |  |
| ☑ | EC-guest-cannot-access-invoice | @pro @guest @invoice | — | `out of scope` |  |
| ☑ | TC-activation - dokan-invoice plugin row shows Active after wp-admin/plugins.php render | @pro @admin @invoice | — | `out of scope` |  |
| ☑ | NewDash-1 - dashboard renders an orders DataView with rows | @pro @vendor @invoice @new-ui | — | `DONE` |  |
| ☑ | NewDash-2 - row action menu contains "View Invoice" AND "View Packing Slip" | @pro @vendor @invoice @new-ui | — | `DONE` |  |
| ☑ | NewDash-3 - clicking "View Invoice" calls window.open with the WC PDF URL | @pro @vendor @invoice @new-ui | — | `DONE` |  |
| ☑ | NewDash-4 - clicking "View Packing Slip" calls window.open with the packing-slip URL | @pro @vendor @invoice @new-ui | — | `DONE` |  |
| ☑ | NewDash-5 - the URL window.open is given actually serves a real PDF | @pro @vendor @invoice @new-ui | — | `DONE` |  |

_26 rows = 26 `test(` calls in the file._ out of scope: 18 · DONE: 8

## Group 3 — Vendor dashboard shell & analytics

### `tests/e2e/dashboard/dashboard.spec.ts` — 24 cases

**React route:** #/analytics (vendor SPA)  
**Target spec:** new analytics coverage (net-new)  
**Why:** NEW FINDING. Test Cases 1-9 drive the LEGACY analytics shell (`dashboard/?path=%2Fanalytics%2FOverview`). Pro's vendor-analytics module registers `path: 'analytics'` on `dokan-dashboard-routes`, i.e. a real SPA route — and nothing in the suite navigates `#/analytics`.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can view Dokan dashboard | @lite @admin | — | `out of scope` |  |
| ☐ | vendor can view vendor dashboard | @lite @vendor | — | `PORT` |  |
| ☐ | vendor lands on new dashboard React shell (Analytics Overview) | @pro @vendor | — | `RELABEL (D4)` | CORRECTION 2026-08-14: despite the title these navigate `dashboard/?path=%2Fanalytics%2F…`, the LEGACY shell — NOT the SPA. Deliberately left untagged; retitle instead. |
| ☐ | vendor new dashboard does not error on direct deep link | @pro @vendor | — | `RELABEL (D4)` | CORRECTION 2026-08-14: despite the title these navigate `dashboard/?path=%2Fanalytics%2F…`, the LEGACY shell — NOT the SPA. Deliberately left untagged; retitle instead. |
| ☐ | Test Case 1 - Analytics Overview route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 2 - Analytics Stock route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 3 - Analytics Orders route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 4 - Analytics Revenue route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 5 - Analytics Products route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 6 - Analytics Statement route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 7 - Analytics Variations route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 8 - Analytics Categories route mounts | @pro @vendor | — | `PORT` |  |
| ☐ | Test Case 9 - Analytics deep link survives reload | @pro @vendor | — | `PORT` |  |
| ☑ | Test Case 10 - New full-width dashboard root mounts | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 11 - New dashboard /products route mounts | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 12 - New dashboard /products/create route mounts (product editor) | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 13 - New dashboard /orders route mounts | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 14 - New dashboard /withdraw route mounts | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 15 - New dashboard /withdraw-requests route mounts | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 16 - New dashboard /reverse-withdrawal route mounts | @pro @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 17 - HashRouter survives full reload | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 18 - Vendor announcement modal does not block dashboard mount | @pro @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |
| ☑ | Test Case 19 - Customer cannot reach the new vendor dashboard | @pro @customer @new-ui | — | `out of scope` |  |
| ☑ | Test Case 20 - Unknown HashRouter route does not crash the shell | @lite @vendor @new-ui | — | `DONE` | Already `@new-ui`; covers the `/dashboard/new/` shell + lite routes. |

_24 rows = 24 `test(` calls in the file._ out of scope: 2 · PORT: 10 · RELABEL (D4): 2 · DONE: 10

### `tests/e2e/vendor-analytics/vendorAnalytics.spec.ts` — 5 cases

**React route:** #/analytics  
**Target spec:** net-new (suggest `vendor-analytics/newVendorAnalytics.spec.ts`)  
**Why:** Same finding: every case here targets `dashboard/analytics/` (legacy). The React analytics route has zero coverage.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable vendor analytics module | @pro @admin | `test.skip` | `out of scope` |  |
| ☐ | vendor can view analytics menu page | @pro @vendor | — | `PORT` |  |
| ☑ | admin can disable vendor analytics module | @pro @admin | `test.skip` | `out of scope` |  |
| ☐ | Test Case 1 - Analytics page renders | @pro @vendor | — | `RELABEL (D4)` | Claims React, navigates the legacy analytics page. |
| ☐ | Test Case 2 - Analytics page renders content | @pro @vendor | — | `RELABEL (D4)` | Claims React, navigates the legacy analytics page. |

_5 rows = 5 `test(` calls in the file._ out of scope: 2 · PORT: 1 · RELABEL (D4): 2

### `tests/e2e/menu-manager/menuManager.spec.ts` — 8 cases

**React route:** React sidebar  
**Target spec:** menu-manager/newMenuManager.spec.ts  
**Why:** F7 closed — newMenuManager (4 cases) asserts the React sidebar. Legacy cases are admin-side menu configuration.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can deactivate menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can activate menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can rename menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can't rename menu with more than 45 characters | @pro @admin | — | `out of scope` |  |
| ☑ | admin can't rename disabled menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reorder menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can't reorder or toggle status of dashboard & store menu | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reset menu manager settings | @pro @admin | — | `out of scope` |  |

_8 rows = 8 `test(` calls in the file._ out of scope: 8

### `tests/e2e/intelligence/intelligence.spec.ts` — 2 cases

**React route:** /products/create  
**Target spec:** (same file)  
**Why:** One case already `@new-ui`; the other is a wp-admin setting.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | Test Case 1 - Vendor product editor loads (AI mounts via Fill slot) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | Test Case 2 - Admin AI settings page renders | @pro @admin | — | `out of scope` |  |

_2 rows = 2 `test(` calls in the file._ DONE: 1 · out of scope: 1

## Group 4 — Support, staff, verification, RMA, Q&A

### `tests/e2e/store-supports/storeSupports.spec.ts` — 39 cases

**React route:** /support, /support/:ticketId  
**Target spec:** store-supports/newStoreSupport.spec.ts  
**Why:** Fully superseded: all 11 vendor cases have a React equivalent among the 15 in newStoreSupport.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can store support module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view store support menu page | @pro @admin | — | `out of scope` |  |
| ☑ | unread count decrease after admin viewing a support ticket | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view support ticket details | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search support ticket by ticket id | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search support ticket by ticket title | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter support tickets by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter support tickets by customer | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reply to support ticket as admin | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reply to support ticket as vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can disable support ticket email notification | @pro @admin | — | `out of scope` |  |
| ☑ | admin can enable support ticket email notification | @pro @admin | — | `out of scope` |  |
| ☑ | admin can close support ticket | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reopen closed support ticket | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on store support tickets | @pro @admin | — | `out of scope` |  |
| ☑ | customer can view store support menu page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view support ticket details | @pro @customer | — | `out of scope` |  |
| ☑ | customer can ask for store support on single product | @pro @customer | — | `out of scope` |  |
| ☑ | customer can ask for store support on single store | @pro @customer | — | `out of scope` |  |
| ☑ | customer can ask for store support on order details | @pro @customer | — | `out of scope` |  |
| ☑ | customer can ask for store support on order received | @pro @customer | — | `out of scope` |  |
| ☑ | customer can ask for store support for order | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view reference order number on support ticket | @pro @customer | — | `out of scope` |  |
| ☑ | customer can send message to support ticket | @pro @customer | — | `out of scope` |  |
| ☑ | customer can't send message to closed support ticket | @pro @customer | — | `out of scope` |  |
| ☑ | guest customer need to login before asking for store support | @pro @guest | — | `out of scope` |  |
| ☐ | vendor can view store support menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view support ticket details | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter support tickets by customer | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter support tickets by date range | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can search support ticket by ticket id | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can search support ticket by ticket title | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can reply to support ticket | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can close support ticket | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can reopen closed support ticket | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can close support ticket with a chat reply | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can reopen closed support ticket with a chat reply | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | admin can disable store support module | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 3 - Admin support page renders | @pro @admin | — | `out of scope` |  |

_39 rows = 39 `test(` calls in the file._ out of scope: 28 · VERIFY-DEDUPE → RETIRE: 11

### `tests/e2e/vendor-staff/vendorStaff.spec.ts` — 11 cases

**React route:** /staffs(+/create, /update/:id, /permissions/:id)  
**Target spec:** vendor-staff/newVendorStaff.spec.ts  
**Why:** The 5 CRUD cases are `describe.skip`ped and superseded by 13 React cases. The 3 "Test Case" smokes navigate legacy `dashboard/vendor-staff/`.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable vendor staff manager module | @pro @admin | `describe.skip` | `out of scope` |  |
| ☐ | vendor can view staff menu page | @pro @vendor | `describe.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can add new staff | @pro @vendor | `describe.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can edit staff | @pro @vendor | `describe.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can manage staff permission | @pro @vendor | `describe.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can delete staff | @pro @vendor | `describe.skip` | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | VendorStaff can view allowed menus | @pro @staff | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | admin can disable vendor staff manager module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor staff page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy URL under a React-sounding title. |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy URL under a React-sounding title. |
| ☐ | Test Case 3 - Survives reload | @pro @vendor | — | `RELABEL (D4)` | Legacy URL under a React-sounding title. |

_11 rows = 11 `test(` calls in the file._ out of scope: 2 · VERIFY-DEDUPE → RETIRE: 6 · RELABEL (D4): 3

### `tests/e2e/vendor-verifications/vendorVerifications.spec.ts` — 39 cases

**React route:** /settings/verification  
**Target spec:** vendor-verifications/newVendorVerifications.spec.ts  
**Why:** Settings-page cases are converted. The 5 SETUP-WIZARD cases and the 3 skipped badge-logic cases have no React equivalent.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable vendor verification module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can change verified icon | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add vendor verification method | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit vendor verification method | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete vendor verification method | @pro @admin | — | `out of scope` |  |
| ☑ | admin can update verification method status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view verifications menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by pending status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by approved status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by rejected status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by cancelled status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter verification requests by verification methods | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reset filter | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add note to verification request | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view verification request documents | @pro @admin | — | `out of scope` |  |
| ☑ | admin can approve verification request | @pro @admin | — | `out of scope` |  |
| ☑ | admin can reject verification request | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on verification requests | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view verifications settings menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can submit verification request | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can re-submit verification request | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can cancel verification request | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can view verification request documents | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can view verification request notes | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newVendorVerifications. |
| ☐ | vendor can view verification methods on setup wizard | @pro @vendor | — | `PORT` | No React coverage of the setup-wizard verification step at all. |
| ☐ | vendor can submit verification request on setup wizard | @pro @vendor | — | `PORT` | No React coverage of the setup-wizard verification step at all. |
| ☐ | vendor can re-submit verification request on setup wizard | @pro @vendor | — | `PORT` | No React coverage of the setup-wizard verification step at all. |
| ☐ | vendor can cancel verification request on setup wizard | @pro @vendor | — | `PORT` | No React coverage of the setup-wizard verification step at all. |
| ☐ | vendor can view verification request documents on setup wizard | @pro @vendor | — | `PORT` | No React coverage of the setup-wizard verification step at all. |
| ☑ | customer can view verified badge | @pro @customer | — | `out of scope` |  |
| ☐ | vendor need all required method to be verified to get verification badge | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`. Badge/reset business rules are unverified on either UI. |
| ☐ | vendor need to be verified only one method when no required method is exists | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`. Badge/reset business rules are unverified on either UI. |
| ☐ | vendor address verification gets reset when he update address | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`. Badge/reset business rules are unverified on either UI. |
| ☑ | admin can disable vendor verification module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Verification page renders | @pro @vendor | — | `RELABEL (D4)` | Vendor smokes navigate legacy `dashboard/settings/verification/`. (The admin ones in this file correctly use the admin SPA.) |
| ☐ | Test Case 2 - Verification form renders content | @pro @vendor | — | `RELABEL (D4)` | Vendor smokes navigate legacy `dashboard/settings/verification/`. (The admin ones in this file correctly use the admin SPA.) |
| ☑ | Test Case 1 - Page renders without fatal | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 2 - Page renders content | @pro @admin | — | `out of scope` |  |

_39 rows = 39 `test(` calls in the file._ out of scope: 23 · VERIFY-DEDUPE → RETIRE: 6 · PORT: 5 · PORT (un-skip): 3 · RELABEL (D4): 2

### `tests/e2e/vendor-return-request/vendorReturnRequest.spec.ts` — 12 cases

**React route:** /return-request(+/:requestId)  
**Target spec:** vendor-return-request/newReturnRequest.spec.ts  
**Why:** Superseded by 10 React cases; the RMA *settings* case stays legacy (store settings have no React route).

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can RMA module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view return request menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view return request settings menu page | @pro @vendor | — | `STAYS-LEGACY` | RMA settings live under legacy store settings. |
| ☐ | vendor can view return request details | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | customer can send rma message | @pro @customer | — | `out of scope` |  |
| ☐ | vendor can send rma message | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can update rma status | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can rma refund | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can delete rma request | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | customer can view return request menu page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can request warranty | @pro @customer | — | `out of scope` |  |
| ☑ | admin can disable RMA module | @pro @admin | — | `out of scope` |  |

_12 rows = 12 `test(` calls in the file._ out of scope: 5 · VERIFY-DEDUPE → RETIRE: 6 · STAYS-LEGACY: 1

### `tests/e2e/product-qa/productQA.spec.ts` — 19 cases

**React route:** /product-questions-answers(+/:questionId)  
**Target spec:** product-qa/newProductQa.spec.ts  
**Why:** All 7 vendor cases have React equivalents among the 10 in newProductQa.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin product QA menu page renders properly | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view product question details | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter questions by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter questions by product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit question | @pro @admin | — | `out of scope` |  |
| ☑ | admin can answer to question | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit answer | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete answer | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit(hide) question visibility | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit(show) question visibility | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete a question | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on product QAs | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view product QA menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view product question details | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter questions | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can answer to question | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can edit answer | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can delete a answer | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can delete a question | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |

_19 rows = 19 `test(` calls in the file._ out of scope: 12 · VERIFY-DEDUPE → RETIRE: 7

### `tests/e2e/vendor-support/newVendorSupport.spec.ts` — 16 cases

**React route:** /vendor-support(+/:id)  
**Target spec:** (this IS the React spec)  
**Why:** C1 net-new — the vendor↔admin ticket surface had no legacy spec at all, only the wp-admin side (`admin/adminVendorSupport.spec.ts`). Listed here so the route is visibly accounted for; no migration work.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | vendor can open the Admin Support list mounted at #/vendor-support (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | the ticket list renders Ticket Id / Subject / Status / Date columns without the admin Vendor column (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | the All / Active / Closed tabs render with counts (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | the Closed tab filters the list to closed tickets (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can create a ticket through the Add New Ticket modal (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | searching by subject narrows the list to the matching ticket (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | searching a non-existent subject shows the empty state (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | the row Actions menu offers View / Close but never Delete for a vendor (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can close a ticket from the row Actions menu after confirming (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can open a ticket detail thread from the list (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | vendor can reply from the ticket detail (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | replying to a closed ticket reopens it (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | HashRouter survives a reload on /vendor-support (React) | @pro @vendor @new-ui | — | `DONE` |  |
| ☑ | an admin reply (REST) appears in the vendor ticket timeline (React) | @pro @vendor @admin @new-ui | — | `DONE` |  |
| ☑ | business flow: vendor creates (UI) then admin closes (REST) and the vendor sees it closed (React) | @pro @vendor @admin @new-ui | — | `DONE` |  |
| ☑ | a logged-in customer cannot mount the vendor Admin Support route (React) | @pro @customer @new-ui | — | `DONE` |  |

_16 rows = 16 `test(` calls in the file._ DONE: 16

## Group 5 — Modules (booking, auction, RFQ, subscriptions, add-ons, …)

### `tests/e2e/vendor-booking/vendorBooking.spec.ts` — 25 cases

**React route:** /booking(+/calendar, /my-bookings, /resources)  
**Target spec:** vendor-booking/newBooking.spec.ts  
**Why:** newBooking covers list/search/delete/resources/calendar. Product create+edit, the three filters, duplicate, view, and both manual-booking flows are unported.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable woocommerce booking integration module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add booking product | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view booking menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newBooking mounts the list, the resources route and the calendar. |
| ☐ | vendor can view manage booking page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newBooking mounts the list, the resources route and the calendar. |
| ☐ | vendor can view booking calendar page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newBooking mounts the list, the resources route and the calendar. |
| ☐ | vendor can view manage booking resource page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newBooking mounts the list, the resources route and the calendar. |
| ☐ | vendor can add booking product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can edit booking product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can view booking product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can't buy own booking product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can search booking product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Direct React equivalent exists in newBooking. |
| ☐ | vendor can duplicate booking product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can filter booking products by date | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can filter booking products by category | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can filter booking products by other | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can permanently delete booking product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Direct React equivalent exists in newBooking. |
| ☐ | vendor can add booking resource | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Direct React equivalent exists in newBooking. |
| ☐ | vendor can edit booking resource | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can delete booking resource | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can add booking for guest customer | @pro @vendor | — | `PORT` |  |
| ☑ | customer can buy bookable product | @pro @customer | — | `out of scope` |  |
| ☐ | vendor can add booking for existing customer | @pro @vendor | — | `PORT` |  |
| ☑ | admin can disable woocommerce booking integration module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Booking page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/booking/` URL under a React-sounding title. |
| ☐ | Test Case 2 - Booking page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/booking/` URL under a React-sounding title. |

_25 rows = 25 `test(` calls in the file._ out of scope: 4 · VERIFY-DEDUPE → RETIRE: 7 · PORT: 12 · RELABEL (D4): 2

### `tests/e2e/vendor-booking-fast/vendorBookingFast.spec.ts` — 17 cases

**React route:** /booking(+…)  
**Target spec:** vendor-booking/newBooking.spec.ts  
**Why:** A3: ~15 of these duplicate vendor-booking with faster seeding. Port ONCE (with vendorBooking above), then retire one of the two files.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable booking module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view booking menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view manage booking page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view booking calendar page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view manage resource page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can add booking product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can create and view product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can create and search product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can create and duplicate product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can create and delete product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter by date | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter by category | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter by other | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can manage booking resources | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can add guest booking | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | customer can buy bookable product | @pro @customer | — | `out of scope` |  |
| ☐ | vendor can add existing customer booking | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |

_17 rows = 17 `test(` calls in the file._ out of scope: 2 · VERIFY-DEDUPE → RETIRE: 15

### `tests/e2e/vendor-auction/vendorAuction.spec.ts` — 18 cases

**React route:** /auction, /auction-activity  
**Target spec:** vendor-auction/newAuction.spec.ts  
**Why:** List + activity mostly converted. Missing on the React side: duplicate, view product, "can't bid own product", and both activity filter/search cases.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable auction integration module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add auction product | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view auction menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newAuction. |
| ☐ | vendor can add auction product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Now covered by newProductFormAuction (create/validate/round-trip) + newAuction row-Edit. |
| ☐ | vendor can edit auction product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Now covered by newProductFormAuction (create/validate/round-trip) + newAuction row-Edit. |
| ☐ | vendor can view auction product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can't bid own product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can search auction product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newAuction. |
| ☐ | vendor can duplicate auction product | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can permanently delete auction product | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newAuction. |
| ☐ | vendor can view auction activity page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | Equivalent React case exists in newAuction. |
| ☐ | vendor can filter auction activity | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can search auction activity | @pro @vendor | — | `PORT` |  |
| ☑ | customer can bid auction product | @pro @customer | — | `out of scope` |  |
| ☑ | customer can buy auction product with buy it now price | @pro @customer | — | `out of scope` |  |
| ☑ | admin can disable auction integration module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Auction page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/auction/` URL under a React-sounding title. |
| ☐ | Test Case 2 - Auction page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/auction/` URL under a React-sounding title. |

_18 rows = 18 `test(` calls in the file._ out of scope: 5 · VERIFY-DEDUPE → RETIRE: 6 · PORT: 5 · RELABEL (D4): 2

### `tests/e2e/request-for-quotes/requestForQuotes.spec.ts` — 24 cases

**React route:** /requested-quotes  
**Target spec:** request-for-quotes/newRequestedQuotes.spec.ts  
**Why:** The React spec covers list/tabs/search/trash/restore but NOT the three business actions: update, approve, convert-to-order.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can view quotes menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add quote | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit quote | @pro @admin | `test.skip` | `out of scope` |  |
| ☑ | admin can trash quote | @pro @admin | — | `out of scope` |  |
| ☑ | admin can restore quote | @pro @admin | — | `out of scope` |  |
| ☑ | admin can permanently delete quote | @pro @admin | — | `out of scope` |  |
| ☑ | admin can approve quote | @pro @admin | — | `out of scope` |  |
| ☑ | admin can convert quote to order | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform quote bulk actions | @pro @admin @serial | — | `out of scope` |  |
| ☐ | vendor can view request quotes menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newRequestedQuotes mounts the list and its columns. |
| ☐ | vendor can view request quote details | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newRequestedQuotes mounts the list and its columns. |
| ☐ | vendor can update quote request | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can approve quote request | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can convert quote request to order | @pro @vendor | — | `PORT` |  |
| ☑ | customer can view request for quote menu page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view requested quote page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view requested quote details | @pro @customer | — | `out of scope` |  |
| ☑ | customer can update quote request | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can pay for order converted from quote request | @pro @customer | — | `out of scope` |  |
| ☑ | customer can quote product | @pro @customer | — | `out of scope` |  |
| ☑ | guest customer can quote product | @pro @guest | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor RFQ list page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/requested-quotes/` URL. |
| ☑ | Test Case 2 - Admin RFQ page renders | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 3 - Vendor RFQ page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/requested-quotes/` URL. |

_24 rows = 24 `test(` calls in the file._ out of scope: 17 · VERIFY-DEDUPE → RETIRE: 2 · PORT: 3 · RELABEL (D4): 2

### `tests/e2e/vendor-delivery-time/vendorDeliveryTime.spec.ts` — 13 cases

**React route:** /delivery-time-dashboard, /settings/delivery-time  
**Target spec:** vendor-delivery-time/newDeliveryTime.spec.ts  
**Why:** The React spec is mount smokes only (3). Filter, calendar view-style and the whole settings surface are unported.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable delivery time module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view delivery time menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newDeliveryTime mounts the calendar route. |
| ☐ | vendor can view delivery time settings menu page | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can set delivery time settings | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`; `/settings/delivery-time` has no React coverage at all. |
| ☐ | vendor can filter delivery time | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can change view style of delivery time calendar | @pro @vendor | — | `PORT` |  |
| ☑ | customer can buy product with delivery time | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can buy product with store pickup | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | admin can disable delivery time module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor delivery time page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/delivery-time-dashboard/` URL. |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/delivery-time-dashboard/` URL. |
| ☑ | Test Case 1 - Page renders without fatal | @pro @guest | — | `out of scope` |  |
| ☑ | Test Case 2 - Page renders content | @pro @guest | — | `out of scope` |  |

_13 rows = 13 `test(` calls in the file._ out of scope: 6 · VERIFY-DEDUPE → RETIRE: 1 · PORT: 3 · PORT (un-skip): 1 · RELABEL (D4): 2

### `tests/e2e/follow-store/followStore.spec.ts` — 10 cases

**React route:** /followers  
**Target spec:** follow-store/newFollowers.spec.ts  
**Why:** Both vendor cases superseded by 8 React cases.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable follow store module | @pro @admin | — | `out of scope` |  |
| ☑ | customer can view followed vendors via menu page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can follow store on store list page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can follow store on single store | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view followed vendors | @pro @customer | — | `out of scope` |  |
| ☑ | customer can unfollow store on store list page | @pro @customer | — | `out of scope` |  |
| ☑ | customer can unfollow store on single store | @pro @customer | — | `out of scope` |  |
| ☐ | vendor can view followers menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view followers | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | admin can disable follow store module | @pro @admin | — | `out of scope` |  |

_10 rows = 10 `test(` calls in the file._ out of scope: 8 · VERIFY-DEDUPE → RETIRE: 2

### `tests/e2e/vendor-product-subscription/vendorProductSubscription.spec.ts` — 16 cases

**React route:** /user-subscription(+/:subscriptionId)  
**Target spec:** vendor-product-subscription/newUserSubscription.spec.ts  
**Why:** D5 IS STILL BROKEN ON develop: this spec's React smoke navigates `dashboard/subscription/` (vendor PACKS) — the other spec's surface. Wave 0 fixed this on a branch; the fix did not survive the merge.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable product subscription module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view user subscriptions menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newUserSubscription mounts the list and opens the detail route. |
| ☐ | vendor can view product subscription details | @pro @vendor | `test.skip` | `PORT` |  |
| ☐ | vendor can filter user subscriptions by customer | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`; no React filter coverage. |
| ☐ | vendor can filter user subscriptions by date | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`; no React filter coverage. |
| ☐ | vendor can view user subscription | @pro @vendor | `test.skip` | `VERIFY-DEDUPE → RETIRE` | newUserSubscription mounts the list and opens the detail route. |
| ☑ | customer can view product subscription details | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can cancel subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can reactivate subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can change address of subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can change payment of subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can renew subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | customer can buy product subscription | @pro @customer | `test.skip` | `out of scope` |  |
| ☑ | admin can disable product subscription module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor subscription page renders | @pro @vendor | — | `RELABEL (D4)` | D5 FIXED 2026-08-14 — now points at `dashboard/user-subscription/`. Still a legacy-URL smoke: retire in favour of newUserSubscription. |
| ☑ | Test Case 2 - Admin subscription dashboard renders | @pro @admin | — | `out of scope` |  |

_16 rows = 16 `test(` calls in the file._ out of scope: 10 · VERIFY-DEDUPE → RETIRE: 2 · PORT: 1 · PORT (un-skip): 2 · RELABEL (D4): 1

### `tests/e2e/vendor-subscriptions/vendorSubscriptions.spec.ts` — 16 cases

**React route:** /subscription(+/orders)  
**Target spec:** vendor-subscriptions/newSubscription.spec.ts  
**Why:** Mirror image of the D5 defect: this spec navigates `dashboard/user-subscription/`. Cancel/switch have no React coverage.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable vendor subscription module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view subscriptions menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter subscribed vendors by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter subscribed vendors by subscription pack | @pro @admin | — | `out of scope` |  |
| ☑ | admin can cancel subscription (immediately) | @pro @admin | — | `out of scope` |  |
| ☑ | admin can cancel subscription (end of the current period) | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on subscribed vendors | @pro @admin | — | `out of scope` |  |
| ☑ | admin can assign non recurring subscription pack to vendor | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view subscriptions menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newSubscription mounts `/subscription` and `/subscription/orders`. |
| ☐ | vendor can buy non recurring subscription pack (on registration) | @pro @vendor | — | `STAYS-LEGACY` | Buy flow traverses storefront checkout + registration — not a dashboard surface. |
| ☐ | vendor can buy non recurring subscription pack (on subscription page) | @pro @vendor | — | `STAYS-LEGACY` | Buy flow traverses storefront checkout + registration — not a dashboard surface. |
| ☐ | vendor can switch subscription | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can cancel subscription | @pro @vendor | — | `PORT` |  |
| ☑ | admin can disable vendor subscription module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | — | `RELABEL (D4)` | D5 FIXED 2026-08-14 — now points at `dashboard/subscription/`. Still a legacy-URL smoke: retire in favour of newSubscription. |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` | D5 FIXED 2026-08-14 — now points at `dashboard/subscription/`. Still a legacy-URL smoke: retire in favour of newSubscription. |

_16 rows = 16 `test(` calls in the file._ out of scope: 9 · VERIFY-DEDUPE → RETIRE: 1 · STAYS-LEGACY: 2 · PORT: 2 · RELABEL (D4): 2

### `tests/e2e/shipstation/shipstation.spec.ts` — 6 cases

**React route:** /settings/shipstation  
**Target spec:** shipstation/newShipstation.spec.ts  
**Why:** A2 closed — generate/revoke both exist in React.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable ShipStation integration module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can generate ShipStation credentials | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can revoke ShipStation credentials | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | admin can disable ShipStation integration module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor shipstation settings page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/settings/shipstation/` URL. |
| ☑ | Test Case 2 - Admin chrome loads | @pro @admin | — | `out of scope` |  |

_6 rows = 6 `test(` calls in the file._ out of scope: 3 · VERIFY-DEDUPE → RETIRE: 2 · RELABEL (D4): 1

### `tests/e2e/product-addons/productAddons.spec.ts` — 15 cases

**React route:** /settings/product-addon + /products/:id/edit  
**Target spec:** product-addons/newProductAddons.spec.ts (global) + newProductFormAdvanced (per-product)  
**Why:** The React spec covers the global addon LIST only (view/search/delete). Create, edit, import, export, field-removal and all four per-product addon cases are unported.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable product addon module | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view product addons menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductAddons covers list render and delete-from-list. |
| ☐ | vendor can add global product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can edit global product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can import global product addon field | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can export global product addon field | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product addon field | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove global product addon | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` | newProductAddons covers list render and delete-from-list. |
| ☐ | vendor can add product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can import product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can export product addon | @pro @vendor | — | `PORT` |  |
| ☐ | vendor can remove product addon | @pro @vendor | — | `PORT` |  |
| ☑ | admin can disable product addon module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor add-ons page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/addon/` URL. |
| ☐ | Test Case 2 - Add-ons page renders content | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/addon/` URL. |

_15 rows = 15 `test(` calls in the file._ out of scope: 2 · VERIFY-DEDUPE → RETIRE: 2 · PORT: 9 · RELABEL (D4): 2

### `tests/e2e/product-advertising/productAdvertising.spec.ts` — 15 cases

**React route:** /products (Advertise column)  
**Target spec:** product-advertising/newProductAdvertising.spec.ts  
**Why:** Simple-product advertising is converted; the booking/auction variants stay skipped on both UIs.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable product advertising module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view product advertising menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can add product advertisement | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search advertised product by product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter advertised product by stores | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter advertised product by creation process | @pro @admin | — | `out of scope` |  |
| ☑ | admin can expire advertised product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete advertised product | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on product advertisements | @pro @admin @serial | — | `out of scope` |  |
| ☐ | vendor can buy product advertising (product list page) | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can buy booking product advertising | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`; no coverage on either UI. |
| ☐ | vendor can buy auction product advertising | @pro @vendor | `test.skip` | `PORT (un-skip)` | Legacy `.skip`; no coverage on either UI. |
| ☑ | admin can disable product advertising module | @pro @admin | `test.skip` | `out of scope` |  |
| ☐ | Test Case 1 - Vendor advertising page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/product_advertising/` URL. |
| ☑ | Test Case 2 - Admin advertising page renders | @pro @admin | — | `out of scope` |  |

_15 rows = 15 `test(` calls in the file._ out of scope: 11 · VERIFY-DEDUPE → RETIRE: 1 · PORT (un-skip): 2 · RELABEL (D4): 1

### `tests/e2e/announcements/announcements.spec.ts` — 20 cases

**React route:** /announcement(+/:id)  
**Target spec:** announcements/announcementsNewUI.spec.ts + newAnnouncements.spec.ts  
**Why:** B21 closed — vendor list/detail/delete all exist in React.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | Old Test Case 1 - Admin Views Announcements Menu Page | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 2 - Admin Sends Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 3 - Admin Schedules Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 4 - Admin Edits Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 5 - Admin Trashes Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 6 - Admin Restores Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 7 - Admin Permanently Deletes Announcement | @pro @admin | — | `out of scope` |  |
| ☑ | Old Test Case 8 - Admin Performs Bulk Action on Announcements | @pro @admin | — | `out of scope` |  |
| ☐ | Old Test Case 9 - Vendor Views Announcements Menu Page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | Old Test Case 10 - Vendor Views Announcement Details | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | Old Test Case 11 - Vendor Deletes Announcement | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | Test Case 12 - Admin Empties Trash in New Admin Announcement Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 13 - Admin Creates Published Announcement in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 15 - Admin Creates Draft Announcement in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 16 - Admin Verifies Draft Announcement in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 17 - Admin Creates Scheduled Announcement in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 18 - Admin Verifies Draft Status Visible in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 19 - Admin Verifies Scheduled Status Visible in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 20 - Admin Trashes and Permanently Deletes Announcements in New Admin Dashboard | @pro @admin | — | `out of scope` |  |
| ☑ | Test Case 21 - Admin Empties Trash in New Admin Dashboard | @pro @admin | — | `out of scope` |  |

_20 rows = 20 `test(` calls in the file._ out of scope: 17 · VERIFY-DEDUPE → RETIRE: 3

### `tests/e2e/seller-badges/sellerBadges.spec.ts` — 21 cases

**React route:** /seller-badge  
**Target spec:** seller-badges/newSellerBadge.spec.ts  
**Why:** B24 closed — render, congratulations modal, search and the badge tabs all exist in React.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable seller badge module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view seller badge menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can preview seller badge | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view seller badge details | @pro @admin | — | `out of scope` |  |
| ☑ | admin can search seller badge | @pro @admin | — | `out of scope` |  |
| ☑ | admin can create seller badge | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit seller badge | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter vendors by seller badge | @pro @admin | `test.skip` | `out of scope` |  |
| ☑ | admin can view seller badge vendors | @pro @admin | `test.skip` | `out of scope` |  |
| ☑ | admin can view seller badges acquired by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can update seller badge status | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete seller badge | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on seller badges | @pro @admin | — | `out of scope` |  |
| ☐ | vendor can view badges menu page | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can view badge acquired congratulation popup message action | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can search seller badge | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☐ | vendor can filter seller badges | @pro @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |
| ☑ | admin can disable seller badge module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor badges page renders | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/seller-badge/` URL. |
| ☑ | Test Case 2 - Admin badges page renders | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 3 - Vendor page survives reload | @pro @vendor | — | `RELABEL (D4)` | Legacy `dashboard/seller-badge/` URL. |

_21 rows = 21 `test(` calls in the file._ out of scope: 15 · VERIFY-DEDUPE → RETIRE: 4 · RELABEL (D4): 2

## Group 6 — Vendor settings surfaces (shipping, SEO, social, reviews)

### `tests/e2e/vendor-shipping/vendorShipping.spec.ts` — 4 cases

**React route:** /settings/shipping(+/:zoneID)  
**Target spec:** vendor-shipping/newShipping.spec.ts  
**Why:** Superseded by 16 React cases; all four smokes here navigate the legacy settings URL.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Vendor shipping settings page renders | @pro @vendor | — | `RELABEL (D4)` |  |
| ☐ | Test Case 2 - Shipping zone list mounts (React or legacy) | @pro @vendor | — | `RELABEL (D4)` |  |
| ☐ | Test Case 3 - Vendor can navigate to shipping policy section | @pro @vendor | — | `RELABEL (D4)` |  |
| ☐ | Test Case 4 - Page survives reload | @pro @vendor | — | `RELABEL (D4)` |  |

_4 rows = 4 `test(` calls in the file._ RELABEL (D4): 4

### `tests/e2e/table-rate-shipping/tableRateShipping.spec.ts` — 2 cases

**React route:** /settings/shipping/:zoneID/table-rate|distance-rate/:instanceID  
**Target spec:** table-rate-shipping/newShippingRate.spec.ts  
**Why:** B30 closed by newShippingRate (4 drill-in cases).

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | — | `RELABEL (D4)` |  |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | — | `RELABEL (D4)` |  |

_2 rows = 2 `test(` calls in the file._ RELABEL (D4): 2

### `tests/e2e/social-linking/socialLinking.spec.ts` — 2 cases

**React route:** /settings/social  
**Target spec:** social-linking/newSocial.spec.ts  
**Why:** FIXED 2026-08-14 — `describe.skip`ped with a comment naming newSocial (5 cases: view, save, persist, clear, guest-storefront oracle), which exceeds these two legacy-URL smokes.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | `describe.skip` | `RETIRED ✔` |  |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | `describe.skip` | `RETIRED ✔` |  |

_2 rows = 2 `test(` calls in the file._ RETIRED ✔: 2

### `tests/e2e/store-seo/storeSeo.spec.ts` — 2 cases

**React route:** /settings/seo  
**Target spec:** store-seo/newStoreSeo.spec.ts  
**Why:** FIXED 2026-08-14 — `describe.skip`ped; newStoreSeo (6 cases incl. a guest storefront-head oracle) exceeds these two legacy-URL smokes.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☐ | Test Case 1 - Page renders without fatal | @pro @vendor | `describe.skip` | `RETIRED ✔` |  |
| ☐ | Test Case 2 - Page renders content | @pro @vendor | `describe.skip` | `RETIRED ✔` |  |

_2 rows = 2 `test(` calls in the file._ RETIRED ✔: 2

### `tests/e2e/store-reviews/storeReviews.spec.ts` — 17 cases

**React route:** — (no vendor React route for store reviews)  
**Target spec:** admin SPA + storefront only  
**Why:** Store reviews (the `dokan_store_reviews` post type) has an ADMIN React route only; the vendor `#/reviews` route is PRODUCT reviews. The two vendor smokes here navigate `dashboard/store-reviews/`, which is not a real page.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can enable store reviews module | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view store reviews menu page | @pro @admin | — | `out of scope` |  |
| ☑ | admin can view store review | @pro @admin | — | `out of scope` |  |
| ☑ | admin can edit store review | @pro @admin | — | `out of scope` |  |
| ☑ | admin can filter store reviews by vendor | @pro @admin | — | `out of scope` |  |
| ☑ | admin can delete store review | @pro @admin | — | `out of scope` |  |
| ☑ | admin can restore deleted store review | @pro @admin | — | `out of scope` |  |
| ☑ | admin can permanently delete store review | @pro @admin | — | `out of scope` |  |
| ☑ | admin can perform bulk action on store reviews | @pro @admin | — | `out of scope` |  |
| ☑ | customer can review store | @pro @customer | — | `out of scope` |  |
| ☑ | customer can edit store review | @pro @customer | — | `out of scope` |  |
| ☑ | customer can view own review | @pro @customer | — | `out of scope` |  |
| ☐ | vendor can't review own store | @pro @vendor | — | `RELABEL (D4)` |  |
| ☑ | admin can disable store reviews module | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 1 - Vendor store reviews page renders | @pro @vendor | — | `RELABEL (D4)` |  |
| ☑ | Test Case 2 - Admin store reviews page renders | @pro @admin | — | `out of scope` |  |
| ☐ | Test Case 3 - Vendor store reviews shows table or empty state | @pro @vendor | — | `RELABEL (D4)` |  |

_17 rows = 17 `test(` calls in the file._ out of scope: 14 · RELABEL (D4): 3

### `tests/e2e/setting/setting.spec.ts` — 11 cases

**React route:** /orders (capability gate)  
**Target spec:** orders/newOrdersGaps.spec.ts  
**Why:** B26 closed — newOrdersGaps asserts the order-status capability against the React list. The T&C cases are store settings.

| ☐ | Test case (byte-exact title) | Tags | State | Action | Note |
|---|---|---|---|---|---|
| ☑ | admin can set vendor store url (general settings) | @lite @admin @serial | — | `out of scope` |  |
| ☑ | admin can set vendor setup wizard logo & message (general settings) | @lite @admin | — | `out of scope` |  |
| ☑ | admin can disable vendor setup wizard (general settings) | @lite @guest | — | `out of scope` |  |
| ☐ | admin can set store terms and conditions (general settings) | @lite @vendor | — | `STAYS-LEGACY` | Store settings — no React route. |
| ☑ | admin can set store products per page (general settings) | @lite @customer | — | `out of scope` |  |
| ☑ | admin can enable address fields on registration (general settings) | @lite @guest | — | `out of scope` |  |
| ☐ | admin can enable store terms and conditions on registration (general settings) | @pro @vendor | — | `STAYS-LEGACY` | Store settings — no React route. |
| ☑ | admin can set show vendor info (general settings) | @lite @customer | — | `out of scope` |  |
| ☑ | admin can enable more products tab (general settings) | @lite @customer | — | `out of scope` |  |
| ☑ | admin can enable vendor selling (selling settings) | @lite @guest | — | `out of scope` |  |
| ☐ | admin can set order status change capability (selling settings) | @lite @vendor | — | `VERIFY-DEDUPE → RETIRE` |  |

_11 rows = 11 `test(` calls in the file._ out of scope: 8 · STAYS-LEGACY: 2 · VERIFY-DEDUPE → RETIRE: 1

## Already converted — the React specs on `develop`

50 spec files carry `@new-ui` cases (431 tagged cases). This is the "done" side of the migration; the tables above reference these as targets.

| Spec | `@new-ui` cases | of total |
|---|---|---|
| `announcements/announcementsNewUI.spec.ts` | 9 | 13 |
| `announcements/newAnnouncements.spec.ts` | 3 | 3 |
| `coupons/newCoupons.spec.ts` | 14 | 14 |
| `dashboard/dashboard.spec.ts` | 11 | 24 |
| `dokan-invoice/dokanInvoice.spec.ts` | 5 | 26 |
| `follow-store/newFollowers.spec.ts` | 8 | 8 |
| `intelligence/intelligence.spec.ts` | 1 | 2 |
| `manual-order/newManualOrder.spec.ts` | 11 | 11 |
| `menu-manager/newMenuManager.spec.ts` | 4 | 4 |
| `orders/newOrders.spec.ts` | 21 | 21 |
| `orders/newOrdersGaps.spec.ts` | 3 | 3 |
| `orders/orders.spec.ts` | 7 | 23 |
| `product-addons/newProductAddons.spec.ts` | 7 | 7 |
| `product-advertising/newProductAdvertising.spec.ts` | 6 | 6 |
| `product-form-manager/newProductForm.spec.ts` | 13 | 13 |
| `product-form-manager/newProductFormAdvanced.spec.ts` | 13 | 13 |
| `product-form-manager/newProductFormAuction.spec.ts` | 13 | 13 |
| `product-form-manager/newProductFormEdit.spec.ts` | 10 | 10 |
| `product-form-manager/newProductFormTypes.spec.ts` | 1 | 1 |
| `product-form-manager/newProductFormValidation.spec.ts` | 9 | 9 |
| `product-form-manager/newProductFormWholesale.spec.ts` | 2 | 2 |
| `product-qa/newProductQa.spec.ts` | 10 | 10 |
| `product-reviews/newProductReviews.spec.ts` | 9 | 9 |
| `product-variations/productVariations.spec.ts` | 2 | 2 |
| `products/newProducts.spec.ts` | 29 | 29 |
| `products/newProductsProActions.spec.ts` | 3 | 3 |
| `rank-math/rankMath.spec.ts` | 4 | 16 |
| `request-for-quotes/newRequestedQuotes.spec.ts` | 9 | 9 |
| `reverse-withdraws/newReverseWithdraw.spec.ts` | 10 | 10 |
| `reverse-withdraws/reverseWithdraws.spec.ts` | 2 | 17 |
| `seller-badges/newSellerBadge.spec.ts` | 10 | 10 |
| `shipstation/newShipstation.spec.ts` | 4 | 4 |
| `social-linking/newSocial.spec.ts` | 5 | 5 |
| `store-seo/newStoreSeo.spec.ts` | 6 | 6 |
| `store-supports/newStoreSupport.spec.ts` | 15 | 15 |
| `table-rate-shipping/newShippingRate.spec.ts` | 4 | 4 |
| `vendor-auction/newAuction.spec.ts` | 12 | 12 |
| `vendor-booking/newBooking.spec.ts` | 10 | 10 |
| `vendor-delivery-time/newDeliveryTime.spec.ts` | 3 | 3 |
| `vendor-product-subscription/newUserSubscription.spec.ts` | 6 | 6 |
| `vendor-products/addProduct.spec.ts` | 17 | 18 |
| `vendor-return-request/newReturnRequest.spec.ts` | 10 | 10 |
| `vendor-shipping/newShipping.spec.ts` | 16 | 16 |
| `vendor-staff/newVendorStaff.spec.ts` | 13 | 13 |
| `vendor-subscriptions/newSubscription.spec.ts` | 6 | 6 |
| `vendor-support/newVendorSupport.spec.ts` | 16 | 16 |
| `vendor-verifications/newVendorVerifications.spec.ts` | 10 | 10 |
| `withdraws/newWithdraw.spec.ts` | 12 | 12 |
| `withdraws/newWithdrawB15.spec.ts` | 2 | 2 |
| `withdraws/withdraws.spec.ts` | 5 | 24 |

Three more files drive the React SPA but carry **no** `@new-ui` tag, so they are absent from the count above and from `npm run test:e2e:newui` — see defects 3 and 4: `product-form-manager/newProductFormAuction.spec.ts` (13), `rank-math/rankMath.spec.ts` (10 vendor), and the "Test Case" smokes in `withdraws/withdraws.spec.ts` (5) and `reverse-withdraws/reverseWithdraws.spec.ts` (2).

## Stays legacy — no React route (spec-level; revisit when the screen ships React)

These are listed at spec level deliberately: there is nothing to migrate case-by-case until the surface exists.

| Spec | Cases | Reason / revisit trigger |
|---|---|---|
| `vendor-settings/vendorSettings.spec.ts` | 27 | Store / RMA / payment settings — no React route. D3: the file-level skip also buries cases whose surfaces DID convert; split before re-enabling. |
| `vendor-reports/vendorReports.spec.ts` | 45 | Vendor Reports (`dashboard/reports/`) — no React route. |
| `vendor-reports-admin/vendorReportsAdmin.spec.ts` | 10 | Admin-side vendor reports (`/reports` is registered on the ADMIN dashboard routes, not the vendor SPA). 8 of its 10 cases are already skipped. |
| `products-details-auction/productsDetailsAuction.spec.ts` | — | (listed above — re-classified as portable) |
| `spmv/spmv.spec.ts` | 18 | SPMV — no vendor React route (admin side is the old `page=dokan` Vue SPA). |
| `printful/printful.spec.ts` | 10 | Printful settings — no React route; page object is still a stub. |
| `vendor-tools/vendorTools.spec.ts` | 9 | Vendor Tools (`dashboard/tools/`) — no React route. |
| `export-import/exportImport.spec.ts` | 2 | Tools import/export — no React route. Both smokes claim React and navigate `dashboard/tools/` → RELABEL. |
| `live-chat/liveChat.spec.ts` | 12 | Vendor inbox — no React route. |
| `colors/colors.spec.ts` | 5 | Palette assertions target the legacy dashboard chrome. |
| `catalog-mode/catalogMode.spec.ts` | 5 | Catalog-mode toggles live in store settings. |
| `store-categories/storeCategories.spec.ts` | 11 | Store-category assignment lives in store settings / wp-admin taxonomy. |
| `store-appearance/storeAppearance.spec.ts` | 2 | Admin + storefront surface. |
| `payments/payments.spec.ts` | 33 | Payment settings — no React route. Three smokes claim React and navigate the legacy page → RELABEL. |
| `vendor/vendor.spec.ts` | 8 | Registration / login / setup wizard — storefront, not the dashboard SPA. |
| `seller-vacation/sellerVacation.spec.ts` | 2 | Store settings surface. |
| `min-max-quantities/minMaxQuantities.spec.ts` | 3 | wp-admin settings only. |
| `stripe-express/stripeExpress.spec.ts + stripeExpressSettings.spec.ts` | 18 | The vendor-visible legs (SE-ONB-04, SE-SET-18) sit on the still-legacy Payment settings screen (B28). |
| `stripe-express/stripeExpressSubscriptions.spec.ts` | 11 | B27: only SE-SUB-03/04 touch `/subscription` cancel/reactivate; port those dashboard legs once the subscription React cancel flow is verified. |
| `stripe-express/stripeExpressAdvertisement.spec.ts` | 2 | A4 closed by newProductAdvertising for the React surface; the Stripe checkout leg stays. |

## Out of scope for this migration

161 spec files (1729 cases) are untouched by the vendor React rewrite:

- **wp-admin (new admin SPA):** every `tests/e2e/admin/*` spec plus `adminDataViewsMigration.spec.ts`, `settings/`, `modules/`, `stores/`, `commission/`, `abuse-reports/`, `shipping/`, `tax/`, `tools/`, `license/`, `setup-guide/`, `onboarding/`, `geolocation/`, `help/`, `diagnostic-notice/`, `notice-and-promotion/`. These already drive `page=dokan-dashboard`; `adminSellerBadges` deliberately stays on the legacy `#vue-backend-app`.
- **Storefront / customer:** `customer/`, `shop/`, `single-product/`, `single-store/`, `store-listing/`, `my-orders/`, `product-tabs/`, `product-enquiry/`, `brand-filter/`, `frontend-badges/`, `live-search/`, `email-verification/`, `privacy-policy/`, `shortcodes/`, `request-for-quote-rules/`, `visual/`.
- **Payment gateways:** all `paypal-marketplace/*` and `stripe-express/*` except the vendor-dashboard legs called out above.
- **The 54-spec API suite** (`tests/api/`): pure request-context tests. The REST layer did not change with the UI rewrite.

## Suggested order

1. **Defects 1-8 above** — hours, not days, and they unblock honest measurement (`test:e2e:newui` currently under-reports).
2. **`productsDetails` edit parity (95 cases)** — the single biggest hole; split lite/pro into two specs.
3. **Orders details + `/orders/edit/:id` + refunds** — order notes, tracking, shipment, downloadable permissions, full/partial refund.
4. **`productsDetailsAuction` (50 cases)** — now portable; verify the React Auction Options card field-by-field first.
5. **Module behaviour gaps** — RFQ (update/approve/convert), product add-ons (create/edit/import/export + per-product), booking (create/edit/filters/manual bookings), delivery-time (filters + settings), auction (duplicate/view/activity filters), verifications (setup wizard).
6. **Net-new:** React `#/analytics`.
7. **Retires:** everything marked `VERIFY-DEDUPE → RETIRE`, in one sweep, after its React parity has been green 3×.

## Coverage proof

Row counts are generated from the spec files, not hand-maintained. Per-spec totals:

| Spec | Rows | = `test(` calls |
|---|---|---|
| `products-details/productsDetails.spec.ts` | 95 | ✔ |
| `products-details-auction/productsDetailsAuction.spec.ts` | 50 | ✔ |
| `products-details-bookings/productsDetailsBookings.spec.ts` | 2 | ✔ |
| `products/products.spec.ts` | 33 | ✔ |
| `vendor-products/addProduct.spec.ts` | 18 | ✔ |
| `product-variations/productVariations.spec.ts` | 2 | ✔ |
| `product-bulk-edit/productBulkEdit.spec.ts` | 2 | ✔ |
| `product-form-manager/newProductFormAuction.spec.ts` | 13 | ✔ |
| `rank-math/rankMath.spec.ts` | 16 | ✔ |
| `wholesale/wholesale.spec.ts` | 20 | ✔ |
| `eu-compliance/euCompliance.spec.ts` | 21 | ✔ |
| `product-reviews/productReviews.spec.ts` | 13 | ✔ |
| `orders/orders.spec.ts` | 23 | ✔ |
| `refunds/refunds.spec.ts` | 10 | ✔ |
| `manual-order/manualOrder.spec.ts` | 3 | ✔ |
| `manual-order-pro/manualOrderPro.spec.ts` | 2 | ✔ |
| `withdraws/withdraws.spec.ts` | 24 | ✔ |
| `reverse-withdraws/reverseWithdraws.spec.ts` | 17 | ✔ |
| `dokan-invoice/dokanInvoice.spec.ts` | 26 | ✔ |
| `dashboard/dashboard.spec.ts` | 24 | ✔ |
| `vendor-analytics/vendorAnalytics.spec.ts` | 5 | ✔ |
| `menu-manager/menuManager.spec.ts` | 8 | ✔ |
| `intelligence/intelligence.spec.ts` | 2 | ✔ |
| `store-supports/storeSupports.spec.ts` | 39 | ✔ |
| `vendor-staff/vendorStaff.spec.ts` | 11 | ✔ |
| `vendor-verifications/vendorVerifications.spec.ts` | 39 | ✔ |
| `vendor-return-request/vendorReturnRequest.spec.ts` | 12 | ✔ |
| `product-qa/productQA.spec.ts` | 19 | ✔ |
| `vendor-support/newVendorSupport.spec.ts` | 16 | ✔ |
| `vendor-booking/vendorBooking.spec.ts` | 25 | ✔ |
| `vendor-booking-fast/vendorBookingFast.spec.ts` | 17 | ✔ |
| `vendor-auction/vendorAuction.spec.ts` | 18 | ✔ |
| `request-for-quotes/requestForQuotes.spec.ts` | 24 | ✔ |
| `vendor-delivery-time/vendorDeliveryTime.spec.ts` | 13 | ✔ |
| `follow-store/followStore.spec.ts` | 10 | ✔ |
| `vendor-product-subscription/vendorProductSubscription.spec.ts` | 16 | ✔ |
| `vendor-subscriptions/vendorSubscriptions.spec.ts` | 16 | ✔ |
| `shipstation/shipstation.spec.ts` | 6 | ✔ |
| `product-addons/productAddons.spec.ts` | 15 | ✔ |
| `product-advertising/productAdvertising.spec.ts` | 15 | ✔ |
| `announcements/announcements.spec.ts` | 20 | ✔ |
| `seller-badges/sellerBadges.spec.ts` | 21 | ✔ |
| `vendor-shipping/vendorShipping.spec.ts` | 4 | ✔ |
| `table-rate-shipping/tableRateShipping.spec.ts` | 2 | ✔ |
| `social-linking/socialLinking.spec.ts` | 2 | ✔ |
| `store-seo/storeSeo.spec.ts` | 2 | ✔ |
| `store-reviews/storeReviews.spec.ts` | 17 | ✔ |
| `setting/setting.spec.ts` | 11 | ✔ |

**In-scope: 48 spec files, 819 cases enumerated.** Suite-wide: 209 e2e spec files, 2548 cases.
