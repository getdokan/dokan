# A Vendor is offered only the product statuses Direct Publishing allows, and editing a published product in the legacy editor keeps it published

Status: Accepted (retroactive — documents existing code)

## Context

Once a product exists, the Vendor edits it in the legacy dashboard editor or the React product editor, and each editor offers a "Status" choice. Teammates ask "why can't this Vendor select Published?", "why is Pending Review missing for this Vendor?" and, most often, "if a Vendor without Direct Publishing edits a live product, does it go back to review?". In Dokan Lite the answer depends on the path: the legacy editor keeps the product live, while the React editor and the v1 and v3 APIs send it back to pending review. Add-ons can change the legacy behaviour (see "Settings that change it").

The initial status of a new product is covered in [ADR-0077](./0077-a-new-vendor-product-is-published-immediately-only-when-the-vendor-has-direct-publishing-otherwise-it-waits-as-pending-review.md).

## Rule

- The selectable statuses come from `dokan_get_available_post_status( $product_id )` (`lite:includes/functions.php:755-766`): `publish`, `draft` and `pending`, filtered through `dokan_post_status( $statuses, $product_id )`. Labels come from `dokan_get_post_status()` (`lite:includes/functions.php:727-741`: Publish, Draft, Pending Review, Scheduled).
- Lite's own filter callback, `Product\Hooks::set_product_status()` (registered at priority 1, `lite:includes/Product/Hooks.php:33`; body `:368-399`), narrows that list:
  - Logged-out callers get `draft` only (`:369-373`).
  - A user **without** Direct Publishing loses `publish`; a user **with** Direct Publishing loses `pending` (`:375-380`). Vendors with Direct Publishing therefore choose between Publish and Draft; Vendors without it choose between Pending Review and Draft.
  - The product's **current** status is then put back so it stays selectable: a `pending` product keeps `pending`; a `publish` product gets `publish` back and loses `pending` (`:387-395`).
- The legacy editor renders this list in the "Product Status" dropdown (`templates/products/others.php`, which calls `dokan_get_available_post_status( $post->ID )`), and the React editor uses the same function for its Status radio field (`FormSchema`, `lite:includes/ProductEditor/FormSchema.php:940-948`). The block product UI exposes it as `statuses` (`Blocks\ProductBlock::get_configurations`). These are only the options *offered*: the legacy save handler writes whatever `post_status` is posted, without checking it against this list.
- **Editing a published product.** Because the current `publish` status is re-added, a Vendor without Direct Publishing who opens a live product sees Publish (selected) and Draft. Saving with Publish keeps it live: the legacy save handler saves the selected status through `wp_update_post()` (`Products::handle_product_update()`, `lite:includes/Dashboard/Templates/Products.php:456-579`; the posted status is read at `:476` and falls back to the current one when none is posted at `:492-494`, and `wp_update_post()` runs at `:543`). So in Dokan Lite, editing a published product in the legacy editor does **not** send it back to review.
- **React editor and REST `dokan/v3/products`.** The React editor always sends the whole form, including the Status field, on save (`lite:src/stores/productEditor/actions.ts:205-210`). `ProductControllerV3::enforce_publish_moderation()` replaces a requested `publish` or `future` with the Vendor's default status unless the user has `manage_woocommerce`, and with `pending` for a Vendor without Selling Activation (`lite:includes/REST/ProductControllerV3.php:395-410`, called at `:357-358`); an update that sends no `status` is left alone. A Vendor without Direct Publishing who re-saves a live product in the React editor therefore sends it back to `pending` (`lite:tests/php/src/REST/ProductControllerV3ModerationTest.php:193`), and the editor then shows the saved status (`lite:src/stores/productEditor/actions.ts:212-219`).
- **REST `dokan/v1/products`** maps the requested status on the server (`ProductController::prepare_object_for_database`, `lite:includes/REST/ProductController.php:1245-1261`):
  - `publish` → the Vendor's default status (`publish` with Direct Publishing, otherwise `pending`).
  - `pending` → stays `pending` if the product is already pending; otherwise becomes the default status. A Vendor with Direct Publishing who asks for `pending` therefore gets `publish`.
  - Any other value is used as given, falling back to `draft` when it is not a registered post status (`:1261`).
  As a result, an update sent through the v1 API with `status = publish` by a Vendor without Direct Publishing moves a live product to `pending`, as v3 does.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| User meta `dokan_publishing` on the Vendor (Store Admin only; see the new-product ADR) | `yes` / other | absent | `yes`: options are Publish and Draft (plus the current status). Other: options are Pending Review and Draft (plus the current status, so a live product keeps Publish). |
| Filter `dokan_post_status` | callback | Lite callback at priority 1 | Later callbacks see Lite's narrowed list and may add or remove statuses. Add-ons use it to offer Publish to every Vendor or to show extra statuses. Dokan Pro's `Products::set_product_status()` (priority 3) offers Publish, and drops Pending unless the product is pending, whenever the *product's Vendor* defaults to `publish` (`pro:includes/Products.php:63`, `:1100-1116`). |
| Filter `dokan_update_product_post_data` | callback | none in Lite | Runs on the legacy editor's save with the array passed to `wp_update_post()` (`lite:includes/Dashboard/Templates/Products.php:528-537`). Add-ons may change the status being saved through this hook. Dokan Pro's `Products::change_product_status()` replaces a posted `publish` with the default status for a Vendor without Direct Publishing (`pro:includes/Products.php:51`, `:556-578`), so with Pro a legacy-editor edit of a live product also returns it to review (or to `dokan_selling['product_status']`). It lets `future` and `private` through. |

## Worked example

Vendor B has no Direct Publishing. No add-on is active.

1. B creates a product; it is saved as `pending`. The Store Admin publishes it.
2. B opens it in the legacy editor. `dokan_get_available_post_status()` starts with Publish/Draft/Pending; `set_product_status()` removes Publish (B is not trusted), then sees the product is `publish`, re-adds Publish and removes Pending. The dropdown shows **Publish** (selected) and **Draft**.
3. B changes the price and saves with Publish. `wp_update_post()` writes `post_status = publish`; the product stays live with the new price. No review e-mail is sent.
4. If B makes the same edit in the React editor, the form sends `status: publish`; `enforce_publish_moderation()` replaces it with the default `pending`, and the product leaves the storefront until the Store Admin publishes it again. A `PUT dokan/v1/products/{id}` with `status: publish` has the same result.

Vendor A has Direct Publishing. On a draft product the dropdown shows Publish and Draft; choosing Publish makes it live immediately.

## Edge cases

- **Vendor Staff.** `set_product_status()` reads Direct Publishing for `get_current_user_id()` (the staff user, `lite:includes/Product/Hooks.php:375-376`), while the default status uses the Vendor. Staff users normally have no `dokan_publishing` meta, so a staff member of a Direct Publishing Vendor is offered Pending Review and Draft for a draft product, even though new products they create default to Publish. Dokan Pro's `set_product_status()` reads the product's Vendor instead and puts Publish back, which removes this anomaly when Pro is active.
- **Scheduled (`future`) and other statuses** are labelled by `dokan_get_post_status()` but are not offered by `dokan_get_available_post_status()`. The legacy save still writes them when posted (`lite:includes/Dashboard/Templates/Products.php:476`, `:543`), so a crafted request can set `publish`, `future` (published at once when its date is past) or `private`; only v1 and v3 moderate the status on the server.
- **WooCommerce REST and Abilities.** The `seller` role holds `publish_products` and `edit_published_products` (`lite:includes/Install/Installer.php:186-196`), and `ProductAbilityScope` adds only Ownership and visibility scoping to `wc/v3/products` and the product Abilities, so these status rules do not apply there (not confirmed at runtime).
- **Statuses registered by add-ons** (for example a rejection status) are shown in listings only if the add-on adds them to `dokan_get_post_status` / `dokan_get_product_status`.

## Why

The `@since 3.8.2` refactor moved status options into `dokan_get_available_post_status()` with a filter so that editors share one list. Re-adding the current status was a deliberate choice: without it a Vendor without Direct Publishing would be unable to save a live product without unpublishing it, which would make every small edit (a price change, a stock fix) take the product off sale. The React editor's server-side moderation (`@since 5.3.3`) does not follow that choice.

## Consequences & risks

- In the Lite legacy editor, Direct Publishing only gates the *first* publication: a Vendor without Direct Publishing can change a live product's content without review. Marketplaces that need re-review there rely on an add-on hooking `dokan_update_product_post_data` (Dokan Pro does).
- In the React editor every save of a live product by a Vendor without Direct Publishing takes it off sale until the Store Admin publishes it again, even for a price or stock fix.
- The legacy editor disagrees with the React editor and the v1/v3 APIs for edits of live products by Vendors without Direct Publishing, so the same edit has a different result depending on the editor the site uses.

## Recommendations

- Use `dokan_get_available_post_status()` as the single authority for which statuses a save may write, in every save path, so the editors and the APIs apply the same rule.
- Decide explicitly whether Lite should re-review edits of live products, and make the legacy editor agree with the React editor and the APIs.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
