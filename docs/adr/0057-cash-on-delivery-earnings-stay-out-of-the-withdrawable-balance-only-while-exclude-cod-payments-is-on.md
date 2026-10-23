# Cash-on-delivery Earnings stay out of the withdrawable balance only while "Exclude COD payments" is on

Status: Accepted (retroactive — documents existing code)

## Context

With cash on delivery (WooCommerce gateway id `cod`) the customer pays the Vendor in person, so the Vendor already holds the whole order total, including the admin's Commission. If the Vendor's Earning for that order also entered the Balance, the Vendor could be paid the same Earning a second time through a Withdraw. Dokan has a setting for this and a separate mechanism, Reverse withdrawal, for collecting the Commission back (Lite ADR 0014). Teammates ask how the two relate and why a COD order sometimes does and sometimes does not show up in the Balance.

## Rule

- **The exclusion is decided on every Vendor order status change.** `Order\Hooks::on_order_status_change()` (`lite:includes/Order/Hooks.php:95`) computes `exclude = (exclude_cod_payment === 'on') && payment method === 'cod'` (`:145-147`), passes it through the `dokan_order_should_exclude_from_vendor_balance` filter (`:160-167`), and when it is true returns before updating the Earning row's `status` (`:169-171`, update at `:174-180`).
- **An excluded Earning never matches an active status.** Earning rows are inserted with an empty `status` (`lite:includes/Order/functions.php:273-282`; see [ADR-0039](./0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md)). Because the status is never synced for an excluded COD order, the row keeps whatever status it last had (empty for orders created while the setting is on), never reaches an active withdraw order status and never counts toward the Balance ([ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)).
- **Only the Balance is affected.** Before the exclusion check, the same listener still updates `dokan_orders.order_status` (`lite:includes/Order/Hooks.php:117-123`) and copies the status to Suborders (`:125-138`). The `dokan_orders` row, used by reports and the Vendor's order list, keeps the real status and the Earning.
- **Which payment method is tested.** The check uses the payment method of the Vendor order whose status changed. Suborders copy the parent's payment method at creation, so all Vendor orders of a COD Order are excluded. The filter `dokan_order_should_exclude_from_vendor_balance` receives the order, its id, the new `wc-` status and the raw setting, so it can decide per order and per status change.
- **Refunds of excluded COD orders write no Refund credit.** The refund side of the same setting is a refund rule and is recorded in [ADR-0051](./0051-refunds-of-excluded-cash-on-delivery-orders-never-touch-the-vendor-balance.md): the Vendor's Balance is never debited for money that never entered it.
- **The setting is not retroactive.** It acts on the next status change of each order, not on rows already synced.
- **Reverse withdrawal is independent of this setting.** The Commission debit for a COD order is written on completion when Reverse withdrawal is enabled for the `cod` gateway, whatever `exclude_cod_payment` says (Lite ADR 0014). The two settings must be combined deliberately; see the worked example.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Exclude COD Payments (legacy screen) | `dokan_withdraw[exclude_cod_payment]` | `off` (`lite:includes/Admin/Settings.php:764-770`; reader default at `lite:includes/Order/Hooks.php:145`) | `on`: COD Earnings and COD Refunds stay out of the Balance. `off`: COD orders behave like any other order. |
| Include COD payments in balance (new screen) | flat key `include_cod_payments_in_balance` | `on` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:979-1003`) | The inverse of the legacy key through `InvertOnOffTransformer`: `on` here equals `exclude_cod_payment = off`. |
| Reverse withdrawal | `dokan_reverse_withdrawal[enabled]` and its gateway list | `off`; gateway list `cod` when enabled | Records the Commission as a debt owed by the Vendor (Lite ADR 0014). |

## Worked example

A COD Vendor order of 100.00 with a Commission of 10.00, so the Earning is 90.00. Order Status for Withdraw = Completed, threshold 0. The Vendor collects 100.00 in cash. The order is completed.

| Exclude COD | Reverse withdrawal | Balance change | Reverse withdrawal debt | Vendor's net position |
|---|---|---|---|---|
| off | off | +90.00 | 0 | Holds 100.00 cash and can withdraw 90.00 more: the marketplace pays the Earning twice and never collects its Commission. |
| on | off | 0.00 | 0 | Holds 100.00 cash. The Earning is right, but the 10.00 Commission is never collected. |
| off | on | +90.00 | 10.00 | Holds 100.00 cash, can withdraw 90.00 and owes 10.00: the Earning is paid twice. |
| on | on | 0.00 | 10.00 | Holds 100.00 cash and owes 10.00. Net 90.00, which equals the Earning. |

Only the last combination leaves the Vendor with exactly the Earning.

Ledger view of the same order (single-vendor COD Order #400, 100.00 from Vendor V):

| Event | `dokan_orders.order_status` | Balance row status (exclusion `on` / `off`) | V's Balance contribution (`on` / `off`) |
|---|---|---|---|
| Checkout | `wc-pending` | `''` / `''` | 0.00 / 0.00 |
| Store Admin marks `processing` | `wc-processing` | `''` / `wc-processing` | 0.00 / 0.00 |
| Vendor V completes it | `wc-completed` | `''` / `wc-completed` | 0.00 / 90.00 |

## Edge cases

- **Turning the setting on after a COD order was completed** leaves that order's row at `wc-completed`, so its Earning keeps counting. Later status changes (for example to Refunded) are no longer synced.
- **Turning the setting off** makes the next status change of each COD order sync normally; an order already completed while the setting was on keeps an empty status until it changes status again.
- **Other direct-payment gateways** (`bacs`, `cheque` and others) are not covered by the setting, which tests for `cod` only. Code can widen it through `dokan_order_should_exclude_from_vendor_balance` and `dokan_refund_should_insert_into_vendor_balance`; point-of-sale integrations use these filters for their own cash orders.
- **Existing rows are not rewritten** when the setting changes. A clean switch needs a status change on each affected order.
- **The parent of a multi-vendor COD Order** has no ledger row, so nothing changes there; the exclusion applies to each Suborder's own status change.

## Why

No recorded decision beyond the setting's description: "If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance." (`lite:includes/Admin/Settings.php:767`).

## Consequences & risks

- Nothing ties this setting to Reverse withdrawal, so an admin who enables one without the other produces one of the unbalanced rows of the table above.
- Because exclusion works by withholding a status rather than by an explicit flag, "is this order in the Balance?" can only be answered by looking at the ledger row's status.

## Recommendations

- When Reverse withdrawal is enabled for `cod`, warn the admin if "Exclude COD Payments" is off, or switch it on as part of enabling Reverse withdrawal.
- Consider an explicit `excluded` status on the ledger row so exclusion is visible and not dependent on the empty initial status.
- Record the exclusion decision on the order (for example as order meta at creation) and apply it to that order for its whole life, so later changes of the setting cannot leave half-updated rows.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
