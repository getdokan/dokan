# Marketplace-owned order types give the whole line amount to the admin and nothing to the Vendor

Status: Accepted (retroactive — documents existing code)

## Context

Some orders are not a customer buying from a Vendor but a Vendor (or anyone) buying a service from the marketplace itself, for example paying for a product advertisement or a Vendor subscription. Splitting such an order into Commission and Earning makes no sense: the marketplace is the seller. Teammates ask why these orders show an "admin earning" but no Commission or Vendor Earning. In this ADR "admin earning" (`admin_net_earning`) names the marketplace's own revenue from selling to the buyer; it is distinct from Commission, which is always the admin's share of a Vendor order (see `CONTEXT.md`).

## Rule

- **Order types are classified first.** `Analytics\Reports\OrderType::get_type()` first calls `get_special_order_type()` (`lite:includes/Analytics/Reports/OrderType.php::get_type()`), which asks extensions through the filter `dokan_get_order_type` whether an order (or, for a refund, its parent order) is a special type (`::get_special_order_type()`). Lite defines the constants `DOKAN_ADVERTISEMENT_PRODUCT_ORDER`, `DOKAN_ADVERTISEMENT_REFUND_ORDER`, `DOKAN_SUBSCRIPTION_ORDER` and `DOKAN_SUBSCRIPTION_REFUND_ORDER` (`::DOKAN_ADVERTISEMENT_PRODUCT_ORDER` through `::DOKAN_SUBSCRIPTION_REFUND_ORDER`) for extensions to return.
- **Those types earn the admin everything.** `get_admin_earning_order_types()` lists the four types above, filterable through `dokan_admin_earning_order_types` (`lite:includes/Analytics/Reports/OrderType.php::get_admin_earning_order_types()`). For an order of one of these types, `OrderCommission::calculate()` still runs the line calculator, but adds `Commission + Earning` of every line to `admin_net_earning` and both discounts to `admin_discount`; `admin_net_commission`, `vendor_net_earning` and `vendor_discount` stay 0 (the `is_admin_order_type()` branch in `lite:includes/Commission/OrderCommission.php::calculate()`).
- **"Nothing to the Vendor" covers the line amounts only.** `is_admin_order_type()` is consulted only in `OrderCommission::calculate()` and `calculate_for_refund()` (`lite:includes/Commission/OrderCommission.php::calculate()`, `::calculate_for_refund()`). The fee routing is unchanged: shipping, product tax, shipping tax, gateway fee and order fee lines are still split by their recipient settings (`lite:includes/Commission/OrderCommission.php::get_total_vendor_fees()`), and `get_vendor_earning()` is `vendor_net_earning + vendor fees` (`::get_vendor_earning()`), so the Vendor order's Earning can be non-zero when a fee goes to the Vendor.
- Refunds of these orders follow the same routing (`lite:includes/Commission/OrderCommission.php::calculate_for_refund()`); refund detail is in the [refund ADRs](decisions-index.md#refunds).

## Settings that change it

None in Lite. The behaviour is triggered only when an extension classifies an order as one of the types above, or adds a type to `dokan_admin_earning_order_types`.

## Worked example

An extension classifies an order as `DOKAN_ADVERTISEMENT_PRODUCT_ORDER`. The order has one line of 15.00 and the global commission is 10 % + 0.

- The line calculator gives Commission 1.50 and Earning 13.50.
- Because the type is marketplace-owned: `admin_net_earning` = 1.50 + 13.50 = 15.00; `admin_net_commission` = 0; `vendor_net_earning` = 0.

## Edge cases

- The line calculator still runs, so the formula is still frozen onto the line items (Lite ADR 0013), even though the split is then discarded.
- Without an extension answering `dokan_get_order_type`, no order is ever of these types.
- `Commission::get_earning_by_order( $order, 'admin' )` does not return `admin_net_earning` for these orders. Without a `dokan_orders` row it returns `get_admin_total_earning()`, which is the clamped `max( admin_net_commission, 0 )` (here 0) plus admin fees (`lite:includes/Commission.php::get_earning_by_order()`, `lite:includes/Commission/OrderCommission.php::get_admin_total_earning()`); the marketplace-owned line revenue is not in that figure.

## Why

The docblock describes these as order types "relevant to admin users" (the docblock of `lite:includes/Analytics/Reports/OrderType.php::is_admin_order_type()`). No further recorded reason.

## Consequences & risks

- Analytics must read `admin_net_earning` for these orders; summing `admin_net_commission` across all orders leaves out marketplace-owned revenue.

## Recommendations

- Skip the per-line formula resolution and snapshot for marketplace-owned orders, since the result is discarded.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
