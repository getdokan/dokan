# NEW UI HOUSE STYLE — React vendor-dashboard parity specs

Normative conventions for every `new-<feature>/` spec folder that drives the
Dokan 5.0 React vendor dashboard (`/dashboard/new/#/<route>`, HashRouter, SPA
root `#dokan-vendor-dashboard-root`). Several page objects cite this document
by section number (`§1`, `§5`) — **do not renumber sections**.

Gold-standard exemplar: `tests/e2e/new-withdraw/`. DataViews-heavy exemplars:
`new-orders/`, `new-shipping/`.

---

## §1. Golden rule — self-contained folders

One feature = one folder: `tests/e2e/new-<feature>/`. **Spec folders never
import from each other.** The only allowed non-local imports are `@utils/*`
(and `@playwright/test`).

- Shared DataViews primitives live in `@utils/dataViews` (selector constants,
  `waitForRootReady`, `waitForListReady`, `hasNoPhpFatal`, row-action menu,
  debounced search, filter-panel and alertdialog-confirm helpers). Build page
  objects **from** these primitives; keep surface-specific orchestration
  (REST-gated refetch waits, skeleton-row math, DokanModal flows) local to the
  folder.
- Small local helpers (e.g. `escapeRegExp`, `uniqueTitle`) may be **duplicated**
  per folder — duplication is fine; a cross-folder import is not.
- The admin suite's `tests/e2e/admin/adminDataViews.ts` is a re-export of
  `@utils/dataViews` kept for its ~29 same-folder importers.

## §2. Folder & file layout, header banners

```
tests/e2e/new-<feature>/
├── new<Feature>.spec.ts    # test cases only — thin test() blocks
└── new<Feature>Page.ts     # selectors const + page object (+ TEST DATA const)
```

Spec header banner (see `new-withdraw/newWithdraw.spec.ts`): a `// ====`
banner stating (a) `NEW REACT UI TEST CASES (Dokan 5.0.0+)`, (b) which legacy
spec it ports, (c) `Surface(s):` with hash route(s) + widget type
(`DataViews list`, `DokanModal form`, …), (d) Lite/Pro tier, (e) any
fixture/cleanup contract.

Page-object file: a `SELECTORS` banner stating the selectors were **verified
against the live render** and citing the rendering component source path
(e.g. `src/dashboard/withdraw/WithdrawRequests.tsx`), then the exported
selectors const, then a `PAGE OBJECT` banner. When fixture data is needed
beyond `payloads`/env, export a `newXData` const under a `TEST DATA` banner
(see `new-shipping/newShippingPage.ts`).

## §3. Page objects

- Export `new<Feature>Selectors` `as const`, grouped by surface with
  `// ---- <group> ----` headers and a per-selector comment saying **why the
  selector is stable**, citing the component source. Reuse the shared
  constants where they match (`reactRoot: REACT_ROOT`,
  `rowActionsBtn: ROW_ACTIONS_BTN`, `phpFatal: PHP_FATAL`, …).
- URLs are `readonly` fields built with `toPath('dashboard/new/#/<route>')`
  from `@utils/helpers`.
- The constructor is exactly:

    ```ts
    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }
    ```

    `closeAnnouncementModal` from `@utils/helpers` is the **only** sanctioned
    announcement-modal dismissal (F3). Never inline a copy — the Dokan Pro
    vendor-announcement modal blocks the first navigation of every vendor test.

- Every page object exposes `async hasNoPhpFatal(): Promise<boolean>`
  (delegate to `@utils/dataViews hasNoPhpFatal`).
- Assertions live in the **spec**, not the page object: page-object methods
  navigate, act, and return data/booleans. (Legacy exception: `new-shipping`
  asserts inside methods — do not copy that pattern into new folders.)
- In-page-object REST oracles pair the click with the response via
  `Promise.all([page.waitForResponse(...).catch(() => undefined), btn.click()])`,
  matching **version-agnostic** endpoints: `/dokan\/v[0-9]+\/withdraw\b/i`,
  not `/dokan\/v1\/…/`.

## §4. Specs — lifecycle, seeding, storage states

- `test.describe('<Feature> (React) functionality')` with per-role inner
  describes (`vendor`, `admin`, `customer`, `business flow`).
- Import `test`/`expect` from `@utils/test` (adds permalink-404 recovery),
  `request` from `@playwright/test`.
- Storage states come from `@utils/authStates` (F4):

    ```ts
    import { ADMIN_STORAGE_STATE as a1, VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';
    ```

    Never hand-build `path.join(__dirname, '../../../playwright/.auth/…')`.

- Lifecycle: top-level `beforeAll` constructs `ApiUtils` and seeds; role
  describes create a **fresh context per test** in `beforeEach` and close
  page+context in `afterEach`; top-level `afterAll` disposes ApiUtils
  (mandatory whenever ApiUtils is constructed). Tests that create their own
  context inline (business flows) must close it in `try { … } finally { … }`.
- Navigation happens per-test via page-object `goto*()` methods; a
  `beforeEach` goto is acceptable only when the suite has a single entry route.
- Seeding is **REST/db-first** (`ApiUtils` + `payloads` + `dbUtils`) and
  deterministic: clear lingering state up front and comment the code-path
  reason for each seeding step (e.g. "the vendor MUST have an active payment
  method or the withdraw modal renders a warning instead of the form").
  Two sanctioned modes:
    1. REST-seeded state (new-withdraw): seed + clean via API in
       beforeAll/afterAll.
    2. Fixture + unique-marker cleanup (new-shipping): rely on the seeded
       fixture, create throwaway entities named `<label> PW-${Date.now()}`,
       delete them in the same test, leave the fixture as found.
- The UI changes the driving surface, **not the data layer**. Keep the money
  oracle: `Order Total == Vendor earning + Admin commission`.

## §5. Readiness & settling (the list-ready contract)

- First `waitForRootReady(page)` (SPA root visible, ≤30s), then wait for the
  surface to be _ready_: **≥1 data row OR an empty-state OR a surface-specific
  extra signal (status tabs, heading) — polled at 250ms up to ~15s.** Use
  `waitForListReady(page, { rowSelector, emptyState, extraReady })` from
  `@utils/dataViews`.
- Skeleton awareness: DataViews paints `per_page` placeholder rows containing
  `[data-slot="skeleton"]` while loading. Any row-count read on a
  skeleton-rendering surface must settle first and count settled rows only
  (`DATA_ROW_SETTLED` / subtract `:has([data-slot="skeleton"])` rows) — see
  `new-orders/newOrdersPage.ts` for the canonical explanation of the readiness
  race. Surfaces without skeletons may use `rawRowCount`.
- Prefer **REST-response-gated** waits over fixed sleeps whenever the refetch
  is observable (`waitForResponse` on the list endpoint carrying the expected
  query args), then settle. Fixed debounce sleeps (800ms fill / 600ms clear)
  are the fallback for client-side filtering.
- Admin DataViews surfaces keep using `waitForDataViewsSettle` (debounce +
  networkidle + skeleton-gone + fresh-paint poll) — same module.

## §6. Tags & labels

- Mandatory tuple on every test:
  `{ tag: ['@lite'|'@liteOnly'|'@pro', <role tags>, '@new-ui'] }` — tier first,
  then role(s) with the **primary actor first**, `@new-ui` always last.
- **Hard rule (D4):** a test may carry a "React" label or the `@new-ui` tag
  **only if** it navigates `/dashboard/new/#/` or asserts
  `#dokan-vendor-dashboard-root`. The wp-admin React dashboard
  (`admin.php?page=dokan-dashboard#/…`) is a _different_ SPA and does not
  qualify. Negative tests qualify when they navigate the vendor SPA URL and
  assert non-mount.
- Run the new-UI suite with `npm run test:e2e:newui` (grep `@new-ui`).

## §7. Assertions — no fake green

A test passes only when its **motive** is genuinely achieved against the live
site: the row appears/disappears in the DataViews list, the status actually
transitions, the value persists after reload, the REST/DB oracle confirms the
mutation. Every `expect` carries a message second-arg explaining the claim.

Forbidden ways to reach green:

- render-only / no-fatal checks standing in for behavior (`hasNoPhpFatal` is a
  _supplementary_ oracle, never the primary assertion of a behavioral case);
- body text-length assertions; soft/always-true expects;
- try/catch that swallows an assertion failure;
- loosening an assertion until it passes;
- `test.skip`/`.fixme` to dodge a failure (a documented `test.skip(true,
'<reason>')` for a genuinely non-automatable flow is fine — faking it is not);
- asserting against the wrong (legacy) surface.

Self-review every test: _"if this feature silently broke, would this test
fail?"_ If not, strengthen it before counting it done. If a real product bug
surfaces (not a selector issue), do not bend the test around it — record it in
`bugs/` with a repro and continue.

Non-vendor roles: cross-role effects are driven via REST and asserted on the
vendor React surface (badge created by admin REST → vendor tab reflects it).
Admin/customer smoke tests on the vendor route (access control, no-fatal) are
welcome additions but never replace the vendor behavioral cases.

## §8. Legacy retirement protocol

1. Build the `new-<feature>/` parity spec (selectors verified live, comments
   citing the rendering component).
2. It must pass **3× (1 headed, 2 headless)** via
   `npx playwright test tests/e2e/new-<feature> --project=e2e_tests` against
   the Docker site before the legacy block may be skipped.
3. Then the legacy **vendor** block gets `test.describe.skip` with a comment
   naming its `new-*` home. **Never skip admin/storefront/customer cases along
   with vendor ones** (D3) — split the describe if needed.
4. Many legacy page objects are no-op stubs — their green was vacuous. Port
   the _motive_ with real assertions from the live DOM; never translate stub
   methods.

## §9. Bookkeeping (every ported/added spec)

- `feature-map/feature-map.yml`: add each test under the co-located page entry
  in a `vendor (new UI)` / `admin (new UI)` / `customer (new UI)` group. Leaf
  key = **byte-exact** test title (+ ` [lite]` suffix when `@lite`-tagged);
  value `true` (or `false` for `test.skip`'d cases).
- `utils/shard-durations.json`: new/ported/skipped specs invalidate the CI
  shard baseline — refresh it with `utils/specDurationReporter.ts` and verify
  the 12-shard spread via `node utils/getShardSpecs.js <i> 12` before the
  conversion lands (max/min per-shard total within ~10%).
- `tests/pw/CONVERSION-LOG.md`: the running source of progress truth — what
  ported, dedupe decisions, selectors of note, bugs found, what's left.

## §10. Convention decision log

- **D1 — one conversion shape:** dedicated `new-<feature>/` folders. The other
  shapes (in-folder `*NewUI.spec.ts` files, `newProductForm*` in
  `product-form-manager/`, "(React) Tests" describes appended inside legacy
  specs) are transitional — migrate them into `new-*` folders opportunistically
  when touching those files.
- **D2 — product-editor consolidation (planned, Wave 2):** `new-products/`
  owns the `/products` list; `product-form-manager/newProductForm*` moves to a
  `new-product-form/` folder owning `/products/create` + `/products/:id/edit`;
  smoke-only `product-variations/` and `product-bulk-edit/` retire into it.
- **D3 — never blanket-skip:** a legacy skip must cover only the ported vendor
  cases; admin/storefront cases in the same file stay live.
- **D4 — React-label rule:** see §6. Legacy "(React)" describes that navigate
  legacy URLs are lying and get relabeled when their file is touched.
- **D5 — subscription smoke URLs (fixed in Wave 0):**
  `vendor-product-subscription` covers product subscriptions at
  `/dashboard/user-subscription/`; `vendor-subscriptions` covers vendor packs
  at `/dashboard/subscription/`. The two smokes had them swapped.
- **D6 — retired (Wave 0):** `social-linking/socialLinking.spec.ts` and
  `store-seo/storeSeo.spec.ts` — superseded by `new-social/` and
  `new-store-seo/`.
- **Naming arbitrations:** readiness methods are `waitForRootReady` /
  `waitForListReady` (list surfaces may add a local `waitForSettle` for
  skeleton math); `hasNoPhpFatal` (not `hasNoServerError`); tab-count parsing
  via `parseTabCount`.
- **Ghost docs:** older files cite a `CONVENTIONS.md` that never existed on
  disk; this document supersedes those citations for new-UI work.
