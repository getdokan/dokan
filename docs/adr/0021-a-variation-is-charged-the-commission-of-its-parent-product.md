# A variation is charged the commission of its parent product

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Variable products sell as individual variations, and each variation is its own WooCommerce product object with its own ID and price. Teammates ask whether a variation can carry its own Commission formula, and which category counts when the variation is sold. The general level order is in [ADR-0029](./0029-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md).

## Rule

- **Product-level formula comes from the parent.** For order line items the chain is built from `WC_Order_Item_Product::get_product_id()` (`lite:includes/Commission/Strategies/OrderItem.php::set_next()`), which WooCommerce stores as the parent product ID, keeping the variation in a separate `variation_id` (`wc:includes/class-wc-order-item-product.php::get_product_id()`, `::get_variation_id()`). For callers that pass a variation ID directly (previews), `Settings\Product::__construct()` replaces the variation with its parent before reading `_per_product_admin_*` meta (`lite:includes/Commission/Settings/Product.php::__construct()`). A variation's own commission meta, if any, is never read.
- **Category comes from the parent.** `Helper::get_product_chosen_category()` reads the chosen category of the parent for `variation` and `subscription_variation` products (`lite:includes/ProductCategory/Helper.php::get_product_chosen_category()`), so category-based rates use the parent's first chosen category.
- **Vendor comes from the Vendor order.** For order line items, `OrderLineItemCommission::set_order()` reads the Vendor from the Vendor order's `_dokan_vendor_id` meta (`lite:includes/Commission/OrderLineItemCommission.php::VENDOR_ID_META_KEY`, `::set_order()`) and passes it to the chain head (`::calculate()`), which hands it on to the product and Vendor links (`lite:includes/Commission/Strategies/OrderItem.php::set_next()`, `lite:includes/Commission/Strategies/Product.php::set_next()`). Only when that meta is missing or `0` (it is cast with `(int)`) does the chain fall back to `dokan_get_vendor_by_product()` on the order item's product ID, which is the parent (`lite:includes/Commission/Strategies/OrderItem.php::__construct()`). Previews have no order: `Commission::get_earning_by_product()` passes the product author (`lite:includes/Commission.php::get_earning_by_product()`), and `ProductCommission::calculate()` looks the author up itself when a caller passes no Vendor (`lite:includes/Commission/ProductCommission.php::calculate()`). Variations share the parent's Vendor (Lite ADR 0011), so either source gives the same Vendor unless the product has changed owner.
- **The amount is the variation's own line.** The calculator uses the order line's total and quantity, which are those of the variation sold (`lite:includes/Commission/OrderLineItemCommission.php::calculate()`).

The product editor exposes the commission fields only once, on the parent, for `simple`, `variable` and `booking` products (`lite:includes/Product/Hooks.php::add_per_product_commission_options()`), and the product editor saves them only for simple and variable products (the save hooks registered in `lite:includes/Product/Hooks.php::__construct()`). The admin bulk-edit tool is broader: `Admin\Hooks::save_custom_bulk_edit_field()` saves them for every product type except those in the filterable `dokan_excluded_product_types_for_bulk_edit` list (default `product_pack`, `external`, `grouped`) and except the marketplace's advertisement and reverse-withdrawal products (`lite:includes/Admin/Hooks.php::save_custom_bulk_edit_field()`). It runs on `woocommerce_product_bulk_edit_save` (registered in `::__construct()`), so it receives the products selected in the products list, which are parents, not variations.

## Settings that change it

Product commission on the **parent** product (`_per_product_admin_commission`, `_per_product_admin_additional_fee`). There is no per-variation setting.

## Worked example

Settings: global `fixed` 10 % + 0. Variable T-shirt with parent product commission 15 % + 0.50. Order line: 2 × "Large" variation at 30.00 (line total 60.00).

- Formula from the parent: 15 % + 0.50 per unit.
- Commission = 60.00 × 15 % + 0.50 × 2 = 9.00 + 1.00 = 10.00; Earning = 50.00.

## Edge cases

- Product earning previews for a variation (for example "You Earn" next to a variation price in the Vendor dashboard) also resolve to the parent's formula, because they go through the same `Settings\Product` class. Their category is looked up with the variation ID (`Helper::get_saved_products_category()`, called in `lite:includes/Commission/ProductCommission.php::calculate()`); it reads the parent's `chosen_product_cat` meta (`lite:includes/ProductCategory/Helper.php::get_product_chosen_category()`) and, when the parent has none, derives the category from the parent's `product_cat` terms, because `get_product_terms()` also redirects a variation to its parent (`lite:includes/ProductCategory/Helper.php::get_saved_products_category()`, `::get_product_terms()`).
- If a product changes owner after a sale but before that line is first calculated, the line is still charged under the Vendor recorded on the Vendor order, not the new owner, because `_dokan_vendor_id` is read first. The product-level formula is still the parent's current one. Lines already calculated keep their frozen formula (Lite ADR 0013).
- Variation-like types registered by extensions that are not of type `variation` are not redirected to a parent by `Settings\Product`; they are treated as products in their own right.

## Why

No recorded decision. Storing commission once on the parent keeps the editor and the bulk-edit tool to a single set of fields per product.

## Consequences & risks

- An admin cannot charge different commission on different variations of one product; the workaround is separate products.
- Meta written directly onto a variation by imports or custom code is silently ignored.

## Recommendations

- If per-variation commission is ever required, add it as an explicit new chain link before the parent product rather than changing `Settings\Product`.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
