# Only the Store Admin sets commission, and a Vendor can never set their own

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md lists Commission among the Operating Terms: terms a Vendor is subject to but may never set for themselves. Commission is stored in places a Vendor otherwise controls, namely the Vendor's own user meta and the post meta of the Vendor's own products, so it is worth stating explicitly which actors may write it and through which paths.

## Rule

Only a user with the WooCommerce store-management capability (`manage_woocommerce`) may write a Commission formula. A Vendor, or Vendor staff, may read their own Vendor-level formula but never change it.

- **Product level.** The commission fields are rendered only for users with `manage_woocommerce` (`Product\Hooks::add_per_product_commission_options()`, `lite:includes/Product/Hooks.php:504-508`) and saved only for them (`save_per_product_commission_options()`, `:563-566`). Bulk edit checks the same capability (`Admin\Hooks::save_custom_bulk_edit_field()`, `lite:includes/Admin/Hooks.php:251-271`). These hooks run on the WooCommerce product edit screen in WP Admin, not on the Vendor dashboard product form.
- **Vendor level.** `Vendor\Manager::create()` and `update()` write `dokan_admin_percentage`, `dokan_admin_percentage_type`, `dokan_admin_additional_fee` and `admin_category_commission` only inside `if ( current_user_can( 'manage_woocommerce' ) )` (`lite:includes/Vendor/Manager.php:272-299`, `:380-423`). The REST store update (`dokan/v1/stores/<id>`) passes its parameters to `Vendor\Manager::update()` (`lite:includes/REST/StoreController.php:425-435`), so the same check applies there.
- **Reading.** A Vendor's commission fields are meant to be shown only to an administrator (`manage_options`) or to that Vendor themself. `StoreController::can_view_commission_settings()` answers the role half of that question (`lite:includes/REST/StoreController.php:838-840`); its docblock states that callers must also confirm the user is authorized for the store in question, and that Vendor staff are excluded deliberately (`:828-833`). The store-categories endpoint combines both checks before adding commission data (`:1139`).
- **Global level.** The commission settings live in the Dokan admin settings (Lite ADR 0002), which only administrators can save.

Add-ons may write the Vendor level on the admin's behalf, for example when a marketplace sells packages that carry a commission; such writes go through `Vendor::save_commission_settings()` and fire `dokan_vendor_commission_settings_before_save` / `_after_save` (`lite:includes/Commission/Settings/Vendor.php:86-101`).

## Settings that change it

None. Capability assignments in WordPress decide who counts as an admin.

## Worked example

Not a money rule. Example of the intended behaviour: Vendor V submits a store update through the REST API with `admin_commission = 0`. Because V lacks `manage_woocommerce`, `Vendor\Manager::update()` skips the commission block and V's commission stays as the admin set it.

## Edge cases

- Vendor staff can neither read nor write commission through the REST store endpoint: the read check calls `dokan_is_user_seller( $user_id, true )`, which returns false for any user with the `vendor_staff` capability (`lite:includes/functions.php:77-83`), and writes require `manage_woocommerce` as described above.
- A user who is both a Vendor and an administrator can set their own commission, because the check is on capability, not on role.

## Why

CONTEXT.md defines Commission as an Operating Term; "the line they draw is between the marketplace and its Vendors" (`lite:CONTEXT.md:61-63`).

## Consequences & risks

- The capability check sits in the request handlers (product hooks, `Vendor\Manager`), not in the commission settings classes, so every new write path for commission (a new REST field, an import, an add-on screen) must perform it.

## Recommendations

- Consider expressing "may set commission" as an ability in the abilities layer described in Lite ADR 0006, so all write paths share one check.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
