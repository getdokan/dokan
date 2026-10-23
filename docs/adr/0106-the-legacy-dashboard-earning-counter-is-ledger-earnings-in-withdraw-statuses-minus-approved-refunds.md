# The legacy dashboard "Earning" counter is ledger earnings in withdraw statuses minus approved refunds

Status: Accepted (retroactive — documents existing code)

## Context

The legacy Vendor dashboard (WooCommerce Analytics off, see [ADR-0110](./0110-the-vendor-dashboard-shows-woocommerce-analytics-when-it-is-enabled-and-legacy-counters-and-charts-otherwise.md)) shows an "Earning" counter next to "Net Sales". Vendors often read it as their balance or as this month's earning. Teammates ask "why is Earning lower than Net Sales minus Commission?", "why doesn't Earning drop after a Withdraw?" and "why doesn't today's order show up in Earning?".

## Rule

The counter prints `dokan_get_seller_earnings( dokan_get_current_user_id() )` (`lite:templates/dashboard/big-counter-widget.php:21-22`; `lite:includes/wc-functions.php:764-772`), which is `Vendor::get_earnings()` (`lite:includes/Vendor/Vendor.php:820-861`) for today. The same figure is the `earnings` field of the Vendor dashboard REST statistics (`lite:includes/REST/VendorDashboardController.php:150`).

What `Vendor::get_earnings()` sums is already specified in [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md). From a reporting point of view that means the counter is:

- **Lifetime, not per period**: every Earning row up to today.
- **Only matured Earnings**: rows whose `balance_date` is on or before today. Earnings are stamped with `balance_date` = order creation + withdraw threshold days ([ADR-0062](./0062-the-withdraw-threshold-delays-each-earning-by-a-fixed-number-of-days-counted-from-checkout.md)), so recent orders appear only after the threshold.
- **Only Vendor orders in an earning status**: the "Order Status for Withdraw" statuses plus `wc-refunded`.
- **Minus approved refund credits only.** Withdraws and gateway-fee rows are not subtracted, so the counter is not the Balance. The Balance is shown separately (`Dashboard::get_seller_balance()`, `lite:includes/Dashboard/Templates/Dashboard.php:325-327`) and defined in [ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md).

The Earning amount on each row is the Vendor order's Earning: formula Earning plus the shipping and tax the Vendor receives, minus the gateway fee the Vendor pays (see [ADR-0104](./0104-the-commission-figure-in-reports-includes-shipping-tax-and-fees-routed-to-the-admin-minus-the-admins-gateway-fee.md) for the same split).

## Settings that change it

- `dokan_withdraw[withdraw_order_status]` ("Order Status for Withdraw"), default `wc-completed` (`lite:includes/Admin/Settings.php:753-762`). Each selected status adds those Vendor orders' Earnings; `wc-refunded` is always included.
- Withdraw threshold: `dokan_withdraw[withdraw_date_limit]`, default 0 days, overridden per Vendor by the `withdraw_date_limit` user meta when that meta is not empty (`dokan_get_withdraw_threshold()`, `lite:includes/functions.php:4058-4065`). It delays when each new Earning starts counting.
- `dokan_withdraw[exclude_cod_payment]` ("Exclude COD Payments", default `off`, `lite:includes/Admin/Settings.php:764-770`): when cash-on-delivery payments are excluded from the balance, those Earnings are never counted (see [ADR-0057](./0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md)).

## Worked example

Settings: Order Status for Withdraw = completed only; withdraw threshold 7 days; global Commission `fixed` 10 % + 0 flat; fee recipients `seller`.

| Vendor order | Created | Status | Earning row | Counted today (15 May)? |
|---|---|---|---|---|
| #501, 100.00 | 1 May | completed | 90.00, balance_date 8 May | yes |
| #502, 50.00 | 2 May | processing | 45.00, balance_date 9 May | no (status) |
| #503, 40.00 | 12 May | completed | 36.00, balance_date 19 May | no (not matured) |

An approved refund credit of 9.00 on #501 was recorded on 10 May. A Withdraw of 50.00 was approved on 11 May.

Earning counter = 90.00 − 9.00 = **81.00**. The Withdraw does not change it; the Balance does (81.00 − 50.00 = 31.00).

## Edge cases

- Selecting "processing" under Order Status for Withdraw makes #502 count immediately once matured.
- A cancelled Vendor order's row drops out because `wc-cancelled` is never an earning status.

## Why

The counter reuses the Vendor model's lifetime earning query rather than a report query; no separate decision is recorded.

## Consequences & risks

- "Earning" on the legacy dashboard and "Total Earning" in WooCommerce Analytics can differ a lot: the analytics figure is per period, includes processing and on-hold orders, ignores the threshold and uses the WooCommerce date type.

## Recommendations

- Label the counter "Lifetime earning (matured)" and show the threshold in a tooltip.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
