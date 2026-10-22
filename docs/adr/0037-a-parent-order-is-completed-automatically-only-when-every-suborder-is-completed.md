# A parent Order is completed automatically only when every Suborder is completed

Status: Accepted (retroactive — documents existing code)

## Context

Status changes normally flow from a multi-vendor Order down to its Suborders ([ADR-0038](./0038-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md); direction recorded in Lite ADR 0004, `docs/adr/0004-vendor-order-is-authoritative-parent-is-mirror.md`). Vendors, however, work on their own Suborders, and the customer sees the parent Order. Teammates ask "when does the customer's Order become completed?" and "if one Vendor cancels, what happens to the Order?". There is exactly one upward rule.

## Rule

**[Lite]** Whenever a Suborder changes status, Dokan checks all Suborders of the same parent. If every one of them is `completed`, it sets the parent Order to `completed`. No other Suborder status is ever copied up.

- `Order\Hooks::on_sub_order_change` runs on `woocommerce_order_status_changed` at priority 99 (`lite:includes/Order/Hooks.php:38`, method at `:391-430`).
- It returns at once for an order whose `parent_id` is 0 (`:393-395`), so it acts only on Suborders. A single-vendor Order has no parent and therefore no roll-up; its own status is the Vendor order status.
- It loads all siblings with `Manager::get_child_orders( $parent_id )` (`:398-403`). Before checking, it may auto-complete digital-only siblings (see [ADR-0042](./0042-paid-digital-only-suborders-are-completed-automatically-unless-paid-with-a-manual-gateway.md)).
- If any sibling's status is not exactly `completed`, nothing happens (`:418-421`). Otherwise it calls `update_status( 'wc-completed', 'Mark parent order completed when all child orders are completed.' )` on the parent (`:426-429`).
- The check runs on every Suborder status change, not only on moves to `completed`, so the parent completes as soon as the last open Suborder completes, whatever triggered it.

Cancelled, refunded, failed, on-hold and processing Suborders never change the parent. In particular, a Vendor cancelling or refunding their Suborder leaves the parent Order in whatever status it had.

## Settings that change it

None. The rule has no option and no filter of its own. The only adjustable part is the digital-only auto-complete step that runs before the check (filter `dokan_excluded_payment_gateways_on_order_status_update`, covered in the linked ADR).

## Worked example

Order #300 has Suborders #301 (Vendor A) and #302 (Vendor B), all `processing` after payment.

1. Vendor A marks #301 `completed`. Siblings: #301 `completed`, #302 `processing`. Not all completed, so #300 stays `processing`.
2. Vendor B marks #302 `completed`. Siblings: both `completed`. #300 is set to `completed` with the note above. That parent change then triggers the downward copy, which finds both Suborders already `completed` and logs two harmless skips.

Alternative: in step 2 Vendor B cancels #302 instead. Siblings: `completed` and `cancelled`. #300 stays `processing` indefinitely; the Store Admin has to complete or otherwise close it by hand.

## Edge cases

- **One cancelled Suborder blocks completion forever.** Because the check demands `completed` for every sibling, a multi-vendor Order where one Vendor's part was cancelled or refunded never completes automatically.
- **The parent is set to `completed` even if it was cancelled.** The roll-up does not look at the parent's current status. Example: #301 is `completed` and #302 is `on-hold` when the Store Admin cancels #300. The downward copy leaves both Suborders alone (`completed` and `on-hold` do not accept `wc-cancelled`). If Vendor B later completes #302, every Suborder is `completed` and #300 moves from `cancelled` back to `completed`.
- **The parent has no ledger rows.** Completing the parent changes no Vendor money directly; the Earnings belong to the Suborders, which were already `completed` (Lite ADR 0004).
- **Parent completion re-enters the downward copy.** `update_status()` on the parent fires `woocommerce_order_status_changed` for the parent, so `on_order_status_change` runs again; with every Suborder already `completed`, it changes nothing.

## Why

No recorded decision beyond the method's docblock ("Mark the parent order as complete when all the child order are completed", `lite:includes/Order/Hooks.php:381-390`). Completion is the one state where the customer-facing Order can be derived unambiguously from its Vendor orders; for mixed outcomes there is no single correct parent status, so Dokan leaves it alone.

## Consequences & risks

- The customer's Order shows `completed` only when every Vendor has finished. Customers with one slow Vendor see `processing` even though the rest of their items are delivered.
- Marketplaces that rely on the parent's status for customer emails, reviews or analytics get no signal for partially fulfilled or partially cancelled Orders.
- Support staff must look at Suborders, not the parent, to see who has fulfilled what.

## Recommendations

- Consider rolling up a parent to `cancelled` or `refunded` when every Suborder reached that same final status, and to `completed` when every Suborder is in a final state with at least one `completed`, so mixed outcomes do not leave the parent open forever.
- Skip the roll-up when the parent is already `cancelled` or `refunded`, so a late Suborder event cannot re-open a closed Order.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
