# Commission and Earning in analytics are the Vendor order's figures after refunds, while refunds reduce sales as separate rows

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce Analytics models a refund as its own row in `wc_order_stats` with negative totals, so net sales over a period are "orders minus refunds". Dokan adds money columns of its own (Commission, Earning, fees, discounts) in `dokan_order_stats`, one row per order or refund. Teammates ask "does the Earning in the revenue report already take refunds into account?", "why is the Earning on a refund row zero?" and "which month loses the Commission when an order is refunded later?".

## Rule

**The order row holds the refund-adjusted split.** When WooCommerce imports an order into Analytics it fires `woocommerce_analytics_update_order_stats`; Dokan's `ScheduleListener::sync_dokan_order()` (`lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php:29`, `:40-42`) calls `Orders\Stats\DataStore::update()` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:99-196`). For a `shop_order` it runs `OrderCommission` (`:112-117`), whose refund adjustment is on by default (`AbstractCommissionCalculator::$should_adjust_refund = true`, `lite:includes/Commission/AbstractCommissionCalculator.php:15`). Each line item's Commission and Earning are reduced pro rata by the amount refunded on that item (`OrderLineItemCommission::adjust_refunds()`, `lite:includes/Commission/OrderLineItemCommission.php:195-226`; split formula `Calculator::calculate_for_refund()`, `lite:includes/Commission/Calculator.php:191-212`), and refunded shipping, tax, shipping tax and fees are taken off the matching fee columns (`OrderCommission::get_shipping_refunded()` and siblings, `lite:includes/Commission/OrderCommission.php:562-586`). The stored `vendor_earning`, `admin_commission` and fee columns are therefore what remains after every refund recorded so far.

**The refund row carries no Dokan money.** For a `shop_order_refund` no calculator runs, so every Dokan money column is 0 (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:119-121`, `:141-155`). The refund row still carries WooCommerce's negative `total_sales` and `net_total`, its `order_type` (4 or 5) and its Vendor (`:244-248`).

**The order row is rewritten when the order is re-imported.** When scheduled import is off, WooCommerce schedules an import when an order is saved and when a refund is created (`OrdersScheduler::init()`, `wc:src/Internal/Admin/Schedulers/OrdersScheduler.php:126-133`); when it is on, a recurring batch processor picks the changed orders up instead; `import()` re-syncs the order and then each of its refunds (`:410`, `:416-421`). Each sync replaces Dokan's row (`$wpdb->replace`, `lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:183`).

So, in reports:

- **Sales and net revenue** are WooCommerce figures: the order row's positive total plus the refund row's negative total, each in its own period.
- **Commission and Earning totals** (`total_admin_commission`, `total_vendor_earning`, `avg_*`, added by `Orders\Stats\QueryFilter::add_select_subquery_for_total()`, `lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:85-105`) come only from order rows, already net of refunds, in the order's period.

This is the Analytics view of the refund rule in [ADR-0046](./0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md); it does not read the Vendor Balance ledger.

## Settings that change it

- `woocommerce_analytics_enabled`: without WooCommerce Analytics nothing is imported and `dokan_order_stats` is not maintained.
- `woocommerce_analytics_scheduled_import` (WooCommerce → Settings → Analytics → Updates): decides whether imports run immediately or in scheduled batches, which changes how quickly a refund appears; the result is the same.
- Commission formula and Fee recipients: frozen on the order (Lite ADR 0012), so a re-import after a settings change reproduces the original split.

## Worked example

Settings: only a global Commission formula, `fixed` 10 % + 0 flat; no tax, no shipping; date type `date_created`.

1. 10 March: Suborder #101 for Vendor A, one item at 60.00. Rows: `wc_order_stats` total 60.00; `dokan_order_stats` Commission 6.00, Earning 54.00.
2. 4 April: Vendor A's order gets a 30.00 refund on that item (refund #103). WooCommerce adds a refund row #103 with total −30.00 dated 4 April and re-imports #101.
   - Refund split: Commission refunded = round(6.00 / 60.00 × 30.00) = 3.00; Earning refunded = 30.00 − 3.00 = 27.00.
   - Row #101 now holds Commission 3.00 and Earning 27.00. Row #103 holds Commission 0 and Earning 0.
3. Vendor A's revenue report:

| Period | Gross sales | Total Earning | Total Commission |
|---|---|---|---|
| March | 60.00 | 27.00 | 3.00 |
| April | −30.00 | 0.00 | 0.00 |
| March + April | 30.00 | 27.00 | 3.00 |

## Edge cases

- **Historic periods change.** After the refund, March's Earning drops from 54.00 to 27.00 even though March's sales stay 60.00.
- **Earning can look larger than sales in a period.** In April above, sales are negative and Earning is 0.
- **A refund that WooCommerce has not yet imported** leaves the order row at its pre-refund figures until the next import.
- **Refunds on parent Orders** are excluded from Dokan-filtered reports altogether (see [ADR-0097](./0097-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md)).

## Why

Computing the split on the order row reuses `OrderCommission`, the same calculator the rest of Dokan uses, so Analytics Earning matches the Vendor order's commission meta box. The refund row being zero avoids subtracting the refund twice. No further reasoning is recorded.

## Consequences & risks

- Over any range that contains both the sale and its refunds, totals are correct. Over a range that contains only one of them, sales and Earning do not reconcile.
- Re-running WooCommerce's "Import historical data" rewrites every Dokan row with the current refund state.

## Recommendations

- Store the refund's own Commission and Earning reversal on the refund row (as negatives) instead of rewriting the order row, so Commission and Earning fall into the refund's period like sales do.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
