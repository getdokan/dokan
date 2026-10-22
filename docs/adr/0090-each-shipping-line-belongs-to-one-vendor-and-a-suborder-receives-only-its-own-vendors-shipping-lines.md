# Each shipping line belongs to one Vendor and a Suborder receives only its own Vendor's shipping lines

Status: Accepted (retroactive — documents existing code)

## Context

At checkout WooCommerce turns each chosen package rate into a `WC_Order_Item_Shipping` on the Order. When the Order contains items from several Vendors, Dokan splits it into one Suborder per Vendor synchronously at checkout (Lite ADR 0011), and from then on the Suborder (Vendor order) is the authoritative record while the parent only mirrors it (Lite ADR 0004). Each Suborder must carry exactly the shipping its Vendor's package was charged, because the Vendor's Earning, refunds and the shipping Fee recipient are calculated on the Suborder.

## Rule

- **Tagging at checkout.** When WooCommerce creates a shipping line from a package (`woocommerce_checkout_create_order_shipping_item`, fired at `wc:includes/class-wc-checkout.php:690`), `Shipping\Hooks::add_shipping_pack_meta()` stores the package's `seller_id` as item meta `seller_id` on that line (`lite:includes/Shipping/Hooks.php:91-93`). The block checkout uses the same `WC_Checkout::create_order_shipping_lines()` path, so both checkouts tag lines. When an add-on has taken over the package split (see [ADR-0093](./0093-the-cart-is-split-into-one-shipping-package-per-vendor-and-virtual-items-get-no-package.md)), the add-on is responsible for writing the same `seller_id` meta.
- **Placement on Suborders.** `Order\Manager::create_shipping()` (`lite:includes/Order/Manager.php:757-811`) runs inside `create_sub_order()` (`:638`). It reads every shipping line of the parent, keeps the lines whose `seller_id` meta equals the Suborder's Vendor (`:766-775`), passes them through the filter `dokan_shipping_methods` (arguments: lines, Suborder ID, parent order; `:788`), clones each kept `WC_Order_Item_Shipping` into the Suborder (`:798-808`) and sets the Suborder's shipping total to the sum of their totals (`:809`). Shipping tax lines are rebuilt afterwards from the cloned lines' taxes (`create_taxes()`), and `calculate_totals()` runs last (`:651`).
- **The parent keeps all lines.** The parent Order is not stripped; it still carries every Vendor's shipping lines, as a mirror (Lite ADR 0004).
- **Single-Vendor Orders are not split.** When the Order has items from one Vendor only, no Suborder is created; the Order itself becomes the Vendor order (`_dokan_vendor_id` set in `maybe_split_orders()`, `lite:includes/Order/Manager.php:932-946`) and keeps all its shipping lines.

## Settings that change it

None. The rule always applies. Whether the copied shipping counts toward the Vendor's Earning or the admin's share is a separate setting (`dokan_selling[shipping_fee_recipient]`); see [ADR-0034](./0034-shipping-fees-go-to-the-vendor-unless-the-shipping-fee-recipient-is-set-to-admin.md).

## Worked example

Order #100 (parent): Vendor A's package chose Flat rate 8.00 (shipping tax 0.80), Vendor B's package chose Local pickup 0.00. Shipping lines on #100: line 1 "Flat rate" 8.00 with `seller_id = A`; line 2 "Local pickup" 0.00 with `seller_id = B`.

- Suborder #101 (Vendor A) receives a clone of line 1: shipping total 8.00, shipping tax 0.80.
- Suborder #102 (Vendor B) receives a clone of line 2: shipping total 0.00.
- Parent #100 still shows both lines, total shipping 8.00.

## Edge cases

- **Several lines for one Vendor.** If one Vendor's items were split into several packages (an extension on `dokan_cart_shipping_packages` can do this), every line tagged with that Vendor is copied and the Suborder's shipping total is their sum.
- **No matching line.** When no parent shipping line carries the Vendor's `seller_id` (for example a Vendor whose items were all virtual, or lines created without the tag), the Suborder gets no shipping line and a shipping total of 0. The legacy filter `dokan_shipping_method` (deprecated since 3.7.19) is still applied to the first slot (`lite:includes/Order/Manager.php:777-786`); because that slot then holds an empty string, the "no shipping methods" early return at `:791` does not fire, the loop skips the non-shipping entry, and the total is set to 0.
- **Untagged lines are lost to Suborders.** A shipping line on the parent without `seller_id` (for example one added manually to the parent in WP Admin before the split, or produced by a package that had no `seller_id`) is copied to no Suborder.
- **Re-splitting.** `maybe_split_orders( $id, true )` deletes existing Suborders and rebuilds them from the parent's current lines (`lite:includes/Order/Manager.php:916-922`).

## Why

The Suborder is the Vendor's own order record. Copying only the lines charged for that Vendor's package keeps the Suborder total equal to what the customer paid for that Vendor's goods and shipping, so Earnings and refunds can be calculated per Vendor without looking at the parent.

## Consequences & risks

- The `seller_id` item meta on shipping lines is load-bearing. Anything that creates or edits shipping lines on a multi-Vendor parent must set it, or the shipping disappears from Suborders.
- Shipping changes made on the parent after the split do not reach Suborders (the parent is a mirror; Lite ADR 0004).
- The shipping line name on the order is the rate label (for example "Flat rate"), not the cart's "Shipping: {store}" package label.

## Recommendations

- Remove the deprecated `dokan_shipping_method` slot so that an empty result reaches the explicit early return and is logged as "No shipping method found".
- Log a warning when a parent shipping line has no `seller_id`, since its amount is silently excluded from every Suborder.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
