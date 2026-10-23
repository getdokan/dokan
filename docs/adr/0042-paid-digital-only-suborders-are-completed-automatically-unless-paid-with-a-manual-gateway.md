# Paid digital-only Suborders are completed automatically, unless paid with a manual gateway

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce completes an order straight after payment when nothing in it needs shipping (every product is virtual and downloadable). Dokan's Suborders, however, get their status from the parent Order through the downward copy, and they reach `processing` together with the parent. Without an extra step a Vendor selling only downloads would have to complete each Suborder by hand, and the parent's completion roll-up ([ADR-0037](./0037-a-parent-order-is-completed-automatically-only-when-every-suborder-is-completed.md)) would wait for them. Because `completed` is the default earning status, this step also decides when a digital Vendor's Earning starts to count.

## Rule

**[Lite]** When a Suborder changes status, Dokan looks at all of its siblings. Any sibling that is `processing` and contains only items that do not need processing is moved to `completed`, provided the Suborder that just changed is paid and was not paid with a manual gateway.

The step is the first part of `Order\Hooks::on_sub_order_change` (`lite:includes/Order/Hooks.php:391`, registered at priority 99 on `woocommerce_order_status_changed`, `:38`). For each sibling (`:411-416`) all four conditions must hold:

1. the sibling's status is `processing`;
2. the Suborder whose status just changed (`$order`) is paid, that is `WC_Order::is_paid()`, which by default means status `processing` or `completed` (`wc:includes/class-wc-order.php:1724-1726`, `wc:includes/wc-order-functions.php:134`);
3. the payment method of the Suborder that just changed is **not** in the excluded list, default `bacs`, `cheque`, `cod` (`lite:includes/Order/Hooks.php:409`);
4. the sibling does not need processing: `WC_Order::needs_processing()` is false, which by default means every line item's product is both downloadable and virtual (`wc:includes/class-wc-order.php:1871-1900`, filter `woocommerce_order_item_needs_processing`).

The sibling is then given status `completed` with the note "Marked as completed because it contains digital products only." and saved (`lite:includes/Order/Hooks.php:414-415`). Saving fires the sibling's own status hooks, so its ledger row moves to `wc-completed` like any other completion.

Conditions 2 and 3 are read from the Suborder that triggered the check, not from each sibling. Suborders copy the parent's payment method at creation (`Order\Manager::create_sub_order()`, `lite:includes/Order/Manager.php:620-621`), so all siblings normally share it.

## Settings that change it

| Control | Default | Effect |
|---|---|---|
| Filter `dokan_excluded_payment_gateways_on_order_status_update` | `[ 'bacs', 'cheque', 'cod' ]` | Gateways in the list never trigger auto-completion. Remove a gateway to let its digital-only Suborders complete automatically; add one (for example a gateway that only authorises) to stop it. |
| WooCommerce filter `woocommerce_order_item_needs_processing` | `! ( downloadable && virtual )` | Decides which items count as "digital". A product that is virtual but not downloadable needs processing by default and blocks auto-completion. |
| WooCommerce filter `woocommerce_order_is_paid` / `wc_get_is_paid_statuses()` | `processing`, `completed` | Decides which triggering statuses count as paid. |

There is no admin setting.

## Worked example

A customer buys an e-book (virtual and downloadable) from Vendor A and a T-shirt from Vendor B, paying by card. Dokan creates Order #300 with Suborders #301 (A) and #302 (B). Assume `dokan_withdraw[withdraw_order_status]` = `completed` only.

1. Payment moves #300 to `processing`; the downward copy moves #301 and then #302 to `processing`.
2. When #301 becomes `processing`, `on_sub_order_change` runs for #301. #301 is paid, card is not excluded, #301 is `processing` and does not need processing, so #301 becomes `completed`. #302 is still `pending` at that moment and is skipped.
3. When #302 becomes `processing`, the check runs again. #302 needs processing (a T-shirt), so it stays `processing`.

Vendor A's Earning on #301 now has the earning status `wc-completed`; Vendor B's does not until Vendor B completes #302.

Same Order paid by bank transfer (`bacs`): the gateway leaves #300 `on-hold`; when the Store Admin later marks #300 `processing`, condition 3 fails, so #301 stays `processing` until Vendor A or the admin completes it.

## Edge cases

- **A single-vendor digital Order is not handled here.** It has no parent, so `on_sub_order_change` returns at once; WooCommerce's own logic (payment completion choosing `completed` for orders that do not need processing) applies.
- **The trigger can be any sibling.** A digital Suborder is completed when *any* Suborder of the same parent changes status while the conditions hold, not only when it changes itself.
- **Mixed Suborders are never auto-completed.** One physical item in a Vendor's Suborder makes the whole Suborder need processing.

## Why

No recorded decision beyond the inline comment ("if the order is a downloadable and virtual product, then we need to set the status to complete", `lite:includes/Order/Hooks.php:412`) and the comment on the exclusion filter ("Exclude manual gateways from auto complete order status update for digital products", `:408`). The exclusion keeps orders paid by manual methods, where `processing` may be set before money is confirmed, under human control.

## Consequences & risks

- Digital Vendors' Earnings reach the default earning status (`wc-completed`) right after payment, without Vendor action.
- The paid check relies on the triggering Suborder's status. A gateway or extension that moves Suborders to `processing` before payment is confirmed would let downloads auto-complete early.

## Recommendations

- Evaluate `is_paid()` and the payment method per sibling rather than from the triggering Suborder, so the rule stays correct if Suborders ever stop sharing a payment method.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
