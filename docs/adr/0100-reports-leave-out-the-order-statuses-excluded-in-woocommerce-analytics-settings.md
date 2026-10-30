# Reports leave out the order statuses excluded in WooCommerce Analytics settings

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor order can sit in many statuses: pending payment, on-hold, processing, completed, cancelled, refunded, failed, draft. Teammates ask "does the revenue report include pending or cancelled orders?", "why does the dashboard show a different total from the order list?" and "where do I change which statuses count?".

Dokan has two kinds of report: the WooCommerce Analytics reports it filters (revenue, orders, products and so on), and its own SQL queries over `dokan_order_stats` joined to `wc_order_stats` (admin dashboard widgets and the admin report lists). Both follow the WooCommerce Analytics status setting. The legacy, pre-Analytics reports use fixed status lists and are covered in their own ADRs.

## Rule

**WooCommerce Analytics reports** exclude the statuses chosen in WooCommerce → Settings → Analytics → "Excluded statuses" (`woocommerce_excluded_report_order_statuses`), plus `auto-draft` and `trash`. WooCommerce applies this itself (`DataStore::get_excluded_report_order_statuses()`, `wc:src/Admin/API/Reports/DataStore.php:845-866`); the built-in default is pending, cancelled and failed (`Settings::get_default_excluded_order_statuses()`, `wc:src/Internal/Admin/Settings.php:117-118`). Dokan adds no status rule of its own to these reports, so a Vendor sees exactly the statuses the Store Admin's WooCommerce Analytics counts. Refund rows take the status of the order they refund (`wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:599-604`).

**Dokan's own report queries** use `ReportUtil::get_exclude_order_statuses()` (`lite:includes/Utilities/ReportUtil.php:66-82`): the same option and default (pending, failed, cancelled), plus `auto-draft`, `trash` and `checkout-draft`, passed through WooCommerce's `woocommerce_analytics_excluded_order_statuses` filter and then Dokan's `dokan_analytics_excluded_order_statuses` filter, prefixed with `wc-`. It is applied by:

| Query | Applied? | Citation |
|---|---|---|
| Admin dashboard sales chart | always | `VendorOrderStatsStore::get_sales_chart_data()`, `lite:includes/Models/DataStore/VendorOrderStatsStore.php:172-176` |
| Admin dashboard active Vendors | always | `get_active_vendors_count()`, `:83-93` |
| Admin dashboard recurring customers | always | `AdminDashboardStatsStore::get_recurring_customers_data()`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php:102`, `:123`, `:143` |
| Report rows, row count and summary | only when the caller passes `exclude_statuses = true` | `get_report_data()` `:298-304`, `get_report_count()` `:337-341`, `get_report_summary()` `:372-376` |
| Admin dashboard top-performing Vendors | **never** | `get_top_performing_vendors()`, `:121-140` |

Admin dashboard counters that are not revenue (order cancellation rate, new customers, new Vendor registrations, new products) do not use the status setting; the cancellation rate counts every order, including cancelled ones, because cancelled orders are what it measures (`AdminDashboardStatsStore::get_order_cancellation_rate_data()`, `lite:includes/Models/DataStore/AdminDashboardStatsStore.php:230-296`).

## Settings that change it

- `woocommerce_excluded_report_order_statuses` (WooCommerce → Settings → Analytics → Excluded statuses). Default when never saved: `pending`, `cancelled`, `failed`.
  - A status in the list: orders and their refunds in that status are left out of every WooCommerce Analytics report and of the Dokan queries marked "always" above.
  - A status not in the list: those orders count.
- Filters `woocommerce_analytics_excluded_order_statuses` and `dokan_analytics_excluded_order_statuses` can change the list in code.

## Worked example

Settings: excluded statuses left at the default; WooCommerce date type `date_created` (under the default `date_paid`, an unpaid pending order has no paid date and stays out of the revenue report even when its status is counted); only a global Commission formula, `fixed` 10 % + 0 flat; no tax or shipping.

In one month Vendor A has three Vendor orders: #201 completed 50.00, #202 processing 30.00 and #203 pending payment 20.00.

- Vendor A's WooCommerce Analytics revenue: 50.00 + 30.00 = 80.00 gross sales, 2 orders, total Earning 45.00 + 27.00 = 72.00.
- The Store Admin's dashboard sales chart for that month adds the same 80.00 for Vendor A's orders.
- If the Store Admin removes "Pending payment" from the excluded list, #203 is counted: 100.00 gross sales and 3 orders in both places.

## Edge cases

- **Processing and on-hold orders count by default.** Unlike the Vendor Balance, which counts only Vendor orders in the withdraw order statuses (see [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)), analytics revenue includes processing and on-hold orders.
- **Refunded orders count** (the refunded status is not excluded by default); their refund rows offset them.
- **Top-performing Vendors ignore the setting**, so a cancelled or failed order still adds to a Vendor's ranking (see [ADR-0111](./0111-top-performing-vendors-are-ranked-by-earning-on-orders-created-in-the-month-whatever-their-status.md)).
- **`checkout-draft`** is added to the exclusion list by Dokan's own queries, while WooCommerce's list adds only `auto-draft` and `trash`. Because Dokan adds it before applying `woocommerce_analytics_excluded_order_statuses`, a callback on that filter can still remove it.

## Why

Reusing the WooCommerce setting keeps Dokan's numbers consistent with the WooCommerce Analytics screens the Store Admin already configures. No further reason is recorded.

## Consequences & risks

- One setting controls Vendor and Store Admin reports alike; Vendors cannot choose their own status set.
- Report revenue and Vendor Balance answer different questions and will normally differ.
- The report-list helpers default `exclude_statuses` to `false`, so a new caller that forgets the flag silently includes pending, failed and cancelled orders.

## Recommendations

- Apply the status exclusion in `get_top_performing_vendors()` like the other dashboard queries.
- Default `exclude_statuses` to `true` in `VendorOrderStatsStore`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
