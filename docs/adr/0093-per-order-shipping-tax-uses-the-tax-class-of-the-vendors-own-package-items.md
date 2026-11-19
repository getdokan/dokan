# Per-order shipping tax uses the tax class of the Vendor's own package items

Status: Accepted (retroactive — documents existing code)

## Context

When a shipping rate is taxed "per order", WooCommerce picks one tax class for shipping. With the WooCommerce option "Shipping tax class" set to "Shipping tax class based on cart items", it looks at **all** items in the cart (`wc:includes/class-wc-tax.php::get_shipping_tax_rates()`). In a marketplace this is wrong: Vendor B's package could be taxed at the standard rate only because Vendor A sold a standard-rated item in the same cart. Each Vendor package is shipped separately, so its shipping tax should follow its own items.

Who receives the shipping tax money is a separate rule; see [ADR-0037](./0037-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md).

## Rule

**On the cart (and so on the parent Order and on single-vendor Orders):**

- `Shipping\Hooks::add_shipping_method_rate()` (`lite:includes/Shipping/Hooks.php::add_shipping_method_rate()`) is attached to `woocommerce_shipping_method_add_rate` (fired in `wc:includes/abstracts/abstract-wc-shipping-method.php::add_rate()`) on every install, with or without add-ons (`lite:includes/Shipping/Hooks.php::__construct()`).
- It recalculates the rate's taxes only when all of these hold: the rate was added with `calc_tax = per_order`; the rate already has a taxes array; the rate cost is greater than 0; and the shipping method is taxable (`WC_Shipping_Method::is_taxable()`: taxes enabled, method tax status "taxable", customer not VAT-exempt).
- The tax class is chosen by `lite:includes/Shipping/Tax.php::get_shipping_tax_class_from_vendor_cart_items()` from the items in **this package only** (`$args['package']['contents']`), considering only items whose product `is_shipping_taxable()` (`::get_vendor_cart_item_tax_classes_for_shipping()`):
  1. If the package has no such items, no Dokan rates are produced and WooCommerce's own taxes stay on the rate.
  2. If any such item uses the standard class, the standard class is used.
  3. If all such items share one class, that class is used.
  4. Otherwise the first class found in the store's tax-class order (WooCommerce → Settings → Tax → Additional tax classes) is used, falling back to standard.
- Rates are then looked up for the customer's tax location with that class (`lite:includes/Shipping/Tax.php::get_tax_rates()`) and applied with `WC_Tax::calc_shipping_tax()`, replacing the taxes WooCommerce had calculated. When that lookup returns no rates (for example, the chosen class has no rate for the customer's location), the rate keeps the taxes WooCommerce calculated with its cart-wide class.
- Dokan looks up the class itself rather than going through `WC_Tax::get_shipping_tax_rates()`, so callbacks on WooCommerce's `woocommerce_shipping_tax_class` filter (WooCommerce 10.5+) shape WooCommerce's first calculation but not the class Dokan chooses.

These package-based taxes are stored on the shipping lines of the Order created at checkout. A single-vendor Order keeps them.

**On a Suborder:** the shipping lines are cloned from the parent ([ADR-0091](./0091-each-shipping-line-belongs-to-one-vendor-and-a-suborder-receives-only-its-own-vendors-shipping-lines.md)), and then `calculate_totals()` recalculates their taxes with WooCommerce's order-level logic (`wc:includes/abstracts/abstract-wc-order.php::calculate_taxes()`, `lite:includes/Order/Manager.php::create_sub_order()`):

- Shipping tax class `inherit`: the first class, in the order standard → additional tax classes, among the Suborder's taxable line items. The Suborder holds only one Vendor's items, so this normally lands on the same class as the package rule above. If none of the Suborder's items is taxable, its shipping lines lose their taxes.
- A specific shipping tax class: that class, whatever the items.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| WooCommerce `woocommerce_calc_taxes` | `yes` / `no` | `no` | `no`: methods are not taxable, the rule does nothing. |
| Shipping method "Tax status" (per method instance) | `taxable` / `none` | method default (WooCommerce flat rate: `taxable`) | `none`: the rate carries no tax and the rule does nothing. |
| WooCommerce `woocommerce_shipping_tax_class` | `inherit` (based on cart items) / a specific class | `inherit` | `inherit`: WooCommerce's cart-wide choice is replaced by the package-based choice above, on the cart, the parent and single-vendor Orders; Suborders recalculate from their own items and normally agree. **A specific class:** on the cart, WooCommerce first taxes with that class, but whenever the package has at least one shipping-taxable item Dokan replaces those taxes with the package-based class, so the parent and single-vendor Orders carry the package-based tax. Suborders are recalculated with the specific class, so a Suborder's shipping tax can differ from its share on the parent. |
| Product "Tax status" / "Tax class" | `taxable`, `shipping`, `none` / class slug | `taxable` / standard | Only items whose status makes them shipping-taxable (`taxable` or `shipping`) are considered; their class drives the choice. |

## Worked example

Settings: taxes on; shipping tax class `inherit`; tax rates for the customer's location: Standard 20 %, Reduced rate 5 %. Flat rate 10.00 per package, tax status taxable.

Cart: Vendor A sells a standard-rated gadget; Vendor B sells a reduced-rate children's book.

- WooCommerce alone would see a standard item in the cart and tax both packages' shipping at 20 %: 2.00 + 2.00.
- With this rule: Package A shipping tax = 10.00 × 20 % = **2.00**; Package B (only reduced-rate items) shipping tax = 10.00 × 5 % = **0.50**. Total shipping tax 2.50 on the parent.
- Suborders: A's recalculation finds the standard class (2.00), B's finds Reduced rate (0.50). Same amounts.

Variant: shipping tax class fixed to Reduced rate. The parent still carries 2.00 + 0.50 (Dokan replaced WooCommerce's 5 % on package A). Suborder A is recalculated at the fixed 5 %: 0.50, so parent and Suborder disagree by 1.50.

## Edge cases

- **Zero-cost rates** (free shipping, free local pickup) are skipped; they carry no tax.
- **Per-item tax** (`calc_tax = per_item`) is never touched.
- **Methods that do not pass `package` to `add_rate()`** produce an empty package contents list, so the rule leaves WooCommerce's taxes in place.
- **No rate for the chosen class.** The cart keeps WooCommerce's cart-wide taxes; a Suborder recalculation with the same class then finds no rate and removes them.
- Add-ons may further adjust shipping taxes on `woocommerce_package_rates` after this rule runs.

## Why

The `@since 4.2.4` code was added so that each Vendor's shipping tax follows the Vendor's own products, mirroring WooCommerce's cart-based logic at package level.

## Consequences & risks

- Under `inherit`, shipping tax on a Vendor order matches that Vendor's goods, which is what the Vendor order's tax lines and refunds rely on.
- A store that sets a fixed shipping tax class sees it overridden on the cart, the parent and single-vendor Orders, but honoured on Suborders. The same checkout can therefore carry different shipping tax on the parent and on its Suborders.

## Recommendations

- Respect a non-`inherit` `woocommerce_shipping_tax_class` before applying the package-based choice, so cart, parent and Suborder agree.
- Pass the package-based class through WooCommerce's `woocommerce_shipping_tax_class` filter, so extensions that adjust the shipping tax class also apply to Vendor packages.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
