# The legacy Vendor sales chart plots gross totals of processing, on-hold and completed Vendor orders by creation date

Status: Accepted (retroactive — documents existing code)

## Context

With WooCommerce Analytics off, the Vendor dashboard shows a "Sales" chart for the current month (`templates/dashboard/sales-chart-widget.php`), and the Vendor dashboard REST API exposes a sales report built on the same query. Teammates ask "which orders does this chart include?", "are refunds taken off?" and "which date is used?".

## Rule

**Query.** `dokan_get_order_report_data()` (`lite:includes/reports.php:20-248`), a copy of WooCommerce's legacy `WC_Admin_Report::get_order_report_data()`, selects from `wp_posts` joined to `dokan_orders` and keeps only rows where (`:114-126`):

- `post_type = 'shop_order'` and `post_status != 'trash'`;
- `dokan_orders.seller_id` = the current Vendor (`dokan_get_current_user_id()`, so Vendor Staff see their Vendor);
- `dokan_orders.order_status` is in `wc-completed`, `wc-processing`, `wc-on-hold`, filterable through WooCommerce's `woocommerce_reports_order_statuses`;
- when a range is requested, `DATE(post_date)` is between the start and end dates inclusive (order creation date, site time).

**Chart.** `dokan_dashboard_sales_overview()` (`:261-267`) asks for the first day of the current month to today, grouped by day; `dokan_sales_overview_chart_data()` (`:285-338`) plots `SUM(_order_total)` as "Sales total" and `COUNT(DISTINCT ID)` as "Number of orders". `_order_total` is the WooCommerce order total meta: gross, including tax and shipping, and not reduced by refunds.

**Caching.** Results are cached per Vendor (group `report_data_seller_{vendor_id}`) for 1 hour when the range ends today and 24 hours otherwise (`:227-245`).

**Only without the premium add-on.** `includes/reports.php` is loaded only when the premium add-on is not active (`lite:dokan-class.php:290-292`). Because the functions are pluggable (`function_exists` guards), an add-on that defines `dokan_get_order_report_data()` changes these rules everywhere the function is called.

## Settings that change it

None in Dokan. The status list can be changed with `woocommerce_reports_order_statuses`; the query can be rewritten with `dokan_reports_get_order_report_query` and the result with `dokan_reports_get_order_report_data`.

## Worked example

Settings: none relevant. Today is 15 June.

| Vendor order | Created | Status | `_order_total` | Refunded |
|---|---|---|---|---|
| #601 | 3 June | completed | 115.00 | 15.00 |
| #602 | 3 June | on-hold | 40.00 | 0 |
| #603 | 9 June | cancelled | 30.00 | 0 |
| #604 | 28 May | processing | 70.00 | 0 |

The chart shows on 3 June: Sales total 155.00, 2 orders (refund not deducted); on 9 June: nothing (cancelled); #604 falls outside the month.

## Edge cases

- **Refunded orders are left out**, and partially refunded orders are counted at their full original total.
- **Storage.** The query reads `wp_posts` and `wp_postmeta`. On a store using WooCommerce's order tables (HPOS) without compatibility sync, it finds no orders.
- **REST sales report.** `VendorDashboardController::get_sales_reports()` (`lite:includes/REST/VendorDashboardController.php:186-270`) uses the same function with extra columns: `SUM(_qty)` of line items and `SUM(dokan_orders.net_amount)` as `total_earnings`. Because it joins order line items, the per-order sums (`total_sales`, `total_earnings`) are repeated once per line item of each order.

## Why

The function was cloned from WooCommerce's legacy report class (docblock, `lite:includes/reports.php:7-9`) and kept WooCommerce's default report statuses.

## Consequences & risks

- The chart's "sales" are gross and ignore refunds, so a month of the chart does not reconcile with the Net Sales counter beside it (which is all-time and after refunds) or with WooCommerce Analytics.

## Recommendations

- Read from `dokan_orders.order_total` (after refunds) or from `wc_order_stats` so the chart works on HPOS-only stores and matches the counters.
- Aggregate per order before joining line items in the REST sales report.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
