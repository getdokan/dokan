# Dokan Lite lets Vendors create only simple products

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WooCommerce ships simple, variable, grouped and external/affiliate product types, and other plugins register more (subscriptions, auctions, bookings). A Store Admin can create any of them in WP Admin. Teammates ask "why can't my Vendors create variable products?" and "where is the list of product types a Vendor may choose?". In Dokan Lite the Vendor-facing answer is: only Simple, unless an add-on extends the list.

## Rule

- The product types offered to Vendors are the keys of the filter `dokan_product_types`, whose Lite default is `[ 'simple' => 'Simple' ]`. Every Vendor-facing consumer applies that same default:
  - legacy editor type selector (`templates/products/edit-product-single.php:272-285`; when the list is exactly Simple, a hidden `simple` field replaces the selector);
  - React editor type field (`FormSchema::get_product_types()`, `lite:includes/ProductEditor/FormSchema.php:207-222`);
  - product listing filter and v2 listing (`dokan_product_listing_filter()`, `lite:includes/functions.php:2326-2328`; `templates/products/products-listing.php:139`; `lite:includes/REST/ProductControllerV2.php:274`);
  - the dashboard script data (`lite:includes/Assets.php:882`, default `[ 'simple' ]`).
- Saving defaults to `simple` when no type is posted: the full add form and the legacy update both write the `product_type` term from the posted `product_type`, falling back to `simple` (`lite:includes/Dashboard/Templates/Products.php:371-373`, `:559-561`); the quick-create popup does the same (`dokan_save_product()`, `lite:includes/Product/functions.php:83`).
- **The list is enforced only in the UI.** No save path checks the type against `dokan_product_types`: the full add form and the legacy update write the posted `product_type` (`lite:includes/Dashboard/Templates/Products.php:372-373`, `:560-561`), quick-create passes the posted `product_type` to `Product\Manager::create()` (`lite:includes/Product/functions.php:83`), v1 builds the product class from the `type` parameter (`lite:includes/REST/ProductController.php:1207-1220`), and v3 accepts any type in WooCommerce's product schema. A crafted request can therefore create a variable, grouped or external product on a Lite-only site.
- On a Lite-only site, the product-type filter on the Vendor's product listing is removed altogether (`Product\Hooks::remove_product_type_filter` on `dokan_product_listing_filter_args`, `lite:includes/Product/Hooks.php:46`, `:427-435`).
- **Do not confuse with `dokan_get_product_types()`.** That function (`lite:includes/functions.php:799-814`, filter `dokan_get_product_types`) returns *labels* for simple, variable, grouped and external products. It is used to display a product's type, not to decide what a Vendor may create. Add-ons that need "all types Dokan knows about" read it; the list of types a Vendor may *create* is `dokan_product_types`.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| Filter `dokan_product_types` | array `type => label` | `[ 'simple' => 'Simple' ]` | Every key becomes selectable in both editors and the listing filter. Add-ons extend the list here (for example to add variable, grouped, external, subscription or auction types). |

There is no admin setting in Dokan Lite to choose the allowed product types.

## Worked example

A Lite-only marketplace. Vendor K opens the legacy editor for a new product. The type list is built from `apply_filters( 'dokan_product_types', [ 'simple' => 'Simple' ] )`; because it contains only Simple, the editor shows no type selector at all and posts a hidden `product_type = simple`. K saves; `product_type` is posted as `simple` (or empty, which also becomes `simple`), and the product is a WooCommerce simple product. In WP Admin, the Store Admin can still change that product to variable, because WP Admin is not limited by `dokan_product_types`.

## Edge cases

- **Admin-created types.** A product the Store Admin turns into a variable or grouped product in WP Admin keeps that type until the Vendor saves it in the legacy editor. When the filtered list is only Simple, that editor renders no visible selector but a hidden `product_type = simple` field (`templates/products/edit-product-single.php:272-276`), and the save handler writes that posted type back as the product's type (`lite:includes/Dashboard/Templates/Products.php:560-561`). A Vendor save therefore turns such a product back into a simple product.
- **React editor `type` query.** `ProductControllerV3::init_form_fields()` pre-selects a requested type for a brand-new product when it is any registered WooCommerce type (`lite:includes/REST/ProductControllerV3.php:667-678`), not only one in `dokan_product_types`. The offered options still come from `dokan_product_types`, but the pre-filled value is what the form saves, so `…#products/create?type=variable` would save a variable product on a Lite-only site (not confirmed at runtime).
- **WooCommerce REST and Abilities.** `wc/v3/products` and the product Abilities apply only Dokan's Ownership scoping (`ProductAbilityScope`), not `dokan_product_types` (not confirmed at runtime).

## Why

No decision record exists. The free plugin ships the minimal product editor; richer product types (variations, grouped and external products) are offered by add-ons, which plug into the same filter.

## Consequences & risks

- `dokan_product_types` is the single place to widen or narrow the Vendor's choice; add-ons that offer extra types (or remove some, for example per subscription plan) all hook it, so their priorities interact.
- Product types created in WP Admin are outside this rule, which keeps the Store Admin free to build products Vendors cannot.
- Because no save path validates the type, "simple only" is a UI limit, not a server guarantee.

## Recommendations

- Treat `array_keys( apply_filters( 'dokan_product_types', … ) )` as the authority for both display and acceptance of a product type in every save path.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
