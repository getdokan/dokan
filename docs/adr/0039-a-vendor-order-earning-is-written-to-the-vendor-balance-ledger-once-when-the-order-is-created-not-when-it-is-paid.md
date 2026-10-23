# A Vendor order's earning is written to the vendor balance ledger once, when the order is created, not when it is paid

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Teammates ask "when does a Vendor get credited for an order?" and "why does the ledger already have a row for an unpaid order?". Dokan keeps two custom tables for a Vendor's money (Lite ADR 0013, `docs/adr/0013-marketplace-money-lives-in-custom-tables-not-post-types.md`): `dokan_orders` (one summary row per Vendor order) and `dokan_vendor_balance` (the Balance ledger). Lite ADR 0011 (`docs/adr/0011-suborders-are-created-synchronously-at-checkout.md`) records that `dokan_sync_insert_order` is hooked next to the split. This ADR records what that function writes, for which orders, and when.

## Rule

**[Lite]** Each Vendor order gets exactly one `dokan_orders` row and one `dokan_orders`-type Balance row, written as soon as the Vendor order exists, before payment. The Balance row holds the Vendor's Earning in its `debit` column and starts with an **empty status**, so it does not count yet. Status changes then decide whether it counts (see [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)).

**When it runs.** `dokan_sync_insert_order( $order_id )` (`lite:includes/Order/functions.php:217-283`) is hooked to:

- `dokan_checkout_update_order_meta` (`lite:includes/Order/Hooks.php:49`), which the splitter fires for a single-vendor Order after tagging it with `_dokan_vendor_id` (`lite:includes/Order/Manager.php:940-943`) and for each new Suborder after it is saved (`lite:includes/Order/Manager.php:661`);
- the two checkout hooks at priority 20, after the split at priority 10 (`lite:includes/Order/Hooks.php:45-46`);
- `woocommerce_process_shop_order_meta` at priority 60, registered only in WP-admin requests (`lite:includes/Order/Hooks.php:54-56`).

At checkout this happens while the order is still `pending`; payment comes later.

**Which orders get rows.** The function returns without writing when (`lite:includes/Order/functions.php:227-237`):

- the order cannot be loaded, or is a `WC_Subscription`;
- the order already has a `dokan_orders` row (`Order\Manager::is_order_already_synced()`, `lite:includes/Order/Manager.php:366-381`) — this makes the many hook registrations idempotent;
- the order is a parent with `has_sub_order` = 1. A multi-vendor Order therefore never has rows; its Suborders do (Lite ADR 0004, `docs/adr/0004-vendor-order-is-authoritative-parent-is-mirror.md`).

A single-vendor Order is its own Vendor order and gets the rows itself.

**What is written** (`lite:includes/Order/functions.php:239-282`):

| Table | Column | Value |
|---|---|---|
| `dokan_orders` | `order_id`, `seller_id` | the Vendor order and its Vendor (`dokan_get_seller_id_by_order()`, `:296-357`) |
| | `order_total` | `$order->get_total()` |
| | `net_amount` | the Earning from `Commission::get_earning_by_order( $order, 'seller' )` (`lite:includes/Commission.php:204`); the function branches on `dokan_is_admin_coupon_applied()` but both branches use the `seller` context, which is the default (`:243-247`); then filter `dokan_order_net_amount` (`:249`) |
| | `order_status` | `'wc-' . $order->get_status()` |
| `dokan_vendor_balance` | `vendor_id`, `trn_id` | the Vendor and the Vendor order id |
| | `trn_type`, `perticulars` | `dokan_orders`, `New order` |
| | `debit` / `credit` | the same Earning / 0 |
| | `status` | **not set**: the model default, an empty string (`lite:includes/Models/VendorBalance.php:32-42`) |
| | `trn_date` / `balance_date` | now / now plus the Vendor's withdraw threshold days (`dokan_get_withdraw_threshold()`, `:250`, `:280-281`) |

Before inserting, the function calls `Order\Manager::delete_seller_order( $order_id, $seller_id )` (`:252`), so a re-sync replaces stale rows for that order instead of duplicating them.

**Column meaning.** In `dokan_vendor_balance` the `debit` column is money owed *to* the Vendor (Earnings) and `credit` is money taken *from* the Vendor (refunds, Withdraws). Every Balance query computes `SUM(debit) - SUM(credit)`. This is the reverse of the usual bookkeeping meaning of the words; read the columns as "+" and "−".

## Settings that change it

No setting switches the write on or off. Settings that change the *values* written are owned elsewhere:

- the Commission formula and Fee recipients decide the Earning ([ADR-0012](./0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md) and the [commission](decisions-index.md#commission) and [fee-recipient](decisions-index.md#fees-shipping-and-tax-attribution) ADRs);
- `dokan_withdraw[withdraw_date_limit]` (or the Vendor's `withdraw_date_limit` user meta) sets `balance_date`; what that date means for withdrawing belongs to the `05-…` withdraw ADRs.

## Worked example

Settings: Commission `fixed` with `admin_percentage = 10`, `additional_fee = 0`; Fee recipients at their defaults; no coupons; withdraw threshold 3 days.

Single-vendor Order #200: one item at 100.00 from Vendor V, placed at 2026-10-22 10:00. At checkout, while #200 is `pending`:

- `dokan_orders`: `(order_id 200, seller_id V, order_total 100.00, net_amount 90.00, order_status 'wc-pending')`
- `dokan_vendor_balance`: `(vendor_id V, trn_id 200, trn_type 'dokan_orders', perticulars 'New order', debit 90.00, credit 0, status '', trn_date 2026-10-22 10:00, balance_date 2026-10-25 10:00)`

Multi-vendor Order #300: 60.00 from Vendor A and 40.00 from Vendor B. Rows are written for Suborder #301 (`order_total 60.00`, `net_amount 54.00`, debit 54.00) and #302 (`order_total 40.00`, `net_amount 36.00`, debit 36.00). Order #300 has no row in either table.

When payment later moves the Vendor orders to `processing`, the status columns are filled in ([ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md)); the amounts stay as written.

## Edge cases

- **Vendor orders created already past `pending`.** `create_sub_order()` saves the Suborder with the parent's status (`lite:includes/Order/Manager.php:652-654`) *before* firing `dokan_checkout_update_order_meta` (`:661`). If the parent is not `pending` (for example a multi-vendor Order created in WP-admin directly as `processing`), the Suborder's status transition fires while it has no rows yet, so the rows are written afterwards with `dokan_orders.order_status` correct but the Balance `status` empty. The Earning does not count until the next status change of that Suborder.
- **Orders created outside checkout and outside WP-admin** (for example programmatically through `wc_create_order()`) get no rows until something calls `dokan_sync_insert_order()` or `dokan()->order->maybe_split_orders()` (Lite ADR 0011).
- **Unresolvable Vendor.** If `dokan_get_seller_id_by_order()` returns 0, rows are written with `seller_id` / `vendor_id` 0 and belong to no Vendor.
- **Re-sync deletes more than the order row.** `delete_seller_order()` also deletes the order's `dokan_refund` rows and its Balance rows of types `dokan_orders`, `dokan_refund` and `dokan_withdraw`, and its Reverse withdrawal rows (`lite:includes/Order/Manager.php:490-547`). Because the function first returns when a `dokan_orders` row exists, this only matters when the Balance rows exist without a `dokan_orders` row.
- **Unpaid orders keep their rows.** A checkout that is never paid leaves rows with an empty or `wc-pending`/`wc-cancelled` status. They never count, but raw reads of the table see them.

## Why

No recorded decision. Writing the row at creation gives every Vendor order one ledger row whose status can then follow the order, instead of inserting and deleting rows as orders move in and out of paid states.

## Consequences & risks

- Anything that reads `dokan_vendor_balance` or `dokan_orders` directly must filter by status; the tables contain rows for unpaid, cancelled and failed orders.
- The empty initial status is invisible in the UI. An Earning stuck at an empty status (see the first edge case) silently never reaches the Balance.
- Commission is calculated, and frozen onto the line items (Lite ADR 0012), at this first sync, so the terms in force at checkout apply even if payment happens days later.

## Recommendations

- Write the Balance row with the order's current status (as `dokan_orders` already does) instead of leaving it empty, so a Vendor order created past `pending` is not stranded.
- Document `dokan_sync_insert_order()` as the supported way for integrations to book an order they create outside checkout.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
