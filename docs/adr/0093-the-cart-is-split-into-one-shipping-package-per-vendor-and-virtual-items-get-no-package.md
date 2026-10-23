# The cart is split into one shipping package per Vendor and virtual items get no package

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce, left alone, puts every cart item that needs shipping into a single shipping package (`WC_Cart::get_shipping_packages()`, filter `woocommerce_cart_shipping_packages` at `wc:includes/class-wc-cart.php:1732-1733`) and asks the customer to choose one shipping rate for the whole cart. In a marketplace each Vendor ships their own goods from their own location, and each Vendor order (Suborder) must carry its own shipping charge. Dokan therefore needs one package, and one chosen rate, per Vendor.

Product ownership is the product's `post_author` (Lite ADR 0010). The Suborder split that later turns these packages into per-Vendor shipping lines is described in [ADR-0090](./0090-each-shipping-line-belongs-to-one-vendor-and-a-suborder-receives-only-its-own-vendors-shipping-lines.md).

## Rule

- `Shipping\Hooks::split_shipping_packages()` (`lite:includes/Shipping/Hooks.php:42-77`) replaces WooCommerce's package list. It ignores the incoming packages and rebuilds them from `WC()->cart->get_cart()`:
  - Every cart item whose product `is_virtual()` is skipped (`:48-50`). Virtual items never appear in any package.
  - The remaining items are grouped by the product's `post_author` (`:51-53`). Variations are looked up by their own ID, so the variation post's own `post_author` decides. Dokan keeps variation authors aligned with the parent product (for example `BackgroundProcess\RewriteVariableProductsAuthor`, `lite:includes/BackgroundProcess/RewriteVariableProductsAuthor.php:79`), but a variation whose author differs from its parent's is packaged under the variation's author.
  - For each Vendor one package is built with `contents` (that Vendor's cart items), `contents_cost` (the sum of their `line_total`, i.e. after discounts and before tax), `applied_coupons` (all coupons on the cart), `user.ID`, `seller_id` (the Vendor's user ID) and `destination` (the customer's shipping country, state, postcode, city and address lines) (`:56-74`).
  - The resulting array passes through the filter `dokan_cart_shipping_packages` (`:76`).
- Each package is labelled for the customer as "Shipping: {store name}" by `Shipping\Hooks::change_shipping_pack_name()` (`lite:includes/Shipping/Hooks.php:106-121`), filter `dokan_shipping_package_name` (arguments: label, package index, package, Vendor object). Packages without a `seller_id` keep WooCommerce's default label.
- WooCommerce then rates each package independently (`WC_Shipping::calculate_shipping()`, `wc:includes/class-wc-shipping.php:255-279`), and the customer picks one rate per package. Which rates are offered is described in [ADR-0091](./0091-in-dokan-lite-every-vendor-package-is-charged-the-stores-own-woocommerce-shipping-rates-separately.md).
- **Who runs the split.** The split, the label and the `seller_id` tagging of shipping lines are attached only when no Dokan add-on has announced itself through `dokan_is_pro_exists` (`dokan()->is_pro_exists()` check at `lite:includes/Shipping/Hooks.php:23-28`). An add-on that announces itself is expected to provide its own split on `woocommerce_cart_shipping_packages`; the hook-level contract is that every package it produces carries `seller_id`.

## Settings that change it

There is no Dokan setting for this rule in Lite. It is always on when no add-on has taken over the split.

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| WooCommerce `woocommerce_ship_to_countries` ("Shipping location(s)", read by `wc_shipping_enabled()` at `wc:includes/wc-conditional-functions.php:445`) | `''` (ship to all countries you sell to), `all`, `specific`, `disabled` | `''` | `disabled`: shipping is off, `WC_Shipping::calculate_shipping()` returns no packages (`wc:includes/class-wc-shipping.php:258-260`), so the split has no effect and no order gets shipping lines. Any other value: the split applies. |
| Product "Virtual" flag (`_virtual`) | `yes` / `no` | `no` | `yes`: the item is left out of every package and is never charged shipping. `no`: the item is packaged with its Vendor's other items. |

## Worked example

Cart: Vendor A sells a T-shirt (physical, 2 × 15.00) and an e-book (virtual, 10.00); Vendor B sells a mug (physical, 1 × 12.00). A 10 % coupon applies to everything.

- Package 1, `seller_id` = A: contents = T-shirt only; `contents_cost` = 30.00 − 3.00 = 27.00. The e-book is not in any package.
- Package 2, `seller_id` = B: contents = mug; `contents_cost` = 12.00 − 1.20 = 10.80.
- The cart shows two shipping sections, "Shipping: Store A" and "Shipping: Store B", each with its own rate choice.

## Edge cases

- **Virtual-only cart or virtual-only Vendor.** A Vendor whose cart items are all virtual gets no package at all; a cart with only virtual items produces an empty package list and no shipping step.
- **Same Vendor, several packages.** Code on `dokan_cart_shipping_packages` may split one Vendor's items into several packages (for example to separate items fulfilled by a third party). Each such package must still carry the Vendor's `seller_id`; the Suborder then receives every shipping line tagged with that Vendor.
- **Coupons on every package.** `applied_coupons` lists all cart coupons on every package, including coupons that only apply to another Vendor's products. Shipping methods that look at coupons must check validity against the package's own items.
- **Label arguments.** WooCommerce passes four arguments to `woocommerce_shipping_package_name` (`wc:includes/class-wc-cart.php:1813-1819`); Lite registers the callback with three (`lite:includes/Shipping/Hooks.php:27`) and ignores the total package count.

## Why

The class comment and the `@since 3.7.19 Moved from pro` tags (`lite:includes/Shipping/Hooks.php:36`, `:82`, `:98`) record that the per-Vendor split was moved from the paid add-on into Lite so that a Lite-only marketplace also charges shipping per Vendor. The in-code `todo` (`:24`) says the intent is to move the remaining copy permanently into Lite.

## Consequences & risks

- The customer always sees one shipping choice per Vendor, and each Vendor order carries its own shipping charge, even when two Vendors ship from the same warehouse.
- Because `contents_cost` excludes virtual items in Lite, rate formulas based on package cost ignore virtual products.
- Two implementations of the split exist (Lite's and an add-on's). Their behaviour can drift; anyone changing one must check the other.

## Recommendations

- Finish the move the `todo` describes so that one implementation, with documented extension filters, owns the split.
- Consider passing only the coupons valid for the package's items in `applied_coupons`, to remove the burden from every shipping method.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
