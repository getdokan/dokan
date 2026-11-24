# A Vendor without selling enabled keeps the dashboard but cannot add products or request a withdraw

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Selling Activation (CONTEXT.md) is separate from holding the Vendor role: a Pending Vendor (never approved) and a disabled Vendor (approval withdrawn) are still Vendors with the `seller` role and the `dokandar` capability (Lite ADR 0010). Teammates are asked what such a Vendor can still do. Lite has no single "suspended" mode; instead individual screens and endpoints check `dokan_is_seller_enabled()` (`lite:includes/functions.php::dokan_is_seller_enabled()`). This ADR lists those checks so the intended rule is written down in one place.

## Rule

A Vendor whose selling is not enabled can still log in, open the Vendor dashboard, see a "not enabled" notice, and edit their store profile. They cannot create products and cannot request or cancel a withdraw. Their products are not on sale (see [ADR-0070](./0070-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md)) and their Store is not listed publicly (see [ADR-0073](./0073-only-approved-vendors-appear-in-public-store-listings.md)).

Checks that implement this:

| Area | Behaviour when not enabled | Code |
|---|---|---|
| Dashboard home, Orders, Settings, Withdraw pages | Show the `global/seller-warning` notice through `dokan_seller_not_enabled_notice()` | `lite:includes/Dashboard/Templates/Dashboard.php::show_seller_dashboard_notice()`, `lite:includes/Dashboard/Templates/Orders.php::show_seller_enable_message()`, `lite:includes/Dashboard/Templates/Settings.php::show_enable_seller_message()`, `lite:includes/Dashboard/Templates/Withdraw.php::show_seller_enable_message()`; notice in `lite:includes/template-tags.php::dokan_seller_not_enabled_notice()` |
| Product list "Add new product" button and empty-state call to action | Hidden | `lite:templates/products/products-listing.php` (the "Add new product" link and the empty-state message) |
| Classic new-product and edit-product forms | Not rendered | `lite:templates/products/new-product.php` (the new-product form), `lite:templates/products/edit-product-single.php` (the edit form) |
| React dashboard | `can_add_product` is false | `lite:includes/Assets.php::add_product_listing_localized_args()` |
| REST product create (`dokan/v1/products`) | `400` "Your account is not enabled for selling" unless the caller has `manage_options` | `lite:includes/REST/ProductController.php::validation_before_create_item()` |
| REST product create (`dokan/v3/products`) | `403` "Your account is not enabled for selling." unless the caller has `manage_woocommerce` | `lite:includes/REST/ProductControllerV3.php::create_item_permissions_check()` |
| REST product publish or schedule (`dokan/v3/products`) | The product is saved as `pending` instead, unless the caller has `manage_woocommerce` | `lite:includes/REST/ProductControllerV3.php::enforce_publish_moderation()` |
| REST product editor form init (v3) | `401` | `lite:includes/REST/ProductControllerV3.php::init_form_fields()` |
| Withdraw request (dashboard AJAX and REST `POST /dokan/v1/withdraw`) | `WP_Error` `dokan_withdraw_seller_not_enabled` | `lite:includes/Withdraw/Manager.php::is_valid_approval_request()`, called from `lite:includes/Withdraw/Hooks.php::ajax_handle_withdraw_request()` and `lite:includes/REST/WithdrawController.php::create_item()` |
| Store Admin updating a withdraw request over REST (any single-item `PUT`, with or without a new status, so approving and also editing the amount, method or note) and REST batch approve | Refused with the same error while the Vendor is not enabled, because every Store Admin single-item update re-runs the full request validation | the same validator, called from `lite:includes/REST/WithdrawController.php::update_item()` and `::batch_items()` |
| Withdraw request cancellation | Error "Your account is not enabled for selling" | `lite:includes/Dashboard/Templates/Withdraw.php::handle_cancel_request()` |
| Abilities (MCP / machine context) | A Store Admin who is also a Vendor counts as the acting Vendor only while their own selling is enabled | `lite:includes/Abilities/Definitions/CurrentVendor.php::execute()`, `lite:includes/Abilities/ProductAbilityScope.php::resolve_create_vendor()` |

Not gated: viewing the dashboard, editing store settings, viewing existing orders, and the Earnings already on the Balance (the notice is shown above the page content; it does not replace it). The REST product endpoints keep an exception (see the table): on `dokan/v1` a caller with `manage_options` can still create products for the Vendor, and on `dokan/v3` a caller with `manage_woocommerce` can.

Add-ons may add further gates by checking `dokan_is_seller_enabled()`, and may change its answer through the `dokan_is_seller_enabled` filter.

## Settings that change it

None directly. Whether a Vendor is enabled is decided by the onboarding setting and the Store Admin ([ADR-0066](./0066-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md), [ADR-0074](./0074-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).

## Worked example

Vendor V is disabled while holding a Balance of 120.00 and two processing Vendor orders. V can still log in and open the dashboard, where every main page shows the "not enabled" notice. V can open the two Vendor orders. A withdraw request for 100.00 (with the minimum withdraw limit at or below 100.00 and V's withdraw method active, so the earlier amount, balance and method checks pass) fails with "Vendor is not enabled for selling, please contact site admin", so the 120.00 stays on the Balance until V is enabled again. The "Add new product" button is gone, and a direct REST product create is refused (`400` on `dokan/v1`, `403` on `dokan/v3`).

## Edge cases

- **Existing orders keep flowing.** Disabling a Vendor does not cancel or reassign their open Vendor orders, and Earnings from them still reach the Balance when they complete. Only new purchases stop, because the products are no longer purchasable.
- **Pending withdraw requests freeze too.** A request the Vendor placed before being disabled cannot be approved, or otherwise edited over REST, by the Store Admin until the Vendor is enabled again, because every Store Admin single-item update re-runs the same validation whether or not it changes the status (see the table).
- **Admins as Vendors.** Administrators and shop managers hold `dokandar` but usually have no `dokan_enable_selling` row, so by this rule they are "not enabled" Vendors. The `manage_options` exception keeps `dokan/v1/products` creation working for administrators (not shop managers); the dashboard's "Add new product" button and the classic product forms stay hidden for them.

## Why

No recorded decision. The per-screen checks were added over several releases (`@since 2.4` notices, later REST checks, the `dokan/v3` create and publish gates in 5.3.3), which is why the behaviour is a list rather than a single gate.

## Consequences & risks

- New Vendor-facing features must add their own `dokan_is_seller_enabled()` check, or they will work for disabled Vendors. The table above is the reference for which features currently do.
- Because the Balance remains but withdraws are blocked, disabling a Vendor also freezes their payouts. Support should expect that question.

## Recommendations

- Consider a single gate (for example in the abilities layer, Lite ADR 0006) that every "create" or "money-out" action consults, instead of per-screen checks.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
