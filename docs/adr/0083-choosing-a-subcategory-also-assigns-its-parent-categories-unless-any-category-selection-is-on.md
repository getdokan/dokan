# Choosing a subcategory also assigns its parent categories, unless "Select any category" is on

Status: Accepted (retroactive — documents existing code)

## Context

Dokan's multi-step category picker walks a Vendor down the category tree (for example Clothing › Men › Shirts). Teammates ask "why does my product show up under Clothing when the Vendor only picked Shirts?", "can a Vendor stop at a parent category?" and "what is `chosen_product_cat`?". Dokan keeps two things apart: the category the Vendor actually *chose*, and the WooCommerce terms the product is *assigned*.

## Rule

- **Chosen category is stored separately.** `Helper::set_object_terms_from_chosen_categories( $post_id, $chosen )` (`lite:includes/ProductCategory/Helper.php:174-205`) writes the Vendor's choice to post meta `chosen_product_cat` (`:197`) and then assigns `product_cat` terms with `wp_set_object_terms()` (`:204`).
- **Default: ancestors are added.** When "Select any category" is off, every ancestor of each chosen category is assigned along with it (`:190-194`). Choosing Shirts assigns Clothing, Men and Shirts; `chosen_product_cat` stays `[Shirts]`.
- **"Select any category" on: only the chosen terms.** When `Helper::is_any_category_selection_enabled()` is true (`dokan_selling['dokan_any_category_selection'] = on`, `lite:includes/ProductCategory/Helper.php:33-35`), only the chosen categories are assigned (`:187-189`).
- **Leaf requirement in the legacy picker only.** With "Select any category" off, the legacy multi-step picker's Done button is enabled only when the selected category has no children; with it on, any level can be confirmed (`loadChildCategories()`, `lite:assets/src/js/product-category-ui.js:207-218`). The React editor's category tree picker lets any node be ticked whatever the setting (`TreeSelectField`, `lite:src/dashboard/product-editor/components/AsyncSelectEdit.tsx:360-412`), and no server path checks for a leaf. So the setting always controls whether parents are auto-assigned, but whether a Vendor may stop at a parent category only in the legacy forms.
- **Deriving the chosen set from terms.** When a product's terms are set elsewhere (WP Admin quick or bulk edit, admin saves, older products), `Helper::generate_chosen_categories( $terms )` (`lite:includes/ProductCategory/Helper.php:113-162`) reduces them to the deepest term of each lineage; with "Select any category" on, it returns the terms unchanged (`:120-123`). `Product\Hooks` re-runs this on admin quick/bulk edits, on admin product saves, and after Vendor saves that fire `dokan_new_product_added` / `dokan_product_updated` for a user with `dokan_edit_product` (`sync_category_data_for_commission`, `lite:includes/Product/Hooks.php:40-41`, `:668-674`; a v1 REST update fires neither), so `chosen_product_cat` stays consistent with the assigned terms. Category-based Commission reads the chosen category (see [ADR-0023](./0023-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling['dokan_any_category_selection']` (admin UI: "Select any category", `vendor_select_any_product_category`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:1527-1546`; legacy screen `lite:includes/Admin/Settings.php:686-691`) | `on` / `off` | `off` | `off`: the legacy picker makes the Vendor pick a leaf category (the React editor does not), and all ancestors of the chosen category are assigned too. `on`: the Vendor may pick a category at any level, and only the picked categories are assigned. |
| `dokan_selling['product_category_style']` | `single` / `multiple` | `single` | How many categories may be chosen; see [ADR-0080](./0080-a-vendor-product-needs-a-category-and-single-category-mode-keeps-only-one.md). |

## Worked example

Category tree: Clothing (10) › Men (11) › Shirts (12). Vendor M chooses Shirts.

- "Select any category" off: `chosen_product_cat = [12]`; `product_cat` terms = {10, 11, 12}. The product appears in the Clothing, Men and Shirts archives. Category Commission resolves from Shirts.
- "Select any category" on: M could also stop at Men. Choosing Shirts gives `chosen_product_cat = [12]` and terms = {12} only; the product appears only in the Shirts archive (WooCommerce's parent archives show it only if the theme includes child categories).
- The Store Admin later adds the term Clothing to the product in WP Admin quick edit with "Select any category" off. `generate_chosen_categories( {10, 11, 12} )` keeps the deepest term of the lineage, so `chosen_product_cat` stays `[12]`.

## Edge cases

- **Parent chosen in the React editor** with the setting off: the chosen category is the parent, and its own ancestors are added on save, so the product is not in any subcategory.
- **Turning the setting on later** does not remove ancestor terms already assigned; they stay until the product is saved again.
- **Two branches.** In multiple-category mode, choosing Shirts and Women › Dresses assigns both full lineages; `chosen_product_cat` holds the two leaves.
- **Deleted category.** A deleted chosen category is replaced by its parent (or WooCommerce's default category) through the `dokan_delete_reference_category_from_chosen_cat` job.

## Why

Assigning ancestors makes a product discoverable from every level of the category menu in themes that list only directly assigned terms. Keeping the leaf separately in `chosen_product_cat` preserves what the Vendor meant, which category-based Commission needs.

## Consequences & risks

- The assigned terms and the chosen category can legitimately differ; any feature that needs "the product's category" must decide which one it means. Commission uses the chosen category.

## Recommendations

- Read categories for business logic through `Helper::get_saved_products_category()` or `chosen_product_cat`, not through raw `product_cat` terms.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
