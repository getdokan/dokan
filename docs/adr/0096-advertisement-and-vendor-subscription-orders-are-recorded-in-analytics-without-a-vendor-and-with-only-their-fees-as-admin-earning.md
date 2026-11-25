# Advertisement and Vendor subscription orders are recorded in analytics without a Vendor and with only their fees as admin earning

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Some orders are purchases from the marketplace itself, for example a Vendor paying for a product advertisement or a subscription pack. [ADR-0027](./0027-marketplace-owned-order-types-give-the-whole-line-amount-to-the-admin-and-nothing-to-the-vendor.md) explains that for these order types the whole line amount is routed to the admin as `admin_net_earning`. Teammates ask how such orders appear in reports: "whose revenue is an advertisement purchase?", "does subscription revenue show up?" and "why is admin earning zero for a 50.00 pack?".

## Rule

**Classification.** An add-on marks an order as advertisement (type 6, refund 7) or Vendor subscription (type 8, refund 9) through `dokan_get_order_type` (`lite:includes/Analytics/Reports/OrderType.php::get_special_order_type()`). These four types are the admin-earning types (`::get_admin_earning_order_types()`, filter `dokan_admin_earning_order_types`).

**No Vendor.** `get_vendor_id_from_order()` gives them `vendor_id = 0` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php::get_vendor_id_from_order()`), so they are included in the Store Admin's unfiltered WooCommerce Analytics (they are in the Vendor-order type list, `lite:includes/Analytics/Reports/OrderType.php::get_vendor_order_types()`) and never in a Vendor's.

**What the stats row stores.** `OrderCommission::calculate()` puts the line amounts into `admin_net_earning` and leaves `admin_net_commission`, `vendor_net_earning` and `vendor_discount` at 0 for these types (`lite:includes/Commission/OrderCommission.php::calculate()`). The stats writer, however, stores:

- `admin_commission` = `admin_net_commission` (0) + admin fees (`lite:includes/Commission/OrderCommission.php::get_admin_commission()`, marked deprecated since 5.0.0 but still the method the stats writer calls);
- `admin_earning` = max(`admin_net_commission`, 0) (0) + admin fees (`lite:includes/Commission/OrderCommission.php::get_admin_total_earning()`; `lite:includes/Commission/Model/Commission.php::get_admin_commission()`);
- `vendor_earning` = 0 + Vendor fees (`lite:includes/Commission/OrderCommission.php::get_vendor_earning()`).

`admin_net_earning` is not written to `dokan_order_stats` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php::update()`). In the stats table such an order therefore carries only its fee amounts (shipping, tax and shipping tax routed to the admin, plus WooCommerce fee lines routed to the admin, minus a gateway fee the admin pays; `lite:includes/Commission/OrderCommission.php::get_total_admin_fees()`), and its line amount appears only in WooCommerce's own `total_sales` and `net_total`.

**Report summary that reads these rows.** `VendorOrderStatsStore::get_report_summary()` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php::get_report_summary()`) is the summary an add-on's admin earnings report reads. It returns:

- `subscription_revenue` = `SUM(admin_earning)` of types 8 and 9;
- `other_revenue` = `SUM(admin_earning)` of types 6 and 7;
- `commission` = `SUM(admin_commission)` of all rows;
- `net_earning` = `SUM(admin_commission)` of all rows **plus** `SUM(admin_earning)` of types 6–9;
- `total_earnings` = `SUM(admin_earning)` of all rows.

The subscription and advertisement figures therefore show fee amounts, not pack or advertisement prices. Because rows of types 6–9 carry the same admin fees in both `admin_commission` and `admin_earning`, `net_earning` counts those fees twice. The summary adds no order-type, Vendor or date condition (only the optional status exclusion from [ADR-0101](./0101-reports-leave-out-the-order-statuses-excluded-in-woocommerce-analytics-settings.md)), so it also includes parent Order rows; see that ADR.

## Settings that change it

- Fee recipients (`dokan_selling[shipping_fee_recipient]` and `dokan_selling[tax_fee_recipient]`, default `seller`; `dokan_selling[shipping_tax_fee_recipient]`, default = the tax fee recipient) decide which fees of these orders count as admin fees (`Fees::get_shipping_fee_recipient()`, `get_tax_fee_recipient()`, `get_shipping_tax_fee_recipient()` in `lite:includes/Fees.php`). The recipient is saved on the order the first time it is read, and add-ons can change it per order through `dokan_shipping_fee_recipient`, `dokan_tax_fee_recipient` and `dokan_shipping_tax_fee_recipient`. WooCommerce fee lines go to the admin unless the order was created by the Vendor (`_wc_order_attribution_source_type = vendor`), filterable through `dokan_order_commission_order_fee_recipient` (`lite:includes/Commission/OrderCommission.php::get_order_fee_recipient()`).
- `dokan_admin_earning_order_types` can add or remove types from the admin-earning set.
- Without an add-on answering `dokan_get_order_type`, no order has these types and the rule never applies.

## Worked example

Settings: no tax; no shipping; no fee lines; fee recipients at their defaults; no gateway fee.

A Vendor buys a subscription pack for 50.00; an add-on classifies the order as type 8.

- `OrderCommission`: `admin_net_earning` = 50.00, `admin_net_commission` = 0, `vendor_net_earning` = 0.
- `wc_order_stats`: total_sales 50.00, net_total 50.00.
- `dokan_order_stats`: vendor_id 0, order_type 8, `admin_commission` 0.00, `admin_earning` 0.00, `vendor_earning` 0.00.
- Store Admin's WooCommerce Analytics revenue: +50.00 gross sales, +0.00 Commission.
- `get_report_summary()`: `subscription_revenue` = 0.00, `net_earning` = 0.00.

With a 5.00 tax line and `tax_fee_recipient` = `admin`, the same order stores `admin_commission` = `admin_earning` = 5.00. `get_report_summary()` then returns `subscription_revenue` = 5.00, `commission` = 5.00 and `net_earning` = 5.00 + 5.00 = **10.00**.

## Edge cases

- **Refunds of these orders** (types 7 and 9) carry zeros like every refund row; the original row is rewritten with refund-adjusted fees on re-import.
- **The Vendor who paid** never sees the purchase in their own analytics, because the Vendor filter keys on `vendor_id`, which is 0.

## Why

No recorded reason.

## Consequences & risks

- WooCommerce's gross sales for the Store Admin include these orders, so "sales" and "Commission" diverge by the pack and advertisement prices.
- The summary's `net_earning` overstates admin fees on marketplace-owned orders by the same amount again.

## Recommendations

- Compute `net_earning` in `get_report_summary()` without adding the type 6–9 `admin_earning` on top of their `admin_commission`.
- Store `admin_net_earning` plus admin fees in `admin_earning` for admin-earning order types, then regenerate `dokan_order_stats` through WooCommerce's "Import historical data".
- Add a test that a marketplace-owned order's `admin_earning` equals its line total plus admin fees.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
