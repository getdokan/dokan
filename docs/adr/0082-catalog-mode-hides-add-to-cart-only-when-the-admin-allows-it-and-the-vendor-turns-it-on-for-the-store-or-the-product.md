# Catalog mode hides Add to Cart only when the admin allows it and the Vendor turns it on for the Store or the product

Status: Accepted (retroactive — documents existing code)

## Context

Some Vendors want to show products without selling them online (made-to-order goods, "call for price" items, a showroom). Dokan's **catalog mode** makes a product unpurchasable so WooCommerce hides its Add to Cart button. Teammates ask "I enabled catalog mode in the admin settings, why can buyers still add to cart?", "can a Vendor turn it on for just one product?" and "can a Vendor exclude one product from store-wide catalog mode?". Hiding the price is a dependent option recorded in [ADR-0081](./0081-catalog-mode-can-hide-the-product-price-only-together-with-the-add-to-cart-button.md).

## Rule

- **Two layers.** The Store Admin's setting only *allows* catalog mode; it hides nothing on its own. The Vendor then turns it on for the whole Store or for individual products.
- **Admin gate.** `CatalogMode\Helper::is_enabled_by_admin()` is true when `dokan_selling['catalog_mode_hide_add_to_cart_button']` is `on` (`lite:includes/CatalogMode/Helper.php::is_enabled_by_admin()`, default `off`). When it is off, `CatalogMode\Hooks`, the per-product editor section, the bulk actions and the Vendor store setting all return from their constructors without registering anything (`lite:includes/CatalogMode/Hooks.php::__construct()`, `lite:includes/CatalogMode/Dashboard/Products.php::__construct()`, `lite:includes/CatalogMode/Dashboard/ProductBulkEdit.php::__construct()`, `lite:includes/CatalogMode/Dashboard/Settings.php::__construct()`).
- **Storefront effect.** `Hooks::hide_add_to_cart_button()` filters `woocommerce_is_purchasable` at priority 20 (`lite:includes/CatalogMode/Hooks.php::__construct()`, `::hide_add_to_cart_button()`):
  1. If an earlier filter already returned false, it keeps false.
  2. If the filter `dokan_catalog_mode_hide_add_to_cart_button` returns `no` for the product, catalog mode is skipped.
  3. If the product's own setting has `hide_add_to_cart_button = on`, the product is not purchasable.
  4. Otherwise, if the owning Vendor's store setting has `hide_add_to_cart_button = on`, the product is not purchasable.
  5. Otherwise the original value stands.
- **Where the settings live.**
  - Per product: post meta `_dokan_catalog_mode` = `['hide_add_to_cart_button' => on|off, 'hide_product_price' => on|off]`. A variation reads its parent's meta (`lite:includes/CatalogMode/Helper.php::get_catalog_mode_data_by_product()`). Saved from the legacy product editor's catalog mode section (rendered on `dokan_product_edit_after_options`, `lite:includes/CatalogMode/Dashboard/Products.php::__construct()`) by `Dashboard\Products::save_catalog_mode_data()` on `dokan_new_product_added` / `dokan_product_updated`, only when that section's `_dokan_catalog_mode_frontend_nonce` is posted and verifies (`::save_catalog_mode_data()`); the React product editor has no catalog mode field. In bulk it is saved by the "Enable/Disable Catalog Mode" bulk actions, which edit only the Vendor's own products (`lite:includes/CatalogMode/Dashboard/ProductBulkEdit.php::save_bulk_edit_catalog_mode_data()`).
  - Per Vendor: the `catalog_mode` key of the store profile settings (`dokan_profile_settings`), saved from Vendor dashboard → Settings → Store by `Dashboard\Settings::save_settings_fields()` (through the `dokan_store_profile_settings_args` filter, `lite:includes/CatalogMode/Dashboard/Settings.php::__construct()`, `::save_settings_fields()`).
  - Defaults for both are `off` (`lite:includes/CatalogMode/Helper.php::get_defaults()`, filter `dokan_catalog_mode_default_vendor_settings`; the Vendor value passes through `dokan_catalog_mode_vendor_settings`).
- The per-product editor section is shown only to users with `dokandar` and not for `auction` products (`lite:includes/CatalogMode/Dashboard/Products.php::render_product_section()`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling['catalog_mode_hide_add_to_cart_button']`. In the current admin settings UI this is the inverted switch "Add to Cart Button Visibility" (`catalog_mode_add_to_cart_button_visibility`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php::general_page()`, stored through `InvertOnOffTransformer`). In the legacy settings screen it is "Remove Add to Cart Button" (`lite:includes/CatalogMode/Admin/Settings.php::admin_settings()`). | legacy `on` / `off` (new UI: visibility `off` / `on`) | legacy `off` = new UI visibility `on` | Legacy `on` (new UI "visibility" switched **off**): catalog mode is available to Vendors. Legacy `off`: catalog mode is unavailable everywhere and existing product/Vendor catalog settings are ignored. |
| Vendor store setting "Remove Add to Cart Button" (`catalog_mode.hide_add_to_cart_button`) | `on` / `off` | `off` | `on`: every product of the Vendor is unpurchasable. |
| Product setting `_dokan_catalog_mode.hide_add_to_cart_button` | `on` / `off` | `off` | `on`: this product is unpurchasable. |
| Filter `dokan_catalog_mode_hide_add_to_cart_button` | `yes` / `no` | `yes` | `no`: the product is exempt from catalog mode, whatever the product or Vendor setting says. Add-ons hook it, for example to apply quote-request handling to catalog-mode products. |

## Worked example

The admin switches "Add to Cart Button Visibility" off (legacy `catalog_mode_hide_add_to_cart_button = on`).

- Vendor F leaves the store setting off and turns catalog mode on for product P1 only. P1 shows no Add to Cart; F's other products sell normally.
- Vendor G turns the store setting on. All of G's products are unpurchasable, including product P9 whose own setting is `off`: the product check fails, then the Vendor check returns `on`.
- Later the admin switches the visibility back on (legacy `off`). `Hooks` registers nothing, so P1 and all of G's products are purchasable again, while the saved product and Vendor settings stay in the database for when the admin re-enables it.

## Edge cases

- **No per-product opt-out.** A product setting of `off` does not override a Vendor-level `on`; only the `dokan_catalog_mode_hide_add_to_cart_button` filter can exempt a product.
- **Vendor Staff** can use the bulk catalog mode actions if they hold both `dokan_delete_product` (checked by the shared bulk-action dispatcher, `lite:includes/Product/Hooks.php::bulk_product_status_change()`) and `dokan_edit_product` (checked by the catalog mode handler, `lite:includes/CatalogMode/Dashboard/ProductBulkEdit.php::save_bulk_edit_catalog_mode_data()`).
- **Reverse withdrawal.** A Vendor who fails to pay a Reverse withdrawal balance can be put into a separate, forced catalog mode by the "Disable Add to Cart Button" failure action. That runs its own `woocommerce_is_purchasable` filter regardless of this setting (`lite:includes/ReverseWithdrawal/Hooks.php::__construct()`, `::hide_add_to_cart_button()`); see Lite ADR 0015.
- **Cart contents.** Making a product unpurchasable stops new additions; items already in a buyer's cart are handled by WooCommerce's own purchasable checks at cart and checkout.

## Why

The two-layer design keeps the decision with the operator (whether the marketplace allows non-selling listings at all) while letting each Vendor apply it where it fits. Using WooCommerce's `woocommerce_is_purchasable` filter means every theme and block that respects WooCommerce's purchasable flag hides the button without Dokan-specific templates.

## Consequences & risks

- Admins frequently read the setting as "turn catalog mode on" and expect products to change immediately; nothing changes until Vendors opt in.
- The inverted label in the current settings UI ("visibility" off means catalog mode allowed) is a common source of confusion when reading the stored `dokan_selling` value.

## Recommendations

- Consider a per-product "exclude from store catalog mode" option, since the current precedence only lets a product add restrictions, not remove them.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
