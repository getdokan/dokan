# Product Ownership is the `wp_posts.post_author` column

Status: Accepted (retroactive — documents existing code)

## Context

Every marketplace feature needs to know which Vendor a product belongs to: the storefront query, the cart's shipping packages, the checkout split into Suborders, the Commission strategy chain, and every Ownership check in REST and the Abilities layer. Since a Vendor is a WordPress user ([ADR-0009](./0009-vendor-is-a-wordpress-user-with-the-seller-role.md)) and a product is a WooCommerce `product` post, there were two obvious places to store the link: a Dokan meta key such as `_vendor_id`, or WordPress's own `post_author` column.

## Decision

**[Lite]** A product belongs to the Vendor whose user id is in `wp_posts.post_author`. Lite adds no vendor-id product meta and no product-to-vendor table. Every resolver reads the column:

- `dokan_get_vendor_by_product()` (`lite:includes/Product/functions.php:553`) reads `post_author` (`:562`), falls back to the parent product's author for a variation with no author (`:564-566`), and passes the id through the `dokan_get_vendor_by_product` filter.
- `dokan_is_product_author()` (`lite:includes/functions.php:148`) compares `post_author` with `dokan_get_current_user_id()`, which resolves Vendor Staff to their Vendor. The comparison value is filterable through `dokan_is_product_author`.
- `dokan_get_sellers_by()` (`lite:includes/Order/functions.php:522`) groups an order's line items by the product's `post_author` (`:534`), filterable per item through `dokan_get_sellers_by`. This grouping drives the Suborder split ([ADR-0011](./0011-suborders-are-created-synchronously-at-checkout.md)).
- `Shipping\Hooks::split_shipping_packages` groups cart items into per-Vendor shipping packages by `post_author` (`lite:includes/Shipping/Hooks.php:51`) when Dokan Pro is not active.
- The store page product query sets `author_name` to the Vendor's `user_nicename` (`Rewrites::store_query_filter`).

Writers keep the column correct where WordPress or WooCommerce would otherwise assign the wrong user:

- WooCommerce's product data store inserts with `post_author = get_current_user_id()` inside the `woocommerce_new_product_data` filter (`wc:includes/data-stores/class-wc-product-data-store-cpt.php:209`). Dokan's editor flows create an `auto-draft` and set `post_author` to `dokan_get_current_user_id()` explicitly, so a Vendor Staff member's product is authored to the Vendor.
- `Product\Hooks::set_new_variation_author_to_vendor` (`lite:includes/Product/Hooks.php:73`) filters `woocommerce_new_product_variation_data` (fired at `wc:includes/data-stores/class-wc-product-variation-data-store-cpt.php:137`) so a new variation inherits its parent's Vendor even when a Store Admin creates it.
- `dokan_override_product_author()` (`lite:includes/functions.php:4363`) lets a Store Admin reassign a product and its variations from the WP-admin Vendor meta box.
- `DokanRESTController::update_post_author_if_needed()` (`lite:includes/Abstracts/DokanRESTController.php:510`) and `ProductAbilityScope::assign_vendor_as_product_author` (on `woocommerce_new_product`, fired at `wc:includes/data-stores/class-wc-product-data-store-cpt.php:263`) re-author REST- and ability-created products.
- `BackgroundProcess\RewriteVariableProductsAuthor` (`lite:includes/BackgroundProcess/RewriteVariableProductsAuthor.php:18`) realigns existing variation authors with their parent product.

Lite also filters `woocommerce_register_post_type_product` (`lite:includes/wc-template.php:152`; WooCommerce applies it at `wc:includes/class-wc-post-types.php:370`) to map the `edit_post` meta capability to `edit_product` for the product post type.

## Consequences

- Ownership is available without a join or a meta lookup: `WP_Query` with `author`, `WC_Product_Query`, `get_post_field( 'post_author' )` and core capability mapping all work as they do for ordinary posts. List scoping in REST is a plain `author` argument (`DokanRESTController::prepare_objects_query`, `lite:includes/Abstracts/DokanRESTController.php:333`).
- WordPress core's own notion of "author" lines up with Dokan's: the `seller` role's `edit_products` capability lets a Vendor edit their own products while lacking `edit_others_products`. [ADR-0006](./0006-ownership-enforced-in-abilities-layer.md) records why Dokan still enforces Ownership itself instead of relying only on that native mapping, and [ADR-0007](./0007-staff-actions-gated-by-dokan-capabilities.md) records how Vendor Staff are handled.
- A product has exactly one Vendor. Any feature in which several Vendors sell the same product needs its own mapping outside this column (such a seam is consumed by Dokan Pro).
- Anything that changes `post_author` changes Ownership, Commission attribution of future orders, and the Store the product appears in. There is no separate audit trail of reassignment beyond the `dokan_after_override_product_author` action.

## Risks

- **Default authorship is the current user.** Any product creation path that relies on WooCommerce's default (`get_current_user_id()`) and does not correct the author assigns the product to the acting user. For Vendor Staff on a path that does not re-author, the product would belong to the staff user rather than the Vendor. The products architecture document lists `ProductControllerV3::create_item` as a path whose staff re-authoring was not traced.
- **Variations need their own author.** Lookups fall back to the parent only when a variation has no author. A variation with a stale, non-empty author resolves to that user, which is why the variation-author filter and the background realignment exist.
- **Order line items are resolved at read time.** `dokan_get_sellers_by()` reads the product's current `post_author`. A product reassigned between cart and split, or a deleted product, changes or loses the attribution.

## Recommendations

- Route every new ownership read through `dokan_get_vendor_by_product()` or `dokan_is_product_author()` so that the filters and the variation fallback apply uniformly.
- Any new product creation path should set `post_author` to `dokan_get_current_user_id()` explicitly after the WooCommerce insert, mirroring the auto-draft and Abilities paths.

## Known gaps

- Whether every product creation path (legacy form, React editor, REST v1/v2/v3, Abilities, importers) re-authors Vendor Staff products to the Vendor was not exhaustively traced; see the Known gaps in `docs/adr/reference/products.md`.
- How third-party importers (for example WooCommerce's CSV importer) set `post_author` for Vendor products was not investigated.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
