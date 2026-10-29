# Parity: orders

| Legacy test | Title | Verdict |
|---|---|---|
| orders/newOrders.spec.ts:58 | vendor can view order list page (React) | DROPPED implicit: every test opens the list via goto(), which waits for the list REST call |
| orders/newOrders.spec.ts:65 | vendor order list shows the seeded order row (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #1 (own-order guard), #17 |
| orders/newOrders.spec.ts:73 | vendor sees the core order columns (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #16 |
| orders/newOrders.spec.ts:81 | vendor seeded order row shows status badge + total (React) | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #7 (exact total and earning vs REST; old matched any digit) |
| orders/newOrders.spec.ts:91 | vendor can open the Export dropdown (React) | TODO #11 export content (opening the menu catches nothing) |
| orders/newOrders.spec.ts:97 | vendor can view the All status tab (React) | DROPPED vague (rows > 0); tab filtering owned by react/vendor-orders/vendorOrders.spec.ts #9 |
| orders/newOrders.spec.ts:102 | vendor sees the empty state for a non-existent order id search (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #1 |
| orders/newOrders.spec.ts:109 | vendor can filter orders by Customer via the funnel (React) | TODO #10 assert every returned row matches the customer |
| orders/newOrders.spec.ts:117 | vendor can filter orders by Date Range via the funnel (React) | TODO #10 assert every returned row is in the range |
| orders/newOrders.spec.ts:125 | vendor can search orders — narrows to zero rows for a non-existent order id (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #1 |
| orders/newOrders.spec.ts:143 | vendor can search orders — exact order id keeps the row (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #1, #17 |
| orders/newOrders.spec.ts:150 | vendor can filter orders by status tab — Processing shows the seeded order (React) | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #9 (every row in the tab has that status) |
| orders/newOrders.spec.ts:156 | vendor row actions menu exposes View + at least one status-change action (React) | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #4 (status action used and persisted); View: TODO #12 |
| orders/newOrders.spec.ts:164 | vendor can view order details from the row action (React) | TODO #12 View must land on the clicked order |
| orders/newOrders.spec.ts:170 | vendor status-change action issues a non-GET request (React) | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #4 (response < 400 and REST status) |
| orders/newOrders.spec.ts:176 | vendor order list deep-link survives reload (HashRouter) (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #17 |
| orders/newOrders.spec.ts:183 | vendor order list renders without a PHP fatal (React) | OWNED react/_shared/fixtures.ts (every role page fails on PHP fatal or uncaught JS error) |
| orders/newOrders.spec.ts:203 | vendor can bulk-change status of selected orders (React) | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #5 (also asserts an unselected order is untouched) |
| orders/newOrders.spec.ts:261 | customer can view my orders page and sees the seeded order (React parity) | OUT-OF-SCOPE WooCommerce My Account page, not React |
| orders/newOrders.spec.ts:268 | customer can view order details (React parity) | OUT-OF-SCOPE WooCommerce My Account page, not React |
| orders/newOrders.spec.ts:279 | customer order appears in vendor React /orders, vendor completes it, change persists (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #4 |
| orders/newOrdersGaps.spec.ts:60 | vendor updating an order status from the row action persists it (React) | PORTED react/vendor-orders/vendorOrders.spec.ts #4 |
| orders/newOrdersGaps.spec.ts:70 | vendor order revenue equals vendor earning plus admin commission (React) | OWNED api/calculation.spec.ts (old helpers ignore quantity, see FINDINGS.md) |
| orders/newOrdersGaps.spec.ts:144 | vendor cannot change an order status when the capability is disabled (React) | PORTED react/vendor-orders/vendorOrdersCapability.global.spec.ts #6 |
| orders/orders.spec.ts:228 | Test Case 1 - React order list mounts at /dashboard/new/#/orders | DROPPED duplicate of "vendor can view order list page" |
| orders/orders.spec.ts:244 | Test Case 2 - Order list renders rows or an empty-state banner | DROPPED duplicate, vague (rows or empty) |
| orders/orders.spec.ts:260 | Test Case 3 - Search filter narrows the list to zero rows for nonsense query | PORTED react/vendor-orders/vendorOrders.spec.ts #1 |
| orders/orders.spec.ts:288 | Test Case 4 - Row actions menu exposes View and at least one status-change action | REWRITTEN react/vendor-orders/vendorOrders.spec.ts #4 |
| orders/orders.spec.ts:324 | Test Case 5 - Page renders without a PHP fatal | OWNED react/_shared/fixtures.ts |
| orders/orders.spec.ts:338 | Test Case 6 - Vendor announcement modal does not block list mount | DROPPED implicit: page objects install closeAnnouncementModal before goto |
| orders/orders.spec.ts:353 | Test Case 7 - Direct deep link to /orders works (HashRouter survives reload) | PORTED react/vendor-orders/vendorOrders.spec.ts #17 |
