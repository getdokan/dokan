# The withdraw charge is a fixed fee plus a percentage, deducted from the requested amount

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Admins can charge Vendors for each Withdraw, typically to recover what PayPal or the bank charges the marketplace. Teammates ask whether the charge is added on top of the request or taken out of it, what the Vendor's Balance is debited, and whether a later change to the charge settings affects requests already made.

## Rule

- **Formula.** For a request of `amount` through a method with charge settings `{fixed, percentage}`:
  `charge = fixed + percentage / 100 × amount` and `receivable = amount − charge`
  (`Withdraw::calculate_charge()`, `lite:includes/Withdraw/Withdraw.php:383-401`). Either part may be zero. The charge is not rounded by this calculation.
- **Charge settings per method.** `dokan_withdraw_get_method_charges()` (`lite:includes/Withdraw/functions.php:543-562`) returns `{fixed, percentage}` for every registered method. A method registered without `apply_charge` (`dokan_withdraw_get_chargeable_methods()`, `:523-534`) always gets `0` and `0`; so does every method when no charges were ever saved. Lite's `paypal` and `bank` are chargeable (`:14-23`).
- **The charge comes out of the request.** The Vendor asks for `amount`, the Balance is debited `amount` on approval (the ledger credit is `$withdraw->get_amount()`, `lite:includes/Withdraw/Hooks.php:138`), and the Vendor is to be paid `receivable`. The charge is never written to the ledger as its own row; it is the part of the debited amount that the admin does not pay out.
- **The receivable must not be negative.** A request whose charge exceeds its amount is rejected ("Withdraw amount is less then the withdraw charge.", `lite:includes/Withdraw/Manager.php:69-79`). A receivable of exactly zero is accepted.
- **The charge is frozen at creation.** `Withdraw::create()` stores `charge`, `receivable` and `charge_data` inside the request's serialized `details` (`lite:includes/Withdraw/Withdraw.php:439-447`), and the model reads them back from there on every load (`:53-61`). `Withdraw::update()` does not rewrite `details` (`:496-510`), so neither a later change of charge settings nor an admin edit of the amount recomputes the stored charge.
- **Preview.** `GET dokan/v1/withdraw/charge?method=&amount=` returns the charge and receivable for a prospective request using the current settings (`WithdrawController::get_method_charge()`, `lite:includes/REST/WithdrawController.php:783-808`); the vendor request form uses it.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Withdraw charges | `dokan_withdraw[withdraw_charges][<method>][fixed]` and `[percentage]` (flat: `paypal_withdraw_charges`, `bank_transfer_withdraw_charges`, one per chargeable add-on method) | `0` and `0` for every method | `fixed` is a flat amount in store currency, `percentage` a percent of the requested amount. Values are normalised with `wc_format_decimal`. The screen shows charge inputs only for enabled, chargeable methods. |

## Worked example

Settings: PayPal charge fixed 2.00, percentage 2.5. Bank Transfer charge 0 and 0. Vendor Balance 500.00.

- PayPal request 200.00: charge = 2.00 + 2.5 % × 200.00 = 2.00 + 5.00 = **7.00**; receivable = **193.00**. On approval the Balance drops by 200.00 to 300.00, and the admin pays the Vendor 193.00.
- PayPal request 1.50 (with no minimum limit): charge = 2.00 + 0.0375 = 2.0375; receivable = −0.5375, rejected.
- Bank request 200.00: charge 0.00, receivable 200.00.
- PayPal request 123.45: charge = 2.00 + 3.08625 = 5.08625 (stored unrounded); receivable 118.36375; displays round these to the store's price decimals.

The admin then raises the PayPal charge to 3.00 + 3 % while the 200.00 request is pending. The pending request keeps charge 7.00 and receivable 193.00, but approval re-runs validation with the new settings, so it is rejected only if the new charge would make the receivable negative.

## Edge cases

- **Admin edits the amount** of a pending request through REST: the stored `charge` and `receivable` keep their creation-time values, so the receivable no longer equals amount minus charge.
- **Approval email** shows the stored receivable (`{receivable_amount}`, `lite:includes/Emails/WithdrawApproved.php:89`).
- **Exports differ.** The admin withdraw export reports the receivable as the payable amount (`lite:includes/REST/WithdrawExportController.php:128`); the legacy CSV export writes the gross requested amount (`lite:includes/Withdraw/Export/CSV.php:44`).

## Why

No recorded decision. Deducting the charge from the request keeps the Balance arithmetic simple: one credit row equal to what the Vendor asked for.

## Consequences & risks

- Marketplace reports that sum ledger credits see gross Withdraw amounts, not the cash that actually left; withdraw charge income must be derived from the `details` of approved requests.
- Paying from the legacy CSV export pays the gross amount, i.e. without deducting the charge.

## Recommendations

- If charge income must be reported, record it explicitly (for example as its own field summed by reports) rather than deriving it from serialized `details`.
- Recompute and re-store `charge` and `receivable` whenever an admin changes a request's amount or method.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
