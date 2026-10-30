# The admin dashboard sales chart adds parent Orders and Suborders together

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The admin dashboard shows a daily sales chart for a selected month (`GET dokan/v1/admin/dashboard/sales-chart?date=YYYY-MM`) with total sales, net sales, Commission and order count per day. Unlike WooCommerce Analytics, it is a Dokan SQL query over `dokan_order_stats` joined to `wc_order_stats`. Teammates ask "why is the dashboard chart higher than WooCommerce Analytics revenue for the same month?" and "does the chart include refunds?".

## Rule

`AdminDashboardStatsController::get_sales_chart()` (`lite:includes/REST/AdminDashboardStatsController.php:589-610`) calls `VendorOrderStatsStore::get_sales_chart_data( $start, $end, true )` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php:153-222`), which per day returns

- `total_sales` = `SUM(wc_order_stats.total_sales)`,
- `net_sales` = `SUM(wc_order_stats.net_total)` (order total minus tax and shipping, `wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:772-775`),
- `commissions` = `SUM(dokan_order_stats.admin_commission)`,
- `order_count` = `COUNT(order_id)`,

over rows that:

- are **any `order_type`**: no type condition is added (`:157-186`), so parent Orders (type 0), Suborders, single-vendor Orders and marketplace-owned orders are all summed;
- are not in an excluded status (`ReportUtil::get_exclude_order_statuses()`, `:172-176`);
- have `total_sales > 0` (`:178`), which drops every refund row and every zero-total order;
- were created between the first day of the month and its last day, or today for the running month (`:179-186`; range from `parse_date_range()`, `lite:includes/REST/AdminDashboardStatsController.php:663-718`).

`Orders\Stats\DataStore::update()` computes a full Commission split for parent Orders too (it runs `OrderCommission` for every `shop_order`, `lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:112-117`, and line items without an order Vendor resolve their Vendor from the product, `lite:includes/Commission/Strategies/OrderItem.php:44-47`), so a parent row carries the same amounts as its Suborders together. Every multi-vendor checkout therefore appears twice in the chart: once as the parent and once as its Suborders.

## Settings that change it

- `woocommerce_excluded_report_order_statuses`: which statuses are left out (default pending, failed, cancelled).
- No setting for order types or dates; the date basis is always order creation ([ADR-0098](./0098-analytics-date-a-sale-by-the-woocommerce-date-type-but-dokan-dashboard-statistics-use-the-order-creation-date.md)).
- `dokan_rest_admin_dashboard_sales_chart_data` filters the response.

## Worked example

Settings: only a global Commission formula, `fixed` 10 % + 0 flat; no tax or shipping; excluded statuses at default.

On 3 June: one multi-vendor checkout (#100 = 100.00, Suborders #101 = 60.00 for Vendor A and #102 = 40.00 for Vendor B) and one single-vendor Order #110 = 50.00, all processing.

| Row | type | total_sales | admin_commission |
|---|---|---|---|
| #100 | 0 (parent) | 100.00 | 10.00 |
| #101 | 2 | 60.00 | 6.00 |
| #102 | 2 | 40.00 | 4.00 |
| #110 | 1 | 50.00 | 5.00 |

Chart for 3 June: total sales **250.00**, Commission **25.00**, orders **4**.
WooCommerce Analytics for the same orders (date type `date_created`): gross sales 150.00, Commission 15.00, 3 orders.

## Edge cases

- Refunds never appear as negative amounts, because refund rows have negative totals and are filtered out. They lower only the Commission stored on the refunded order's row; that row's `total_sales` stays the original order total.
- The parent row's Commission is computed from the parent's own copy of the line items. Each item's Vendor is taken from the product author when the order has no `_dokan_vendor_id` (`Strategies\OrderItem::__construct()`, `lite:includes/Commission/Strategies/OrderItem.php:44-47`), so the parent row normally equals the sum of its Suborders. It can differ when a Commission formula or Fee recipient changed between the Suborders' first calculation and the parent's, because each order freezes its own terms (Lite ADR 0012).

## Why

No recorded reason. Other queries on the same table exclude parent Orders explicitly (`VendorOrderStatsStore::apply_order_type_filter()`, `lite:includes/Models/DataStore/VendorOrderStatsStore.php:441-453`), which suggests the omission here is unintended.

## Consequences & risks

- The chart overstates sales, Commission and order counts by the value of every multi-vendor checkout, and disagrees with WooCommerce Analytics and with the Store Admin's own expectation.

## Recommendations

- Add `order_type IN (vendor order types)` to `get_sales_chart_data()`, as the Analytics filters do, and decide explicitly whether refunds should be netted per day.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
