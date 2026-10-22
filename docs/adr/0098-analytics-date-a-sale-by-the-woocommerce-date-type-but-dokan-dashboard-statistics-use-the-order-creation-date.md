# Analytics date a sale by the WooCommerce date type, but Dokan dashboard statistics use the order creation date

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

An order has three dates that matter for reporting: when it was created, when it was paid and when it was completed. A sale created on 30 June and paid on 2 July belongs to June by one date and to July by another. Teammates ask "which month does this order fall into?", "why do the admin dashboard chart and the revenue report disagree for the same month?" and "when does a refund show up?".

## Rule

**WooCommerce Analytics revenue and orders reports** (in WP Admin and on the Vendor dashboard) bucket orders by the WooCommerce Analytics "Date type" setting. The orders-stats data store reads `woocommerce_date_type` and falls back to `date_paid` (`wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:104`). Dokan's replacement data store extends that class without overriding the constructor (`lite:includes/Analytics/Reports/Orders/Stats/WcDataStore.php:13`), and Dokan hands the same option to the Vendor dashboard bundle (`Analytics\Settings::get_preload_options()`, `lite:includes/Analytics/Settings.php:57-63`), so the Vendor's revenue report uses the Store Admin's date type. WooCommerce's orders list and taxes data stores read the same option (`wc:src/Admin/API/Reports/Orders/DataStore.php:35`, `wc:src/Admin/API/Reports/Taxes/Stats/DataStore.php:75`), and the orders-stats store also accepts a per-request `date_type` argument that overrides it (`wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:346`). The other WooCommerce Analytics reports (products, variations, categories, coupons, customers) keep WooCommerce's default `date_created` column (`wc:src/Admin/API/Reports/DataStore.php:100`).

**Refund rows** in `wc_order_stats` carry the refund's own creation date; WooCommerce copies it into `date_paid` and `date_completed` when the refunded order has those dates (`wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:643-645`). A refund therefore reduces sales in the period in which it was made, not in the period of the original sale.

**Dokan's own dashboard and report queries** always filter and group by `wc_order_stats.date_created`, whatever the date type:

- Admin dashboard sales chart (`VendorOrderStatsStore::get_sales_chart_data()`, `lite:includes/Models/DataStore/VendorOrderStatsStore.php:178-192`).
- Active Vendors and top-performing Vendors (`:96`, `:131`).
- Recurring customers (`AdminDashboardStatsStore::get_recurring_customers_data()`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php:106-149`).
- Report rows and counts with a date range (`VendorOrderStatsStore::apply_date_filter()`, `lite:includes/Models/DataStore/VendorOrderStatsStore.php:538-561`), and the `order_date` they return (`:294`).

The order cancellation rate uses `posts.post_date` directly (`AdminDashboardStatsStore::get_order_cancellation_rate_data()`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php:234-258`).

**Legacy (pre-Analytics) reports** use the order's creation date: `post_date` in the Vendor sales chart (`lite:includes/reports.php:121-126`, `:293-299`) and `post_date` or HPOS `date_created_gmt` in the legacy admin report (`dokan_admin_report_data()`, `lite:includes/Admin/functions.php:70-91`).

## Settings that change it

- `woocommerce_date_type` (WooCommerce → Settings → Analytics → Date type). Default `date_paid` (`wc:src/Internal/Admin/Settings.php:478-490`).
  - `date_created`: revenue and orders reports bucket by order creation, matching Dokan's own dashboard queries.
  - `date_paid` (default): orders without a paid date are left out of revenue and orders reports until they are paid; paid orders fall on the payment date.
  - `date_completed`: only completed orders appear, on their completion date.
- Dokan's dashboard queries have no setting; they always use the creation date.

## Worked example

Settings: date type left at `date_paid`; excluded statuses at the default; only a global Commission formula, `fixed` 10 % + 0 flat.

Vendor A receives Vendor order #301 for 80.00 created on 30 June, paid by bank transfer and marked processing on 2 July.

- Vendor A's Reports → Revenue for June: 0.00. For July: 80.00 gross sales, Earning 72.00.
- The Store Admin's dashboard sales chart (Dokan query, creation date) for June: 80.00 for this order; for July: nothing.
- On 5 August Vendor A refunds 20.00 of the line item. WooCommerce's refund row (−20.00) is dated 5 August: the August revenue report shows −20.00 of sales. The Earning on the July row is recalculated to 54.00 (see [ADR-0099](./0099-commission-and-earning-in-analytics-are-the-vendor-orders-figures-after-refunds-while-refunds-reduce-sales-as-separate-rows.md)).

## Edge cases

- **On-hold orders under `date_paid`.** Orders that never received a paid date (for example on-hold bank transfer or cash-on-delivery orders before they move to processing) are missing from revenue and orders reports even though their status is counted.
- **Month boundaries on the admin dashboard** come from `parse_date_range()` in the dashboard controller; see [ADR-0096](./0096-an-active-vendor-on-the-admin-dashboard-is-one-with-a-positive-earning-on-an-order-created-in-the-period.md).
- **Time zones.** `wc_order_stats.date_created` is in site local time; legacy HPOS queries compare `date_created_gmt` against dates converted to UTC.

## Why

No recorded reason. A commented-out line in Dokan's own stats data store (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:64`) shows the date type was considered for Dokan's queries and not adopted.

## Consequences & risks

- For the same month, the admin dashboard and the WooCommerce Analytics revenue report can disagree whenever orders are paid or completed in a different month from creation.
- Refunds hit sales in the refund's period but Commission and Earning in the original order's period (see the refund ADR linked above), so a month's sales and Earning may not reconcile.

## Recommendations

- Make the Dokan dashboard queries honour `woocommerce_date_type`, or label their charts "by order date" so the difference is visible.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
