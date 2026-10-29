# Failure modes: Vendor orders (P0, risk 25)

React surface: `src/dashboard/orders/` (`OrderList.tsx`, `hooks/useOrders.ts`), the list only. View navigates out of the React app, so order details, notes, tracking and refunds are not on this surface.

Paths are relative to `tests/pw/tests/`. An assertion counts only if it fails when the failure mode happens.

| # | Failure mode | Role | Layer | Existing assertion | Verdict |
|---|---|---|---|---|---|
| 1 | Vendor A's list shows vendor B's orders (data leak) | vendor | API + UI | `react/vendor-orders/vendorOrdersApi.spec.ts` #1 (v1+v2), `react/vendor-orders/vendorOrders.spec.ts` #1 | caught |
| 2 | Vendor reads or updates vendor B's order by id through `dokan/v1/orders/{id}` | vendor | API | `react/vendor-orders/vendorOrdersApi.spec.ts` #2 read (403) and update (refused, order untouched) | caught |
| 3 | Parent order (multi-vendor cart) listed instead of, or as well as, the vendor's suborder | vendor | API + UI | none in React list (`api/calculation.spec.ts:655` checks parent/child money, not listing) | **GAP** |
| 4 | Row status change does not persist | vendor | UI + REST oracle | `react/vendor-orders/vendorOrders.spec.ts` #4 (UI status cell + REST) | caught |
| 5 | Bulk status change misses or over-applies to rows | vendor | UI + REST oracle | `react/vendor-orders/vendorOrders.spec.ts` #5 (selected completed, unselected stays processing) | caught |
| 6 | Status change allowed when the admin disabled the capability | vendor | UI + REST oracle | `react/vendor-orders/vendorOrdersCapability.global.spec.ts` #6 (flat `vendor_can_change_order_status` off) | caught |
| 7 | Row shows the wrong order total | vendor | UI | `react/vendor-orders/vendorOrders.spec.ts` #7 (Order Total and Earning cells equal REST `total` / `earning`) | caught |
| 8 | Earning and commission split wrong for the order | vendor/admin | API | `api/calculation.spec.ts` (assertOrderCalculation matrix). Legacy `newOrdersGaps.spec.ts:71` helpers ignore quantity, so it only holds for qty 1 | caught |
| 9 | Status tab shows orders of another status | vendor | UI | `react/vendor-orders/vendorOrders.spec.ts` #9 (every row in On hold tab is On hold) | caught |
| 10 | Customer, date-range or order-id filter returns wrong rows | vendor | UI | `newOrders.spec.ts:110`, `:118` open the filter only; `:126`, `:144` search by id | **PARTIAL** (filter results not asserted) |
| 11 | Export contains wrong orders or ignores the active filter | vendor | UI (download) | `newOrders.spec.ts:92` opens the dropdown only | **GAP** |
| 12 | View goes to the wrong order | vendor | UI | `newOrders.spec.ts:165` checks only that the URL left `#/orders` | **WEAK** |
| 13 | Customer or guest can call the vendor orders REST | customer/guest | API | `react/vendor-orders/vendorOrdersApi.spec.ts` #13 (customer 403, guest 401) | caught |
| 14 | Vendor staff without the orders permission sees or changes orders (Pro) | staff | API + UI | `e2e/vendor-staff/newVendorStaff.spec.ts:191` checks only that the Orders menu is visible with the default capability; denial is never tested | **GAP** |
| 15 | Lite: Pro-only actions or columns shown, or the list breaks without Pro | vendor | UI | none tied to `@liteOnly` | **GAP** |

Paths starting `react/` are the revamp suite (`npm run test:react`). Legacy paths are kept only where the revamp suite defers to them.

## Manual orders (Pro, same surface)

| # | Failure mode | Role | Layer | Assertion | Verdict |
|---|---|---|---|---|---|
| M1 | Form opens with the wrong default or missing statuses | vendor | UI | `react/vendor-orders/manualOrder.global.spec.ts` #M1 | caught |
| M2 | Saved order loses product, customer, status or note, or another vendor can read it | vendor | UI + REST | #M2 | caught |
| M3 | Product search offers wrong products | vendor | UI | #M3 (no-match case only) | **PARTIAL** |
| M4 | Feature reachable when the admin disabled it | vendor | UI | #M4 | caught |
| M5 | Adding a note discards the unsaved status | vendor | UI | #M5 `test.fail`: **product bug**, see `baseline/FINDINGS.md` #1 | bug pinned |
| M6 | Vendor can add another vendor's product to a manual order | vendor | API + UI | none | **GAP** |

## Open (in order)

1. **#3 suborder listing.** Create a multi-vendor order. Each vendor's list must show only its own suborder id, never the parent.
2. **#12 View lands on the right order.** Needs the order details route; it leaves the React app today.
3. **#10 filters.** Every row returned by the customer and date-range filters matches the filter.
4. **#11 export.** The legacy suite deferred it because headless Chromium fires no `download` event for the hidden-form POST. Try `page.request` replaying the form POST and asserting the CSV order ids.
5. **#14 staff (Pro), #15 Lite without Pro.**
6. **M6** manual order with another vendor's product must be refused.
