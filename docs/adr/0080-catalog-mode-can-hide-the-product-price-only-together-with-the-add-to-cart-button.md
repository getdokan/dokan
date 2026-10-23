# Catalog mode can hide the product price only together with the Add to Cart button

Status: Accepted (retroactive — documents existing code)

## Context

Catalog mode (see [ADR-0081](./0081-catalog-mode-hides-add-to-cart-only-when-the-admin-allows-it-and-the-vendor-turns-it-on-for-the-store-or-the-product.md)) can also hide a product's price, for "price on request" listings. Teammates ask "can a Vendor hide prices but keep Add to Cart?" and "why does the price still show in WP Admin?". The answer to the first is no: price hiding is a sub-option of hidden Add to Cart.

## Rule

- **Admin gates.** Price hiding is possible only when both admin options are on: `dokan_selling['catalog_mode_hide_add_to_cart_button'] = on` (without it `CatalogMode\Hooks` registers no filters, `lite:includes/CatalogMode/Hooks.php:22-31`) and `dokan_selling['catalog_mode_hide_product_price'] = on` (`Helper::hide_product_price_option_is_enabled_by_admin()`, `lite:includes/CatalogMode/Helper.php:33-35`, default `off`).
- **Storefront effect.** `Hooks::hide_product_price()` filters `woocommerce_get_price_html` at priority 9 and returns an empty string when (`lite:includes/CatalogMode/Hooks.php:78-107`):
  1. the request is not in WP Admin (`is_admin()` always shows the price, `:80-82`), and
  2. the admin price option is on, and
  3. the filter `dokan_catalog_mode_hide_product_price` does not return `no`, and
  4. the product's `_dokan_catalog_mode.hide_product_price` is `on`, or the owning Vendor's store setting `catalog_mode.hide_product_price` is `on`.
- **Coupling enforced on save.** Every save path forces `hide_product_price = off` whenever `hide_add_to_cart_button` is off:
  - product editor: `Dashboard\Products::save_catalog_mode_data()` (`lite:includes/CatalogMode/Dashboard/Products.php:89-97`);
  - Vendor store settings: `Dashboard\Settings::save_settings_fields()` (`lite:includes/CatalogMode/Dashboard/Settings.php:128-134`);
  - bulk "Enable Catalog Mode" turns Add to Cart hiding on and leaves the stored price flag unchanged, except that it sets price hiding off when the admin price option is off; "Disable Catalog Mode" turns both off (`lite:includes/CatalogMode/Dashboard/ProductBulkEdit.php:84-98`).
  The Vendor store-settings UI also hides the price checkbox, and unticks it, unless Add to Cart removal is checked (`lite:includes/CatalogMode/Dashboard/Settings.php:71-104`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling['catalog_mode_hide_add_to_cart_button']` (new UI: inverted "Add to Cart Button Visibility") | legacy `on` / `off` | legacy `off` | Must be legacy `on`; otherwise no price is ever hidden. |
| `dokan_selling['catalog_mode_hide_product_price']`. New UI: "Product Price Visibility" (`catalog_mode_hide_product_price`, also stored through `InvertOnOffTransformer`, shown only when Add to Cart visibility is off, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:219-257`). Legacy screen: "Hide Product Price" (`lite:includes/CatalogMode/Admin/Settings.php:51-61`). | legacy `on` / `off` (new UI visibility `off` / `on`) | legacy `off` | Legacy `on` (new UI "Product Price Visibility" switched **off**): Vendors may hide prices. Legacy `off`: prices are always shown. |
| Vendor store setting "Hide Product Price" / product setting `hide_product_price` | `on` / `off` | `off` | `on` hides the price on the storefront for the Store / the product, provided its Add to Cart is also hidden at the same level. |
| Filter `dokan_catalog_mode_hide_product_price` | `yes` / `no` | `yes` | `no` keeps the price visible for that product. |

## Worked example

Admin: Add to Cart visibility off, Product Price visibility off (legacy: both `on`).

- Vendor H checks "Remove Add to Cart Button" and "Hide Product Price" in store settings. Every H product shows neither price nor button on the shop and product pages. In WP Admin the Store Admin still sees prices.
- Vendor J posts the store settings form with "Hide Product Price" checked but "Remove Add to Cart Button" unchecked. `save_settings_fields()` stores `hide_add_to_cart_button = off` and forces `hide_product_price = off`; J's prices and buttons stay visible.
- The admin switches Product Price visibility back on (legacy `off`). H's buttons stay hidden, but H's prices reappear immediately, because step 2 of the rule fails.

## Edge cases

- **Mixed levels.** A product with `hide_add_to_cart_button = off` but whose Vendor has both store options on is fully hidden (button and price) through the Vendor-level checks; the product-level coupling only constrains what is stored on the product.
- **Data written outside these forms** (imports, direct meta edits) can store `hide_product_price = on` with `hide_add_to_cart_button = off`; `hide_product_price()` does not re-check the button flag, so the price would be hidden while the button shows.

## Why

A product with a hidden price but a working Add to Cart button would let buyers purchase without seeing what they pay, so the code only allows price hiding as an extension of a non-purchasable listing.

## Consequences & risks

- Price hiding is a pure display filter on `woocommerce_get_price_html`; structured data, feeds or APIs that read the price directly still expose it.

## Recommendations

- Re-check the button flag inside `hide_product_price()` so the coupling holds for data that did not come through the dashboard forms.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
