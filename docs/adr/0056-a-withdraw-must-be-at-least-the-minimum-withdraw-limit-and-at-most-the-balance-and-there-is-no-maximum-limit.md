# A Withdraw must be at least the minimum withdraw limit and at most the Balance, and there is no maximum limit

Status: Accepted (retroactive — documents existing code)

## Context

Admins set a "Minimum Withdraw Limit" so they are not asked to pay out tiny amounts. Teammates regularly ask whether there is also a maximum, whether the minimum applies to the requested amount or to the Balance, and what other conditions a request must meet. All of these are answered by one validator that runs when a request is created and again when it is approved.

## Rule

`Withdraw\Manager::is_valid_approval_request()` (`lite:includes/Withdraw/Manager.php:29`) accepts a Withdraw only if every check below passes, in this order:

1. **Amount present.** A missing amount fails with `dokan_withdraw_empty` ("Withdraw amount required", `:40-42`). The check runs on the amount already formatted to two decimals (`:34`); a positive minimum (check 3) is what keeps very small requests out.
2. **Amount at most the Balance.** The amount, rounded to 2 decimals, must not exceed the Balance in integer cents (`:33-34`, `:44-50`), otherwise `dokan_withdraw_not_enough_balance`. The Balance is defined in [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md).
3. **Amount at least the minimum.** `amount < withdraw_limit` fails with `dokan_withdraw_amount` ("Withdraw amount must be greater than or equal to …") (`:52-55`). The minimum is read by `Manager::get_withdraw_limit()` (`:487-489`).
4. **Method usable.** See [ADR-0054](./0054-a-withdraw-can-use-only-a-method-the-admin-enabled-and-the-vendor-has-filled-in.md) (`:57-59`).
5. **Vendor enabled for selling.** `dokan_is_seller_enabled()` must be true (`:61-63`; `lite:includes/functions.php:1172`), otherwise `dokan_withdraw_seller_not_enabled`.
6. **Not already approved.** A row passed with an id and status approved fails with `dokan_withdraw_already_approved` (`:65-67`).
7. **Charge covered.** The receivable (amount minus charge) must not be negative (`:69-79`); see [ADR-0060](./0060-the-withdraw-charge-is-a-fixed-fee-plus-a-percentage-deducted-from-the-requested-amount.md).
8. **Add-on rules.** The result passes through the `dokan_withdraw_is_valid_request` filter, where code may return a `WP_Error` (`:89`).

There is **no maximum withdraw amount**. The only upper bound is the Balance; no setting, option or filter in Lite caps a single request or a period total.

The minimum is a minimum on the **requested amount**, not on the Balance. In addition, the vendor dashboard hides the request form while the Balance itself is below the minimum (`Manager::has_withdraw_balance()`, `lite:includes/Withdraw/Manager.php:471-480`, used at `lite:includes/Dashboard/Templates/Withdraw.php:499-503`), and pre-fills the form with the whole Balance rounded to the store's price decimals (`:509`; `NumberUtil::round()` with `PHP_ROUND_HALF_DOWN`, which rounds to the nearest value and goes down only on an exact half, so with two price decimals a Balance of 12.3456 is pre-filled as 12.35, despite the source comment saying 12.34).

The same validator runs at creation (AJAX `lite:includes/Withdraw/Hooks.php:205`, REST `lite:includes/REST/WithdrawController.php:474-484`) and at approval ([ADR-0055](./0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)), so a request that was valid when made can fail at approval if the Balance, the minimum, the method or the Vendor's status changed in between. The AJAX path additionally rejects a negative amount explicitly (`lite:includes/Withdraw/Hooks.php:195-197`).

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Minimum Withdraw Limit | `dokan_withdraw[withdraw_limit]` (flat: `minimum_withdraw_limit`) | Never saved: `0` (reader default, `lite:includes/Withdraw/Manager.php:488`). The settings screens and the setup wizard pre-fill `50` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:957`, `lite:includes/Admin/Settings.php:747`, `lite:includes/Admin/SetupWizard.php:672`), which is stored when the admin saves. | `0` or blank: no minimum, any positive amount up to the Balance. A positive value: requests below it are rejected. A negative value is refused on save (`lite:includes/Admin/Settings.php:1116-1128`; the new settings screen runs the same check through `LegacyMirror::before_save()`, `lite:includes/Admin/Settings/Migration/LegacyMirror.php:456-484`). |

## Worked example

Settings: Minimum Withdraw Limit 50; PayPal charge 0. Vendor Balance 120.00.

- Request 120.00: passes (equal to the Balance).
- Request 120.01: fails, `dokan_withdraw_not_enough_balance`.
- Request 49.99: fails, `dokan_withdraw_amount`.
- Request 50.00: passes.
- Balance 45.00: the dashboard shows "You don't have sufficient balance for a withdraw request!" and no form.

Same Vendor, but the admin raises the minimum to 150 while a 120.00 request is pending: approving it now fails with `dokan_withdraw_amount`, and the admin must cancel it or lower the limit.

## Edge cases

- **Rounding.** The amount and Balance are compared after `wc_format_decimal( …, 2 )`, so sub-cent amounts are rounded before comparison, while the stored amount keeps the precision the caller sent.
- **Minimum stored as blank.** A blank limit is treated as no minimum.
- **Admin requests on behalf of a Vendor** go through the same validator; being an admin does not bypass the minimum or the Balance.

## Why

No recorded decision for the absence of a maximum. The minimum exists to avoid many small payouts, as its field description says: "Minimum balance required to make a withdraw request."

## Consequences & risks

- A Vendor with a large Balance can withdraw all of it in one request; marketplaces that need payout caps must add them through `dokan_withdraw_is_valid_request`.
- Because validation repeats at approval, admins should expect occasional approval failures after refunds or setting changes, and should read the error rather than retry.

## Recommendations

- If a maximum is requested, implement it as a `dokan_withdraw_is_valid_request` rule with its own setting so it is checked at both creation and approval.
- Align the reader default (`0`) with the screens' default (`50`), or document that an unsaved site has no minimum.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
