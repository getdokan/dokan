# The commission formula is taken from the product, then the Vendor, then the global setting, then zero

Status: Accepted (retroactive — documents existing code)

## Context

A Store Admin can set a Commission formula in three places: on a single product, on a Vendor, and globally for the marketplace. A teammate asking "which commission applies to this sale?" needs to know which level wins when more than one is set, and what happens when none is set. Category-based rates are not a separate level: they are a *mode* of the Vendor and global levels (see [ADR-0022](./0022-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)).

Once an order line item has been calculated, the formula is frozen onto the item and the levels below are never consulted again for that item. That rule is recorded in Lite ADR 0012 (`docs/adr/0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md`) and is not repeated here. This ADR covers how the formula is chosen the first time.

## Rule

The formula is resolved by a chain of responsibility. Each link reads its own settings, and the first link whose settings are *applicable* supplies the formula for the whole line item:

1. **Order item** (only for order line items): frozen `_dokan_commission_*` item meta, see Lite ADR 0012. `Strategies\OrderItem::set_next()` makes the product the next link (`lite:includes/Commission/Strategies/OrderItem.php:55-60`).
2. **Product**: post meta `_per_product_admin_commission` (percentage), `_per_product_admin_additional_fee` (flat) and `_per_product_admin_commission_type`, read by `Settings\Product::get()` (`lite:includes/Commission/Settings/Product.php:35-52`). Next link is the Vendor (`lite:includes/Commission/Strategies/Product.php:46-55`).
3. **Vendor**: user meta `dokan_admin_percentage`, `dokan_admin_additional_fee`, `dokan_admin_percentage_type` and `admin_category_commission`, read by `Settings\Vendor::get()` (`lite:includes/Commission/Settings/Vendor.php:32-69`). Next link is the global setting (`lite:includes/Commission/Strategies/Vendor.php:52-58`).
4. **Global**: `dokan_selling[commission_type]`, `dokan_selling[admin_percentage]`, `dokan_selling[additional_fee]` and `dokan_selling[commission_category_based_values]`, read by `Settings\GlobalSetting::get()` (`lite:includes/Commission/Settings/GlobalSetting.php:36-62`). Next link is the default (`lite:includes/Commission/Strategies/GlobalStrategy.php:41-47`).
5. **Default**: type `fixed`, percentage `0`, flat `0` (`lite:includes/Commission/Strategies/DefaultStrategy.php:43-52`). Because the flat value is the number `0`, this link is always applicable and terminates the chain with zero Commission.

`AbstractStrategy::get_eligible_strategy()` walks the chain and returns the first link whose `Setting::is_applicable()` is true (`lite:includes/Commission/Strategies/AbstractStrategy.php:55-63`). A setting is applicable when **either** its percentage **or** its flat value is a non-empty string after trimming (`lite:includes/Commission/Model/Setting.php:289-291`). The whole formula (both percentage and flat) is taken from that one link; values are never mixed across levels. A product with only a percentage set therefore uses flat `0`, not the Vendor's or the global flat fee. The meaning of an explicit `0` versus an empty field is covered in [ADR-0019](./0019-a-commission-of-zero-is-a-deliberate-setting-and-only-an-empty-field-falls-through-to-the-next-level.md).

The same chain, starting at the product link, is used for previews outside an order (`ProductCommission::calculate()`, `lite:includes/Commission/ProductCommission.php:87`), so a product page estimate and a real sale agree on which level applies.

Extension points: `dokan_order_line_item_commission_strategies` replaces the chain head for order line items (`lite:includes/Commission/OrderLineItemCommission.php:122-125`), and `dokan_product_commission_strategies` replaces it for product previews (`lite:includes/Commission/ProductCommission.php:87`). Add-ons may also change what a level holds by writing its settings, for example writing the Vendor-level meta through `Vendor::save_commission_settings()` (`lite:includes/Vendor/Vendor.php:1665-1668`).

## Settings that change it

| Setting | Where | Default | Effect |
|---|---|---|---|
| Product commission (`_per_product_admin_commission`, `_per_product_admin_additional_fee`) | Product edit screen, *Advanced* tab, and the products bulk-edit "Commission → Change to" control (WP Admin, `manage_woocommerce` only) | empty | Empty in both fields: the product level is skipped. Either field filled: the product formula wins over Vendor and global. |
| Vendor commission (`dokan_admin_percentage`, `dokan_admin_additional_fee`, `dokan_admin_percentage_type`, `admin_category_commission`) | Admin Vendor create/edit form | empty | Empty: the Vendor level is skipped. Filled: wins over global for every product of that Vendor that has no product-level formula. |
| `dokan_selling[commission_type]`, `[admin_percentage]`, `[additional_fee]`, `[commission_category_based_values]` | Dokan → Settings → Transaction → Commissions | Field defaults in the settings UI are `fixed`, `10` and `10` (`lite:includes/Admin/Settings.php:526-547`; the new settings schema also defaults the type to `fixed`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:662`), but nothing is stored until the admin saves | When stored, applies to every product without a product or Vendor formula. When nothing is stored in either the legacy row or the canonical settings option (Lite ADR 0002), the global link is not applicable and the default link gives zero Commission. The settings repositories return only stored values, not schema defaults (`lite:includes/Admin/Settings/Repository/SettingsRepository.php:40-46`, `lite:includes/Admin/Settings/Repository/LegacySettingsRepository.php:60-73`; the bridge that overlays the canonical option onto the legacy row copies only keys that are actually stored, `lite:includes/Admin/Settings/Migration/LegacySettingsBridge.php:337-366`), and the installer does not seed commission values (`lite:includes/Install/Installer.php:151-158`). The setup wizard saves them when the admin completes its commission step (`lite:includes/Admin/SetupWizard.php:642-662`). |

## Worked example

Settings: global `fixed`, `admin_percentage = 10`, `additional_fee = 2`. Vendor V has `dokan_admin_percentage = 5`, `dokan_admin_additional_fee` empty, type `fixed`. Product P (by V) has no product commission. Product Q (by V) has `_per_product_admin_commission = 20`, flat empty.

- Sale of 1 × P at 100.00: product link not applicable, Vendor link applicable (percentage `5`). Formula 5 % + 0 flat. Commission = 100 × 5 % = 5.00; Earning = 95.00. The global 2.00 flat fee is **not** added, because levels are not mixed.
- Sale of 1 × Q at 100.00: product link applicable. Commission = 20.00 + 0 = 20.00; Earning = 80.00.
- Same sale of P on a fresh site where the admin never saved commission settings and V has no Vendor commission: default link applies. Commission = 0.00; Earning = 100.00.

## Edge cases

- **Category is not a level of its own.** There is no "category beats Vendor" step. A category rate only applies when the level that won (Vendor or global) is in `category_based` mode.
- **Product-level type is ignored for category mode.** `Settings\Product` has no category handling, so a product formula is always percentage plus flat, whatever `_per_product_admin_commission_type` says.
- **Vendor in `category_based` mode with no matching rate.** If the Vendor's `admin_category_commission` has no entry for the product's category, the `all` rate is used; if that is empty too, the Vendor setting is not applicable and resolution falls through to global. An entry that exists for the category but has both fields empty is still "the category's entry": the `all` rate is not consulted, the Vendor setting is not applicable, and resolution falls through to global (`lite:includes/Commission/Settings/Vendor.php:48-59`).
- **Orders already calculated** keep the formula frozen at their first calculation (Lite ADR 0012), so changing any level changes only future line items.
- **The `dokan_earning_by_order_item_price` filter does not change the amount.** `OrderLineItemCommission::calculate()` passes the filtered price to `Calculator::set_subtotal()` (`lite:includes/Commission/OrderLineItemCommission.php:117`, `:136`), but `Calculator::calculate()` only reads `get_total()` (`lite:includes/Commission/Calculator.php:114-149`). Code that hooks this filter to adjust Commission has no effect on the live path.

## Why

The deprecated `Commission::calculate_commission()` docblock describes the intended priority as "1.product, 2.category, 3.vendor, 4.global", and `Commission::get_commission()` documents the current order as "1.Order item if exists. 2.product, 3.vendor, 4.global" (`lite:includes/Commission.php:525`, `:584`). The most specific setting wins so that an admin can make an exception for one product or one Vendor without touching the marketplace default.

## Consequences & risks

- One empty-versus-filled field decides the level, so a stray value in a single field (for example a flat fee typed on a product) silently overrides a carefully configured Vendor or category rate.
- Because levels are never mixed, a Vendor rate of "5 %" means "5 % and no flat fee", even if the global formula has a flat fee. Admins sometimes expect inheritance of the missing half.
- The historical "category beats Vendor" priority from older releases no longer holds. Since 3.14.0, a Vendor-level formula beats a global category rate: the deprecated `calculate_commission()` documents "1.product, 2.category, 3.vendor, 4.global", while its 3.14.0 replacement `get_commission()` documents "2.product, 3.vendor, 4.global" (`lite:includes/Commission.php:525-528`, `:584-586`).

## Recommendations

- Show the resolved level ("Product", "Vendor", "Global category: Electronics", "Default") next to the Commission figure in the order Commission meta box, so that support can answer "why this rate?" without reading meta.
- Either remove the inert `dokan_earning_by_order_item_price` filter or make `Calculator` use the subtotal it is given; leaving it in place misleads extension authors.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
