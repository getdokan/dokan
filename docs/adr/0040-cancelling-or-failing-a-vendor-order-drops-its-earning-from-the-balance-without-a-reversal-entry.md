# Cancelling or failing a Vendor order drops its earning from the balance without a reversal entry

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Teammates ask "what happens to the Vendor's money when an order is cancelled?" and "is a reversing entry written?". Unlike a refund, which books a credit (see [ADR-0047](./0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md) and the other [refund ADRs](decisions-index.md#refunds)), cancellation and payment failure are handled purely through the ledger status rules: [ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md) and [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md). This ADR spells out the consequence for these two statuses because it is asked so often, and contrasts it with the third question in the same family: "what happens to the Vendor's balance when someone just changes the status to Refunded?".

## Rule

**[Lite]** When a Vendor order moves to `cancelled` or `failed`, Dokan writes no ledger entry and changes no amount. Its Balance row's status becomes `wc-cancelled` or `wc-failed`, which are not earning statuses, so the Earning simply stops counting. If the order later moves back to an earning status, the same Earning counts again.

- The status change is copied to the row by `Order\Hooks::on_order_status_change` (`lite:includes/Order/Hooks.php:173-183`).
- `wc-cancelled` and `wc-failed` are never in the list built by `dokan_withdraw_get_active_order_status()` (`lite:includes/Withdraw/functions.php:355-366`) unless an extension adds them through `dokan_withdraw_active_status`; the admin option offers only Completed, Processing and On-hold (`lite:includes/Utilities/AdminSettings.php:62-71`), a list extensions can extend through the filter `dokan_settings_withdraw_order_status_options`.
- No code path inserts a negative or offsetting row for cancellation or failure. `RefundHandler` reacts only to WooCommerce refunds (`lite:includes/Order/RefundHandler.php:18`), and WooCommerce does not create a refund when an order is cancelled.
- The `dokan_orders` row keeps its `net_amount` and `order_total`; only its `order_status` is overwritten (`lite:includes/Order/Hooks.php:117-123`). Refund credits already booked for the order stay as they are.

**How the Balance query drops it.** Earnings and Balance sum `dokan_orders` debits only where the row's status is in the active list (`lite:includes/Vendor/Vendor.php:836`, `:896`). That list is `wc-refunded` plus the statuses selected in `dokan_withdraw[withdraw_order_status]` (`lite:includes/Withdraw/functions.php:355-366`).

**Compared with setting the status to Refunded.** *Refunded* is the opposite case: `wc-refunded` is always in the active list, so the debit keeps counting, and money leaves the Balance only through `dokan_refund` credit rows. Which credit (if any) is written depends on how the order became *Refunded*:

| How the order became Refunded | What Dokan books | Effect on the Vendor's Balance |
|---|---|---|
| Itemised refund on a Vendor order (amounts or quantities entered against product, shipping or tax lines) | WooCommerce fires `woocommerce_order_refunded` (`wc:includes/wc-order-functions.php:752`). `RefundHandler::handle_refund` computes the Vendor's share with `OrderRefundCommission::get_vendor_total_refund()` = prorated line-item Earning + Vendor tax + Vendor shipping − gateway fee returned (`lite:includes/Commission/OrderRefundCommission.php:287-295`) and inserts an approved `dokan_refund` credit for it, only if it is greater than 0 (`lite:includes/Order/RefundHandler.php:214-238`). | Falls by the Vendor's share. A refund of every line credits the whole Earning, so debit minus credit is 0. |
| Status only (admin, or a Vendor with `dokan_selling[order_status_change]` = `on`, sets *Refunded* with no itemised refund) | WooCommerce's `wc_order_fully_refunded()` creates a refund for the remaining total with **no lines** (`wc:includes/wc-order-functions.php:915-940`). The Vendor's share is computed from refund lines only (`lite:includes/Commission/OrderCommission.php:167`; shipping `lite:includes/Commission/OrderRefundCommission.php:387-399`; tax `:464-480`), so it is 0 and no credit is inserted. The debit row becomes `wc-refunded`. | **Unchanged.** The full Earning keeps counting. See [ADR-0049](./0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md). |
| Any refund created on a **parent** Order that has Suborders (itemised or status-only) | Ignored. `handle_refund` returns early for parent-order refunds (`lite:includes/Order/RefundHandler.php:52-54`), and `get_vendor_total_refund()` returns 0 when the order has Suborders (`lite:includes/Commission/OrderRefundCommission.php:288-290`). | **Unchanged** by the parent refund itself. Vendor Balances move only through refunds created on the Suborders (Lite ADR 0004, `docs/adr/0004-vendor-order-is-authoritative-parent-is-mirror.md`). If the parent is set to *Refunded*, the status is copied to its `pending`, `processing` and `completed` Suborders (not `on-hold` or `failed` ones), each of which then gets its own line-less refund, so the row above applies: no credit. |
| A premium add-on is active (`dokan()->is_pro_exists()` is true) | Lite's `handle_refund` returns immediately (`lite:includes/Order/RefundHandler.php:39-41`); refund booking is the add-on's responsibility. | Decided by the add-on, not by this table. |

`Order\Hooks::manage_refunded_for_order` (priority 15 on `woocommerce_order_status_changed`, `lite:includes/Order/Hooks.php:37`) looks as though it credits the whole Earning when a Vendor sets *Refunded* from the dashboard, but it never inserts anything: it compares the status with `wc-refunded` while WooCommerce passes statuses without the prefix (`wc:includes/abstracts/abstract-wc-order.php:905`), and it requires a `post_type=shop_order` field that the dashboard form does not send (`lite:includes/Order/Hooks.php:294-309`, `lite:templates/orders/details.php:225-241`).

**Who can cancel what:**

- On a multi-vendor Order, cancelling the parent cancels only the Suborders whose current status accepts `wc-cancelled` under the whitelist: `pending`, `processing` and `failed` ones. `completed` and `on-hold` Suborders keep their status and their Earning status ([ADR-0038](./0038-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md)). A failed parent likewise fails only `pending`, `on-hold` and `processing` Suborders.
- A Vendor can cancel their own Vendor order from the Vendor dashboard when allowed ([ADR-0045](./0045-vendors-change-only-their-own-vendor-order-status-when-allowed-and-cancelled-or-refunded-orders-are-final.md)). Cancelling a Suborder does not change the parent Order.
- WooCommerce itself cancels unpaid `pending` orders when the hold-stock time runs out; those Earnings had not counted anyway.

## Settings that change it

| Setting | Default | Effect |
|---|---|---|
| `dokan_withdraw[withdraw_order_status]` | `wc-completed` at runtime (see the earning-status ADR for the differing defaults) | Decides whether the Earning counted *before* the cancellation. If only `wc-completed` is selected, cancelling a `processing` order changes nothing visible; if `wc-processing` is selected, the Earning disappears from the Balance on cancellation. |
| Filter `dokan_withdraw_active_status` | — | An extension that adds `wc-cancelled` or `wc-failed` would keep those Earnings counted. No shipped code does this. |
| `dokan_withdraw[exclude_cod_payment]` | `off` | Under the exclusion, a cash-on-delivery order's row never had an earning status, so cancellation has no effect on the Balance. |

## Worked example

Settings: Commission `fixed` 10 percent; `withdraw_order_status` = `wc-completed`, `wc-processing`; `balance_date` passed.

Order #300 → #301 (Vendor A, Earning 54.00) and #302 (Vendor B, Earning 36.00), both `processing` after payment. Vendor A completes #301.

1. Balances: A 54.00, B 36.00.
2. The Store Admin cancels Order #300. #301 is `completed` and does not accept `wc-cancelled`, so it stays `completed`; #302 becomes `cancelled`. Balances: A 54.00, B 0.00. No new ledger row exists; #302's row still shows `debit 36.00` with status `wc-cancelled`.
3. The customer changes their mind and the Store Admin sets #302 back to `processing` directly. #302's row becomes `wc-processing`; B's Balance is 36.00 again.
4. Instead of cancelling, the Store Admin sets #300 to `refunded` with no itemised refund. WooCommerce creates a line-less refund of the full total on #300, which Dokan ignores (parent refund). The status is copied to #301 (`completed` accepts `wc-refunded`) and #302 (`processing` accepts it). On each, WooCommerce creates a line-less refund whose Vendor share is 0, so no credit is written. Both rows become `wc-refunded`, which always counts. Balances: A 54.00, B 36.00, unchanged.
5. If the Store Admin had instead refunded #302 line by line in full (one item, Earning 36.00, no shipping or tax), Dokan would insert a `dokan_refund` credit of 36.00 for Vendor B. #302's debit (now `wc-refunded`) still counts 36.00, so B's Balance is 36.00 − 36.00 = 0.00.

## Edge cases

- **Cancelling after a Withdraw.** If the Vendor had already withdrawn money that included this Earning, the Earning stops counting but the Withdraw credit remains, so the Vendor's Balance drops, possibly below zero. Dokan records no separate debt for it. What a negative Balance means for future Withdraws is a `05-…` topic.
- **Cancelled is final for Vendors.** The Vendor dashboard does not offer status changes on a cancelled order, so only the Store Admin can bring it back.
- **Reverse withdrawal is unaffected.** The Reverse withdrawal ledger books its entry when a Vendor order paid with a gateway enabled for Reverse withdrawal (cash on delivery) moves to *completed* (`lite:includes/ReverseWithdrawal/Hooks.php:187-227`), and is governed by Lite ADR 0014 (`docs/adr/0014-reverse-withdrawal-is-a-separate-receivable-ledger.md`), not by this rule.
- **Gateway fees already deducted stay deducted.** A fee that adjusted the row's amount before cancellation is not restored; the row just stops counting.

## Why

No recorded decision. Driving Balance from status keeps cancellation reversible and avoids pairs of offsetting rows for orders that never really paid out.

## Consequences & risks

- The ledger cannot show *when* an Earning stopped counting; only the order notes do.
- Whether a cancellation visibly changes a Vendor's Balance depends on the earning-status setting, which surprises teammates comparing two marketplaces.
- A Vendor can end up with a negative Balance after cancellation without any explicit debit row explaining it.

## Recommendations

- When an order that had an earning status is cancelled after a Withdraw, add an order note (or Vendor notification) so the Balance drop is explainable.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
