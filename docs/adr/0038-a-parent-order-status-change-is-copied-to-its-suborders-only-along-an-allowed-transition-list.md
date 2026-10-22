# A parent Order's status change is copied to its Suborders only along an allowed transition list

Status: Accepted (retroactive — documents existing code)

## Context

Lite ADR 0004 (`docs/adr/0004-vendor-order-is-authoritative-parent-is-mirror.md`) records that status changes move *down* from a multi-vendor Order to its Suborders, and Lite ADR 0011 (`docs/adr/0011-suborders-are-created-synchronously-at-checkout.md`) records how the Suborders come to exist. Neither records *which* status changes are copied. Teammates ask questions such as "if the admin cancels the Order, are all Vendor orders cancelled?" or "why is this Suborder still completed when the Order says refunded?". The answer is a transition whitelist, and it matters for money because every copied status change is also a ledger status change (see [ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md)).

## Rule

**[Lite]** When any order that has Suborders changes status, Dokan tries to give each Suborder the same status, but only if the Suborder's current status allows that move.

- `Order\Hooks::on_order_status_change` runs on `woocommerce_order_status_changed` at priority 10 (`lite:includes/Order/Hooks.php:36`, method at `:95`). WooCommerce fires that action from `WC_Order::status_transition()` whenever a saved order's status changes from a non-empty previous status (`wc:includes/class-wc-order.php:478`).
- The listener loads the order's children with `Order\Manager::get_child_orders()` (`lite:includes/Order/Manager.php:463-478`: type `shop_order`, `parent` = the order id, no limit, filter `dokan_get_child_orders_args`). For each child it calls `update_status( $new_status )` when `is_status_change_allowed( $current, $new )` returns true, and otherwise writes a "Skipped status update" line to the Dokan log (`lite:includes/Order/Hooks.php:125-138`, `:274-276`).
- It does not matter who changed the parent's status: the Store Admin in WP-admin, a payment gateway calling `payment_complete()`, WooCommerce's unpaid-order cleanup, or the customer cancelling a pending order all go through the same hook.
- A single-vendor Order has no Suborders (it is itself the Vendor order), so nothing is copied.

**The whitelist** (`lite:includes/Order/Hooks.php:205-213`). Read each row as "a Suborder currently in this status may be moved by the parent to …":

| Suborder's current status | Parent statuses that are copied down |
|---|---|
| `wc-pending` | any status |
| `wc-on-hold` | `wc-pending`, `wc-on-hold`, `wc-processing`, `wc-completed`, `wc-failed` |
| `wc-processing` | `wc-completed`, `wc-failed`, `wc-cancelled`, `wc-refunded` |
| `wc-completed` | `wc-refunded` |
| `wc-failed` | `wc-pending`, `wc-on-hold`, `wc-processing`, `wc-failed`, `wc-cancelled` |
| `wc-cancelled` | nothing (final) |
| `wc-refunded` | nothing (final) |

**The same table read the other way**, for the parent statuses teammates ask about most. "Follows" means the Suborder in that current status is moved to the parent's new status; every other Suborder keeps its status:

| Parent set to | Suborders that follow | Suborders that do not follow |
|---|---|---|
| `cancelled` | `pending`, `processing`, `failed` | `on-hold`, `completed`, `cancelled`, `refunded` |
| `failed` | `pending`, `on-hold`, `processing`, `failed` | `completed`, `cancelled`, `refunded` |
| `refunded` | `pending`, `processing`, `completed` | `on-hold`, `failed`, `cancelled`, `refunded` |
| `completed` | `pending`, `on-hold`, `processing` | `completed` (logged as skipped), `failed`, `cancelled`, `refunded` |
| `processing` | `pending`, `on-hold`, `failed` | `processing`, `completed`, `cancelled`, `refunded` |

Note that `pending` follows every parent status, including `refunded`, because its row is `any` (`lite:includes/Order/Hooks.php:206`). Copying a status down never moves money by itself: it only relabels each Suborder's ledger row. What a copied `cancelled`, `failed` or `refunded` status does to the Vendor's Balance is set out in [ADR-0040](./0040-cancelling-or-failing-a-vendor-order-drops-its-earning-from-the-balance-without-a-reversal-entry.md).

**How the list is evaluated** (`lite:includes/Order/Hooks.php:199-245`):

1. Both statuses are normalised to the `wc-` prefix (`:201-202`, `:256-258`).
2. If the Suborder's current status **or** the parent's new status is not a key of the whitelist, the move is allowed (`:233-236`). This covers custom statuses registered by other plugins, `wc-checkout-draft` and `wc-trash`.
3. If the current status's list contains `any`, the move is allowed (`:238-241`).
4. Otherwise the move is allowed only if the new status is in the list (`:244`).

Each copied change is a real `WC_Order::update_status()` on the Suborder, so it fires the Suborder's own WooCommerce emails and status hooks, including Dokan's ledger update and the completion roll-up described in [ADR-0037](./0037-a-parent-order-is-completed-automatically-only-when-every-suborder-is-completed.md).

Nothing is copied *upward* by this listener. A Vendor changing their own Suborder does not change the parent, except for the completion roll-up.

## Settings that change it

There is no admin setting. The whitelist is changed only through the filter `dokan_sub_order_status_update_whitelist` (`lite:includes/Order/Hooks.php:231`), which receives the array above and must return an array of the same shape (keys are current statuses with the `wc-` prefix, values are lists of allowed new statuses, `any` allows everything). Because unknown statuses are always allowed (step 2), an extension that wants to *protect* a status must add it as a key with an empty list, not leave it out.

## Worked example

A customer orders one item from Vendor A and one from Vendor B. Dokan creates Order #300 with Suborders #301 (A) and #302 (B), all `pending`.

1. The gateway marks #300 paid, so #300 moves `pending → processing`. Both Suborders are `pending`, which allows any status: #301 and #302 become `processing`.
2. Vendor A marks #301 `completed`. #300 is not touched (no upward copy; #302 is not complete, so the roll-up does not fire either).
3. The Store Admin sets #300 to `cancelled`. #301 is `completed`, whose list only allows `wc-refunded`, so #301 stays `completed` and a skip is logged. #302 is `processing`, which allows `wc-cancelled`, so #302 becomes `cancelled`.
4. The Store Admin then sets #300 to `processing` again. #301 (`completed`) does not allow it; #302 (`cancelled`) allows nothing. Neither Suborder changes.

Result: the Order says `processing`, Vendor A's order says `completed`, Vendor B's order says `cancelled`. Vendor A's Earning keeps its earning status; Vendor B's does not (see [ADR-0040](./0040-cancelling-or-failing-a-vendor-order-drops-its-earning-from-the-balance-without-a-reversal-entry.md)).

## Edge cases

- **On-hold orders are not cancelled or refunded from the parent.** `wc-on-hold` does not list `wc-cancelled` or `wc-refunded`. An Order paid by bank transfer that sits `on-hold` and is then cancelled by the Store Admin leaves its Suborders `on-hold`; they must be cancelled one by one.
- **Processing orders do not go back.** `wc-processing` does not list `wc-pending` or `wc-on-hold`, so putting a paid parent back on hold does not move its Suborders.
- **Completed orders only follow a refund.** A completed Suborder can still be moved to `refunded` by the parent, but not to `cancelled`, `failed` or `processing`.
- **Unpaid Suborders follow a refund too.** A `pending` Suborder accepts any parent status, so setting the parent to `refunded` also moves `pending` Suborders to `refunded`, which is final for them afterwards.
- **A parent set to Refunded creates refunds that move no Vendor money.** WooCommerce answers every move to `refunded` with `wc_order_fully_refunded()`, an amount-only refund with no lines (`wc:includes/wc-order-functions.php:915-940`). On the parent, Dokan ignores that refund because it is a parent-order refund (`lite:includes/Order/RefundHandler.php:52-54`). On each Suborder that follows, the same WooCommerce function creates a line-less refund whose Vendor share is 0, so no credit is booked (`lite:includes/Order/RefundHandler.php:214-216`; an add-on may take over refund handling, `:39-41`), and the Suborder's ledger row becomes `wc-refunded`, which always counts. The Vendor keeps the Earning. See the cancel/fail ADR linked above for every branch.
- **Custom statuses bypass the list in both directions.** A parent moved to a status that is not a key (for example a "shipped" status added by another plugin) overwrites every Suborder, including `cancelled` and `refunded` ones, and a Suborder sitting in such a status accepts any parent status.
- **Same-status moves are skipped where the list does not repeat the status.** When the completion roll-up sets the parent to `completed`, the listener tries to copy `completed` to Suborders that are already `completed`; `wc-completed` does not list itself, so these are logged as skipped. This is harmless noise in the log.
- **Admin-created Orders** are split inside this same listener before the copy runs (Lite ADR 0011), so their brand-new Suborders receive the status in the same request.

## Why

The whitelist and its filter were introduced together (`@since 3.12.2`, docblock at `lite:includes/Order/Hooks.php:186-198`) to stop parent status changes from overwriting Suborders that had already reached a later or final state. The docblock describes it as a configurable list of allowed transitions; no further rationale is recorded.

## Consequences & risks

- A parent Order and its Suborders can legitimately show different statuses. Reports and support answers should read the Vendor order's status, not the parent's, when the question is about a Vendor's money (Lite ADR 0004).
- Cancelling or refunding a multi-vendor Order from the parent is not a reliable way to cancel or refund every Vendor order. Each Suborder whose status is not in the matching list keeps its status and its Earning status.
- Skips are written only to the Dokan log. The Store Admin gets no order note or notice that a Suborder did not follow.

## Recommendations

- Consider adding `wc-cancelled` (and possibly `wc-refunded`) to the `wc-on-hold` row; cancelling an unpaid bank-transfer Order is the most common case where the current list surprises admins.
- Consider treating statuses that are not keys as "deny" for the *current* status of a final Suborder, so custom parent statuses cannot overwrite `cancelled` or `refunded` Suborders.
- Add an order note on the parent when a Suborder is skipped, so the divergence is visible where the admin is looking.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
