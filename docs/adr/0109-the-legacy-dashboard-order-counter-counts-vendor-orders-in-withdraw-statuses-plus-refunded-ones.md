# The legacy dashboard "Order" counter counts Vendor orders in withdraw statuses plus refunded ones

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The legacy Vendor dashboard (WooCommerce Analytics off) shows an "Order" counter and, below it, an orders widget broken down by status. Teammates ask "why does the Order counter show fewer orders than the orders list?" and "does it include processing orders?".

## Rule

**Per-status counts.** `Order\Manager::count_orders()` (`lite:includes/Order/Manager.php:287-355`) counts the Vendor's `dokan_orders` rows grouped by `order_status`, joined to the order table and excluding orders whose post or HPOS status is `trash` (`:309-337`). It starts from the statuses pending, completed, on-hold, processing, refunded, cancelled, failed and checkout-draft, filterable through `dokan_order_status_count` (`:295-306`); rows in any other status are ignored. `total` is the sum of the listed statuses. Results are cached per Vendor.

**The counter.** The big-counter template sums the per-status counts only for the statuses returned by `dokan_withdraw_get_active_order_status()` (`lite:templates/dashboard/big-counter-widget.php:29-41`): the "Order Status for Withdraw" statuses plus `wc-refunded` (`lite:includes/Withdraw/functions.php:355-366`).

So the counter answers "how many Vendor orders currently count toward my earnings", not "how many orders have I received". The orders widget below it (`Dashboard::get_orders_widgets()`, `lite:includes/Dashboard/Templates/Dashboard.php:92`) shows the full per-status breakdown and its total.

## Settings that change it

- `dokan_withdraw[withdraw_order_status]` ("Order Status for Withdraw"), default `wc-completed`:
  - completed only (default): counter = completed + refunded Vendor orders.
  - completed and processing: counter = completed + processing + refunded.
  - completed, processing and on-hold: counter = those three + refunded.
- Filters `dokan_withdraw_active_status` (which statuses the counter sums) and `dokan_order_status_count` (which statuses are counted at all).

## Worked example

Settings: Order Status for Withdraw = completed only.

Vendor A has 10 completed, 4 processing, 2 on-hold, 1 refunded, 3 cancelled and 1 pending Vendor orders.

- Order counter = 10 + 1 = **11**.
- Orders widget total = 21.
- With processing also selected: counter = 15.

## Edge cases

- Refunded Vendor orders always count, even when "refunded" is not something the Store Admin selected.
- Custom order statuses are counted only if an extension adds them through `dokan_order_status_count` and, for the counter, `dokan_withdraw_active_status`.

## Why

No recorded reason. Reusing the withdraw status list keeps the counter consistent with the Earning counter beside it.

## Consequences & risks

- Vendors see a different "orders" number on the counter, the orders widget and WooCommerce Analytics (which uses the excluded-status setting instead).

## Recommendations

- Label the counter "Orders counting toward earnings", or show the widget total instead.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
