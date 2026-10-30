# Top-performing Vendors are ranked by Earning on orders created in the month, whatever their status

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

The admin dashboard lists the top five Vendors for a selected month (`GET dokan/v1/admin/dashboard/top-performing-vendors?date=YYYY-MM`) with their total Earning, order count and Commission. Teammates ask "is the ranking by sales or by Earning?", "do cancelled orders count?" and "why are only four Vendors listed?".

## Rule

`VendorOrderStatsStore::get_top_performing_vendors()` (`lite:includes/Models/DataStore/VendorOrderStatsStore.php:121-140`) groups `dokan_order_stats` rows joined to `wc_order_stats` by `vendor_id` and returns, per Vendor:

- `total_earning` = `SUM(vendor_earning)`,
- `total_orders` = `COUNT(order_id)`,
- `total_commission` = `SUM(admin_commission)`,

for rows with `DATE(wc_order_stats.date_created)` between the period's first and last day inclusive (`:131`), ordered by `total_earning` descending, limited to 5 (`:133-135`). There is **no status condition and no order-type condition**.

The period comes from `parse_date_range()` (the selected month, ending today for the running month; see [ADR-0096](./0096-an-active-vendor-on-the-admin-dashboard-is-one-with-a-positive-earning-on-an-order-created-in-the-period.md)). `AdminDashboardStatsController::get_top_performing_vendors()` (`lite:includes/REST/AdminDashboardStatsController.php:403-433`) then drops any row whose `vendor_id` does not load a user (`dokan()->vendor->get()` returns id 0, as it does for the `vendor_id` 0 group and for deleted accounts), numbers the rest from 1 and passes the list through `dokan_rest_admin_dashboard_top_performing_vendors_data`.

So:

- **Ranking is by Earning** (the Vendor's share including the shipping and tax they receive), not by sales or Commission.
- **Every status counts**: pending, failed and cancelled Vendor orders add to a Vendor's Earning and order count.
- **Refund rows count as orders**: a Vendor's refund rows carry their `vendor_id`, so each refund adds 1 to `total_orders` (and 0 to the money columns). The refunded order's own row already shows its reduced Earning.
- **Parent Orders and marketplace-owned orders** are grouped under `vendor_id` 0. That group takes one of the five slots when it ranks high enough and is then removed, so fewer than five Vendors may be listed.

## Settings that change it

None. The WooCommerce Analytics excluded statuses are not applied here (contrast [ADR-0100](./0100-reports-leave-out-the-order-statuses-excluded-in-woocommerce-analytics-settings.md)). Fee recipients and Commission formulas change the Earning that drives the ranking.

## Worked example

Settings: global Commission `fixed` 10 % + 0 flat; fee recipients `seller`; no tax or shipping.

In June:

- Vendor A: completed Vendor order 200.00 (Earning 180.00), and a cancelled one 100.00 (Earning 90.00). One 20.00 refund on the completed order, imported: its row becomes Earning 162.00.
- Vendor B: completed Vendor order 250.00 (Earning 225.00).
- One multi-vendor checkout of 300.00 split between Vendors C and D; the parent row (`vendor_id` 0) has Earning 270.00, the Suborders 135.00 each.

| Group | total_earning | total_orders | Listed |
|---|---|---|---|
| 0 (parent row) | 270.00 | 1 | removed |
| A | 162.00 + 90.00 = 252.00 | 3 (two orders + one refund row) | rank 1 |
| B | 225.00 | 1 | rank 2 |
| C | 135.00 | 1 | rank 3 |
| D | 135.00 | 1 | rank 4 |

Vendor A ranks first only because of a cancelled order; only four Vendors are shown.

## Edge cases

- Two Vendors with equal Earning are returned in database order.
- Vendors whose account was deleted are dropped like the `0` group.

## Why

No recorded reason. The sibling dashboard queries apply the excluded-status setting, so its absence here looks unintended.

## Consequences & risks

- The leaderboard can reward Vendors with many cancelled or failed orders and miscount orders by including refunds.

## Recommendations

- Apply `ReportUtil::get_exclude_order_statuses()`, restrict to Vendor order types 1 and 2 for the order count, and add `vendor_id > 0` before the `LIMIT`.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
