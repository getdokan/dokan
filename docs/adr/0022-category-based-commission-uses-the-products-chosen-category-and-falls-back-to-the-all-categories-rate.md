# Category-based commission uses the product's chosen category and falls back to the All Categories rate

Status: Accepted (retroactive — documents existing code)

## Context

When the commission type is **Category Based**, the admin fills a table with one percentage-plus-flat pair for "All Categories" and optional pairs for individual product categories. The same table exists at the global level and on each Vendor. Teammates ask which category counts for a product in several categories, whether a subcategory inherits its parent's rate, and what happens to a category the admin never touched. The level order (product, Vendor, global) is described in [ADR-0028](./0028-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md); this ADR covers only how the category table is read.

## Rule

1. **One category per product.** The category used is the first entry of the product's chosen categories: `ProductCategory\Helper::get_saved_products_category()` returns `chosen_cat`, and the strategy takes `reset()` of it (`lite:includes/Commission/Strategies/Product.php:63-72`; the same in `ProductCommission::calculate()`, `lite:includes/Commission/ProductCommission.php:76-81`). Chosen categories come from the product meta read by `Helper::get_product_chosen_category()` (`lite:includes/ProductCategory/Helper.php:281-292`) and, when that is empty, are generated from the product's terms (`:73-82`). When `dokan_selling[product_category_style]` is `single`, only one chosen category is kept (`:54`, `:69`, `:79`).
2. **Exact match, then All Categories.** In `category_based` mode the level looks up `items[<category id>]` in its table. If that entry exists and is not empty, its `percentage` and `flat` are used; otherwise the `all` entry is used (`Settings\GlobalSetting::get()`, `lite:includes/Commission/Settings/GlobalSetting.php:43-54`; `Settings\Vendor::get()`, `lite:includes/Commission/Settings/Vendor.php:48-59`).
3. **No runtime parent lookup.** The calculation never walks up the category tree. A subcategory "inherits" its parent's rate only because the settings editor copied the parent's values into the subcategory entry when the admin saved, which it does while the toggle `reset_sub_category_when_edit_all_category` is on (`lite:src/components/commission/CategoryBasedCommission.tsx:104-138`). No PHP code reads that toggle during calculation.
4. **The arithmetic is unchanged.** The chosen pair is fed to the same calculator as Fixed: percentage of the line total plus flat fee per unit (see [ADR-0025](./0025-fixed-commission-is-a-percentage-of-the-line-total-plus-a-flat-fee-charged-per-unit.md)).
5. **Vendor tables are the Vendor's own.** A Vendor in `category_based` mode reads only its own `admin_category_commission` user meta (`lite:includes/Commission/Settings/Vendor.php:42-59`). If that table yields no non-empty pair, the Vendor level is not applicable and the **global** level is consulted next, which may itself be `fixed` or `category_based`.

## Settings that change it

| Setting | Default | Behaviour |
|---|---|---|
| `dokan_selling[commission_type]` | `fixed` | Only `category_based` activates the global table. |
| `dokan_selling[commission_category_based_values]` | `[]` | Shape `{ all: {percentage, flat}, items: { <term_id>: {percentage, flat} } }`. The settings page requires a non-empty All Categories rate (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:728`, `:759-800`). |
| `dokan_selling[reset_sub_category_when_edit_all_category]` | `on` | Editor behaviour only. `on`: editing a parent category copies its values to all nested subcategories (`lite:src/components/commission/CategoryBasedCommission.tsx:125-138`), and editing All Categories clears every specific category entry (`:204-207`). `off`: each category keeps its own value. In both modes, editing a category removes entries whose values equal All Categories (`:140-152`). Changing the toggle later does not rewrite stored entries. |
| Vendor `dokan_admin_percentage_type` = `category_based` and `admin_category_commission` | empty | As above, but for that Vendor's products only. The Vendor's `reset_sub_category` meta plays the same editor-only role. |
| `dokan_selling[product_category_style]` | `single` | `single`: products carry one chosen category. `multiple`: products may carry several; only the first is used for commission. |

## Worked example

Settings: global `category_based`. `all = { percentage: 5, flat: 0 }`. `items[12] (Electronics) = { percentage: 8, flat: 1 }`. Phones (id 15) is a child of Electronics with no entry. No product or Vendor commission. No coupons.

- 1 × laptop at 200.00 in Electronics: Commission = 200 × 8 % + 1 × 1 = 17.00; Earning = 183.00.
- 1 × phone at 200.00 in Phones (no entry): falls back to All Categories. Commission = 200 × 5 % = 10.00; Earning = 190.00. It would be 17.00 only if the admin had saved Electronics while the inheritance toggle was on, which writes `items[15] = {8, 1}`.
- Product in both Phones and Accessories with `product_category_style = multiple` and chosen categories `[15, 30]`: only category 15 is considered.

## Edge cases

- **Entry present but both fields empty.** If `items[<id>]` exists with `percentage = ''` and `flat = ''`, the code uses that empty pair instead of the All Categories rate, because the fallback only triggers when the entry itself is empty. The level is then not applicable: a Vendor table falls through to global; the global table falls through to the zero default. The editor only removes an entry when it equals All Categories, so clearing both fields of one category in the editor, or importing such data, can leave an entry of this shape.
- **A product with no chosen category** resolves to category id `0`, which has no entry, so the All Categories rate applies.
- **Variations** use the parent product's chosen category (see [ADR-0020](./0020-a-variation-is-charged-the-commission-of-its-parent-product.md)).
- **Changing a product's category** changes Commission only for line items not yet calculated (Lite ADR 0012).

## Why

The settings UI states that the All Categories rate "serves as your marketplace's default rate and cannot be empty" (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:728`), which is why it is the fallback. Copying values to subcategories at edit time keeps the runtime lookup to a single key. No recorded reason was found for using only the first chosen category.

## Consequences & risks

- A product's commission can change when a Vendor reorders or edits its categories, because only the first chosen category counts.
- Turning the inheritance toggle off after values were propagated leaves the copied subcategory values in place. Admins sometimes expect the toggle to "unlink" them.

## Recommendations

- Show the category that decided the rate on the order Commission meta box.
- Make the empty-entry case fall back to All Categories, matching what the UI suggests.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
