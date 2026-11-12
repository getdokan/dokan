# Reverse withdrawal is a separate receivable ledger, settled by buying a hidden product

Status: Accepted (retroactive — documents existing code)

## Context

When a customer pays a Vendor directly, through a gateway that bypasses the marketplace (by default cash on delivery), the whole order total sits with the Vendor and the admin's Commission is owed back to the marketplace. Dokan needed somewhere to record that debt and a way for the Vendor to pay it.

The tempting shortcut is to treat it as a negative Withdraw: subtract the Commission from the Vendor's Balance. `CONTEXT.md` rules that out in vocabulary ("never a negative Withdraw — a Reverse withdrawal is a receivable, not a Balance entry; the two concepts never mix"), and the code implements that rule structurally. No existing ADR records the structural choice.

## Decision

**[Lite]** Reverse withdrawal has its own table, its own closed set of transaction types, its own balance computation, and a payment path that runs through an ordinary WooCommerce checkout.

- **Separate table.** `dokan_reverse_withdrawal` is created by `InstallerHelper::create_reverse_withdrawal_table()` (`lite:includes/ReverseWithdrawal/InstallerHelper.php:23`), called from `Installer::create_tables()` and the `V_3_5_1` upgrader. It is distinct from `dokan_vendor_balance` ([ADR-0014](./0014-marketplace-money-lives-in-custom-tables-not-post-types.md)), and nothing in the Balance queries reads it. Its `trn_date` is a Unix timestamp (`int(11)`), unlike the `timestamp` columns of the Balance ledger, and it carries composite indexes on `vendor_id`, `trn_date` and `trn_type`.
- **Closed transaction types.** `Helper::get_transaction_types()` (`lite:includes/ReverseWithdrawal/Helper.php:57`) returns a fixed map (`opening_balance`, `order_commission`, `failed_transfer_reversal`, `product_advertisement`, `manual_order_commission`, `vendor_payment`, `order_refund`, `manual_product`, `manual_order`, `other`). Its code comment forbids changing the keys or adding a filter, because queries depend on them. `ReverseWithdrawal\Manager::insert()` (`lite:includes/ReverseWithdrawal/Manager.php:512`) rejects any other `trn_type`.
- **Debt accrual.** `ReverseWithdrawal\Hooks::process_order_status_changed()` (`lite:includes/ReverseWithdrawal/Hooks.php:187`) on `woocommerce_order_status_changed` (fired at `wc:includes/class-wc-order.php:478`) inserts an `order_commission` debit equal to `dokan()->commission->get_earning_by_order( $order_id, 'admin' )` when a Vendor order (not a parent with Suborders, consistent with [ADR-0004](./0004-vendor-order-is-authoritative-parent-is-mirror.md)) moves to `completed` with a payment method enabled for reverse withdrawal. The gateway list comes from `SettingsHelper::get_enabled_payment_gateways()`: it is empty while the feature is disabled, and otherwise every key of the `dokan_reverse_withdrawal_payment_gateways` filter (default `cod` only). A second insert for the same order is prevented by `Manager::is_reverse_withdrawal_added()`.
- **Outstanding amount.** `Manager::get_store_balance()` (`lite:includes/ReverseWithdrawal/Manager.php:367`) returns `debit - credit` over the Vendor's rows.
- **Payment through WooCommerce.** The installer creates a hidden, virtual product (`InstallerHelper::create_reverse_withdrawal_base_product()`, `lite:includes/ReverseWithdrawal/InstallerHelper.php:55`, catalog visibility `hidden` at `:93`) and stores its id in the `dokan_reverse_withdrawal_product_id` option. `Helper::add_payment_to_cart()` (`lite:includes/ReverseWithdrawal/Helper.php:923`) empties the cart and adds that product with the amount as cart item data; `Cart` sets the price and blocks mixing it with other products. When the payment order completes (on `woocommerce_payment_complete`, fired at `wc:includes/class-wc-order.php:186`, or on `woocommerce_order_status_changed` to `completed`), `ReverseWithdrawal\Order::insert_payment()` (`lite:includes/ReverseWithdrawal/Order.php:98`) writes a `vendor_payment` credit, capped first at what the order actually collected (the line total, or the order total if lower, so a coupon-discounted payment is credited only for what was paid, with an order note; `lite:includes/ReverseWithdrawal/Order.php:131-147`, `Helper::get_collected_amount_from_order()`, `lite:includes/ReverseWithdrawal/Helper.php:198-207`) and then clamped to the outstanding amount, and marks fully resolved orders with `_dokan_reverse_withdrawal_payment_settled` (`lite:includes/ReverseWithdrawal/Order.php:24`).
- **Enforcement.** Overdue debt triggers configurable "failed actions" (`FailedActions`; options from `SettingsHelper::get_failed_payment_actions()`). They are evaluated for all Vendors by the daily `dokan_reverse_withdrawal_midnight_cron` Action Scheduler job (`CronActions::maybe_take_action`; a separate monthly job sends billing invoice emails), and on every insert through `dokan_reverse_withdrawal_created`, where `Hooks::after_reverse_withdrawal_inserted` applies actions after an `order_commission`, `failed_transfer_reversal`, `product_advertisement` or `manual_order_commission` row and reverts them after `vendor_payment` or `order_refund` (`lite:includes/ReverseWithdrawal/Hooks.php:80-92`). Other rows, such as the admin's manual entries, wait for the daily job.

```mermaid
sequenceDiagram
    autonumber
    participant WC as WooCommerce
    participant H as ReverseWithdrawal Hooks
    participant RW as dokan_reverse_withdrawal
    participant V as Vendor
    participant O as ReverseWithdrawal Order
    WC->>H: woocommerce_order_status_changed to completed, gateway cod
    H->>RW: insert order_commission, debit = Commission
    V->>WC: add hidden payment product to cart and check out
    WC->>O: woocommerce_payment_complete or status completed
    O->>RW: insert vendor_payment, credit clamped to outstanding
```

## Consequences

- A Vendor's Balance (money the marketplace owes them) and their Reverse withdrawal balance (money they owe the marketplace) are never netted against each other implicitly. Each has its own screens, REST routes (`dokan/v1/reverse-withdrawal/*`) and history.
- Paying the debt reuses every WooCommerce payment gateway, receipt, order note and email, at the cost of a hidden product that must exist and stay published.
- The closed transaction-type list makes the ledger's meaning stable for queries, but adding a new kind of debt or credit requires a code change in `Helper::get_transaction_types()`, not a filter. Several types (for example `product_advertisement` and `manual_order_commission`) are written outside Lite.
- Deleting a Vendor order removes its `order_commission`, `manual_order_commission` and `order_refund` rows (`Order\Manager::delete_seller_order`).

## Risks

- **Hidden product dependency.** If the base product is trashed or deleted, the payment path cannot add it to the cart. `Admin\Hooks` clears the option on trash, and the product is recreated on settings save, but the payment flow is unavailable in between.
- **Cart takeover.** Starting a payment empties the Vendor's cart, which affects a Vendor who is also shopping as a Customer.
- **Refunds do not reduce the debt in Lite.** The `order_commission` debit is written once on completion, and Lite never reduces it when the COD order is later refunded or cancelled. Only Pro writes an `order_refund` credit, when its refund request is approved (`dokan_pro_refund_approved`, `pro:includes/ReverseWithdrawal.php:44`, `:116-166`).
- **Different time representation.** `trn_date` is an integer timestamp here and a `timestamp` column in the Balance ledger. Reports that combine the two ledgers must convert one of them.

## Recommendations

- Keep the two ledgers separate. A feature that wants to settle a Reverse withdrawal from a Balance should write explicit rows in both ledgers rather than reading one from the other.
- If new transaction types become frequent, consider a registration API that still yields a closed, validated list, rather than editing the constant map each time.

## Known gaps

- Producers of the transaction types that Lite's order hooks never write (everything except `order_commission` and `vendor_payment`) were not examined, apart from Pro's `order_refund` (see Risks) and the admin Reverse Withdrawal page, which writes `manual_product`, `manual_order` and `other` rows through `POST dokan/v1/reverse-withdrawal/transactions`.
- How the payment path behaves when the base product is unpublished mid-checkout was not traced.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
