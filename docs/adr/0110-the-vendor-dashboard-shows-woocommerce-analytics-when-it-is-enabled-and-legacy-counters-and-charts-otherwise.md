# The Vendor dashboard shows WooCommerce Analytics when it is enabled, and legacy counters and charts otherwise

Status: Accepted (retroactive — documents existing code)

## Context

Dokan has two generations of Vendor reporting. Since 4.0.0 the Vendor dashboard overview mounts a React app that reads WooCommerce Analytics, scoped to the Vendor. The older dashboard shows PHP widgets (big counters, recent orders, products, a month-to-date sales chart) built from Dokan's own `dokan_orders` and Vendor Balance tables. Teammates ask "why does this Vendor see different numbers from that one?", "why are the counters missing?" and "which figures apply to my site?". The answer starts with which generation is active.

## Rule

**The switch.** `ReportUtil::is_analytics_enabled()` returns `true` when WooCommerce's `woocommerce_analytics_enabled` option is `yes`, filtered through `dokan_is_analytics_enabled` (`lite:includes/Utilities/ReportUtil.php:22-33`; option name `Analytics::TOGGLE_OPTION_NAME`, `wc:src/Internal/Admin/Analytics.php:23`).

**When it is `true`:**

- The analytics bundle is registered (`Analytics\Assets::register_hooks()`, `lite:includes/Analytics/Assets.php:10-19`) and renders into the `#dokan-analytics-app` container on the Vendor overview. The container itself is printed on every overview (`VendorDashboardManager::add_dashboard_content()`, `lite:includes/Analytics/VendorDashboardManager.php:12`, `:31-33`); without the bundle it stays empty.
- The figures follow the WooCommerce Analytics rules in the other [report ADRs](decisions-index.md#reports): Vendor-order level, excluded statuses, WooCommerce date type, refund-adjusted Commission and Earning.
- The PHP widgets are not added.

**When it is `false`:**

- `Dashboard\Templates\Dashboard` adds the big-counter, orders, products and sales-chart widgets (`lite:includes/Dashboard/Templates/Dashboard.php:34-39`).
- The figures follow the legacy rules: [ADR-0107](./0107-the-legacy-dashboard-net-sales-counter-is-the-order-total-after-refunds-of-processing-on-hold-and-completed-vendor-orders.md), [ADR-0106](./0106-the-legacy-dashboard-earning-counter-is-ledger-earnings-in-withdraw-statuses-minus-approved-refunds.md), [ADR-0108](./0108-the-legacy-dashboard-order-counter-counts-vendor-orders-in-withdraw-statuses-plus-refunded-ones.md) and [ADR-0109](./0109-the-legacy-vendor-sales-chart-plots-gross-totals-of-processing-on-hold-and-completed-vendor-orders-by-creation-date.md).
- Lite's legacy report helpers (`includes/reports.php`) are loaded only when the premium add-on is not active (`lite:dokan-class.php:290-292`); add-ons may supply their own versions of the same pluggable functions (`dokan_get_order_report_data()`, `dokan_dashboard_sales_overview()`), which then change the legacy chart's rules.

**Independent of the switch:** the analytics lookup table `dokan_order_stats` is filled only while WooCommerce imports orders into Analytics (`ScheduleListener`, `lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php:28-31`). The admin dashboard widgets that read it (sales chart, active and top Vendors) show nothing useful on a site where WooCommerce Analytics has never imported orders.

Widgets are also gated per capability: the counters need `dokan_view_sales_overview` and the chart needs `dokan_view_sales_report_chart` (`lite:includes/Dashboard/Templates/Dashboard.php:62-70`, `:251-258`), and any widget can be switched off through `dokan_dashboard_widget_applicable`.

## Settings that change it

- `woocommerce_analytics_enabled` (WooCommerce → Settings → Advanced → Features → Analytics). `yes`: analytics app. Anything else: legacy widgets.
- Filter `dokan_is_analytics_enabled` overrides the option in code.

## Worked example

Not a money rule. Example: the Store Admin turns WooCommerce Analytics off. Every Vendor's overview immediately shows the legacy counters (Net Sales, Earning, Pageview, Order) and the month-to-date sales chart instead of the analytics app; turning it back on restores the app. The two show different figures for the same Vendor because they read different tables with different status and refund rules.

## Edge cases

- Turning Analytics on for an existing site does not backfill `dokan_order_stats` by itself; WooCommerce's "Import historical data" (or the 3.13.0 upgrade, `V_3_13_0::resync_wc_order_stats_to_sync_dokan_stats`, `lite:includes/Upgrade/Upgrades/V_3_13_0.php:10`) is needed for past orders.
- Vendor Staff see whichever generation is active, limited by the capabilities above.

## Why

The legacy widgets predate WooCommerce Analytics. Keeping them behind the WooCommerce toggle lets marketplaces that disable WooCommerce Analytics (often for performance) keep a working dashboard.

## Consequences & risks

- Two different definitions of "sales" and "earning" exist on the same product, chosen by a WooCommerce setting the Store Admin may not associate with Dokan.
- Support must ask which generation a Vendor sees before comparing numbers.

## Recommendations

- Show the active reporting mode (and its status and date rules) in Dokan's admin status page.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
