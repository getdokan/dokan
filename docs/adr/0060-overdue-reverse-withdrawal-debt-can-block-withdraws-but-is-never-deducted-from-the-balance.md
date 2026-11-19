# Overdue Reverse withdrawal debt can block Withdraws but is never deducted from the Balance

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor can at the same time be owed money by the marketplace (their Balance) and owe money to it (their Reverse withdrawal debt, typically the Commission on cash-on-delivery orders). Lite ADR 0015 records that the two ledgers are separate and never netted. Teammates still ask the Withdraw-side questions: "Can the admin take the debt out of the Vendor's payout?" and "What stops a Vendor who owes money from withdrawing?" This ADR answers those.

## Rule

- **The debt is never deducted from the Balance.** `Vendor::get_balance()` reads only `dokan_vendor_balance` (`lite:includes/Vendor/Vendor.php:886-899`); nothing in Withdraw validation, approval or the ledger listener reads `dokan_reverse_withdrawal` (Lite ADR 0015). A Withdraw for the full Balance is valid even while the Vendor owes Reverse withdrawal debt, and approving it does not reduce the debt.
- **Overdue debt can block withdrawing through one "failed action".** When a Vendor's debt is overdue, Reverse withdrawal applies the admin's chosen failed actions (Lite ADR 0015, Enforcement). Two of the three concern Withdraw, and only the second blocks it (`SettingsHelper::get_failed_payment_actions()`, `lite:includes/ReverseWithdrawal/SettingsHelper.php:191-198`):
  - **Hide Withdraw Menu** (`hide_withdraw_menu`): removes the Withdraw item from the vendor dashboard menu (`ReverseWithdrawal\Hooks::unset_withdraw_menu()`, `lite:includes/ReverseWithdrawal/Hooks.php:104-114`). That is all it does: the Withdraw page URL, the AJAX handler and `POST dokan/v1/withdraw` still accept requests, and pending requests can still be approved. The Vendor is told they "will not be able to make any withdraw request" until the debt is paid (`lite:includes/ReverseWithdrawal/Helper.php:663-664`, `:706-707`), but nothing enforces it.
  - **Make Vendor Status Inactive** (`status_inactive`): disables the Vendor for selling (`FailedActions::make_status_inactive()`, `lite:includes/ReverseWithdrawal/FailedActions.php:106`). Withdraw validation requires an enabled Vendor (`lite:includes/Withdraw/Manager.php:61-63`), so the Vendor can neither create a request nor have a pending request approved while this action is in force.
- **Paying the debt lifts the block.** When a `vendor_payment` (or `order_refund`) credit brings the Vendor out of overdue status, the actions are reverted (`FailedActions::revert_reverse_pay_actions()`, `lite:includes/ReverseWithdrawal/FailedActions.php:69`, re-enabling selling at `:83-86`), and the Withdraw menu and validation return to normal. Only those two credit types trigger the revert on insert; another credit, such as an admin's manual `other`, `manual_product` or `manual_order` credit, waits for the daily `dokan_reverse_withdrawal_midnight_cron` job (`lite:includes/ReverseWithdrawal/Hooks.php:80-92`). Reverting `status_inactive` calls `make_active()` without checking why the Vendor is inactive (`lite:includes/ReverseWithdrawal/FailedActions.php:131-152`), so a Vendor the admin disabled for another reason meanwhile is re-enabled too. The list of actions is copied to the Vendor when they are applied (`:49`), so changing the setting later does not change actions already in force.
- **The admin cannot settle debt from the Balance inside Dokan.** There is no built-in flow that converts Balance into a Reverse withdrawal payment. The Vendor pays the debt through the checkout of the hidden payment product (Lite ADR 0015), or the admin records a manual debit or credit on the admin Reverse Withdrawal page, which posts to `POST dokan/v1/reverse-withdrawal/transactions` (`lite:src/admin/dashboard/pages/reverse-withdrawal/AddReverseWithdrawModal.tsx:89-107`, `lite:includes/REST/ReverseWithdrawalController.php:438-455`). Neither touches the Balance.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Reverse withdrawal enabled | `dokan_reverse_withdrawal[enabled]` | `off` (`lite:includes/ReverseWithdrawal/SettingsHelper.php:23-25`) | `off`: no debt is recorded and nothing below applies. |
| Failed actions | `dokan_reverse_withdrawal[failed_actions]` | Reader `[]` (`:114-118`); both settings screens pre-select `enable_catalog_mode` (`lite:includes/ReverseWithdrawal/Admin/Settings.php:112`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:1197`) | Any combination of `enable_catalog_mode`, `hide_withdraw_menu`, `status_inactive`. Only the last two affect withdrawing, and only `status_inactive` blocks it. Neither screen saves the section with none selected, whether or not the feature is on (`lite:includes/ReverseWithdrawal/Admin/Settings.php:177-182`; the new screen reaches the same check through `LegacyMirror::before_save()`, `lite:includes/Admin/Settings/Migration/LegacyMirror.php:456-484`). With the default `enable_catalog_mode` alone, an overdue Vendor can still withdraw normally. |
| Billing type, threshold, due period | `billing_type` (default `by_amount`), `reverse_balance_threshold` (default `150`), `due_period` (default `7` days) (`:64-66`, `:75-79`, `:101-105`) | as listed | Decide when the debt becomes overdue and therefore when the failed actions start. Saving refuses a due period outside 0-28, a threshold of 0 or less under `by_amount`, and under `by_month` a billing day outside 1-28 or a billing day plus due period above 28 (`lite:includes/ReverseWithdrawal/Admin/Settings.php:169-207`). |

## Worked example

Settings: Reverse withdrawal on for `cod`; billing by amount, threshold 150.00, due period 7 days; failed actions = Hide Withdraw Menu and Make Vendor Status Inactive. "Exclude COD Payments" on.

1. Vendor V has a withdrawable Balance of 400.00 from card orders and a pending Withdraw of 100.00.
2. V completes COD orders whose Commissions total 180.00. V's Reverse withdrawal debt is 180.00, above the 150.00 threshold. V's Balance is still 400.00.
3. After the due period passes unpaid, the failed actions apply: the Withdraw menu disappears and V is disabled for selling. The admin tries to approve the pending 100.00: validation fails with "Vendor is not enabled for selling".
4. V pays 180.00 through the reverse-withdrawal checkout. The actions are reverted, V is enabled again, and the admin approves the 100.00 request. V's Balance becomes 300.00; the Reverse withdrawal debt is 0.00.

With only Hide Withdraw Menu selected, step 3 hides the menu but leaves V enabled, so the admin can still approve the pending request, and V could still send a new request through the API once the slot is free.

## Edge cases

- **Pending requests are not cancelled** by either failed action; they simply cannot be approved while the Vendor is inactive.
- **Catalog mode** (`enable_catalog_mode`) hides add-to-cart on the Vendor's products and has no effect on withdrawing.

## Why

No recorded decision beyond Lite ADR 0015's separation of the ledgers. Blocking Withdraws instead of netting keeps each ledger's history literal: a Withdraw is a Withdraw and a debt payment is a debt payment.

## Consequences & risks

- A marketplace that wants "pay the debt first, then withdraw" must select `status_inactive` (hiding the menu does not stop requests) and set a sensible threshold and due period; otherwise an indebted Vendor can withdraw their whole Balance.
- Because the debt is never netted, the marketplace may pay out a Balance to a Vendor who owes more than that Balance.

## Recommendations

- Offer an explicit, admin-initiated "settle debt from Balance" action that writes a Withdraw-type credit in the Balance ledger and a `vendor_payment` credit in the Reverse withdrawal ledger, as Lite ADR 0015 recommends, rather than implicit netting.
- Show the Vendor, on the Withdraw page, how much Reverse withdrawal debt is outstanding next to the Balance, so both figures are seen together.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._
