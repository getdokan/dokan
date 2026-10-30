# Trashing an order parks its Vendor earning, and deleting it in WP-admin erases its ledger rows

Status: Accepted (retroactive — documents existing code)

## Context

Store Admins trash test orders, fraudulent orders and duplicates, and sometimes delete them permanently. Teammates ask "does trashing an order take the money out of the Vendor's balance?" and "what happens to the ledger when an order is deleted?". Trash and deletion are not status transitions in the usual sense, so they are handled by separate listeners from the status rules in [ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md).

## Rule

**[Lite]** Trashing a Vendor order sets its ledger status to `wc-trash`, which is not an earning status, so its Earning stops counting; restoring it puts the previous status back. Permanently deleting an order during a WP-admin request deletes all of its Dokan ledger rows, and those of its Suborders that are not themselves in the trash. In WP-admin, trashing, restoring or deleting a parent Order does the same to its Suborders (deletion reaches only Suborders that are not already trashed; trashed ones are erased when they are deleted themselves).

**Trash.**

- `OrderEventListener` is always loaded (`lite:includes/Order/Controller.php:40`). On `woocommerce_trash_order` it reloads the order and writes its current status, which is now `trash`, as `wc-trash` into `dokan_orders.order_status` and into the order's `dokan_orders`-type Balance row (`lite:includes/Order/OrderEventListener.php:11`, `:25-36`, `:75-101`), then logs who did it (`:111-143`).
- WooCommerce fires `woocommerce_trash_order` when an order is trashed through its data store: `WC_Order::delete( false )` on posts storage (`wc:includes/data-stores/abstract-wc-order-data-store-cpt.php:325-336`) and on HPOS (`wc:src/Internal/DataStores/Orders/OrdersTableDataStore.php:2695`).
- `wc-trash` is never an earning status ([ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)), so the Earning is parked: still in the ledger with its amount, not counted.

**Restore.**

- Restoring through the data store sets the order back to its previous status and saves it (`wc:src/Internal/DataStores/Orders/OrdersTableDataStore.php:2916-2930` on HPOS; `wc:includes/data-stores/class-wc-order-data-store-cpt.php:1242-1262` on posts storage). That save is a normal `trash → previous` status transition, so `Order\Hooks::on_order_status_change` writes the previous status back to both rows.
- On HPOS WooCommerce also fires `woocommerce_untrash_order` *before* the restore (`OrdersTableDataStore.php:2916`); the listener's write at that moment still sees `trash` and is overwritten by the transition that follows.

**Parent and Suborders (WP-admin requests only).** `Order\Admin\Hooks` is loaded only when `is_admin()` is true (`lite:includes/Order/Controller.php:42-45`). It:

- trashes every Suborder when a parent Order is trashed (`$child->delete( false )`, `lite:includes/Order/Admin/Hooks.php:462-476`, hooked at `:40` for HPOS and `:53` for posts storage), which parks each Suborder's Earning through the listener above;
- restores every trashed Suborder through the data store when the parent is restored (`lite:includes/Order/Admin/Hooks.php:488-518`, hooked at `:41` / `:54`), which restores their ledger status;
- on permanent deletion (`woocommerce_delete_order` on HPOS, `delete_post` on posts storage, `:42` / `:55`) calls `Order\Manager::delete_seller_order_with_suborders()` (`lite:includes/Order/Manager.php:559-571`).

**Delete.** `Order\Manager::delete_seller_order()` (`lite:includes/Order/Manager.php:490-547`) removes, for the order id:

- the `dokan_orders` row (`:505`);
- `dokan_refund` rows (`:513-518`), then fires `dokan_after_deleting_seller_order` (`:523`);
- `dokan_vendor_balance` rows whose `trn_id` is the order id and whose `trn_type` is `dokan_orders`, `dokan_refund` or `dokan_withdraw` (`:525-531`);
- Reverse withdrawal rows of types `order_commission`, `manual_order_commission` and `order_refund` for the order (`:537-543`).

`delete_seller_order_with_suborders()` then deletes each Suborder returned by `get_child_orders()` permanently (`lite:includes/Order/Manager.php:563-570`), which re-enters the same handler for that Suborder. `get_child_orders()` uses WooCommerce's default status list, which leaves out `trash` (`wc:includes/class-wc-order-query.php:27`), so Suborders that were already trashed together with the parent are not deleted by this step; their rows are erased when the Suborders themselves are deleted, which WooCommerce's "Empty Trash" does because it deletes every trashed order one by one (`wc:src/Internal/Admin/Orders/ListTable.php:1446-1456`, `:1601-1615`). Until then they stay parked at `wc-trash`. Once deleted, the Earning disappears from the ledger entirely, as if the order had never existed.

## Settings that change it

None. There is no setting or filter for trash or delete handling. The action `dokan_after_deleting_seller_order` lets extensions clean up their own data.

## Worked example

Settings: Commission `fixed` 10 percent; `withdraw_order_status` = `wc-completed`.

Order #300 → #301 (Vendor A, 54.00, `completed`) and #302 (Vendor B, 36.00, `completed`). A's earnings 54.00, B's 36.00.

1. Store Admin trashes #300 in WP-admin. #301 and #302 are trashed with it; both rows become `wc-trash`. Earnings: A 0.00, B 0.00. Rows still hold debits of 54.00 and 36.00.
2. Store Admin restores #300. #301 and #302 are restored to `completed`; rows become `wc-completed`. Earnings: A 54.00, B 36.00.
3. Store Admin trashes #300 again and empties the trash. "Empty Trash" deletes #300, #301 and #302 one by one, and each deletion runs `delete_seller_order()` for that order, so the `dokan_orders` and Balance rows for #301 and #302 are deleted. Earnings: A 0.00, B 0.00, with no trace in the ledger.

## Edge cases

- **Deletion outside WP-admin keeps the rows.** Orders deleted by REST calls, WP-CLI, cron jobs or payment webhooks do not load `Order\Admin\Hooks`, so their ledger rows remain with their last status and keep counting if that status is an earning status.
- **Trashing with `wp_trash_post()` directly on posts storage** (the legacy order list's Trash link) does not fire `woocommerce_trash_order`; WooCommerce's own `wp_trash_post` handler does not fire it either (`wc:includes/class-wc-post-data.php:62`, `:468-496`). The trashed order's own rows keep their previous status. Its Suborders, which Dokan trashes through the data store, are parked normally.
- **Withdraw rows are matched by number.** The delete query removes `dokan_withdraw` Balance rows whose `trn_id` equals the order id. Withdraw rows store the Withdraw id in `trn_id` (`lite:includes/Withdraw/Hooks.php:131-140`), so this clause matches an unrelated Withdraw that happens to share the number.
- **Refund credits are deleted too.** Deleting a refunded order removes both its debit and its refund credits, so the net effect on the Balance is zero only if they matched.

## Why

No recorded decision beyond the method docblocks ("Delete sub orders and from dokan sync table when a order is deleted", `lite:includes/Order/Admin/Hooks.php:521-530`; "Perform actions after an order is trashed … updates the order status in the Dokan tables", `lite:includes/Order/OrderEventListener.php:15-24`). Trash is treated as reversible and therefore only parks the Earning; permanent deletion is treated as "this order never happened".

## Consequences & risks

- Deleting an old, paid-out order lowers the Vendor's earnings history and Balance, because its Earning row disappears while the Withdraw that paid it remains.
- Whether ledger rows survive a deletion depends on *where* the deletion ran, not on what was deleted.
- The `dokan_withdraw` clause in the delete query can remove a Withdraw's ledger row that has nothing to do with the deleted order.

## Recommendations

- Register the delete cleanup outside the `is_admin()` branch so that deletion behaves the same in every context.
- Remove `dokan_withdraw` from the delete query, or match Withdraw rows by a real link to the order, so unrelated Withdraw rows cannot be deleted.
- Consider blocking permanent deletion of Vendor orders whose Earning has already been paid out, or at least warning the Store Admin.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
