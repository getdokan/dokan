# An active Vendor on the admin dashboard is one with a positive Earning on an order created in the period

Status: Accepted (retroactive — documents existing code)

## Context

The admin dashboard's monthly overview (`GET dokan/v1/admin/dashboard/monthly-overview?date=YYYY-MM`) compares this month with the previous one for New Products, Active Vendors, New Vendor Registration, New Customers, Order Cancellation Rate and Recurring Customers. Teammates ask "what makes a Vendor active?", "which days does 'last month' cover?" and "why is the Active Vendors number one higher than I expect?".

## Rule

**Comparison window.** `AdminDashboardStatsController::parse_date_range()` (`lite:includes/REST/AdminDashboardStatsController.php:663-718`) turns the selected month into:

- current period: the 1st of the month to the last day of the month, or to **today** when the selected month is the running month;
- previous period: the 1st of the previous month to its last day, or, for the running month, to the **same day of the month** (capped at the previous month's length).

So for the running month the overview compares month-to-date with the same number of days last month. The range is filterable through `dokan_rest_admin_dashboard_date_range`.

**Active Vendors.** `VendorOrderStatsStore::get_active_vendors_count()` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php:79-108`) counts `DISTINCT dokan_order_stats.vendor_id` over rows that:

- are not in an excluded status (`:83`, `:90-93`);
- have `vendor_earning > 0` (`:95`);
- have `wc_order_stats.date_created BETWEEN <start> AND <end>` (`:96`), where start and end are plain dates.

The tooltip describes this as "Vendors sold minimum 1 product" (`AdminDashboardStatsStore::get_active_vendors_data()`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php:356-380`); the count is filterable through `dokan_admin_dashboard_active_vendors_count`.

**The other overview counters** (`AdminDashboardStatsStore`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php`):

- New Products: published products created in the period, excluding subscription-pack and `subscription` product types and the advertisement product (`:307-345`; types filter `dokan_rest_admin_dashboard_exclude_product_types`).
- New Vendor Registration: users registered in the period whose capabilities contain `seller` (`:391-432`).
- New Customers: users registered in the period whose capabilities contain `customer` (`:178-219`).
- Order Cancellation Rate: share of `shop_order` posts created in the period with status `wc-cancelled`, counting parent Orders and Suborders alike (`:230-296`).
- Recurring Customers: distinct customers with a non-excluded order in the period who also ordered before the previous period began (`:98-167`).

## Settings that change it

- `woocommerce_excluded_report_order_statuses` (default pending, failed, cancelled): orders in these statuses do not make a Vendor active.
- Fee recipients and Commission formula: they decide `vendor_earning`, so a Vendor whose whole order went to Commission (Earning 0) is not active.
- Filters named above.

## Worked example

Settings: defaults; global Commission `fixed` 10 % + 0 flat. Today is 15 June; the Store Admin opens June.

- Current period: 1–15 June. Previous period: 1–15 May.
- In the current period one processing multi-vendor checkout produced Suborders for Vendor A (Earning 54.00) and Vendor B (Earning 36.00); its parent Order row has `vendor_id` 0 and Earning 90.00. Vendor C's only order is pending payment.
- Active Vendors = distinct {A, B, 0} = **3**, although two Vendors sold. Vendor C is excluded by status. The `0` comes from the parent Order row (see below).

## Edge cases

- **Parent Order rows count as a Vendor "0".** Parent Orders are stored with `vendor_id = 0` and a full Earning (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:112-117`, `:249-251`), and this query has no order-type condition, so any period that contains a multi-vendor checkout counts one extra "Vendor".
- **The end date is a bare date.** `BETWEEN '2026-06-01' AND '2026-06-15'` stops at 15 June 00:00:00, so orders created later on the last day are not counted. For the running month this means today's orders do not yet make a Vendor active.
- **Refunded-to-zero orders**: once a full refund is imported the row's Earning is 0, so that order no longer makes its Vendor active.

## Why

The "minimum one sale" definition is stated in the tooltip. No recorded reason for the date handling or for including parent rows.

## Consequences & risks

- Active Vendors is overstated by one whenever a multi-vendor checkout happened in the period, and understated for orders on the last day.

## Recommendations

- Add `vendor_id > 0` (or the Vendor-order type list) and compare with `<end> 23:59:59`, as `get_sales_chart_data()` does.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
