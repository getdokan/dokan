# Editing a Vendor order recalculates its earning in the vendor balance ledger

Status: Accepted (retroactive — documents existing code)

## Context

The Earning is written to the ledger when the Vendor order is created ([ADR-0039](./0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md)). Store Admins later edit orders: they add or remove items, change prices, add fees, or WooCommerce recalculates totals after a refund. Teammates ask "if I edit an order, does the Vendor's balance follow?" and "why does `dokan_orders.net_amount` differ from the Balance debit?". Status changes never change amounts ([ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md)); this ADR records the path that does.

## Rule

**[Lite]** Every time a Vendor order is saved, Dokan recalculates its Commission split and, if the result differs from what is stored, overwrites two figures: `dokan_orders` gets the Earning and order total **after** refunds, and the Balance row's `debit` gets the Earning **before** refunds (refunds stay as their own credit rows). Status is not touched.

`Order\VendorBalanceUpdateHandler` (registered through the container, `lite:includes/DependencyManagement/Providers/CommissionServiceProvider.php:25`) listens on `woocommerce_update_order`, which WooCommerce fires on every save of an existing order (`lite:includes/Order/VendorBalanceUpdateHandler.php:29-33`):

1. **Priority 80, `update_dokan_order_table()`** (`:147-209`). Skips a parent with Suborders (`:150-152`). Recalculates with `OrderCommission` with refunds adjusted (`:157-162`). If the order has no `dokan_orders` row, stops (`:170-178`). Otherwise compares the stored `net_amount` with the recalculated Earning and the stored `order_total` with `get_total() - get_total_refunded()`; if either differs, writes both (`:180-201`) and clears the earning caches (`:207-208`).
2. **Priority 99, `handle_order_edit()`** (`:43-80`). Skips a parent with Suborders (`:44-46`). Recalculates with refunds **not** adjusted (`set_should_adjust_refund( false )`, `:49-52`) and takes `get_vendor_earning() + get_vendor_gateway_fee()` (`:54`), that is the Earning before refunds and before any gateway fee borne by the Vendor. If the order has no Balance row, stops; if the stored `debit` already equals it, stops (`:60-64`). Otherwise updates `debit` on the order's `dokan_orders`-type Balance row (`:90-111`) and caches the new figure for five minutes (`:94-99`).

The recalculation reuses the Commission terms frozen on the line items at first calculation (Lite ADR 0012, `docs/adr/0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md`). Editing an order never picks up new Commission settings for existing lines; lines added later are calculated with the settings in force when they are first calculated.

## Settings that change it

No setting enables or disables the recalculation. The figures depend on the Commission formula and Fee recipients ([ADR-0012](./0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md) and the [commission](decisions-index.md#commission) and [fee-recipient](decisions-index.md#fees-shipping-and-tax-attribution) ADRs) and on these filters, which run inside `OrderCommission::calculate()`: `dokan_order_vendor_net_earning`, `dokan_order_admin_net_commission` (`lite:includes/Commission/OrderCommission.php:120`, `:131`), and the line-item strategy filter `dokan_order_line_item_commission_strategies` (`lite:includes/Commission/OrderLineItemCommission.php:123`).

## Worked example

Settings: Commission `fixed` 10 percent; Fee recipients default; no gateway fee.

Single-vendor Order #200 for Vendor V: one line at 100.00, `completed`. Stored: `dokan_orders` (order_total 100.00, net_amount 90.00), Balance debit 90.00.

1. The Store Admin adds a second line at 50.00 and recalculates. On save: Earning = 90.00 + 45.00 = 135.00. `dokan_orders` becomes (150.00, 135.00); Balance debit becomes 135.00.
2. The Store Admin refunds 40.00 on the first line. `RefundHandler` books a credit of 36.00 (see [ADR-0047](./0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md)). On the order save that WooCommerce performs inside `wc_create_refund()` (`wc:includes/wc-order-functions.php:749`, just before `woocommerce_order_refunded` fires at `:752`): `dokan_orders` becomes (order_total 150.00 − 40.00 = 110.00, net_amount 135.00 − 36.00 = 99.00); Balance debit stays 135.00 because it ignores refunds.
3. V's earnings with `withdraw_order_status` = `wc-completed`: 135.00 − 36.00 = **99.00**, which matches `dokan_orders.net_amount`.

## Edge cases

- **Any save triggers it.** Status changes, meta updates and note-adding saves all fire `woocommerce_update_order`, so the recalculation runs often; it writes only when figures differ.
- **Orders without rows are left alone.** An order that was never synced gets no rows from this handler.
- **Gateway fees.** The two writers treat a Vendor-borne gateway fee differently: `dokan_orders.net_amount` is net of it (`get_vendor_earning()` subtracts it), while the Balance debit adds it back (`:54`). Following the code path, when Lite's PayPal fee handler (`Fees::calculate_gateway_fee()`, `lite:includes/Fees.php:57-115`) writes a debit net of the fee and then saves the order (`:100-101`), this handler's priority-99 step sees a different figure and rewrites the debit to the pre-fee Earning.
- **Five-minute cache.** After an update, the previous-value lookup reads a transient for five minutes (`:124-127`), so two edits within that window compare against the cached figure rather than the table.

## Why

The class docblock states the intent: "Handles the update of vendor balance after an order is edited" (`lite:includes/Order/VendorBalanceUpdateHandler.php:12-16`). The split between "before refunds" in the Balance and "after refunds" in `dokan_orders` follows from refunds being booked as separate credits: subtracting them from the debit as well would charge the Vendor twice.

## Consequences & risks

- The Balance follows order edits automatically, including edits made long after the Earning was withdrawn; a downward edit can push a Vendor's Balance below zero without any explicit debit row.
- `dokan_orders.net_amount` and the Balance debit are intentionally different numbers once a refund exists. Compare `net_amount` with `debit − refund credits`, not with `debit`.
- The gateway-fee difference between the two writers means the Balance and `dokan_orders` can disagree by the fee amount for orders whose fee was applied by `Fees::calculate_gateway_fee()`.

## Recommendations

- Decide whether the Balance debit should be net or gross of Vendor-borne gateway fees and make `Fees::calculate_gateway_fee()` and `handle_order_edit()` agree.
- Add an order note when an edit changes a Vendor's Earning, so Balance changes caused by edits are explainable.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
