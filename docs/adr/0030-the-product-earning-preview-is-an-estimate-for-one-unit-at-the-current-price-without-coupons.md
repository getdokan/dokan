# The product earning preview is an estimate for one unit at the current price without coupons

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Vendors see a "You Earn" figure while editing a product, and admin and REST consumers can ask Dokan for the Commission on a product before anything is sold. Vendors then compare that figure with the Earning on a real order and ask why they differ. This ADR describes what the preview computes.

## Rule

`ProductCommission::calculate()` (`lite:includes/Commission/ProductCommission.php:59-95`) produces the preview:

- **Same formula chain, starting at the product.** The chain head is the product strategy, filterable through `dokan_product_commission_strategies` (`:87`), so the product, Vendor, category, global and default levels are resolved exactly as for an order line (see [ADR-0028](./0028-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md)). There is no frozen order-item level.
- **One unit.** Quantity is always 1 (`:93`), so the flat fee is applied once.
- **The amount is the caller's or the current price.** When no amount is given, the product's current `get_price()` is used (`:71-74`). `Commission::get_earning_by_product()` passes the product price, or an explicit price if the caller gives one (`lite:includes/Commission.php:164-191`).
- **No coupons, no fees.** No coupon record is passed to the calculator, and shipping, tax and gateway fees are not considered.
- **Category** is the product's first chosen category when the caller does not pass one (`lite:includes/Commission/ProductCommission.php:76-81`). `Commission::get_earning_by_product()` passes category `0`, which makes `ProductCommission` look the category up from the product.

The result is filtered by `dokan_get_earning_by_product` (`lite:includes/Commission.php:190`).

## Settings that change it

The same commission settings as an order line. Nothing specific to previews.

## Worked example

Settings: global `fixed` 10 % + 2.00. Product priced 25.00, no product or Vendor commission.

- Preview: Commission = 25.00 × 10 % + 2.00 × 1 = 4.50; "You Earn" = 20.50.
- Actual order of 3 units with a Vendor-funded 5.00 coupon: line_total = 70.00; Commission = 7.00 + 6.00 = 13.00; Earning = 57.00, which is 19.00 per unit, not 20.50.

## Edge cases

- If the product price is empty or 0, the preview amount is 0 and the Commission is capped at 0.
- An explicit amount of 0 is treated as "no amount given": `ProductCommission::calculate()` replaces an empty total with the product's current price (`lite:includes/Commission/ProductCommission.php:71-74`), so asking for the earning at price 0 returns the earning at the current price.
- `Commission::get_earning_by_product()` returns the clamped `get_admin_commission()` (never below 0) for the `admin` context and `get_vendor_earning()` (the line's net Earning) for the `seller` context (`lite:includes/Commission.php:185`).
- After the admin changes a rate, previews change immediately, while existing orders keep their frozen formula (Lite ADR 0012).

## Why

No recorded decision. A per-unit, coupon-free figure is the only number that can be computed before a sale.

## Consequences & risks

- Vendors with per-unit flat fees or frequent coupons will consistently see Earnings that differ from the preview.

## Recommendations

- Label the preview "per unit, before discounts, shipping and taxes" in the Vendor UI.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
