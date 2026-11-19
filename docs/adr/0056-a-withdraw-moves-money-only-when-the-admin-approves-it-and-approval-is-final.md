# A Withdraw moves money only when the admin approves it, and approval is final

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A Withdraw request is a Vendor asking to be paid. Dokan itself does not send the money for the built-in methods: the admin pays the Vendor by PayPal or bank transfer outside Dokan and then approves the request to record that payout. Teammates ask what each status means, what approval changes, and whether an approved Withdraw can be undone.

## Rule

**Statuses.** The `status` column of `dokan_withdraw` is an integer mapped by `Manager::get_status_code()` and `get_status_name()` (`lite:includes/Withdraw/Manager.php::get_status_code()`, `::get_status_name()`):

| Code | Name | Meaning |
|---|---|---|
| `0` | pending | Requested, waiting for the admin. Reserves nothing. |
| `1` | approved (also accepted as `completed`) | The admin has paid, and a ledger credit row has reduced the Balance. |
| `2` | cancelled | Withdrawn by the Vendor or refused by the admin. No money moved. |

REST list headers and status counts label code `1` as "completed" (`X-Status-Completed`), while the action and email use "approved".

**Who approves.** Only users with `manage_woocommerce` can approve, through the REST update endpoint (`WithdrawController::update_item()`, `lite:includes/REST/WithdrawController.php::update_item()`) or the batch endpoint (`::batch_items()`, permission in `::batch_items_permissions_check()`). The admin withdraw screen offers Approve and Cancel only for pending requests (`lite:src/admin/dashboard/pages/withdraw/index.tsx`, the `isEligible` checks of the `actions` list).

**Approval re-validates.** Before the status is saved, the full validator runs again on the request (`lite:includes/REST/WithdrawController.php::batch_items()` and `::update_item()`): the amount must still be covered by the Balance and still meet the minimum, the method must still be filled in, the Vendor must still be enabled for selling, and the charge must still be covered ([ADR-0057](./0057-a-withdraw-must-be-at-least-the-minimum-withdraw-limit-and-at-most-the-balance-and-there-is-no-maximum-limit.md)). A failing request stays pending.

**Approval writes one ledger credit.** Saving a Withdraw fires `dokan_withdraw_request_{status name}` and `dokan_withdraw_updated` (`Withdraw::update()`, `lite:includes/Withdraw/Withdraw.php::update()`). On `dokan_withdraw_request_approved`, `Withdraw\Hooks::update_vendor_balance()` (registered at priority 11 in `lite:includes/Withdraw/Hooks.php::__construct()`; body `::update_vendor_balance()`):

- re-checks in integer cents that the Balance still covers the amount;
- inserts a `dokan_vendor_balance` row with `trn_type = 'dokan_withdraw'`, `trn_id` = the Withdraw id, `credit` = the requested amount (gross, before the charge), `status = 'approved'`, `trn_date` = the request date and `balance_date` = now, so the Balance drops immediately;
- skips the insert if a `dokan_withdraw` row for that Withdraw id already exists, so any later save of an approved Withdraw never credits the ledger twice for the same request.

**Notifications.** Creation emails the admin (`VendorWithdrawRequest` on `dokan_withdraw_created`, `lite:includes/Emails/VendorWithdrawRequest.php::__construct()`; the recipient defaults to the site admin email). Approval emails the Vendor (`WithdrawApproved` at priority 30, `lite:includes/Emails/WithdrawApproved.php::__construct()`), including the stored receivable.

**Approval is final.** Once approved, the Withdraw is treated as paid: it is not cancelled, re-approved, returned to pending or deleted, and the ledger credit stays (Lite ADR 0014, Risks). The cancel paths accept only pending requests, because they use `Manager::is_valid_cancellation_request()` (`lite:includes/Withdraw/Manager.php::is_valid_cancellation_request()`), and approval of an approved request is refused with "Withdraw is already approved." (`lite:includes/Withdraw/Manager.php::is_valid_approval_request()`). The admin screen offers no Approve, Cancel, Delete or Add Note action for an approved request (`lite:src/admin/dashboard/pages/withdraw/index.tsx`, the `actions` list and `::openModal()`), and its Approve, Cancel and Delete actions, single or bulk, all go through the batch endpoint (`::handleBulkAction()`). Correcting a mistaken approval means recording a compensating entry deliberately, not changing the status.

**Deleting a request is housekeeping, not a money movement.** Only `manage_woocommerce` users may delete (`lite:includes/REST/WithdrawController.php::delete_item_permissions_check()`; batch permission `::batch_items_permissions_check()`), and only requests that are not approved, that is, pending or cancelled requests that never wrote a ledger row (the admin screen's Delete action, `lite:src/admin/dashboard/pages/withdraw/index.tsx`, the `actions` list and `::openModal()`). `Withdraw::delete()` (`lite:includes/Withdraw/Withdraw.php::delete()`) removes only the `dokan_withdraw` row and fires `dokan_withdraw_deleted`, whose only Lite listener clears the withdraw cache (`WithdrawCache::invalidate_withdraw_cache()`, `lite:includes/Withdraw/WithdrawCache.php::__construct()`). Deleting therefore never changes the Balance.

## Settings that change it

None in Lite. Approval is always a manual admin action in Lite; add-ons may create pending requests automatically, and those go through the same approval step.

Direct-payment gateways added by add-ons are the exception: they pay the Vendor during the order flow and may record that payout as an already approved Withdraw, with its own `dokan_withdraw` ledger credit, through the legacy `Manager::insert_withdraw()` (`lite:includes/Withdraw/Manager.php::insert_withdraw()`). Such records never pass through the pending state, the charge or the approval listener described above.

## Worked example

Settings: minimum limit 50; PayPal charge 2.00 + 2.5 %. Vendor V's Balance is 500.00.

1. 1 November: V requests 200.00 by PayPal. A pending row is created with charge 7.00 and receivable 193.00 in `details`; the admin is emailed. V's Balance is still 500.00.
2. 3 November: the admin sends 193.00 to V's PayPal address outside Dokan, then clicks Approve. Validation passes (500.00 ≥ 200.00 ≥ 50). The status becomes 1, a ledger credit of 200.00 dated 3 November is inserted, and V's Balance becomes 300.00. V receives the approval email showing 193.00.
3. If the same request is sent to the batch Approve again, validation refuses it ("Withdraw is already approved."), and V's Balance stays 300.00.

## Edge cases

- **Batch approval** reports failures per id (`failed.approved`) and continues with the rest. It returns only the ids, not the reasons, and the admin screen does not show them: it refreshes the list as if every id succeeded (`lite:src/admin/dashboard/pages/withdraw/index.tsx::handleBulkAction()`). A single `PUT` returns the validator's message as `dokan_rest_withdraw_error`, HTTP 400 (`lite:includes/REST/WithdrawController.php::update_item()`).
- **The request date is kept as `trn_date`**, so statements order the Withdraw by request date while `balance_date` reflects the approval moment.
- **Deleting is not the same as cancelling.** Cancelling keeps the row with status 2 as an audit record and applies only to pending requests. Deleting removes the row entirely. Neither one changes the Balance.
- **The admin screen pre-checks the Balance.** Before sending an approval, the screen compares each request's amount with the Vendor's current Balance in integer cents and shows an "insufficient balance" dialog instead of submitting when the Balance is lower (`lite:src/admin/dashboard/pages/withdraw/index.tsx`, the Approve entry of the `actions` list); the server-side validator remains the authority.

## Why

No recorded decision. The existence check prevents a second ledger credit on repeated saves, and the cents comparison in the listener is commented as protection against "an approved withdraw with no offsetting credit row" caused by float drift (`lite:includes/Withdraw/Hooks.php::update_vendor_balance()`).

## Consequences & risks

- Because the status-named action fires on every save, any listener on `dokan_withdraw_request_approved` must itself be idempotent.
- Admins who approve before paying (or pay a different amount) have no in-product way to correct the record; the payout outside Dokan and the approval inside it must be kept in step by process.
- Neither cancelling nor deleting is a way to reverse a payout; a reversal would need its own ledger entry.

## Recommendations

- If reversals are ever needed, model them as an explicit "reversed" status that writes an offsetting debit, rather than reusing cancelled.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
