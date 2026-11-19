# The Commission figure in reports includes shipping, tax and fees routed to the admin, minus the admin's gateway fee

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md defines Commission as the admin's share of a Vendor order computed by the Commission formula, and Earning as the Vendor's share. A Vendor order also carries shipping, tax, shipping tax, order fees and a payment gateway fee, each of which goes to the admin or the Vendor according to the Fee recipient settings (see the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution)). Teammates ask "is the Commission in the revenue report only the formula amount?", "why is the report's Commission bigger than the order's commission meta box?" and "what is the difference between admin commission, admin earning and admin subsidy?".

## Rule

`Orders\Stats\DataStore::update()` writes these columns for every Vendor order (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php::update()`), taken from `OrderCommission`:

| Column | Formula | Citation |
|---|---|---|
| `admin_commission` | formula Commission (may be negative) **+** admin fees | `lite:includes/Commission/OrderCommission.php::get_admin_commission()` (marked deprecated since 5.0.0, still the method the stats writer calls) |
| `admin_earning` | formula Commission floored at 0 **+** admin fees | `lite:includes/Commission/OrderCommission.php::get_admin_total_earning()`; `lite:includes/Commission/Model/Commission.php::get_admin_commission()` |
| `admin_subsidy` | the negative part of formula Commission, as a positive number | `lite:includes/Commission/Model/Commission.php::get_admin_subsidy()` |
| `vendor_earning` | formula Earning **+** Vendor fees | `lite:includes/Commission/OrderCommission.php::get_vendor_earning()` |
| `admin_*_fee`, `vendor_*_fee`, `*_tax`, `*_discount` | the individual parts | the matching getters in `lite:includes/Commission/OrderCommission.php`, e.g. `::get_admin_shipping_fee()`, `::get_vendor_gateway_fee()` |

where

- **admin fees** = admin shipping + admin product tax + admin shipping tax − gateway fee paid by the admin + admin order fees (`lite:includes/Commission/OrderCommission.php::get_total_admin_fees()`);
- **Vendor fees** = Vendor shipping + Vendor product tax + Vendor shipping tax − gateway fee paid by the Vendor + Vendor order fees (`::get_total_vendor_fees()`).

Every report that says "Commission" reads `admin_commission`: WooCommerce Analytics `total_admin_commission` and `avg_admin_commission` (`lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php::modify_admin_report_columns()`, `::add_select_subquery_for_total()`; the average divides by orders plus refund rows, see [ADR-0098](./0098-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md)), the admin dashboard sales chart and all-time tiles, and the top-performing Vendors list (`lite:includes/Models/DataStore/VendorOrderStatsStore.php::get_top_performing_vendors()`, `::get_sales_chart_data()`). "Earning" reads `vendor_earning`. The Vendor dashboard labels `total_admin_commission` "Marketplace Commission" and `total_vendor_earning` "Total Earning" (`lite:includes/Analytics/VendorDashboardManager.php::revenue_stats_schema()`).

So the reported Commission is the admin's whole take on the Vendor order, not only the formula amount, and the reported Earning is what the Vendor keeps after their own gateway fee.

## Settings that change it

Fee recipients, frozen on the order at first calculation (Lite ADR 0013):

- `dokan_selling[shipping_fee_recipient]`, default `seller`: `admin` adds shipping to `admin_commission`; `seller` adds it to `vendor_earning`.
- `dokan_selling[tax_fee_recipient]`, default `seller`: same choice for product tax.
- `dokan_selling[shipping_tax_fee_recipient]`, defaults to the product tax recipient: same choice for shipping tax.
- The gateway fee amount and payer come from order meta `dokan_gateway_fee` and `dokan_gateway_fee_paid_by`, written by the paying gateway. When the payer meta is empty the code assumes `seller`, except for one gateway id hard-coded in the method, for which it assumes `admin` (`lite:includes/Commission/OrderCommission.php::get_dokan_gateway_fee()`). An admin-paid fee can also come from order meta `dokan_admin_gateway_fee` (`::get_admin_gateway_fee()`).
- The Commission formula itself (product, Vendor, global) changes only the formula part.

## Worked example

Settings: global Commission formula 10 % Percentage; `shipping_fee_recipient = admin`; `tax_fee_recipient = admin`; shipping tax recipient = admin by default.

Vendor order: one item 100.00, shipping 10.00, product tax 5.00, no shipping tax; total 115.00. The gateway charged a fee of 3.20, recorded as paid by the seller.

- Formula: Commission 10.00, Earning 90.00.
- Admin fees = 10.00 + 5.00 + 0 − 0 + 0 = 15.00. Vendor fees = 0 + 0 + 0 − 3.20 + 0 = −3.20.
- `admin_commission` = 10.00 + 15.00 = **25.00**; `admin_earning` = 25.00; `admin_subsidy` = 0.
- `vendor_earning` = 90.00 − 3.20 = **86.80**.
- Check: 25.00 + 86.80 + 3.20 (gateway fee) = 115.00.

With both recipients left at `seller`: `admin_commission` = 10.00 and `vendor_earning` = 90.00 + 10.00 + 5.00 − 3.20 = 101.80.

## Edge cases

- **Admin subsidy.** When an admin-funded coupon is larger than the formula Commission (see [ADR-0022](./0022-an-admin-funded-discount-larger-than-the-commission-becomes-an-admin-subsidy-to-the-vendor.md)), `admin_commission` is negative by the subsidy, `admin_earning` floors the formula part at 0, and `admin_subsidy` shows the amount.
- **Refunds** reduce every column on the order row (see [ADR-0100](./0100-commission-and-earning-in-analytics-are-the-vendor-orders-figures-after-refunds-while-refunds-reduce-sales-as-separate-rows.md)).
- **Marketplace-owned orders** do not follow this table; see [ADR-0096](./0096-advertisement-and-vendor-subscription-orders-are-recorded-in-analytics-without-a-vendor-and-with-only-their-fees-as-admin-earning.md).

## Why

No recorded reason for folding fees into the reported Commission.

## Consequences & risks

- A report's "Commission" is larger than the formula Commission shown on the order whenever the admin receives shipping or tax, and smaller when the admin pays the gateway fee.
- `admin_commission` and `admin_earning` differ only when the formula Commission is negative; readers who mix them get different admin totals.

## Recommendations

- Rename the report label to "Admin total" or show the formula Commission and the admin fees as separate columns.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
