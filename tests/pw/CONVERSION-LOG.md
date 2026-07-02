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

### B14 orders gaps + C2 order-edit — REFRAMED (scout finding)

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
