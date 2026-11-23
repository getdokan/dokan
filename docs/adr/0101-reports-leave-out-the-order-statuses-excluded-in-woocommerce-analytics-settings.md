# Reports leave out the order statuses excluded in WooCommerce Analytics settings

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor order can sit in many statuses: pending payment, on-hold, processing, completed, cancelled, refunded, failed, draft. Teammates ask "does the revenue report include pending or cancelled orders?", "why does the dashboard show a different total from the order list?" and "where do I change which statuses count?".

Dokan has two kinds of report: the WooCommerce Analytics reports it filters (revenue, orders, products and so on), and its own SQL queries over `dokan_order_stats` joined to `wc_order_stats` (admin dashboard widgets and the admin report lists). Both follow the WooCommerce Analytics status setting. The legacy, pre-Analytics reports use fixed status lists and are covered in their own ADRs.

## Rule

**WooCommerce Analytics reports** exclude the statuses chosen in WooCommerce → Settings → Analytics → "Excluded statuses" (`woocommerce_excluded_report_order_statuses`), plus `auto-draft` and `trash`. WooCommerce applies this itself (`wc:src/Admin/API/Reports/DataStore.php::get_excluded_report_order_statuses()`). When the option has never been saved, it uses `Settings::get_default_excluded_order_statuses()` (`wc:src/Internal/Admin/Settings.php::get_default_excluded_order_statuses()`): pending, cancelled and failed, passed through the `woocommerce_analytics_settings_default_excluded_order_statuses` filter (WooCommerce 11.2+). Dokan adds no status rule of its own to these reports, so a Vendor sees exactly the statuses the Store Admin's WooCommerce Analytics counts. Refund rows take the status of the order they refund (`wc:src/Admin/API/Reports/Orders/Stats/DataStore.php::update()`).

**Dokan's own report queries** use `ReportUtil::get_exclude_order_statuses()` (`lite:includes/Utilities/ReportUtil.php::get_exclude_order_statuses()`): the same option, plus `auto-draft`, `trash` and `checkout-draft`, passed through WooCommerce's `woocommerce_analytics_excluded_order_statuses` filter and then Dokan's `dokan_analytics_excluded_order_statuses` filter, prefixed with `wc-`. When the option has never been saved, Dokan uses its own fixed default (pending, failed, cancelled); it does not read WooCommerce's filtered default. It is applied by:

| Query | Applied? | Citation |
|---|---|---|
| Admin dashboard sales chart | always | `lite:includes/Models/DataStore/VendorOrderStatsStore.php::get_sales_chart_data()` |
| Admin dashboard active Vendors | always | `::get_active_vendors_count()` |
| Admin dashboard recurring customers | always | `lite:includes/Models/DataStore/AdminDashboardStatsStore.php::get_recurring_customers_data()` |
| Report rows, row count and summary | only when the caller passes `exclude_statuses = true` | `lite:includes/Models/DataStore/VendorOrderStatsStore.php::get_report_data()`, `::get_report_count()`, `::get_report_summary()` |
| Admin dashboard top-performing Vendors | **never** | `::get_top_performing_vendors()` |

The status setting is the only filter these queries share with WooCommerce Analytics. They do not apply the Vendor-order type list from [ADR-0098](./0098-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md):

- The sales chart, active Vendors and top-performing Vendors read every row, parent Orders included, so a multi-vendor checkout is counted once as its parent and again as its Suborders ([ADR-0102](./0102-the-admin-dashboard-sales-chart-adds-parent-orders-and-suborders-together.md), [ADR-0097](./0097-an-active-vendor-on-the-admin-dashboard-is-one-with-a-positive-earning-on-an-order-created-in-the-period.md), [ADR-0112](./0112-top-performing-vendors-are-ranked-by-earning-on-orders-created-in-the-month-whatever-their-status.md)). The sales chart also keeps only rows with `total_sales > 0`, so refund rows never offset it.
- `get_report_summary()`, which an add-on's admin earnings report reads, adds no order-type, Vendor or date condition at all: its `commission`, `net_earning` and `total_earnings` sum every row in the table, parent Orders included, so multi-vendor checkouts count twice there too. Its `net_earning` also counts the admin fees of advertisement and Vendor subscription orders twice ([ADR-0096](./0096-advertisement-and-vendor-subscription-orders-are-recorded-in-analytics-without-a-vendor-and-with-only-their-fees-as-admin-earning.md)).

So the figures agree with WooCommerce Analytics only for single-vendor Orders.

Admin dashboard counters that are not revenue (order cancellation rate, new customers, new Vendor registrations, new products) do not use the status setting; the cancellation rate counts every order, including cancelled ones, because cancelled orders are what it measures (`lite:includes/Models/DataStore/AdminDashboardStatsStore.php::get_order_cancellation_rate_data()`).

## Settings that change it

- `woocommerce_excluded_report_order_statuses` (WooCommerce → Settings → Analytics → Excluded statuses).
  - A status in the list: orders and their refunds in that status are left out of every WooCommerce Analytics report and of the Dokan queries marked "always" above.
  - A status not in the list: those orders count.
  - Never saved: pending, cancelled and failed in both. If code filters WooCommerce's default through `woocommerce_analytics_settings_default_excluded_order_statuses`, WooCommerce Analytics follows the filtered default while Dokan's queries keep pending, failed and cancelled.
- Filters `woocommerce_analytics_excluded_order_statuses` and `dokan_analytics_excluded_order_statuses` can change the list in code.
- Not a setting: an order-status filter chosen on a report (`status_is` or `status_is_not`) is a request parameter and replaces the list for that query (`wc:src/Admin/API/Reports/DataStore.php::get_status_subquery()`).

## Worked example

Settings: excluded statuses left at the default; WooCommerce date type `date_created` (under the default `date_paid`, an unpaid pending order has no paid date and stays out of the revenue report even when its status is counted); only a global Commission formula, `fixed` 10 % + 0 flat; no tax or shipping.

In one month Vendor A has three single-vendor Orders: #201 completed 50.00, #202 processing 30.00 and #203 pending payment 20.00.

- Vendor A's WooCommerce Analytics revenue: 50.00 + 30.00 = 80.00 total sales, 2 orders, total Earning 45.00 + 27.00 = 72.00.
- The Store Admin's dashboard sales chart for that month adds the same 80.00 for Vendor A's orders.
- If the Store Admin removes "Pending payment" from the excluded list, #203 is counted: 100.00 total sales and 3 orders in both places.

Variant: if #201 had been Vendor A's Suborder of a 50.00 + 30.00 multi-vendor checkout, Vendor A's analytics would still show 50.00 for it, while the dashboard sales chart would add the 80.00 parent row on top of the 50.00 and 30.00 Suborder rows.

## Edge cases

- **Processing and on-hold orders count by default.** Unlike the Vendor Balance, which counts only Vendor orders in the withdraw order statuses (see [ADR-0064](./0064-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)), analytics revenue includes processing and on-hold orders.
- **Refunded orders count** (the refunded status is not excluded by default). In WooCommerce Analytics their refund rows offset them; in the admin dashboard sales chart they do not, because refund rows are dropped there and the order row keeps its original `total_sales`.
- **`checkout-draft`** is added to the exclusion list by Dokan's own queries, while WooCommerce's list adds only `auto-draft` and `trash`. Because Dokan adds it before applying `woocommerce_analytics_excluded_order_statuses`, a callback on that filter can still remove it.

## Why

Reusing the WooCommerce setting keeps Dokan's numbers consistent with the WooCommerce Analytics screens the Store Admin already configures. No further reason is recorded.

## Consequences & risks

- One setting controls Vendor and Store Admin reports alike; Vendors cannot choose their own status set.
- Report revenue and Vendor Balance answer different questions and will normally differ.
- The report-list helpers default `exclude_statuses` to `false`, so a new caller that forgets the flag silently includes pending, failed and cancelled orders.
- Dashboard widgets and WooCommerce Analytics disagree for any period that contains a multi-vendor checkout.

## Recommendations

- Apply the status exclusion in `get_top_performing_vendors()` like the other dashboard queries.
- Default `exclude_statuses` to `true` in `VendorOrderStatsStore`.
- Read the default from `Settings::get_default_excluded_order_statuses()` when WooCommerce provides it, so both sides follow the same filtered default.
- Restrict the dashboard queries and `get_report_summary()` to Vendor order types, as the Analytics filters do.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
