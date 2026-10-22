# Only a pending Withdraw can be cancelled, and cancelling never changes the Balance

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Vendors cancel requests they made by mistake, and admins cancel requests they will not pay (wrong details, suspected fraud, insufficient funds). Teammates ask who may cancel what, and whether a cancellation "gives the money back".

## Rule

- **Only pending requests are cancellable.** `Manager::is_valid_cancellation_request()` (`lite:includes/Withdraw/Manager.php:101-122`) looks up the request by id **and** status `0`; an approved or already cancelled request fails with "Invalid cancel withdraw request". An approved Withdraw is final ([ADR-0055](./0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)) and is never meant to be cancelled.
- **A Vendor may cancel only their own request.** The same check requires the acting user to own the request or to hold `manage_woocommerce` (`:113-116`). Vendors can cancel from:
  - the vendor dashboard link (`Dashboard\Templates\Withdraw::handle_cancel_request()`, `lite:includes/Dashboard/Templates/Withdraw.php:114-163`), which also requires a valid `dokan_cancel_withdraw` nonce, the `dokan_manage_withdraw` capability and that the Vendor is enabled for selling (`:137-140`);
  - `PUT dokan/v1/withdraw/{id}` without `manage_woocommerce`, which is limited to the request's owner (`get_item_permissions_check()`, `lite:includes/REST/WithdrawController.php:198-211`), runs the pending-only check, and can only set the status to cancelled; any other field in the body is ignored (`:552-560`). A failed check returns HTTP 422.
- **An admin cancels through the batch endpoint.** `POST dokan/v1/withdraw/batch` (also served as `dokan/v2/withdraw/batch`) with a `cancelled` list (`lite:includes/REST/WithdrawController.php:716-737`; permission `manage_woocommerce`, `:266-268`) runs the same pending-only check for each id; an approved or already cancelled id is left unchanged and returned under `failed.cancelled`, while the call as a whole still succeeds. The admin withdraw screen offers Cancel (row action, bulk action and the view dialog) only for pending requests (`lite:src/admin/dashboard/pages/withdraw/index.tsx:352`, `:456-461`, `:1082-1087`), and every one of them calls this batch endpoint (`handleBulkAction()`, `:723-762`).
- **Cancelling moves no money.** A pending request never wrote a ledger row ([ADR-0053](./0053-a-vendor-may-have-only-one-pending-withdraw-request-and-a-pending-request-does-not-hold-the-balance.md)), and the only Lite listener on `dokan_withdraw_request_cancelled` is the cancellation email, so nothing writes to the ledger. The Balance is the same before and after. Cancelling frees the Vendor's single pending slot.
- **The Vendor is notified.** `WithdrawCancelled` is sent on `dokan_withdraw_request_cancelled` (`lite:includes/Emails/WithdrawCancelled.php:44`). The admin may attach a note to the request before cancelling it (the screen's Add Note action saves it with `PUT dokan/v2/withdraw/{id}`, `lite:src/admin/dashboard/pages/withdraw/index.tsx:765-776`); the note is included in the email (`{note}`, `lite:includes/Emails/WithdrawCancelled.php:92`) and shown in the Vendor's cancelled-requests list (`lite:templates/withdraw/cancelled-request-listing.php:33`, `lite:src/dashboard/withdraw/withdraw-fields.tsx:95`).

### Summary: who can cancel what

| Path | Who | Pending | Approved or cancelled | Balance effect |
|---|---|---|---|---|
| Vendor dashboard cancel link | owning Vendor, enabled for selling | cancels | refused | none |
| `PUT /withdraw/{id}` without `manage_woocommerce` | owning Vendor | cancels (status forced to cancelled) | HTTP 422 "Invalid cancel withdraw request" | none |
| Admin screen Cancel, i.e. `POST /withdraw/batch` `cancelled` list | `manage_woocommerce` | cancels | not offered by the screen; skipped and listed in `failed.cancelled` by the endpoint | none |

## Settings that change it

None.

## Worked example

Vendor V has a Balance of 300.00 and a pending request for 200.00.

- V clicks Cancel in the dashboard. The request becomes cancelled, V receives the cancellation email, V's Balance remains 300.00, and V can immediately submit a new request.
- Instead, the admin adds the note "Bank details incomplete" and then cancels the request from the admin screen. Same effect on the Balance; V sees the note in the email and in the cancelled list.
- A week later V tries to cancel an approved request through the REST endpoint: HTTP 422, "Invalid cancel withdraw request". A batch cancel of the same approved id also leaves it unchanged and reports it under `failed.cancelled`. V's Balance is unaffected throughout.

## Edge cases

- **A Vendor who is disabled for selling** cannot cancel from the dashboard link (`lite:includes/Dashboard/Templates/Withdraw.php:137-140`). The admin can still cancel the request from the admin screen, because the batch path applies only the pending-only check.
- **Ledger wording.** The approval row is stored in the `credit` column of `dokan_vendor_balance` (`lite:includes/Withdraw/Hooks.php:130-154`); in this ledger a credit lowers the Vendor's Balance (Lite ADR 0013). It is not a "debit" row, and cancelling never adds or removes one.
- **Deletion** is different from cancellation: only `manage_woocommerce` may delete a request (`lite:includes/REST/WithdrawController.php:244-246`), deletion removes the row entirely and fires `dokan_withdraw_deleted` (`lite:includes/Withdraw/Withdraw.php:544-567`), and the admin screen offers it only for requests that are not approved (`lite:src/admin/dashboard/pages/withdraw/index.tsx:382`). Deleting never changes the Balance.

## Why

No recorded decision. Restricting cancellation to pending requests follows directly from approval being the moment money moves: before it, nothing needs undoing.

## Consequences & risks

- Cancelled requests stay in the table and in the Vendor's history with their stored `details`, which keeps an audit trail of refused Withdraws.
- Deleting a request, by contrast, erases that trail; admins should prefer cancelling.

## Recommendations

- Keep "cancel" strictly for pending requests in every client and endpoint; introduce a separate, explicit reversal flow if approved Withdraws ever need to be undone.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
