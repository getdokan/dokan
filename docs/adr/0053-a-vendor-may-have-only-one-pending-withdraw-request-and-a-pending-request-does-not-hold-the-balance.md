# A Vendor may have only one pending Withdraw request, and a pending request does not hold the Balance

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Vendors sometimes try to split a Withdraw into several requests, or ask why their Balance did not drop after they requested a Withdraw. Both answers come from the same design: a request is just a row in `dokan_withdraw` with status pending; it reserves nothing, and a second request is refused while the first is open.

## Rule

- **One open request per Vendor.** Before creating a request, both entry points call `Withdraw\Manager::has_pending_request()` (`lite:includes/Withdraw/Manager.php:223-242`), which looks for any `dokan_withdraw` row of that Vendor with status `0` (pending), and refuse when one exists:
  - AJAX `dokan_handle_withdraw_request` (`lite:includes/Withdraw/Hooks.php:176-178`): "You already have a pending withdraw request."
  - REST `POST dokan/v1/withdraw` (`lite:includes/REST/WithdrawController.php:470-472`): HTTP 400 "You already have a pending withdraw request". This includes an admin creating a request on behalf of a Vendor.
  - The vendor dashboard form is not rendered while a request is pending (`lite:includes/Dashboard/Templates/Withdraw.php:493-497`).
- **A pending request reserves nothing.** Creation writes only the `dokan_withdraw` row (`Withdraw::create()`, `lite:includes/Withdraw/Withdraw.php:436-484`); no ledger row is written until approval ([ADR-0055](./0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)). The Balance shown to the Vendor still includes the requested amount.
- **The request is re-checked at approval.** Because nothing was reserved, approval re-runs the full validation ([ADR-0056](./0056-a-withdraw-must-be-at-least-the-minimum-withdraw-limit-and-at-most-the-balance-and-there-is-no-maximum-limit.md)). If refunds reduced the Balance below the requested amount meanwhile, approval fails and the request stays pending.
- **The slot frees up on cancellation or approval.** Once the request is cancelled (status `2`) or approved (status `1`), `has_pending_request()` no longer finds it and the Vendor may request again.

## Settings that change it

None. The one-pending-request rule is not configurable and has no filter. Automated request creators provided by add-ons are expected to respect it as well (they call `has_pending_request()` before creating).

## Worked example

Vendor Balance 300.00, minimum limit 50, no charges.

1. The Vendor requests 200.00. A pending row is created. The dashboard still shows a Balance of 300.00 and no request form.
2. The Vendor calls `POST dokan/v1/withdraw` for 100.00: rejected with HTTP 400.
3. A refund credit of 150.00 is recorded. The Balance becomes 150.00.
4. The admin tries to approve the 200.00 request: validation fails with `dokan_withdraw_not_enough_balance`. The request remains pending, and the Vendor still cannot create a new one until the admin or the Vendor cancels it.
5. The Vendor cancels it and requests 150.00, which the admin approves. The Balance becomes 0.00.

## Edge cases

- **Admins can still edit the pending row** (amount, method, note) through the REST update endpoint; edits are validated like an approval but do not create a second row.
- **Vendor staff** act for their Vendor (`dokan_get_current_user_id()` resolves to the Vendor on the AJAX path), so a staff member and the Vendor share the single slot.

## Why

No recorded decision. A single open request keeps the admin's approval queue to one item per Vendor and makes "pending" unambiguous without reserving funds.

## Consequences & risks

- A stale pending request blocks the Vendor until someone cancels it; Vendors can cancel their own ([ADR-0058](./0058-only-a-pending-withdraw-can-be-cancelled-and-cancelling-never-changes-the-balance.md)).
- Because the Balance is not held, a request can become unpayable between creation and approval; the admin learns this only when approval fails.

## Recommendations

- Show "requested, awaiting approval" separately from the available Balance in the dashboard so Vendors do not read an unchanged Balance as a failed request.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
