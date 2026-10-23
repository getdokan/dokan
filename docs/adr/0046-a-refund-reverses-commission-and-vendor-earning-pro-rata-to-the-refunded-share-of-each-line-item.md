# A refund reverses Commission and Vendor Earning pro rata to the refunded share of each line item

Status: Accepted (retroactive — documents existing code)

## Context

When a customer gets money back, both parties that shared the sale give something back: the admin returns part of the Commission and the Vendor returns part of the Earning. The most common questions are "does the admin keep the Commission on a refunded item?", "is a flat Commission fee refunded?", and "does a second partial refund use the reduced figures from the first?". This ADR answers those for the product (line item) part of a refund. Shipping, tax and gateway fees are covered in [ADR-0050](./0050-refunded-shipping-and-tax-go-back-from-whichever-party-received-them-and-the-gateway-fee-stays-where-it-was.md).

The Commission formula used is the one frozen onto the order at first calculation (Lite ADR 0012, `docs/adr/0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md`), so changing a rate after the sale never changes what a refund reverses.

## Rule

For each refunded **product line** of a refund on a Vendor order:

1. Dokan finds the original order line through the refund line's `_refunded_item_id` meta (`lite:includes/Commission/OrderCommission.php:169`), which WooCommerce writes on every refund line (`wc:includes/wc-order-functions.php:637`).
2. It takes that line's **original, unrefunded** Commission and Earning. `OrderRefundCommission::calculate()` switches refund adjustment off before calculating (`set_should_adjust_refund( false )`, `lite:includes/Commission/OrderRefundCommission.php:139`), so the line's Commission is computed as at the sale, using the frozen formula, and is not reduced by earlier refunds.
3. It splits the refunded amount with `Calculator::calculate_for_refund()` (`lite:includes/Commission/Calculator.php:191`), called from `OrderLineItemCommission::calculate_for_refund_item()` (`lite:includes/Commission/OrderLineItemCommission.php:171`):
   - admin part = `round( line Commission ÷ line total × refunded line amount, store decimals )` (`lite:includes/Commission/Calculator.php:205`);
   - Vendor part = refunded line amount − admin part (`:206`), not rounded.
   - When the original line total is 0, both parts are 0 (`:194-199`).
4. The parts of all refunded lines are summed (`lite:includes/Commission/OrderCommission.php:167-186`). The Vendor's sum is the line-item part of what the Vendor gives back; the admin's sum is the Commission the admin gives back.
5. For marketplace-owned order types, where the whole line belonged to the admin at sale time, the whole refunded line amount is attributed to the admin (`lite:includes/Commission/OrderCommission.php:173-178`).

Two consequences follow directly from the formula and are part of the rule:

- **Every Commission formula is reversed proportionally, flat fees included.** The calculation uses the final Commission figure of the line, whatever produced it (percentage, flat per unit, combined, category), so a flat fee is reversed in the same proportion as the price, not in full and not per unit.
- **Successive partial refunds add up to the original split.** Each refund is prorated against the original line figures independently, so refunding a line in several parts reverses (up to rounding of each part) exactly the Commission and Earning the line produced.

The Vendor's stored order Earning (`dokan_orders.net_amount`) is recalculated on the same principle: `OrderLineItemCommission::adjust_refunds()` subtracts the prorated split of everything refunded so far on that line (`lite:includes/Commission/OrderLineItemCommission.php:195-227`), and `VendorBalanceUpdateHandler::update_dokan_order_table()` writes the result when the order is saved (`lite:includes/Order/VendorBalanceUpdateHandler.php:147-201`).

## Settings that change it

| Setting | Default | Effect |
|---|---|---|
| Commission formula of the line (product, Vendor, global or category, as frozen on the order item) | global setting at the time of the sale | Determines the line Commission that is prorated. Changing it after the sale has no effect on refunds (Lite ADR 0012). |
| WooCommerce *Number of decimals* (`woocommerce_price_num_decimals`) | 2 | Precision to which the admin part of each refunded line is rounded. |

Filters: `dokan_order_line_item_commission_strategies` (only before the first calculation, per Lite ADR 0012); `dokan_vendor_earning_in_refund` can replace the whole Vendor figure.

## Worked example

Settings: global Commission `fixed` with `admin_percentage = 7.5`, `additional_fee = 0`; store decimals 2; no coupons. The rounding rule is [ADR-0023](./0023-commission-is-rounded-and-capped-on-the-admin-share-and-the-vendor-takes-the-exact-remainder.md).

Sale: one line, 1 × 33.33. Commission = round(33.33 × 7.5 %) = round(2.49975) = 2.50. Earning = 33.33 − 2.50 = 30.83.

| Refund | Refunded line amount | Admin part | Vendor part |
|---|---|---|---|
| #1 | 10.00 | round(2.50 ÷ 33.33 × 10.00) = round(0.75008) = 0.75 | 10.00 − 0.75 = 9.25 |
| #2 | 23.33 | round(2.50 ÷ 33.33 × 23.33) = round(1.74992) = 1.75 | 23.33 − 1.75 = 21.58 |
| Total | 33.33 | 2.50 (= original Commission) | 30.83 (= original Earning) |

Refund #2 is computed against the original 2.50 and 33.33, not against what was left after refund #1.

Flat fee: Commission `fixed` 0 % + 2.00 per unit, line 2 × 20.00 (total 40.00), Commission 4.00, Earning 36.00. A refund of one unit (20.00) reverses admin round(4.00 ÷ 40.00 × 20.00) = 2.00 and Vendor 18.00. A refund of 5.00 on the same line (a price adjustment, quantity 0) reverses admin 0.50 and Vendor 4.50.

## Edge cases

- **Refund line amount, not quantity, drives the split.** A refund that enters quantity 1 but a reduced amount is prorated by the amount. Quantity only matters for restocking.
- **Fee lines are not part of this calculation.** `OrderCommission::calculate_for_refund()` iterates `$refund->get_items()`, which returns product lines only, so a refunded order-fee line contributes nothing to the Vendor part. See [ADR-0049](./0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md).
- **Admin-funded discounts.** The line total used as the denominator is the total after coupons, so a refund is prorated against what the customer actually paid for the line, as the code comment in `adjust_refunds()` notes (`lite:includes/Commission/OrderLineItemCommission.php:202-205`). When an admin-funded coupon made the line Commission negative (a subsidy), the admin part of a refund is negative too, and the Vendor part is larger than the refunded amount.
- A refund line whose `_refunded_item_id` does not match a line of the order is not handled by this calculation: the line lookup finds no Commission for it (`lite:includes/Commission/OrderCommission.php:491-495`). WooCommerce always writes a matching id for refunds it creates (`wc:includes/wc-order-functions.php:637`), so this only arises with hand-crafted refunds.

## Why

The code comment in `Calculator::calculate_for_refund()` gives the reason for the split: "Split the refund the same way calculate() splits a sale, so the amounts refunded always add back up to the amount taken off the order" (`lite:includes/Commission/Calculator.php:203-204`). Prorating against the original split, rather than the remaining split, is what makes several partial refunds sum to the full reversal.

## Consequences & risks

- The admin never keeps Commission on refunded product value, and never returns more than the line produced. Marketplaces that want a non-refundable Commission (for example "the flat fee is kept on refunds") cannot express that through settings.
- Because the admin part is rounded per refund, many small partial refunds on the same line can differ from the original Commission by a cent in total.

## Recommendations

- If a "keep the flat fee on refund" policy is ever requested, implement it in `Calculator::calculate_for_refund()` behind an explicit setting, so that it applies equally to the Balance credit and to `dokan_orders.net_amount`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
