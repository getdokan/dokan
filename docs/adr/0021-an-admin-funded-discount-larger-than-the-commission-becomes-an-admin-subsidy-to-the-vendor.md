# An admin-funded discount larger than the commission becomes an admin subsidy to the Vendor

Status: Accepted (retroactive — documents existing code)

## Context

When the admin funds a coupon (see [ADR-0024](./0024-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md)), the Vendor's Earning is computed as if the customer had paid full price. If the discount is larger than the Commission the admin would have earned, the admin's share of the line goes below zero: the Vendor is owed more than the customer paid for the item. Teammates ask what "admin subsidy" means in order data and Analytics, and how much the Vendor actually receives in such a case.

## Rule

- **Commission may be negative.** `Calculator::calculate()` caps the Commission at the line total but applies no lower bound (`lite:includes/Commission/Calculator.php:120`), and the Earning is `line_total − Commission`, which then exceeds the line total (`:122`). `OrderCommission::calculate()` sums these signed values into `admin_net_commission` (`lite:includes/Commission/OrderCommission.php:91`).
- **The negative part is the subsidy.** `Model\Commission::get_admin_subsidy()` returns `abs( min( admin_net_commission, 0 ) )` (`lite:includes/Commission/Model/Commission.php:169-171`). On a single line item's `Commission` object, `get_admin_commission()` is the clamped figure `max( admin_net_commission, 0 )` (`:165-167`). `OrderCommission` overrides `get_admin_commission()` (deprecated since 5.0.0) as `admin_net_commission + admin fees`, with **no** clamp (`lite:includes/Commission/OrderCommission.php:531-533`). `OrderCommission::get_data()` exposes that unclamped `admin_commission` beside `admin_net_commission` and `admin_subsidy` (`lite:includes/Commission/OrderCommission.php:441-455`).
- **The Vendor's Earning includes the subsidy.** `OrderCommission::get_vendor_earning()` is `vendor_net_earning + vendor fees` (`lite:includes/Commission/OrderCommission.php:340-342`), and `vendor_net_earning` already contains the subsidised amount. This is the figure written as the Vendor order's Earning.
- **A capped figure exists for paying out at payment time.** When the admin's total for the order (`admin_net_commission + admin fees`, the overridden `get_admin_commission()`) is negative, `OrderCommission::get_vendor_earning_subtotal()` returns the Vendor's Earning minus the absolute value of that total, so the result does not exceed what the customer actually paid towards the Vendor order (`lite:includes/Commission/OrderCommission.php:358-368`). It is exposed as `Commission::get_vendor_earning_subtotal_by_order()` with the filter `dokan_get_vendor_earning_subtotal_by_order` (`lite:includes/Commission.php:257-286`). Add-on payment integrations that split the customer's payment at checkout call this method for each Vendor order; the difference is the admin's subsidy, which reaches the Vendor through the Balance rather than through the customer's payment.

## Settings that change it

None directly. The subsidy appears only when a coupon is admin-funded (coupon meta `coupon_commissions_type = from_admin` or the admin part of `shared_coupon`) and that admin-funded part exceeds the Commission computed on the undiscounted price.

## Worked example

Settings: global `fixed`, 10 % + 2.00. Line: 1 unit at 100.00. Admin-funded coupon 20.00. No shipping, tax or other fees, so admin fees are 0.

- line_total = 80.00; base = 100.00; raw = 10.00 + 2.00 − 20.00 = −8.00.
- `admin_net_commission` = −8.00 → `admin_subsidy` = 8.00. The line item's clamped `get_admin_commission()` is 0.00, while the order-level `get_data()['admin_commission']` is −8.00 + 0.00 fees = −8.00.
- `vendor_net_earning` = 80.00 − (−8.00) = 88.00 → Earning recorded for the Vendor order = 88.00 (the same as without the coupon).
- `get_vendor_earning_subtotal()`: the admin total is −8.00 < 0, so it returns 88.00 − |−8.00| = 80.00, the amount the customer actually paid for the line.

## Edge cases

- Within one Vendor order, a positive Commission on one line and a subsidy on another net off in `admin_net_commission`; `admin_subsidy` is only non-zero when the summed `admin_net_commission` of the order is negative.
- `get_vendor_earning_subtotal()` compares against `admin_net_commission + admin fees`. If the admin also receives shipping or tax (see the [fee-recipient ADRs](decisions-index.md#fees-shipping-and-tax-attribution)), those fees offset the subsidy: when they are at least as large as the subsidy the capped figure is not reduced at all, and otherwise it is reduced only by the part of the subsidy they do not cover.
- On marketplace-owned order types the whole amount is admin earning and no subsidy is computed (see [ADR-0026](./0026-marketplace-owned-order-types-give-the-whole-line-amount-to-the-admin-and-nothing-to-the-vendor.md)).

## Why

The docblock of `get_vendor_earning_subtotal()` states the purpose: return the Vendor's payable subtotal "excludes admin subsidy" and cap it "to the amount actually paid by the customer (net of refunds) to avoid overpay during payment" (`lite:includes/Commission/OrderCommission.php:344-357`).

## Consequences & risks

- Two "Vendor earning" figures exist for subsidised orders. Code that pays Vendors must choose deliberately between the full Earning (ledger) and the capped subtotal (what can be transferred out of the customer's payment).
- Reports that sum `admin_net_commission` show the admin's real net (including subsidies); reports that sum the clamped per-line `get_admin_commission()` overstate it. The order-level `admin_commission` in `get_data()` is not clamped and also includes admin fees, so it is a different figure again; readers must check which one a report uses.

## Recommendations

- Label the subsidy explicitly wherever Vendor Earnings are shown, so Vendors understand why their Earning exceeds the price the customer paid.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
