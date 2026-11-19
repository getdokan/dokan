# A coupon added to or removed from a parent order is mirrored onto its Suborders

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

After checkout, a Store Admin can still add or remove coupons on an order from the WooCommerce order edit screen (or through any code that calls `WC_Order::apply_coupon()` / `remove_coupon()`). In a multi-vendor Order the money lives on the Vendor orders, while the parent Order is the Customer-facing mirror (Lite ADR 0004). Teammates ask: "If I add a coupon to the parent Order, do the Suborders get it? If I remove it from one Suborder, what happens to the parent?" This ADR records what the code does in each direction.

## Rule

**Adding a coupon to a parent Order applies the same code to every Suborder that does not already have it. Removing a coupon from a parent Order removes it from every Suborder that has it. Removing a coupon from a Suborder changes the parent only by clearing the matching per-line `_dokan_coupon_info` records, and only for Suborder items that carry that record themselves. Items carry it for a coupon applied at checkout, but not for a coupon mirrored from the parent after checkout.** (The parent keeping its coupon line in that case is a known gap, not part of the rule; see Edge cases.)

1. **Add on the parent.** When WooCommerce applies a coupon to an order, Lite records the per-line discount on each order item (`lite:includes/Vendor/Coupon.php::save_coupon_data_to_order_item()`) and, if the order has Suborders (`has_sub_order` meta), calls `apply_coupon_to_child_orders()` (the `has_sub_order` branch at the end of `::save_coupon_data_to_order_item()`). That method loops over `dokan()->order->get_child_orders()`, skips Suborders that already list the code, and calls `$sub_order->apply_coupon( $code )` followed by `save()` (`::apply_coupon_to_child_orders()`).
   - `WC_Order::apply_coupon()` re-validates the coupon against the Suborder's own items, so WooCommerce rules, the Lite fixed cart rule ([ADR-0089](./0089-a-fixed-cart-coupon-can-be-used-only-when-every-product-in-the-cart-comes-from-one-vendor.md)) and any add-on rules on `dokan_coupon_is_valid` apply per Suborder. A Suborder whose items are not eligible simply does not get the coupon; the error is not surfaced.
   - The discount on each Suborder is computed by WooCommerce for that Suborder's items, but no `_dokan_coupon_info` record is written on the Suborder's items. The recording runs inside `Vendor\Coupon::intercept_wc_coupon()`, which removes itself from `woocommerce_coupon_get_apply_quantity` before it fires `dokan_wc_coupon_applied` and re-attaches only afterwards (all in `lite:includes/Vendor/Coupon.php::intercept_wc_coupon()`). The Suborder's `apply_coupon()` call (`::apply_coupon_to_child_orders()`) runs inside that window, so the hook never sees the Suborder's items. A Suborder item gets the record only if that Suborder's coupons are recalculated later outside this call (for example when another coupon is applied directly to the Suborder, which re-runs every coupon through `WC_Order::recalculate_coupons()`).
   - Coupons applied at checkout are different. When a Suborder is created, its line items copy all of the parent item's meta, `_dokan_coupon_info` included (`lite:includes/Order/Manager.php::create_line_items()`), so those Suborder items do carry the record.
2. **Remove on the parent.** Deleting a coupon item fires `woocommerce_before_delete_order_item`, handled by `Vendor\Coupon::remove_coupon_info_from_order_item()` (`lite:includes/Vendor/Coupon.php::__construct()`, `::remove_coupon_info_from_order_item()`). It removes the code from `_dokan_coupon_info` on the order's items and, when the order has Suborders, calls `remove_coupon_from_child_orders()`, which runs `$sub_order->remove_coupon( $code )` and `save()` on every Suborder that lists the code (`lite:includes/Vendor/Coupon.php::remove_coupon_from_child_orders()`).
3. **Remove on a Suborder.** When the order is not a parent, the same handler loads the parent Order and removes the code from `_dokan_coupon_info` on the parent items whose product id matches one of the Suborder items that had the code in their own `_dokan_coupon_info` (the Suborder branch of `lite:includes/Vendor/Coupon.php::remove_coupon_info_from_order_item()`, `::remove_coupon_discount_from_items()`). For a coupon mirrored after checkout, the Suborder items have no such record (step 1), so the product-id list is empty and nothing on the parent changes. In every case the handler does not delete the parent's coupon line and does not change the parent's totals.
4. **Add on a Suborder.** Applying a coupon to a Suborder records the per-line discount on that Suborder only. Nothing is pushed to the parent or to sibling Suborders (the parent branch in `lite:includes/Vendor/Coupon.php::save_coupon_data_to_order_item()` requires `has_sub_order`).

## Settings that change it

None.

## Worked example

Order #100 has Suborders #101 (Vendor A, shirt 100.00) and #102 (Vendor B, mug 50.00). The Store Admin adds coupon `LATE10` (`percent`, 10 %, no restrictions) to #100 in WP Admin.

- #100: WooCommerce applies `LATE10`; shirt −10.00, mug −5.00; `_dokan_coupon_info['LATE10']` records written on both #100 items.
- #101: `apply_coupon( 'LATE10' )` → shirt −10.00; no `_dokan_coupon_info` record on the shirt item.
- #102: `apply_coupon( 'LATE10' )` → mug −5.00; no `_dokan_coupon_info` record on the mug item.

The Store Admin then removes `LATE10` from #102 only. #102 loses the coupon and the mug is back to 50.00. The handler finds no `LATE10` record on #102's items, so its product-id list is empty and nothing on #100 changes: the mug's `_dokan_coupon_info['LATE10']` record stays, #100 still shows the `LATE10` coupon line, and its totals still include −15.00. The parent and the Vendor order now disagree until the Store Admin also removes the coupon from #100 (which then removes it from #101 as well and clears both parent records).

Had `LATE10` been applied at checkout instead, #102's mug item would carry the copied record, and removing the coupon from #102 would also remove the mug's record on #100. The coupon line and totals on #100 would still be unchanged.

## Edge cases

- **Known gap: removing a coupon from a Suborder leaves the parent diverged.** The parent keeps its coupon line and its totals (step 3 above), so the Customer-facing Order and the Vendor order disagree until the coupon is also removed from the parent. For a coupon mirrored after checkout the parent also keeps its per-line records.
- **Known gap: mirrored coupons leave no per-line record on Suborders.** Code that reads `_dokan_coupon_info` from Suborder items finds nothing for a coupon added on the parent after checkout (step 1), even though the Suborder's totals include its discount.
- **Coupon restricted to one Vendor.** If `LATE10` were valid only for Vendor A's products, #102 would reject it during `apply_coupon()` and only #101 would be discounted.
- **Already applied.** The recording hook runs once per parent line item (and again whenever WooCommerce recalculates the parent's coupons), so `apply_coupon_to_child_orders()` is called several times; a Suborder that already lists the code is skipped (`lite:includes/Vendor/Coupon.php::apply_coupon_to_child_orders()`), so the code is applied to each Suborder only once.
- **Rejected on a Suborder.** `WC_Order::apply_coupon()` returns a `WP_Error` instead of throwing when validation fails (`wc:includes/abstracts/abstract-wc-order.php::apply_coupon()`); Lite ignores the return value (`lite:includes/Vendor/Coupon.php::apply_coupon_to_child_orders()`), which is why nothing is shown.
- **Commission and Balance.** Changing an order's items or totals goes through the normal order-edit recalculation; see [ADR-0042](./0042-editing-a-vendor-order-recalculates-its-earning-in-the-vendor-balance-ledger.md). The `Commission\RecalculateCommissions` class that once handled coupon edits returns from its constructor before registering any hook (`lite:includes/Commission/RecalculateCommissions.php::__construct()`), so it plays no part.
- **Usage counts.** Each Suborder that accepts the mirrored coupon counts one more use, once that Suborder has recorded usage; see [ADR-0088](./0088-a-coupon-used-on-a-multi-vendor-order-counts-one-use-for-the-order-and-one-for-each-suborder.md).

## Why

No recorded decision. The handler's docblock describes the intended propagation in both directions (docblock of `lite:includes/Vendor/Coupon.php::remove_coupon_info_from_order_item()`). The asymmetry in step 3 (parent coupon line kept) follows from the code, not from a stated choice.

## Consequences & risks

- Coupon changes made on the parent Order reach every Vendor order without manual work, which keeps Vendor Earnings consistent with what the Customer was charged.
- Editing a coupon on a single Suborder leaves the parent Order's coupon line and totals unchanged, so the Customer-facing order and the Vendor order can diverge.
- Silent per-Suborder validation failures mean a Store Admin may believe a coupon applies to every Vendor when it only reached some of them.

## Recommendations

- Treat the parent Order as the only place to add or remove coupons after checkout, and say so in the order edit screen.
- When a coupon is removed from a Suborder, recalculate the parent's coupon line (or block Suborder coupon edits for multi-vendor Orders).
- Add an order note on the parent listing which Suborders accepted or rejected a mirrored coupon.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
