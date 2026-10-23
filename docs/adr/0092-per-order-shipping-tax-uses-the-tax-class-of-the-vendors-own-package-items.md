# Per-order shipping tax uses the tax class of the Vendor's own package items

Status: Accepted (retroactive — documents existing code)

## Context

When a shipping rate is taxed "per order", WooCommerce picks one tax class for shipping. With the WooCommerce option "Shipping tax class" set to "Shipping tax class based on cart items", it looks at **all** items in the cart (`WC_Tax::get_shipping_tax_rates()`, `wc:includes/class-wc-tax.php:584-600`). In a marketplace this is wrong: Vendor B's package could be taxed at the standard rate only because Vendor A sold a standard-rated item in the same cart. Each Vendor package is shipped separately, so its shipping tax should follow its own items.

Who receives the shipping tax money is a separate rule; see [ADR-0036](./0036-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md).

## Rule

- `Shipping\Hooks::add_shipping_method_rate()` (`lite:includes/Shipping/Hooks.php:134-148`) is attached to `woocommerce_shipping_method_add_rate` (fired at `wc:includes/abstracts/abstract-wc-shipping-method.php:376`) on every install, with or without add-ons (`:30`).
- It recalculates the rate's taxes only when all of these hold (`:138`): the rate was added with `calc_tax = per_order`; the rate already has a taxes array; the rate cost is greater than 0; and the shipping method is taxable (`WC_Shipping_Method::is_taxable()`: taxes enabled, method tax status "taxable", customer not VAT-exempt).
- The tax class is chosen by `Shipping\Tax::get_shipping_tax_class_from_vendor_cart_items()` (`lite:includes/Shipping/Tax.php:54-94`) from the items in **this package only** (`$args['package']['contents']`), considering only items whose product `is_shipping_taxable()` (`:105-115`):
  1. If the package has no such items, no Dokan rates are produced and WooCommerce's own taxes stay on the rate (`:59-68`, `Hooks.php:141`).
  2. If any such item uses the standard class, the standard class is used (`:70-73`).
  3. If all such items share one class, that class is used (`:75-78`).
  4. Otherwise the first class found in the store's tax-class order (WooCommerce → Settings → Tax → Additional tax classes) is used (`:80-90`), falling back to standard.
- Rates are then looked up for the customer's tax location with that class (`Tax::get_tax_rates()`, `:18-43`) and applied with `WC_Tax::calc_shipping_tax()`, replacing the taxes WooCommerce had calculated.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| WooCommerce `woocommerce_calc_taxes` | `yes` / `no` | `no` | `no`: methods are not taxable, the rule does nothing. |
| Shipping method "Tax status" (per method instance) | `taxable` / `none` | method default (WooCommerce flat rate: `taxable`) | `none`: the rate carries no tax and the rule does nothing. |
| WooCommerce `woocommerce_shipping_tax_class` | `inherit` (based on cart items) / a specific class | `inherit` | `inherit`: WooCommerce's cart-wide choice is replaced by the package-based choice above. **A specific class:** WooCommerce first taxes with that class, but whenever the package has at least one shipping-taxable item, Dokan replaces those taxes with the package-based class. The fixed class therefore only survives for packages with no shipping-taxable items. |
| Product "Tax status" / "Tax class" | `taxable`, `shipping`, `none` / class slug | `taxable` / standard | Only items whose status makes them shipping-taxable (`taxable` or `shipping`) are considered; their class drives the choice. |

## Worked example

Settings: taxes on; shipping tax class `inherit`; tax rates for the customer's location: Standard 20 %, Reduced rate 5 %. Flat rate 10.00 per package, tax status taxable.

Cart: Vendor A sells a standard-rated gadget; Vendor B sells a reduced-rate children's book.

- WooCommerce alone would see a standard item in the cart and tax both packages' shipping at 20 %: 2.00 + 2.00.
- With this rule: Package A shipping tax = 10.00 × 20 % = **2.00**; Package B (only reduced-rate items) shipping tax = 10.00 × 5 % = **0.50**. Total shipping tax 2.50.

## Edge cases

- **Zero-cost rates** (free shipping, free local pickup) are skipped; they carry no tax.
- **Per-item tax** (`calc_tax = per_item`) is never touched.
- **Methods that do not pass `package` to `add_rate()`** produce an empty package contents list, so the rule leaves WooCommerce's taxes in place.
- **WooCommerce's `woocommerce_shipping_tax_class` filter** (added in WooCommerce 10.5) is not applied to the package-based choice, so extensions using it only influence packages that fall back to WooCommerce's calculation.
- Add-ons may further adjust shipping taxes on `woocommerce_package_rates` after this rule runs.

## Why

The `@since 4.2.4` code was added so that each Vendor's shipping tax follows the Vendor's own products, mirroring WooCommerce's cart-based logic at package level.

## Consequences & risks

- Shipping tax on a Vendor order matches that Vendor's goods, which is what the Vendor order's tax lines and refunds rely on.
- A store that sets a fixed shipping tax class will see it overridden for most packages. This is observed behaviour and may surprise admins who chose a fixed class deliberately.

## Recommendations

- Respect a non-`inherit` `woocommerce_shipping_tax_class` before applying the package-based choice, or document the override in the admin UI.
- Apply WooCommerce's `woocommerce_shipping_tax_class` filter to the package-based class so third-party tax extensions keep working.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
