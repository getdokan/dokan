# The commission on a Vendor order is the sum of its line-item commissions

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Commission formulas are defined per product, Vendor or category, but Vendors and admins see one Commission figure per Vendor order. Teammates ask whether Commission is computed on the order total, whether different products in one order can carry different rates, and how shipping, tax and fees relate to the Commission figure. This ADR describes the order-level aggregation. Who receives shipping, tax, gateway and order fees is covered by the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution); refund netting by the [refund ADRs](decisions-index.md#refunds).

## Rule

1. **Commission is computed only on Vendor orders.** `Commission::get_earning_by_order()` returns nothing for a parent Order that has Suborders (`lite:includes/Commission.php:213-215`), in line with Lite ADR 0004 (the Vendor order is authoritative).
2. **Each product line item is calculated on its own.** `OrderCommission::calculate()` loops over `$order->get_items()` (product line items) and runs `OrderLineItemCommission::calculate()` for each (`lite:includes/Commission/OrderCommission.php:79-97`). Each line resolves its own formula (product, Vendor, category or global, or the frozen formula of Lite ADR 0012), applies its own coupons, and is rounded on its own.
3. **The order figures are plain sums.** `admin_net_commission`, `admin_discount`, `vendor_net_earning` and `vendor_discount` are the sums of the line results (`lite:includes/Commission/OrderCommission.php:91-94`). There is no order-level percentage, no order-level flat fee and no second rounding.
4. **Extensions may adjust the sums.** After the loop the summed values pass through `dokan_order_vendor_net_earning` and `dokan_order_admin_net_commission` (`lite:includes/Commission/OrderCommission.php:120`, `:131`). These filters run only in `calculate()`; the per-line results kept for refunds are not changed by them.
5. **A line that fails is skipped.** An exception while calculating one line is logged and that line contributes nothing (`lite:includes/Commission/OrderCommission.php:98-108`).
6. **Fees are added outside the Commission.** Shipping, tax, shipping tax, order fee lines and gateway fees are not part of any line's base. They are added on top as admin fees or Vendor fees (`get_total_admin_fees()`, `get_total_vendor_fees()`, `lite:includes/Commission/OrderCommission.php:377-390`). The Vendor order's Earning is `vendor_net_earning + vendor fees` (`:340-342`).

## Settings that change it

None at order level. Each line's result depends on the settings described in [ADR-0028](./0028-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md); fee recipients are covered by the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution).

## Worked example

Settings: global `fixed` 10 % + 1.00. Product A has product commission 20 % + 0. Product B has none. Vendor has none. No coupons. Shipping and tax: none. Store decimals 2.

Vendor order:

| Line | Total | Qty | Formula | Commission | Earning |
|---|---|---|---|---|---|
| A | 50.00 | 1 | product: 20 % + 0 | 10.00 | 40.00 |
| B | 30.00 | 3 | global: 10 % + 1.00/unit | 3.00 + 3.00 = 6.00 | 24.00 |
| **Order** | 80.00 | | | **16.00** | **64.00** |

A single "10 % of 80.00 + 1.00" would give 9.00; the order figure is not computed that way.

## Edge cases

- Non-product items (shipping lines, fee lines, coupon lines) are never passed to the line-item calculator.
- Admin-funded discounts can make one line negative; the order sum nets it against other lines (see [ADR-0021](./0021-an-admin-funded-discount-larger-than-the-commission-becomes-an-admin-subsidy-to-the-vendor.md)).
- On marketplace-owned order types the sums are routed differently (see [ADR-0026](./0026-marketplace-owned-order-types-give-the-whole-line-amount-to-the-admin-and-nothing-to-the-vendor.md)).
- Once a Vendor order has a row in `dokan_orders`, `get_earning_by_order()` reads the stored figure instead of recalculating (`lite:includes/Commission.php:227-231`).

## Why

No recorded decision. Calculating per line is what allows one order to mix products with different product-level or category rates.

## Consequences & risks

- A silently skipped line (rule 5) under-reports Commission for that order; the only trace is the log entry.
- Filters on the order sums do not reach the per-line figures used by refunds, so an extension that changes the order sum must also handle refunds itself.

## Recommendations

- Surface skipped-line failures in the order notes rather than only in the log.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
