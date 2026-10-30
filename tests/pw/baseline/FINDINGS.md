# Findings from the revamp

Product bugs and legacy-suite defects found while building the revamp suite (`tests/pw/tests/react`).
Bug ids match the comments in the specs (`FINDINGS.md #n`). Every product bug has a test that pins it.

Preconditions for all of them: Dokan Pro active.
- Bugs #2 and #3 also need **Dokan → Settings → Vendor Subscription → Enable Pricing** on. Since Pro 5.2.0 nothing in the subscription feature loads without it.
- Bugs #1 and #4 need **Selling Options → Allow vendor to create manual order** on. The vendor role must also have the `dokan_manage_manual_order` capability; saving the admin settings adds it.

## Confirmed product bugs

### #1 Manual orders: edits made before the form finishes loading the order are silently overwritten
- **Correction (2026-10-30):** first logged as "adding a note resets the status". Probing showed the note is irrelevant. The form becomes editable before its initial `GET /dokan/v1/manual-orders/{id}` lands, and when that load arrives it resets the form (Order Status back to "Pending payment"). It looked intermittent because it only shows when the load is slower than the user.
- **Evidence:** 5 probe runs. In the run that reset, the pick was at 7268 ms and the order load at 7878 ms. In the 4 runs that kept the status, the load came before the pick.
- **Verify:**
  1. Open Add New Order with DevTools → Network throttled to "Slow 4G".
  2. Change Order Status to Completed **before** the page finishes loading.
  3. Wait for the load to finish.
- **Expected if present:** the status jumps back to "Pending payment". A Save then stores a pending order.
- **Pinned by:** `react/vendor-orders/manualOrder.global.spec.ts` #M5. It delays the order load by 3 s with `page.route`, then picks a status. With `test.fail` removed it fails 3/3 with `Received: "Pending payment"`.
- **Confidence:** high (deterministic repro).
- **Status:** open.


### #3 Vendor subscription: every vendor with a pack gets a 403 and an uncaught error on the Subscription page
- **Code:** `dokan-pro/modules/subscription/src/js/frontend/components/SubscriptionPacks.tsx:72` loads the pack via `dokan/v1/products/${subscription.subscription_id}`. Packs are admin-owned products, so the vendor products endpoint refuses, and the rejection isn't caught.
- **Verify:**
  1. Create a subscription pack.
  2. Assign it to a vendor, either in the admin vendor editor or by buying it.
  3. Log in as that vendor and open `/dashboard/new/#/subscription` with DevTools open.
- **Expected if present:** `GET /wp-json/dokan/v1/products/<packId>` returns **403**, and the console shows an uncaught promise rejection (Playwright reports the page error `"Object"`).
- **Pinned by:** `react/vendor-subscription/vendorSubscription.global.spec.ts` #S10 (`test.fail`). `VendorSubscriptionPage` tolerates the page error through a `known-js-error` annotation.
- **Confidence:** high. With `test.fail` removed, the test fails with exactly `Received: 403`.
- **Status:** open.

### #2 Vendor subscription: the Subscription Orders deep link never loads
- **Code:** `dokan-pro/modules/subscription/src/js/frontend/index.tsx` registers route `subscription/orders` with `element: SubscriptionOrders` and passes no `vendorId`. In `SubscriptionOrders.tsx`, `fetchOrders` returns early when `vendorId` is missing, and `isLoading` starts as `true`, so it never clears.
- **Verify:**
  1. Use a vendor who **bought** a pack (admin-assigned packs never appear in this list, see S3).
  2. Open `/dashboard/new/#/subscription/orders` directly.
- **Expected if present:** the table shows skeleton rows for ever, and no `vendor-subscription/orders` request is made. The **Subscription Orders tab** inside `#/subscription` works.
- **Pinned by:** #S9 (`test.fail`).
- **Confidence:** high. The code confirms it, and with `test.fail` removed the test fails on 10 skeleton rows with no empty-state text and no orders request.
- **Status:** open.
- **Legacy blind spot:** the old test passed because the skeleton table has column headers.

### #4 Manual orders: the idle Add New Order form requests customers in an endless loop
- **Verify:**
  1. As a vendor, open `/dashboard/new/#/orders/new`.
  2. Watch the Network tab without touching anything.
- **Expected if present:** `GET /wp-json/dokan/v1/customers?search=&include=&exclude=&role=all&per_page=10` repeats continuously. Measured **54 requests in 15 s** from one tab.
- **Knock-on effect:** typing in the Customer field often stays on "Searching ...", because each repeat restarts the async search. Picking a customer is unreliable for real users too.
- **Pinned by:** `react/vendor-orders/manualOrder.global.spec.ts` #M6 (idle request count, `test.fail`). #M7 (customer pick saved on the order) is `test.fixme` until this is fixed: the race sometimes passes, so an expected failure would flake.
- **Confidence:** high (measured directly).
- **Status:** open.

## Suspected (not proven by a test, or possibly intended)

| # | Surface | Suspicion | Where |
|---|---|---|---|
| S1 | Vendor customers REST | `get_items()` drops customers who never ordered from the vendor *after* the parent query has paginated, so a page can come back short or empty while matching customers exist on later pages. Code reading only. | `dokan-lite/includes/REST/CustomersController.php` `get_items()` |
| S2 | Manual orders (Pro) | Every visit to Add New Order creates a draft order (`POST /dokan/v1/manual-orders` on load), even if the vendor leaves without saving. Observed; may be intended. | network log of `/dashboard/new/#/orders/new` |
| S3 | Vendor subscription (Pro) | Admin-assigned packs never appear in the vendor's Subscription Orders, because only checkout orders get `_dokan_vendor_subscription_order`. The vendor sees an active pack and an empty orders list. Observed; may be intended. | `module.php::update_vendor_subscription_data` vs `Helper::get_paginated_subscription_orders_by_vendor_id` |

## Behaviour notes (verified, not bugs)

- A product created beyond a pack's product limit is saved as **draft**, not rejected (#S1 asserts "not published").
- Cancelling a non-recurring pack keeps it until its end date, with `has_active_cancelled_sub: true` (#S5).
- The vendor's customer picker only lists customers who have already ordered from that vendor. The code comments tie the endpoint's tightening to CVE-2026-8761, and it is treated as intended.

## Legacy suite defects (why "green" was not "covered")

| # | Defect | Effect |
|---|---|---|
| L1 | `ApiUtils.getEarningLineItems` / `getCommissionLineItems` price one unit and ignore quantity. | The "earning + commission == revenue" oracle only holds for quantity 1. |
| L2 | The manual-order status test read the dropdown back from the screen instead of the saved order, and never controlled when the order load landed. | Bug #1 passed unnoticed. |
| L3 | Several tests assert only `/\d/`, `rows > 0`, "columns render" or "the request fired". | Wrong totals, wrong rows, failed saves and stuck loaders stay green (e.g. #2). |
| L4 | `helpers.exeCommandWpcli` runs `cd $SITE_PATH && wp …` locally; `SITE_PATH` is unset in the local `.env`. | The manual-order setting toggle silently fails locally. The revamp uses `_shared/wp.ts` (wp-env tests-cli). |
| L5 | `PRODUCT_ID` / `CUSTOMER_ID` exist only inside a run that includes the setup project. | `NO_SETUP=true` runs quietly create throwaway products. The revamp looks fixtures up by name (`_shared/seed.ts`). |
| L6 | Since 5.2.0 the subscription feature only loads with `enable_pricing` on, but the legacy React subscription spec never turned it on. | Its six tests exercised a disabled feature. |

## Rule learned

Before pinning a bug with `test.fail`, make it deterministic. Control the timing that triggers it (e.g. delay the response with `page.route`), then confirm it fails for the bug's own reason with `test.fail` removed. A race pinned with `test.fail` flakes ("expected to fail, but passed"). If it can't be made deterministic, use `test.fixme` with the finding id.
