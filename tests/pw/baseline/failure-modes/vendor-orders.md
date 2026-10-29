# Failure modes: Vendor orders (P0, risk 25)

React surface: `src/dashboard/orders/` (`OrderList.tsx`, `hooks/useOrders.ts`), the list only. View navigates out of the React app, so order details, notes, tracking and refunds are not on this surface.

Paths are relative to `tests/pw/tests/`. An assertion counts only if it fails when the failure mode happens.

| # | Failure mode | Role | Layer | Existing assertion | Verdict |
|---|---|---|---|---|---|
| 1 | Vendor A's list shows vendor B's orders (data leak) | vendor | API + UI | `api/ordersVendorIsolation.spec.ts:37` (list, v1+v2, with own-order guard), `e2e/orders/newOrdersGaps.spec.ts:72` (React search by id) | caught |
| 2 | Vendor reads or updates vendor B's order by id through `dokan/v1/orders/{id}` | vendor | API | `api/ordersVendorIsolation.spec.ts:50` (read), `:56` (update, order verified untouched) | caught |
| 3 | Parent order (multi-vendor cart) listed instead of, or as well as, the vendor's suborder | vendor | API + UI | none in React list (`api/calculation.spec.ts:655` checks parent/child money, not listing) | **GAP** |
| 4 | Row status change does not persist | vendor | UI + REST oracle | `e2e/orders/newOrdersGaps.spec.ts:61`, `newOrders.spec.ts:279` | caught |
| 5 | Bulk status change misses or over-applies to rows | vendor | UI + REST oracle | `newOrders.spec.ts:204` checks the 2 selected orders completed; does not check an unselected order stayed unchanged | **PARTIAL** |
| 6 | Status change allowed when the admin disabled the capability | vendor | UI + REST oracle | `newOrdersGaps.spec.ts:145` | caught (uses `waitForTimeout(1500)`, should become `expect.poll`) |
| 7 | Row shows the wrong order total | vendor | UI | `newOrders.spec.ts:82` only matches `/\d/` | **WEAK** (passes on any digit) |
| 8 | Earning and commission split wrong for the order | vendor/admin | API | `newOrdersGaps.spec.ts:71` (earning + commission == revenue), `api/calculation.spec.ts` matrix | caught |
| 9 | Status tab shows orders of another status | vendor | UI | `newOrders.spec.ts:151` checks the seeded processing order is present; not that other statuses are absent | **PARTIAL** |
| 10 | Customer, date-range or order-id filter returns wrong rows | vendor | UI | `newOrders.spec.ts:110`, `:118` open the filter only; `:126`, `:144` search by id | **PARTIAL** (filter results not asserted) |
| 11 | Export contains wrong orders or ignores the active filter | vendor | UI (download) | `newOrders.spec.ts:92` opens the dropdown only | **GAP** |
| 12 | View goes to the wrong order | vendor | UI | `newOrders.spec.ts:165` checks only that the URL left `#/orders` | **WEAK** |
| 13 | Customer or guest can call the vendor orders REST | customer/guest | API | `api/ordersVendorIsolation.spec.ts:65`, `:70` | caught |
| 14 | Vendor staff without the orders permission sees or changes orders (Pro) | staff | API + UI | `e2e/vendor-staff/newVendorStaff.spec.ts:191` checks only that the Orders menu is visible with the default capability; denial is never tested | **GAP** |
| 15 | Lite: Pro-only actions or columns shown, or the list breaks without Pro | vendor | UI | none tied to `@liteOnly` | **GAP** |

## Fix plan (in this order)

1. ~~**#1, #2, #13: vendor isolation (API).**~~ Done: product holds (cross-vendor read 403, update 400 and the order stays untouched, customer 403, guest 401). Seed one order for vendor1 and one for vendor2 (`payloads.vendor2Auth`).
   - vendor1 `GET /orders` must not include vendor2's order.
   - vendor1 `GET` or `PUT` on vendor2's order must return 403 or 404, and the order must be unchanged.
   - Customer and guest calls must return 401 or 403.
   - Then add one React UI check: searching vendor2's order id in vendor1's list shows the empty state.
2. **#3: suborder listing.** Create a multi-vendor order. Each vendor's list must show only its own suborder id, never the parent.
3. **#7, #12: exact values.** Assert the row total equals the REST `total` formatted with the store currency. Assert that View lands on the seeded order id.
4. **#5, #9, #10: complete the oracles.** Bulk: an unselected order stays `processing`. Tab: every row in the Processing tab is Processing. Filter: every returned row matches the customer or date range.
5. **#11: export.** Capture the download, then assert the CSV order ids equal the filtered list.
6. **#14 (Pro) and #15 (Lite).**

Tag these tests `@p0`.
