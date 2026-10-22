# Refunds of excluded cash-on-delivery orders never touch the Vendor's Balance

Status: Accepted (retroactive — documents existing code)

## Context

With cash on delivery (COD) the Vendor usually collects the money from the customer directly, so the marketplace never holds it. Dokan has a Withdraw setting that keeps COD sales out of the Vendor's withdrawable Balance. Teammates then ask "if a COD order is refunded, is the refund deducted from the Vendor's Balance?". If it were, the Vendor would be charged for money that was never added.

## Rule

When the "exclude COD payments" setting is on, a refund of a Vendor order paid with the `cod` gateway writes **no** `dokan_refund` row:

- `RefundHandler::exclude_cod_payment()` (`lite:includes/Order/RefundHandler.php:94`) is attached to `dokan_refund_should_insert_into_vendor_balance` (`:19`). It returns false when `dokan_withdraw[exclude_cod_payment]` is `on` and the order's payment method is `cod` (`:103-108`, `:132-134`), so `insert_into_balance_table()` returns before inserting (`:214-216`).
- This mirrors the sale side: for the same orders, `Order\Hooks::on_order_status_change` never moves the order's `dokan_orders` ledger row into a counted status (`lite:includes/Order/Hooks.php:144-170`), so the sale never reaches the Balance either.

Both decisions are filterable, through **different** filters: `dokan_order_should_exclude_from_vendor_balance` on the sale side (`lite:includes/Order/Hooks.php:160`) and `dokan_order_refund_should_exclude_from_vendor_balance` on the refund side (`lite:includes/Order/RefundHandler.php:122-130`). Other payment flows (the code comment names wePOS) use these filters to treat their own cash orders the same way.

The rule applies to every caller of `dokan_refund_adjust_vendor_balance`, so add-ons that book refunds through that action inherit it.

## Settings that change it

| Setting | Default | Behaviour |
|---|---|---|
| `dokan_withdraw[exclude_cod_payment]` | `off` (`lite:includes/Order/RefundHandler.php:103`) | `off`: COD orders are treated like any other order; their sale counts toward the Balance and their refunds are booked as `dokan_refund` credits. `on`: COD sales do not count toward the Balance and COD refunds are not booked. |

Filters: `dokan_order_should_exclude_from_vendor_balance` (sale side), `dokan_order_refund_should_exclude_from_vendor_balance` (refund side), `dokan_refund_should_insert_into_vendor_balance` (general veto on any refund row).

## Worked example

Settings: global Commission `fixed`, `admin_percentage = 10`, `additional_fee = 0`; no shipping or tax. Vendor order paid by `cod`, one line 100.00, Earning 90.00, completed. Then a full itemised refund of 100.00 (Vendor share 90.00).

| `exclude_cod_payment` | Sale counted in Balance | Refund row | Balance after refund |
|---|---|---|---|
| `off` | +90.00 | credit 90.00 | 0.00 |
| `on` | 0.00 (the row is created with an empty status, `lite:includes/Models/VendorBalance.php:39`, and is never moved into a counted status) | none | 0.00 |

## Edge cases

- **Turning the setting on or off after the sale.** The sale side is decided at each status change and the refund side at refund time. An order sold while the setting was `off` (sale counted) and refunded after it was switched `on` gets no refund credit, so the Vendor keeps the Earning. The reverse (sold `on`, refunded `off`) books a refund credit for a sale that was never counted. For a partial refund the Vendor's Balance therefore goes down by money that was never added. A full refund also moves the order to *Refunded*; with the setting now `off`, that status change moves the sale row into the always-counted `wc-refunded` status (`lite:includes/Order/Hooks.php:173-183`), so the sale debit and the refund credit cancel out.
- **One filter overridden, the other not.** Because the two sides use different filter names, an integration that hooks only one of them can count the sale but skip the refund, or the opposite.

## Why

The sale-side code comment states the purpose: "If `exclude_cod_payment` is enabled, don't include the fund in vendor's withdrawal balance" (`lite:includes/Order/Hooks.php:140-142`). The refund side applies the same test so that a refund never removes money that was never added.

## Consequences & risks

- COD refunds are settled between Vendor and customer outside Dokan's ledger when the setting is on; statements show neither the sale nor the refund in the Balance.
- Changing the setting on a live marketplace affects in-flight COD orders asymmetrically, as described above.

## Recommendations

- Record the setting's value on the order at sale time (like Fee recipients in Lite ADR 0012) and use the recorded value at refund time.
- Give the two filters a shared name, or have the refund side default to the sale side's decision, so integrations cannot desynchronise them.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
