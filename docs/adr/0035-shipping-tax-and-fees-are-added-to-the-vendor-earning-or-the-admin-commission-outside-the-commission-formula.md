# Shipping, tax and fees are added to the Vendor earning or the admin commission outside the commission formula

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor order carries money that is not the price of a product: shipping charges, product tax, shipping tax, WooCommerce fee lines (for example a handling surcharge) and, after payment, a payment gateway processing fee. Teammates regularly ask whether the admin's Commission percentage is taken from shipping or tax, and how these amounts end up in the Vendor's Earning and Balance. This ADR describes the overall arithmetic. The individual routing rules (who receives each amount) are separate ADRs:

- [ADR-0034](./0034-shipping-fees-go-to-the-vendor-unless-the-shipping-fee-recipient-is-set-to-admin.md)
- [ADR-0033](./0033-product-tax-goes-to-the-tax-fee-recipient-and-excludes-shipping-tax.md)
- [ADR-0036](./0036-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md)
- [ADR-0032](./0032-order-fee-lines-go-to-the-admin-unless-the-vendor-created-the-order.md)
- [ADR-0031](./0031-a-paypal-processing-fee-is-prorated-across-vendor-orders-and-deducted-from-the-vendor-earning.md)

The fact that the recipients are fixed onto the order at the first calculation is covered by Lite ADR 0012 and is not repeated here.

## Rule

**The Commission formula only ever sees product line totals.** `OrderLineItemCommission::calculate()` passes `WC_Order_Item_Product::get_total()` (price × quantity after coupon discounts, excluding tax) to the `Calculator` as the base, after the filter `dokan_earning_by_order_item_price` (`lite:includes/Commission/OrderLineItemCommission.php:117-140`), and `OrderCommission::calculate()` loops only over `$order->get_items()`, which are product line items (`lite:includes/Commission/OrderCommission.php:79-109`). Shipping, tax, fee lines and the gateway fee never pass through a Commission formula, so a percentage Commission is never charged on them.

**Each non-product amount is then given whole to one party.** `OrderCommission` adds the amounts on top of the line-item split:

```
Vendor Earning      = Σ line-item vendor net earning
                    + total Vendor fees                              (lite:includes/Commission/OrderCommission.php:340-342)

total Vendor fees   = Vendor shipping + Vendor product tax + Vendor shipping tax
                    − Vendor gateway fee + Vendor order fees          (:388-390)

total admin fees    = admin shipping + admin product tax + admin shipping tax
                    − admin gateway fee + admin order fees            (:377-379)

admin total earning = max(Σ line-item admin net commission, 0)
                    + total admin fees                               (:542-544)
```

Each "Vendor X" / "admin X" getter returns either the full amount or zero, depending on the recipient for that amount (`:227-331`, `:596-617`). There is no proportional sharing of shipping or tax between the two parties.

**Refunds are netted.** By default (`should_adjust_refund` is true) shipping, product tax, shipping tax and fee amounts are taken net of what has already been refunded on the order (`get_shipping_refunded()`, `get_tax_refunded()`, `get_total_shipping_tax_refunded()`, `get_order_fee_refunded()`, `lite:includes/Commission/OrderCommission.php:562-587`, `:641-657`).

**Where the result goes.** `Commission::get_earning_by_order()` returns `get_vendor_total_earning()` (an alias of `get_vendor_earning()`) for the Vendor and `get_admin_total_earning()` for the admin (`lite:includes/Commission.php:241`). `dokan_sync_insert_order()` stores the Vendor figure as `dokan_orders.net_amount` and as the `debit` of the order's `dokan_vendor_balance` row (`lite:includes/Order/functions.php:243-282`). Analytics stores each fee bucket separately in `dokan_order_stats` (`vendor_shipping_fee`, `vendor_shipping_tax`, `vendor_order_tax`, `vendor_gateway_fee` and the `admin_*` equivalents, `lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:136-155`).

**Only Vendor orders are calculated.** A parent Order that has Suborders is skipped (`lite:includes/Commission.php:213-215`, `lite:includes/Order/functions.php:235-237`); see Lite ADR 0004.

## Settings that change it

This ADR has no setting of its own. The amounts it adds are routed by:

| Setting | Default | Effect |
|---|---|---|
| `dokan_selling[shipping_fee_recipient]` | `seller` | Who receives shipping. |
| `dokan_selling[tax_fee_recipient]` (shown in the new admin UI as field `product_tax_fee_recipient`) | `seller` | Who receives product tax. |
| `dokan_selling[shipping_tax_fee_recipient]` | the product tax recipient when unset; the UI shows `seller` | Who receives shipping tax. |

Order fee lines and gateway fees have no admin setting; see their ADRs.

## Worked example

Settings: global Commission Fixed 10 % + 0 flat; `shipping_fee_recipient = seller`, `tax_fee_recipient = admin`, `shipping_tax_fee_recipient = seller`. A single-vendor Order: one product line total 100.00, product tax 8 % = 8.00, shipping 10.00 with shipping tax 0.80. Order total 118.80. No refunds, no fee lines, no gateway fee.

1. Line item: admin net commission = 10.00, Vendor net earning = 90.00.
2. Vendor fees = shipping 10.00 + product tax 0 + shipping tax 0.80 − gateway fee 0 + order fees 0 = 10.80.
3. Vendor Earning = 90.00 + 10.80 = **100.80**. This is written to `dokan_orders.net_amount` and the Balance debit.
4. Admin fees = shipping 0 + product tax 8.00 + shipping tax 0 = 8.00. Admin total earning = 10.00 + 8.00 = **18.00**.
5. Check: 100.80 + 18.00 = 118.80 = order total.

Changing only `tax_fee_recipient` to `seller` moves the 8.00 to the Vendor: Earning 108.80, admin 10.00. The 10 % Commission is still 10.00 because tax is never part of the base.

## Edge cases

- **Admin-earning order types.** For order types listed by `OrderType::get_admin_earning_order_types()` (advertisement and Vendor subscription orders and their refunds, filter `dokan_admin_earning_order_types`, `lite:includes/Analytics/Reports/OrderType.php:263-273`), the whole line-item amount goes to `admin_net_earning` (`lite:includes/Commission/OrderCommission.php:87-89`). Note that `get_admin_total_earning()` adds only `max(admin net commission, 0)` and the admin fees, so `admin_net_earning` is reported separately and is not part of that total (`:542-544`; `Model\Commission::get_admin_commission()`, `lite:includes/Commission/Model/Commission.php:165-167`). The fee getters are not special-cased, so shipping and tax on such an order still follow the recipient settings and can land in the Vendor bucket of that order. Add-ons that sell such orders set the recipients to `admin` on the order when they need all money to go to the admin.
- **Admin subsidy.** If coupons make the line-item admin net commission negative, `get_admin_total_earning()` floors that part at zero (`max(…, 0)`), while the fee allocations are still added in full.
- **Legacy orders.** An order that has `_dokan_admin_fee` meta (calculated before the current Commission engine) returns `order_total − _dokan_admin_fee` for the Vendor and ignores this arithmetic (`lite:includes/Commission.php:217-225`).
- **The `dokan_order_vendor_net_earning` and `dokan_order_admin_net_commission` filters** adjust only the line-item sums, before the fees are added (`lite:includes/Commission/OrderCommission.php:120`, `:131`).

## Why

Shipping and tax are pass-through money: a carrier or a tax authority is the real destination, and whoever ships or files the tax should hold it. Applying a Commission percentage to them would charge the Vendor a fee on money that is not revenue. Keeping them outside the formula and giving each one wholly to a configured recipient is the simplest model that supports both "Vendors ship and file tax themselves" and "the marketplace ships and files tax centrally".

## Consequences & risks

- A reader cannot derive the admin's Commission from `order_total − net_amount` alone: that difference includes whatever shipping and tax the admin receives and, when the admin bears a gateway fee, overstates the admin's take. Use the `dokan_order_stats` columns or `OrderCommission` getters to see the buckets.
- Each recipient getter returns the full amount or zero, so a marketplace that wants "Vendor gets shipping but pays a cut of it" cannot express that through settings.
- The fee getters persist the recipient on first read (Lite ADR 0012), so calling any of these getters can save the order.

## Recommendations

- When adding a new kind of non-product money, add a matching pair of `get_vendor_*` / `get_admin_*` getters and include them in both totals, rather than adjusting the line-item filters.
- Consider exposing an explicit "fees breakdown" in REST responses so integrators stop inferring Commission from `order_total − net_amount`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
