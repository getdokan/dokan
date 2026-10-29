# Revamp: where we left off

Branch `dokan-test-revamp`. Last updated 2026-10-29. Read this together with `.claude/skills/dokan-test-revamp/SKILL.md`, which holds the rules. This file holds the state.

## Goal

Replace the legacy React-UI Playwright tests with a risk-first, DRY suite in `tests/pw/tests/react/`, React UI only. A legacy folder is deleted only when its parity ledger shows 0 open (`node baseline/parity.mjs --strict`) and its failure-mode map has no open P0/P1 gaps.

## Done

| Surface | Risk | New tests | Ledger | Failure-mode map | State |
|---|---|---|---|---|---|
| Vendor orders (list) | P0 | `react/vendor-orders/vendorOrders.spec.ts`, `vendorOrdersApi.spec.ts`, `vendorOrdersCapability.global.spec.ts` | `parity/orders.md`: 4 TODO left | `failure-modes/vendor-orders.md` | stable (3× repeat green) |
| Manual orders (Pro) | P0 | `react/vendor-orders/manualOrder.global.spec.ts` | `parity/manual-order.md`: 0 open | in `vendor-orders.md` (M1–M7) | **unstable, see Next 1** |
| Vendor subscription (Pro) | P0 | `react/vendor-subscription/vendorSubscription.global.spec.ts` | `parity/vendor-subscriptions.md`: 0 open | `failure-modes/vendor-subscription.md` | green in the 2× repeat; S12–S16 gaps open |

Shared layer in `react/_shared/`:
- `fixtures.ts`: role pages; the PHP-fatal/JS-error guard, which lists failed REST calls; the `known-js-error` annotation; `withUserPage` for fresh users.
- `seed.ts`: `seedOrder`, `createVendor`, `createProductAs`, `productIdOf`, `customerId`, `categoryId`.
- `dataViewsTable.ts`: `DataViewsTable` and `moneyDigits`.
- `wp.ts`: `wpEval`, `setDokanSetting`, `setRoleCap`.

Bugs found: `baseline/FINDINGS.md` (#2, #3, #4 confirmed; #1 intermittent; S1–S3 suspected).

Legacy progress: 44 of 561 legacy React tests have a verdict; 517 are left across 38 folders (`node baseline/parity.mjs`).

## Next (in order)

1. **Stabilise manual orders.** #M5 (bug #1) and #M7 (bug #4) are timing-dependent, so `test.fail` flips them to "expected to fail, but passed".
   - Confirm #1 by hand first (steps in FINDINGS.md).
   - Then either make the repro deterministic (e.g. wait for the note's order refetch before reading the status) or drop `test.fail` and keep the bug only in FINDINGS.
   - Re-run `--repeat-each=3` until the file is green.
2. **Re-check #S9 without `test.fail`.** It should fail on skeleton rows, not on a setup error. Same procedure as #S10.
3. **Close the orders TODOs** (`parity/orders.md`): #10 customer/date filters (assert every row matches), #11 export content, #12 View lands on the right order.
4. **Subscription gaps:** S13 expiry → product status, S14 pack commission, S12 admin editor UI, S16 allowed categories.
5. **Next P0/P1 surfaces** by `RISK-REGISTER.md`: Vendor staff, Product editor (`product-form-manager`, 82 legacy tests, the largest), Returns/RMA, Admin settings (`adminSettings`, 98).
   - Per surface: failure-mode map → ledger verdicts → tests → 3× repeat green → ledger 0 open.
6. **CI:** add a `react.config.ts` job to `.github/workflows/e2e_api_tests.yml`. The suite isn't in CI yet.
7. Delete legacy folders in separate PRs once their ledger is 0 open.

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
- **Since 5.2.0, raw DB writes to legacy `dokan_*` options are ignored.** Use `setDokanSetting` (update_option), never dbUtils raw writes.
