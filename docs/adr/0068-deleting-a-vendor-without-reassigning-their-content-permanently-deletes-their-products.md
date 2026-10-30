# Deleting a Vendor without reassigning their content permanently deletes their products

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor is a WordPress user (Lite ADR 0009) and owns products through `post_author` (Lite ADR 0010). Deleting the user is the only way to remove a Vendor; Dokan has no separate "close store" state beyond disabling selling. WordPress lets the admin either delete a user's content or reassign it to another user. When nothing is reassigned, WordPress core deletes only posts of types that are flagged `delete_with_user` or support `author`, and WooCommerce's `product` post type does not declare `author` support (`wc:includes/class-wc-post-types.php:341`), so without Dokan a deleted Vendor's products would simply be left behind. Dokan adds two clean-up steps.

## Rule

When a Vendor is deleted **without** reassignment, their products are permanently deleted (never sent to the trash). When a Vendor is deleted **with** reassignment, WordPress moves all their posts, including every product in any status, to the chosen user, and Dokan deletes nothing.

How much is deleted depends on where the deletion runs:

- **From WP Admin (Users → Delete → "Delete all content").** Every product the Vendor authored is deleted, whatever its status, together with their published posts of other types:
  1. Dokan's `dokan_delete_user_details()` runs first on core `delete_user` (`lite:includes/functions.php:2774`, `:2785-2809`). It returns for non-Vendors, and when `$reassign` is `null` it loads `get_posts( [ 'numberposts' => -1, 'post_type' => 'any', 'author' => $user_id ] )` and calls `wp_delete_post( $id, true )` on each. `get_posts()` defaults `post_status` to `publish` when none is given (`wp-includes/post.php:2640-2641`), and `post_type => any` skips post types excluded from search, so this step force-deletes the Vendor's **published** posts of every searchable type (products, blog posts, pages).
  2. WordPress core then deletes the remaining posts of the types in its delete list (`wp-admin/includes/user.php:388-413`). In admin requests Dokan adds `product`, `product_variation`, `shop_order` and `shop_coupon` to that list for Vendors through the `post_types_to_delete_with_user` filter (`Admin\Hooks::add_wc_post_types_to_delete_user()`, `lite:includes/Admin/Hooks.php:34`, `:201-209`). Core calls `wp_delete_post()` without `$force_delete`, which only moves `post` and `page` to the trash (`wp-includes/post.php:3851-3856`), so the Vendor's draft, pending and private products, variations, and any order or coupon posts they authored are permanently deleted. Their unpublished blog posts and pages go to the trash.
- **Outside WP Admin (front end, cron, WP-CLI, code calling `wp_delete_user()` with no reassignment).** `Admin\Hooks` is only resolved when `is_admin()` is true (`lite:dokan-class.php:319-323`), so only step 1 runs: the Vendor's **published** posts are force-deleted, and their draft, pending and private products stay in the database with a `post_author` that no longer exists.
- **REST `DELETE /dokan/v1/stores/<id>`** (Store Admin only, `permission_check_for_manageable_part()`) declares `reassign` as a required integer (`lite:includes/REST/StoreController.php:76-85`), so it always reassigns: a non-zero value must be an existing user other than the Vendor (`:352-358`), and the call goes to `Vendor\Manager::delete( $vendor_id, $reassign )` → `wp_delete_user()` → `dokan_delete_vendor` (`lite:includes/Vendor/Manager.php:564-573`).
- **Reassignment.** With a reassign id, `wp_delete_user()` updates `post_author` on all of the user's posts to that id (`wp-admin/includes/user.php:423-425`), so the products now belong to the new user's Store. Dokan's clean-up only runs when `$reassign` is `null`.
- **Other clean-up.** Vendor caches are cleared on `delete_user` and `dokan_delete_vendor` (`lite:includes/Vendor/VendorCache.php:22`, `:30`). Add-ons may hook `delete_user`, `deleted_user` or `dokan_delete_vendor` for their own data.

## Settings that change it

None. The admin's choice between "Delete all content" and "Attribute all content to" on the WordPress delete screen, or the `reassign` value on the REST endpoint, is the only control.

## Worked example

Vendor V has 40 published products, 6 pending, 3 drafts and 2 published blog posts.

- In WP Admin the Store Admin deletes V and chooses "Delete all content". Dokan's `delete_user` handler force-deletes the 40 published products and the 2 published blog posts. WordPress core then deletes the 6 pending and 3 draft products permanently, because Dokan added `product` to the delete list. None of the 51 posts goes to the trash.
- The admin instead chooses "Attribute all content to" Vendor W. All 51 posts, including the 49 products, now have `post_author = W` and appear in W's Store according to their status.
- The same Vendor is deleted by custom code running on the front end with `wp_delete_user( V )`. Only the 40 published products and 2 published posts are force-deleted; the 6 pending and 3 draft products remain, owned by a user id that no longer exists.

## Edge cases

- **REST with `reassign = 0`.** `0` skips the existence check, and `wp_delete_user()` casts it to an integer reassignment, so the Vendor's posts are re-authored to user id `0` and Dokan's clean-up does not run. The products survive with no owner.
- **Batch delete.** The `/stores/batch` endpoint's `delete` list does not delete Vendors (see [ADR-0073](./0073-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).
- **Orders and money records.** Vendor orders stored in WooCommerce's order tables, `dokan_orders` rows, Balance entries and Withdraw records are not deleted by this rule; they keep the deleted Vendor's id. Only order and coupon *posts* whose `post_author` is the Vendor are caught by the admin delete list.
- **Store Admins.** Both clean-up steps apply to any user who passes `dokan_is_user_seller()`, which includes administrators and shop managers.

## Why

No recorded rationale for limiting the `delete_user` clean-up to published posts, or for registering the delete-list filter only in admin requests. The `delete_user` hook (`@since 2.6.9`) appears to exist because WordPress core would otherwise leave products behind.

## Consequences & risks

- "Delete all content" in WP Admin is irreversible for every product of the Vendor.
- The same deletion performed outside WP Admin leaves unpublished products orphaned, so the outcome depends on where the code runs.
- Reassignment can merge one Vendor's catalogue into another's Store, including products with different commission settings.

## Recommendations

- Register the `post_types_to_delete_with_user` filter in every context, or pass `post_status => 'any'` in the `delete_user` clean-up, so a Vendor's products are handled the same way wherever the deletion runs.
- Treat `reassign = 0` on the REST endpoint as "no reassignment" (`null`) or reject it.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
