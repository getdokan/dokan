# A fixed cart coupon can be used only when every product in the cart comes from one Vendor

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce has three core coupon types: `percent` (a percentage off each eligible item), `fixed_product` (a fixed amount off each eligible item) and `fixed_cart` (one amount off the whole cart). Dokan splits a multi-vendor Order into one Suborder per Vendor, and each Suborder must carry the part of every coupon that belongs to that Vendor's line items (see [ADR-0086](./0086-a-coupon-discount-is-split-across-suborders-exactly-as-woocommerce-allocated-it-to-each-line-item.md)). A percentage or per-product discount is naturally attributable to individual line items. A single cart-wide amount is not: whichever way it is spread, some Vendor ends up absorbing part of a discount that may have been meant for another. Teammates ask "why does my fixed cart coupon fail when the customer adds a second store's product?" This ADR answers that.

## Rule

**A `fixed_cart` coupon is refused whenever the items being discounted come from more than one Vendor. Percentage and fixed-product coupons are not limited by this rule.**

- `Order\Hooks::ensure_coupon_is_valid()` is attached to WooCommerce's `woocommerce_coupon_is_valid` filter (`lite:includes/Order/Hooks.php:52`), which WooCommerce applies at the end of `WC_Discounts::is_coupon_valid()` after its own checks (usage limits, expiry, minimum/maximum spend, product and category restrictions, allowed e-mails) have passed (`wc:includes/class-wc-discounts.php:1246-1262`).
- The callback collects the Vendor of every product in the `WC_Discounts` items with `dokan_get_vendor_by_product( $product_id, true )`, de-duplicates the list, and throws `Exception( 'This coupon is invalid for multiple vendors.' )` when the coupon is `fixed_cart` and more than one Vendor is present (`lite:includes/Order/Hooks.php:465-480`). WooCommerce turns the exception into a coupon error shown to the Customer (`wc:includes/class-wc-discounts.php:1263-1287`).
- For every other case the callback returns the incoming validity through the `dokan_coupon_is_valid` filter (`lite:includes/Order/Hooks.php:491`), which is the Lite seam add-ons use to add their own coupon rules.
- The check counts Vendors over **all items in the cart or order**, not only over the items the coupon would discount. Products owned by the Store Admin count as one more "Vendor", because `dokan_get_vendor_by_product()` returns the product author.
- The same filter runs whenever WooCommerce validates a coupon: in the cart, at checkout, and when a coupon is applied to an existing order in WP Admin. On a Suborder there is only one Vendor, so a `fixed_cart` coupon passes this check there.

## Settings that change it

None. There is no option to allow `fixed_cart` coupons across Vendors. Code can only add further restrictions through `dokan_coupon_is_valid`; it cannot lift this one, because the exception is thrown before the filter runs.

## Worked example

Cart: Vendor A's lamp (80.00) and Vendor B's mug (20.00).

| Coupon | Result |
|---|---|
| `fixed_cart`, 15.00 off | Refused: "This coupon is invalid for multiple vendors." |
| `percent`, 10 % | Accepted: lamp −8.00, mug −2.00 (subject to any other restrictions on the coupon). |
| `fixed_product`, 5.00 off | Accepted: lamp −5.00, mug −5.00. |

If the Customer removes the mug, the same `fixed_cart` coupon is accepted and takes 15.00 off the lamp.

## Edge cases

- **Coupon restricted to one Vendor's products.** A `fixed_cart` coupon whose product list contains only Vendor A's products is still refused when the cart also contains Vendor B's products, because the Vendor count is taken over every item, not over the coupon's eligible items.
- **Coupon already in the cart.** WooCommerce re-validates applied coupons in `WC_Cart::check_cart_coupons()`, so adding a second Vendor's product after a `fixed_cart` coupon was applied makes WooCommerce remove the coupon with its generic "coupon is invalid – it has now been removed from your order" notice (`wc:includes/class-wc-cart.php:811-820`).
- **Items without a product object** (for example a deleted product) are skipped when counting Vendors (`lite:includes/Order/Hooks.php:468-471`).
- **Single-vendor marketplaces.** The rule never triggers when only one Vendor sells, so every coupon type behaves exactly as in WooCommerce.

## Why

The method docblock states the intent: coupons are restricted "for consistency" so that the discount can be distributed to Suborders, with the example that an admin coupon must match products in the cart, "otherwise it wouldn't be possible to distribute the coupon in sub orders" (`lite:includes/Order/Hooks.php:446-455`).

## Consequences & risks

- Every coupon that reaches a Suborder can be traced to specific line items, which keeps the commission split per line item well defined (see [ADR-0024](./0024-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md)).
- Marketplaces that rely on "X off your basket" promotions must use percentage coupons or per-product amounts instead; a fixed cart amount only works for single-vendor carts.
- The Customer sees the restriction only when applying the coupon; there is no storefront hint before then (add-ons may add one).

## Recommendations

- Count only the Vendors of items the coupon is actually valid for, so that a `fixed_cart` coupon restricted to one Vendor's products keeps working when other Vendors' products are also in the cart.
- If a cart-wide fixed amount across Vendors is ever needed, define an explicit apportionment rule (for example pro rata to each Vendor's eligible subtotal) and document who funds each share.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
