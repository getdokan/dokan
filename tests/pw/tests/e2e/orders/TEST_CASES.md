# Orders — Test Cases & Edge Cases

Scope: Vendor-side order list (legacy + 5.0.0 React `OrderList.tsx`), order details, tracking, shipment, notes, bulk actions.

Conventions: see `tests/pw/CONVENTIONS.md`.

---

## React UI (Dokan 5.0.0+)

The new vendor `OrderList` (src/dashboard/orders/OrderList.tsx) mounts at
`/dashboard/orders/`. Coverage:

- **vendor order list page renders (React or legacy)** — smoke test that the
  page mounts successfully under either UI. Useful while the rollout is
  still toggleable.

Future React-specific tests (not yet implemented):

| #     | Title                                                  | Notes                                                        |
|-------|--------------------------------------------------------|--------------------------------------------------------------|
| R.1   | Search orders via React filter chip                     | Query updates URL; results re-fetch                          |
| R.2   | Filter by status (DataViews chip)                       | Filtered order count matches                                 |
| R.3   | Bulk action via DataViews toolbar                       | Multi-select → Bulk Mark Completed                           |
| R.4   | Open order detail modal (instead of legacy navigation)  | If/when DokanModal replaces full-page detail                 |
| R.5   | Quick view of order line items                          | DataViews row expansion                                      |


## Active tests

- vendor can view order menu page
- vendor can export all orders
- vendor can export filtered orders
- vendor can search order
- vendor can filter orders by customer
- vendor can filter orders by date range
- (skipped) vendor can view order details
- vendor can update order status on order table
- (skipped) vendor can update order status on order details
- vendor can add order note
- vendor can add private order note
- vendor can add tracking details to order
- vendor can add shipment to order
- (skipped) vendor can add downloadable product permission to order
- vendor can perform bulk action on orders
- vendor order list page renders (React or legacy)

## Conventions applied

- Self-contained page object (modal helper inlined per CONVENTIONS.md §4).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with `@lite` / `@pro` plus role tag.
- Legacy tests retained where they parallel a React rewrite (look for "Old Test Case N - …" names).

## Edge cases & known issues

- Pre-existing CI flakies in this folder: see `tracking details to order` and `shipment to order` — both retry-pass historically. Root cause is shared vendor announcement modal interaction; the inline modal handler covers most cases but not all.
- Run individually with: `npm run test:e2e -- tests/e2e/{folder}` (or `NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/{folder}`).
