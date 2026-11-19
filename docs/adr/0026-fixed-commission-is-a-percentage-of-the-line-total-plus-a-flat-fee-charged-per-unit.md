# Fixed commission is a percentage of the line total plus a flat fee charged per unit

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The admin settings offer two Commission formulas: **Fixed** and **Category Based** (`lite:includes/functions.php::dokan_commission_types()`; filter `dokan_commission_types`). Older releases also had **Percentage**, **Flat** and **Combine**, which CONTEXT.md still lists as Commission formulas (`lite:CONTEXT.md`, the **Commission formula** entry under Money). Teammates regularly ask whether the flat fee is charged once per order, once per line or once per unit, and what happened to the old types. This ADR answers both. Category Based only changes *which* percentage and flat values are used; the arithmetic below is the same (see [ADR-0023](./0023-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)).

## Rule

For one order line item, `Calculator::calculate_raw_admin_commission()` computes (`lite:includes/Commission/Calculator.php::calculate_raw_admin_commission()`):

```
base        = line_total + admin_funded_discount
raw_admin   = base × percentage / 100
            + flat × quantity            (all types except legacy "combine")
            + flat                       (legacy "combine" only, once per line)
            − admin_funded_discount
```

- `line_total` is `WC_Order_Item_Product::get_total()` (`lite:includes/Commission/OrderLineItemCommission.php::calculate()`), which WooCommerce defines as price × quantity **excluding taxes, after coupon discounts** (`wc:includes/class-wc-order-item-product.php::get_total()`). Tax and shipping are never part of the commission base; their recipients are separate rules (see the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution)).
- `quantity` is the line item quantity (`lite:includes/Commission/OrderLineItemCommission.php::calculate()`).
- `admin_funded_discount` is zero unless a coupon on the line is funded by the admin (see [ADR-0025](./0025-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md)).
- The result is then rounded and capped (see [ADR-0024](./0024-commission-is-rounded-and-capped-on-the-admin-share-and-the-vendor-takes-the-exact-remainder.md)).

The type string itself is only consulted to detect the legacy `combine` type: `Setting::get_flat_value()` returns 0 and `get_combine_flat()` returns the flat value when the type is `combine` (`lite:includes/Commission/Model/Setting.php::get_flat_value()`, `::get_combine_flat()`, `::is_combined()`). For `fixed`, `category_based`, an empty type, or the legacy `percentage` and `flat` types, the flat fee is multiplied by quantity. The percentage and flat parts are both always applied; there is no separate "percentage only" or "flat only" code path, a missing half is simply zero.

**Legacy types.** `Commission::get_legacy_commission_types()` lists `combine`, `percentage` and `flat` as types that existed before 3.14.0 (`lite:includes/Commission.php::get_legacy_commission_types()`). The 3.14.0 upgrade rewrote stored settings into the two-field Fixed shape:

- Global: `flat` → percentage `0`, flat = old rate; `percentage` → flat `0`; every non-category type becomes `fixed` (`lite:includes/Upgrade/Upgrades/V_3_14_0.php::update_global_commission_type()`).
- Vendor, product and category settings are converted the same way by background upgraders, except that the cleared half is stored as an empty string rather than `0` (`lite:includes/Commission/Upugrader/Update_Vendor_Commission.php::process_single_vendor()`, `lite:includes/Commission/Upugrader/Update_Product_Commission.php::process_single_product()`, `lite:includes/Commission/Upugrader/Update_Category_Commission.php::process_single_category()`).
- Legacy `combine` at the global, Vendor, product or category level matches neither the `flat` nor the `percentage` branch, so it is converted to `fixed` with both its percentage and its flat value kept (same citations). From 3.14.0 on, its flat fee is therefore charged per unit like any `fixed` setting; only order items already frozen as `combine` keep the once-per-line flat fee.
- Frozen order items are **not** rewritten. When an item's frozen type is `flat` and it has no `_dokan_commission_meta` array (that is, it was calculated before 3.14.0), `Settings\OrderItem::get()` moves the stored rate into the flat slot (`lite:includes/Commission/Settings/OrderItem.php::get()`), so the old flat amount is still charged. An item frozen as `combine` still charges its flat fee once per line.

## Settings that change it

| Setting | Values | Effect |
|---|---|---|
| `dokan_selling[commission_type]` | `fixed` (default; the legacy settings page shows `fixed` when nothing is stored, `lite:includes/Admin/Settings.php::set_commission_type_if_not_set()`, hooked in `::__construct()`), `category_based` | `fixed` or empty: use `admin_percentage` and `additional_fee` (any type other than `category_based` reads these two fields, `lite:includes/Commission/Settings/GlobalSetting.php::get()`). `category_based`: use the category map; arithmetic unchanged. |
| `dokan_selling[admin_percentage]` | number 0–100 | Percentage part. |
| `dokan_selling[additional_fee]` | number ≥ 0 | Flat fee per unit. |
| Product `_per_product_admin_commission_type` | always written as `fixed` by the product editor and bulk edit (`lite:includes/Product/Hooks.php::add_per_product_commission_options()`, `::save_per_product_commission_options()`) | No effect on the arithmetic. |
| Vendor `dokan_admin_percentage_type` | `fixed`, `category_based` (values from the same type list) | As for global. |

## Worked example

Settings: global `fixed`, `admin_percentage = 10`, `additional_fee = 2`. No coupons. Line item: 3 units at 25.00, so `line_total = 75.00`, `quantity = 3`.

- raw_admin = 75.00 × 10 % + 2.00 × 3 = 7.50 + 6.00 = 13.50.
- Commission = 13.50; Earning = 75.00 − 13.50 = 61.50.

Same item on an order frozen before 3.14.0 with type `combine`, rate 10, additional fee 2:

- raw_admin = 7.50 + 2.00 (once) = 9.50; Earning = 65.50.

Same item frozen before 3.14.0 with type `flat`, `_dokan_commission_rate = 5`, no `_dokan_commission_meta`:

- `Settings\OrderItem::get()` copies the rate 5 into the flat slot and also keeps 5 as the percentage, because both are read from `_dokan_commission_rate`.
- raw_admin = 75.00 × 5 % + 5.00 × 3 = 3.75 + 15.00 = 18.75; Earning = 56.25.

The unit test `BackwardCompatibilityTest` asserts exactly this shape for a legacy `flat` item (5 units at 30.00, rate 20): Commission 130 = 150 × 20 % + 20 × 5 (the legacy `flat` case in `lite:tests/php/src/Commission/BackwardCompatibilityTest.php::product_settings_data_provider()`). See Consequences.

## Edge cases

- A line with quantity 0 (possible on manually edited orders) gets no flat fee.
- Product previews (`ProductCommission::calculate()`) always use quantity 1 (`lite:includes/Commission/ProductCommission.php::calculate()`), so they show the flat fee once.
- A Vendor order with several lines charges the flat fee per unit on each line; there is no per-order flat fee.

## Why

No recorded reason was found for charging the flat fee per unit. The `Commission::get_commission()` docblock documents the contract that the amount and quantity passed in must describe the whole line ("for product item apple with cost $100 then $total_amount = 500, $total_quantity = 5", the docblock of `lite:includes/Commission.php::get_commission()`). The `combine` exception is marked in code as a legacy type that "does not exist in the new commission system" (the docblock of `lite:includes/Commission/Model/Setting.php::is_combined()`).

## Consequences & risks

- Marketplaces that sell many cheap units in one line pay the flat fee per unit, which can exceed the line total; the cap described in the rounding ADR then gives the Vendor zero.
- For pre-3.14.0 items frozen as `flat`, `Settings\OrderItem::get()` copies the rate into the flat slot but leaves the same value in the percentage slot, so a recalculation charges both a percentage and a per-unit flat fee from one legacy number. The (now dormant) `Formula\Flat` class, which encodes the `flat` type's meaning, charges only the per-unit flat amount (`lite:includes/Commission/Formula/Flat.php::calculate()`). This only matters when such an old order is recalculated through the strategy chain (for example on refund); orders that still carry `_dokan_admin_fee` or a `dokan_orders` row are read from those first (`lite:includes/Commission.php::get_earning_by_order()`). The current test suite asserts the combined figure, so whether it is intended is not recorded.

## Recommendations

- Make "per unit" visible in the settings UI label for the flat fee ("Fixed fee per item").
- Clear the percentage when mapping a legacy `flat` item rate into the flat slot, so old orders recalculate to the amount originally charged.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
