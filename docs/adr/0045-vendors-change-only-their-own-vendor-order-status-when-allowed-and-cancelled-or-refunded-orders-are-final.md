# Vendors change only their own Vendor order's status, when allowed, and cancelled or refunded orders are final

Status: Accepted (retroactive — documents existing code)

## Context

A Vendor's own status changes drive their money: completing an order usually makes its Earning count, cancelling it removes it ([ADR-0063](./0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md)). Teammates ask "can a Vendor change an order's status?", "can a Vendor change the customer's Order?" and "can a Vendor reopen a cancelled order?". Ownership in general is recorded in Lite ADR 0006 (`docs/adr/0006-ownership-enforced-in-abilities-layer.md`) and Vendor Staff permissions in Lite ADR 0007 (`docs/adr/0007-staff-actions-gated-by-dokan-capabilities.md`); this ADR records the order-status rule.

## Rule

**[Lite]** A Vendor (or Vendor Staff with `dokan_manage_order`) may change the status of a Vendor order that belongs to them, and only while the Store Admin allows Vendors to change order status. A Vendor can never change a multi-vendor parent Order. `cancelled` and `refunded` are final for Vendors: they cannot be changed from, and the bulk action cannot set them.

**Ownership.** Every Vendor entry point resolves the order's Vendor from the `dokan_orders` table and compares it with the acting Vendor (`dokan_get_current_user_id()`, which maps Vendor Staff to their Vendor):

| Entry point | Ownership check | Setting check |
|---|---|---|
| Dashboard single-order form, AJAX `dokan_change_status` (`lite:includes/Ajax.php:363-404`) | `dokan_is_seller_has_order()` (`:375`) | `order_status_change` must be `on` (`:366`); nonce and `dokan_manage_order` |
| REST `PUT /dokan/v1/orders/{id}` (`lite:includes/REST/OrderController.php:100-113`) | `validation_before_update_item()` (`:228-248`) | `update_order_permissions_check()` (`:821-833`) |
| Dashboard bulk form (`lite:includes/Order/Frontend/Hooks.php:33-50`) and REST `POST /dokan/v2/orders/bulk-actions` (`lite:includes/REST/OrderControllerV2.php:440-449`) | `OrderUtil::current_user_can_manage_order()` inside `dokan_apply_bulk_order_status_change()` (`lite:includes/Order/functions.php:961-962`; `lite:includes/Utilities/OrderUtil.php:253-259`) | `order_status_change` must not be `off` |

A multi-vendor parent has no `dokan_orders` row and `dokan_get_seller_id_by_order()` returns 0 for it (`lite:includes/Order/functions.php:331-334`), so no Vendor owns it.

**Final statuses.**

- The single-order screen shows the Edit control only when the order is neither `cancelled` nor `refunded` (`lite:templates/orders/details.php:219`, `:223`). It offers every WooCommerce status, including `cancelled` and `refunded`, as a target.
- The dashboard bulk selector offers only on-hold, processing and completed (`lite:includes/Dashboard/Templates/Orders.php:138-146`, filter `dokan_bulk_order_statuses`). The shared bulk helper refuses `cancelled` and `refunded` both as the new status (`lite:includes/Order/functions.php:965-969`) and as the current status of an order (`:978-980`), so bulk is not a way to cancel or refund.
- The rule is: a Vendor can move an open order to any status (including cancelling or refunding it one order at a time from the single-order screen), but cannot move an order out of `cancelled` or `refunded`.

**No upward effect.** A Vendor's change applies to their Vendor order only. On a Suborder it is never copied to the parent Order, except that completing the last open Suborder completes the parent ([ADR-0037](./0037-a-parent-order-is-completed-automatically-only-when-every-suborder-is-completed.md)).

## Settings that change it

| Setting | Values | Behaviour |
|---|---|---|
| `dokan_selling[order_status_change]` (admin label "Order Status Change"; new key `vendor_can_change_order_status`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:1511-1525`) | `on` (default, `lite:includes/Admin/Settings.php:678-683`) | Vendors with `dokan_manage_order` can change status through all entry points above. |
| | `off` | The AJAX handler, the REST update and bulk routes, and the dashboard bulk form refuse; the dashboard hides the Edit control; in WP-admin, users without `manage_woocommerce` lose the status field and list actions (`lite:includes/Order/Admin/Permissions.php:161-230`). Only the Store Admin changes statuses. |
| Capability `dokan_manage_order` | per role / per Vendor Staff | Required by the AJAX handler, the REST permission check and the bulk form. |

## Worked example

Settings: `order_status_change` = `on`; `withdraw_order_status` = `wc-completed`.

Vendor A owns Suborder #301 (Earning 54.00, `processing`) of Order #300; Vendor B owns #302.

1. Vendor A completes #301 from the dashboard: allowed. A's earnings rise to 54.00. #300 is unchanged until #302 completes.
2. Vendor A tries to change #302: refused, #302 belongs to Vendor B.
3. Vendor A tries to change #300: refused, the parent belongs to no Vendor.
4. Vendor A cancels #301 from the single-order screen: allowed; A's earnings drop to 0.00. The Edit control then disappears for #301.
5. Vendor A selects #301 in a bulk "Completed" action: skipped, because #301 is `cancelled`.

With `order_status_change` = `off`, steps 1 and 4 are refused too; only the Store Admin can complete or cancel #301.

## Edge cases

- **Setting Refunded from the dashboard** produces a WooCommerce status-only refund that does not change the Vendor's Balance ([ADR-0049](./0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md)).
- **Statuses offered** are all registered WooCommerce statuses (`wc_get_order_statuses()`, `lite:templates/orders/details.php:9`; REST validates against the same list, `lite:includes/REST/OrderController.php:378`, `:396-402`), including custom ones.
- **The Store Admin is not bound by the final-status rule.** WP-admin and `manage_woocommerce` users can reopen cancelled or refunded orders.

## Why

The setting's tooltip states the intent: "Checking this will enable sellers to change the order status. If unchecked, only admin can change the order status." (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1521`). Treating `cancelled` and `refunded` as final for Vendors protects money decisions (a cancelled Earning, a refunded customer) from being reversed by the party who benefits.

## Consequences & risks

- With the default `on`, Vendors control when their Earnings reach the `completed` earning status. Marketplaces that want the Store Admin to confirm delivery before Earnings count must turn the setting off or select a different earning status.
- Bulk actions and the single-order screen behave differently (bulk cannot cancel or refund), which confuses Vendors.

## Recommendations

- Offer Vendors only the statuses that make sense for a Vendor order (for example hide `pending` and `failed`).

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
