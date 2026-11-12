# An active Vendor on the admin dashboard is one with a positive Earning on an order created in the period

Status: Accepted (retroactive — documents existing code)

## Context

The admin dashboard's monthly overview (`GET dokan/v1/admin/dashboard/monthly-overview?date=YYYY-MM`) compares this month with the previous one for New Products, Active Vendors, New Vendor Registration, New Customers, Order Cancellation Rate and Recurring Customers. Teammates ask "what makes a Vendor active?" and "which days does 'last month' cover?".

## Rule

**Comparison window.** `AdminDashboardStatsController::parse_date_range()` (`lite:includes/REST/AdminDashboardStatsController.php:663-718`) turns the selected month into:

- current period: the 1st of the month to the last day of the month, or to **today** when the selected month is the running month;
- previous period: the 1st of the previous month to its last day, or, for the running month, to the **same day of the month** (capped at the previous month's length).

So for the running month the overview compares month-to-date with the same number of days last month. The range is filterable through `dokan_rest_admin_dashboard_date_range`.

**Active Vendors.** `VendorOrderStatsStore::get_active_vendors_count()` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php:79-108`) counts `DISTINCT dokan_order_stats.vendor_id` over rows that:

- are not in an excluded status (`:83`, `:90-93`);
- have `vendor_earning > 0` (`:95`);
- have `wc_order_stats.date_created BETWEEN <start> AND <end>` (`:96`).

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
- In the current period Vendor A has a processing order (Earning 54.00) and Vendor B has a completed order (Earning 36.00). Vendor C's only order is pending payment.
- Active Vendors = distinct {A, B} = **2**. Vendor C is excluded by status.

## Edge cases

- **Refunded-to-zero orders**: once a full refund is imported the row's Earning is 0, so that order no longer makes its Vendor active.

## Why

The "minimum one sale" definition is stated in the tooltip.

## Consequences & risks

None recorded.

## Recommendations

None.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
