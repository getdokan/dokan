# The legacy dashboard "Net Sales" counter is the order total after refunds of processing, on-hold and completed Vendor orders

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

When WooCommerce Analytics is off, the Vendor dashboard shows four big counters: Net Sales, Earning, Pageview and Order (see [ADR-0110](./0110-the-vendor-dashboard-shows-woocommerce-analytics-when-it-is-enabled-and-legacy-counters-and-charts-otherwise.md)). The same "sales" figure is returned by the Vendor dashboard REST statistics. Teammates ask "is Net Sales net of tax and shipping?", "does it include pending or completed-only orders?" and "does a refund reduce it?".

## Rule

**Source.** The counter prints `Dashboard::get_earning()` under the title "Net Sales" (`lite:templates/dashboard/big-counter-widget.php:17-18`; `lite:includes/Dashboard/Templates/Dashboard.php:79`, `:314-316`). That calls `dokan_author_total_sales()` → `Vendor::get_total_sales()` (`lite:includes/Order/functions.php:879-887`; `lite:includes/Vendor/Vendor.php:788-804`), which returns

`SUM(dokan_orders.order_total)` for the Vendor where `order_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')`,

filtered through `dokan_seller_total_sales`. The same value is the `sales` field of the Vendor dashboard REST statistics (`VendorDashboardController::get_dashboard_statistics()`, `lite:includes/REST/VendorDashboardController.php:146-149`).

**What `order_total` holds.** One `dokan_orders` row exists per Vendor order. Whenever the order is saved, `VendorBalanceUpdateHandler::update_dokan_order_table()` sets `order_total` to the WooCommerce order total minus the total refunded (`lite:includes/Order/VendorBalanceUpdateHandler.php:31`, `:147`, `:183`, `:192-197`). The order total includes tax, shipping and fees.

So "Net Sales" means: all-time gross order totals (including tax and shipping) less refunds, over the Vendor's processing, on-hold and completed Vendor orders. It is not "net" in WooCommerce's sense (which removes tax and shipping), and it is not limited to a date range.

## Settings that change it

None. The status list is fixed in the query; the withdraw order status setting does not affect it. The value can be changed in code with `dokan_seller_total_sales`.

## Worked example

Settings: none relevant. Vendor A has, all time:

| Vendor order | Status | Order total | Refunded | `order_total` stored |
|---|---|---|---|---|
| #401 | completed | 115.00 (100 + 10 shipping + 5 tax) | 0 | 115.00 |
| #402 | processing | 60.00 | 20.00 | 40.00 |
| #403 | pending payment | 30.00 | 0 | 30.00 |
| #404 | refunded | 50.00 | 50.00 | 0.00 |

Net Sales = 115.00 + 40.00 = **155.00** (#403 is pending; #404 is refunded and, at 0.00, would add nothing anyway).

## Edge cases

- **Cancelled and failed orders** are excluded by the status list; their rows stay in `dokan_orders`.
- **Trashed orders** drop out: trashing writes `wc-trash` into `dokan_orders.order_status`, which is not in the list (see [ADR-0044](./0044-trashing-an-order-parks-its-vendor-earning-and-deleting-it-in-wp-admin-erases-its-ledger-rows.md)).
- **Caching.** The value is cached in the `seller_order_data_{vendor_id}` group, which Dokan invalidates when the Vendor's orders change (`lite:includes/Order/OrderCache.php:45`).

## Why

No recorded reason. The method is still named `get_total_sales()` and the widget variable is still named `earning`; only the label says "Net Sales".

## Consequences & risks

- A Vendor comparing Net Sales with the Earning counter next to it sees two figures built from different tables, statuses and amounts (tax and shipping included here, Commission excluded there).
- The figure differs from WooCommerce Analytics net sales for the same Vendor.

## Recommendations

- Relabel the counter "Sales (after refunds)" or compute a true net figure.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
