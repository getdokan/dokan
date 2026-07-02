# Pre-existing flakiness: new-products status-tab assertions

**Status:** pre-existing (NOT introduced by the Wave 0 new-UI conversion)
**Discovered:** 2026-07-02, during the Wave 0 `@new-ui` validation runs
**Spec:** `tests/e2e/new-products/newProducts.spec.ts` (already-converted; not a
Wave 0 conversion target)
**Scope note:** the only Wave 0 change to this folder was migrating a
storage-state `path.join` const to an `@utils/authStates` import in the spec —
logically inert (identical absolute path). `newProductsPage.ts` is byte-identical
to `develop`. So this behavior predates the branch.

## Symptom

The status-tab tests fail/flake both under full-suite parallel load AND in
isolation (`-g "status tab"` → 2 failed, 1 flaky):

- `vendor sees an empty Draft status tab` — `expect(products.rows).toHaveCount(0)`
  fails: rows remain.
- `vendor sees an empty Pending Review status tab` — same (flaky).
- `vendor can switch to the Out of stock status tab` —
  `expect(rowByName(seededProductName)).toBeHidden()` fails: the seeded (in-stock,
  published) product is still visible; the trace shows ~33 `tbody tr` rows present
  on the Out-of-stock tab.
- `vendor can filter by In stock status tab` — intermittently fails the inverse.

## Two candidate root causes (need live investigation)

1. **Non-deterministic empty-tab assumption.** The Draft/Pending tests assert the
   tab is globally empty (`rows.toHaveCount(0)` + empty-state banner). On the
   shared, polluted wp-env DB, vendor1 accumulates draft/pending products from
   prior runs, so the tab is legitimately non-empty. The assertion should be
   **seed-relative** (assert the seeded published product is absent from
   Draft/Pending — `expect(rowByName(seeded)).toHaveCount(0)`), not
   globally-empty.
2. **Stock-status tab may not narrow the list.** The Out-of-stock failure shows
   the in-stock seeded product present. Either (a) the DataViews settle races —
   `waitForListRefetch` (newProductsPage.ts:140) waits for *any* `GET
   /dokan/vN/products` + a fixed 400ms, which can resolve on a stale/earlier
   fetch before the stock-status filter is applied and repainted; or (b) the
   "Out of stock" tab genuinely does not apply a `stock_status` query param —
   a real product bug. `waitForListRefetch` should additionally wait for the
   skeleton rows to clear and the count to change, and `rows` should exclude
   skeleton rows (use `DATA_ROW_SETTLED` semantics from `@utils/dataViews`).

## Recommended fix (deferred — not Wave 0 scope)

- Rewrite the four status-tab tests to seed-relative, deterministic oracles:
  seed one draft + one pending + one out-of-stock product for vendor1 and assert
  each appears on ITS tab and the published/in-stock seed does not — instead of
  assuming global tab emptiness.
- Harden `newProductsPage.ts:clickTab`/`waitForListRefetch` to settle on
  skeleton-clear (reuse `@utils/dataViews waitForDataViewsSettle` /
  `DATA_ROW_SETTLED`).
- If, after settling, the Out-of-stock tab still shows in-stock products, that is
  a real Dokan bug — file upstream with the trace.

## Wave 0 impact

None on the foundations. Every file the Wave 0 refactor touched
(`new-withdraw`, `new-orders`, `new-seller-badge`, `new-store-reviews`,
`orders/newOrderListPage`, `vendor-products/newProductListPage`, the shared
`utils/dataViews.ts` + `utils/authStates.ts`) passed both `@new-ui` validation
runs. The seller-badge `tabsVisible()` race that failed run 1 was fixed and
passed run 2. This new-products flakiness is orthogonal and predates the branch.
