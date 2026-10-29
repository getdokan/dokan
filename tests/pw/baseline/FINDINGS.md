# Findings from the revamp

Product bugs and legacy-suite defects found while building the revamp suite. Each product bug has a test that pins it.

## Product bugs

| # | Surface | Bug | Pinned by | Status |
|---|---|---|---|---|
| 1 | Manual orders (Pro) | Adding an order note reloads the order and resets an unsaved Order Status to "Pending payment". "Pick Completed, add note, Save" stores a pending order. | `react/vendor-orders/manualOrder.global.spec.ts` #M5 (`test.fail`, flips when fixed) | open |

## Suspected (not yet proven by a test)

| # | Surface | Suspicion | Where |
|---|---|---|---|
| S1 | Vendor customers REST | `CustomersController::get_items` drops customers who never ordered from the vendor *after* the parent query paginates, so a page can come back short or empty while matching customers exist on later pages. | `includes/REST/CustomersController.php` `get_items` |
| S2 | Manual orders (Pro) | Opening Add New Order fires `GET /dokan/v1/customers` 6 times, and every visit creates a draft order. | Network log of `/dashboard/new/#/orders/new` |

## Legacy suite defects (why "green" was not "covered")

| # | Defect | Effect |
|---|---|---|
| L1 | `ApiUtils.getEarningLineItems` / `getCommissionLineItems` price one unit and ignore quantity. | The "earning + commission == revenue" oracle only holds for quantity 1. |
| L2 | The manual-order status test read the dropdown back from the screen instead of the saved order. | Bug 1 passed unnoticed. |
| L3 | Several tests assert only `/\d/`, `rows > 0` or "the request fired". | Wrong totals, wrong rows and failed saves stay green. |
| L4 | `helpers.exeCommandWpcli` runs `cd $SITE_PATH && wp …` locally; `SITE_PATH` is unset in the local `.env`. | The manual-order setting toggle silently fails locally. The revamp uses `_shared/wp.ts` (wp-env tests-cli) instead. |
| L5 | `PRODUCT_ID` / `CUSTOMER_ID` exist only inside a run that includes the setup project. | `NO_SETUP=true` runs quietly create throwaway products. The revamp looks fixtures up by name (`_shared/seed.ts`). |
