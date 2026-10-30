# Only Approved Vendors appear in public store listings

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md defines an Approved Vendor as "a Vendor the marketplace has accepted, and the only kind that appears in public listings", and says a Pending Vendor "is not public information". Lite ADR 0009 records that Vendor queries go through `Vendor\Manager::get_vendors()` and that Approved means `dokan_enable_selling = yes`. This ADR states the listing rule itself and the places it applies, because "why is this store missing from the store list?" is a common question.

## Rule

Any store list shown to the public contains only Approved Vendors: users with the `seller` or `administrator` role and `dokan_enable_selling = yes`. Pending Vendors, whether they have a `no` row or no row at all, are listed only on Store Admin screens.

- **Default status.** `Vendor\Manager::get_vendors()` defaults to `status = [ 'approved' ]` and `role__in = [ 'seller', 'administrator' ]` (`lite:includes/Vendor/Manager.php:57-70`). For `approved` it adds the meta query `dokan_enable_selling = yes` (`:76-83`).
- **Unknown statuses fall back to Approved.** `Manager::resolve_status()` keeps only `all`, `approved` and `pending`; anything else becomes `approved`, so a typo never widens the result (`lite:includes/Vendor/Manager.php:139-147`).
- **Pending listing.** `status = pending` adds a correlated `NOT EXISTS` subquery that drops every Vendor with `dokan_enable_selling = yes`, so Vendors with no row are included (`Manager::exclude_approved_vendors()`, `lite:includes/Vendor/Manager.php:98-106`, `:161-174`). This is for the admin Vendors screen and the pending badge (`dokan_get_pending_vendor_count()`, `lite:includes/functions.php:3567-3594`). Because the default `role__in` includes `administrator`, an administrator without a `yes` flag is counted as Pending too, as that function's docblock states (`:3554-3558`).
- **Store list page.** The `[dokan-stores]` shortcode builds its arguments without a status (`lite:includes/Shortcodes/Stores.php:60-107`) and calls `dokan_get_sellers()` → `get_vendors()` (`lite:includes/functions.php:1421-1429`), so it lists Approved Vendors only. Its `featured = yes` attribute adds `dokan_feature_seller = yes` on top (`lite:includes/Vendor/Manager.php:86-93`); `with_products_only` adds `has_published_posts = [ 'product' ]`.
- **Public REST.** The public store collection `GET /dokan/v1/stores` is intended to follow the same rule for callers who are not Store Admins; the response also strips `enabled` and payment data from callers who cannot access the Store (`StoreController::get_restricted_fields_for_view()`, `lite:includes/REST/StoreController.php:805-823`).

Add-ons may narrow listings through `dokan_seller_listing_args`, `dokan_rest_get_stores_args` and a `store_category_query` argument applied on a `store_category` taxonomy that Lite itself does not register.

## Settings that change it

None. Featured status (`dokan_feature_seller`) only narrows a listing that asks for it; it never makes a Pending Vendor visible.

## Worked example

Five Vendors exist: A and B approved, C approved and featured, D disabled (`dokan_enable_selling = no`), E registered under `manually` (no row). The store list page shows A, B and C. `[dokan-stores featured="yes"]` shows only C. The admin's Pending tab shows D and E, and the pending badge shows 2, assuming the site's only administrator account has `dokan_enable_selling = yes`. If that administrator has no flag (the usual case), they are listed under Pending as well and the badge shows 3.

## Edge cases

- **Shop managers are not listed.** `shop_manager` holds `dokandar` and passes `dokan_is_user_seller()`, but is outside the default `role__in`, so an approved shop manager never appears in store lists (Lite ADR 0009, "Two definitions of Vendor").
- **Administrators are listed once approved.** An administrator with `dokan_enable_selling = yes` appears as a Store.
- **The Store page is not a listing.** A Pending or disabled Vendor's `/store/<slug>/` URL still resolves (see [ADR-0066](./0066-a-vendor-without-selling-enabled-keeps-the-dashboard-but-cannot-add-products-or-request-a-withdraw.md)).

## Why

The rule comes from the domain model (CONTEXT.md: Approved Vendor). The "unknown status falls back to approved" behaviour is recorded in `resolve_status()`: its docblock says anything unrecognised "falls back to the default rather than widening the result" (`lite:includes/Vendor/Manager.php:125-131`), and the inline comment reads "Never let a typo read as a wider set than the caller asked for" (`:142`).

## Consequences & risks

- Any new public listing must either call `get_vendors()` without a status or pass `approved` explicitly. Passing `all` from a public surface would expose Pending Vendors.
- Because Pending can mean "no row", direct SQL or meta queries for `dokan_enable_selling = no` undercount Pending Vendors.

## Recommendations

- Make every public listing entry point force `status = approved` for callers without `manage_woocommerce`, rather than relying on each caller's default.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
