# Only a pending Withdraw can be cancelled, and cancelling never changes the Balance

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Vendors cancel requests they made by mistake, and admins cancel requests they will not pay (wrong details, suspected fraud, insufficient funds). Teammates ask who may cancel what, and whether a cancellation "gives the money back".

## Rule

- **Only pending requests are cancellable.** `Manager::is_valid_cancellation_request()` (`lite:includes/Withdraw/Manager.php::is_valid_cancellation_request()`) looks up the request by id **and** status `0`; an approved or already cancelled request fails with "Invalid cancel withdraw request". An approved Withdraw is final ([ADR-0056](./0056-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)) and is never cancelled.
- **A Vendor may cancel only their own request, and only while enabled for selling.** The cancel check requires the request to belong to the acting Vendor (or the actor to hold `manage_woocommerce`). Vendors can cancel from:
  - the legacy vendor dashboard link (`Dashboard\Templates\Withdraw::handle_cancel_request()`, `lite:includes/Dashboard/Templates/Withdraw.php::handle_cancel_request()`), which also requires a valid `dokan_cancel_withdraw` nonce and the `dokan_manage_withdraw` capability;
  - the React vendor dashboard, which sends `PUT dokan/v1/withdraw/{id}` without `manage_woocommerce`. That call is limited to the request's owner (`get_item_permissions_check()`, `lite:includes/REST/WithdrawController.php::get_item_permissions_check()`), runs the pending-only check, and can only set the status to cancelled; any other field in the body is ignored (`::update_item()`). A failed check returns HTTP 422.
- **An admin cancels through the batch endpoint.** `POST dokan/v1/withdraw/batch` (also served as `dokan/v2/withdraw/batch`) with a `cancelled` list (`lite:includes/REST/WithdrawController.php::batch_items()`; permission `manage_woocommerce`, `::batch_items_permissions_check()`) runs the same pending-only check for each id; an approved or already cancelled id is left unchanged and returned under `failed.cancelled`, while the call as a whole still succeeds. The admin withdraw screen offers Cancel (row action, bulk action and the view dialog) only for pending requests (`lite:src/admin/dashboard/pages/withdraw/index.tsx`, the `actions` list and `::openModal()`), and every one of them calls this batch endpoint (`::handleBulkAction()`).
- **The single admin update validates like an approval.** `PUT dokan/v1/withdraw/{id}` (also `dokan/v2`) by a `manage_woocommerce` user runs the full approval validator before saving the requested status (`lite:includes/REST/WithdrawController.php::update_item()`). Cancelling a pending request this way therefore fails with HTTP 400 whenever approval would fail: the Balance no longer covers the amount, the amount is below the current minimum, the method was removed, the Vendor is disabled, or the current charge exceeds the amount. The admin screen never sends a status this way.
- **Cancelling moves no money.** A pending request never wrote a ledger row ([ADR-0054](./0054-a-vendor-may-have-only-one-pending-withdraw-request-and-a-pending-request-does-not-hold-the-balance.md)), and the only Lite listener on `dokan_withdraw_request_cancelled` is the cancellation email, so nothing writes to the ledger. The Balance is the same before and after. Cancelling frees the Vendor's single pending slot.
- **The Vendor is notified.** `WithdrawCancelled` is sent on `dokan_withdraw_request_cancelled` (`lite:includes/Emails/WithdrawCancelled.php::__construct()`). The admin may attach a note to the request before cancelling it (the screen's Add Note action saves it with `PUT dokan/v2/withdraw/{id}`, `lite:src/admin/dashboard/pages/withdraw/index.tsx::handleUpdateNote()`). That save re-runs the full approval validation (`lite:includes/REST/WithdrawController.php::update_item()`), so it fails with HTTP 400 in the same cases as the single admin update above, several of which are common reasons to cancel; the screen only logs the error to the browser console, so a request cancelled next goes out without the note. When it saves, the note is included in the email (`{note}`, `lite:includes/Emails/WithdrawCancelled.php::trigger()`) and shown in the Vendor's cancelled-requests list (`lite:templates/withdraw/cancelled-request-listing.php`, the note column; `lite:src/dashboard/withdraw/withdraw-fields.tsx::getFieldsForStatus()`).

### Summary: who can cancel what

| Path | Who | Pending | Approved or cancelled | Balance effect |
|---|---|---|---|---|
| Legacy vendor dashboard cancel link | owning Vendor, enabled for selling | cancels | refused | none |
| React vendor dashboard, i.e. `PUT /withdraw/{id}` without `manage_woocommerce` | owning Vendor, enabled for selling | cancels (status forced to cancelled) | HTTP 422 "Invalid cancel withdraw request" | none |
| Admin screen Cancel, i.e. `POST /withdraw/batch` `cancelled` list | `manage_woocommerce` | cancels | not offered by the screen; skipped and listed in `failed.cancelled` by the endpoint | none |
| `PUT /withdraw/{id}` with `manage_woocommerce` and `status: cancelled` (no screen uses it) | `manage_woocommerce` | cancels if the approval validator passes, otherwise HTTP 400 | not cancellable (approval is final) | none |

## Settings that change it

None.

## Worked example

Vendor V has a Balance of 300.00 and a pending request for 200.00.

- V clicks Cancel in the dashboard. The request becomes cancelled, V receives the cancellation email, V's Balance remains 300.00, and V can immediately submit a new request.
- Instead, the admin adds the note "Bank details incomplete" and then cancels the request from the admin screen. The note saves because V's Balance still covers the 200.00 and the method is still filled in. Same effect on the Balance; V sees the note in the email and in the cancelled list.
- A week later V tries to cancel an approved request through the REST endpoint: HTTP 422, "Invalid cancel withdraw request". A batch cancel of the same approved id also leaves it unchanged and reports it under `failed.cancelled`. V's Balance is unaffected throughout.

## Edge cases

- **A Vendor who is disabled for selling** cannot cancel their own request. The admin can still cancel it from the admin screen, because the batch path applies only the pending-only check.
- **Vendor staff cannot cancel.** The dashboard link and `PUT /withdraw/{id}` compare ownership with `get_current_user_id()`, the staff member's own id (`lite:includes/Dashboard/Templates/Withdraw.php::handle_cancel_request()`; `lite:includes/REST/WithdrawController.php::get_item_permissions_check()`), even though staff create requests for their Vendor.
- **Ledger wording.** The approval row is stored in the `credit` column of `dokan_vendor_balance` (`lite:includes/Withdraw/Hooks.php::update_vendor_balance()`); in this ledger a credit lowers the Vendor's Balance (Lite ADR 0014). It is not a "debit" row, and cancelling never adds or removes one.
- **Deletion** is different from cancellation: only `manage_woocommerce` may delete a request (`lite:includes/REST/WithdrawController.php::delete_item_permissions_check()`), deletion removes the row entirely and fires `dokan_withdraw_deleted` (`lite:includes/Withdraw/Withdraw.php::delete()`), and it applies only to requests that are not approved (the admin screen's Delete action, `lite:src/admin/dashboard/pages/withdraw/index.tsx`, the `actions` list). Deleting never changes the Balance.

## Why

No recorded decision. Restricting cancellation to pending requests follows directly from approval being the moment money moves: before it, nothing needs undoing.

## Consequences & risks

- Cancelled requests stay in the table and in the Vendor's history with their stored `details`, which keeps an audit trail of refused Withdraws.
- Deleting a request, by contrast, erases that trail; admins should prefer cancelling.
- When the Add Note save fails, the admin gets no message and the Vendor receives a cancellation email without the reason.
- An admin who cancels through the single `PUT` instead of the batch endpoint cannot cancel exactly the requests that most need cancelling (unpayable, below the minimum, Vendor disabled).

## Recommendations

- Have the single admin update use the cancellation check, not the approval validator, when the requested status is cancelled, and let the Add Note save skip the approval checks.
- Introduce a separate, explicit reversal flow if approved Withdraws ever need to be undone, rather than reusing cancel.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
