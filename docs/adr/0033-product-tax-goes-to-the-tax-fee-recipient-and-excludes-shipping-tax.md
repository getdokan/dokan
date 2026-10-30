# Product tax goes to the tax fee recipient and excludes shipping tax

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce charges tax on product lines (and on fee lines) and, separately, on shipping. Dokan lets the operator decide who receives the **product tax** of a Vendor order: the Vendor, who then remits it, or the admin, when the marketplace is the tax-registered seller of record. Shipping tax has its own recipient; see [ADR-0036](./0036-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md). The overall arithmetic is in [ADR-0035](./0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

- The product tax recipient is resolved by `Fees::get_tax_fee_recipient()` (`lite:includes/Fees.php:188-208`): order meta `tax_fee_recipient` if present; otherwise `dokan_get_option( 'tax_fee_recipient', 'dokan_selling', 'seller' )` through the filter `dokan_tax_fee_recipient` (value, order ID), written to the order and saved (`:202-204`). It is then frozen; see Lite ADR 0012.
- The amount given to the recipient is **all tax on the order minus shipping tax**, each net of refunds:

  ```
  product tax = (get_total_tax() − tax refunded) − (get_shipping_tax() − shipping tax refunded)
  ```

  (`OrderCommission::get_vendor_tax_fee()`, `lite:includes/Commission/OrderCommission.php:325-331`, and `get_admin_tax_fee()`, `:242-248`). Subtracting shipping tax guarantees that shipping tax is never counted in both the product tax and the shipping tax buckets.
- All-or-nothing: one of the two getters returns the amount, the other 0.
- **Refunds.** Refunded product tax (the `tax_total` of the refund's tax lines) is charged back to the product tax recipient by `OrderRefundCommission::get_tax_refund_for()` (`lite:includes/Commission/OrderRefundCommission.php:357-376`, recipient check at `:367`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling[tax_fee_recipient]` — the new admin UI field is named `product_tax_fee_recipient` and maps to this legacy key (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:586-609`); legacy screen `lite:includes/Admin/Settings.php:616-626` | `seller` ("Vendor"), `admin` | `seller` | `seller`: product tax is added to the Vendor's Earning. `admin`: product tax is added to the admin's total. |

This value is also the fallback for the shipping tax recipient when `dokan_selling[shipping_tax_fee_recipient]` has never been saved. Code reading the stored option must use the key `tax_fee_recipient`; `product_tax_fee_recipient` exists only as the UI field id.

## Worked example

Settings: Commission Fixed 10 % + 0 flat; shipping and shipping tax recipients `seller`. Vendor order: product line 200.00 with 10 % tax = 20.00; shipping 15.00 with 10 % tax = 1.50. `get_total_tax()` = 21.50, `get_shipping_tax()` = 1.50. Order total 236.50.

- Product tax = 21.50 − 1.50 = 20.00.
- `tax_fee_recipient = seller`: Earning = 180.00 + 15.00 + 20.00 + 1.50 = **216.50**; admin 20.00.
- `tax_fee_recipient = admin`: Earning = 180.00 + 15.00 + 1.50 = **196.50**; admin 20.00 + 20.00 = **40.00**.

## Edge cases

- **Tax on fee lines.** `get_total_tax()` includes tax on WooCommerce fee lines, so fee-line tax travels with the product tax recipient, not with the fee-line recipient.
- **Prices entered including tax.** The line-item base for Commission is `get_total()`, which WooCommerce stores excluding tax even when prices are entered inclusive of tax, so the rule does not change.
- **Suborder tax lines.** `Manager::create_taxes()` seeds tax lines on a Suborder (`lite:includes/Order/Manager.php:717-747`), and `calculate_totals()` then recalculates the Suborder's taxes (`:651`). The Suborder's own totals are what this rule reads.
- **Payment gateways that pay out at checkout.** Some split-payment gateways override this recipient per order through `dokan_tax_fee_recipient` or by writing the order meta before the first read. Lite does not do this itself.
- **Pre-2.8.6 installs** had a single `extra_fee_recipient`; the 2.8.6 upgrade copied it into both `shipping_fee_recipient` and `tax_fee_recipient` of the `dokan_general` option, defaulting to `seller` (`lite:includes/Upgrade/Upgrades/V_2_8_6.php:16-22`), and the 2.9.19 upgrade copied both keys to `dokan_selling` (`lite:includes/Upgrade/Upgrades/V_2_9_19.php:12-13`).

## Why

The operator decides who is the seller of record for tax purposes. Before 3.7.19 the same setting also covered shipping tax; it was narrowed to product tax when shipping tax got its own recipient (commit "separate shipping tax from total tax", #1848), which is why the amount is computed as total minus shipping tax.

## Consequences & risks

- With `admin` the marketplace holds the tax and must remit it; with `seller` each Vendor does. Dokan does not file or remit tax in either case.
- Refunded product tax always reduces the recipient's figure, independently of who initiated the refund.

## Recommendations

- Document `product_tax_fee_recipient` vs `tax_fee_recipient` wherever settings are read programmatically; the two names for one value are a common source of confusion.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
