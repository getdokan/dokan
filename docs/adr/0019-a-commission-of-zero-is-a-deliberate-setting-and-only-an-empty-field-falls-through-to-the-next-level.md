# A commission of zero is a deliberate setting, and only an empty field falls through to the next level

Status: Accepted (retroactive — documents existing code)

## Context

Every Commission level (product, Vendor, global) stores its percentage and flat fee as strings. An admin who wants "no commission for this Vendor" and an admin who simply never filled in the Vendor's commission both see a Vendor whose rate looks blank or zero in reports. The code treats these two cases very differently, and support questions such as "I set 0 and the global rate still applied" or "I cleared the field and the Vendor is now charged the global rate" depend on the distinction. The level order itself is described in [ADR-0028](./0028-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md).

## Rule

A level's setting is used when its percentage **or** its flat value, trimmed, is not the empty string: `Setting::is_applicable()` returns `trim( $this->percentage ) !== '' || trim( $this->flat ) !== ''` (`lite:includes/Commission/Model/Setting.php:289-291`).

- The string `"0"` is not empty, so a level set to `0` **is applicable** and wins. It produces zero Commission from that part of the formula and stops the chain there.
- An empty string means "not set at this level", and resolution continues with the next level (`AbstractStrategy::get_eligible_strategy()`, `lite:includes/Commission/Strategies/AbstractStrategy.php:55-63`).
- Once a level is chosen, an empty half of its formula counts as zero: `get_percentage_value()` and `get_flat_value()` use `floatval()` (`lite:includes/Commission/Model/Setting.php:220-222`, `:263-265`).

The product editor states this intent to the admin: "When the value is 0, no commissions will be deducted from this vendor." (`lite:includes/Product/Hooks.php:521-522`). The global category-based description says the same for categories: "If 0 is given in value, then the marketplace will deduct no commission from vendors" (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:728`).

The save paths preserve the difference between `''` and `0`:

- Product: `Hooks::save_per_product_commission_options()` keeps `''` when the field is submitted empty and stores the formatted number otherwise (`lite:includes/Product/Hooks.php:563-603`).
- Vendor: `Vendor\Manager::create()` and `update()` accept either a numeric value or `''` (`lite:includes/Vendor/Manager.php:289-295`, `:413-419`).

## Settings that change it

| Field | Empty (`''`) | `0` | Positive value |
|---|---|---|---|
| Product percentage / flat | Product level skipped if both empty | Product level wins; that half contributes 0 | Product level wins |
| Vendor percentage / flat (`dokan_admin_percentage`, `dokan_admin_additional_fee`) | Vendor level skipped if both empty | Vendor level wins; that half contributes 0 | Vendor level wins |
| Global `dokan_selling[admin_percentage]` / `[additional_fee]` | Global level skipped if both empty, then default zero applies | Global level wins with 0 | Global level wins |

Validation that can turn a typed value into an empty one:

- Product percentage outside 0–100 is discarded and stored as `''` (`lite:includes/Product/Hooks.php:577-583`); a negative product flat fee is stored as `''` (`:585-593`). The product then falls through to the Vendor or global rate rather than charging zero.
- When the global type being saved is `fixed`, a global percentage outside 0–100 is replaced by the previously saved value (`Settings::validate_fixed_price_values()`, `lite:includes/Admin/Settings.php:95-108`). The new settings page requires both global fields to be non-empty (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:705-712`).

## Worked example

Settings: global `fixed`, 10 % + 2.00. Vendor V: case A `dokan_admin_percentage = "0"`, `dokan_admin_additional_fee = ""`; case B both `""`. Sale of 1 unit at 50.00, no product commission.

- Case A: Vendor level is applicable. Commission = 50 × 0 % + 0 = 0.00. Earning = 50.00.
- Case B: Vendor level is skipped, global applies. Commission = 50 × 10 % + 2.00 = 7.00. Earning = 43.00.

Product variant: product percentage typed as `150` → stored as `''` → with case B the Vendor level is skipped too, so Commission is again 7.00 from the global rate, not 150 % and not 0.

## Edge cases

- A value of only whitespace is treated as empty (`trim`).
- Clearing a Vendor's commission fields in the admin form re-attaches that Vendor to the global rate for every future sale. It does not change already calculated orders (Lite ADR 0012).
- Category maps behave the same way at the category level: an entry for a category whose percentage and flat are both empty does not count as "set" once it reaches the setting, so the level as a whole may become non-applicable (see [ADR-0022](./0022-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md)).

## Why

The UI copy on both the product field and the category table explicitly promises that `0` means "deduct no commission". Using `''` as the only "inherit" marker is what makes per-product and per-Vendor zero-commission exceptions possible.

## Consequences & risks

- Reports cannot tell "zero by choice" from "zero because nothing applies" without looking at the frozen `_dokan_commission_source` item meta.
- Silent normalisation of out-of-range product values to `''` means a typo makes the product inherit a different, usually higher, rate instead of producing an error.

## Recommendations

- Reject out-of-range product commission values with a visible error instead of storing `''`.
- In the Vendor and product UIs, label empty fields "Inherit" and show the inherited rate, so `''` and `0` are visibly different.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
