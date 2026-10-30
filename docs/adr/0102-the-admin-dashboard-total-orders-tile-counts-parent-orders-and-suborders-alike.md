# The admin dashboard "Total Orders" tile counts parent Orders and Suborders alike

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The admin dashboard's all-time row includes a "Total Orders" tile. Every other order count in Dokan's analytics counts Vendor orders only ([ADR-0097](./0097-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md)). Teammates ask "is Total Orders the number of checkouts, or the number of Vendor orders?".

## Rule

`AdminDashboardStatsController::get_all_time_stats()` counts orders with (`lite:includes/REST/AdminDashboardStatsController.php:514-519`):

```php
dokan()->order->all( [ 'status' => [ 'wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded' ], 'return' => 'count' ] )
```

`Order\Manager::all()` runs `wc_get_orders()` with `type = shop_order` and no Vendor filter when no `seller_id` is given (`lite:includes/Order/Manager.php:31-66`, `:104-115`, `:150-153`), and for `return = count` it asks WooCommerce for a paginated result and returns its `total` (`:258-262`, `:61-63`). WooCommerce returns every `shop_order` in those statuses: parent Orders, Suborders and single-vendor Orders. Refund objects are not orders and are not counted.

So the tile is: lifetime count of parent Orders + Suborders + single-vendor Orders (+ marketplace-owned orders) in completed, processing, on-hold or refunded status. A multi-vendor checkout counts as 1 + (number of Vendors).

## Settings that change it

None. The status list is fixed in code and is not the WooCommerce Analytics excluded-status setting. The query can be changed through `dokan_get_vendor_orders_args` and the count through `dokan_get_vendor_orders_count` (`lite:includes/Order/Manager.php:32`, `:62`); the dashboard response can be changed through `dokan_rest_admin_dashboard_all_time_stats_data` (`lite:includes/REST/AdminDashboardStatsController.php:543-544`).

## Worked example

Settings: none relevant.

Since launch the marketplace has had: 50 single-vendor Orders, and 10 multi-vendor checkouts each split into 2 Suborders; all completed. Also 5 cancelled single-vendor Orders.

- Total Orders = 50 + 10 parents + 20 Suborders = **80**.
- Vendor orders actually fulfilled = 50 + 20 = 70; customer checkouts = 60.

## Edge cases

- Cancelled, failed, pending and draft orders are never counted.
- Refunded orders are counted (they were sales once).

## Why

No recorded reason.

## Consequences & risks

- Total Orders matches neither the number of customer checkouts nor the number of Vendor orders, and cannot be compared with WooCommerce Analytics order counts.

## Recommendations

- Count only Vendor orders (exclude orders that have Suborders), matching the analytics rule, or count only customer Orders (exclude Suborders), and label the tile accordingly.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
