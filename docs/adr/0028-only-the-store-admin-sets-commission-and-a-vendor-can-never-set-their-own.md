# Only the Store Admin sets commission, and a Vendor can never set their own

Status: Accepted (retroactive — documents existing code)

## Context

CONTEXT.md lists Commission among the Operating Terms: terms a Vendor is subject to but may never set for themselves. Commission is stored in places a Vendor otherwise controls, namely the Vendor's own user meta and the post meta of the Vendor's own products, so it is worth stating explicitly which actors may write it and through which paths.

## Rule

Only a user with the WooCommerce store-management capability (`manage_woocommerce`) may write a Commission formula. A Vendor may read their own Vendor-level formula but never change it; Vendor staff can do neither (see Edge cases).

- **Product level.** The commission fields are rendered only for users with `manage_woocommerce` (`Product\Hooks::add_per_product_commission_options()`, `lite:includes/Product/Hooks.php:550-553`) and saved only for them (`save_per_product_commission_options()`, `:609-612`). Bulk edit checks the same capability (`Admin\Hooks::save_custom_bulk_edit_field()`, `lite:includes/Admin/Hooks.php:251-271`). These hooks run on the WooCommerce product edit screen in WP Admin, not on the Vendor dashboard product form.
- **Product level over REST.** A product saved through the REST API carries its submitted `meta_data` onto the product object. `Product\Hooks::protect_per_product_commission_meta()` runs on `woocommerce_rest_pre_insert_product_object` (`lite:includes/Product/Hooks.php:63`, `:651-680`), which fires after that meta is applied and before the product is saved. WooCommerce's own product routes fire it, and so do Dokan's (`lite:includes/REST/ProductController.php:1539`; `ProductControllerV3` extends WooCommerce's products controller). For a user with `manage_woocommerce` the filter returns the product unchanged. For anyone else it walks the keys listed by `Settings\Product::admin_only_meta_keys()` (`_per_product_admin_commission`, `_per_product_admin_commission_type`, `_per_product_admin_additional_fee`; `lite:includes/Commission/Settings/Product.php:39-45`) and puts each one back to its stored value, or removes it from the product when nothing is stored (`lite:includes/Product/Hooks.php:670-677`). The values the request sent for those keys are not saved.
- **Vendor level.** `Vendor\Manager::create()` and `update()` write `dokan_admin_percentage`, `dokan_admin_percentage_type`, `dokan_admin_additional_fee` and `admin_category_commission` only inside `if ( current_user_can( 'manage_woocommerce' ) )` (`lite:includes/Vendor/Manager.php:279-307`, `:400-443`). They read them from the request keys `admin_commission`, `admin_commission_type`, `admin_additional_fee` and `admin_category_commission` (`:292-306`, `:428-442`). The REST store update (`dokan/v1/stores/<id>`) passes its parameters to `Vendor\Manager::update()` (`lite:includes/REST/StoreController.php:432-442`), so the same check applies there. That `manage_woocommerce` check is the guard for this level. `StoreController::get_restricted_fields_for_update()` also removes a list of fields from the request for users without `manage_options` (`:434-440`, `:468-493`), but that list names the stored meta keys (`dokan_admin_percentage`, `dokan_admin_percentage_type`, `dokan_admin_additional_fee`) rather than the request keys `update()` reads. Of the four commission fields, only `admin_category_commission` appears under the same name in both, so only that one is actually removed.
- **Reading.** A Vendor's commission fields are meant to be shown only to an administrator (`manage_options`) or to that Vendor themself. `StoreController::prepare_item_for_response()` adds them only when `can_access_vendor_store()` authorizes the caller for that store (`lite:includes/REST/StoreController.php:750-759`) and then removes them again unless `can_view_commission_settings()` passes (`:769-773`, `:804-809`). `can_view_commission_settings()` answers the role half of that question (`:845-847`); its docblock states that callers must also confirm the user is authorized for the store in question, and that Vendor staff are excluded deliberately (`:835-843`). The store-categories endpoint combines both checks before adding commission data (`:1156`).
- **Global level.** The commission settings live in the Dokan admin settings (Lite ADR 0002), which only administrators can save.

Add-ons may write the Vendor level on the admin's behalf, for example when a marketplace sells packages that carry a commission; such writes go through `Vendor::save_commission_settings()` and fire `dokan_vendor_commission_settings_before_save` / `_after_save` (`lite:includes/Commission/Settings/Vendor.php:86-101`).

## Settings that change it

None. Capability assignments in WordPress decide who counts as an admin.

## Worked example

Not a money rule. Example of the intended behaviour: Vendor V submits a store update through the REST API with `admin_commission = 0`. Because V lacks `manage_woocommerce`, `Vendor\Manager::update()` skips the commission block and V's commission stays as the admin set it.

Product level: the admin gave product P by V 10 % and an empty flat fee in the product editor, so P stores `_per_product_admin_commission = 10` and `_per_product_admin_additional_fee = ''` (`Settings\Product::save()` writes all three keys, `lite:includes/Commission/Settings/Product.php:95-97`). V updates P through a REST product route with `meta_data` setting the percentage to `0` and the flat fee to `1`. Because V lacks `manage_woocommerce`, `protect_per_product_commission_meta()` puts both keys back to their stored values, `10` and `''`. P keeps 10 % + no flat fee, and the rest of V's update is saved as normal. On a product R that never had product commission, none of the keys is stored, so the filter removes V's entries and R stays without a product-level formula.

## Edge cases

- Vendor staff can neither read nor write commission through the REST store endpoint: the read check calls `dokan_is_user_seller( $user_id, true )`, which returns false for any user with the `vendor_staff` capability (`lite:includes/functions.php:77-83`), and writes require `manage_woocommerce` as described above.
- A user who is both a Vendor and an administrator can set their own commission, because the check is on capability, not on role.
- The REST filter is registered for the product object only, not for variation saves. A variation's own commission meta is never read when Commission is calculated (see [ADR-0021](./0021-a-variation-is-charged-the-commission-of-its-parent-product.md)).

## Why

CONTEXT.md defines Commission as an Operating Term; "the line they draw is between the marketplace and its Vendors" (`lite:CONTEXT.md:71-74`).

## Consequences & risks

- The capability check sits in the request handlers (the product editor hooks, `protect_per_product_commission_meta()` for REST product saves, `Vendor\Manager`), not in the commission settings classes, so every new write path for commission (a new REST field, an import, an add-on screen) must perform it. For product meta, `Settings\Product::admin_only_meta_keys()` is the shared list of keys to guard.

## Recommendations

- Consider expressing "may set commission" as an ability in the abilities layer described in Lite ADR 0006, so all write paths share one check.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
