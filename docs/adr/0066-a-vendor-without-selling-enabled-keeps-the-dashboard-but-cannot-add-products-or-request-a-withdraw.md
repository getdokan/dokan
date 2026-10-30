# A Vendor without selling enabled keeps the dashboard but cannot add products or request a withdraw

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Selling Activation (CONTEXT.md) is separate from holding the Vendor role: a Pending Vendor (never approved) and a disabled Vendor (approval withdrawn) are still Vendors with the `seller` role and the `dokandar` capability (Lite ADR 0009). Teammates are asked what such a Vendor can still do. Lite has no single "suspended" mode; instead individual screens and endpoints check `dokan_is_seller_enabled()` (`lite:includes/functions.php:1172-1177`). This ADR lists those checks so the intended rule is written down in one place.

## Rule

A Vendor whose selling is not enabled can still log in, open the Vendor dashboard, see a "not enabled" notice, and edit their store profile. They cannot create products and cannot request or cancel a withdraw. Their products are not on sale (see [ADR-0069](./0069-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md)) and their Store is not listed publicly (see [ADR-0072](./0072-only-approved-vendors-appear-in-public-store-listings.md)).

Checks that implement this:

| Area | Behaviour when not enabled | Code |
|---|---|---|
| Dashboard home, Orders, Settings, Withdraw pages | Show the `global/seller-warning` notice through `dokan_seller_not_enabled_notice()` | `lite:includes/Dashboard/Templates/Dashboard.php:49-53`, `Orders.php:38-43`, `Settings.php:42-47`, `Withdraw.php:190-195`; notice at `lite:includes/template-tags.php:464-466` |
| Product list "Add new product" button and empty-state call to action | Hidden | `lite:templates/products/products-listing.php:66`, `:283` |
| Classic new-product and edit-product forms | Not rendered | `lite:templates/products/new-product.php:154`, `lite:templates/products/edit-product-single.php:238` |
| React dashboard | `can_add_product` is false | `lite:includes/Assets.php:195` |
| REST product create (`dokan/v1/products`) | `400` "Your account is not enabled for selling" unless the caller has `manage_options` | `ProductController::validation_before_create_item()`, `lite:includes/REST/ProductController.php:383-385` |
| REST product editor form init (v3) | `401` | `ProductControllerV3::init_form_fields()`, `lite:includes/REST/ProductControllerV3.php:594-600` |
| Withdraw request (dashboard AJAX and REST `POST /dokan/v1/withdraw`) | `WP_Error` `dokan_withdraw_seller_not_enabled` | `Withdraw\Manager::is_valid_approval_request()`, `lite:includes/Withdraw/Manager.php:61-63`, called from `lite:includes/Withdraw/Hooks.php:205` and `lite:includes/REST/WithdrawController.php:474` |
| Store Admin approving a pending withdraw request (REST update with a status, REST batch approve) | Refused with the same error while the Vendor is not enabled | the same validator, called at `lite:includes/REST/WithdrawController.php:588` and `:699` |
| Withdraw request cancellation (dashboard) | Error "Your account is not enabled for selling" | `lite:includes/Dashboard/Templates/Withdraw.php:137-140` |
| Abilities (MCP / machine context) | A Store Admin who is also a Vendor counts as the acting Vendor only while their own selling is enabled | `lite:includes/Abilities/Definitions/CurrentVendor.php:94-95`, `lite:includes/Abilities/ProductAbilityScope.php:601-605` |

Not gated: viewing the dashboard, editing store settings, viewing existing orders, and the Earnings already on the Balance (the notice is shown above the page content; it does not replace it). An administrator (`manage_options`) can still create products for the Vendor through the REST product endpoint (the exception above).

Add-ons may add further gates by checking `dokan_is_seller_enabled()`, and may change its answer through the `dokan_is_seller_enabled` filter.

## Settings that change it

None directly. Whether a Vendor is enabled is decided by the onboarding setting and the Store Admin ([ADR-0065](./0065-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md), [ADR-0073](./0073-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).

## Worked example

Vendor V is disabled while holding a Balance of 120.00 and two processing Vendor orders. V can still log in and open the dashboard, where every main page shows the "not enabled" notice. V can open the two Vendor orders. A withdraw request for 100.00 (with the minimum withdraw limit at or below 100.00 and V's withdraw method active, so the earlier amount, balance and method checks pass) fails with "Vendor is not enabled for selling, please contact site admin", so the 120.00 stays on the Balance until V is enabled again. The "Add new product" button is gone, and a direct REST product create returns `400`.

## Edge cases

- **Existing orders keep flowing.** Disabling a Vendor does not cancel or reassign their open Vendor orders, and Earnings from them still reach the Balance when they complete. Only new purchases stop, because the products are no longer purchasable.
- **Store page URL.** The storefront route has no Selling Activation check (`Rewrites` and `lite:templates/store-header.php` do not call `dokan_is_seller_enabled()`), so `/store/<slug>/` still resolves; it shows the header and, once the background job described in the disabling ADR has run, none of the products that were moved to pending review.
- **Pending withdraw requests freeze too.** A request the Vendor placed before being disabled cannot be approved by the Store Admin until the Vendor is enabled again, because approval re-runs the same validation (see the table).
- **Admins as Vendors.** Administrators and shop managers hold `dokandar` but usually have no `dokan_enable_selling` row, so by this rule they are "not enabled" Vendors. The `manage_options` exception keeps REST product creation working for administrators (not shop managers); the dashboard's "Add new product" button and the classic product forms stay hidden for them.

## Why

No recorded decision. The per-screen checks were added over several releases (`@since 2.4` notices, later REST checks), which is why the behaviour is a list rather than a single gate.

## Consequences & risks

- New Vendor-facing features must add their own `dokan_is_seller_enabled()` check, or they will work for disabled Vendors. The table above is the reference for which features currently do.
- Because the Balance remains but withdraws are blocked, disabling a Vendor also freezes their payouts. Support should expect that question.

## Recommendations

- Consider a single gate (for example in the abilities layer, Lite ADR 0006) that every "create" or "money-out" action consults, instead of per-screen checks.
- Consider returning 404 for the Store page of a Pending Vendor, matching the rule that Pending Vendors are not public.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
