# Refunded shipping and tax go back from whichever party received them, and the gateway fee stays where it was

Status: Accepted (retroactive — documents existing code)

## Context

A refund often contains more than product value: the shipping charge, product tax and shipping tax. At sale time Dokan gives each of those to either the admin or the Vendor according to the Fee recipient settings, and a payment gateway may have charged a processing fee that one of them bore. Teammates ask "if I refund shipping, whose Balance goes down?", "who pays back the tax?" and "does the Vendor get the gateway fee back on a refund?". The product part of the refund is covered by [ADR-0046](./0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md).

## Rule

`OrderRefundCommission` (`lite:includes/Commission/OrderRefundCommission.php:20`) computes what each party gives back for one refund on a Vendor order. The Vendor total is (`get_vendor_total_refund()`, `:287-295`):

> Vendor gives back = prorated product Earning + refunded tax routed to the Vendor + refunded shipping routed to the Vendor − gateway fee returned to the Vendor

The admin total mirrors it (`get_admin_total_refund()`, `:309-317`): prorated Commission (plus admin earning for marketplace-owned order types) + refunded tax and shipping routed to the admin − gateway fee returned to the admin.

1. **Shipping.** The sum of the refund's `shipping` lines (`:394-398`) goes entirely to the party named by the order's shipping Fee recipient (`Fees::get_shipping_fee_recipient()`, `lite:includes/Fees.php:155`), and to nobody else (`:388`). It is not split by Commission.
2. **Product tax and shipping tax.** The refund's `tax` lines are read for their `tax_total` and `shipping_tax_total` (`get_refunded_tax_totals()`, `:464-479`). Product tax goes to the tax Fee recipient (`Fees::get_tax_fee_recipient()`, `lite:includes/Fees.php:188`); shipping tax goes to the shipping-tax Fee recipient (`Fees::get_shipping_tax_fee_recipient()`, `lite:includes/Fees.php:220`) (`:357-376`).
3. **The recipients are the ones frozen on the order.** All three getters read the order's `shipping_fee_recipient`, `tax_fee_recipient` and `shipping_tax_fee_recipient` meta first, so a refund uses the recipients in force when the order was first calculated, not today's settings (Lite ADR 0012).
4. **Gateway fee: not returned unless a gateway integration says so.** The portion of a gateway fee "returned" on refund is whatever the `dokan_refund_gateway_fee` filter returns, and its default is **0** for both parties (`:417-455`, filter at `:454`). The filter receives, as a convenience, the recipient's prorated share of the fee it bore: `fee × |refund total| ÷ order total` (`:426-428`), where the Vendor's borne fee is the `dokan_gateway_fee` order meta when `dokan_gateway_fee_paid_by` is `seller`, and the admin's is that meta when paid by `admin` or else the `dokan_admin_gateway_fee` meta (`:497-509`). So by default whoever paid the processing fee at sale time still carries it after the refund.
5. **Parent Orders give back nothing.** Every portion is 0 when the refunded order has Suborders (`has_sub_orders()`, `:329-333`, checked at `:288`, `:358`, `:388`, `:418`).

## Settings that change it

| Setting | Default | Behaviour per value |
|---|---|---|
| `dokan_selling[shipping_fee_recipient]` | `seller` (`lite:includes/Fees.php:169`) | `seller`: refunded shipping is part of what the Vendor gives back. `admin`: refunded shipping is part of what the admin gives back; the Vendor's figure excludes it. |
| `dokan_selling[tax_fee_recipient]` | `seller` (`lite:includes/Fees.php:202`) | Same, for refunded product tax. |
| `dokan_selling[shipping_tax_fee_recipient]` | the value of `tax_fee_recipient` (`lite:includes/Fees.php:227-228`) | Same, for refunded shipping tax. |

These are read once per order and frozen into order meta, so changing them affects only orders calculated afterwards. Filters: `dokan_shipping_fee_recipient`, `dokan_tax_fee_recipient`, `dokan_shipping_tax_fee_recipient` (only before the order's first resolution), `dokan_refund_gateway_fee` (every refund).

## Worked example

Settings: global Commission `fixed` with `admin_percentage = 10`, `additional_fee = 0`; store decimals 2; no coupons. Vendor order: one product line 100.00, shipping 10.00, product tax 10.00, shipping tax 1.00, total 121.00. Commission 10.00, product Earning 90.00. The Vendor bore a gateway fee of 3.80 (`dokan_gateway_fee = 3.80`, `dokan_gateway_fee_paid_by = seller`).

A full itemised refund of 121.00 (product line 100.00 with its 10.00 tax, shipping line 10.00 with its 1.00 tax):

| Fee recipients | Vendor gives back | Admin gives back |
|---|---|---|
| All `seller` (defaults) | 90.00 + 10.00 + 1.00 + 10.00 − 0 = **111.00** | 10.00 |
| All `admin` | 90.00 | 10.00 + 10.00 + 1.00 + 10.00 = **31.00** |
| Shipping `admin`, tax and shipping tax `seller` | 90.00 + 10.00 + 1.00 = **101.00** | 10.00 + 10.00 = 20.00 |

In every row the two figures sum to 121.00. The 3.80 gateway fee is not in either figure: with the default filter the Vendor still carries it. If a gateway integration hooks `dokan_refund_gateway_fee` and returns the prorated share it was given (3.80 × 121.00 ÷ 121.00 = 3.80) for the `seller` recipient, the Vendor gives back 111.00 − 3.80 = 107.20 in the first row.

Partial example (defaults): refund only the shipping line 10.00 and its 1.00 tax. Vendor gives back 10.00 + 1.00 = 11.00; the admin gives back 0.

## Edge cases

- Refunded shipping and tax are taken from the refund's own `shipping` and `tax` lines. A refund entered as an amount only (no lines) has none, so nothing is routed to anybody; see [ADR-0049](./0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md).
- The gateway-fee filter fires for both recipients even when the order has no stored gateway fee, so an integration can return a fee that Dokan never recorded.
- If `dokan_gateway_fee` is set but `dokan_gateway_fee_paid_by` is empty, the payer is inferred: `admin` for `dokan-stripe-connect`, otherwise `seller` (`:523-528`).

## Why

The class comment states the intent: line-item portions are prorated from the order's Commission, "while refunded tax, shipping and gateway fees are routed to whichever party received them originally" (`lite:includes/Commission/OrderRefundCommission.php:12-14`). The gateway-fee default is explained in the code: "Most payment gateways keep their processing fee when a payment is refunded, so this defaults to 0" (`:404-410`). The glossary term **Fee recipient** in `CONTEXT.md` says it is "Respected everywhere money is computed, including Refunds."

## Consequences & risks

- With default settings a Vendor gives back shipping and tax in full on refund, because they received them in full at sale time.
- A Vendor who bore a gateway fee loses that fee on a refunded order unless the gateway integration reports a fee return. Vendors sometimes read this as "Dokan charged me for a refund".

## Recommendations

- Show the per-party breakdown (product, shipping, tax, gateway fee) on the refund note or in the Vendor's statement, so Vendors can see why the refund figure differs from the customer's refund amount.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
