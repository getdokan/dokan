# In Dokan Lite every Vendor package is charged the store's own WooCommerce shipping rates separately

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

After the cart is split into one package per Vendor ([ADR-0093](./0093-the-cart-is-split-into-one-shipping-package-per-vendor-and-virtual-items-get-no-package.md)), something has to price each package. Teammates regularly ask whether a Vendor can set their own shipping in Dokan Lite, why a customer buying from two Vendors pays shipping twice, and what happens when no rate matches.

## Rule

- **Lite registers no shipping method.** There is no `woocommerce_shipping_methods` callback in Lite (the filter fires at `wc:includes/class-wc-shipping.php:152`). A Vendor in Lite cannot define shipping zones, methods or costs.
- **Rates come from the store admin's WooCommerce zones.** For each package, WooCommerce matches one shipping zone from the package `destination` and loads that zone's enabled methods (`WC_Shipping::load_shipping_methods()`, `wc:includes/class-wc-shipping.php:162-189`), then asks each method for rates for that package only (`WC_Shipping_Method::get_rates_for_package()`, `wc:includes/abstracts/abstract-wc-shipping-method.php:256-262`).
- **Every package is priced and charged on its own.** A flat rate is charged once per Vendor package, and quantity- or cost-based formulas see only that Vendor's items (`contents`, `contents_cost`). The customer chooses one rate per package, and the order total includes the sum of all chosen rates.
- **No rate means no checkout.** If a Vendor's package matches a zone that offers no rate for it, the customer cannot place the order. Classic checkout adds "No shipping method has been selected…" for every package without a valid chosen rate (`WC_Checkout::validate_checkout()`, `wc:includes/class-wc-checkout.php:1049-1056`); block checkout throws "Sorry, this order requires a shipping option." (`OrderController::validate_selected_shipping_methods()`, `wc:src/StoreApi/Utilities/OrderController.php:694-720`).
- **WooCommerce Free shipping is evaluated against the whole cart.** WooCommerce's own `free_shipping` method checks the minimum amount against the cart's displayed subtotal and coupons against the whole cart (`WC_Shipping_Free_Shipping::is_available()`, `wc:includes/shipping/free-shipping/class-wc-shipping-free-shipping.php:160-212`). Lite does not change this, so when the cart qualifies, free shipping is offered on every Vendor package in that zone.
- Add-ons may replace pricing by registering their own WooCommerce shipping methods; the package split still decides which items each method sees.

## Settings that change it

All settings are WooCommerce's; Lite adds none.

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| WooCommerce → Settings → Shipping → Zones (zone locations and methods) | admin-defined | none | Decides which rates each Vendor package is offered. A package whose destination matches no zone falls into "Locations not covered by your other zones". |
| Flat rate method "Cost" (per zone instance) | number or formula with `[qty]`, `[cost]`, `[fee]` | empty | Evaluated per package, so charged once per Vendor. |
| Free shipping method "Requires" + "Minimum order amount" | none / coupon / min_amount / either / both | none | Evaluated against the whole cart, then offered on every package in the zone. |
| `woocommerce_shipping_hide_rates_when_free` | `yes` / `no` | `no` | `yes`: when free shipping is available in a package, other rates in that package are hidden except local pickup (`wc:includes/class-wc-shipping.php:362-379`). |

## Worked example

Settings: one zone "Domestic" with Flat rate cost `10` and Free shipping requiring a minimum order amount of `50`; `woocommerce_shipping_hide_rates_when_free = no`; no coupons; prices exclude tax.

Cart: Vendor A items 30.00, Vendor B items 25.00 (cart subtotal 55.00), both shipping to a Domestic address.

- Package A offers Flat rate 10.00 and Free shipping 0.00 (cart subtotal 55.00 ≥ 50).
- Package B offers Flat rate 10.00 and Free shipping 0.00 (same cart-wide check).
- If the customer picks Flat rate on both, shipping is 10.00 + 10.00 = **20.00**; if they pick Free shipping on both, shipping is **0.00**.

Same cart with only Vendor A's 30.00 item: the cart subtotal is 30.00 < 50, so only Flat rate 10.00 is offered.

## Edge cases

- **Different destinations are not possible.** All packages share the customer's single shipping address, so they normally match the same zone; differences between packages come from item contents (quantity, cost, shipping class), not location.
- **Shipping classes.** Flat rate class costs are evaluated per package, so a "bulky" class cost is charged once for each Vendor that has a bulky item.
- **Local pickup** is offered per package like any other method; picking it on one package does not affect the others.
- **Shipping tax** is computed per package from that Vendor's items; see [ADR-0092](./0092-per-order-shipping-tax-uses-the-tax-class-of-the-vendors-own-package-items.md).

## Why

No decision is recorded. The behaviour follows from splitting packages per Vendor while leaving pricing entirely to WooCommerce's zones, which keeps Lite free of its own shipping configuration.

## Consequences & risks

- Customers buying from several Vendors pay shipping once per Vendor. Store admins who expect a single shipping charge per order must configure zero-cost or free methods and recover shipping differently.
- The admin, not the Vendor, controls every shipping price in Lite. Whether that money goes to the Vendor or the admin is a separate setting (see the fees domain: [ADR-0034](./0034-shipping-fees-go-to-the-vendor-unless-the-shipping-fee-recipient-is-set-to-admin.md)).
- Because free shipping is judged cart-wide, a small order from one Vendor can ride on a large order from another Vendor and still ship free.

## Recommendations

- Document clearly in the admin UI that each flat rate is charged per Vendor.
- If per-Vendor free-shipping thresholds are needed in Lite, filter `woocommerce_shipping_free_shipping_is_available` and re-check the threshold against `$package['contents']`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
