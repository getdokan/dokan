# A Vendor product needs a category, and single-category mode keeps only one

Status: Accepted (retroactive — documents existing code)

## Context

Categories drive storefront navigation and, through category-based Commission, money (see [ADR-0023](./0023-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)). If a Vendor could file one product under several top-level categories with different Commission rates, the rate would be ambiguous. Teammates ask "why can my Vendors pick only one category?", "can a Vendor save a product with no category?" and "where do I switch to multiple categories?".

## Rule

- **A Vendor product needs a category.**
  - Legacy editor update: an empty `chosen_product_cat` aborts the save with "Please select a category" (`lite:includes/Dashboard/Templates/Products.php::handle_product_update()`).
  - Full add form: an empty `chosen_product_cat` → "Please select a category"; in multiple mode a request without chosen categories needs `product_cat` ("Please select at least one category") (`lite:includes/Dashboard/Templates/Products.php::handle_product_add()`).
  - Quick-create popup: the same checks in `dokan_save_product()` (`lite:includes/Product/functions.php::dokan_save_product()`).
  - REST `dokan/v1/products` create: `categories` is required (`lite:includes/REST/ProductController.php::validation_before_create_item()`).
  - React editor: the form schema marks Categories as required (`lite:includes/ProductEditor/FormSchema.php::get_schema()`).
- **Selection mode** is read by `ProductCategory\Helper::product_category_selection_is_single()`: true when `dokan_selling['product_category_style']` is `single`, which is also the default (`lite:includes/ProductCategory/Helper.php::product_category_selection_is_single()`).
- **Single mode keeps one chosen category.** The legacy update, the add form (`lite:includes/Dashboard/Templates/Products.php::handle_product_update()`, `::handle_product_add()`) and the quick-create popup (`lite:includes/Product/functions.php::dokan_save_product()`) reduce the posted list to its first element, `[ reset( $chosen ) ]`, before storing it. The v1 create endpoint instead rejects more than one category with "You can not select more than category" (`lite:includes/REST/ProductController.php::validation_before_create_item()`). The React editor's category field is single-select (`lite:includes/ProductEditor/FormSchema.php::get_schema()`).
- When categories are read back for an older product without stored choices, single mode again keeps only the first (`lite:includes/ProductCategory/Helper.php::get_saved_products_category()`).
- **Multiple mode** stores every chosen category.
- How the chosen category becomes WooCommerce terms (including parent categories) is in [ADR-0083](./0083-choosing-a-subcategory-also-assigns-its-parent-categories-unless-any-category-selection-is-on.md).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling['product_category_style']` | `single`, `multiple` | `single` | `single`: one chosen category per product (extra choices are discarded on save in the dashboard forms, or rejected by v1 create). `multiple`: any number of chosen categories. Dokan Lite's own settings screen does not expose this option, so on a Lite-only site it is always `single`; add-ons may expose it. |

## Worked example

`product_category_style = single` (the Lite default). Vendor L's browser posts `chosen_product_cat = [ 31 (Shoes › Running), 45 (Accessories) ]` from the legacy editor.

1. The array is not empty, so validation passes.
2. `Helper::product_category_selection_is_single()` is true, so `$chosen_cat = [ 31 ]`.
3. Only Running (and its parent Shoes, per the parent-category rule) is assigned; Accessories is dropped silently.

With `product_category_style = multiple`, both 31 and 45 are stored and assigned.

## Edge cases

- **WP Admin** edits by the Store Admin are not limited by this mode; Lite later derives the chosen categories from whatever terms the admin assigned (see the parent-category ADR).
- **Default category.** When a category is deleted, products that had it as their chosen category are moved to its parent or to WooCommerce's `default_product_cat` by a background job (`ProductCategory\Hooks`, Action Scheduler job `dokan_delete_reference_category_from_chosen_cat`), so they are not left without a category.

## Why

The default of one category per product keeps category-based Commission unambiguous and matches the multi-step category picker, which is designed around choosing a single leaf.

## Consequences & risks

- In single mode, extra categories posted from the dashboard forms are discarded without an error, so a Vendor whose form posted several sees only the first one saved.

## Recommendations

- Return a validation error for extra categories in single mode instead of silently discarding them, so the Vendor sees why only one was kept.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
