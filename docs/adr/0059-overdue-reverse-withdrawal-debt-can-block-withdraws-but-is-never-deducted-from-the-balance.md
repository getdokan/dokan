# Overdue Reverse withdrawal debt can block Withdraws but is never deducted from the Balance

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor can at the same time be owed money by the marketplace (their Balance) and owe money to it (their Reverse withdrawal debt, typically the Commission on cash-on-delivery orders). Lite ADR 0014 records that the two ledgers are separate and never netted. Teammates still ask the Withdraw-side questions: "Can the admin take the debt out of the Vendor's payout?" and "What stops a Vendor who owes money from withdrawing?" This ADR answers those.

## Rule

- **The debt is never deducted from the Balance.** `Vendor::get_balance()` reads only `dokan_vendor_balance` (`lite:includes/Vendor/Vendor.php:886-899`); nothing in Withdraw validation, approval or the ledger listener reads `dokan_reverse_withdrawal` (Lite ADR 0014). A Withdraw for the full Balance is valid even while the Vendor owes Reverse withdrawal debt, and approving it does not reduce the debt.
- **Overdue debt can block withdrawing through two "failed actions".** When a Vendor's debt is overdue, Reverse withdrawal applies the admin's chosen failed actions (Lite ADR 0014, Enforcement). Two of the three concern Withdraw (`SettingsHelper::get_failed_payment_actions()`, `lite:includes/ReverseWithdrawal/SettingsHelper.php:191-198`):
  - **Hide Withdraw Menu** (`hide_withdraw_menu`): removes the Withdraw item from the vendor dashboard menu (`ReverseWithdrawal\Hooks::unset_withdraw_menu()`, `lite:includes/ReverseWithdrawal/Hooks.php:104-114`). The intended effect, as told to the Vendor, is that they "will not be able to make any withdraw request" until the debt is paid (`lite:includes/ReverseWithdrawal/Helper.php:635-636`, `:678-679`).
  - **Make Vendor Status Inactive** (`status_inactive`): disables the Vendor for selling (`FailedActions::make_status_inactive()`, `lite:includes/ReverseWithdrawal/FailedActions.php:106`). Withdraw validation requires an enabled Vendor (`lite:includes/Withdraw/Manager.php:61-63`), so the Vendor can neither create a request nor have a pending request approved while this action is in force.
- **Paying the debt lifts the block.** When a `vendor_payment` (or `order_refund`) credit brings the Vendor out of overdue status, the actions are reverted (`FailedActions::revert_reverse_pay_actions()`, `lite:includes/ReverseWithdrawal/FailedActions.php:69`, re-enabling selling at `:83-86`), and the Withdraw menu and validation return to normal.
- **The admin cannot settle debt from the Balance inside Dokan.** There is no built-in flow that converts Balance into a Reverse withdrawal payment; the Vendor pays the debt through the checkout of the hidden payment product (Lite ADR 0014).

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Reverse withdrawal enabled | `dokan_reverse_withdrawal[enabled]` | `off` (`lite:includes/ReverseWithdrawal/SettingsHelper.php:23-25`) | `off`: no debt is recorded and nothing below applies. |
| Failed actions | `dokan_reverse_withdrawal[failed_actions]` | `[]` (`:114-118`) | Any combination of `enable_catalog_mode`, `hide_withdraw_menu`, `status_inactive`. Only the last two affect withdrawing. With none selected, an overdue Vendor can still withdraw normally. |
| Billing type, threshold, due period | `billing_type` (default `by_amount`), `reverse_balance_threshold` (default `150`), `due_period` (default `7` days) (`:64-66`, `:75-79`, `:101-105`) | as listed | Decide when the debt becomes overdue and therefore when the failed actions start. |

## Worked example

Settings: Reverse withdrawal on for `cod`; billing by amount, threshold 150.00, due period 7 days; failed actions = Hide Withdraw Menu and Make Vendor Status Inactive. "Exclude COD Payments" on.

1. Vendor V has a withdrawable Balance of 400.00 from card orders and a pending Withdraw of 100.00.
2. V completes COD orders whose Commissions total 180.00. V's Reverse withdrawal debt is 180.00, above the 150.00 threshold. V's Balance is still 400.00.
3. After the due period passes unpaid, the failed actions apply: the Withdraw menu disappears and V is disabled for selling. The admin tries to approve the pending 100.00: validation fails with "Vendor is not enabled for selling".
4. V pays 180.00 through the reverse-withdrawal checkout. The actions are reverted, V is enabled again, and the admin approves the 100.00 request. V's Balance becomes 300.00; the Reverse withdrawal debt is 0.00.

With only Hide Withdraw Menu selected, step 3 hides the menu but leaves V enabled, so the admin can still approve the pending request.

## Edge cases

- **Pending requests are not cancelled** by either failed action; they simply cannot be approved while the Vendor is inactive.
- **Catalog mode** (`enable_catalog_mode`) hides add-to-cart on the Vendor's products and has no effect on withdrawing.

## Why

No recorded decision beyond Lite ADR 0014's separation of the ledgers. Blocking Withdraws instead of netting keeps each ledger's history literal: a Withdraw is a Withdraw and a debt payment is a debt payment.

## Consequences & risks

- A marketplace that wants "pay the debt first, then withdraw" must select `status_inactive` (or rely on the menu being hidden) and set a sensible threshold and due period; otherwise an indebted Vendor can withdraw their whole Balance.
- Because the debt is never netted, the marketplace may pay out a Balance to a Vendor who owes more than that Balance.

## Recommendations

- Offer an explicit, admin-initiated "settle debt from Balance" action that writes a Withdraw-type credit in the Balance ledger and a `vendor_payment` credit in the Reverse withdrawal ledger, as Lite ADR 0014 recommends, rather than implicit netting.
- Show the Vendor, on the Withdraw page, how much Reverse withdrawal debt is outstanding next to the Balance, so both figures are seen together.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
