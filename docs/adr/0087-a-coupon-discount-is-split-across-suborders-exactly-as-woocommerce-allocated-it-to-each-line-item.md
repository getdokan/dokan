# A coupon discount is split across Suborders exactly as WooCommerce allocated it to each line item

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A Customer applies one coupon code to a cart that holds products from several Vendors. At checkout Dokan creates one Suborder per Vendor (Lite ADR 0012). Teammates ask: "How much of the coupon lands on each Vendor's Suborder? Does Dokan recalculate it per Vendor, split it evenly, or pro rata?" The answer is that Dokan does not compute a split at all. It reuses, line by line, the discount WooCommerce already applied in the cart.

Who *bears* that discount in the commission calculation is a separate rule: see [ADR-0025](./0025-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md).

## Rule

**Each Suborder receives, for each coupon code, the sum of the discounts WooCommerce applied to that Vendor's line items in the cart. Nothing is re-derived from the coupon's settings.**

1. **The per-line discount is recorded in the cart.** Whenever WooCommerce applies a coupon, Lite re-applies it on a clone of `WC_Discounts`, reads `WC_Discounts::get_discounts()` and stores the amount for that coupon code on the cart item under `_dokan_coupon_info` (`lite:includes/Vendor/Coupon.php::intercept_wc_coupon()`, `::save_item_coupon_discount()`, `::save_coupon_data_to_cart_item()`). At checkout the record is copied to the order line item (`lite:includes/Vendor/Coupon.php::add_coupon_info_to_order_item()`). The mechanics of this record are part of the commission ADR above; this ADR only relies on its `discount` value.
2. **Suborder line items are copies of the parent's line items.** `Order\Manager::create_line_items()` copies each item's subtotal, total, taxes and all item meta (including `_dokan_coupon_info`) from the parent Order (`lite:includes/Order/Manager.php::create_line_items()`). The line total therefore already contains the discount WooCommerce applied in the cart.
3. **One coupon line per code is added to the Suborder.** `Order\Manager::create_coupons()` (`lite:includes/Order/Manager.php::create_coupons()`, called from `::create_sub_order()`) walks the Suborder's line items, sums `_dokan_coupon_info[code]['discount']` per code, counting only codes that are also applied on the parent Order, and adds one `WC_Order_Item_Coupon` per code with `discount` = that sum and `discount_tax` = 0, plus `coupon_info` and `coupon_data` snapshots of the coupon.
4. **Suborder totals come from the line items.** `create_sub_order()` then calls `WC_Order::calculate_totals()` (`lite:includes/Order/Manager.php::create_sub_order()`), which derives the order's discount total from line subtotals minus line totals (the `set_discount_total()` call in `wc:includes/abstracts/abstract-wc-order.php::calculate_totals()`). The coupon line's own `discount` value is informational; it does not drive the total.

So the split is whatever WooCommerce's coupon engine produced for each item: for `percent` it is proportional to each item's price, for `fixed_product` it is the fixed amount per unit (capped at the item price). `fixed_cart` coupons never reach a multi-vendor Order (see [ADR-0089](./0089-a-fixed-cart-coupon-can-be-used-only-when-every-product-in-the-cart-comes-from-one-vendor.md)).

## Settings that change it

None in Lite. Coupon restrictions (product lists, categories, exclusions, add-on Vendor limits) decide *which* items WooCommerce discounts; this rule only carries the result onto Suborders.

## Worked example

Cart: Vendor A's shirt 100.00 × 1, Vendor B's mug 25.00 × 2 (50.00). Coupon `SAVE10`, `percent`, 10 %, no restrictions. Prices exclude tax.

| | Parent Order | Suborder A | Suborder B |
|---|---|---|---|
| Line subtotal | 150.00 | 100.00 | 50.00 |
| `_dokan_coupon_info[SAVE10].discount` | 10.00 (shirt), 5.00 (mug) | 10.00 | 5.00 |
| Coupon line `SAVE10` discount | 15.00 | 10.00 | 5.00 |
| Line total after discount | 135.00 | 90.00 | 45.00 |

With a `fixed_product` coupon of 3.00 instead: shirt −3.00, mug −6.00 (3.00 × 2); Suborder A's coupon line shows 3.00 and Suborder B's 6.00.

## Edge cases

- **Discount tax.** The Suborder coupon line always stores `discount_tax = 0` (`lite:includes/Order/Manager.php::create_coupons()`), even when the parent's coupon line has discount tax. The Suborder's order-level discount tax is still right, because `calculate_totals()` recalculates the taxes of the copied, already-discounted line items (the `calculate_taxes()` call in `wc:includes/abstracts/abstract-wc-order.php::calculate_totals()`) and sets the order's discount tax from line subtotal tax minus line total tax (the `set_discount_tax()` call in the same method).
- **Vendor with no eligible items.** If a coupon did not discount any of a Vendor's items, those items carry no record for that code and the Suborder gets no coupon line for it.
- **Codes recorded on a line but missing from the parent.** The per-code accumulator is initialised before the "is it on the parent?" check (`lite:includes/Order/Manager.php::create_coupons()`), so such a code still produces a Suborder coupon line with a discount of 0.
- **Lines without a record** (for example items added by code that bypassed `WC_Discounts`) still carry their discounted line totals, but the Suborder gets no coupon line for that discount.
- **Over-discount trimming.** If the recorded discounts on one cart item exceed price × quantity, the record is trimmed at checkout before it is copied (`lite:includes/Vendor/Coupon.php::add_coupon_info_to_order_item()`). The price compared against is the product's current catalogue price, `wc_get_product( $item->get_product_id() )->get_price()` (same method), not the line's own price or subtotal, and for a variation it is the parent product's price; so the trim keeps the recorded discount within the item value only when that price matches what the line was sold at.
- **Orders created in WP Admin** are split on their first status change (`lite:includes/Order/Hooks.php::on_order_status_change()`); the same copy logic applies.
- **Coupons changed after checkout** are handled by [ADR-0086](./0086-a-coupon-added-to-or-removed-from-a-parent-order-is-mirrored-onto-its-suborders.md).

## Why

No recorded decision. The class comment on `intercept_wc_coupon()` explains why the per-line record exists: WooCommerce exposes per-line coupon amounts only through `WC_Discounts::get_discounts()` (docblock of `lite:includes/Vendor/Coupon.php::intercept_wc_coupon()`). Reusing that record keeps each Suborder's discount identical to what the Customer saw in the cart.

## Consequences & risks

- The sum of the Suborders' discounts equals the parent's discount for every coupon type allowed on multi-vendor carts, so Vendor orders reconcile with the Customer's receipt.
- Because the split is copied rather than recomputed, a later change to the coupon (amount, restrictions, funding) never alters existing Suborders.
- Reports that read the Suborder coupon line's `discount_tax` will under-report coupon tax; reports should use line totals or the parent coupon line instead.

## Recommendations

- Copy the parent coupon line's discount tax pro rata (or compute it from the copied items) so that Suborder coupon lines are complete.
- Skip codes that are not on the parent instead of adding zero-value coupon lines.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
