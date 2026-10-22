# A Withdraw moves money only when the admin approves it, and approval is final

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A Withdraw request is a Vendor asking to be paid. Dokan itself does not send the money for the built-in methods: the admin pays the Vendor by PayPal or bank transfer outside Dokan and then approves the request to record that payout. Teammates ask what each status means, what approval changes, and whether an approved Withdraw can be undone.

## Rule

**Statuses.** The `status` column of `dokan_withdraw` is an integer mapped by `Manager::get_status_code()` and `get_status_name()` (`lite:includes/Withdraw/Manager.php:289-303`, `:337-350`):

| Code | Name | Meaning |
|---|---|---|
| `0` | pending | Requested, waiting for the admin. Reserves nothing. |
| `1` | approved (also accepted as `completed`) | The admin has paid, and a ledger credit row has reduced the Balance. |
| `2` | cancelled | Withdrawn by the Vendor or refused by the admin. No money moved. |

REST list headers and status counts label code `1` as "completed" (`X-Status-Completed`), while the action and email use "approved".

**Who approves.** Only users with `manage_woocommerce` can approve, through the REST update endpoint (`WithdrawController::update_item()`, `lite:includes/REST/WithdrawController.php:539-614`) or the batch endpoint (`batch_items()`, `:689-761`, permission at `:266-268`). The admin withdraw screen offers Approve and Cancel only for pending requests (`lite:src/admin/dashboard/pages/withdraw/index.tsx:307`, `:352`).

**Approval re-validates.** Before the status is saved, the full validator runs again on the request (`lite:includes/REST/WithdrawController.php:699-703` for batch; `:584-592` for single update, which clears the status first so the "already approved" check does not fire): the amount must still be covered by the Balance and the minimum, the method must still be filled in, the Vendor must still be enabled for selling, and the charge must still be covered ([ADR-0056](./0056-a-withdraw-must-be-at-least-the-minimum-withdraw-limit-and-at-most-the-balance-and-there-is-no-maximum-limit.md)). A failing request stays pending.

**Approval writes one ledger credit.** Saving a Withdraw fires `dokan_withdraw_request_{status name}` and `dokan_withdraw_updated` (`Withdraw::update()`, `lite:includes/Withdraw/Withdraw.php:523`, `:532`). On `dokan_withdraw_request_approved`, `Withdraw\Hooks::update_vendor_balance()` (registered at priority 11, `lite:includes/Withdraw/Hooks.php:17`; body `:110-156`):

- re-checks in integer cents that the Balance still covers the amount (`:113-119`);
- inserts a `dokan_vendor_balance` row with `trn_type = 'dokan_withdraw'`, `trn_id` = the Withdraw id, `credit` = the requested amount (gross, before the charge), `status = 'approved'`, `trn_date` = the request date and `balance_date` = now (`:130-154`), so the Balance drops immediately;
- skips the insert if a `dokan_withdraw` row for that Withdraw id already exists (`:121-129`), so any later save of an approved Withdraw never credits the ledger twice for the same request.

**Notifications.** Creation emails the admin (`VendorWithdrawRequest` on `dokan_withdraw_created`, `lite:includes/Emails/VendorWithdrawRequest.php:43`, recipient defaults to the site admin email, `:49`). Approval emails the Vendor (`WithdrawApproved` at priority 30, `lite:includes/Emails/WithdrawApproved.php:43`), including the stored receivable.

**Approval is final.** Once approved, the Withdraw is treated as paid, and no code reverses the ledger credit after approval (Lite ADR 0013, Risks). The Vendor cancel paths and the admin bulk Cancel (batch endpoint) refuse an approved request, because they use `Manager::is_valid_cancellation_request()`, which accepts only pending requests (`lite:includes/Withdraw/Manager.php:101-122`). Approving the same request a second time is refused with "Withdraw is already approved." (`lite:includes/Withdraw/Manager.php:65-67`). The admin screen offers no Approve, Cancel, Delete or Add Note action for an approved request (`lite:src/admin/dashboard/pages/withdraw/index.tsx:307`, `:352`, `:365`, `:382`, `:462-464`), and its Approve, Cancel and Delete actions, single or bulk, all go through the batch endpoint (`handleBulkAction()`, `:723-762`). The ledger credit is only ever inserted, never reversed: nothing listens on `dokan_withdraw_request_cancelled` or `dokan_withdraw_deleted` to write a ledger row, so no later status change or deletion returns the money to the Balance. Correcting a mistaken approval means recording a compensating entry deliberately, not changing the status.

**Deleting a request is housekeeping, not a money movement.** Only `manage_woocommerce` users may delete (`delete_item_permissions_check()`, `lite:includes/REST/WithdrawController.php:244-246`; batch permission `:266-268`), and the admin screen offers Delete only for requests that are not approved (`lite:src/admin/dashboard/pages/withdraw/index.tsx:382`, `:462-464`), that is, for pending or cancelled requests that never wrote a ledger row. `Withdraw::delete()` (`lite:includes/Withdraw/Withdraw.php:544-567`) removes only the `dokan_withdraw` row and fires `dokan_withdraw_deleted`, whose only Lite listener clears the withdraw cache (`WithdrawCache::invalidate_withdraw_cache()`, `lite:includes/Withdraw/WithdrawCache.php:27`). Deleting therefore never changes the Balance.

## Settings that change it

None. Approval is always a manual admin action in Lite; add-ons may create requests automatically, but the approval step and its effects are the same.

## Worked example

Settings: minimum limit 50; PayPal charge 2.00 + 2.5 %. Vendor V's Balance is 500.00.

1. 1 November: V requests 200.00 by PayPal. A pending row is created with charge 7.00 and receivable 193.00 in `details`; the admin is emailed. V's Balance is still 500.00.
2. 3 November: the admin sends 193.00 to V's PayPal address outside Dokan, then clicks Approve. Validation passes (500.00 ≥ 200.00 ≥ 50). The status becomes 1, a ledger credit of 200.00 dated 3 November is inserted, and V's Balance becomes 300.00. V receives the approval email showing 193.00.
3. If the same request is submitted for approval again, validation refuses it ("Withdraw is already approved."). Any code that does save the approved request again fires `dokan_withdraw_request_approved` once more, but the listener finds the existing ledger row for this Withdraw id and inserts nothing, so V's Balance stays 300.00.

## Edge cases

- **Batch approval** reports failures per id (`failed.approved`) and continues with the rest.
- **The request date is kept as `trn_date`**, so statements order the Withdraw by request date while `balance_date` reflects the approval moment.
- **Deleting is not the same as cancelling.** Cancelling keeps the row with status 2 as an audit record and applies only to pending requests. Deleting removes the row entirely. Neither one changes the Balance.
- **The admin screen pre-checks the Balance.** Before sending an approval, the screen compares each request's amount with the Vendor's current Balance in integer cents and shows an "insufficient balance" dialog instead of submitting when the Balance is lower (`lite:src/admin/dashboard/pages/withdraw/index.tsx:308-331`); the server-side validator remains the authority.

## Why

No recorded decision. The existence check prevents a second ledger credit on repeated saves, and the cents comparison in the listener is commented as protection against "an approved withdraw with no offsetting credit row" caused by float drift (`lite:includes/Withdraw/Hooks.php:113`).

## Consequences & risks

- Because the status-named action fires on every save, any listener on `dokan_withdraw_request_approved` must itself be idempotent.
- Admins who approve before paying (or pay a different amount) have no in-product way to correct the record; the payout outside Dokan and the approval inside it must be kept in step by process.
- Neither cancelling nor deleting is a way to reverse a payout; a reversal would need its own ledger entry.

## Recommendations

- If reversals are ever needed, model them as an explicit "reversed" status that writes an offsetting debit, rather than reusing cancelled.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
