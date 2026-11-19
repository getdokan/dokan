# Dokan Lite lets Vendors create only simple products

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WooCommerce ships simple, variable, grouped and external/affiliate product types, and other plugins register more (subscriptions, auctions, bookings). A Store Admin can create any of them in WP Admin. Teammates ask "why can't my Vendors create variable products?" and "where is the list of product types a Vendor may choose?". In Dokan Lite the Vendor-facing answer is: only Simple, unless an add-on extends the list.

## Rule

- The product types a Vendor may create are the keys of the filter `dokan_product_types`, whose Lite default is `[ 'simple' => 'Simple' ]`. Every Vendor-facing consumer applies a Simple-only default:
  - legacy editor type selector (`templates/products/edit-product-single.php`, the `product_type` field; when the list is exactly Simple, a hidden `simple` field replaces the selector);
  - React editor type field (`lite:includes/ProductEditor/FormSchema.php::get_product_types()`);
  - product listing filter and v2 listing (`lite:includes/functions.php::dokan_product_listing_filter()`; `templates/products/products-listing.php`, the `$product_types` filter list; `lite:includes/REST/ProductControllerV2.php::prepare_objects_query()`);
  - the dashboard script data `product_types` (`lite:includes/Assets.php::enqueue_front_scripts()`). This consumer passes a different default shape: the list `[ 'simple' ]` (type slugs only), not the `type => label` map the other consumers pass. A callback on `dokan_product_types` therefore receives both shapes and must handle each.
- Saving defaults to `simple` when no type is posted: the full add form and the legacy update both write the `product_type` term from the posted `product_type`, falling back to `simple` (`lite:includes/Dashboard/Templates/Products.php::handle_product_add()`, `::handle_product_update()`); the quick-create popup does the same (`lite:includes/Product/functions.php::dokan_save_product()`).
- On a Lite-only site, the product-type filter on the Vendor's product listing is removed altogether (`Product\Hooks::remove_product_type_filter()` on `dokan_product_listing_filter_args`, `lite:includes/Product/Hooks.php::__construct()`, `::remove_product_type_filter()`).
- **Do not confuse with `dokan_get_product_types()`.** That function (`lite:includes/functions.php::dokan_get_product_types()`, filter `dokan_get_product_types`) returns *labels* for simple, variable, grouped and external products. It is used to display a product's type, not to decide what a Vendor may create. Add-ons that need "all types Dokan knows about" read it; the list of types a Vendor may *create* is `dokan_product_types`.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| Filter `dokan_product_types` | array `type => label` (the script-data consumer passes a list of slugs) | `[ 'simple' => 'Simple' ]` | Every key becomes selectable in both editors and the listing filter. Add-ons extend the list here (for example to add variable, grouped, external, subscription or auction types). |

There is no admin setting in Dokan Lite to choose the allowed product types.

## Worked example

A Lite-only marketplace. Vendor K opens the legacy editor for a new product. The type list is built from `apply_filters( 'dokan_product_types', [ 'simple' => 'Simple' ] )`; because it contains only Simple, the editor shows no type selector at all and posts a hidden `product_type = simple`. K saves; `product_type` is posted as `simple` (or empty, which also becomes `simple`), and the product is a WooCommerce simple product. In WP Admin, the Store Admin can still change that product to variable, because WP Admin is not limited by `dokan_product_types`.

## Edge cases

- **Admin-created types.** A product the Store Admin turns into a variable or grouped product in WP Admin keeps that type until the Vendor saves it in the legacy editor. When the filtered list is only Simple, that editor renders no visible selector but a hidden `product_type = simple` field (`templates/products/edit-product-single.php`, the `product_type` field), and the save handler writes that posted type back as the product's type (`lite:includes/Dashboard/Templates/Products.php::handle_product_update()`). A Vendor save therefore turns such a product back into a simple product.

## Why

No decision record exists. The free plugin ships the minimal product editor; richer product types (variations, grouped and external products) are offered by add-ons, which plug into the same filter.

## Consequences & risks

- `dokan_product_types` is the single place to widen or narrow the Vendor's choice; add-ons that offer extra types (or remove some, for example per subscription plan) all hook it, so their priorities interact.
- Product types created in WP Admin are outside this rule, which keeps the Store Admin free to build products Vendors cannot.
- The two default shapes passed to `dokan_product_types` (map and slug list) mean a callback written for one shape can break the other consumer.

## Recommendations

- Treat `array_keys( apply_filters( 'dokan_product_types', … ) )` as the authority for both display and acceptance of a product type in every save path.
- Pass the same `type => label` default from every consumer, including the dashboard script data.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
