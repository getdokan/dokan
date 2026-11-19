# A new Vendor product is published immediately only when the Vendor has Direct Publishing; otherwise it waits as pending review

Status: Accepted (retroactive — documents existing code)

## Context

A marketplace operator usually wants to look at what a new Vendor lists before buyers see it, but does not want to review every product of an established Vendor. Dokan expresses that choice as **Direct Publishing** (CONTEXT.md: "Whether a Vendor's products go live without marketplace review"). Direct Publishing is an **Operating Term**: the Store Admin grants it per Vendor, and a Vendor can never grant it to themselves.

Teammates ask "why is my new product pending?", "how do I let a Vendor publish without approval?" and "does Vendor Staff inherit the Vendor's publishing right?". This ADR answers those for the *initial* status of a product. Which statuses a Vendor may pick afterwards, and what happens when a published product is edited, are in [ADR-0079](./0079-a-vendor-can-choose-only-the-product-statuses-direct-publishing-allows-and-editing-a-published-product-keeps-it-published.md). How a pending product becomes live is in [ADR-0078](./0078-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md). Who owns the new product is recorded in Lite ADR 0011.

## Rule

- The default status of a product a Vendor creates is computed by `dokan_get_default_product_status( $seller_id )` (`lite:includes/functions.php::dokan_get_default_product_status()`):
  - The Vendor is resolved with `dokan_get_current_user_id()` when no id is passed, so Vendor Staff get their Vendor's answer, not their own.
  - `dokan_is_seller_trusted()` (`lite:includes/functions.php::dokan_is_seller_trusted()`) returns true only when the Vendor's user meta `dokan_publishing` is exactly `yes`.
  - Direct Publishing → `publish`; anything else (`no`, empty, missing) → `pending`.
  - The result passes through the deprecated filter `dokan_get_new_post_status` and then `dokan_get_default_product_status( $status, $seller_id, $is_trusted )`. Add-ons may replace the policy through that filter.
- Every Vendor creation path in Lite starts from this default, and a Vendor without Direct Publishing does not publish a new product by choosing a status:
  - Full "add new product" form: `Products::handle_product_add()` inserts the post with `post_status = dokan_get_default_product_status( dokan_get_current_user_id() )` (`lite:includes/Dashboard/Templates/Products.php::handle_product_add()`). The Vendor cannot choose a status on this form.
  - Legacy editor for a new product: the product starts as an `auto-draft`, and the status dropdown is pre-selected with the default (`lite:includes/Dashboard/Templates/Products.php::load_others_template()`, through the filter `dokan_post_edit_default_status`). The statuses it offers are those of [ADR-0079](./0079-a-vendor-can-choose-only-the-product-statuses-direct-publishing-allows-and-editing-a-published-product-keeps-it-published.md).
  - React product editor: for an `auto-draft` the status field value is the default, mapped to `publish`, `pending` or otherwise `draft`, and filtered through `dokan_post_edit_default_status` (`lite:includes/ProductEditor/FormSchema.php::resolve_field_value()`). On save, `ProductControllerV3::enforce_publish_moderation()` replaces a requested `publish` or `future` with the default unless the user has `manage_woocommerce`; for a Vendor without Selling Activation a requested `publish` or `future` becomes `pending` (`lite:includes/REST/ProductControllerV3.php::enforce_publish_moderation()`, called from `::prepare_object_for_database()`). A requested `draft` is kept in both cases.
  - Quick-create popup: the new product starts from the default status (`lite:includes/Product/functions.php::dokan_save_product()`).
  - REST `dokan/v1/products`: a requested `publish` is replaced by the default (`lite:includes/REST/ProductController.php::prepare_object_for_database()`).
  - REST `POST dokan/v3/products`: the same `enforce_publish_moderation()` applies; a create with no status (which WooCommerce would publish) also gets the default (`lite:includes/REST/ProductControllerV3.php::prepare_object_for_database()`).
- Direct Publishing is written only by Store Admin paths:
  - WP Admin → Users → Edit user, "Publishing" checkbox (`lite:includes/Admin/UserProfile.php::save_meta_fields()`, which returns unless the user has `manage_woocommerce` and then writes `dokan_publishing`).
  - Vendor create and update through `Vendor\Manager`, only inside a `current_user_can( 'manage_woocommerce' )` block, from the `trusted` field (`lite:includes/Vendor/Manager.php::create()`, `::update()`).
  - When an existing user becomes a Vendor through `dokan_user_update_to_seller()`, the meta is explicitly set to `no` (`lite:includes/functions.php::dokan_user_update_to_seller()`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| User meta `dokan_publishing` on the Vendor (Store Admin: WP Admin → Users → Edit user → "Publishing"; Vendor edit screen / `trusted` field of the store REST API) | `yes`, `no` or absent | absent for vendors created by registration; `no` when a user is converted to a Vendor | `yes`: new products default to `publish`. Any other value: new products default to `pending`. |
| `dokan_selling['product_status']` | `publish`, `pending` | `pending` | Written by an add-on's settings; Lite has no field for it. Lite reads it only for compatibility with an add-on version older than 3.8.3 (a version check inside `lite:includes/functions.php::dokan_get_default_product_status()`): a non-`publish` result is then replaced by this option. Newer add-ons may apply it through the `dokan_get_default_product_status` filter; a value of `publish` then publishes every Vendor's new products. With Lite alone it is never read. |
| `dokan_selling['one_step_product_create']` / `dokan_selling['disable_product_popup']` | `on` / `off` | `on` / `off` | Decide which creation path "Add new product" opens: with one-step creation on, the editor on a fresh `auto-draft` (`dokan_edit_product_url( 0 )`); otherwise the quick-create popup, or the full add form when the popup is disabled (`lite:templates/products/products-listing.php` (the `$new_product_url` choice), `lite:includes/functions.php::dokan_get_new_product_url()`). Every path starts from the same default (see the Rule). |

There is no global Lite setting that publishes every Vendor's products (an add-on's `product_status` option can, see above). Without Direct Publishing on the Vendor and without an add-on filter, a new product defaults to pending.

## Worked example

Two Vendors create a product from the legacy "Add new product" form with no add-on installed.

- Vendor A has `dokan_publishing = yes`. `dokan_is_seller_trusted( A )` is true, so `dokan_get_default_product_status()` returns `publish`. The product is live on the Store page as soon as the form is saved.
- Vendor B registered through the storefront and was never edited by the Store Admin, so `dokan_publishing` is absent. The function returns `pending`. The product is saved with `post_status = pending`; it is not visible to buyers, and the Store Admin receives the "Dokan New Pending Product" e-mail (see [ADR-0078](./0078-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md)).
- A Vendor Staff member of Vendor A creates a product. `dokan_get_current_user_id()` resolves to Vendor A, so the product is published even though the staff user has no `dokan_publishing` meta of their own.

## Edge cases

- **Variations** are created through WooCommerce's variation data store and follow their parent product's visibility; Dokan does not compute a separate default for them.
- **Draft on purpose.** A Vendor can still choose `draft` in either editor or through the APIs; the default only decides what is pre-selected (editors) or what a request for a live status becomes (full add form, quick-create, v1 and v3).
- **Changing Direct Publishing later** does not change the status of existing products. It only affects the next creation or the status options offered on the next edit.
- **Deprecated helper.** `dokan_get_new_post_status()` (`lite:includes/functions.php::dokan_get_new_post_status()`) is a thin alias of `dokan_get_default_product_status()`.
- **Selling Activation.** Disabling a Vendor's selling moves their *published* products to pending regardless of Direct Publishing; that is a separate rule, see [ADR-0070](./0070-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md). Creating a product requires Selling Activation: v1 create (`lite:includes/REST/ProductController.php::validation_before_create_item()`), v3 create (`lite:includes/REST/ProductControllerV3.php::create_item_permissions_check()`) and `init/fields` (`::init_form_fields()`) refuse a Vendor without it.
- **Every new Vendor starts without Direct Publishing.** Registration writes no `dokan_publishing` row, Become a Vendor writes `no`, and `Vendor\Manager::create()` writes `yes` only when a Store Admin passes `trusted = true` (`lite:includes/Vendor/Manager.php::create()`).
- **Partial Store Admin updates clear the flag.** `Vendor\Manager::update()` writes `dokan_publishing = no` when a Store Admin's payload omits `trusted` (see [ADR-0074](./0074-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).
- **Add-on policies.** Add-ons may narrow the initial status further (for example forcing `draft` when a Vendor's plan has no product slots left) or create products outside these paths (for example a duplicate saved as `draft`). They do so through the filters named in this ADR and in ADR-0079.
- **Store Admins acting as Vendors** get `publish` only if their own `dokan_publishing` is `yes`; when they create products from WP Admin, WooCommerce's own status handling applies instead.

## Why

The function's docblock describes it as "the default product status for new and edited product for seller based on settings", and the 3.8.2 refactor centralised what had been scattered status logic into this one function with a filter, so that add-ons can change the policy in one place. Defaulting to `pending` makes review the safe default: a Vendor only skips review when the Store Admin has explicitly granted Direct Publishing.

## Consequences & risks

- One filter, `dokan_get_default_product_status`, supplies the default for every Lite path, and an add-on that hooks it changes every path at once.
- Because the default is computed for the *acting Vendor*, staff accounts never need their own Direct Publishing flag.
- Store Admins who expect "trusted" to apply retroactively are surprised: granting Direct Publishing does not publish products that are already pending.

## Recommendations

- Any new product creation path should call `dokan_get_default_product_status()` for its initial status instead of hardcoding `publish` or `pending`, and should accept only the statuses `dokan_get_available_post_status()` offers.
- Consider removing the pre-3.8.3 compatibility branch once no supported add-on version needs it.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
