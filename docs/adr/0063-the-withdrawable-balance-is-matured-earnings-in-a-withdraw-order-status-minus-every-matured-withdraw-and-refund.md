# The withdrawable balance is matured Earnings in a withdraw order status minus every matured Withdraw and Refund

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

"How much can this Vendor withdraw right now?" and "when does an order count as the Vendor's earnings?" are the most common money questions. Every Vendor order has a ledger row from the moment it is created, and that row's status follows the order ([ADR-0039](./0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md), [ADR-0043](./0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md)), so both questions are answered at read time: by which statuses and dates the Balance queries accept. Lite ADR 0013 records the structural decision that money lives in custom tables and that the Balance is computed, not stored. This ADR states the business rule behind the number: which ledger rows count, which do not, and what the admin can change. When and how the ledger rows themselves are written (the Earning at checkout, the Refund credit) belongs to the Earning-recording and refund ADRs and is only referenced here.

## Rule

The withdrawable Balance of a Vendor on a given day is:

```
Balance = SUM(debit of rows with an active order status and balance_date <= today)
        − SUM(credit of all rows with balance_date <= today)
```

computed by `Vendor::get_balance()` (`lite:includes/Vendor/Vendor.php:873`, query at `:886-901`) and exposed as `dokan_get_seller_balance()` (`lite:includes/wc-functions.php:746`).

- **Earnings count only in an active order status (the "earning statuses").** The debit side is limited to rows whose `status` is in `dokan_withdraw_get_active_order_status()` (`lite:includes/Withdraw/functions.php:355-366`): it starts with `[ 'wc-refunded' ]` (`:357`), appends every non-empty value of `dokan_withdraw[withdraw_order_status]` (falling back to `[ 'wc-completed' ]` when the option is missing, `:356`), and passes the result through the `dokan_withdraw_active_status` filter (`:365`). An Earning row's `status` mirrors its Vendor order's WooCommerce status (`Order\Hooks::on_order_status_change`, `lite:includes/Order/Hooks.php:174-180`).
- **Statuses that never count** unless an extension adds them through that filter: the empty status of a freshly created row, `wc-pending`, `wc-cancelled`, `wc-failed`, `wc-trash`, `wc-checkout-draft` and any custom status. `wc-processing` and `wc-on-hold` count only when selected. Leaving an earning status removes the Earning without any reversal row ([ADR-0040](./0040-cancelling-or-failing-a-vendor-order-drops-its-earning-from-the-balance-without-a-reversal-entry.md)).
- **Why `wc-refunded` is always in the list.** A refund is booked as a separate `dokan_refund` credit and the order's debit row is never reduced ([ADR-0047](./0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md)). When an order is fully refunded WooCommerce moves it to `refunded` (`wc:includes/wc-order-functions.php:737`). If `wc-refunded` stopped counting, the debit would disappear while its refund credit stayed, and the Vendor would lose the money twice. Keeping the debit counted lets the credit cancel it. The reason is not documented in code; it is inferred from how refund credits are booked. Setting an order to Refunded without itemised refund lines therefore changes nothing in the Balance ([ADR-0049](./0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md)).
- **Earnings count only once matured.** Only rows with `DATE(balance_date) <= today` count (`lite:includes/Vendor/Vendor.php:893`, `:896`). The maturity date of an Earning is set by the withdraw threshold; see [ADR-0062](./0062-the-withdraw-threshold-delays-each-earning-by-a-fixed-number-of-days-counted-from-checkout.md).
- **Every credit reduces the Balance, whatever its type or status.** The credit sub-query has no `status` or `trn_type` condition (`lite:includes/Vendor/Vendor.php:891-894`). Approved Withdraws (`dokan_withdraw`) and Refunds (`dokan_refund`) are credits; both are written with `balance_date` = the moment they are recorded (`lite:includes/Withdraw/Hooks.php:141`, `lite:includes/Order/RefundHandler.php:235`), so they reduce the Balance immediately, with no threshold.
- **The credit total is rounded to WooCommerce's rounding precision** before the subtraction (`NumberUtil::round( $result->withdraw, wc_get_rounding_precision() )`, `lite:includes/Vendor/Vendor.php:901`).
- **Withdraw validation compares in integer cents.** A request is rejected if `round(amount × 100) > round(balance × 100)` (`lite:includes/Withdraw/Manager.php:44-50`), so a request for exactly the displayed Balance is accepted despite floating-point drift.
- **A pending Withdraw does not reduce the Balance.** Only approval writes the credit ([ADR-0055](./0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)).
- **Parent orders never contribute.** Earnings are recorded on Vendor orders only (`dokan_sync_insert_order()` returns early for an order with `has_sub_order`, `lite:includes/Order/functions.php:235-237`), consistent with Lite ADR 0004.

The value is cached per Vendor and day under `seller_balance_{id}_{Y_m_d}` in the `withdraws_seller_{id}` group (`lite:includes/Vendor/Vendor.php:880-882`) and filtered through `dokan_get_seller_balance` (`:917`).

Two other readers apply the same earning-status list but are **not** the withdrawable Balance and are not used by Withdraw validation:

- `Vendor::get_earnings()` (`lite:includes/Vendor/Vendor.php:820-861`): `SUM(debit)` of `dokan_orders` rows whose status is in the list, minus `SUM(credit)` of `dokan_refund` rows with status `approved`, both limited to `balance_date` up to the given day. Withdraw credits are not subtracted. It feeds the legacy dashboard "Earning" counter ([ADR-0106](./0106-the-legacy-dashboard-earning-counter-is-ledger-earnings-in-withdraw-statuses-minus-approved-refunds.md)).
- `VendorBalanceStore::get_total_earning_by_vendor()` (`lite:includes/Models/DataStore/VendorBalanceStore.php:59-93`): `SUM(debit) - SUM(credit)` over `dokan_orders` and `dokan_refund` rows whose status is in the list or `approved`, with the filters `dokan_vendor_total_balance_order_status` and `dokan_vendor_total_balance_trn_types`.

`approved` is a ledger status, not an order status: Refund and Withdraw rows use it.

## Settings that change it

| Setting | Key | Default | Effect |
|---|---|---|---|
| Order Status for Withdraw | `dokan_withdraw[withdraw_order_status]` (flat store: `withdraw_order_status`) | Never saved: `['wc-completed']` (reader default, `lite:includes/Withdraw/functions.php:356`). The new settings screen pre-fills `['wc-processing']` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1289`) and the legacy screen `wc-completed` (`lite:includes/Admin/Settings.php:758-760`); whatever is shown is stored when the admin saves that page. | Options are Completed, Processing and On-hold (`AdminSettings::withdraw_order_status_options()`, `lite:includes/Utilities/AdminSettings.php:62`, filterable through `dokan_settings_withdraw_order_status_options`). An Earning counts while its Vendor order is in any selected status. `wc-refunded` always counts in addition. |
| Exclude COD payments | `dokan_withdraw[exclude_cod_payment]` | `off` | See [ADR-0057](./0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md). |
| Withdraw threshold | `dokan_withdraw[withdraw_date_limit]`, user meta `withdraw_date_limit` | `0` | Moves `balance_date` forward; see the threshold ADR. |

Effect of the "Order Status for Withdraw" selection (with the always-on `wc-refunded`):

| Selection | Earning statuses | An Earning counts when its Vendor order is… |
|---|---|---|
| `wc-completed` only | `wc-refunded`, `wc-completed` | completed (or refunded) |
| `wc-completed`, `wc-processing` | `wc-refunded`, `wc-completed`, `wc-processing` | paid and not yet cancelled |
| `wc-completed`, `wc-processing`, `wc-on-hold` | adds `wc-on-hold` | also while awaiting a manual payment |
| nothing selected | `wc-refunded` | only refunded (in practice, never positively) |

**Defaults differ by entry point.** The runtime fallback, the legacy settings page and the setup wizard (`lite:includes/Admin/SetupWizard.php:673`) all use `wc-completed`, while the new admin settings schema declares `[ 'wc-processing' ]`. A site whose option was first written by the new settings screen therefore counts `processing` orders, while one set up through the wizard counts only `completed` ones. Always read the stored option rather than assuming a default.

Filters: `dokan_withdraw_active_status` (the list for all readers), `dokan_vendor_total_balance_order_status` and `dokan_vendor_total_balance_trn_types` (`VendorBalanceStore` only).

The legacy-to-flat settings bridge is described in Lite ADR 0002 and Lite ADR 0003.

## Worked example

Settings: Order Status for Withdraw = Completed only (active list `wc-refunded`, `wc-completed`); threshold 0; COD not excluded.

| Ledger row | debit | credit | status | counts? |
|---|---|---|---|---|
| Vendor order A, Earning | 80.00 | | `wc-completed` | yes |
| Vendor order B, Earning | 40.00 | | `wc-processing` | no (status not selected) |
| Partial Refund on A | | 30.00 | `approved` | yes (credits always count) |
| Approved Withdraw #12 | | 20.00 | `approved` | yes |

Balance = 80.00 − (30.00 + 20.00) = **30.00**. A request for 30.00 passes the cents comparison; a request for 30.01 fails with `dokan_withdraw_not_enough_balance`.

When order B moves to Completed, its row's status becomes `wc-completed` and the Balance becomes 80.00 + 40.00 − 50.00 = **70.00**. Adding Processing to the setting would have produced the same 70.00 without waiting.

Full refund of a third Vendor order C (Earning 50.00): the order moves to `wc-refunded`, so its 50.00 debit keeps counting, and the Refund writes a 50.00 credit. Net effect 0.00. If `wc-refunded` were not always appended, the debit would vanish while the credit stayed, and the Vendor would be charged the refund twice.

Timeline of a multi-vendor checkout (Commission `fixed` 10 % + 0; selection `wc-completed` only; `balance_date`s already passed). Order #300 is split into Suborders #301 (Vendor A, Earning 54.00) and #302 (Vendor B, Earning 36.00):

| Moment | #301 status | #302 status | A's Balance contribution | B's Balance contribution |
|---|---|---|---|---|
| After checkout | `''` | `''` | 0.00 | 0.00 |
| After payment | `wc-processing` | `wc-processing` | 0.00 | 0.00 |
| A completes #301 | `wc-completed` | `wc-processing` | 54.00 | 0.00 |
| B completes #302 | `wc-completed` | `wc-completed` | 54.00 | 36.00 |

With the selection `wc-completed`, `wc-processing`, both Vendors' Earnings count right after payment.

## Edge cases

- **Negative Balance.** Refunds recorded after a Withdraw was paid can push the Balance below zero. The vendor dashboard then shows "You have already withdrawn X. This amount will be deducted from your balance." (`lite:includes/Dashboard/Templates/Withdraw.php:487-491`), and no request can pass validation until new Earnings cover the deficit.
- **Earning rows without a status.** An Earning row is inserted with an empty `status` and receives one on the Vendor order's next status change ([ADR-0039](./0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md); Lite ADR 0013, Risks). Until then it never counts.
- **One setting for every Vendor.** The earning-status list has no per-Vendor override, and selecting `wc-on-hold` lets Earnings count before manual payments are confirmed.
- **Changing the status setting is retroactive.** Unlike the threshold, the status filter is applied at read time, so adding or removing a status changes every Vendor's Balance immediately (after cache expiry or invalidation).
- **Trashed orders.** Trashing or untrashing a Vendor order writes the order's status at that moment onto its ledger row (`OrderEventListener::after_order_trash` and `after_order_untrash`, `lite:includes/Order/OrderEventListener.php:25`, `:48`, `:75-98`); the Earning counts only while that status is an active one.

## Why

No recorded decision for the formula. The option's description states the intent of the status filter: "Order status for which vendor can make a withdraw request" (`lite:includes/Admin/Settings.php:756`); the Store Admin decides at which point in fulfilment an Earning is considered earned. The cents comparison is deliberate: the code comment says it exists so that an exact-balance withdrawal is not rejected by IEEE-754 drift (`lite:includes/Withdraw/Manager.php:44`).

## Consequences & risks

- A Vendor can see an order as "completed" in WooCommerce and still not be able to withdraw its Earning if the threshold has not elapsed; support questions about "missing balance" usually come down to status or maturity.
- Because credits ignore status, any third-party code that writes a credit row reduces the Balance, whether or not it intended to.
- The Balance shown includes the amount of a pending request, so a Vendor's displayed Balance is not "money not yet requested".

## Recommendations

- If the display of "available" versus "requested" money becomes a support burden, show pending request amounts separately in the dashboard rather than changing the formula.
- Keep the always-appended `wc-refunded` status; removing it would double-charge refunds as shown in the worked example. Surface it in the settings description so admins understand why refunded orders still appear in the Balance with their offsetting refund.
- Align the new settings schema default (`wc-processing`) with the runtime fallback (`wc-completed`), or the other way round, so "default" means one thing.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
