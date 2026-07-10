# New-UI conversion log

Running source of progress truth for the React vendor-dashboard suite
conversion. Plan of record:
`~/.claude/skills/dokan-qa/automation-handoff/dokan-lite-new-ui-conversion-handoff.md`.
Branch: `qa/new-ui-suite-wave-0` (one commit per completed wave; never pushed
without explicit approval).

## Wave 0 — foundations (in progress)

### F1 — `tests/e2e/NEW_UI_HOUSE_STYLE.md` ✔

Authored. §1 (self-containment) and §5 (list-ready contract) keep the numbers
already cited by `new-orders/newOrdersPage.ts`, `new-withdraw/newWithdrawPage.ts`,
`new-shipping/newShippingPage.ts`, `new-manual-order`, `new-seller-badge`,
`new-store-reviews`. Also absorbs the D1–D6 convention decisions and the
12 style deviations arbitrated between the new-withdraw and new-shipping
exemplars (assertions in specs not page objects; version-agnostic REST oracles;
try/finally on inline contexts; `waitForRootReady`/`waitForListReady` naming;
tag order tier → roles → `@new-ui` last).
Note: several older files cite a `CONVENTIONS.md` that also never existed on
disk — the house style doc supersedes those citations for new-UI work.

### F2 — `utils/dataViews.ts` ✔

- New shared module. The admin implementation (`SKELETON`, `DATA_ROW`,
  `dataViewsConfirm`, `confirmDataViewsAction`, `dismissDataViewsAction`,
  `isDataViewsConfirmOpen`, `waitForDataViewsSettle`,
  `applyAndValidateDataViewsFilter` + interfaces) moved over **verbatim**;
  `tests/e2e/admin/adminDataViews.ts` is now a one-line re-export so its ~29
  same-folder importers are untouched.
- Vendor primitives added: `REACT_ROOT`, `DATA_ROW_ANY`, `SKELETON_ANY`,
  `DATA_ROW_SETTLED`, `ROW_ACTIONS_BTN`, `actionMenuItem`, `statusTab`,
  `SEARCH_INPUT`, `PHP_FATAL`, `DATAVIEWS_EMPTY`, filter-panel constants,
  `waitForRootReady`, `waitForListReady` (the §5 poll contract),
  `hasNoPhpFatal`, `rawRowCount`, `isEmptyStateVisible`, `parseTabCount`,
  `openRowActionMenu`, `clickActionMenuItem`, `fillDataViewsSearch`,
  `clearDataViewsSearch`, `openFilterPanel`, `hasFilterControls`.
- Refactored to delegate (public APIs and per-file semantics unchanged):
  `new-withdraw/newWithdrawPage.ts`, `new-orders/newOrdersPage.ts`,
  `new-seller-badge/newSellerBadgePage.ts`,
  `new-store-reviews/newStoreReviewsPage.ts`, `orders/newOrderListPage.ts`,
  `vendor-products/newProductListPage.ts`.
- Deliberately NOT unified: raw vs settled `getRowCount` semantics per file
  (withdraw/seller-badge/orders/products stay raw; new-orders/store-reviews
  stay settled) and the two skeleton-settle loops — they encode verified
  surface behavior.

### F3 — one `closeAnnouncementModal` ✔ (new-UI scope)

Inlined copies replaced with the `@utils/helpers` export in:
`orders/newOrderListPage.ts`, `vendor-products/newProductListPage.ts`,
`dashboard/newVendorDashboardPage.ts`, `announcements/announcementsNewUI.spec.ts`
(this one used a _different_ dedup flag, so it didn't even dedupe against the
helper before). Remaining full local copies in ~10 legacy folders
(announcementsPage, dashboardPage, ordersPage, vendorPage, addProductPage,
emailVerificationPage, euCompliancePage, geolocationPage, followStorePage,
helpPage) and `product-form-manager/productFormManagerAdminPage.ts` are
byte-equivalent and share the dedup flag — migrate opportunistically when
those folders are touched (D1), not worth the churn now.

### F4 — `utils/authStates.ts` ✔

Exports absolute `ADMIN/VENDOR/VENDOR2/CUSTOMER/CUSTOMER2_STORAGE_STATE`
paths. Migrated: `announcementsNewUI.spec.ts` + (via workflow agents) the 11
`new-*` folder specs and the `product-form-manager/newProductForm*` trio.
The ~130 legacy spec files keep their hand-built `path.join` consts for now —
mechanical but high-churn; migrate per-folder as waves touch them.

### F5 — `@new-ui` tag normalization + run mode ✔

- `package.json`: added `test:e2e:newui` (= e2e_tests project, grep `@new-ui`).
- `announcementsNewUI.spec.ts`: tagged the 8 vendor tests + the customer test
  that navigates the vendor SPA. The 3 admin tests drive the **wp-admin** React
  dashboard (`page=dokan-dashboard#/announcement`), which per the D4 hard rule
  is a different SPA → deliberately NOT `@new-ui`. Same for the customer test
  that only visits the legacy URL.
- Workflow agents tagged: `product-form-manager/newProductForm*.spec.ts`
  (all-vendor, all drive `/dashboard/new/#/products/create`) and the tests
  inside the in-file "(React)" describes that genuinely navigate
  `/dashboard/new/` in: withdraws, dashboard, orders, addProduct,
  announcements, intelligence, productVariations, reverseWithdraws
  (+ productBulkEdit if applicable). Analytics-shell tests in dashboard.spec.ts
  and any wp-admin-only tests in those blocks stay untagged per D4.
- Deferred: `productFormManagerAdmin.spec.ts` (mixed admin/vendor file — will
  be handled with the D2 consolidation in Wave 2).

### F6 — feature-map backfill ✔ (via workflow agent)

Scheme: `vendor (new UI)` / `admin (new UI)` / `customer (new UI)` /
`guest (new UI)` groups under the existing co-located page entries
(`Withdraw`, `Reverse Withdrawal`, `Orders`, `Manual Orders`, `Products`,
`coupons`, `Seller Badge`, `Shipping`, `Store Reviews`, `Announcements`,
Dokan Invoice) + two new page entries `Social Profiles` and `Store SEO`.
Leaf keys are byte-exact test titles (` [lite]` suffix on `@lite` tests;
`false` for `test.skip`'d cases). Legacy in-file "(React)" smokes get entries
when they migrate to `new-*` folders (D1), not now.

### D5 — swapped subscription smoke URLs ✔

`vendorProductSubscription.spec.ts` React TC1 now hits
`dashboard/user-subscription/` (product subscriptions);
`vendorSubscriptions.spec.ts` React TC1+TC2 now hit `dashboard/subscription/`
(vendor packs). Note: `vendorProductSubscription` TC2 smoke-tests the
**vendor-subscription** admin page (`page=dokan_vendor_subscription`) from the
product-subscription spec — misplaced; fold into the B12/B13 work in Wave 3.

### D6 — retired superseded smokes ✔

`social-linking/socialLinking.spec.ts` and `store-seo/storeSeo.spec.ts`
`describe.skip`'d with pointers to `new-social/` / `new-store-seo/`. Verified
(scout audit): zero unique coverage — both navigated the LEGACY settings URLs
despite their "(React)" titles and asserted only no-fatal/body-length. The
new-\* folders exceed every case (save, persistence, clear, storefront oracle).

### Validation (Wave 0 gate)

- `tsc --noEmit`: PASSES on every TypeScript file. The only errors are
  pre-existing `implicit any` noise in three plain-JS util scripts
  (`getShardSpecs.js`, `aggregateSpecDurations.js`, `generateQualityReport.js`)
  — confirmed present on the `develop` baseline via `git stash`, not introduced
  here.
- `npm run test:e2e:newui` (full `@new-ui` grep = 242 tests / 24 files) against
  Docker :9999:
    - Run 1: **234 passed, 6 skipped, 2 failed**. Both failures were
      `new-seller-badge` (`tabsVisible()` reading the tab strip during the
      search-triggered DataViews re-render — a load-induced race, not my
      refactor: the method was untouched and passed 8/8 in isolation).
    - Fix (house-style §7, strengthen not weaken): `tabsVisible()` now waits
      (bounded 8s) for each tab to settle back visible before reading — still
      genuinely requires all three tabs.
    - Run 2: **233 passed, 6 skipped, 1 failed, 2 flaky**. The seller-badge
      flakes are GONE (fix held). ALL remaining failures are in
      `new-products` status-tab tests (Draft/Pending empty-tab + Out-of-stock) —
      a PRE-EXISTING determinism flaw in an already-converted spec I did NOT
      convert: its page object is byte-identical to `develop` and only an inert
      auth-path import changed in the spec. Reproduces in isolation, so it is not
      just parallel load. Root cause + fix recommendation documented at
      `tests/e2e/new-products/bugs/status-tab-flakiness.md`; deferred (out of
      Wave 0 conversion scope — needs a seed-relative rewrite + settle-on-skeleton,
      or surfaces a real stock-status-tab filter bug).
    - **Net Wave 0 verdict:** every file the foundation work touched is green
      across both runs (new-social + new-store-seo included, so the D6 retires are
      legitimate). The only red is the pre-existing new-products flake, which
      Wave 0 neither introduced nor is chartered to fix.
- Lint: repo uses a legacy `.eslintrc` incompatible with the installed ESLint 9
  (`eslint .` fails suite-wide on `develop` too — pre-existing, not caused
  here). Prettier: new/changed files formatted; remaining prettier warnings on
  legacy specs pre-date this branch (verified via stash).

### Wave 0 leftovers / notes for later waves

- F7 (menu-manager React-sidebar decision) is scheduled for Wave 4 per the
  wave plan.
- Shard-duration baseline refresh happens ONCE after all waves (final step),
  not per wave.
- `stripe-express` has a live env bug (PE not mounting) — do not chase as a
  conversion failure.

## Wave 1 — in progress

Build briefs (source-verified, DOM facts + seeding signatures + per-test
oracles + live-verify risk lists) authored by scout agents for ALL SIX items,
saved under the session scratchpad
(`.../scratchpad/wave1/{store-supports,product-qa,vendor-staff,vendor-verifications,vendor-return-request,vendor-support}.md`).

### B2 store-supports → `new-store-support/` — ✔ DONE (green 3×)

- `newStoreSupportPage.ts` + `newStoreSupport.spec.ts`. **14 vendor + 2
  cross-role tests, green 3× (2 headless + 1 headed), 15 tests.** Seeding:
  `activateModules('store_support')`, `createSupportTicket` (adminAuth
  hardcoded), customer REST `/dokan/v1/customer/support-tickets`, admin
  `updateSupportTicketStatus(id, 'closed', …)` (pass `'closed'`, not the legacy
  payload's `'close'`). Cleanup: raw `wp/v2/dokan_store_support/{id}?force=true`.
- Live-verification learnings: tab count badges are NOT in the tab text
  (`parseTabCount` returns 0) → dropped the redundant tab-count assertion (the
  filtering behavior is covered by the Open/Closed tab tests). Tab-filter
  absence assertions must be retrying (`await expect(locator).toHaveCount(0)`),
  not one-shot `expect(await count).toBe(0)`, since the list refilters async.
- Legacy retired: nested `describe.skip('vendor cases — ported to
new-store-support/')` wrapping the 11 vendor cases, leaving `admin can disable
store support module` (D3) active in the outer describe; the 3 vendor
  "(React)" smokes (TC1/2/4, legacy-URL) `test.skip`'d, admin TC3 kept.

### B5 product-qa → `new-product-qa/` — ✔ DONE (green 3×)

- `newProductQaPage.ts` + `newProductQa.spec.ts`. **9 vendor + 1 business-flow
  test, green 3× (2 headless + 1 headed), 10 tests.** Seeding:
  `activateModules('product_qa')`, `createProductQuestion` (customerAuth),
  `createProductQuestionAnswer` (vendorAuth = product author). Cleanup: bulk
  `PUT product-questions/bulk_action {action:'delete', ids}` (adminAuth).
- Live-verification learnings (verified with a throwaway `_diag.spec.ts`, since
  removed): - The answer-delete confirm modal is `role="dialog"` (NOT `alertdialog`),
  button label **"Yes, Delete"**. - Deleting an answer fires a **POST with a REST method-override, not a literal
  `DELETE`** to `/product-answers` → gate on any non-GET, not the DELETE verb. - The API models "no answer" as an **empty stub** `{ id: 0, answer: '',
user_display_name: 'Deleted User' }`, NOT an absent field → the deletion
  oracle checks answer _content_/`id === 0`, not object presence. - `apiUtils.get(url, opts, false)` disables the built-in 2xx assert — required
  for "deleted resource should 404" oracles (else `get` throws on the 4xx).
- Legacy retired: nested `describe.skip('vendor cases — ported to
new-product-qa/')` wrapping the 7 contiguous vendor cases (customer/guest/admin
  stay active, D3); the transitional "(React) Tests" describe (2 legacy-URL
  vendor smokes) `describe.skip`'d.

### C1 vendor-support → `new-vendor-support/` — ✔ DONE (green 3×)

- `newVendorSupportPage.ts` + `newVendorSupport.spec.ts`. **13 vendor + 3
  cross-role tests, green 3× (2 headless + 1 headed), 16 tests.** NET-NEW —
  no legacy vendor spec exists, so nothing is skipped (the wp-admin
  `adminVendorSupport.spec.ts` stays; it's a different SPA). Seeding: raw REST
  `POST/PUT/DELETE /dokan/v1/vendor-support/tickets` (vendorAuth to create as
  the owning vendor; adminAuth for the admin-reply `.../conversations` POST and
  cleanup DELETE), guarded by `activateModules('vendor_support')`.
- Covers: list mount + tabs, vendor-context columns (asserts the admin-only
  Vendor column + Delete row-action are ABSENT), Closed-tab filter, create via
  the Add-New-Ticket DokanModal (Quill body), search + empty state, row-action
  Close via the destructive alertdialog, detail thread, vendor reply,
  reply-reopens-closed, HashRouter reload; cross-role: admin reply appears in
  the vendor timeline, a full create→admin-close business flow, customer
  non-mount.
- Live-verification learning: the detail timeline paints only after the async
  ticket GET resolves (slow on the polluted DB) — `detailHasText` now waits for
  the `#<id> - <subject>` heading, then polls the SPA-root text (fixed a race
  where the admin-reply assertion ran before the timeline rendered).
- feature-map: new `page: 'Vendor Support'` entry (13 vendor + 3 cross-role
  new-UI leaves). Flagged that the wp-admin `adminVendorSupport.spec.ts` (14
  cases) was NEVER mapped — pre-existing gap, noted inline in the YAML.

### B4 vendor-staff → `new-vendor-staff/` — ✔ DONE (green 3×)

- `newVendorStaffPage.ts` + `newVendorStaff.spec.ts`. **9 vendor + 3 staff +
  1 admin-gate = 13 tests, green 3× (2 headless + 1 headed).** Covers: list
  render, create (Add-New-Staff form), edit, grant/reset permissions (checkbox
  ids == capability keys), delete (destructive alertdialog), Name-link →
  edit navigation, row-action menu; staff-context: default-cap sidebar
  visibility (Products/Orders shown, Withdraw/Staff hidden), a vendor-grants-cap
  → staff-sidebar-gains-menu cross-role flow, and staff denied the
  staff-management route; admin: module deactivate → Staff menu gone → reactivate
  → menu back. Seeding: `createVendorStaff(vendorAuth)`, `updateStaffCapabilities`,
  raw DELETE `{id, force:true}`; staff-login via a local my-account `frontendLogin`
  helper (no staff storage state exists) with a REST-seeded known-password staff.
- Live-verification learnings:
    - The Name cell is a clickable `<div class="!dokan-link … cursor-pointer">`
      (Tailwind important prefix), NOT an `<a>` — selector `[class*="dokan-link"]`.
    - DokanToaster toasts render with EMPTY text and auto-dismiss → never assert on
      toast text; the REST/DB and list-row oracles are the real proof (dropped all
      5 toast assertions).
    - A form-created staff's `user_login` is WP-sanitized (not the raw email), and
      `getAllVendorStaffs` paginates → the create oracle is the React list-row
      (newest-first), with REST used only for best-effort cleanup.
    - The staff SPA (R5) DOES mount for a `vendor_staff` user; the server-filtered
      sidebar drops unpermitted menu `<a>`s, so visibility is assertable by name.
- Legacy retired: describe 2 (`Vendor staff test (vendorStaff)`, both cases
  stub-backed via `new ApiUtils(null)`) and describe 3 (three "(React)" smokes
  on a NON-EXISTENT `dashboard/vendor-staff/` URL) → `describe.skip` with
  pointers; describe 1 was already skipped. feature-map: 13 new-UI leaves under
  `'Vendor Staff Manager'` (vendor/staff/admin new-UI groups); legacy leaves
  flipped to `false`.

### B7 vendor-return-request → `new-return-request/` — ✔ DONE (green 3×)

- `newReturnRequestPage.ts` + `newReturnRequest.spec.ts`. **9 vendor + 1
  cross-role = 10 tests, green 3× (2 headless + 1 headed).** Covers: list
  render, status-tab filter, details (Order/Reason cards), send RMA message,
  update status (new→processing), delete, **send refund** (masked
  DokanPriceInput modal + admin `getRefundIdByOrderId` pending-refund oracle),
  not-found, reload; cross-role: a customer-created request appears on the
  vendor list.
- Seeding is REST-only (RMA data lives in custom tables `wp_dokan_rma_*` with a
  cache group invalidated only via module actions — raw SQL would serve stale
  reads): fresh WC order (`createOrderWithStatus`) → `POST
/dokan/v1/rma/warranty-requests` as **customerAuth** (create is customer-only;
  admin/vendor get 403) with a real order line-item id → recover the request id
  via `GET ?order_id=` as vendor (the POST body carries no id). Seed the target
  status at create time (a PUT of an unchanged status errors). Cleanup: DELETE
  each as vendorAuth (vendor-only rule).
- Live-verification learning: the row **Delete is a TWO-LAYER confirm** — the
  plugin-ui destructive alertdialog ("Are you sure? This action cannot be
  undone." → "Delete") THEN the module's own DokanModal ("Delete <Type>
  Request … Are you sure you want to continue?" → "Yes, Delete") which fires the
  actual DELETE. Confirming only the first layer does nothing.
- Legacy retired: the `Vendor RMA test` describe was already fully skipped (all
  stub methods incl. a fake UI-checkout seed) — added a pointer; the transitional
  "(React) Tests" describe (2 legacy-URL smokes) → `describe.skip`. RMA _settings_
  (`dashboard/settings/rma`) stays legacy (no React route). feature-map: 10
  new-UI leaves under 'Return and Warranty Request'; legacy vendor leaves → false.

### B6 vendor-verifications → `new-vendor-verifications/` — ✔ DONE (green 3×)

- `newVendorVerificationsPage.ts` + `newVendorVerifications.spec.ts`. \*\*9 vendor
    - 1 cross-role = 10 tests, green 3× (2 headless + 1 headed).** This is a CARD
      list (not DataViews): view page, submit-with-**wp.media-upload\*\*, no-document
      validation, resubmit-rejected, cancel-pending (DokanModal "Yes, Cancel"),
      view documents, view note, approved-has-no-actions, reload; cross-role: an
      admin-approved request reflected on the vendor card.
- Seeding: `activateModules('vendor_verification')`, one shared
  `uploadMedia(avatar)` (also guarantees the wp.media Library tab is non-empty),
  `createVerificationMethod`/`createVerificationRequest` (adminAuth can set any
  status), `updateVerificationRequest` for admin approve. Cleanup: delete each
  method (never the DANGEROUS `deleteAll*`).
- Live-verification notes: NO headless-hang materialised (the flagged risk) —
  the one-shot GET resolved fine; the wp.media Library recipe worked headless
  (Browse tab → first attachment → "Use this media"); readiness keys on the
  always-present "Social Profiles" card (there is no zero-methods empty state);
  the page never refetches, so every mid-test REST write is asserted after a
  fresh `goto`.
- Legacy retired: the 6 vendor-DASHBOARD cases wrapped in a nested
  `describe.skip` (admin + setup-wizard [different surface] + customer stay
  active, D3); the transitional vendor "(React)" smokes (legacy URL) →
  `describe.skip`; the admin "(React)" smokes (wp-admin SPA, different surface,
  covered by admin/adminVerifications) left as-is. feature-map: 10 new-UI leaves
  under 'Vendor Verification'; the 6 legacy vendor-dashboard leaves → false.

## Wave 1 — COMPLETE ✅

All six items done and green 3× (2 headless + 1 headed) against Docker :9999,
each committed on `qa/new-ui-suite-wave-0`: B2 store-support, B5 product-qa,
C1 vendor-support (net-new), B4 vendor-staff, B7 return-request, B6
verifications. Next: Wave 2 (product-edit parity + D2 consolidation, orders
gaps + C2 order-edit, refunds, products gaps), then Waves 3–4, then the final
CI shard-duration rebalance.

## Wave 2 — in progress (branch `qa/new-ui-suite-wave-2`, stacked on wave-0)

### B1 product-edit + D2 consolidation → `new-product-form/` — ✔ DONE (green 3×)

- **D2 consolidation:** `git mv`'d `product-form-manager/newProductForm{Page.ts,
.spec.ts,Validation.spec.ts,Advanced.spec.ts}` → `tests/e2e/new-product-form/`
  (the 3 create specs import `./newProductFormPage`, same-dir, unchanged). The
  wp-admin `productFormManagerAdmin*` files stay in `product-form-manager/`
  (different SPA, `@admin`, not `@new-ui`). Extended `newProductFormPage.ts`
  with `editUrl(id)`/`gotoEdit(id)`/`waitForEditReady()`/`saveEdit()`
  (no-redirect: PUT-response + "Product saved successfully." toast, NOT a URL
  race — edit does not redirect) + read-back getters.
- **`newProductFormEdit.spec.ts`: 10 edit-persistence tests, green 3× (2
  headless + 1 headed).** Each mutates a field on `/products/:id/edit`, clicks
  Update Product, and asserts persistence via `getSingleProduct` (REST) +
  reload: title, price, discount sale price, sale>regular VALIDATION (negative —
  no PUT fires), short+long descriptions, virtual, SKU, catalog visibility,
  category change, feature image (wp.media). This replaces the legacy
  products-details 95 vacuous stub greens with real behavioral oracles.
- Live-verification learnings:
    - The seeded product MUST carry a `regular_price` — the editor's "Update
      Product" button is `disabled` while the form is invalid (price required), so
      a priceless seed blocks every non-price edit (10 tests failed on this until
      fixed). `seedProduct` now defaults `regular_price: '50'`.
    - The editor is HEAVY (~37s/test). Under sustained parallel/headed load the
      wp-env memory-degrades badly (a 2-worker run hit 1.2h with 12–21 min
      per-test stalls); single-worker runs are ~6 min and stable, and the site
      recovers instantly. Run this spec single-worker.
- **BACKLOG (deferred, documented):** manage-stock+quantity, stock-status
  select, and add-tags do NOT persist through their dynamic/react-select
  interactions on the EDIT surface (they behave differently than on create —
  random stockQty id, stock-status select hidden once manage_stock is on,
  creatable-tags input re-renders mid-type). Need live selector work; kept out
  rather than shipped flaky. PLUS the remaining ~80 legacy field groups
  (gallery, downloadable files, schedule dates, shipping dims/class, tax,
  linked, attributes, bulk-discount, geolocation, addon, RMA, wholesale,
  min-max, catalog-mode, multi-step category) — later batches.
- Legacy retired: `products-details/productsDetails.spec.ts` whole describe
  (all-vendor stubs) → `test.describe.skip` with a pointer (D3-safe blanket).
  feature-map: 10 new-UI edit leaves added to the 'Products' `vendor (new UI)`
  group.

### B14 orders gaps — ✔ PARTIAL DONE (green 3×); C2 order-edit — REFRAMED (scout finding)

- **`new-orders/newOrdersGaps.spec.ts` — 2 tests, green 3×:** (1) a row
  status-change that PERSISTS — drive "Change status to completed" through the
  confirm dialog, then REST `getSingleOrder(id).status === 'completed'` (the
  existing new-orders test only asserted a request fired); (2) the house-style
  MONEY ORACLE — vendor earning + admin commission (per line-item, admin+vendor
  REST) reconciles to the order's product revenue — asserted nowhere before.
- DEFERRED (documented): the CSV export-download test — the React export is a
  hidden-form POST to a nonce'd URL and headless Chromium does not fire a
  `download` event for it (R6); customer-filter + date-range row-correctness are
  backlog. feature-map: 2 new-UI leaves under the Orders `vendor (new UI)` group.

Original scout finding (unchanged):

Not built. Scout found: `/orders/edit/:id` renders the SAME manual-order editor
already covered by `new-manual-order/`; its only net-new value is deep-linking a
seeded MANUAL order (needs a new `POST /dokan/v1/manual-orders` seeder —
`createOrderWithStatus` makes admin WC orders that render `<Forbidden>` on the
vendor edit route). The React list has NO row-action to the edit route.
Tracking/downloads/shipment have NO React surface (stay legacy). B14 gaps to add
to `new-orders/`: real export download, customer-filter/date-range row
correctness, row status-update persistence, list money oracle.

### B20 refunds — STAYS LEGACY (scout finding — no React surface)

Not converted. There is NO React refund UI: the React Orders "View" action
deep-links (`window.location.href`) to the LEGACY PHP order-details page, whose
refund form is WooCommerce jQuery (`wc_input_price` + WC-AJAX
`woocommerce_refund_line_items`). The React `/orders/edit/:id` manual-order
editor has no refund UI. So a refund test cannot legitimately carry `@new-ui`
(D4) — it belongs in the legacy suite, not a `new-*` folder. (Admin refund-queue
cases stay admin; the legacy "(React)" refund smokes should be relabeled
`@admin`.)

### B17 products creation gaps — ✔ PARTIAL DONE (green 3×) + limitations found

- **`new-products/newProductsProActions.spec.ts` — 3 Pro list-action tests, green
  3×:** Pro row actions offered (Quick Edit / Duplicate), duplicate from the row
  menu (gated on `POST /dokan/v2/products/:id/duplicate`; REST oracle: 2 rows
  share the name), quick-edit a price (DokanModal "Quick Edit Product" → Update
  Product → `POST /dokan/v3/products/batch` → REST `getSingleProduct` confirms the
  new price). Extends the Lite list coverage in `new-products/`.
- **`new-product-form/newProductFormTypes.spec.ts` — 1 create test, green 3×:**
  create a virtual product (full create + `virtual===true` via REST) — the
  legacy virtual motive, previously only a toggle assertion.
- **LIMITATION found live (deferred):** the React editor lists External/Affiliate
  and Group Product in the type dropdown but does NOT render their type-specific
  fields (`external_url`/`button_text`/`grouped_products` wrappers are absent
  after choosing the type) → external/grouped CREATE cannot be driven from the
  form yet (a real editor gap). Variable (two-step) + subscription (module-gated)
  creates + downloadable-with-file remain backlog. Also: the editor requires a
  non-empty **description** before Save enables.
- Deferred (legacy re-enablement, not a new-UI conversion): the D3 split of
  `products/products.spec.ts` to revive its 8 healthy admin wp-admin cases —
  needs those heavy wp-admin tests verified; recommended as a follow-up.
- CSV import/export stays legacy (no React route). feature-map: 4 new-UI leaves
  added to the Products `vendor (new UI)` group.

---

## Wave 3 — modules (branch `qa/new-ui-suite-wave-3`, stacked on wave-2)

Twelve module surfaces built as self-contained `new-*` folders, each green on a
single run (collective batch re-validation pending). Build order was by
reliability: clean DataViews-list / DokanModal surfaces first, seeder-risky ones
later, retire-only last. The `e2e_tests` project only selects TAGGED tests — a
gotcha that cost a debugging loop (untagged diag specs silently vanish); every
real test carries `{ tag: [...] }`.

### Shipped green
- **B11 `new-followers/`** — followers DataViews list (read-only): open/columns,
  cross-role follow→row-appears (REST `followStore`), search, empty-state, reload,
  cross-role mount-negative. **PRODUCT BUG FOUND + filed** (`bugs/follow-store-followers-cache-stale.md`):
  the vendor followers list is cached under `get_followers_<md5(args)>` but the
  unfollow toggle invalidates only the literal key `get_followers` (should be
  `Cache::invalidate_group`), so an unfollowed customer keeps showing for ~2 weeks.
  The "unfollow removes follower" test is `test.fixme` referencing the bug (no
  fake-green); the follow direction (cold-cache) asserts normally.
- **A2 `new-shipstation/`** — Generate/Revoke credential DokanModals; oracle is the
  REST credential-existence flip (200 key_id ↔ 404 dokan_pro_rest_no_resource) +
  the card Generate↔Revoke state flip. 4/4.
- **B9 `new-requested-quotes/`** — RFQ DataViews list: tabs (label≠key), search,
  Move-to-Trash (alertdialog confirm) + Restore, View→legacy smoke, reload,
  cross-role. Admin-seeded quotes (store_id=VENDOR_ID) DO surface on the vendor
  list. 8/8. (Quote detail stays legacy — no React :id route.)
- **B18 `new-product-addons/`** — global add-ons DataViews list: seeded-row render,
  category cell, client-search, DELETE (with a plugin-ui **alertdialog confirm** —
  the scout's "no confirm modal" was wrong; verified live), Create-New link smoke,
  reload, cross-role. Seed = createProductAddon(admin) + dbUtils.updateCell
  (post_author→VENDOR_ID). 7/7. Create/edit/import/export forms stay legacy.
- **B21 `new-announcements/`** — vendor bulk-DELETE (the sole gap over
  announcementsNewUI): card checkbox → Delete → DokanModal "Yes, Delete" → DELETE
  /announcement/notice/{id} + card leaves list; plus Cancel-keeps + modal-opens.
  The per-vendor NOTICE is created by a **WP background process** (async) → hardened
  with a reload-retry `findCard()`. 3/3.
- **B8 `new-auction/`** — products DataViews list (open/columns/tabs/search/empty/
  delete-with-confirm/edit→legacy/reload) + activity list (columns-when-data-else-
  empty; **no REST bid seeder** — documented) + cross-role. 10/10.
- **B24 `new-seller-badge/` (extended)** — +2 gap tests: Available-Badges tab
  partitions rows (admin-seeded unacquired badge under Available, absent under My
  Badges) and the **"Congratulations!" congrats popup** (DB-seeded badge_seen=0
  acquired row via dbUtils.dbQuery; gated on the unseen-badges GET; dismissal fires
  set-badge-as-seen and doesn't reappear). 10/10.
- **A3+B3+A1 `new-booking/`** — products list (search/delete-REST-oracle/reload),
  resources (Add-Resource DokanModal — POST-response id oracle; Remove), calendar
  (FullCalendar render + calendar-events REST), cross-role. Trap: `has-text("OK")`
  matched the "All Bo(ok)ing Product" tab → dialog-scoped exact match. 10/10.
  **DEFERRED:** my-bookings list + Confirm-pending-booking — a booking ROW has no
  dokan create-REST (needs wc-bookings POST + _booking_seller_id/pending-confirmation
  meta or a storefront checkout). vendor-booking-fast is a duplicate to retire.
- **B12 `new-user-subscription/`** — user-subscription DataViews list (search=false):
  seeded-row + columns, active Status badge, View→detail route, reload, cross-role.
  **Seeder WORKS**: POST /wc/v3/subscriptions + `_dokan_vendor_id` meta surfaces on
  /dokan/v1/product-subscriptions (self-probed in beforeAll; data tests gate on it).
  6/6 (seedOk true).
- **B13 `new-subscription/`** — vendor subscription packs CARD surface: mount/cards,
  empty Current-Subscription, orders DataViews route, reload, cross-role (5 green).
  Pack-listing test is a **documented skip** — the pack seeder (product_pack term +
  save-commission) is still blocked exactly as the legacy `vendor-subscriptions`
  suite recorded (`test.skip(true, 'need to update create dokan subscription product')`).
  Cancel/active-pack DEFERRED (assignSubscriptionToVendor mints a NEW store — vendor
  identity mismatch).
- **B19 `new-product-advertising/`** — Advertise column render + Promote control,
  REST advertised round-trip (createProductAdvertisement → getAllProductAdvertisements),
  draft-cannot-advertise error modal (client-side guard), reload, cross-role. 6/6.
  **Scout's flagged "likely live bug" did NOT reproduce**: window.dokan_purchase_advertisement
  IS localized on the new dashboard with a valid advertise_product_nonce (logged) —
  so the interactive Promote is NOT broken. Paid checkout stays in stripe-express.
- **B10 `new-delivery-time/`** — labeled MOUNT SMOKE only (FullCalendar dashboard,
  not DataViews; settings surface is legacy PHP): mount + calendar paints, reload,
  cross-role. 3/3. No behavioral React CRUD to port (§7); set-slots stays legacy.

### Reusable gotchas found live (Wave 3)
- The `e2e_tests` project filters to TAGGED tests only — untagged diag/probe specs
  are silently "No tests found". Single-file path args also mis-resolve; run by
  FOLDER path (+ `-g "<title>"` to target one tagged test).
- Dokan list caches (`Cache` = wp_cache w/ group-prefix versioning) — the correct
  invalidation is `Cache::invalidate_group`; a bare `Cache::delete('key', group)`
  misses per-arg-hash keys (the follow-store bug).
- plugin-ui DataViews destructive row actions DO render a `role="alertdialog"`
  confirm even when the action def has only a callback (add-ons delete) — always
  confirm, don't assume "no modal".
- Announcement notices + (some) list read-backs are async/paginated — gate on the
  create POST response id, or reload-retry the UI, rather than a one-shot list read.

### Bookkeeping pending for Wave 3 (in progress)
- Legacy nested `describe.skip` of the ported VENDOR blocks (admin/customer/
  storefront STAY, D3) + retire the D4 "(React)" smokes at legacy URLs + remove/
  retire `vendor-booking-fast`. feature-map `vendor (new UI)` leaves. Then commit.

---

## Wave 4 — long tail (branch `qa/new-ui-suite-wave-4` — NOT yet cut; built on wave-3 working tree)

Scouted (4 parallel read-only briefs in session scratchpad `wave4/`) then built the
CLEAN, high-confidence items; the seeder-risky ones are deferred with documentation
(below). Wave 4 is mostly EXTENSIONS of existing folders + one net-new + several
stays-legacy DECISIONS.

### Shipped green
- **B26 setting order-status gate** — extends `new-orders/newOrdersGaps.spec.ts`: the
  NEGATIVE capability path (the positive is already covered). With
  `dokan_selling.order_status_change='off'`, the vendor's React row-action status change
  is rejected server-side → REST oracle `getSingleOrder` shows the status UNCHANGED.
  Serial block; seeds the order BEFORE toggling off (the create-with-status endpoint is
  itself gated); restores the option in afterAll. 1 test green.
- **F7 menu-manager** — NET-NEW `new-menu-manager/`: the React sidebar honors
  dokan_menu_manager (rename → label text, hide → `<a>` absent, reorder → position).
  DB-seed `dokan_menu_manager.dashboard_menu_manager.left_menus`; assert on the vendor
  sidebar; restore in afterAll. 4 tests green (rename/hide/reorder/cross-role).
  **GOTCHA found live:** `is_switched_on` is run through `wc_string_to_bool` which does
  NOT accept `'on'` (→ false, hides the item) — must use `'yes'`/`'no'`. The legacy
  menu-manager page object is a NO-OP STUB (its admin tests assert nothing) so this is
  net-new vendor coverage; the admin settings-page validations STAY legacy (D3).
- **B23 wholesale verify** — extends `new-product-form/` (`newProductFormWholesale.spec.ts`):
  the existing "enable wholesale" test only checked the checkbox. Added a CREATE-surface
  persistence test (REST `_dokan_wholesale_meta` == {enable_wholesale:'yes', price:'60',
  quantity:'10'}) + an EDIT-surface hydration test (seeded product shows enabled). 2 tests
  green. **R-B23-1 DISPROVED:** wholesale price/qty DO persist on React create — the
  earlier "empty price" was purely a **stale selector** in the shared `enableWholesale()`
  (`input[name="wholesale_price"]` / `#dokan-form-field-wholesale_price` no longer exist;
  the base-ui fields render with auto-generated ids → target by field LABEL). Worked
  around locally; the shared page-object selector drift is worth a follow-up fix.

### Recorded STAYS-LEGACY (no build — verdicts from the briefs)
- **B22 EU/Germanized product fields** — hook the LEGACY product form
  (`dokan_product_edit_after_main`); ZERO `dokan_product_editor_schema` injection → no
  React surface. The 3 product-EU vendor cases stay `test.skip` in euCompliance.spec.ts.
- **B27/B28 vendor Stripe legs** — SE-SUB cancel/reactivate drive the legacy
  `/dashboard/subscription/` inline form; SE-ONB-04 + SE-SET-18 render on the legacy
  Payment-settings / dashboard-home (no `/dashboard/new` route). Payment settings is
  confirmed legacy 3 ways. Stripe branch scope respected (no edits there). The lying
  "(React)" smoke to relabel lives in `payments/` (D4, payments-folder owner).
- **B16 reverse-withdraw grace/after-grace NOTICES + announcement** — PHP template
  (`dokan_reverse_withdrawal_content`); React never renders `display_notice`. Stay legacy.

### DEFERRED (buildable but seeder-risky — documented for follow-up)
- **B15-a auto-withdraw disbursement schedule** (React DokanModal) — needs a live-verified
  `dokan_withdraw` disbursement-enable seed (exact keys that flip
  `is_withdraw_disbursement_enabled`).
- **B15-b make-default withdraw method** — needs bank+paypal active_methods seeded so the
  React "Make Default" (not "Setup") renders.
- **B16-4 reverse-withdraw date filter** (bespoke DateRangePicker) + **B16-6 Pay-Now**
  (add-to-cart + redirect) — need a seeded dated txn / payable balance.
- **B30/B31 shipping table-rate + distance-rate drill-in forms** — extend `new-shipping/`;
  reached by add-method → row-action Edit → per-instance route; distance-rate is GMAP-gated.
  Add-method-then-Edit navigation + per-instance PUT oracle to be built live.

### Bookkeeping pending for Wave 4
- Retire the legacy `Wholesale test (vendor)` case + comment the EU skips + relabel the
  payments "(React)" smoke (after 3× green per §8). feature-map `vendor (new UI)` leaves
  for menu-manager + wholesale + the orders gate. Cut branch `qa/new-ui-suite-wave-4`,
  commit (awaiting approval). Then the FINAL 12-shard duration rebalance.

### Wave 4 deferred — progress
- **B15 SHIPPED** (`new-withdraw/newWithdrawB15.spec.ts`, green): B15-b set-default
  withdraw method (React "Make Default" -> POST /v2/withdraw/make-default-method ->
  REST withdraw_method flip) + B15-a disbursement-schedule widget renders when
  disbursement is enabled (dbUtils dokan_withdraw seed + REST enabled:true). Seeds
  paypal+bank active_methods. NOTE: dbUtils.updateOptionValue deep-merges (cannot
  remove keys) — disbursement stays enabled after this suite; harmless (widget-only).
- **STILL DEFERRED** (briefs ready; iteration impractical under the current ~16min/run
  degraded wp-env): B16-4 RW date-filter (DataViews Date-Range field), B16-6 RW
  pay-now (add-to-cart+redirect), B30/B31 shipping table-rate/distance-rate drill-in
  forms (add-method -> Edit -> per-instance route). Each needs live selector/seeder
  iteration that the slow env makes unreliable to complete now.

---

# Phase 0–4 resume run (2026-07-09) — reconcile + **KEEP LEGACY SUITE** mandate

New team-lead decision: **KEEP the legacy (old-UI) test cases for legacy support.**
End state = **two parallel, both-green e2e suites**: the additive `new-*` React suite
(`/dashboard/new/#/<route>`) AND the classic legacy suite (`/dashboard/<route>`)
restored to fully functional. The old-UI cases keep testing the OLD UI in their
original folders; the new-UI cases are an ADDITION, never a replacement.

## Phase 0 — Reconcile onto ONE branch `qa/new-ui-suite-wave-0` ✔

Ground truth re-derived from the repo (repo root:
`wp-content/plugins/dokan-lite`; the working dir `dokanautomation/` is the WP install,
NOT a git repo — the git repo is the plugin dir):

- `origin/qa/new-ui-suite-wave-0` = PR #3303 head = **`215b85718`** = local branch
  `qa/new-ui-suite-wave-4` = the COMPLETE Waves 0–4 conversion = **30 `new-*` folders**
  (verified `ls-tree`). Based on develop @ `ece223fc9` (pre-5.0.8).
- Local checked-out `qa/new-ui-suite-wave-0` was diverged @ **`38d2c0bde`** = only
  **17 `new-*` folders** (Waves 0–1) + a merge of develop-5.0.8 + fix #3300.
- `merge-base(38d2c0bde, 215b85718)` = `23a81697b` (Wave 1 COMPLETE) — the divergence
  point. Diff of the 17 shared folders (`23a81697b`→`215b85718`) is **all additions**
  (waves 2–4 added specs, removed none) ⇒ `215b85718` is a strict **superset** of the
  wave-0/1 test work. The diverged local checkout had **zero unique test work**; its
  only unique content was develop-5.0.8 + fix #3300 (`e3391ac55`, which touches ONLY
  `src/dashboard/product-editor/components/PriceEdit.tsx`, and is already in
  `origin/develop`).

**Reconcile performed (lossless, no rebuild):**
1. Safety net: branch `backup/wave-0-prereconcile-38d2c0bde` @ `38d2c0bde` + tag
   `backup/full-conversion-215b85718` @ `215b85718` (both reversible).
2. `git reset --hard 215b85718` (make wave-0 the full 30-folder conversion base).
3. `git merge origin/develop` → **clean, conflict-free** (the prompt predicted
   conflicts in feature-map.yml / shard-durations.json / CONVERSION-LOG.md /
   package-lock.json, but the overlap of files-changed-by-both-sides since the shared
   merge-base `ece223fc9` was **empty**: develop only bumped version files +
   `PriceEdit.tsx`; the conversion is test-only). Merge commit `d9bca4de5`.

**Post-reconcile asserts (all pass):** `git branch --show-current` ==
`qa/new-ui-suite-wave-0`; `ls -d tests/e2e/new-*` == **30**; develop content present
(`dokan.php` Version 5.0.8, `PriceEdit.tsx` #3300 fix); `tsc --noEmit` clean on every
`.ts` (only the pre-existing plain-JS util-script implicit-any noise remains, confirmed
on the develop baseline). Working tree otherwise clean (the untracked
`stripe-express/bugs/` is another branch's scope — left untouched, never `git add`ed).

## Phase 1 — Conversion-completeness AUDIT ✔ → `feature-map/CONVERSION-AUDIT-2026-07.md`

Ran an 8-area read-only audit workflow (per-feature-area readers → adversarial gap-verify →
matrix), cross-referencing the 165-spec plan-of-record, `feature-map.yml` `(new UI)` leaves,
actual `new-*/*.spec.ts` titles, and each legacy spec's page object (stub vs real).

**Verdict: the React conversion is essentially COMPLETE.** 61 vendor-relevant feature rows:
19 converted, 17 partial (every partial's residue is documented-deferred — seeder-blocked /
React-editor-limited / no-React-surface), 12 stays-legacy (no React route), 12 not-affected.
**Exactly ONE claimed gap survived adversarial verification** → Phase 2:
- **GAP-1** shipping **table-rate / distance-rate per-instance drill-in forms** (B30/B31),
  route `/settings/shipping/:zoneID/{table-rate|distance-rate}/:instanceID`, seeder confirmed.
  (This is the known-deferred Wave-4 item; the earlier deferral was env-speed, not infeasibility.)

Big structural finding: **63 legacy page-object files carry ~800 empty-body stub methods** (the
`#3173` "Full suite refactoring" born them as stubs — NOT recoverable from git history). So the
legacy suite was already largely fake-green BEFORE the conversion. Phase 3 is therefore correctly
**bounded to the 39 conversion-ADDED skip blocks** (not the 94 pre-existing skips).

### Phase-3 revival inventory + ACTION POLICY (decision, no fake green — house-style §7)

39 conversion-added blocks, three classes:
- **A. real-redundant (5)** — real PO already drives the legacy DOM → **un-skip + green 3×** vs
  classic `/dashboard/<route>`. (announcements ×3, follow-store ×2.)
- **B. stub-vacuous (13)** — legacy PO is a no-op stub → **rebuild the PO** with live legacy-DOM
  selectors + real behavioral assertions, un-skip, green 3×. (products-details[95], store-supports[11],
  vendor-return-request[6], vendor-verifications[6], vendor-staff, product-qa, product-addons ×2,
  seller-badges ×4, withdraws.)
- **C. react-smoke-legacy-url (21)** — `(React) Tests` blocks that navigate a **legacy** URL and
  assert only `body.innerText.length > N` / no-fatal. Un-skipping them = **fake green** (§7 forbids
  body-length). They are superseded by the `new-*` React specs (React side) AND, for A/B features,
  by the revived real legacy vendor cases (legacy side). **DECISION: retire (delete) these vacuous
  smoke blocks**, following the D4/D6 "retire lying smokes" precedent the conversion itself used for
  social-linking/store-seo. They are NOT legacy test cases — they were React-rollout scaffolding
  added *during* the 5.0 rewrite ("Added during the 5.0.0 React rewrite" banner), so deleting them
  does not remove any legacy-support coverage. The genuine legacy regression coverage is restored by
  classes A + B.

Rationale recorded per the prompt's autonomy grant: reviving a `body.innerText.length` smoke would
either pass vacuously (forbidden) or duplicate the class-A/B real legacy case for the same page.

### Phase-3 execution order (by cost, most-user-facing first within a tier)
1. Class A un-skips (cheap): follow-store ✔ (green 3×), announcements ×3.
2. Class C retires (edit-only, verify-vacuous-then-delete): 21 blocks.
3. Class B rebuilds (expensive live selector work): seller-badges → product-addons → product-qa →
   vendor-staff → store-supports → vendor-return-request → vendor-verifications → withdraws →
   products-details[95] (largest, likely partial/deferred). Each genuinely green 3× or left skipped
   with a "rebuild-required" note — never fake-green.

### Phase-3 progress
- **follow-store (class A) ✔ green 3×** (2 headless + 1 headed): un-skipped `vendor can view
  followers menu page` + `vendor can view followers`; real PO drives classic `dashboard/followers`
  (`//h1[="Store Followers"]` + legacy `.dokan-table`). Coexistence CONFIRMED — legacy
  `/dashboard/<route>` pages still render in 5.0.8. (Env healthy ~2.1m/run; headed mode works.)
  Retired its vacuous `(React) Tests` smoke block (body-length at legacy URL) as the class-C exemplar.
- **announcements (class A) — `Old Test Case 11 - Vendor Deletes Announcement` revived, green 1×**
  (batch-3× pending): real PO drives legacy `dashboard/announcement` admin-ajax delete. Its
  `Test Case 14 …New Vendor Dashboard` + the `New Vendor Announcement (React) Tests` describe.skip
  navigate the NEW dashboard (`dashboard/new/#announcement`, `#dokan-vendor-dashboard-root`) — those
  are redundant NEW-UI smokes (superseded by new-announcements/), NOT legacy cases → left skipped
  (out of legacy-revival scope; D1 migration candidates).

### Live legacy-render probe (2026-07-09) — ALL class-B pages are REVIVABLE
Ran a throwaway vendor probe over the 8 class-B legacy URLs (deleted after). **Every one renders the
classic PHP/Vue UI in 5.0.8 with `#dokan-vendor-dashboard-root` ABSENT** (real headings): `dashboard/support`
("Support Tickets"), `dashboard/return-request` ("Return Requests"/"Send Refund Request"),
`dashboard/settings/verification` ("Verification"), `dashboard/staffs` ("Staff/Add new staff"),
`dashboard/product-questions-answers` ("Product Questions & Answers"), `dashboard/settings/product-addon`
("Product Addons"), `dashboard/seller-badge` ("Badges"), `dashboard/withdraw` ("Withdraw"). So no class-B
feature is React-only — all can be revived against the legacy UI.

### Class-B rebuild strategy — pre-#3173 RECOVERY shortcut
The stub POs were BORN as stubs in `#3173` "Full suite refactoring" (no real impl in *their* history),
BUT the pre-#3173 tree (`e2ec507de`) holds the ORIGINAL real page objects at `tests/pw/pages/<feature>Page.ts`
with real legacy selectors + method bodies (e.g. `storeSupportsPage.ts` = 501 lines, real
`storeSupportsVendor` selectors, `wp-comments-post.php` 302 reply). Rebuild recipe per feature: recover the
real PO from `e2ec507de` → adapt to the current BasePage helpers (same names) + wire REAL @utils/apiUtils
seeding mirroring the co-located `new-*` folder (seeding+oracles identical to the React spec; only the driving
surface differs) → un-skip the conversion-added vendor block → green 3× vs the legacy URL. Recovery files
confirmed present for: storeSupports, productQA, vendorStaff, vendorReturnRequest, productAddons,
sellerBadges, vendorVerifications, withdraws, reverseWithdraws.

### Class-C decision (finalized)
The 21 `react-smoke-legacy-url` blocks are **already `describe.skip`'d, so they emit NO fake green** (a
skipped test is not a passing test — §7 forbids *passing* vacuously). They add zero coverage either way.
follow-store's was deleted as the exemplar; the remaining 20 are **retired-in-place (kept skipped) +
documented** — deletion is safe cleanup but is deferred this pass to spend budget on the higher-value
class-B REAL-coverage rebuilds. None are un-skipped (that would fake-green).

### GAP-1 shipping drill-in — DONE (2026-07-09), green 3× headless
New self-contained folder **`tests/e2e/new-shipping-rate/`** (`newShippingRatePage.ts` + `newShippingRate.spec.ts`)
closes the one confirmed conversion gap: the React vendor-dashboard **per-instance shipping settings forms**
(`/dashboard/new/#/settings/shipping/:zoneID/{table-rate|distance-rate}/:instanceID`), which the zones-list
spec (`new-shipping/`) never reaches. Rendering components: Pro module `table-rate-shipping/src/js/vendor-dashboard/`
`table-settings/index.tsx` + `distance-settings/index.tsx`.

4 tests (all `['@pro','@vendor','@new-ui']`):
- **TR-1** table-rate form renders on a REST-seeded deep-linked instance (`.dokan-table-rate-shipping-settings-container`
  + Method Title input + `#table-rates-shipping-table` + "Save Changes"; not NotFound).
- **TR-2 (PRIMARY oracle)** Method Title persists: fill → "Save Changes" paired with the version-agnostic PUT
  `/dokan\/v[0-9]+\/shipping\/table-rate\/settings\/zone\/\d+\/instance\/\d+/` (assert `.ok()`), then full reload +
  input read-back equals the value (the mount GET re-reads persisted `settings.title`). No render-only/no-fatal
  stand-in; if persistence silently broke either the PUT status or the read-back would fail.
- **DR-1** distance-rate GMAP gate: asserts `.dokan-alert-danger[role="alert"]` "requires Google map API key".
- **DR-2** distance-rate persist (PUT + reload read-back), mirroring TR-2 for the distance form.

**Seeding (brief §3):** vendor method instances live in `{prefix}dokan_shipping_zone_methods` (seller-scoped) — the
WC-v3 helper cannot create them and there is no ApiUtils wrapper. So each test `apiUtils.post`s
`/dokan/v1/shipping/{zoneId}/methods/` with **VENDOR** auth (`method_id: dokan_table_rate_shipping` /
`dokan_distance_rate_shipping`), extracts the newest `instance_id` from the keyed `"{method_id}:{instance_id}"`
map, deep-links it, and `apiUtils.delete`s it in `afterEach`. Depends on `_env.setup.ts:57-60` enabling those
methods on the admin US zone — otherwise `ShippingZone::get_shipping_methods` (available_shipping_methods gate,
`Hooks.php::add_table_rate_method`) filters the new instance out of the create response.

**Selector drift fixed:** the brief's `input[placeholder="Enter method title"]` matches **nothing** — MethodSettings /
DistanceMethodSettings render the field with `@getdokan/dokan-ui` `<SimpleInput placeholder=… />`, but SimpleInput's
props (`SimpleInput.d.ts`) have **no top-level `placeholder`** (only forwarded via its `input` prop), so the emitted
`<input>` carries no placeholder attribute (verified live: 0 matches). Anchored instead on the labelled grid row:
`//div[contains(@class,"sm:grid")][.//h3[normalize-space()="Method Title"]]//input` (1 match; reads the bound value).

**GMAP note:** the distance-rate form renders only when `dokanTableRateShippingHelper.map_api_key`
(`module.php:188` = `dokan_appearance.gmap_api_key`, seeded from the `GMAP` env) is truthy; otherwise it renders the
gate alert. **GMAP is populated in this env** (`dbData.ts:238`), so live the distance form renders and the alert does
NOT (probe-confirmed). DR-1/DR-2 are therefore a mutually-exclusive pair guarded by `test.skip` on
`process.env.GMAP` — **exactly one runs per environment, neither fakes green**: here DR-1 skips (documented reason)
and **DR-2 runs the real persist**. In a GMAP-absent env DR-1 runs the alert assertion and DR-2 skips.

**Green 3× (headless, single worker, `--project=e2e_tests`, coordinator directive = headless only):**
- Run 1 (full `e2e_setup`): `79 passed, 2 skipped (2.4m)` → this folder 3 passed + 1 skipped (DR-1, GMAP present).
- Run 2 (full `e2e_setup`): `79 passed, 2 skipped (2.4m)` → same.
- Run 3 (`NO_SETUP`, isolated): `3 passed, 1 skipped (28s)`.
(An earlier `--headed` run also went `3 passed, 1 skipped`; remaining runs kept headless per directive.)

Legacy `tableRateShipping.spec.ts` **left untouched** (it drives the classic Vue/PHP shipping surface — a different
surface, not the React drill-in). Feature-map: 4 leaves added under `Shipping › vendor (new UI)`.

### Class-B (stub-vacuous) rebuilds — outcome (2026-07-09)

Authored 5 rebuilds (store-supports, product-qa, vendor-staff, vendor-return-request, product-addons) via
the pre-#3173 recovery + `new-*` seeding, then live-verified (headless, single-worker). Key finding, recorded
per the autonomy grant:

- **The vendor revival cases largely WORK** (product-qa vendor 7/7 green, most admin cases green, etc.) — the
  recovery+seeding approach is sound.
- **But the authoring agents OVER-REACHED**: they made the *entire* shared page object real (admin + customer +
  staff + guest methods), not just the vendor block. Many of those out-of-scope roles' surfaces changed in 5.0.8
  — **admin Store Support is now a React SPA** (`page=dokan-dashboard#/admin-store-support`), the **staff
  dashboard sidebar is React** (`dashboard/new/#...` links), and some storefront Q&A/RMA flows drifted — so the
  now-real out-of-scope cases fail. Batch run: 31 failed / 135 passed, and the failures are dominated by
  admin/customer/staff over-reach, not the vendor targets.

**Action taken (no fake green, suite stays green):**
- **product-qa — SALVAGED, green 3× headless (96 passed/run, 0 failed).** Un-skipped the nested
  `vendor cases — ported to new-product-qa/` block → **7 real legacy vendor cases** on
  `dashboard/product-questions-answers` (view menu/details, filter, answer, edit-answer, delete-answer,
  delete-question); the 12 legacy **admin** cases were made real too and pass stably (bonus real coverage).
  The 4 out-of-scope cases whose surfaces drifted (`admin can enable product Q&A module` toggle, `customer can
  search/post question`, guest post) are `test.skip` with a documented reason (they were vacuous stub-passes on
  develop; module stays enabled via `beforeAll`). feature-map: 7 vendor leaves flipped `false→true`, 4 skips `→false`.
- **store-supports, product-addons, vendor-return-request, vendor-staff — REVERTED to their stub baseline**
  (`git checkout HEAD -- <files>`), so the committed suite stays 100% green. Reasons: store-supports admin is
  React-rewritten (14 over-reach failures); product-addons has real vendor-side drift (view/remove global-addon
  selectors); vendor-return-request has vendor `delete` drift + an RMA-*settings* case that stays-legacy;
  vendor-staff's conversion-added block is only 2 cases (the CRUD set is a pre-existing skip) and its one staff
  case needs the React sidebar. The authored drafts are recoverable from workflow `wf_fdaac56c-74d` (journal).

**Follow-up recipe for the 4 reverted features (scoped re-do):** recover the pre-#3173 real PO
(`git show e2ec507de:tests/pw/pages/<feature>Page.ts`), but implement **ONLY the vendor methods** the
conversion-added vendor block calls — leave admin/customer/staff/guest methods as the existing `{}` stubs
(preserving their develop vacuous-green baseline). Then un-skip only the vendor block, fix live selector drift
against the legacy `/dashboard/<route>`, green 3× headless. All 4 legacy pages were confirmed to still render
the classic UI (see the legacy-render probe above), so each is revivable with this narrower scope.

### Directive: headless-only verification (2026-07-09)
Per the user, all green-3× verification this pass is **3× headless** (no `--headed`) — no visible browser
windows on the shared Mac. (Headed mode was confirmed working earlier; the change is operational, not technical.)

## Phase 4 — CI shard-duration rebalance ✔ (2026-07-09)

Refreshed `utils/shard-durations.json` for the specs whose runtime changed this pass, then verified the
12-shard bin-pack balance (`node utils/getShardSpecs.js <i> 12`, greedy longest-first).

- **Updated** (fresh ms captured via `CI=1` + `specDurationReporter`): `announcements/announcements.spec.ts`
  240117→141871ms; `follow-store/followStore.spec.ts` 38935→26434ms; `product-qa/productQA.spec.ts`
  18630→60000ms (revived 7 vendor + 11 admin real cases — was near-instant stubbed before).
- **Added**: `new-shipping-rate/newShippingRate.spec.ts` 22820ms/4t (GAP-1, net-new).
- **Dropped 3 stale entries**: `product-form-manager/newProductForm{,Validation,Advanced}.spec.ts` (git-mv'd to
  `new-product-form/` in Wave 2 — no longer on disk). The 4 reverted class-B features keep their unchanged
  stub-baseline durations (no update needed).
- Baseline now **193 entries** (190 discovered specs + 3 setup files).

**12-shard balance (all bins ≈ equal): spread 0.3%** — max 1009.5s, min 1006.2s:

```
shard  1: 1009.5s   shard  5: 1008.3s   shard  9: 1006.2s
shard  2: 1008.7s   shard  6: 1008.3s   shard 10: 1006.2s
shard  3: 1008.6s   shard  7: 1006.8s   shard 11: 1006.2s
shard  4: 1008.4s   shard  8: 1006.6s   shard 12: 1006.2s
```

Well within the ~10% target. (Heaviest specs — the bin-pack constraint — are `new-product-form/newProductForm*`
~450-480s and `new-shipping/`, `new-products/`, `abuse-reports/` ~300-380s, spread 1-per-bin.)

---

## Run summary (2026-07-09) — Phases 0→4, single unattended pass

**Deliverables (all committed on `qa/new-ui-suite-wave-0`, push-ready, NOT pushed):**
1. **Phase 0 — reconcile ✔.** One branch = full 30-folder conversion (`215b85718`) + develop 5.0.8/#3300,
   clean conflict-free merge, `tsc` clean. Safety net: `backup/wave-0-prereconcile-38d2c0bde` +
   tag `backup/full-conversion-215b85718`.
2. **Phase 1 — audit ✔** (`feature-map/CONVERSION-AUDIT-2026-07.md`). Conversion essentially COMPLETE;
   1 true buildable gap; 39 conversion-added revival blocks classified.
3. **Phase 2 — GAP-1 closed ✔.** `new-shipping-rate/` (per-instance table/distance-rate drill-in forms),
   green 3× headless. (31 `new-*` folders now.)
4. **Phase 3 — legacy suite revived (real, no fake green):**
   - Class-A: **follow-store** 2 vendor cases (green 3×); **announcements** `Old TC11` legacy delete (green 3×).
   - Class-B: **product-qa** 7 legacy vendor + 11 legacy admin cases made real (green 3×; 5 out-of-scope cases
     documented-skip). 4 other class-B rebuilds authored via pre-#3173 recovery but **reverted to green stub
     baseline** after live verification exposed authoring-agent over-reach (they made out-of-scope admin/customer
     methods real → fail on 5.0.8 React-rewritten surfaces) + some vendor drift; scoped re-do recipe recorded above.
   - Class-C: follow-store's vacuous `(React)` body-length smoke deleted (exemplar); the other 20 kept
     skipped-and-documented (they emit no fake green while skipped).
5. **Phase 4 — shards rebalanced ✔.** 193-entry baseline, 12-shard spread **0.3%**.

**Coexistence proven:** the classic legacy `/dashboard/<route>` pages still render in 5.0.8, and the revived
legacy specs + the additive `new-*` React specs pass green together (final consolidated run: 141 passed / 0 failed).

**Honest scope note:** of the 39 conversion-added revival blocks, this pass genuinely revived 3 features green
(follow-store, announcements, product-qa) and left the rest as documented follow-ups (4 class-B reverted with a
recovery recipe; 20 class-C retired-in-place). No block was left in a fake-green or red state — the committed
suite is entirely green. The two product-bug tests stay `test.fixme` (QA reports, does not fix product code).

## Class-B continuation (vendor-only scope) — store-supports REVIVED ✔ (2026-07-09)

Re-did store-supports with the scoped recipe (vendor methods only; admin+customer stay `{}` stubs). Un-skipped
the nested `vendor cases — ported to new-store-support/` block → **11 real legacy vendor cases** on classic
`/dashboard/support` (view menu/details, filter by customer + date-range, search by id + title, reply, close,
reopen, close-with-chat-reply, reopen-with-chat-reply). Green 3× headless (39 store-supports passed/run;
115 passed incl. setup) + an independent confirmation run. **No documented skips** — all 11 vendor cases real.

Live drift check (throwaway probe, deleted): the classic `/dashboard/support` still renders the legacy support
template (now nested in the React dashboard shell `#dokan-vendor-dashboard-layout-root`, but the content markup
is unchanged). **Reply endpoint is still `POST wp-comments-post.php` → 302** (the suspected REST migration did
NOT happen); close/reopen `//td[@data-title="Action"]//a` → `.swal2-confirm` → `GET ?action=dokan-support-topic-status`
unchanged; search input + select2 customer filter unchanged; only additive change is a new "Order Ref." column.
Strengthened over the recovery (no fake green): added real status/reply read-back oracles the old methods lacked,
and fixed the by-customer filter that never actually selected the option. Admin (React SPA) + customer methods
kept as vacuous `{}` stubs (their cases pass as on develop). feature-map: 11 vendor leaves flipped `false→true`.

## Class-B continuation — vendor-return-request REVIVED ✔ (2026-07-09)

Scoped vendor-only revival of `test.describe.skip('Vendor RMA test')` → **7 real legacy vendor cases** on classic
`/dashboard/return-request` (view menu, view RMA settings, view details, send RMA message, update status, refund,
delete). Green 3× headless (12 passed folder / 88 with setup, 0 failed) + independent confirmation. Admin/customer
methods kept `{}` stub; `admin can disable RMA module` sibling made active. RMA *settings* page renders legacy →
revived real (no skip needed). Seeding is REST-only (RMA lives in custom `wp_dokan_rma_*` tables): fresh WC order →
POST `/dokan/v1/rma/warranty-requests` as customer → recover id as vendor → DELETE cleanup (mirrors new-return-request).

**Real drift fixed (no fake green):** (1) refund/status-update AJAX fires `window.location.reload()` — armed
`waitForEvent('load')` before the click to avoid a `net::ERR_ABORTED` race (removed the racing goto); (2) the store
uses a **comma** monetary decimal — typing dot-decimal triggered WooCommerce's `wc_error_tip` overlay that blocked the
refund submit, so the amount is now formatted with `window.dokan_refund.mon_decimal_point`; (3) the delete-success woo
banner only prints on the detail template (not the list the delete redirects to in the React shell) → oracle is
row-absence + REST `?order_id=` returns 0. Real oracles throughout: update→REST `getRmaStatus==='processing'`,
refund→admin REST `getRefundIdByOrderId(...,'pending')`, delete→REST-absent. feature-map: 7 vendor leaves `false→true`.

### product-addons + vendor-staff — NOT revived this pass (documented)
- **product-addons**: only 2 conversion-added skips (`vendor can view product addons menu page` render-only, and
  `vendor can remove global product addon`). The remove method `removeAddon` is SHARED with an *active* sibling
  (`vendor can remove product addon`, per-product surface) so it can't be scoped cleanly without disentangling, and the
  sole clean target is a weak render-only check (§7 discourages render-only as the primary oracle). Left at stub baseline.
- **vendor-staff**: the conversion-added `Vendor staff test (vendorStaff)` block has **no revivable pure-vendor case** —
  it is `VendorStaff can view allowed menus` (the staff dashboard sidebar is React in 5.0.8 → not legacy-assertable) +
  `admin can disable vendor staff manager module` (an admin case). The real staff CRUD lives in the pre-existing-skipped
  `Vendor staff test (vendor)` block (out of conversion-added scope). Left at stub baseline.

## FINAL tally — legacy revival (2026-07-09, after class-B continuation)

The scoped **vendor-only** recipe (make ONLY the vendor block's methods real; keep admin/customer/staff as `{}`
stubs; recover pre-#3173 selectors; live drift-fix; green 3× headless) succeeded where the first over-reaching
attempt failed. **5 legacy features genuinely revived green** (all 3× headless + an independent confirmation run):

| Feature | Legacy surface | Real vendor cases | Notes |
|---|---|--:|---|
| follow-store | `/dashboard/followers` | 2 | real PO, un-skip |
| announcements | `/dashboard/announcement` | 1 | Old TC11 legacy delete |
| product-qa | `/dashboard/product-questions-answers` | 7 (+11 admin real) | 5 out-of-scope skips documented |
| store-supports | `/dashboard/support` | 11 | +real oracles the recovery lacked |
| vendor-return-request | `/dashboard/return-request` | 7 | +3 real drift fixes (reload/decimal/delete) |

= **28 real legacy vendor cases + 11 legacy admin cases** revived, coexisting green with the additive `new-*`
React suite. NOT revived (documented not-viable this pass): product-addons (shared `removeAddon` method +
render-only target), vendor-staff (React staff sidebar; no pure-vendor conversion-added case). Class-C: 1 vacuous
smoke deleted (exemplar), 20 retired-in-place (skipped, emit no fake green). Two product-bug tests stay `test.fixme`.

## Folder consolidation — new-* merged into feature folders (2026-07-10)

Per team-lead decision: reverse the house-style §1 "separate new-<feature>/ folder" convention —
two folders per feature reads as messy. Moved every `new<Feature>.spec.ts` / `new<Feature>Page.ts`
into its **existing feature (legacy) folder** so each feature has ONE folder holding both the legacy
and the React new-UI specs. **Zero `new-*` folders remain.**

- 29 merges (`git mv`), e.g. new-announcements→announcements, new-followers→follow-store,
  new-social→social-linking, new-shipping→vendor-shipping, new-shipping-rate→table-rate-shipping,
  new-subscription→vendor-subscriptions, new-user-subscription→vendor-product-subscription,
  new-store-support→store-supports, new-product-form→product-form-manager, etc.
- 2 net-new surfaces with no legacy folder simply lost the `new-` prefix: new-coupons→coupons,
  new-vendor-support→vendor-support.
- Safe: verified no spec imports from another folder (only `@utils/*` + same-dir), no filename
  collisions; `tsc --noEmit` clean after the move (same-dir `./new*Page` imports intact); shard
  paths in `utils/shard-durations.json` remapped (39 entries); 21 files' comment path-refs updated;
  NEW_UI_HOUSE_STYLE.md §1/§2 rewritten for the co-located layout. Spot-run `follow-store` (legacy
  revived + newFollowers together) green 93/0. e2e folder count 127→99.
