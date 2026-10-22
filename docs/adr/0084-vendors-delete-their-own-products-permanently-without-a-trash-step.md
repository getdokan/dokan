# Vendors delete their own products permanently, without a trash step

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WordPress normally moves deleted posts to the Trash, where they can be restored for 30 days. Teammates ask "can a Vendor restore a product they deleted?", "who may delete a product?" and "what happens to orders that contain a deleted product?". In the Vendor dashboard the action is labelled "Delete Permanently", and it means that.

## Rule

- **Who.** A product can be deleted from the Vendor dashboard only by a user who is a Vendor (or Vendor Staff of one), holds the `dokan_delete_product` capability, and passes Ownership (`dokan_is_product_author()`, Lite ADR 0006 and Lite ADR 0010). The `seller` role receives `dokan_delete_product` with all other Dokan capabilities on install (`lite:includes/Install/Installer.php:205-218`); Vendor Staff need it granted (Lite ADR 0007).
- **Single delete** (`Products::handle_delete_product()`, `lite:includes/Dashboard/Templates/Products.php:615-655`): requires the seller check, `dokan_delete_product`, the `dokan-delete-product` nonce and Ownership; then fires `dokan_product_delete`, calls `dokan()->product->delete( $product_id, true )` and fires `dokan_product_deleted`.
- **Bulk delete** (`Product\Hooks::bulk_product_delete()`, `lite:includes/Product/Hooks.php:284-299`): dispatched from the listing's bulk action with `dokan_delete_product` and the `bulk_product_status_change` nonce (`Product\Hooks::bulk_product_status_change()`, `:253-274`). Each id is deleted only if it passes Ownership; foreign ids are skipped silently. Wrapped in `dokan_product_bulk_delete` / `dokan_product_bulk_deleted`.
- **Permanent.** `Product\Manager::delete( $id, $force )` (`lite:includes/Product/Manager.php:487-494`) calls `WC_Product::delete( [ 'force_delete' => $force ] )`. With `true`, WooCommerce calls `wp_delete_post()` instead of `wp_trash_post()` (`wc:includes/data-stores/class-wc-product-data-store-cpt.php:422-431`). WordPress then removes the post, its meta and term relationships, and WooCommerce's `delete_post` listener, `WC_Post_Data::delete_post_data()`, force-deletes the product's child variations and its lookup-table rows (`wc:includes/class-wc-post-data.php:61`, `:406-422`).
- **REST.**
  - `dokan/v3/products/batch` (React editor): WooCommerce's batch handler always deletes with `force = true` (`wc:includes/rest-api/Controllers/Version3/class-wc-rest-controller.php:313-333`), after `ProductControllerV3::delete_item_permissions_check()` checks `dokan_delete_product` and Ownership per item (`lite:includes/REST/ProductControllerV3.php:144-153`).
  - `DELETE dokan/v1/products/{id}`: takes a `force` argument that **defaults to `false`** (`lite:includes/REST/ProductController.php:197-203`), so without it the product is trashed. Ownership is re-checked in `validation_before_delete_item()` (`:449-464`).
- Lite places no restriction based on order history: a product that appears in past orders can be deleted.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| Capability `dokan_delete_product` on the role or staff user | granted / not granted | granted to `seller`, `administrator`, `shop_manager` | Without it, the "Delete Permanently" row action is hidden (`dokan_product_get_row_action()`, `lite:includes/Product/functions.php:493-505`) and every delete path refuses. |
| `force` parameter on `DELETE dokan/v1/products/{id}` | `true` / `false` | `false` | `true`: permanent delete. `false`: the product is moved to the Trash. |

No admin setting switches the dashboard to trash-based deletion.

## Worked example

Vendor D selects products 101 (D's own, variable with three variations), 102 (D's own) and 205 (Vendor E's) in the dashboard listing and chooses Bulk action → Delete.

1. `bulk_product_status_change()` checks `dokan_delete_product` and the nonce, then fires `dokan_bulk_product_status_change( 'delete', [101, 102, 205] )`.
2. `bulk_product_delete()` deletes 101 and 102 with `force = true`. The three variations of 101 are deleted with it. 205 fails Ownership and is skipped.
3. D is redirected with "product deleted". Neither product can be restored from WP Admin → Products → Trash.

## Edge cases

- **Existing orders** keep their line items (name, price, quantity and the frozen Commission meta, Lite ADR 0012). The `product_id` on the line item now points to nothing, so reports and re-orders that load the product find none.
- **v1 trash response.** When v1 trashes (no `force`), WooCommerce sets the status to `trash` but keeps the id, and `DokanRESTController::delete_item()` judges success by the id being `0` (`lite:includes/Abstracts/DokanRESTController.php:225-232`), so the API answers with a "cannot be deleted" error although the product was trashed.
- **Store Admin deletes** made in WP Admin follow normal WordPress trash behaviour.

## Why

No decision record exists. Permanent deletion keeps the Vendor dashboard simple (no trash view for Vendors) and avoids trashed products lingering in the admin's product list.

## Consequences & risks

- A Vendor's mistaken delete cannot be undone by the Vendor or the admin without a database backup.
- Because deletion ignores order history, product-level analytics and "buy again" links for past orders lose the product.

## Recommendations

- Consider moving dashboard deletes to the Trash (with a Vendor-facing restore) or blocking permanent deletion of products that have orders.
- Make the v1 `delete_item()` success check aware of trashing, or default `force` to the dashboard's behaviour, so the API's answer matches what happened.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
