# A coupon added to or removed from a parent order is mirrored onto its Suborders

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

After checkout, a Store Admin can still add or remove coupons on an order from the WooCommerce order edit screen (or through any code that calls `WC_Order::apply_coupon()` / `remove_coupon()`). In a multi-vendor Order the money lives on the Vendor orders, while the parent Order is the Customer-facing mirror (Lite ADR 0004). Teammates ask: "If I add a coupon to the parent Order, do the Suborders get it? If I remove it from one Suborder, what happens to the parent?" This ADR records what the code does in each direction.

## Rule

**Adding a coupon to a parent Order applies the same code to every Suborder that does not already have it. Removing a coupon from a parent Order removes it from every Suborder that has it. Removing a coupon from a Suborder only clears the matching per-line records on the parent; the parent keeps its coupon line.**

1. **Add on the parent.** When WooCommerce applies a coupon to an order, Lite records the per-line discount on each order item (`Vendor\Coupon::save_coupon_data_to_order_item()`, `lite:includes/Vendor/Coupon.php:199-237`) and, if the order has Suborders (`has_sub_order` meta), calls `apply_coupon_to_child_orders()` (`lite:includes/Vendor/Coupon.php:239-242`). That method loops over `dokan()->order->get_child_orders()`, skips Suborders that already list the code, and calls `$sub_order->apply_coupon( $code )` followed by `save()` (`lite:includes/Vendor/Coupon.php:254-267`).
   - `WC_Order::apply_coupon()` re-validates the coupon against the Suborder's own items, so WooCommerce rules, the Lite fixed cart rule ([ADR-0088](./0088-a-fixed-cart-coupon-can-be-used-only-when-every-product-in-the-cart-comes-from-one-vendor.md)) and any add-on rules on `dokan_coupon_is_valid` apply per Suborder. A Suborder whose items are not eligible simply does not get the coupon; the error is not surfaced.
   - The discount on each Suborder is computed by WooCommerce for that Suborder's items, and the per-line record is written on the Suborder's items by the same hook.
2. **Remove on the parent.** Deleting a coupon item fires `woocommerce_before_delete_order_item`, handled by `Vendor\Coupon::remove_coupon_info_from_order_item()` (`lite:includes/Vendor/Coupon.php:23`, `:41-68`). It removes the code from `_dokan_coupon_info` on the order's items and, when the order has Suborders, calls `remove_coupon_from_child_orders()`, which runs `$sub_order->remove_coupon( $code )` and `save()` on every Suborder that lists the code (`lite:includes/Vendor/Coupon.php:274-283`).
3. **Remove on a Suborder.** When the order is not a parent, the same handler loads the parent Order and removes the code from `_dokan_coupon_info` on the parent items whose product id matches one of the Suborder items that had the code (`lite:includes/Vendor/Coupon.php:55-66`, `:80-92`). It does not delete the parent's coupon line and does not change the parent's totals.
4. **Add on a Suborder.** Applying a coupon to a Suborder records the per-line discount on that Suborder only. Nothing is pushed to the parent or to sibling Suborders (the parent branch at `lite:includes/Vendor/Coupon.php:240` requires `has_sub_order`).

## Settings that change it

None.

## Worked example

Order #100 has Suborders #101 (Vendor A, shirt 100.00) and #102 (Vendor B, mug 50.00). The Store Admin adds coupon `LATE10` (`percent`, 10 %, no restrictions) to #100 in WP Admin.

- #100: WooCommerce applies `LATE10`; shirt −10.00, mug −5.00; per-line records written.
- #101: `apply_coupon( 'LATE10' )` → shirt −10.00.
- #102: `apply_coupon( 'LATE10' )` → mug −5.00.

The Store Admin then removes `LATE10` from #102 only: #102 loses the coupon and the mug is back to 50.00; on #100 the mug's `_dokan_coupon_info['LATE10']` record is removed, but #100 still shows the `LATE10` coupon line and its totals still include −15.00. The parent and the Vendor order now disagree until the Store Admin also removes the coupon from #100 (which then removes it from #101 as well).

## Edge cases

- **Coupon restricted to one Vendor.** If `LATE10` were valid only for Vendor A's products, #102 would reject it during `apply_coupon()` and only #101 would be discounted.
- **Already applied.** The recording hook runs once per parent line item (and again whenever WooCommerce recalculates the parent's coupons), so `apply_coupon_to_child_orders()` is called several times; a Suborder that already lists the code is skipped (`lite:includes/Vendor/Coupon.php:258-262`), so the code is applied to each Suborder only once.
- **Rejected on a Suborder.** `WC_Order::apply_coupon()` returns a `WP_Error` instead of throwing when validation fails (`wc:includes/abstracts/abstract-wc-order.php:1665-1698`); Lite ignores the return value (`lite:includes/Vendor/Coupon.php:264`), which is why nothing is shown.
- **Commission and Balance.** Changing an order's items or totals goes through the normal order-edit recalculation; see [ADR-0041](./0041-editing-a-vendor-order-recalculates-its-earning-in-the-vendor-balance-ledger.md). The `Commission\RecalculateCommissions` class that once handled coupon edits returns from its constructor before registering any hook (`lite:includes/Commission/RecalculateCommissions.php:16-18`), so it plays no part.
- **Usage counts.** `WC_Order::apply_coupon()` records a coupon use for each order it runs on; see [ADR-0087](./0087-a-coupon-used-on-a-multi-vendor-order-counts-one-use-for-the-order-and-one-for-each-suborder.md).

## Why

No recorded decision. The handler's docblock describes the intended propagation in both directions (`lite:includes/Vendor/Coupon.php:26-40`). The asymmetry in step 3 (parent coupon line kept) follows from the code, not from a stated choice.

## Consequences & risks

- Coupon changes made on the parent Order reach every Vendor order without manual work, which keeps Vendor Earnings consistent with what the Customer was charged.
- Editing a coupon on a single Suborder leaves the parent Order's coupon line and totals unchanged, so the Customer-facing order and the Vendor order can diverge.
- Silent per-Suborder validation failures mean a Store Admin may believe a coupon applies to every Vendor when it only reached some of them.

## Recommendations

- Treat the parent Order as the only place to add or remove coupons after checkout, and say so in the order edit screen.
- When a coupon is removed from a Suborder, recalculate the parent's coupon line (or block Suborder coupon edits for multi-vendor Orders).
- Add an order note on the parent listing which Suborders accepted or rejected a mirrored coupon.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
