# Only the Store Admin approves, disables, trusts or features a Vendor

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md lists Selling Activation, Direct Publishing and featured status among the Operating Terms: terms a Vendor is subject to but may never set for themselves. They are stored as scalar user meta on the Vendor's own account (`dokan_enable_selling`, `dokan_publishing`, `dokan_feature_seller`; Lite ADR 0010), next to fields the Vendor does edit, so it matters which write paths may touch them. The Commission Operating Term is covered separately in [ADR-0028](./0028-only-the-store-admin-sets-commission-and-a-vendor-can-never-set-their-own.md).

## Rule

Only a user with `manage_woocommerce` (the Store Admin) may approve a Vendor, disable a Vendor, grant or revoke Direct Publishing, or mark a Vendor featured. A Vendor or Vendor Staff can read their own status but never change it.

Write paths and their checks:

| Path | Check | What it writes |
|---|---|---|
| WP Admin → Users → Edit User, Dokan section | `Admin\UserProfile::save_meta_fields()` requires `manage_woocommerce` and the `dokan_update_user_profile_info` nonce (`lite:includes/Admin/UserProfile.php:560-567`) | Toggles Selling Activation through `Manager::activate()` / `deactivate()` only when it changed (`:608-616`); writes `dokan_publishing` and `dokan_feature_seller` from the checkboxes (`:618-619`) |
| WP Admin → Users list, "Approve Vendors" bulk action (shown on the Pending Vendors view) | `Admin\UserList::handle_bulk_actions()` requires `manage_woocommerce` (`lite:includes/Admin/UserList.php:132-139`) | `make_active()` for each selected `dokandar` user whose flag is not `yes` (`:142-166`) |
| REST `PUT /dokan/v1/stores/<id>/status` (`active` / `inactive`) | `permission_check_for_manageable_part()` = `manage_woocommerce` (`lite:includes/REST/StoreController.php:181-199`, `:526-528`) | `make_active()` / `make_inactive()` (`:1046-1071`) |
| REST `PUT /dokan/v1/stores/batch` (`approved` / `pending` lists) | same permission (`:203-211`) | `make_active()` / `make_inactive()` per Vendor (`:1089-1119`) |
| REST `POST /dokan/v1/stores` and `PUT /dokan/v1/stores/<id>` → `Vendor\Manager::create()` / `update()` | Operating Terms are applied only inside `if ( current_user_can( 'manage_woocommerce' ) )` (`lite:includes/Vendor/Manager.php:279-307`, `:400-443`). A Vendor may call `PUT /stores/<own id>` for their profile, but `enabled`, `trusted` and `featured` are ignored for them | `enabled` → activate/deactivate when changed (`:401-408`); `featured` → `dokan_feature_seller`; `trusted` → `dokan_publishing` |
| Vendor dashboard store settings | The save handler writes only profile fields (store name, address, phone, banner, terms, hours); no Operating Term is among them (`lite:includes/Dashboard/Templates/Settings.php:716-731`) | — |
| Reverse withdrawal (automatic, no user action) | Runs only when the Store Admin has enabled the "disable Vendor" failed-payment action for overdue reverse withdrawal balances (Lite ADR 0015) | `make_inactive()` when the balance becomes overdue and `make_active()` once it is paid (`lite:includes/ReverseWithdrawal/FailedActions.php:52-55`, `:83-86`, `:106-145`) |
| Sign-up (automatic, no user action) | Follows the Enable Selling setting, which only the Store Admin sets ([ADR-0066](./0066-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md)) | `make_active()` under `automatically`; under `manually` the Vendor stays Pending |

All approval and disabling goes through `Vendor::make_active()` / `Vendor::make_inactive()`, which carry the side effects described in [ADR-0070](./0070-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md) and [ADR-0071](./0071-enabling-a-vendors-selling-can-be-vetoed-by-an-add-on-but-disabling-cannot.md).

On a multisite network a Store Admin who is not a super admin can approve, disable, trust or feature only users who are members of the current site and are not super admins themselves (`VendorUtil::current_user_can_manage_vendor()`, `lite:includes/Utilities/VendorUtil.php:145-152`). This check runs in the Users list "Approve Vendors" bulk action and in the REST store update, status and batch endpoints (`lite:includes/Admin/UserList.php:155`, `lite:includes/REST/StoreController.php:389`, `:1057`, `:1098`).

Reading: the public REST store response hides `enabled` from callers who cannot access the Store (`StoreController::get_restricted_fields_for_view()`, `lite:includes/REST/StoreController.php:812-830`).

## Settings that change it

None directly. Who counts as a Store Admin is decided by WordPress capability assignments; by default `administrator` and `shop_manager` hold `manage_woocommerce`. Automatic approval at sign-up follows the Enable Selling setting (see the Sign-up row above).

## Worked example

Not a money rule. Vendor V, who is Pending, sends `PUT /dokan/v1/stores/<V>` with `{"enabled": true, "trusted": true, "store_name": "V Shop"}`. `Vendor\Manager::update()` skips the Operating Terms block because V lacks `manage_woocommerce`; the store name is saved and V stays Pending and untrusted. The same request sent by a shop manager approves V (queueing the product status revert) and grants Direct Publishing.

## Edge cases

- A user who is both a Vendor and a Store Admin can approve and trust themselves, because the check is on capability, not role.
- **Omitted keys reset trusted and featured.** For a Store Admin, `Vendor\Manager::update()` writes `dokan_feature_seller = no` and `dokan_publishing = no` whenever `featured` / `trusted` are absent or false in the payload (`lite:includes/Vendor/Manager.php:410-420`). A partial Store Admin update that only changes, say, the store name clears both. `enabled` is different: it is applied only when present (`:401`).
- **Batch delete does nothing.** The `/batch` endpoint's `delete` list calls `dokan()->vendor->get( $id )->delete()` (`lite:includes/REST/StoreController.php:1121-1125`), but `Vendor` has no `delete()` method; the magic `__call()` only answers `get_*` names (`lite:includes/Vendor/Vendor.php:116-126`), so no Vendor is deleted. Single deletion through `DELETE /stores/<id>` works (see [ADR-0069](./0069-deleting-a-vendor-without-reassigning-their-content-permanently-deletes-their-products.md)).

## Why

CONTEXT.md defines these as Operating Terms; "the line they draw is between the marketplace and its Vendors, not between admin tiers". The multisite condition dates from 5.3.3.

## Consequences & risks

- The capability check lives in each request handler, not in `make_active()` / `make_inactive()` or the meta writers, so every new write path must repeat it.

## Recommendations

- Consider moving "may change Operating Terms" into the abilities layer described in Lite ADR 0006.

_Verified against Lite @1808fb2ac / Pro @965848058 / WooCommerce 11.2.1 — 2026-11-13._
