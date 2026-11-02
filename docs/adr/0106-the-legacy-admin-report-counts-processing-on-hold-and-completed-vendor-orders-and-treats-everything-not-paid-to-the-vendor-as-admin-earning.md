# The legacy admin report counts processing, on-hold and completed Vendor orders and treats everything not paid to the Vendor as admin earning

Status: Accepted (retroactive — documents existing code)

## Context

Before the React admin dashboard, Dokan's admin overview showed "This month" sales, orders and earning against last month, with an overview chart. That data is still served by `GET dokan/v1/admin/report/summary` and `GET dokan/v1/admin/report/overview` (`AdminReportController`, `lite:includes/REST/AdminReportController.php:25`, `:33-50`), built on Dokan's own `dokan_orders` table rather than WooCommerce Analytics. Teammates ask "what is 'earning' in that report?" and "why does it disagree with Analytics?".

## Rule

`dokan_admin_report_data()` (`lite:includes/Admin/functions.php:45-115`) selects from `dokan_orders` joined to the order table and returns, per day or per month:

- `order_total` = `SUM(dokan_orders.order_total)` — the Vendor order's total after refunds, including tax and shipping (every save of a Vendor order rewrites `order_total` = order total − total refunded and `net_amount` = the refund-adjusted Earning, `VendorBalanceUpdateHandler::update_dokan_order_table()`, `lite:includes/Order/VendorBalanceUpdateHandler.php:146-210`);
- `earning` = `SUM(dokan_orders.order_total − dokan_orders.net_amount)` (`:98`) — everything on the Vendor order that is not the Vendor's Earning: Commission, admin-routed shipping and tax, and gateway fees;
- `total_orders` = `COUNT(DISTINCT order id)`,

for rows where:

- `seller_id` is the requested Vendor, or `!= 0` for all Vendors (`:95`, `:106`) — `dokan_orders` holds Vendor orders only, so parent Orders are never counted;
- the order is not trashed (`:107`);
- `dokan_orders.order_status IN ('wc-on-hold', 'wc-completed', 'wc-processing')` (`:108`);
- the order creation date (`post_date`, or HPOS `date_created_gmt` compared with UTC-converted dates) is within the range (`:70-91`). The default range is the first of the current month to today.

`dokan_get_sales_count()` (`lite:includes/functions.php:1822-1922`) sums those rows for the current month, the previous calendar month and an optional custom range, and computes the change between them. The SQL can be extended through `dokan_report_left_join` and `dokan_report_where`, and the rows through `dokan_get_admin_report_data`.

## Settings that change it

None. The status list is fixed; the WooCommerce Analytics settings do not apply.

## Worked example

Settings: global Commission `fixed` 10 % + 0 flat; `shipping_fee_recipient = admin`; product tax recipient `seller`; no gateway fee.

This month Vendor A has a completed Vendor order: item 100.00 + shipping 10.00 = 110.00. `dokan_orders`: `order_total` 110.00, `net_amount` (Earning) 90.00.

- Sales = 110.00. Earning (admin) = 110.00 − 90.00 = **20.00** (Commission 10.00 + shipping 10.00). Orders = 1.

A 22.00 refund (20.00 of the item, 2.00 of the shipping) is processed later; `order_total` becomes 88.00 and `net_amount` 72.00, so this month's Sales becomes 88.00 and Earning 16.00 in this report too — in the order's month.

## Edge cases

- Refunded Vendor orders are excluded altogether, even partially refunded ones that were later set to "Refunded".
- Pending, cancelled and failed Vendor orders are excluded.
- On an HPOS store dates are compared in UTC, on a posts store in site time, so day boundaries differ.

## Why

No recorded reason; the query predates WooCommerce Analytics support.

## Consequences & risks

- The report's "earning" is the admin's total take including pass-through fees, not Commission as defined in CONTEXT.md.
- Its figures differ from the WooCommerce Analytics based admin reports (statuses, date basis, refund timing).

## Recommendations

- Rename the field to "admin total" or retire the endpoint in favour of the Analytics-based reports.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
