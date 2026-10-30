# Commission is rounded and capped on the admin share, and the Vendor takes the exact remainder

Status: Accepted (retroactive — documents existing code)

## Context

Percentages of prices produce fractions of a cent. If both the Commission and the Earning were rounded independently, the two could add up to one cent more or less than the line total, and that cent would belong to nobody. A flat fee per unit can also exceed the price of a cheap item. Teammates ask how Dokan rounds, whether Commission can exceed the sale amount, and where rounding happens (per line or per order).

## Rule

For each order line item, `Calculator::calculate()` (`lite:includes/Commission/Calculator.php:114-128`):

1. Computes the raw Commission (see [ADR-0025](./0025-fixed-commission-is-a-percentage-of-the-line-total-plus-a-flat-fee-charged-per-unit.md)).
2. Rounds **only the Commission** to the store's price decimals with half-up rounding: `NumberUtil::round( $raw, wc_get_price_decimals() )` (`:120`; `wc:src/Utilities/NumberUtil.php:54` defaults to `PHP_ROUND_HALF_UP`).
3. Caps the Commission at the line total: `min( rounded, line_total )` (`:120`). There is no lower bound here; a negative value is possible and is handled as a subsidy (see [ADR-0021](./0021-an-admin-funded-discount-larger-than-the-commission-becomes-an-admin-subsidy-to-the-vendor.md)).
4. Sets the Earning to `line_total − Commission`, unrounded (`:122`).

Rounding happens **per line item**. The order Commission is the sum of the already rounded line Commissions (see [ADR-0029](./0029-the-commission-on-a-vendor-order-is-the-sum-of-its-line-item-commissions.md)); there is no second rounding at order level.

Refunds are split with the same rule: `Calculator::calculate_for_refund()` rounds the admin's part of the refunded amount and gives the Vendor the remainder (`lite:includes/Commission/Calculator.php:191-212`). The refund rules themselves are in the [refund ADRs](decisions-index.md#refunds), starting with [ADR-0046](./0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md).

## Settings that change it

| Setting | Default | Effect |
|---|---|---|
| WooCommerce → Settings → General → *Number of decimals* (`woocommerce_price_num_decimals`, read by `wc_get_price_decimals()`) | 2 | Precision of the rounded Commission. With 0 decimals, Commission is rounded to whole currency units. |

## Worked example

Settings: global `fixed`, `admin_percentage = 7`, `additional_fee = 0`. Store decimals 2. No coupons.

- Line: 1 × 10.07. Raw = 10.07 × 7 % = 0.7049. Rounded = 0.70. Commission = min(0.70, 10.07) = 0.70. Earning = 10.07 − 0.70 = 9.37. Sum = 10.07 exactly.
- Vendor order with two such lines (different products): Commission = 0.70 + 0.70 = 1.40, not round(20.14 × 7 %) = round(1.4098) = 1.41. Earning = 18.74.

Cap: global `fixed` 0 % + 10.00 flat. Line 1 × 5.00. Raw = 10.00. Commission = min(10.00, 5.00) = 5.00. Earning = 0.00.

## Edge cases

- A line with total 0 (for example a free gift) gets Commission `min(round(flat × qty), 0)`, which is at most 0, so a free item never produces positive Commission.
- Because the cap is the line total *after* discounts, a heavily discounted line can make the flat fee be capped even though the undiscounted price was high enough.
- The Earning is not rounded. When the line total itself has more decimals than the store setting (possible through custom pricing code), the Earning carries those decimals.

## Why

The code states the reason: "Round only the admin's share and let the vendor take the exact remainder. Rounding both shares leaves a fraction of a cent credited to neither party." (`lite:includes/Commission/Calculator.php:117-118`). The refund split carries the matching comment (`:203-204`).

## Consequences & risks

- Rounding per line, not per order, means a many-line Vendor order can differ by a few cents from "rate × order subtotal". Reports that recompute Commission from order totals will not match exactly.
- The cap prevents Commission from exceeding a line, but a flat fee larger than a cheap item silently becomes "all of it" rather than an error.

## Recommendations

- Document per-line rounding in Vendor-facing help, since Vendors often check Commission against the order total with a calculator.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
