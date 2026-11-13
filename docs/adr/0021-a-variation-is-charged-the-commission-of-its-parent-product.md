# A variation is charged the commission of its parent product

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Variable products sell as individual variations, and each variation is its own WooCommerce product object with its own ID and price. Teammates ask whether a variation can carry its own Commission formula, and which category counts when the variation is sold. The general level order is in [ADR-0029](./0029-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md).

## Rule

- **Product-level formula comes from the parent.** For order line items the chain is built from `WC_Order_Item_Product::get_product_id()` (`lite:includes/Commission/Strategies/OrderItem.php:57`), which WooCommerce stores as the parent product ID, keeping the variation in a separate `variation_id` (`wc:includes/class-wc-order-item-product.php:303`, `:313`). For callers that pass a variation ID directly (previews), `Settings\Product::__construct()` replaces the variation with its parent before reading `_per_product_admin_*` meta (`lite:includes/Commission/Settings/Product.php:19-25`). A variation's own commission meta, if any, is never read.
- **Category comes from the parent.** `Helper::get_product_chosen_category()` reads the chosen category of the parent for `variation` and `subscription_variation` products (`lite:includes/ProductCategory/Helper.php:290`), so category-based rates use the parent's first chosen category.
- **Vendor comes from the product author.** The Vendor link of the chain is resolved through `dokan_get_vendor_by_product()` on the product ID of the order item (`lite:includes/Commission/Strategies/OrderItem.php:47`, `lite:includes/Commission/Strategies/Product.php:49`); variations share the parent's Vendor (Lite ADR 0011).
- **The amount is the variation's own line.** The calculator uses the order line's total and quantity, which are those of the variation sold (`lite:includes/Commission/OrderLineItemCommission.php:117-140`).

The product editor exposes the commission fields only once, on the parent, for `simple`, `variable` and `booking` products (`lite:includes/Product/Hooks.php:504-540`), and the product editor saves them only for simple and variable products (`lite:includes/Product/Hooks.php:56-57`). The admin bulk-edit tool is broader: `Admin\Hooks::save_custom_bulk_edit_field()` saves them for every product type except those in the filterable `dokan_excluded_product_types_for_bulk_edit` list (default `product_pack`, `external`, `grouped`) and except the marketplace's advertisement and reverse-withdrawal products (`lite:includes/Admin/Hooks.php:251-271`). It runs on `woocommerce_product_bulk_edit_save` (`:41`), so it receives the products selected in the products list, which are parents, not variations.

## Settings that change it

Product commission on the **parent** product (`_per_product_admin_commission`, `_per_product_admin_additional_fee`). There is no per-variation setting.

## Worked example

Settings: global `fixed` 10 % + 0. Variable T-shirt with parent product commission 15 % + 0.50. Order line: 2 × "Large" variation at 30.00 (line total 60.00).

- Formula from the parent: 15 % + 0.50 per unit.
- Commission = 60.00 × 15 % + 0.50 × 2 = 9.00 + 1.00 = 10.00; Earning = 50.00.

## Edge cases

- Product earning previews for a variation (for example "You Earn" next to a variation price in the Vendor dashboard) also resolve to the parent's formula, because they go through the same `Settings\Product` class. Their category is looked up with the variation ID (`Helper::get_saved_products_category()`, `lite:includes/Commission/ProductCommission.php:76-81`); it reads the parent's `chosen_product_cat` meta (`lite:includes/ProductCategory/Helper.php:290`) and, when the parent has none, derives the category from the parent's `product_cat` terms, because `get_product_terms()` also redirects a variation to its parent (`lite:includes/ProductCategory/Helper.php:73-82`, `:339`).
- Variation-like types registered by extensions that are not of type `variation` are not redirected to a parent by `Settings\Product`; they are treated as products in their own right.

## Why

No recorded decision. Storing commission once on the parent keeps the editor and the bulk-edit tool to a single set of fields per product.

## Consequences & risks

- An admin cannot charge different commission on different variations of one product; the workaround is separate products.
- Meta written directly onto a variation by imports or custom code is silently ignored.

## Recommendations

- If per-variation commission is ever required, add it as an explicit new chain link before the parent product rather than changing `Settings\Product`.

_Verified against Lite @e1ce7fc81 / WooCommerce 11.2.1 — 2026-10-22._
