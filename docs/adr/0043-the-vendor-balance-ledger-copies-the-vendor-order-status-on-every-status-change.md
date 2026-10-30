# The vendor balance ledger copies the Vendor order's status on every status change

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A Vendor order's Earning is written once, at creation, with an empty ledger status ([ADR-0039](./0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md)). Whether that Earning counts depends on the status stored next to it ([ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)). This ADR records how that stored status is kept in step with WooCommerce, which answers "what does Dokan do to the Vendor's money when an order changes status?". The short answer: it changes a label, never an amount.

## Rule

**[Lite]** On every WooCommerce status change of an order, Dokan writes the new status, with the `wc-` prefix, into that order's `dokan_orders.order_status` and into the `status` of that order's `dokan_orders`-type Balance row. It does not insert, delete or re-price anything.

- `Order\Hooks::on_order_status_change` (`lite:includes/Order/Hooks.php:95`, priority 10 on `woocommerce_order_status_changed`, `:36`) adds the `wc-` prefix (`:111-114`), then:
  - updates `dokan_orders.order_status` where `order_id` = the order (`:117-123`);
  - copies the status to Suborders through the whitelist (`:125-138`; see [ADR-0038](./0038-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md));
  - unless the cash-on-delivery exclusion applies (`:145-171`; see [ADR-0057](./0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md)), updates `dokan_vendor_balance.status` where `trn_id` = the order and `trn_type` = `dokan_orders` (`:173-183`).
- Only the order's own `dokan_orders`-type row is touched. Refund credits (`trn_type` `dokan_refund`, status `approved`) and Withdraw rows keep their status.
- For a multi-vendor parent the two updates match no rows, because a parent has none. Each Suborder's rows are updated when the copied status change fires `woocommerce_order_status_changed` for that Suborder.
- For a single-vendor Order the updates hit the Order's own rows directly.
- Trashing is handled by a separate listener that writes the current status (`wc-trash`) the same way (`lite:includes/Order/OrderEventListener.php:11-12`, `:75-101`); see [ADR-0044](./0044-trashing-an-order-parks-its-vendor-earning-and-deleting-it-in-wp-admin-erases-its-ledger-rows.md).

Amounts change only through other paths: order edits ([ADR-0041](./0041-editing-a-vendor-order-recalculates-its-earning-in-the-vendor-balance-ledger.md)), gateway fees, and refunds ([ADR-0047](./0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md) and the other [refund ADRs](decisions-index.md#refunds)).

## Settings that change it

| Setting | Default | Effect |
|---|---|---|
| `dokan_withdraw[exclude_cod_payment]` (admin UI: "COD Payments", stored inverted as `include_cod_payments_in_balance`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:978-988`) | `off` (include), read at `lite:includes/Order/Hooks.php:145` | When `on` and the order's payment method is `cod`, the Balance row's status is **not** updated; `dokan_orders.order_status` and the Suborder copy still happen. Filter `dokan_order_should_exclude_from_vendor_balance` (`lite:includes/Order/Hooks.php:160-167`) can force either outcome per order. |

Nothing else changes this rule.

## Worked example

Suborder #301 (Vendor A, Earning 54.00) from checkout onward:

| Event | `dokan_orders.order_status` | Balance row `status` | Balance row `debit` |
|---|---|---|---|
| Created at checkout | `wc-pending` | `''` | 54.00 |
| Parent paid, copied down: `pending → processing` | `wc-processing` | `wc-processing` | 54.00 |
| Vendor A completes it | `wc-completed` | `wc-completed` | 54.00 |
| Store Admin sets it to `cancelled` | `wc-cancelled` | `wc-cancelled` | 54.00 |

The debit never changes; only the status does.

## Edge cases

- **Status changes that are not WooCommerce transitions are not copied.** Direct database edits, `set_status()` without `save()`, and saves where the status does not change do not fire `woocommerce_order_status_changed`, so the ledger keeps its previous status.
- **The first change after creation fills the empty status.** At checkout the usual first change is `pending → processing` (or `on-hold`) at payment. A Vendor order that never changes status after creation keeps the empty status forever.
- **Custom statuses are stored as is**, with the `wc-` prefix (for example `wc-shipped`). Whether they count depends only on the earning-status list.
- **`dokan_orders.order_status` and the Balance status can differ** for cash-on-delivery orders under the exclusion, and for Vendor orders created already past `pending` (the Balance status stays empty while `dokan_orders` has the real status).

## Why

No recorded decision. Copying the status keeps a single ledger row per Vendor order meaningful across the whole order life cycle, so that "does this Earning count?" can be answered with a status filter at read time.

## Consequences & risks

- Reversals are cheap and exact: moving an order back to an earning status makes its Earning count again with the same amount.
- There is no history in the ledger. The row shows only the latest status, so "when did this Earning become withdrawable?" cannot be answered from the ledger; WooCommerce order notes are the record.
- Reports that count Earnings must apply the same status filter as the Balance queries, or they will include unpaid, cancelled and failed orders.

## Recommendations

- Treat `dokan_orders.order_status` and `dokan_vendor_balance.status` as caches of the WooCommerce status. Tools that repair data should recompute them from the order rather than edit them by hand.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
