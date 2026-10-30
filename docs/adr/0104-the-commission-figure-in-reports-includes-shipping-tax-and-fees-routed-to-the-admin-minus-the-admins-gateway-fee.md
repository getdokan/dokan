# The Commission figure in reports includes shipping, tax and fees routed to the admin, minus the admin's gateway fee

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md defines Commission as the admin's share of a Vendor order computed by the Commission formula, and Earning as the Vendor's share. A Vendor order also carries shipping, tax, shipping tax, order fees and a payment gateway fee, each of which goes to the admin or the Vendor according to the Fee recipient settings (see the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution)). Teammates ask "is the Commission in the revenue report only the formula amount?", "why is the report's Commission bigger than the order's commission meta box?" and "what is the difference between admin commission, admin earning and admin subsidy?".

## Rule

`Orders\Stats\DataStore::update()` writes these columns for every Vendor order (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:141-155`), taken from `OrderCommission`:

| Column | Formula | Citation |
|---|---|---|
| `admin_commission` | formula Commission (may be negative) **+** admin fees | `OrderCommission::get_admin_commission()`, `lite:includes/Commission/OrderCommission.php:531-533` |
| `admin_earning` | formula Commission floored at 0 **+** admin fees | `get_admin_total_earning()`, `:542-544`; `Commission::get_admin_commission()`, `lite:includes/Commission/Model/Commission.php:165-167` |
| `admin_subsidy` | the negative part of formula Commission, as a positive number | `Commission::get_admin_subsidy()`, `lite:includes/Commission/Model/Commission.php:169-171` |
| `vendor_earning` | formula Earning **+** Vendor fees | `OrderCommission::get_vendor_earning()`, `lite:includes/Commission/OrderCommission.php:340-342` |
| `admin_*_fee`, `vendor_*_fee`, `*_tax`, `*_discount` | the individual parts | `:227-336`, `:424-433` |

where

- **admin fees** = admin shipping + admin product tax + admin shipping tax − gateway fee paid by the admin + admin order fees (`get_total_admin_fees()`, `lite:includes/Commission/OrderCommission.php:377-379`);
- **Vendor fees** = Vendor shipping + Vendor product tax + Vendor shipping tax − gateway fee paid by the Vendor + Vendor order fees (`get_total_vendor_fees()`, `:388-390`).

Every report that says "Commission" reads `admin_commission`: WooCommerce Analytics `total_admin_commission` and `avg_admin_commission` (`lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:70`, `:96`, `:101`), the admin dashboard sales chart and all-time tiles, and the top-performing Vendors list (`VendorOrderStatsStore`, `lite:includes/Models/DataStore/VendorOrderStatsStore.php:128`, `:164`). "Earning" reads `vendor_earning`. The Vendor dashboard labels `total_admin_commission` "Marketplace Commission" and `total_vendor_earning` "Total Earning" (`VendorDashboardManager::revenue_stats_schema()`, `lite:includes/Analytics/VendorDashboardManager.php:80-126`).

So the reported Commission is the admin's whole take on the Vendor order, not only the formula amount, and the reported Earning is what the Vendor keeps after their own gateway fee.

## Settings that change it

Fee recipients, frozen on the order at first calculation (Lite ADR 0012):

- `dokan_selling[shipping_fee_recipient]`, default `seller`: `admin` adds shipping to `admin_commission`; `seller` adds it to `vendor_earning`.
- `dokan_selling[tax_fee_recipient]`, default `seller`: same choice for product tax.
- `dokan_selling[shipping_tax_fee_recipient]`, defaults to the product tax recipient: same choice for shipping tax.
- The gateway fee amount and payer come from order meta `dokan_gateway_fee` and `dokan_gateway_fee_paid_by`, written by the paying gateway. When the payer meta is empty the code assumes `seller`, except for one gateway id hard-coded in the method, for which it assumes `admin` (`OrderCommission::get_dokan_gateway_fee()`, `lite:includes/Commission/OrderCommission.php:400-415`). An admin-paid fee can also come from order meta `dokan_admin_gateway_fee` (`get_admin_gateway_fee()`, `:272-286`).
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

- **Admin subsidy.** When an admin-funded coupon is larger than the formula Commission (see [ADR-0021](./0021-an-admin-funded-discount-larger-than-the-commission-becomes-an-admin-subsidy-to-the-vendor.md)), `admin_commission` is negative by the subsidy, `admin_earning` floors the formula part at 0, and `admin_subsidy` shows the amount.
- **Refunds** reduce every column on the order row (see [ADR-0099](./0099-commission-and-earning-in-analytics-are-the-vendor-orders-figures-after-refunds-while-refunds-reduce-sales-as-separate-rows.md)).
- **Marketplace-owned orders** do not follow this table; see [ADR-0095](./0095-advertisement-and-vendor-subscription-orders-are-recorded-in-analytics-without-a-vendor-and-with-only-their-fees-as-admin-earning.md).

## Why

`get_admin_commission()` is marked deprecated in favour of the net-earning model, but it remains what the stats writer stores. No recorded reason for folding fees into the reported Commission.

## Consequences & risks

- A report's "Commission" is larger than the formula Commission shown on the order whenever the admin receives shipping or tax, and smaller when the admin pays the gateway fee.
- `admin_commission` and `admin_earning` differ only when the formula Commission is negative; readers who mix them get different admin totals.

## Recommendations

- Rename the report label to "Admin total" or show the formula Commission and the admin fees as separate columns.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
