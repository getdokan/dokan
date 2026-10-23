# Advertisement and Vendor subscription orders are recorded in analytics without a Vendor and with only their fees as admin earning

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Some orders are purchases from the marketplace itself, for example a Vendor paying for a product advertisement or a subscription pack. [ADR-0026](./0026-marketplace-owned-order-types-give-the-whole-line-amount-to-the-admin-and-nothing-to-the-vendor.md) explains that for these order types the whole line amount is routed to the admin as `admin_net_earning`. Teammates ask how such orders appear in reports: "whose revenue is an advertisement purchase?", "does subscription revenue show up?" and "why is admin earning zero for a 50.00 pack?".

## Rule

**Classification.** An add-on marks an order as advertisement (type 6, refund 7) or Vendor subscription (type 8, refund 9) through `dokan_get_order_type` (`lite:includes/Analytics/Reports/OrderType.php:113-137`). These four types are the admin-earning types (`get_admin_earning_order_types()`, `:263-273`, filter `dokan_admin_earning_order_types`).

**No Vendor.** `get_vendor_id_from_order()` gives them `vendor_id = 0` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:236-255`), so they are included in the Store Admin's unfiltered WooCommerce Analytics (they are in the Vendor-order type list, `lite:includes/Analytics/Reports/OrderType.php:158-169`) and never in a Vendor's.

**What the stats row stores.** `OrderCommission::calculate()` puts the line amounts into `admin_net_earning` and leaves `admin_net_commission`, `vendor_net_earning` and `vendor_discount` at 0 for these types (`lite:includes/Commission/OrderCommission.php:78-96`, `:133-137`). The stats writer, however, stores:

- `admin_commission` = `admin_net_commission` (0) + admin fees (`OrderCommission::get_admin_commission()`, `lite:includes/Commission/OrderCommission.php:531-533`);
- `admin_earning` = max(`admin_net_commission`, 0) (0) + admin fees (`get_admin_total_earning()`, `:542-544`; `lite:includes/Commission/Model/Commission.php:165-167`);
- `vendor_earning` = 0 + Vendor fees (`:340-342`).

`admin_net_earning` is not written to `dokan_order_stats` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:136-156`). In the stats table such an order therefore carries only its fee amounts (shipping, tax and shipping tax routed to the admin, plus WooCommerce fee lines routed to the admin, minus a gateway fee the admin pays; `get_total_admin_fees()`, `lite:includes/Commission/OrderCommission.php:377-379`), and its line amount appears only in WooCommerce's own `total_sales` and `net_total`.

**Report summaries that read these rows.** `VendorOrderStatsStore::get_report_summary()` reports `subscription_revenue` as `SUM(admin_earning)` of types 8 and 9, `other_revenue` as `SUM(admin_earning)` of types 6 and 7, and adds both to `net_earning` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php:363-367`). They therefore show fee amounts, not pack or advertisement prices.

## Settings that change it

- Fee recipients (`dokan_selling[shipping_fee_recipient]` and `dokan_selling[tax_fee_recipient]`, default `seller`; `dokan_selling[shipping_tax_fee_recipient]`, default = the tax fee recipient) decide which fees of these orders count as admin fees (`Fees::get_shipping_fee_recipient()`, `get_tax_fee_recipient()`, `get_shipping_tax_fee_recipient()`, `lite:includes/Fees.php:155-235`). The recipient is saved on the order the first time it is read, and add-ons can change it per order through `dokan_shipping_fee_recipient`, `dokan_tax_fee_recipient` and `dokan_shipping_tax_fee_recipient`. WooCommerce fee lines go to the admin unless the order was created by the Vendor (`_wc_order_attribution_source_type = vendor`), filterable through `dokan_order_commission_order_fee_recipient` (`lite:includes/Commission/OrderCommission.php:626-634`).
- `dokan_admin_earning_order_types` can add or remove types from the admin-earning set.
- Without an add-on answering `dokan_get_order_type`, no order has these types and the rule never applies.

## Worked example

Settings: no tax; no shipping; no fee lines; fee recipients at their defaults; no gateway fee.

A Vendor buys a subscription pack for 50.00; an add-on classifies the order as type 8.

- `OrderCommission`: `admin_net_earning` = 50.00, `admin_net_commission` = 0, `vendor_net_earning` = 0.
- `wc_order_stats`: total_sales 50.00, net_total 50.00.
- `dokan_order_stats`: vendor_id 0, order_type 8, `admin_commission` 0.00, `admin_earning` 0.00, `vendor_earning` 0.00.
- Store Admin's WooCommerce Analytics revenue: +50.00 gross sales, +0.00 Commission.
- `get_report_summary()`: `subscription_revenue` = 0.00.

With a 5.00 tax line and `tax_fee_recipient` = `admin`, the same order stores `admin_commission` = `admin_earning` = 5.00 and `subscription_revenue` = 5.00.

## Edge cases

- **Refunds of these orders** (types 7 and 9) carry zeros like every refund row; the original row is rewritten with refund-adjusted fees on re-import.
- **The Vendor who paid** never sees the purchase in their own analytics, because the Vendor filter keys on `vendor_id`, which is 0.

## Why

No recorded reason. The admin-earning routing (`admin_net_earning`) was added in 5.0.0 alongside the `admin_earning` column, but the stats writer kept using `get_admin_total_earning()`, which is built on the floored formula Commission rather than on `admin_net_earning`.

## Consequences & risks

- Any report that sums `admin_earning` or `admin_commission` to show marketplace revenue from advertisements or subscriptions understates it by the full line amount.
- WooCommerce's gross sales for the Store Admin include these orders, so "sales" and "Commission" diverge by the pack and advertisement prices.

## Recommendations

- Store `admin_net_earning` plus admin fees in `admin_earning` for admin-earning order types, then regenerate `dokan_order_stats` through WooCommerce's "Import historical data".
- Add a test that a marketplace-owned order's `admin_earning` equals its line total plus admin fees.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
