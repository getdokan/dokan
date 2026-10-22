# A PayPal processing fee is prorated across Vendor orders and deducted from the Vendor earning

Status: Accepted (retroactive — documents existing code)

## Context

Payment gateways keep a processing fee from each payment. On a marketplace someone has to absorb it. Lite has its own small gateway-fee routine for the PayPal-family gateways that WooCommerce users commonly install, and a set of order meta keys and filters that any gateway integration can use to report a fee and say who pays it. This ADR documents the Lite routine and the meta contract. Payment add-ons may replace the routine with their own fee handling: they can supply a fee through the `dokan_get_processing_fee` filter, or write `dokan_gateway_fee` on each Vendor order before the status change so that Lite's routine skips it. The overall arithmetic is in [ADR-0035](./0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

**When it runs.** `Fees::calculate_gateway_fee()` is hooked to `woocommerce_order_status_changed` (priority 100), `woocommerce_thankyou_ppec_paypal` and `woocommerce_paypal_payments_order_captured` (priority 99) (`lite:includes/Fees.php:21-23`).

**Which fee.** `Fees::get_processing_fee()` (`lite:includes/Fees.php:126-142`) reads the fee from the paid Order:

| Payment method | Source |
|---|---|
| `paypal` (WooCommerce PayPal Standard) | order meta `PayPal Transaction Fee` |
| `ppec_paypal` (PayPal Express Checkout), when `PPEC_FEE_META_NAME_NEW` is defined | that meta |
| `ppcp-gateway` (WooCommerce PayPal Payments), when its class exists | `paypal_fee.value` from `PayPalGateway::FEES_META_KEY` |
| anything else | 0, unless the filter `dokan_get_processing_fee` (fee, order) supplies one |

If the fee is 0 nothing happens (`:62-64`).

**How it is split.** For each Vendor order of the paid Order (`Commission::get_all_order_to_be_processed()`), skipping any that has no `dokan_orders` row yet or already carries `dokan_gateway_fee` meta (`:66-72`):

```
vendor order gateway fee = processing fee × vendor order total / Order total      (:74)
```

filtered by `dokan_get_processing_gateway_fee` (fee, vendor order, Order) (`:77`). Then:

1. `net_amount = stored Earning − gateway fee`, filtered by `dokan_orders_vendor_net_amount` (`:78-79`);
2. `dokan_orders.net_amount` and the `debit` of the order's `dokan_vendor_balance` row are set to that net amount (`:81-98`);
3. `dokan_gateway_fee` is saved on the Vendor order, which also marks it as done (`:100-101`);
4. an order note "Payment gateway processing fee X" is added unless `dokan_commission_log_gateway_fee_to_order_note` returns false (`:103-106`).

**Who bears it in later calculations.** Every Earning calculation reads the Vendor order's `dokan_gateway_fee` and `dokan_gateway_fee_paid_by` meta (`OrderCommission::get_dokan_gateway_fee()`, `lite:includes/Commission/OrderCommission.php:400-415`):

- `paid_by = seller`: the fee is subtracted from the Vendor's fees (`get_vendor_gateway_fee()`, `:424-432`).
- `paid_by = admin`: the fee is subtracted from the admin's fees (`get_admin_gateway_fee()`, `:272-286`).
- `paid_by` empty while a fee exists: treated as `admin` when the payment method is `dokan-stripe-connect`, otherwise as `seller` (`:404-409`). Lite's own routine never writes `paid_by`, so for the PayPal-family gateways above the Vendor bears the fee.
- When `dokan_gateway_fee` is not borne by the admin (for example `paid_by = seller`), `get_admin_gateway_fee()` falls through to the `dokan_admin_gateway_fee` meta and, when present, subtracts it from the admin's fees (`:279-283`). This is how a gateway splits one fee between both parties: the Vendor's portion in `dokan_gateway_fee` with `paid_by = seller`, the admin's portion in `dokan_admin_gateway_fee`. When `dokan_gateway_fee` is itself borne by the admin, `dokan_admin_gateway_fee` is not read (`:275-277` return first).

**Refunds.** The gateway fee is not given back on refund by default. `OrderRefundCommission::get_gateway_fee_refund_for()` returns the filter `dokan_refund_gateway_fee` with a default of 0, offering the recipient's prorated share (`fee borne × |refund total| / order total`) as an argument for gateways that do return fees (`lite:includes/Commission/OrderRefundCommission.php:417-455`).

## Settings that change it

There is no admin setting in Lite. Behaviour depends on the payment method (table above) and on order meta that a gateway integration writes:

| Order meta | Values | Effect |
|---|---|---|
| `dokan_gateway_fee` | amount | The Vendor order's share of the fee; also the "already applied" marker. |
| `dokan_gateway_fee_paid_by` | `seller`, `admin`, empty | Who bears `dokan_gateway_fee`; empty follows the payment-method fallback above. |
| `dokan_admin_gateway_fee` | amount | Extra portion borne by the admin. |

## Worked example

Commission Fixed 10 % + 0 flat; all fee recipients `seller`. A customer pays 200.00 with WooCommerce PayPal Standard for an Order split into two Vendor orders. A: product 100.00 + tax 8.00, shipping 10.00 + tax 0.80, total 118.80, Earning 90.00 + 18.80 = 108.80. B: product 70.00 + tax 5.60, shipping 5.00 + tax 0.60, total 81.20, Earning 63.00 + 11.20 = 74.20. PayPal reports a fee of 6.10.

- A: 6.10 × 118.80 / 200.00 = 3.6234. `wc_format_decimal()` is called without a decimals argument, so the float is only formatted to WooCommerce's rounding precision (6 decimals by default) with trailing zeros trimmed (`wc:includes/wc-formatting-functions.php:311-319`), and 3.6234 is stored; the order note, which formats with 2 decimals, shows 3.62. A's `net_amount` becomes 108.80 − 3.6234 = 105.1766.
- B: 6.10 × 81.20 / 200.00 = 2.4766; `net_amount` 74.20 − 2.4766 = 71.7234.
- `dokan_gateway_fee_paid_by` is empty and the method is `paypal`, so later calculations treat both fees as paid by the Vendor: `get_vendor_earning()` for A returns 108.80 − 3.6234 = 105.1766.

Single-vendor variant: one Vendor order of 118.80 paid with a 3.75 fee gives a fee of 3.75 × 118.80 / 118.80 = 3.75 and `net_amount` 108.80 − 3.75 = 105.05.

## Edge cases

- **Fee arrives before the order is synced.** Vendor orders without a `dokan_orders` row are skipped; because the hook also fires on later status changes, the fee is applied on the next status change after the row exists.
- **Applied once.** The `dokan_gateway_fee` meta check prevents a second deduction when several hooks fire. A gateway integration that writes `dokan_gateway_fee` itself before the status change therefore takes over and Lite's routine skips that Vendor order.
- **Order total of zero.** The routine assumes a non-zero Order total; orders with a zero total do not report a processing fee in practice.
- **Parent fee lines.** Fee lines that stay on a multi-vendor parent are part of the Order total used as the denominator, so the Vendor orders' shares sum to less than the full fee and the remainder is not charged to anyone's Earning.

## Why

PayPal Standard and its successors report a single fee per payment and know nothing about Vendors, so a proportional split by Vendor order total is the only information available. Charging it to the Vendor by default mirrors how a Vendor would pay the fee if they took the payment directly.

## Consequences & risks

- **Two ledger models meet here.** Lite folds the fee into the order's Balance `debit`, while `VendorBalanceUpdateHandler::handle_order_edit()` recomputes that debit on every order save as `get_vendor_earning() + get_vendor_gateway_fee()`, that is, before the gateway fee (`lite:includes/Order/VendorBalanceUpdateHandler.php:43-60`). That formula matches add-ons that book the gateway fee as a separate Balance entry. When Lite's routine saves the Vendor order at step 3, the order-edit handler runs and resets the debit to the Earning before the fee (`:54`, `:62-66`), while `update_dokan_order_table()` recomputes `dokan_orders.net_amount` as `get_vendor_earning()`, which now includes the saved fee, so the orders table keeps the net amount (`:157-162`). For the PayPal-family gateways handled only by Lite, the Balance can therefore show the Earning before the gateway fee while the orders table and reports show it after.
- Any code that reads `dokan_gateway_fee` without `dokan_gateway_fee_paid_by` must apply the same payment-method fallback, or it will disagree with `OrderCommission`.
- The prorated fee is stored without rounding to price decimals (only to the 6-decimal rounding precision), so sums of displayed fees may differ by a cent from the reported total.

## Recommendations

- Decide on one ledger model for gateway fees (fold into the order debit, or a separate Balance entry) and make both `Fees::calculate_gateway_fee()` and `VendorBalanceUpdateHandler` follow it.
- Write `dokan_gateway_fee_paid_by` explicitly in Lite's routine instead of relying on the empty-value fallback.
- Round the prorated fee to `wc_get_price_decimals()`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
