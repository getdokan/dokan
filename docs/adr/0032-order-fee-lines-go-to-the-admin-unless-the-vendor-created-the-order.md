# Order fee lines go to the admin unless the Vendor created the order

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WooCommerce orders can carry **fee lines** (`WC_Order_Item_Fee`): a payment surcharge, a gift-wrap charge, a small-order fee added by a plugin, or a fee typed in by whoever builds the order manually. Unlike shipping and tax, there is no admin setting for who receives them. Since 4.1.0 Dokan decides by looking at who created the order. The overall arithmetic is in [ADR-0035](./0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

- `OrderCommission::get_order_fee_recipient()` (`lite:includes/Commission/OrderCommission.php:626-634`) returns `admin` by default. When the order meta `_wc_order_attribution_source_type` equals `vendor`, it returns `seller`. The result passes through the filter `dokan_order_commission_order_fee_recipient` (recipient, order, calculator).
- The recipient receives `get_total_fees()` minus fee amounts already refunded (`get_admin_order_fees()` / `get_vendor_order_fees()`, `:596-617`; refunded fees summed per fee line in `get_order_fee_refunded()`, `:641-657`). `get_total_fees()` is the sum of fee line totals excluding their tax.
- The recipient is **not** frozen onto the order, unlike shipping and tax recipients: it is recomputed on every calculation from the attribution meta and the filter.
- `_wc_order_attribution_source_type` is WooCommerce's order attribution field. `vendor` is not a value WooCommerce assigns itself; it is written by add-ons that let a Vendor create an order on a customer's behalf. Orders placed through checkout carry WooCommerce's own values (for example `typein`, `organic`, `utm`, `referral`) and orders created in WP Admin carry `admin`, so their fee lines go to the admin.
- `get_data()` exposes the result as `admin_order_fees`, `vendor_order_fees` and `order_fees_recipient` (`:441-455`).

## Settings that change it

None in the admin settings. The outcome depends on:

| Input | Value | Fee lines go to |
|---|---|---|
| Order meta `_wc_order_attribution_source_type` | `vendor` | the Vendor |
| | anything else or absent | the admin |
| Filter `dokan_order_commission_order_fee_recipient` | returns `seller` / `admin` | overrides the above |

## Worked example

Commission Fixed 10 % + 0 flat; shipping and tax recipients irrelevant (no shipping, no tax). Single-vendor order: product line 80.00 and a fee line "Gift wrap" 5.00. Order total 85.00.

- Placed at checkout (source type `typein`): Vendor Earning = 72.00; admin = 8.00 + 5.00 = **13.00**.
- Created by the Vendor through an add-on that sets source type `vendor`: Vendor Earning = 72.00 + 5.00 = **77.00**; admin = **8.00**.
- Later, 2.00 of the fee line is refunded: on recalculation the fee bucket becomes 3.00 for whichever party is the recipient.

## Edge cases

- **Multi-vendor Orders.** `Manager::create_sub_order()` copies product lines, shipping, tax and coupons to each Suborder but never copies fee lines (`lite:includes/Order/Manager.php:633-651`). Fee lines therefore stay on the parent Order only. Because the parent is never calculated (Lite ADR 0004), those fees enter no Vendor order, no `dokan_orders` row and no Balance; the money stays with whoever collected the payment, which in practice is the admin. A gateway processing fee prorated on the parent total is still computed against a total that includes these fees.
- **Tax on fee lines** is part of `get_total_tax()` and therefore follows the product tax recipient, not this rule (see [ADR-0033](./0033-product-tax-goes-to-the-tax-fee-recipient-and-excludes-shipping-tax.md)).
- **Negative fees** (discount-like fee lines) reduce the recipient's figure by the same logic.
- **Refund calculation.** `OrderRefundCommission` computes the per-refund Vendor and admin deductions from product lines, tax, shipping and any gateway fee returned through `dokan_refund_gateway_fee`; refunded fee lines are not part of it (`lite:includes/Commission/OrderRefundCommission.php:287-317`); refunded fee lines are reflected only through the refund-netted recalculation of the order.

## Why

No decision record exists. The code comment says "check order is a manual order then fee recipient is seller" (`lite:includes/Commission/OrderCommission.php:628`), which suggests the intent: fees a Vendor adds to an order they build themselves are the Vendor's charges, while fees added at checkout are normally marketplace-level surcharges.

## Consequences & risks

- A store that uses a fee plugin to charge a per-Vendor handling fee at checkout will see that money go to the admin, not the Vendor, unless the filter is used.
- Because the recipient is recomputed each time rather than frozen, changing the filter later changes the split of historical orders on their next recalculation.
- The rule reuses a WooCommerce reporting field for a money decision, so any change WooCommerce makes to attribution values affects fee routing.

## Recommendations

- Consider freezing the order-fee recipient onto the order like the other recipients, so historical orders cannot change.
- Consider a dedicated Dokan order meta to mark Vendor-created orders instead of reusing the WooCommerce attribution field.
- If multi-vendor fee lines matter, decide explicitly whether they should be split to Suborders, rather than leaving them on the parent.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
