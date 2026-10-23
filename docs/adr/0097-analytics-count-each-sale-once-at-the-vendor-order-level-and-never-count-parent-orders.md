# Analytics count each sale once, at the Vendor order level, and never count parent Orders

Status: Accepted (retroactive — documents existing code)

## Context

A multi-vendor checkout produces one customer-facing Order plus one Suborder per Vendor (Lite ADR 0011). WooCommerce imports every `shop_order` into its Analytics lookup table `wc_order_stats`, so the parent Order and each Suborder all get a row. If WooCommerce Analytics summed those rows as they are, a 100.00 checkout split 60/40 between two Vendors would be reported as 200.00 of revenue.

Dokan therefore keeps a companion table, `{prefix}dokan_order_stats`, that classifies every order and refund by type, and joins it into every WooCommerce Analytics query it supports. Teammates ask: "which orders does the revenue/orders/products report count?", "why does the Store Admin's WooCommerce Analytics show Suborders and not the Order the customer placed?" and "are refunds included?".

## Rule

**Every order and refund is classified.** `OrderType::get_type()` (`lite:includes/Analytics/Reports/OrderType.php:57-99`) assigns one of ten types, stored in `dokan_order_stats.order_type`:

| Value | Constant | Meaning |
|---|---|---|
| 0 | `DOKAN_PARENT_ORDER` | Order that has Suborders |
| 1 | `DOKAN_SINGLE_ORDER` | Single-vendor Order (it is itself the Vendor order) |
| 2 | `DOKAN_SUBORDER` | Suborder |
| 3 / 4 / 5 | `..._REFUND` | Refund of a parent Order / of a Suborder / of a single-vendor Order |
| 6 / 7 | `DOKAN_ADVERTISEMENT_*` | Advertisement order / its refund |
| 8 / 9 | `DOKAN_SUBSCRIPTION_*` | Vendor subscription order / its refund |

Types 6-9 are assigned only when an add-on answers the `dokan_get_order_type` filter (`lite:includes/Analytics/Reports/OrderType.php:113-137`); see [ADR-0095](./0095-advertisement-and-vendor-subscription-orders-are-recorded-in-analytics-without-a-vendor-and-with-only-their-fees-as-admin-earning.md).

**Analytics queries include only Vendor-order-level types.** Each report's `QueryFilter` joins `dokan_order_stats` on `order_id` (`BaseQueryFilter::add_join_subquery()`, `lite:includes/Analytics/Reports/BaseQueryFilter.php:27-35`) and adds `order_type IN (...)` (`add_where_subquery()`, `:44-54`). The list comes from `get_order_and_refund_types_to_include()` (`:90-98`), which returns `OrderType::get_vendor_order_types()` = types 1, 2, 4, 5, 6, 7, 8, 9 (`lite:includes/Analytics/Reports/OrderType.php:158-169`), because `should_filter_by_vendor_id()` always returns `true` (`lite:includes/Analytics/Reports/BaseQueryFilter.php:81-83`). The "admin" list (`get_admin_order_types()`, types 0, 1, 3, 5, `OrderType.php:144-151`) is defined but never selected by any shipped filter. The same type list applies whether a Vendor or a Store Admin is looking.

So in every Dokan-filtered WooCommerce Analytics report:

- **Parent Orders (type 0) and refunds created on a parent Order (type 3) are never counted.**
- **Single-vendor Orders and Suborders are counted once each**, together with their refunds (types 4 and 5) as separate negative rows (WooCommerce stores refund rows with negative totals).
- Advertisement and Vendor subscription orders and their refunds (types 6-9) are counted for the Store Admin; for a Vendor they drop out through the Vendor filter because their `vendor_id` is 0 (see [ADR-0094](./0094-a-vendor-sees-only-their-own-vendor-orders-in-analytics-and-only-report-managers-can-choose-a-vendor.md)).
- **Order counts and averages exclude refunds.** The orders-stats `orders_count`, `avg_order_value`, `avg_items_per_order`, `avg_admin_commission` and `avg_vendor_earning` columns count only types 1 and 2 (`get_vendor_order_types_excluding_refunds()`, `lite:includes/Analytics/Reports/OrderType.php:188-193`; `Orders\Stats\QueryFilter::modify_admin_report_columns()`, `lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:56-74`). The taxes-stats `orders_count` does the same (`lite:includes/Analytics/Reports/Taxes/Stats/QueryFilter.php:41-51`).
- **The `refunds` view** (`?refunds=...`) further narrows to Vendor refund types 4 and 5 (`BaseQueryFilter::add_where_subquery_for_refund()`, `lite:includes/Analytics/Reports/BaseQueryFilter.php:63-74`; `OrderType::get_vendor_refund_types()`, `OrderType.php:215-220`).

**Reports covered.** Orders and orders stats (revenue), products and products stats, variations, categories, coupons, taxes and customers all register these join/where filters through their `QueryFilter` classes under `lite:includes/Analytics/Reports/`. For the products, taxes, orders, coupons and stock stats data stores Dokan swaps in its own subclasses, whose SQL clauses are filterable (`DataStoreModifier::modify_wc_products_stats_datastore()`, `lite:includes/Analytics/Reports/DataStoreModifier.php:62-84`; `WcSqlQuery::get_sql_clause()`, `lite:includes/Analytics/Reports/WcSqlQuery.php:21-23`). Products, categories and variations are therefore counted from the Vendor order's line items, never from the parent's copy of them.

**Order rows link to the Vendor order.** In the orders list, `parent_id` is forced to 0 for every non-refund row so that WooCommerce links a Suborder row to the Suborder itself rather than treating it as a refund of its parent (`Orders\QueryFilter::modify_admin_report_columns()`, `lite:includes/Analytics/Reports/Orders/QueryFilter.php:44-61`).

**Legacy WooCommerce reports (WP Admin → WooCommerce → Reports)** follow the same principle the other way round: in WP Admin, Dokan appends `posts.post_parent = 0` to `woocommerce_reports_get_order_report_query` (`Order\Admin\Hooks::admin_order_reports_remove_parents()`, `lite:includes/Order/Admin/Hooks.php:81-85`), so those old reports count customer Orders and leave Suborders out.

## Settings that change it

No Dokan setting. The behaviour applies only while WooCommerce Analytics is enabled (`woocommerce_analytics_enabled`, see [ADR-0110](./0110-the-vendor-dashboard-shows-woocommerce-analytics-when-it-is-enabled-and-legacy-counters-and-charts-otherwise.md)). Add-ons can move orders into types 6-9 with `dokan_get_order_type`.

## Worked example

Settings: only a global Commission formula, `fixed` 10 % + 0 flat; no tax, no shipping.

A customer checks out with Vendor A's item at 60.00 and Vendor B's item at 40.00. Dokan creates Order #100 (total 100.00) and Suborders #101 (A, 60.00) and #102 (B, 40.00).

| order_id | `wc_order_stats.total_sales` | `dokan_order_stats.order_type` | counted? |
|---|---|---|---|
| 100 | 100.00 | 0 (parent) | no |
| 101 | 60.00 | 2 (Suborder) | yes |
| 102 | 40.00 | 2 (Suborder) | yes |

The Store Admin's WooCommerce Analytics revenue report shows gross sales 100.00 and 2 orders (one per Vendor order), not 200.00 and 3 orders. Vendor A's report shows 60.00 and 1 order.

## Edge cases

- **A customer sees one order, the Store Admin's Analytics shows two.** Order counts are Vendor-order counts, which is what the Commission and Earning columns relate to.
- **Refunds made directly on a parent Order** (type 3) never appear in any Dokan-filtered Analytics report. CONTEXT.md already puts such refunds outside the model.
- **Single-vendor Orders for products the marketplace owner sells** are type 1 like any other single-vendor Order and are counted.
- **The coupons report** keeps WooCommerce's own `amount` and `orders_count` columns: `Coupons\QueryFilter::modify_admin_report_columns()` (`lite:includes/Analytics/Reports/Coupons/QueryFilter.php:43-58`) would change them but is never hooked.
- **Orders with no `dokan_order_stats` row** (for example, imported before the table existed and never re-imported) drop out of every report because the join is an inner `JOIN`.

## Why

The `parent_id` comment in `Orders\QueryFilter` and the existence of separate admin and Vendor type lists show the intent: count Vendor orders so that Commission and Earning line up with order rows, and never count the same sale twice. Counting at the Vendor order level also matches Lite ADR 0004 (the Vendor order is authoritative, the parent is a mirror). Why Store Admins also get the Vendor list instead of the admin list is not recorded.

## Consequences & risks

- Store Admin totals agree with the sum of all Vendors' totals, plus marketplace-owned orders.
- WooCommerce Analytics order counts differ from the WooCommerce order list, which shows parent Orders and (optionally) Suborders.
- The unused `get_admin_order_types()` list invites a future change that would switch Store Admins to parent-level counting; doing so would change every admin total and drop the per-Vendor Commission columns' meaning.

## Recommendations

- Remove `should_filter_by_vendor_id()` and the unused admin type lists, or document them as reserved, so the Vendor-order-level rule is explicit.
- Either hook or delete `Coupons\QueryFilter::modify_admin_report_columns()`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
