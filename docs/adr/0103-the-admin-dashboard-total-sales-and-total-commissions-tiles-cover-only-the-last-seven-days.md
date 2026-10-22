# The admin dashboard "Total Sales" and "Total Commissions" tiles cover only the last seven days

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The Dokan admin dashboard (WP Admin → Dokan → Dashboard, React, since 4.1.0) has an "all time" row of tiles: Total Products, Total Vendors, Total Customers, Total Orders, Total Sales and Total Commissions, served by `GET dokan/v1/admin/dashboard/all-time-stats`. Teammates ask "is Total Sales lifetime revenue?", "why does Total Sales go down over a quiet week?" and "why don't Total Sales and Total Orders match?".

## Rule

`AdminDashboardStatsController::get_all_time_stats()` (`lite:includes/REST/AdminDashboardStatsController.php:486-580`) builds the money tiles from WooCommerce's orders-stats query (`Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query`, imported as `DataStore`) with only a `fields` argument (`:521-532`):

```php
[ 'fields' => [ 'total_sales', 'total_admin_commission' ] ]   // filter: dokan_rest_admin_dashboard_all_time_stats_sales_args
```

No `before` or `after` is passed. WooCommerce's reports data store fills them from its defaults (`DataStore::get_data()` merges `get_default_query_vars()`, `wc:src/Admin/API/Reports/DataStore.php:237-239`, `:263-272`): `before` = now and `after` = now minus one week (`TimeInterval::default_after()`, `wc:src/Admin/API/Reports/TimeInterval.php:62-64`). The query also passes through Dokan's analytics filters, so it:

- covers **the last seven days** up to now, by the WooCommerce date type (default `date_paid`);
- counts Vendor orders, single-vendor Orders and marketplace-owned orders, never parent Orders ([ADR-0097](./0097-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md));
- leaves out the excluded statuses ([ADR-0100](./0100-reports-leave-out-the-order-statuses-excluded-in-woocommerce-analytics-settings.md));
- reports **Total Sales** as WooCommerce `total_sales` (gross order totals, minus refund rows in the window) and **Total Commissions** as `SUM(admin_commission)` (formula Commission plus admin fees, net of refunds; see [ADR-0104](./0104-the-commission-figure-in-reports-includes-shipping-tax-and-fees-routed-to-the-admin-minus-the-admins-gateway-fee.md)).

The other tiles are lifetime: published products excluding subscription packs and the advertisement product (`:488-500`), approved Vendors (`:503-507`), users with the customer role (`:509-511`) and Total Orders ([ADR-0102](./0102-the-admin-dashboard-total-orders-tile-counts-parent-orders-and-suborders-alike.md)).

## Settings that change it

- No Dokan setting. `dokan_rest_admin_dashboard_all_time_stats_sales_args` can add `after` (for example a very early date) and `before` to make the tiles lifetime.
- `woocommerce_date_type`, `woocommerce_excluded_report_order_statuses`: as in the linked ADRs.
- `woocommerce_analytics_enabled`: without imported Analytics data both tiles are 0.

## Worked example

Settings: defaults; only a global Commission formula, `fixed` 10 % + 0 flat; no tax or shipping.

The marketplace has sold 50,000.00 of Vendor orders since launch. In the last seven days it sold three Vendor orders of 100.00, 60.00 and 40.00, all paid, and refunded 20.00 on an older order.

- Total Sales = 100.00 + 60.00 + 40.00 − 20.00 = **180.00** (not 50,000.00).
- Total Commissions = 10.00 + 6.00 + 4.00 = **20.00** (the refund reduced the older order's Commission in its own period, outside the window).

## Edge cases

- The window is a rolling 7 × 24 hours from the request time, not calendar days.
- The tile labels do not say "last 7 days", and Total Orders next to them is lifetime.

## Why

No recorded reason. The call omits the date arguments that the controller passes everywhere else, so this looks unintended.

## Consequences & risks

- Store Admins read "Total Sales" and "Total Commissions" as lifetime figures; they are weekly figures that can fall when a week is quiet.

## Recommendations

- Pass an explicit `after` (for example the WooCommerce install date) and `before` = now, or relabel the tiles.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
