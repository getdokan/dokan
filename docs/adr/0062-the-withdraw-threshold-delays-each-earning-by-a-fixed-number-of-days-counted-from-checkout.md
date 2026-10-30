# The withdraw threshold delays each Earning by a fixed number of days counted from checkout

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Marketplaces commonly hold a Vendor's Earning for a while before it can be withdrawn, so that refunds and chargebacks arrive before the money has left. Dokan calls this hold the withdraw threshold ("Withdraw Threshold", in days). Teammates ask when the clock starts, whether a per-Vendor value wins over the global one, and what happens to existing orders when the value changes. Lite ADR 0013 notes in passing that the threshold is applied at insert; this ADR states the full business rule.

## Rule

- **The threshold is resolved per Vendor.** `dokan_get_withdraw_threshold( $user_id )` (`lite:includes/functions.php:4058`) returns the Vendor's user meta `withdraw_date_limit` when that meta is not the empty string, otherwise the `withdraw_date_limit` option in the `dokan_withdraw` section, otherwise `0`. The result is passed through `absint()` (`:4065`).
- **It is stamped onto the Earning when the Earning is recorded.** `dokan_sync_insert_order()` reads the threshold (`lite:includes/Order/functions.php:250`) and writes the Earning row with `balance_date = now + threshold days` (`:281`). The Earning is recorded when the Vendor order is created at checkout (hooks at `lite:includes/Order/Hooks.php:45-49`) or when an admin creates the order (`:55`). The clock therefore starts at order creation, **not** at order completion.
- **It is enforced when the Balance is read.** `Vendor::get_balance()` counts only rows with `DATE(balance_date) <= today` (`lite:includes/Vendor/Vendor.php:893`, `:896`). An Earning becomes withdrawable on the later of two dates: the day its `balance_date` is reached, and the day its Vendor order enters an active withdraw order status ([ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)).
- **It applies to Earnings only.** Withdraw and Refund credits are written with `balance_date` = now (`lite:includes/Withdraw/Hooks.php:141`, `lite:includes/Order/RefundHandler.php:235`) and reduce the Balance at once.
- **Changes are not retroactive.** Because the date is stamped at insert, changing the global value or a Vendor's override affects only Earnings recorded afterwards. Existing rows keep their `balance_date`.

`Vendor::get_balance()` also computes a threshold-shifted date (`lite:includes/Vendor/Vendor.php:877-879`), but that value is never used in the query; the maturity rule lives entirely in `balance_date`.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Global withdraw threshold | `dokan_withdraw[withdraw_date_limit]` | `0` (reader default) | Number of days added to every new Earning's `balance_date`. `0` means Earnings mature immediately. Lite reads this option but does not define a field for it in its own settings screens; add-ons may supply the field. |
| Per-Vendor override | user meta `withdraw_date_limit` | not set (empty string) | When the meta holds any non-empty value, including `0`, it replaces the global value for that Vendor. An empty string means "use the global value". Add-ons may supply the admin field. |

## Worked example

Settings: global threshold 7 days; Vendor V has no override; Order Status for Withdraw = Completed.

- 1 October 10:00: the customer checks out. Vendor order #501 for V records an Earning of 90.00 with `balance_date` = 8 October 10:00.
- 2 October: the admin marks #501 Completed. The row now has an active status, but `balance_date` is in the future, so V's Balance is 0.00.
- 8 October: `DATE(balance_date) <= today` holds, and V's Balance becomes 90.00.

Same order, but the admin gives V a per-Vendor override of `0` on 3 October: #501 still matures on 8 October, because its date was stamped at checkout. Only V's orders placed from 3 October onward mature immediately.

Same order, but #501 is completed on 20 October: it matures on 20 October, the later of the two dates.

## Edge cases

- **Admin-created orders** take their date from the moment the admin saves the order, through `woocommerce_process_shop_order_meta` (`lite:includes/Order/Hooks.php:55`).
- **A refund issued during the hold** writes its credit immediately, so a Vendor whose only Earning is still maturing can show a negative Balance until the Earning matures.
- **Payment add-ons may rewrite `balance_date`** on Earning rows (for example when a gateway pays the Vendor directly); the rule above describes Lite's own writers only.

## Why

No recorded decision. Storing the maturity date on the row avoids a scheduled job: Earnings mature into the Balance simply because the date passes.

## Consequences & risks

- Any help text that describes the threshold as counting from order completion does not match the code, which counts from checkout. For orders that take longer than the threshold to complete, the hold is effectively zero after completion.
- Raising the threshold to respond to a fraud wave does not protect Earnings already recorded.

## Recommendations

- If the hold is meant to run from completion, move the stamp to the transition into an active status rather than reading a shifted date at query time; the unused `$date` in `get_balance()` suggests that design was once considered.
- Describe the setting in the UI as "days after the order is placed" until the behaviour changes.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
