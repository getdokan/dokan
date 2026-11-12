# A Vendor product needs a category, and single-category mode keeps only one

Status: Accepted (retroactive — documents existing code)

## Context

Categories drive storefront navigation and, through category-based Commission, money (see [ADR-0023](./0023-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)). If a Vendor could file one product under several top-level categories with different Commission rates, the rate would be ambiguous. Teammates ask "why can my Vendors pick only one category?", "can a Vendor save a product with no category?" and "where do I switch to multiple categories?".

## Rule

- **A category is required by the dashboard forms**, but the server checks it only on some paths:
  - legacy editor update: an empty `chosen_product_cat` aborts the save with "Please select a category" (`Products::handle_product_update()`, `lite:includes/Dashboard/Templates/Products.php:500-501`);
  - full add form: an empty `chosen_product_cat` → "Please select a category"; without `chosen_product_cat`, multiple mode needs `product_cat` ("Please select at least one category"), while the single-mode check `absint( $postdata['product_cat'] ) < 0` can never be true (`lite:includes/Dashboard/Templates/Products.php:316-326`, dead check at `:318`);
  - quick-create popup: the same checks, with the same dead single-mode check, in `dokan_save_product()` (`lite:includes/Product/functions.php:36-48`, `:38`);
  - REST `dokan/v1/products` create: `categories` is required (`ProductController::validation_before_create_item()`, `lite:includes/REST/ProductController.php:398-400`). A v1 update checks no category (`validation_before_update_item()`, `:420-440`);
  - React editor / REST `dokan/v3/products`: only the form schema marks Categories as required (`lite:includes/ProductEditor/FormSchema.php:670-671`); the server does not check, and WooCommerce assigns `default_product_cat` to a product saved with no category (`wc:includes/data-stores/class-wc-product-data-store-cpt.php:1004-1005`).
- **Selection mode** is read by `ProductCategory\Helper::product_category_selection_is_single()`: true when `dokan_selling['product_category_style']` is `single`, which is also the default (`lite:includes/ProductCategory/Helper.php:22-24`).
- **Single mode keeps the first chosen category only in the dashboard forms.** The legacy update (`lite:includes/Dashboard/Templates/Products.php:555-557`), the add form (`:367`) and the quick-create popup (`lite:includes/Product/functions.php:150`) reduce the posted list to its first element, `[ reset( $chosen ) ]`, before storing it. The v1 create endpoint instead rejects more than one category with "You can not select more than category" (`lite:includes/REST/ProductController.php:402-406`). Two server paths keep every category sent:
  - v1 update calls `set_category_ids()` with every id (`lite:includes/REST/ProductController.php:1459-1460`, `:1990-2000`), without updating `chosen_product_cat` or adding ancestors, and fires no `dokan_product_updated`;
  - v3 passes every id through `PayloadResolver::resolve_taxonomies()` (`lite:includes/ProductEditor/PayloadResolver.php:113-136`); only the React field is single-select (`lite:includes/ProductEditor/FormSchema.php:669`). The follow-up `sync_category_data_for_commission()` (`lite:includes/Product/Hooks.php:668-674`) derives the chosen set with `Helper::generate_chosen_categories()`, which keeps one category per lineage, so unrelated categories all stay chosen.
- When categories are read back for an older product without stored choices, single mode again keeps only the first (`Helper::get_saved_products_category()`, `lite:includes/ProductCategory/Helper.php:53-85`).
- **Multiple mode** stores every chosen category.
- How the chosen category becomes WooCommerce terms (including parent categories) is in [ADR-0083](./0083-choosing-a-subcategory-also-assigns-its-parent-categories-unless-any-category-selection-is-on.md).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling['product_category_style']` | `single`, `multiple` | `single` | `single`: one chosen category per product in the dashboard forms (extra choices are discarded on save, or rejected by v1 create; v1 update and v3 keep them). `multiple`: any number of chosen categories. Dokan Lite's own settings screen does not expose this option, so on a Lite-only site it is always `single`; add-ons may expose it. |

## Worked example

`product_category_style = single` (the Lite default). Vendor L's browser posts `chosen_product_cat = [ 31 (Shoes › Running), 45 (Accessories) ]` from the legacy editor.

1. The array is not empty, so validation passes.
2. `Helper::product_category_selection_is_single()` is true, so `$chosen_cat = [ 31 ]`.
3. Only Running (and its parent Shoes, per the parent-category rule) is assigned; Accessories is dropped silently.

With `product_category_style = multiple`, both 31 and 45 are stored and assigned.

## Edge cases

- **WP Admin** edits by the Store Admin are not limited by this mode; Lite later derives the chosen categories from whatever terms the admin assigned (see the parent-category ADR).
- **React editor without a category.** A request that bypasses the form (or a form extension that hides the field) saves the product in WooCommerce's `default_product_cat` instead of failing.
- **WooCommerce REST and Abilities.** `wc/v3/products` and the product Abilities apply only Dokan's Ownership scoping (`ProductAbilityScope`), so neither the category requirement nor single mode applies there (not confirmed at runtime).
- **Default category.** When a category is deleted, products that had it as their chosen category are moved to its parent or to WooCommerce's `default_product_cat` by a background job (`ProductCategory\Hooks`, Action Scheduler job `dokan_delete_reference_category_from_chosen_cat`), so they are not left without a category.

## Why

The default of one category per product keeps category-based Commission unambiguous and matches the multi-step category picker, which is designed around choosing a single leaf.

## Consequences & risks

- In single mode, extra categories sent by a client are discarded without an error in the dashboard forms, rejected by v1 create, and kept by v1 update and v3. A product saved with several top-level categories through those paths can make category-based Commission ambiguous.

## Recommendations

- Check category presence and count on the server in every path (v1 update and v3 included), returning a validation error instead of silently discarding or keeping extra categories.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
