# Only the Store Admin approves, disables, trusts or features a Vendor

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md lists Selling Activation, Direct Publishing and featured status among the Operating Terms: terms a Vendor is subject to but may never set for themselves. They are stored as scalar user meta on the Vendor's own account (`dokan_enable_selling`, `dokan_publishing`, `dokan_feature_seller`; Lite ADR 0009), next to fields the Vendor does edit, so it matters which write paths may touch them. The Commission Operating Term is covered separately in [ADR-0027](./0027-only-the-store-admin-sets-commission-and-a-vendor-can-never-set-their-own.md).

## Rule

Only a user with `manage_woocommerce` (the Store Admin) may approve a Vendor, disable a Vendor, grant or revoke Direct Publishing, or mark a Vendor featured. A Vendor or Vendor Staff can read their own status but never change it.

Write paths and their checks:

| Path | Check | What it writes |
|---|---|---|
| WP Admin → Users → Edit User, Dokan section | `Admin\UserProfile::save_meta_fields()` requires `manage_woocommerce` and the `dokan_update_user_profile_info` nonce (`lite:includes/Admin/UserProfile.php:528-535`) | Toggles Selling Activation through `Manager::activate()` / `deactivate()` only when it changed (`:571-579`); writes `dokan_publishing` and `dokan_feature_seller` from the checkboxes (`:581-582`) |
| WP Admin → Users list, "Approve Vendors" bulk action (shown on the Pending Vendors view) | `Admin\UserList::handle_bulk_actions()` requires `manage_woocommerce` (`lite:includes/Admin/UserList.php:130-137`) | `make_active()` for each selected `dokandar` user whose flag is not `yes` (`:140-159`) |
| REST `PUT /dokan/v1/stores/<id>/status` (`active` / `inactive`) | `permission_check_for_manageable_part()` = `manage_woocommerce` (`lite:includes/REST/StoreController.php:174-192`, `:519-521`) | `make_active()` / `make_inactive()` (`:1047-1068`) |
| REST `PUT /dokan/v1/stores/batch` (`approved` / `pending` lists) | same permission (`:196-204`) | `make_active()` / `make_inactive()` per Vendor (`:1086-1102`) |
| REST `POST /dokan/v1/stores` and `PUT /dokan/v1/stores/<id>` → `Vendor\Manager::create()` / `update()` | Operating Terms are applied only inside `if ( current_user_can( 'manage_woocommerce' ) )` (`lite:includes/Vendor/Manager.php:272-300`, `:381-424`). A Vendor may call `PUT /stores/<own id>` for their profile, but `enabled`, `trusted` and `featured` are ignored for them | `enabled` → activate/deactivate when changed (`:382-389`); `featured` → `dokan_feature_seller`; `trusted` → `dokan_publishing` |
| Vendor dashboard store settings | The save handler writes only profile fields (store name, address, phone, banner, terms, hours); no Operating Term is among them (`lite:includes/Dashboard/Templates/Settings.php:716-731`) | — |
| Reverse withdrawal (automatic, no user action) | Runs only when the Store Admin has enabled the "disable Vendor" failed-payment action for overdue reverse withdrawal balances (Lite ADR 0014) | `make_inactive()` when the balance becomes overdue and `make_active()` once it is paid (`lite:includes/ReverseWithdrawal/FailedActions.php:52-55`, `:83-86`, `:106-145`) |

All approval and disabling goes through `Vendor::make_active()` / `Vendor::make_inactive()`, which carry the side effects described in [ADR-0069](./0069-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md) and [ADR-0070](./0070-enabling-a-vendors-selling-can-be-vetoed-by-an-add-on-but-disabling-cannot.md).

Reading: the public REST store response hides `enabled` from callers who cannot access the Store (`StoreController::get_restricted_fields_for_view()`, `lite:includes/REST/StoreController.php:805-823`).

## Settings that change it

None. Who counts as a Store Admin is decided by WordPress capability assignments; by default `administrator` and `shop_manager` hold `manage_woocommerce`.

## Worked example

Not a money rule. Vendor V, who is Pending, sends `PUT /dokan/v1/stores/<V>` with `{"enabled": true, "trusted": true, "store_name": "V Shop"}`. `Vendor\Manager::update()` skips the Operating Terms block because V lacks `manage_woocommerce`; the store name is saved and V stays Pending and untrusted. The same request sent by a shop manager approves V (queueing the product status revert) and grants Direct Publishing.

## Edge cases

- **Omitted keys reset trusted and featured.** For a Store Admin, `Vendor\Manager::update()` writes `dokan_feature_seller = no` and `dokan_publishing = no` whenever `featured` / `trusted` are absent or false in the payload (`lite:includes/Vendor/Manager.php:391-401`). A partial admin update that only changes, say, the phone number clears both flags. `enabled` is different: it is applied only when present (`:382`).
- **The status endpoints do not check the current state.** `PUT /stores/<id>/status` and `/batch` call `make_active()` / `make_inactive()` even when the Vendor is already in that state, which re-runs the product status job and re-fires `dokan_vendor_enabled` / `dokan_vendor_disabled`.
- **Batch delete does nothing.** The `/batch` endpoint's `delete` list calls `dokan()->vendor->get( $id )->delete()` (`lite:includes/REST/StoreController.php:1104-1108`), but `Vendor` has no `delete()` method; the magic `__call()` only answers `get_*` names (`lite:includes/Vendor/Vendor.php:116-126`), so the call returns `null` and no Vendor is deleted. Single deletion through `DELETE /stores/<id>` works (see [ADR-0068](./0068-deleting-a-vendor-without-reassigning-their-content-permanently-deletes-their-products.md)).
- A user who is both a Vendor and a Store Admin can approve and trust themselves, because the check is on capability, not role.

## Why

CONTEXT.md defines these as Operating Terms; "the line they draw is between the marketplace and its Vendors, not between admin tiers".

## Consequences & risks

- The capability check lives in each request handler, not in `make_active()` / `make_inactive()` or the meta writers, so every new write path must repeat it.
- Admin tooling that sends partial store updates must always include `trusted` and `featured`, or it will silently revoke them.

## Recommendations

- Change `Vendor\Manager::update()` to touch `dokan_publishing` and `dokan_feature_seller` only when the key is present, matching how `enabled` is handled.
- Either implement `Vendor::delete()` (delegating to `Vendor\Manager::delete()`) or remove `delete` from the batch endpoint's allowed statuses.
- Consider moving "may change Operating Terms" into the abilities layer described in Lite ADR 0006.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
