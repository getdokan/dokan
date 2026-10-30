# Revamp: where we left off

Branch `dokan-test-revamp`. Last updated 2026-10-30. Read this together with `.claude/skills/dokan-test-revamp/SKILL.md`, which holds the rules. This file holds the state.

## Goal

Replace the legacy React-UI Playwright tests with a risk-first, DRY suite in `tests/pw/tests/react/`, React UI only. A legacy folder is deleted only when its parity ledger shows 0 open (`node baseline/parity.mjs --strict`) and its failure-mode map has no open P0/P1 gaps.

## Done

| Surface | Risk | New tests | Ledger | Failure-mode map | State |
|---|---|---|---|---|---|
| Vendor orders (list) | P0 | `react/vendor-orders/vendorOrders.spec.ts`, `vendorOrdersApi.spec.ts`, `vendorOrdersCapability.global.spec.ts` | `parity/orders.md`: 0 open | `failure-modes/vendor-orders.md` | stable; #15 → Lite-only CI job |
| Manual orders (Pro) | P0 | `react/vendor-orders/manualOrder.global.spec.ts` | `parity/manual-order.md`: 0 open | in `vendor-orders.md` (M1–M8) | stable; #M7 `fixme` (bug #4), M8 gap |
| Vendor staff (Pro) | P1 (impact 5) | `react/vendor-staff/vendorStaffApi.spec.ts`, `vendorStaff.spec.ts`, `vendorStaffModule.global.spec.ts` | `parity/vendor-staff.md`: 0 open | `failure-modes/vendor-staff.md` | stable; V17–V18 gaps open |
| Vendor subscription (Pro) | P0 | `react/vendor-subscription/vendorSubscription.global.spec.ts` | `parity/vendor-subscriptions.md`: 0 open | `failure-modes/vendor-subscription.md` | stable; S12–S16 gaps open |

Shared layer in `react/_shared/`:
- `fixtures.ts`: role pages; the PHP-fatal/JS-error guard, which lists failed REST calls; the `known-js-error` annotation; `withUserPage` for fresh users.
- `seed.ts`: `seedOrder`, `createVendor`, `createProductAs`, `productIdOf`, `customerId`, `categoryId`.
- `dataViewsTable.ts`: `DataViewsTable` and `moneyDigits`.
- `wp.ts`: `wpEval`, `setDokanSetting`, `setRoleCap`.

Bugs found: `baseline/FINDINGS.md` (#1–#6 confirmed with deterministic pins; S1–S3 suspected).

Last full run (2026-10-30, clean settings): 60 passed, 1 skipped (#M7), 0 failed, about 9 minutes locally.

Legacy progress: 61 of 561 legacy React tests have a verdict; 500 are left across 38 folders (`node baseline/parity.mjs`).

## Next (in order)

1. **Product editor** (P0, `product-form-manager`: 82 legacy tests, the largest). Read memories `pfm-*` and `product-editor-mergeable-keys-coupling` first.
2. **Gaps:** staff V17–V18 (products/coupons/export/notes capabilities); manual orders M8 (another vendor's product refused). Subscription: S13 expiry → product status, S14 pack commission, S12 admin editor UI, S16 allowed categories.
3. **Next P0/P1 surfaces** by `RISK-REGISTER.md`: Returns/RMA, Admin settings (`adminSettings`, 98), Withdraw, Reverse withdrawal.
   - Per surface: failure-mode map → ledger verdicts → tests → 3× repeat green → ledger 0 open.
4. **CI:** add a `react.config.ts` job to `.github/workflows/e2e_api_tests.yml` (Pro run, plus a Lite-only run with `DOKAN_PRO` unset that covers orders #15). The suite isn't in CI yet.
5. Delete legacy folders in separate PRs once their ledger is 0 open.

## How to run

```bash
cd tests/pw
npm run env:start            # wp-env; tests site on :9999
npm run test:react           # react (parallel) then react_global (1 worker)
NO_SETUP=true DOKAN_PRO=true npx playwright test -c react.config.ts --project=react_global --no-deps tests/react/<surface>
node baseline/parity.mjs     # ledger status
node baseline/baseline.mjs   # regenerate RISK-REGISTER.md
```

## Environment traps (seen in this work)

- **REST 404 after `wp-env start`:** the permalink rules are missing. Run `npx wp-env run tests-cli wp rewrite flush --hard`.
- **Tests land on the login page:** the storage states have expired. Run `npx playwright test --config=e2e.config.ts --project=auth_setup --no-deps --grep "authenticate"`.
- **Never toggle settings in manual probes without resetting them.** A probe left `allow_vendor_create_manual_order=on`, and the suite's restore then kept it on.
  - Defaults: `enable_pricing=off`, `allow_vendor_create_manual_order=off`, and no `dokan_manage_manual_order` cap on `seller`.
  - Check: `npx wp-env run tests-cli wp eval 'echo dokan_get_option("enable_pricing","dokan_product_subscription"), " ", dokan_get_option("allow_vendor_create_manual_order","dokan_selling");'`
- **The auth setup writes `CUSTOMER_ID`/`PRODUCT_ID` into `.env`.** `payloads.createOrder` then defaults `customer_id` to customer1. The revamp seeder always sets `customer_id` explicitly; do the same for any payload field that defaults from env.
- **Since 5.2.0, raw DB writes to legacy `dokan_*` options are ignored.** Use `setDokanSetting` (update_option), never dbUtils raw writes.
