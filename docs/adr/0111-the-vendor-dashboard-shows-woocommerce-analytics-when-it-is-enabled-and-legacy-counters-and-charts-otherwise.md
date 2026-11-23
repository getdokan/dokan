# The Vendor dashboard shows WooCommerce Analytics when it is enabled, and legacy counters and charts otherwise

Status: Accepted (retroactive — documents existing code)

## Context

Dokan has two generations of Vendor reporting. Since 4.0.0 the Vendor dashboard overview mounts a React app that reads WooCommerce Analytics, scoped to the Vendor. The older dashboard shows PHP widgets (big counters, recent orders, products, a month-to-date sales chart) built from Dokan's own `dokan_orders` and Vendor Balance tables. Teammates ask "why does this Vendor see different numbers from that one?", "why are the counters missing?" and "which figures apply to my site?". The answer starts with which generation is active.

## Rule

**The switch.** `ReportUtil::is_analytics_enabled()` returns `true` when WooCommerce's `woocommerce_analytics_enabled` option is `yes`, filtered through `dokan_is_analytics_enabled` (`lite:includes/Utilities/ReportUtil.php::is_analytics_enabled()`; option name `wc:src/Internal/Admin/Analytics.php::TOGGLE_OPTION_NAME`). When the option has never been saved, Dokan treats it as `no`. WooCommerce treats a missing option as `yes`: Analytics is enabled by default (`wc:src/Internal/Features/FeaturesController.php`, feature `analytics`, `enabled_by_default`) and its report sync starts (`wc:src/Internal/Admin/FeaturePlugin.php::includes()`). On a site that never saved the toggle, Vendors therefore see the legacy widgets while WooCommerce Analytics runs and keeps `dokan_order_stats` up to date.

**When it is `true`:**

- The analytics bundle is registered (`lite:includes/Analytics/Assets.php::register_hooks()`) and renders into the `#dokan-analytics-app` container on the Vendor overview. The container itself is printed on every overview (`lite:includes/Analytics/VendorDashboardManager.php::register_hooks()`, `::add_dashboard_content()`); without the bundle it stays empty.
- The figures follow the WooCommerce Analytics rules in the other [report ADRs](decisions-index.md#reports): Vendor-order level, excluded statuses, WooCommerce date type, refund-adjusted Commission and Earning.
- The PHP widgets are not added.

**When it is `false`:**

- `Dashboard\Templates\Dashboard` adds the big-counter, orders, products and sales-chart widgets (`lite:includes/Dashboard/Templates/Dashboard.php::__construct()`).
- The figures follow the legacy rules: [ADR-0108](./0108-the-legacy-dashboard-net-sales-counter-is-the-order-total-after-refunds-of-processing-on-hold-and-completed-vendor-orders.md), [ADR-0107](./0107-the-legacy-dashboard-earning-counter-is-ledger-earnings-in-withdraw-statuses-minus-approved-refunds.md), [ADR-0109](./0109-the-legacy-dashboard-order-counter-counts-vendor-orders-in-withdraw-statuses-plus-refunded-ones.md) and [ADR-0110](./0110-the-legacy-vendor-sales-chart-plots-gross-totals-of-processing-on-hold-and-completed-vendor-orders-by-creation-date.md).
- Lite's legacy report helpers (`includes/reports.php`) are loaded only when the premium add-on is not active (`lite:dokan-class.php::includes()`); add-ons may supply their own versions of the same pluggable functions (`dokan_get_order_report_data()`, `dokan_dashboard_sales_overview()`), which then change the legacy chart's rules.

**The admin dashboard depends on WooCommerce Analytics running.** Its sales chart, active Vendors and top Vendors read `dokan_order_stats`, which receives orders only while WooCommerce's report sync runs (`lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php::register_hooks()`; `ReportsSync::init()` in `wc:src/Internal/Admin/FeaturePlugin.php::includes()`, which runs only while WooCommerce Analytics is enabled). With WooCommerce Analytics off they stop updating, and they show nothing useful on a site where WooCommerce Analytics has never imported orders.

**Backfill on activation.** When Dokan is activated, `Installer::maybe_backfill_order_stats()` (`lite:includes/Install/Installer.php::maybe_backfill_order_stats()`) asks WooCommerce for a full Analytics import (`ReportsSync::regenerate_report_data()`) if all of these hold: WooCommerce Analytics is on (here the missing option counts as `yes`), the filter `dokan_analytics_backfill_order_stats_on_activation` returns `true` (default), `dokan_order_stats` is empty and at least one order exists. If WooCommerce refuses because another import is queued, Dokan records the attempt in `dokan_order_stats_backfill_pending` and schedules the Action Scheduler hook `dokan_order_stats_backfill_retry` (`::BACKFILL_RETRY_HOOK`, handled by `lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php::retry_backfill()`), waiting twice as long before each retry and giving up after 8 attempts with a log entry. A retry stops early when every `wc_order_stats` row already has a Dokan row. While the import runs, an admin notice is shown (`lite:includes/Analytics/Reports/Orders/Stats/BackfillNotice.php`).

**Widgets are gated per capability.** The counters need `dokan_view_sales_overview`, the orders widget `dokan_view_order_report`, the products widget `dokan_view_product_status_report` and the chart `dokan_view_sales_report_chart` (`lite:includes/Dashboard/Templates/Dashboard.php::get_big_counter_widgets()`, `::get_orders_widgets()`, `::get_products_widgets()`, `::get_sales_report_chart_widget()`), and any widget can be switched off through `dokan_dashboard_widget_applicable`.

## Settings that change it

- `woocommerce_analytics_enabled` (WooCommerce → Settings → Advanced → Features → Analytics). `yes`: analytics app, and the admin dashboard widgets keep receiving new orders. `no`: legacy widgets, and the admin dashboard widgets stop updating. Never saved: legacy widgets for Vendors (Dokan's default), while WooCommerce Analytics runs and the admin dashboard widgets keep updating (WooCommerce's default).
- Filter `dokan_is_analytics_enabled` overrides the option in code for the Vendor dashboard switch.
- Filter `dokan_analytics_backfill_order_stats_on_activation`: `false` turns the activation backfill off.

## Worked example

Not a money rule. Example: the Store Admin turns WooCommerce Analytics off. Every Vendor's overview immediately shows the legacy counters (Net Sales, Earning, Pageview, Order) and the month-to-date sales chart instead of the analytics app; turning it back on restores the app. The two show different figures for the same Vendor because they read different tables with different status and refund rules.

## Edge cases

- **Turning Analytics on later does not backfill by itself.** The activation backfill runs only when Dokan is activated (and through its retries), and only when `dokan_order_stats` is completely empty. Turning WooCommerce Analytics on afterwards, or a table that already has some rows, needs WooCommerce's "Import historical data" (with "Skip previously imported" unticked) for past orders. Sites upgraded from before 3.13.0 also ran a one-off resync (`lite:includes/Upgrade/Upgrades/V_3_13_0.php::resync_wc_order_stats_to_sync_dokan_stats()`).
- **Toggle never saved.** Vendors see the legacy widgets although WooCommerce Analytics is running; saving the toggle as `yes` once switches them to the analytics app.
- Vendor Staff see whichever generation is active, limited by the capabilities above.

## Why

The legacy widgets predate WooCommerce Analytics. Keeping them behind the WooCommerce toggle lets marketplaces that disable WooCommerce Analytics (often for performance) keep a working dashboard.

## Consequences & risks

- Two different definitions of "sales" and "earning" exist on the same product, chosen by a WooCommerce setting the Store Admin may not associate with Dokan.
- Dokan's own code reads the same option with two defaults: `ReportUtil::is_analytics_enabled()` assumes `no`, `Installer::maybe_backfill_order_stats()` assumes `yes`.
- Support must ask which generation a Vendor sees before comparing numbers.

## Recommendations

- Show the active reporting mode (and its status and date rules) in Dokan's admin status page.
- Default `ReportUtil::is_analytics_enabled()` to WooCommerce's own default, so a never-saved toggle means the same thing to Dokan and WooCommerce.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
