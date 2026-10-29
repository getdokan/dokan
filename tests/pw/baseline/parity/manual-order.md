# Parity: manual-order

| Legacy test | Title | Verdict |
|---|---|---|
| manual-order/newManualOrder.spec.ts:36 | admin can enable vendor order creation, making the React route reachable (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts (beforeAll enables; #M1 proves the route renders) |
| manual-order/newManualOrder.spec.ts:50 | admin can disable vendor order creation, hiding the React route (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M4 |
| manual-order/newManualOrder.spec.ts:89 | vendor can view the Add New Order form (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M1 |
| manual-order/newManualOrder.spec.ts:95 | vendor sees the default order status as Pending payment (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M1 |
| manual-order/newManualOrder.spec.ts:99 | vendor sees all WooCommerce order statuses in the status dropdown (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M1 |
| manual-order/newManualOrder.spec.ts:106 | vendor can create a manual order by adding a product line (React) | REWRITTEN react/vendor-orders/manualOrder.global.spec.ts #M2 (REST line_items, not on-screen text) |
| manual-order/newManualOrder.spec.ts:111 | vendor can set the order status while creating a manual order (React) | REWRITTEN react/vendor-orders/manualOrder.global.spec.ts #M2 (REST status; old read the dropdown, missed the #M5 bug) |
| manual-order/newManualOrder.spec.ts:118 | vendor can add an order note while creating a manual order (React) | REWRITTEN react/vendor-orders/manualOrder.global.spec.ts #M2 (REST order notes) |
| manual-order/newManualOrder.spec.ts:128 | vendor product search returns no option for a non-existent product (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M3 (waits on the search response, no sleep) |
| manual-order/newManualOrder.spec.ts:136 | vendor customer field handles an empty search result without error (React) | REWRITTEN react/vendor-orders/manualOrder.global.spec.ts #M2 (customer selected and saved as customer_id); errors owned by react/_shared/fixtures.ts |
| manual-order/newManualOrder.spec.ts:144 | admin enables order creation, vendor creates and saves a manual order, then admin disables it (React) | PORTED react/vendor-orders/manualOrder.global.spec.ts #M2 + #M4 |
