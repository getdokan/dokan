# A refund is charged to the Vendor by its lines, and a refund without lines is spread over what is left of the order

Status: Accepted. Amended in DOKAN_SINCE: a refund without lines is now charged in proportion. Before, it was charged to nobody. The file name keeps the old title so that existing links still work.

## Context

WooCommerce lets a refund be entered in two ways: line by line (quantities and amounts on product, shipping and fee lines, with their taxes), or as a bare amount with no lines. WooCommerce also creates a bare-amount refund by itself whenever an order's status is set to *Refunded*. Teammates ask "the admin refunded 50 without picking items — how much does the Vendor give back?", "the Vendor marked the order Refunded — did they lose their Earning?" and "who pays back an order fee?".

Until DOKAN_SINCE Dokan read only the refund's lines, so a refund without lines took nothing from the Vendor: the order showed as refunded while the Vendor could still withdraw the Earning.

## Rule

**A refund with lines** is charged by its **product lines, shipping lines and tax lines**:

- product lines through `OrderCommission::calculate_for_refund()`, which iterates `$refund->get_items()` (`lite:includes/Commission/OrderCommission.php::calculate_for_refund()`); `WC_Abstract_Order::get_items()` returns product lines only by default;
- shipping lines through `OrderRefundCommission::get_shipping_refund_for()` (`lite:includes/Commission/OrderRefundCommission.php::get_shipping_refund_for()`);
- tax lines through `OrderRefundCommission::get_refunded_tax_totals()` (`lite:includes/Commission/OrderRefundCommission.php::get_refunded_tax_totals()`).

**A refund without lines** (an amount-only refund) is spread over what is left of the order. WooCommerce creates no refund lines when every quantity, total and tax is 0 (`wc:includes/wc-order-functions.php::wc_create_refund()`); a Dokan Pro refund request sends every line with a 0 total, which WooCommerce keeps as lines of 0. Dokan treats a refund as amount-only when none of its product, shipping or fee lines carries a total or a tax (`lite:includes/Commission/OrderCommission.php::is_amount_only_refund()`).

- **Vendor's share** = refund amount ÷ (order total − itemised refunds) × the Vendor's Earning that the itemised refunds left (`lite:includes/Commission/OrderRefundCommission.php::spread_amount_only_refunds()`). On an order with no itemised refund this is refund amount ÷ order total × the Vendor's Earning. The Earning includes the shipping and tax the Vendor received, so those follow the Fee recipient settings ([ADR-0051](./0051-refunded-shipping-and-tax-go-back-from-whichever-party-received-them-and-the-gateway-fee-stays-where-it-was.md)). The gateway fee is added back first, as on the order's ledger debit, so the fee stays where it was.
- **The order's figures follow.** The Vendor's Earning, the admin's Commission and the admin's total earning after refunds are multiplied by the share the amount-only refunds leave (`lite:includes/Commission/OrderCommission.php::get_vendor_earning()`, `::get_admin_commission()`, `::get_admin_total_earning()`). `dokan_orders.net_amount`, the Commissions box and the analytics figures read these, so they go down by the same share.
- **Later refunds on the same order.** Once an order has an amount-only refund, the Vendor's share of every later refund, itemised ones too, is what that refund takes off the Vendor's Earning on the order. All `dokan_refund` credits of an order therefore add up to the Earning when the order is refunded in full, in whatever order the refunds were made. The share is worked out when the refund is made.

Three cases follow:

1. **Amount-only refund.** The admin types a "Refund amount" and picks no lines, or a refund is made through the WooCommerce `/wc/v2` REST endpoint, which passes no lines ([ADR-0049](./0049-in-dokan-lite-the-store-admin-issues-refunds-through-woocommerce-and-they-take-effect-immediately.md)). The Vendor gives back the same share of their Earning as the refund is of the order.
2. **Status set to *Refunded*.** Setting an order to *Refunded* (by the admin, or by a Vendor when `dokan_selling[order_status_change]` is `on`: from the dashboard, `lite:includes/Ajax.php::change_order_status()`, or through `PUT dokan/v1/orders/{id}`, `lite:includes/REST/OrderController.php::prepare_object_for_database()`) makes WooCommerce call `wc_order_fully_refunded()` (`wc:includes/wc-order-functions.php::wc_order_fully_refunded()`, hooked on `woocommerce_order_status_refunded`), which creates an amount-only refund for the remaining total with **no gateway call**. Case 1 then applies to the whole remainder: the Vendor gives back everything that was left of the Earning. The customer still receives nothing through the gateway.
3. **Order-fee lines.** A refunded fee line is a refund line, but it is neither a product, shipping nor tax line, so its **amount** is not part of the Vendor's share. Its **tax** is different: WooCommerce adds the taxes of refunded product and fee lines together into the refund's tax lines, and that whole tax total goes back from the tax recipient. So when the Vendor is the tax recipient, the Vendor's tax share of a refund is product tax + fee tax ([ADR-0051](./0051-refunded-shipping-and-tax-go-back-from-whichever-party-received-them-and-the-gateway-fee-stays-where-it-was.md)). (Order fees in `dokan_orders.net_amount` belong to the Vendor only for Vendor-created manual orders, `lite:includes/Commission/OrderCommission.php::get_order_fee_recipient()`.)

**The *Refunded* status itself never removes an Earning.** `wc-refunded` is always an earning status (`lite:includes/Withdraw/functions.php::dokan_withdraw_get_active_order_status()`, whatever the Store Admin selected), so when an order becomes *Refunded* its ledger row's status becomes `wc-refunded` (`lite:includes/Order/Hooks.php::on_order_status_change()`) and its debit keeps counting. The Vendor's Balance goes down only by the `dokan_refund` credits (see [ADR-0064](./0064-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md) for why the status is always included). A refund that covers the whole order, by lines or by amount, cancels the Earning: the debit keeps counting and debit minus credits is 0. Several partial refunds of one line can leave ±0.01 because each is rounded separately ([ADR-0047](./0047-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md)), and a Vendor-borne gateway fee can leave −fee ([ADR-0048](./0048-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md), rule 3).

**The dormant Vendor-dashboard path.** `Order\Hooks::manage_refunded_for_order` (`lite:includes/Order/Hooks.php::manage_refunded_for_order()`, priority 15 on `woocommerce_order_status_changed`) was written to credit the whole Earning back when a Vendor sets *Refunded* from the dashboard. It requires a `post_type` field that the dashboard form does not post, and compares the status with a `wc-` prefix that WooCommerce does not pass, so it never writes anything. The amount-only refund of case 2 now does what it was meant to do.

The Vendor's figure is the value of the `dokan_vendor_earning_in_refund` filter (`lite:includes/Order/RefundHandler.php::get_vendor_earning_in_refund()`). Add-ons that book refunds through that filter inherit this rule.

## Settings that change it

| Setting | Default | Behaviour |
|---|---|---|
| `dokan_selling[order_status_change]` | `on` | `on`: a Vendor with `dokan_manage_order` can set their own Vendor order to *Refunded* (unless it is already *Cancelled* or *Refunded*, which are final for Vendors, [ADR-0046](./0046-vendors-change-only-their-own-vendor-order-status-when-allowed-and-cancelled-or-refunded-orders-are-final.md)) through the dashboard or `PUT dokan/v1/orders/{id}`; this triggers case 2. Bulk status changes exclude *Refunded*. `off`: Vendors cannot change status, so only the admin can trigger case 2. |
| `dokan_selling[shipping_fee_recipient]`, `[tax_fee_recipient]`, `[shipping_tax_fee_recipient]` | `seller` | Decide whether shipping and tax are part of the Vendor's Earning, and so of the Vendor's share of an amount-only refund. |
| `dokan_withdraw[withdraw_order_status]` | `wc-completed` at runtime (`lite:includes/Withdraw/functions.php::dokan_withdraw_get_active_order_status()`); the new settings schema defaults to `wc-processing`, see [ADR-0064](./0064-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md) | Has **no** effect on `wc-refunded`, which is always an earning status. An order in an unselected status starts counting when set to *Refunded*, and the refund credit of case 2 cancels it. |
| `dokan_withdraw[exclude_cod_payment]` | `off` | When `on`, refunds of cash-on-delivery orders are never credited ([ADR-0052](./0052-refunds-of-excluded-cash-on-delivery-orders-never-touch-the-vendor-balance.md)), and their Earning never counted in the first place. The order's figures still go down. |

Filters: `dokan_vendor_earning_in_refund` (replace the Vendor figure), `dokan_vendor_refund_amount_before_insert`.

## Worked example

Settings: no refund add-on active; global Commission `fixed`, `admin_percentage = 10`, `additional_fee = 0`; Fee recipients at defaults (`seller`); `order_status_change = on`. Vendor order: one product line 100.00, shipping 10.00, no tax; total 110.00; Earning 90.00 + 10.00 shipping = 100.00. Status completed; ledger debit 100.00. Each row starts from the untouched order.

| Action | WooCommerce refund created | Vendor share booked | Vendor Balance |
|---|---|---|---|
| Admin enters "Refund amount 55.00" with no lines, clicks "Refund manually" | 55.00, no lines | 50.00 (55 ÷ 110 of the 100.00 Earning) | 50.00 |
| Admin refunds the product line 50.00 (quantity 0, amount 50.00) instead | 50.00 on the product line | 45.00 (90 × 50 ÷ 100 prorated: admin round(10 ÷ 100 × 50) = 5.00, Vendor 45.00) | 55.00 |
| Vendor sets status to *Refunded* from the dashboard | 110.00 remaining, no lines, gateway not called | 100.00 (110 ÷ 110 of the Earning) | 0.00 |

Mixed refunds: after the second row (line refund 50.00, Earning left 55.00, order total left 60.00), an amount-only refund of the remaining 60.00 takes 60 ÷ 60 × 55.00 = 55.00, and the Balance is 0.00.

## Edge cases

- **A refund with lines plus an extra unallocated amount** is not an amount-only refund. The Vendor is charged only for the lines; the extra amount is still charged to nobody.
- **Parent Order set to *Refunded*.** On a multi-vendor Order the status is copied only to Suborders that are `pending`, `processing` or `completed`, or in a custom status outside the default transition list (`lite:includes/Order/Hooks.php::is_status_change_allowed()`; see [ADR-0039](./0039-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md)). Each such Suborder then gets its own amount-only refund, so its Vendor gives back what was left of the Earning; `on-hold`, `failed` and `cancelled` Suborders do not follow at all. The refund WooCommerce creates on the parent is ignored by Vendor accounting (Lite ADR 0004).
- **Refunded is final for Vendors.** Once a Vendor order is *Refunded* (or *Cancelled*), its Vendor cannot change its status again ([ADR-0046](./0046-vendors-change-only-their-own-vendor-order-status-when-allowed-and-cancelled-or-refunded-orders-are-final.md)); only the admin can.
- **Add-ons that own refunds.** `RefundHandler::handle_refund` returns at once when such an add-on is active (`lite:includes/Order/RefundHandler.php::handle_refund()`); those add-ons book credits through the `dokan_refund_adjust_vendor_balance` action and inherit this rule when they compute the share through `dokan_vendor_earning_in_refund`. An add-on that books only its own refund requests does not book a status-only refund, but the order's figures still go down.
- **Refunds made before DOKAN_SINCE** are not rebooked: an amount-only refund made earlier has no `dokan_refund` credit. The order's figures are recalculated on the next order save and then show the refund.
- WooCommerce's order note after case 2 says funds must be returned through the gateway manually (`wc:includes/wc-order-functions.php::wc_order_fully_refunded()`). Dokan adds no note of its own.
- When the order already has refunds that add up to its total, `wc_order_fully_refunded()` creates nothing.

## Why

A refunded order must not leave its Earning withdrawable. Lines say exactly which party each refunded amount came from; an amount without lines says nothing, so it is taken from every party in the proportion the order left them. Working each later share out from what is left keeps the credits of one order from adding up to more than its Earning.

## Consequences & risks

- An admin who refunds by amount, or sets an order to *Refunded*, now takes the Vendor's share back. Before DOKAN_SINCE the admin bore the whole refund in Dokan's books.
- A Vendor who marks their own order *Refunded* gives up the Earning, while the customer is not refunded by the gateway.
- With a Vendor-borne gateway fee, the order's figure after an amount-only refund is scaled with the fee included, so it can differ from the same refund entered by lines by the refunded share of the fee. The ledger is the same in both cases.

## Recommendations

- Remove or repair `manage_refunded_for_order`; a dormant money path makes the behaviour hard to reason about.
- Consider a one-off reconciliation for amount-only refunds made before DOKAN_SINCE.

_Rule amended in DOKAN_SINCE and verified against WooCommerce 11.3.0-beta.2 — 2026-11-26. Earlier text verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
