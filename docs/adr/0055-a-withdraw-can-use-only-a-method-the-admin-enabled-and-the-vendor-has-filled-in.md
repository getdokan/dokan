# A Withdraw can use only a method the admin enabled and the Vendor has filled in

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A withdraw method is how the admin pays the Vendor outside Dokan: PayPal, bank transfer, or a method added by an add-on. Three lists are involved and teammates confuse them: the methods Dokan knows about, the methods the admin has switched on, and the methods a particular Vendor has set up in their payment settings. This ADR states which list governs what.

## Rule

**Registered methods.** `dokan_withdraw_register_methods()` (`lite:includes/Withdraw/functions.php:12-27`) returns the method registry. Lite registers two:

| Key | Title | Vendor profile field that makes it "filled in" | `apply_charge` |
|---|---|---|---|
| `paypal` | PayPal | `dokan_profile_settings.payment.paypal.email` | true |
| `bank` | Bank Transfer | `dokan_profile_settings.payment.bank.ac_number` | true |

Add-ons add entries through the `dokan_withdraw_methods` filter (`:26`), each with a title, a settings-form callback and an `apply_charge` flag.

**Admin-enabled methods.** `dokan_withdraw_get_active_methods()` (`lite:includes/Withdraw/functions.php:52-56`) reads `dokan_withdraw[withdraw_methods]` and drops empty entries; `dokan_is_withdraw_method_enabled()` (`:510-516`) tests one key. The admin enables or disables each method on the Withdraw settings screen.

**Vendor-filled methods.** `dokan_get_seller_active_withdraw_methods( $vendor_id )` (`lite:includes/Withdraw/functions.php:67-85`) returns the methods whose profile field is non-empty: `paypal` when a PayPal email is saved, `bank` when an account number is saved, and `skrill` when a Skrill email is saved (a key that add-ons may register). Add-ons extend the list through `dokan_get_seller_active_withdraw_methods`.

**The rule.** A Withdraw may name only a method that is both enabled by the admin and filled in by the Vendor:

- The request form offers exactly that intersection (`lite:includes/Dashboard/Templates/Withdraw.php:505`; `WithdrawControllerV2::get_withdraw_settings()`, `lite:includes/REST/WithdrawControllerV2.php:75`).
- The validator rejects a method the Vendor has not filled in with `dokan_withdraw_invalid_method` ("Withdraw method is not active.") at creation and at approval (`lite:includes/Withdraw/Manager.php:57-59`); the AJAX handler checks the same list first (`lite:includes/Withdraw/Hooks.php:191-193`).
- The Vendor's default method can be set only to an admin-enabled method (`Hooks::ajax_handle_make_default_method()`, `lite:includes/Withdraw/Hooks.php:254-256`).

**Methods that can carry a manual or scheduled Withdraw.** `dokan_withdraw_get_withdrawable_active_methods()` (`lite:includes/Withdraw/functions.php:488-499`) narrows the admin-enabled list to the keys in the `dokan_withdraw_withdrawable_payment_methods` filter, default `['paypal', 'bank']`. A method registered only so that a Vendor can connect an account (for example a payment gateway that pays Vendors directly) is not withdrawable unless an add-on adds it to that filter.

**Default method.** `dokan_withdraw_get_default_method()` (`lite:includes/Withdraw/functions.php:443-457`) returns the Vendor's `dokan_withdraw_default_method` user meta if set, else the first filled-in method, else `paypal`.

**Payment details are snapshotted.** When a request is created, the Vendor's profile for the chosen method is copied into the request's `details` column (`Manager::get_formatted_details()`, `lite:includes/Withdraw/Manager.php:313-326`; `Withdraw::create()`, `lite:includes/Withdraw/Withdraw.php:441-447`, filter `dokan_withdraw_request_details_data`). Later edits to the Vendor's PayPal email or bank account do not change requests already made.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Withdraw methods | `dokan_withdraw[withdraw_methods]` (flat: `paypal_withdraw`, `bank_transfer_withdraw`, and one toggle per add-on method) | Never saved: `['paypal']` (reader default, `lite:includes/Withdraw/functions.php:53`). Fresh settings screens: PayPal on, Bank Transfer off (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:832`, `:893`; legacy `lite:includes/Admin/Settings.php:720`). | A method that is off is not offered to Vendors and cannot become their default. |
| Bank required fields | filter `dokan_bank_payment_required_fields` | `ac_name`, `ac_type`, `ac_number`, `routing_number` (`lite:includes/Withdraw/functions.php:217-250`) | Fields the bank form requires before it counts as "connected" in the UI. For the withdraw rule only `ac_number` matters. |

## Worked example

Settings: PayPal enabled, Bank Transfer disabled. Vendor V saved a PayPal email and a bank account number.

- Admin-enabled: `paypal`. Vendor-filled: `paypal`, `bank`. Intersection: `paypal`.
- V's request form offers PayPal only. A PayPal request for 100.00 stores V's PayPal email in `details`.
- V changes the PayPal email the next day. The pending request still shows the old email; the admin pays that address unless V cancels and re-requests. An admin edit of the request through the REST update does not refresh the stored `details` either, because `Withdraw::update()` never rewrites that column (`lite:includes/Withdraw/Withdraw.php:496-510`).

## Edge cases

- **Disabling a method with pending requests** does not cancel them; the admin decides what to do with each.
- **Vendor disconnects a method** (clears the field) while a request is pending: approval then fails with `dokan_withdraw_invalid_method`.
- **Method titles** shown in lists come from `dokan_withdraw_get_method_title()` (`lite:includes/Withdraw/functions.php:112-119`, filter `dokan_get_withdraw_method_title`); an unregistered key is shown with its first letter capitalised.

## Why

No recorded decision. Separating "enabled by admin" from "filled in by Vendor" lets the admin offer several payout rails while each Vendor configures only the ones they use.

## Consequences & risks

- Support questions of the form "my method is missing" are answered by checking both lists: the admin toggle and the Vendor's saved profile field.
- The snapshot protects the audit trail but means a mistyped account on a pending request must be corrected by cancelling and re-requesting.

## Recommendations

- Expose a single helper that returns the usable methods for a Vendor (the intersection), and use it in every place that lists or checks methods, so the three lists stop being recombined by hand.
- When the admin disables a method, tell the affected Vendors; their default method silently stops being offered.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
