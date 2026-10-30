# A new Vendor product is published immediately only when the Vendor has Direct Publishing; otherwise it waits as pending review

Status: Accepted (retroactive — documents existing code)

## Context

A marketplace operator usually wants to look at what a new Vendor lists before buyers see it, but does not want to review every product of an established Vendor. Dokan expresses that choice as **Direct Publishing** (CONTEXT.md: "Whether a Vendor's products go live without marketplace review"). Direct Publishing is an **Operating Term**: the Store Admin grants it per Vendor, and a Vendor can never grant it to themselves.

Teammates ask "why is my new product pending?", "how do I let a Vendor publish without approval?" and "does Vendor Staff inherit the Vendor's publishing right?". This ADR answers those for the *initial* status of a product. Which statuses a Vendor may pick afterwards, and what happens when a published product is edited, are in [ADR-0078](./0078-a-vendor-can-choose-only-the-product-statuses-direct-publishing-allows-and-editing-a-published-product-keeps-it-published.md). How a pending product becomes live is in [ADR-0077](./0077-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md). Who owns the new product is recorded in Lite ADR 0010.

## Rule

- The default status of a product a Vendor creates is computed by `dokan_get_default_product_status( $seller_id )` (`lite:includes/functions.php:533-550`):
  - The Vendor is resolved with `dokan_get_current_user_id()` when no id is passed (`:534`), so Vendor Staff get their Vendor's answer, not their own.
  - `dokan_is_seller_trusted()` (`lite:includes/functions.php:1186-1190`) returns true only when the Vendor's user meta `dokan_publishing` is exactly `yes`.
  - Direct Publishing → `publish`; anything else (`no`, empty, missing) → `pending` (`:536-540`).
  - The result passes through the deprecated filter `dokan_get_new_post_status` and then `dokan_get_default_product_status( $status, $seller_id, $is_trusted )` (`:547-549`). Add-ons may replace the policy through that filter.
- Every Vendor creation path in Lite uses this default:
  - Full "add new product" form: `Products::handle_product_add()` inserts the post with `post_status = dokan_get_default_product_status( dokan_get_current_user_id() )` (`lite:includes/Dashboard/Templates/Products.php:332-337`). The vendor cannot choose a status on this form.
  - Legacy editor for a new product: the product starts as an `auto-draft`, and the status dropdown is pre-selected with the default (`Products::load_others_template()`, `lite:includes/Dashboard/Templates/Products.php:178-187`, through the filter `dokan_post_edit_default_status`).
  - React product editor: for an `auto-draft` the status field value is the default, mapped to `publish`, `pending` or otherwise `draft`, and filtered through `dokan_post_edit_default_status` (`FormSchema::resolve_field_value()`, `lite:includes/ProductEditor/FormSchema.php:1198-1205`).
  - Quick-create popup: `dokan_save_product()` uses the default when no status is supplied (`lite:includes/Product/functions.php:56`).
  - REST `dokan/v1/products`: a requested `publish` is replaced by the default (`ProductController::prepare_object_for_database`, `lite:includes/REST/ProductController.php:1190-1206`).
- Direct Publishing is written only by Store Admin paths:
  - WP Admin → Users → Edit user, "Publishing" checkbox (`UserProfile::save_meta_fields()`, which returns unless the user has `manage_woocommerce`, `lite:includes/Admin/UserProfile.php:528-530`, writes `dokan_publishing` at `:581`).
  - Vendor create and update through `Vendor\Manager`, only inside a `current_user_can( 'manage_woocommerce' )` block, from the `trusted` field (`lite:includes/Vendor/Manager.php:271-283` on create, `:397-401` on update).
  - When an existing user becomes a Vendor through `dokan_user_update_to_seller()`, the meta is explicitly set to `no` (`lite:includes/functions.php:4457`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| User meta `dokan_publishing` on the Vendor (Store Admin: WP Admin → Users → Edit user → "Publishing"; Vendor edit screen / `trusted` field of the store REST API) | `yes`, `no` or absent | absent for vendors created by registration; `no` when a user is converted to a Vendor | `yes`: new products default to `publish`. Any other value: new products default to `pending`. |
| `dokan_selling['product_status']` | `publish`, `pending` | `pending` | Read by Lite only while an add-on older than version 3.8.3 is active (`lite:includes/functions.php:543-545`): a non-`publish` result is then replaced by this option. With no such add-on Lite never reads it. Newer add-ons apply their own policy through the `dokan_get_default_product_status` filter. |

There is no global Lite setting that publishes every Vendor's products. Without Direct Publishing on the Vendor (and without an add-on filter), new products are always pending.

## Worked example

Two Vendors create a product from the legacy "Add new product" form with no add-on installed.

- Vendor A has `dokan_publishing = yes`. `dokan_is_seller_trusted( A )` is true, so `dokan_get_default_product_status()` returns `publish`. The product is live on the Store page as soon as the form is saved.
- Vendor B registered through the storefront and was never edited by the Store Admin, so `dokan_publishing` is absent. The function returns `pending`. The product is saved with `post_status = pending`; it is not visible to buyers, and the Store Admin receives the "Dokan New Pending Product" e-mail (see [ADR-0077](./0077-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md)).
- A Vendor Staff member of Vendor A creates a product. `dokan_get_current_user_id()` resolves to Vendor A, so the product is published even though the staff user has no `dokan_publishing` meta of their own.

## Edge cases

- **Variations** are created through WooCommerce's variation data store and follow their parent product's visibility; Dokan does not compute a separate default for them.
- **Draft on purpose.** A Vendor can still choose `draft` in either editor; the default only decides what is pre-selected (editors) or forced (full add form, quick-create without a status).
- **Changing Direct Publishing later** does not change the status of existing products. It only affects the next creation or the status options offered on the next edit.
- **Deprecated helper.** `dokan_get_new_post_status()` (`lite:includes/functions.php:565-567`) is a thin alias of `dokan_get_default_product_status()`.
- **Selling Activation.** Disabling a Vendor's selling moves their *published* products to pending regardless of Direct Publishing; that is a separate rule, see [ADR-0069](./0069-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md).
- **Every new Vendor starts without Direct Publishing.** Registration writes no `dokan_publishing` row, Become a Vendor writes `no`, and `Vendor\Manager::create()` writes `yes` only when a Store Admin passes `trusted = true` (`lite:includes/Vendor/Manager.php:281-283`).
- **Partial Store Admin updates clear the flag.** `Vendor\Manager::update()` writes `dokan_publishing = no` when a Store Admin's payload omits `trusted` (see [ADR-0073](./0073-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).
- **Store Admins acting as Vendors** get `publish` only if their own `dokan_publishing` is `yes`; when they create products from WP Admin, WooCommerce's own status handling applies instead.

## Why

The function's docblock describes it as "the default product status for new and edited product for seller based on settings", and the 3.8.2 refactor centralised what had been scattered status logic into this one function with a filter, so that add-ons can change the policy in one place. Defaulting to `pending` makes review the safe default: a Vendor only skips review when the Store Admin has explicitly granted Direct Publishing.

## Consequences & risks

- One filter, `dokan_get_default_product_status`, controls the initial status across all Lite editors. An add-on that hooks it changes every path at once.
- Because the default is computed for the *acting Vendor*, staff accounts never need their own Direct Publishing flag.
- Store Admins who expect "trusted" to apply retroactively are surprised: granting Direct Publishing does not publish products that are already pending.

## Recommendations

- Any new product creation path should call `dokan_get_default_product_status()` for its initial status instead of hardcoding `publish` or `pending`, and should validate a caller-supplied status against `dokan_get_available_post_status()`.
- Consider removing the pre-3.8.3 compatibility branch once no supported add-on version needs it.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
