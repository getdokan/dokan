# A new Vendor product is published immediately only when the Vendor has Direct Publishing; otherwise it waits as pending review

Status: Accepted (retroactive — documents existing code)

## Context

A marketplace operator usually wants to look at what a new Vendor lists before buyers see it, but does not want to review every product of an established Vendor. Dokan expresses that choice as **Direct Publishing** (CONTEXT.md: "Whether a Vendor's products go live without marketplace review"). Direct Publishing is an **Operating Term**: the Store Admin grants it per Vendor, and a Vendor can never grant it to themselves.

Teammates ask "why is my new product pending?", "how do I let a Vendor publish without approval?" and "does Vendor Staff inherit the Vendor's publishing right?". This ADR answers those for the *initial* status of a product. Which statuses a Vendor may pick afterwards, and what happens when a published product is edited, are in [ADR-0079](./0079-a-vendor-can-choose-only-the-product-statuses-direct-publishing-allows-and-editing-a-published-product-keeps-it-published.md). How a pending product becomes live is in [ADR-0078](./0078-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md). Who owns the new product is recorded in Lite ADR 0011.

## Rule

- The default status of a product a Vendor creates is computed by `dokan_get_default_product_status( $seller_id )` (`lite:includes/functions.php:533-550`):
  - The Vendor is resolved with `dokan_get_current_user_id()` when no id is passed (`:534`), so Vendor Staff get their Vendor's answer, not their own.
  - `dokan_is_seller_trusted()` (`lite:includes/functions.php:1186-1190`) returns true only when the Vendor's user meta `dokan_publishing` is exactly `yes`.
  - Direct Publishing → `publish`; anything else (`no`, empty, missing) → `pending` (`:536-540`).
  - The result passes through the deprecated filter `dokan_get_new_post_status` and then `dokan_get_default_product_status( $status, $seller_id, $is_trusted )` (`:547-549`). Add-ons may replace the policy through that filter.
- Every Vendor creation path in Lite starts from this default, but only some enforce it on save:
  - Full "add new product" form: `Products::handle_product_add()` inserts the post with `post_status = dokan_get_default_product_status( dokan_get_current_user_id() )` (`lite:includes/Dashboard/Templates/Products.php:332-337`). The vendor cannot choose a status on this form.
  - Legacy editor for a new product: the product starts as an `auto-draft`, and the status dropdown is pre-selected with the default (`Products::load_others_template()`, `lite:includes/Dashboard/Templates/Products.php:178-187`, through the filter `dokan_post_edit_default_status`). The save handler `handle_product_update()` then writes whatever `post_status` is posted (`:476`, `:534`, `:543`) without checking it against `dokan_get_available_post_status()`, so in Lite alone the default is only a pre-selection here.
  - React product editor: for an `auto-draft` the status field value is the default, mapped to `publish`, `pending` or otherwise `draft`, and filtered through `dokan_post_edit_default_status` (`FormSchema::resolve_field_value()`, `lite:includes/ProductEditor/FormSchema.php:1198-1205`). On save, `ProductControllerV3::enforce_publish_moderation()` replaces a requested `publish` or `future` with the default unless the user has `manage_woocommerce`; a Vendor without Selling Activation always gets `pending` (`lite:includes/REST/ProductControllerV3.php:395-410`, called at `:358`).
  - Quick-create popup: `dokan_save_product()` uses the default only when no status is supplied; a posted `post_status` is saved as given (`lite:includes/Product/functions.php:56`).
  - REST `dokan/v1/products`: a requested `publish` is replaced by the default (`ProductController::prepare_object_for_database`, `lite:includes/REST/ProductController.php:1245-1261`).
  - REST `POST dokan/v3/products`: the same `enforce_publish_moderation()` applies; a create with no status (which WooCommerce would publish) also gets the default (`lite:includes/REST/ProductControllerV3.php:357-358`).
- Direct Publishing is written only by Store Admin paths:
  - WP Admin → Users → Edit user, "Publishing" checkbox (`UserProfile::save_meta_fields()`, which returns unless the user has `manage_woocommerce`, `lite:includes/Admin/UserProfile.php:560-562`, writes `dokan_publishing` at `:618`).
  - Vendor create and update through `Vendor\Manager`, only inside a `current_user_can( 'manage_woocommerce' )` block, from the `trusted` field (`lite:includes/Vendor/Manager.php:279-290` on create, `:400-420` on update, the `trusted` write at `:416-420`).
  - When an existing user becomes a Vendor through `dokan_user_update_to_seller()`, the meta is explicitly set to `no` (`lite:includes/functions.php:4457`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| User meta `dokan_publishing` on the Vendor (Store Admin: WP Admin → Users → Edit user → "Publishing"; Vendor edit screen / `trusted` field of the store REST API) | `yes`, `no` or absent | absent for vendors created by registration; `no` when a user is converted to a Vendor | `yes`: new products default to `publish`. Any other value: new products default to `pending`. |
| `dokan_selling['product_status']` | `publish`, `pending` | `pending` | Read by Lite only while Dokan Pro older than 3.8.3 is active (`dokan()->is_pro_exists()` and `DOKAN_PRO_PLUGIN_VERSION`, `lite:includes/functions.php:543-545`): a non-`publish` result is then replaced by this option. Dokan Pro 3.8.3+ applies the same option through its `dokan_get_default_product_status` callback `Products::new_product_status()` (`pro:includes/Products.php:68`, `:1155-1161`): every Vendor without Direct Publishing gets this value, so setting it to `publish` publishes every Vendor's new products. With Lite alone it is never read. |
| `dokan_selling['one_step_product_create']` / `dokan_selling['disable_product_popup']` | `on` / `off` | `on` / `off` | Decide which creation path "Add new product" opens: with one-step creation on, the editor on a fresh `auto-draft` (`dokan_edit_product_url( 0 )`); otherwise the quick-create popup, or the full add form when the popup is disabled (`lite:templates/products/products-listing.php:38-40`, `dokan_get_new_product_url()` `lite:includes/functions.php:4470-4479`). The paths enforce the default differently (see the Rule). |

There is no global Lite setting that publishes every Vendor's products (Dokan Pro's `product_status` option does, see above). Without Direct Publishing on the Vendor and without an add-on filter, a new product defaults to pending; whether a Vendor can still post `publish` depends on the path (see the Rule and Edge cases).

## Worked example

Two Vendors create a product from the legacy "Add new product" form with no add-on installed.

- Vendor A has `dokan_publishing = yes`. `dokan_is_seller_trusted( A )` is true, so `dokan_get_default_product_status()` returns `publish`. The product is live on the Store page as soon as the form is saved.
- Vendor B registered through the storefront and was never edited by the Store Admin, so `dokan_publishing` is absent. The function returns `pending`. The product is saved with `post_status = pending`; it is not visible to buyers, and the Store Admin receives the "Dokan New Pending Product" e-mail (see [ADR-0078](./0078-a-pending-vendor-product-goes-live-only-when-a-store-admin-publishes-it-and-each-side-is-emailed-once.md)).
- A Vendor Staff member of Vendor A creates a product. `dokan_get_current_user_id()` resolves to Vendor A, so the product is published even though the staff user has no `dokan_publishing` meta of their own.

## Edge cases

- **Variations** are created through WooCommerce's variation data store and follow their parent product's visibility; Dokan does not compute a separate default for them.
- **Draft on purpose.** A Vendor can still choose `draft` in either editor; the default only decides what is pre-selected (editors) or forced (full add form, quick-create without a status, a v1 or v3 request for `publish`).
- **Posted status is not validated (Lite alone).** The legacy editor save and quick-create write the posted status as given, so a Vendor without Direct Publishing who posts `publish` (or `future` with a past date, which WordPress publishes) skips review. Dokan Pro's `Products::change_product_status()` on `dokan_update_product_post_data` replaces a posted `publish` in the legacy editor with the default (`pro:includes/Products.php:51`, `:556-578`), but lets `future` and `private` through and does not cover quick-create.
- **Changing Direct Publishing later** does not change the status of existing products. It only affects the next creation or the status options offered on the next edit.
- **Deprecated helper.** `dokan_get_new_post_status()` (`lite:includes/functions.php:565-567`) is a thin alias of `dokan_get_default_product_status()`.
- **Selling Activation.** Disabling a Vendor's selling moves their *published* products to pending regardless of Direct Publishing; that is a separate rule, see [ADR-0070](./0070-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md). Creating a product without Selling Activation is refused only by v1 create (`lite:includes/REST/ProductController.php:383-385`), v3 create (`lite:includes/REST/ProductControllerV3.php:55-57`) and `init/fields` (`:627`); v3 also forces `pending` for such a Vendor. The legacy editor, full add form and quick-create have no server-side check; their templates only hide the form (`lite:templates/products/edit-product-single.php:237-238`, `lite:templates/products/new-product.php:154`).
- **Every new Vendor starts without Direct Publishing.** Registration writes no `dokan_publishing` row, Become a Vendor writes `no`, and `Vendor\Manager::create()` writes `yes` only when a Store Admin passes `trusted = true` (`lite:includes/Vendor/Manager.php:288-290`).
- **Partial Store Admin updates clear the flag.** `Vendor\Manager::update()` writes `dokan_publishing = no` when a Store Admin's payload omits `trusted` (see [ADR-0074](./0074-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).
- **Dokan Pro product limit.** With the subscription module, a Vendor whose pack has no products left gets a legacy-editor save of a product that is not already `publish` or `pending` forced to `draft`, and is offered only Draft (`pro:modules/subscription/module.php:94-95`, `:661-680`, `:692-712`).
- **Dokan Pro duplicate** creates a `draft` clone (with `_dokan_new_product_email_sent = no`) regardless of Direct Publishing, when `dokan_selling['vendor_duplicate_product']` is on and the Vendor owns the original (`pro:includes/Products.php:467-511`).
- **WooCommerce REST and Abilities.** These rules hold only on Dokan's own entry points. The `seller` role holds `publish_products` and `edit_published_products` (`lite:includes/Install/Installer.php:186-196`), and `ProductAbilityScope` adds only Ownership and visibility scoping to `wc/v3/products` and the product Abilities (`lite:includes/Abilities/ProductAbilityScope.php:109-127`), so a Vendor creating a product there is not held to the default (not confirmed at runtime).
- **Store Admins acting as Vendors** get `publish` only if their own `dokan_publishing` is `yes`; when they create products from WP Admin, WooCommerce's own status handling applies instead.

## Why

The function's docblock describes it as "the default product status for new and edited product for seller based on settings", and the 3.8.2 refactor centralised what had been scattered status logic into this one function with a filter, so that add-ons can change the policy in one place. Defaulting to `pending` makes review the safe default: a Vendor only skips review when the Store Admin has explicitly granted Direct Publishing.

## Consequences & risks

- One filter, `dokan_get_default_product_status`, supplies the default for every Lite path, and an add-on that hooks it changes every path at once. Only the full add form, v1 and v3 enforce it on save; the legacy editor and quick-create trust the posted status.
- Because the default is computed for the *acting Vendor*, staff accounts never need their own Direct Publishing flag.
- Store Admins who expect "trusted" to apply retroactively are surprised: granting Direct Publishing does not publish products that are already pending.

## Recommendations

- Any new product creation path should call `dokan_get_default_product_status()` for its initial status instead of hardcoding `publish` or `pending`, and should validate a caller-supplied status against `dokan_get_available_post_status()`; the legacy editor save and quick-create do not do this today.
- Consider removing the pre-3.8.3 compatibility branch once no supported add-on version needs it.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
