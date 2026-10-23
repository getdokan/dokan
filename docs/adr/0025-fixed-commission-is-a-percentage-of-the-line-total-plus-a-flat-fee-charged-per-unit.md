# Fixed commission is a percentage of the line total plus a flat fee charged per unit

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The admin settings offer two commission types: **Fixed** and **Category Based** (`dokan_commission_types()`, `lite:includes/functions.php:3407-3414`; filter `dokan_commission_types`). Older releases also had **Percentage**, **Flat** and **Combine**, which CONTEXT.md still lists as Commission formulas (`lite:CONTEXT.md:127-128`). Teammates regularly ask whether the flat fee is charged once per order, once per line or once per unit, and what happened to the old types. This ADR answers both. Category Based only changes *which* percentage and flat values are used; the arithmetic below is the same (see [ADR-0022](./0022-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)).

## Rule

For one order line item, `Calculator::calculate_raw_admin_commission()` computes (`lite:includes/Commission/Calculator.php:139-149`):

```
base        = line_total + admin_funded_discount
raw_admin   = base × percentage / 100
            + flat × quantity            (all types except legacy "combine")
            + flat                       (legacy "combine" only, once per line)
            − admin_funded_discount
```

- `line_total` is `WC_Order_Item_Product::get_total()` (`lite:includes/Commission/OrderLineItemCommission.php:137`), which WooCommerce defines as price × quantity **excluding taxes, after coupon discounts** (`wc:includes/class-wc-order-item-product.php:358-365`). Tax and shipping are never part of the commission base; their recipients are separate rules (see the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution)).
- `quantity` is the line item quantity (`lite:includes/Commission/OrderLineItemCommission.php:119`, `:138`).
- `admin_funded_discount` is zero unless a coupon on the line is funded by the admin (see [ADR-0024](./0024-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md)).
- The result is then rounded and capped (see [ADR-0023](./0023-commission-is-rounded-and-capped-on-the-admin-share-and-the-vendor-takes-the-exact-remainder.md)).

The type string itself is only consulted to detect the legacy `combine` type: `Setting::get_flat_value()` returns 0 and `get_combine_flat()` returns the flat value when the type is `combine` (`lite:includes/Commission/Model/Setting.php:220-243`). For `fixed`, `category_based`, an empty type, or the legacy `percentage` and `flat` types, the flat fee is multiplied by quantity. The percentage and flat parts are both always applied; there is no separate "percentage only" or "flat only" code path, a missing half is simply zero.

**Legacy types.** `Commission::get_legacy_commission_types()` lists `combine`, `percentage` and `flat` as types that existed before 3.14.0 (`lite:includes/Commission.php:575-581`). The 3.14.0 upgrade rewrote stored settings into the two-field Fixed shape:

- Global: `flat` → percentage `0`, flat = old rate; `percentage` → flat `0`; every non-category type becomes `fixed` (`V_3_14_0::update_global_commission_type()`, `lite:includes/Upgrade/Upgrades/V_3_14_0.php:23-46`).
- Vendor, product and category settings are converted the same way by background upgraders, except that the cleared half is stored as an empty string rather than `0` (`lite:includes/Commission/Upugrader/Update_Vendor_Commission.php:135-160`, `Update_Product_Commission.php:186-200`, `Update_Category_Commission.php:183-205`).
- Frozen order items are **not** rewritten. When an item's frozen type is `flat` and it has no `_dokan_commission_meta` array (that is, it was calculated before 3.14.0), `Settings\OrderItem::get()` moves the stored rate into the flat slot (`lite:includes/Commission/Settings/OrderItem.php:49-52`), so the old flat amount is still charged. An item frozen as `combine` still charges its flat fee once per line.

## Settings that change it

| Setting | Values | Effect |
|---|---|---|
| `dokan_selling[commission_type]` | `fixed` (default; the legacy settings page shows `fixed` when nothing is stored, `lite:includes/Admin/Settings.php:37`, `:77-83`), `category_based` | `fixed` or empty: use `admin_percentage` and `additional_fee` (any type other than `category_based` reads these two fields, `lite:includes/Commission/Settings/GlobalSetting.php:43`). `category_based`: use the category map; arithmetic unchanged. |
| `dokan_selling[admin_percentage]` | number 0–100 | Percentage part. |
| `dokan_selling[additional_fee]` | number ≥ 0 | Flat fee per unit. |
| Product `_per_product_admin_commission_type` | always written as `fixed` by the product editor and bulk edit (`lite:includes/Product/Hooks.php:527`, `:568-575`) | No effect on the arithmetic. |
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

The unit test `BackwardCompatibilityTest` asserts exactly this shape for a legacy `flat` item (5 units at 30.00, rate 20): Commission 130 = 150 × 20 % + 20 × 5 (`lite:tests/php/src/Commission/BackwardCompatibilityTest.php:228-266`). See Consequences.

## Edge cases

- A line with quantity 0 (possible on manually edited orders) gets no flat fee.
- Product previews (`ProductCommission::calculate()`) always use quantity 1 (`lite:includes/Commission/ProductCommission.php:93`), so they show the flat fee once.
- A Vendor order with several lines charges the flat fee per unit on each line; there is no per-order flat fee.

## Why

No recorded reason was found for charging the flat fee per unit. The `Commission::get_commission()` docblock documents the contract that the amount and quantity passed in must describe the whole line ("for product item apple with cost $100 then $total_amount = 500, $total_quantity = 5", `lite:includes/Commission.php:592-596`). The `combine` exception is marked in code as a legacy type that "does not exist in the new commission system" (`lite:includes/Commission/Model/Setting.php:235-243`).

## Consequences & risks

- Marketplaces that sell many cheap units in one line pay the flat fee per unit, which can exceed the line total; the cap described in the rounding ADR then gives the Vendor zero.
- For pre-3.14.0 items frozen as `flat`, `Settings\OrderItem::get()` copies the rate into the flat slot but leaves the same value in the percentage slot, so a recalculation charges both a percentage and a per-unit flat fee from one legacy number. The (now dormant) `Formula\Flat` class, which encodes the `flat` type's meaning, charges only the per-unit flat amount (`lite:includes/Commission/Formula/Flat.php:79-103`). This only matters when such an old order is recalculated through the strategy chain (for example on refund); orders that still carry `_dokan_admin_fee` or a `dokan_orders` row are read from those first (`Commission::get_earning_by_order()`, `lite:includes/Commission.php:204-230`). The current test suite asserts the combined figure, so whether it is intended is not recorded.

## Recommendations

- Make "per unit" visible in the settings UI label for the flat fee ("Fixed fee per item").
- Clear the percentage when mapping a legacy `flat` item rate into the flat slot, so old orders recalculate to the amount originally charged.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
