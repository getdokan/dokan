# Only the itemised part of a refund is charged to the Vendor

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WooCommerce lets a refund be entered in two ways: line by line (quantities and amounts on product, shipping and fee lines, with their taxes), or as a bare amount with no lines. WooCommerce also creates a bare-amount refund by itself whenever an order's status is set to *Refunded*. Teammates ask "the admin refunded 50 without picking items — why did the Vendor's Balance not change?", "the Vendor marked the order Refunded — did they lose their Earning?" and "who pays back an order fee?". The answer follows from how Dokan reads a refund: it only looks at the refund's lines.

## Rule

The Vendor's share of a refund is computed only from the refund's **product lines, shipping lines and tax lines**:

- product lines through `OrderCommission::calculate_for_refund()`, which iterates `$refund->get_items()` (`lite:includes/Commission/OrderCommission.php:167`); `WC_Abstract_Order::get_items()` returns product lines only by default;
- shipping lines through `OrderRefundCommission::get_shipping_refund_for()` (`lite:includes/Commission/OrderRefundCommission.php:387`);
- tax lines through `OrderRefundCommission::get_refunded_tax_totals()` (`lite:includes/Commission/OrderRefundCommission.php:464`).

Any part of the refund amount that is **not** attached to such a line is charged to nobody in Dokan's books. Three common cases follow:

1. **Amount-only refund.** A refund created with an amount but no lines (WooCommerce creates no refund lines when every quantity, total and tax is 0, `wc:includes/wc-order-functions.php:620-622`) gives a Vendor share of 0. `insert_into_balance_table()` books nothing because the amount is not greater than 0 (`lite:includes/Order/RefundHandler.php:214`). `dokan_orders.net_amount` is also unchanged, because its refund adjustment reads per-line refunded amounts (`OrderLineItemCommission::adjust_refunds()`, `lite:includes/Commission/OrderLineItemCommission.php:200`) and refunded shipping, tax and fee totals, all of which stay 0. Only `dokan_orders.order_total` goes down.
2. **Status set to *Refunded*.** Setting an order to *Refunded* (by the admin, or by a Vendor from the dashboard when `dokan_selling[order_status_change]` is `on`, `lite:includes/Ajax.php:363-388`) makes WooCommerce call `wc_order_fully_refunded()` (`wc:includes/wc-order-functions.php:915`, hooked at `:940`), which creates an amount-only refund for the remaining total with **no lines and no gateway call** (`:928-935`). Case 1 then applies: the Vendor keeps the full Earning (the order's `dokan_orders` debit keeps counting because `wc-refunded` is always an active status) and the customer receives nothing through the gateway.
3. **Order-fee lines.** A refunded fee line is a refund line, but it is neither a product, shipping nor tax line, so its amount is not part of the Vendor's share. (Order fees in `dokan_orders.net_amount` belong to the Vendor only for Vendor-created manual orders, `OrderCommission::get_order_fee_recipient()`, `lite:includes/Commission/OrderCommission.php:626`.)

**The *Refunded* status itself never removes an Earning.** `wc-refunded` is always an earning status (`dokan_withdraw_get_active_order_status()`, `lite:includes/Withdraw/functions.php:356`, whatever the Store Admin selected), so when an order becomes *Refunded* its ledger row's status becomes `wc-refunded` (`lite:includes/Order/Hooks.php:173-183`) and its debit keeps counting. The Vendor's Balance goes down only by the `dokan_refund` credits booked for itemised refund lines (see [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md) for why the status is always included). An itemised refund that covers the whole order therefore cancels the Earning exactly: WooCommerce moves the order to *Refunded* (`wc:includes/wc-order-functions.php:737`), the debit keeps counting and debit minus credit is 0.

**The dormant Vendor-dashboard path.** `Order\Hooks::manage_refunded_for_order` (`lite:includes/Order/Hooks.php:290-379`, priority 15 on `woocommerce_order_status_changed`) was written to credit the whole Earning back when a Vendor sets *Refunded* from the dashboard (skipping excluded cash-on-delivery orders, `:298-301`). It requires a `post_type` field in the request (`:293`), compares the new status with `wc-refunded` (`:302-304`) and requires that `post_type` to be `shop_order` (`:306-308`). The dashboard form posts no `post_type` (`lite:templates/orders/details.php:225-238`), and WooCommerce passes the status without the prefix (`wc:includes/class-wc-order.php:478`; `set_status()` strips it, `wc:includes/abstracts/abstract-wc-order.php:905`), so the method never writes anything. The intended behaviour it shows (a full reversal on a status-only refund) is not what the code does today.

The figure produced here is the value of the `dokan_vendor_earning_in_refund` filter (`RefundHandler::get_vendor_earning_in_refund()`, `lite:includes/Order/RefundHandler.php:72`). Add-ons that book refunds through that filter inherit this rule.

## Settings that change it

| Setting | Default | Behaviour |
|---|---|---|
| `dokan_selling[order_status_change]` | `on` | `on`: a Vendor with `dokan_manage_order` can choose any WooCommerce status for their order, including *Refunded*, which triggers case 2. `off`: Vendors cannot change status, so only the admin can trigger case 2. |
| `dokan_withdraw[withdraw_order_status]` | `wc-completed` at runtime | Has **no** effect on `wc-refunded`, which is always an earning status. |
| `dokan_withdraw[exclude_cod_payment]` | `off` | When `on`, refunds of cash-on-delivery orders are never credited ([ADR-0051](./0051-refunds-of-excluded-cash-on-delivery-orders-never-touch-the-vendor-balance.md)), and their Earning never counted in the first place. |

No setting makes an amount-only refund charge the Vendor. Filters: `dokan_vendor_earning_in_refund` (replace the Vendor figure), `dokan_vendor_refund_amount_before_insert`.

## Worked example

Settings: no refund add-on active; global Commission `fixed`, `admin_percentage = 10`, `additional_fee = 0`; Fee recipients at defaults (`seller`); `order_status_change = on`. Vendor order: one product line 100.00, shipping 10.00, no tax; total 110.00; Earning 90.00 + 10.00 shipping = 100.00. Status completed; ledger debit 100.00.

| Action | WooCommerce refund created | Vendor share booked | Vendor Balance |
|---|---|---|---|
| Admin enters "Refund amount 50.00" with no lines, clicks "Refund manually" | 50.00, no lines | 0.00 (no row) | 100.00 |
| Admin refunds the product line 50.00 (quantity 0, amount 50.00) instead | 50.00 on the product line | 45.00 (90 × 50 ÷ 100 prorated: admin round(10 ÷ 100 × 50) = 5.00, Vendor 45.00) | 55.00 |
| Vendor sets status to *Refunded* from the dashboard | 110.00 remaining, no lines, gateway not called | 0.00 (no row) | 100.00 |

In the first and third rows the admin (or nobody) absorbs the whole refund in Dokan's books.

## Edge cases

- A mixed refund (some lines plus an extra unallocated amount) charges the Vendor only for the lines; the extra amount is absorbed. Likewise, setting an order to *Refunded* after a partial itemised refund creates an amount-only refund for the rest; only the earlier itemised part is credited.
- **Parent Order set to *Refunded*.** On a multi-vendor Order the status is copied only to Suborders that are `pending`, `processing` or `completed`, or in a custom status outside the default transition list (`Order\Hooks::is_status_change_allowed()`, `lite:includes/Order/Hooks.php:205-245`; see [ADR-0038](./0038-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md)). Each such Suborder then gets its own amount-only refund, so no Vendor is credited; `on-hold`, `failed` and `cancelled` Suborders do not follow at all. The refund WooCommerce creates on the parent is ignored by Vendor accounting (Lite ADR 0004).
- **Refunded is final for Vendors.** The Vendor dashboard offers no status change on a refunded order ([ADR-0045](./0045-vendors-change-only-their-own-vendor-order-status-when-allowed-and-cancelled-or-refunded-orders-are-final.md)).
- **Add-ons that own refunds.** `RefundHandler::handle_refund` returns at once when such an add-on is active (`lite:includes/Order/RefundHandler.php:39-41`); those add-ons book credits through the `dokan_refund_adjust_vendor_balance` action and inherit this rule when they compute the share through `dokan_vendor_earning_in_refund`.
- WooCommerce's order note after case 2 says funds must be returned through the gateway manually (`wc:includes/wc-order-functions.php:938`). Dokan adds no note of its own.
- When the order already has refunds that add up to its total, `wc_order_fully_refunded()` creates nothing (`:922-924`).

## Why

No code comment or ADR records this as a decision. It is a consequence of computing the Vendor's share from refund lines, which is what lets Dokan route each refunded amount to the party that received it. An unallocated amount has no line to route by. The always-included `wc-refunded` status appears designed so that the debit stays visible next to its refund credits; the consequence for status-only refunds, where no credit is computed, does not appear to have been designed, and the dormant `manage_refunded_for_order` shows that crediting the whole Earning on a status change was once intended.

## Consequences & risks

- Admins who refund by amount only, or who set orders to *Refunded*, silently bear the cost in Dokan's books while the Vendor keeps the Earning.
- A Vendor who marks their own order *Refunded* keeps the Earning and the customer is not refunded by the gateway. The order looks refunded in WooCommerce and in the Vendor's order list.
- Reports that compare `dokan_orders.order_total` with `net_amount` will show a gap after an amount-only refund.

## Recommendations

- In the refund UI, warn when a refund amount is not fully allocated to lines on a Vendor order.
- Consider either hiding *Refunded* from the Vendor's status list or booking a full reversal when a Vendor order reaches *Refunded* without itemised refunds (what `manage_refunded_for_order` attempted), or warn on the order screen that setting *Refunded* does not change the Vendor's Balance.
- Remove or repair `manage_refunded_for_order`; a dormant money path makes the behaviour hard to reason about.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
