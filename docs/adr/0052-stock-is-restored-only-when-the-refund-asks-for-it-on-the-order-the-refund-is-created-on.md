# Stock is restored only when the refund asks for it, on the order the refund is created on

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Refunding a product does not always mean the product came back: a customer may keep a damaged item, or receive a partial price adjustment. Teammates ask "does a refund put the product back in stock?", "who decides?" and, for multi-vendor orders, "does refunding the parent Order or the Suborder restock?". Dokan Lite adds no restock logic to refunds; it relies on WooCommerce and only changes which orders reduce stock in the first place.

## Rule

1. **Restocking is a per-refund choice made by whoever creates the refund.** WooCommerce restocks only when `wc_create_refund()` receives `restock_items = true` (`wc:includes/wc-order-functions.php:688-690`). On the WooCommerce order screen this is the "Restock refunded items" checkbox, shown when `woocommerce_manage_stock` is `yes` and pre-checked by default through the `woocommerce_restock_refunded_items` filter (`wc:includes/admin/meta-boxes/views/html-order-items.php:352-355`); the admin AJAX passes it as `restock_items` (`wc:includes/class-wc-ajax.php:2865`, `:2911`). Dokan Lite does not override it.
2. **Quantities, not amounts, are restocked, and only what was reduced.** `wc_restock_refunded_items()` (`wc:includes/wc-order-functions.php:817`) increases a product's stock by the refunded **quantity** of each line, only when the line has `_reduced_stock` meta, the quantity is non-zero and the product manages stock (`:828-834`). It then lowers the line's `_reduced_stock` by the same quantity (`:841-844`). A price-only refund (quantity 0) never restocks.
3. **Stock is reduced on the Vendor order, not the parent Order.** `Order\Hooks::prevent_stock_reduction_for_parent_order()` (`lite:includes/Order/Hooks.php:505`, registered at `:59` on `woocommerce_can_reduce_order_stock`, `wc:includes/wc-stock-functions.php:178`) stops a parent Order with Suborders from reducing stock, so only Suborders (and single-vendor Orders) reduce it. This follows Lite ADR 0004.
4. **The parent Order's lines still carry a copy of `_reduced_stock`.** When a Suborder line reduces stock, `Order\Hooks::sync_parent_order_item_stock()` (`lite:includes/Order/Hooks.php:525`, on `woocommerce_reduce_order_item_stock`, `wc:includes/wc-stock-functions.php:233`) copies its `_reduced_stock` to the matching parent line named by `_dokan_parent_order_item_id`. The method's docblock says the copy keeps the two lines "in sync" (`lite:includes/Order/Hooks.php:515-518`); because rule 2 looks only at `_reduced_stock`, a refund with restocking on the **parent** Order restocks too.

So in Lite, stock comes back exactly once per refund that asks for it, on the order the refund is created on, whether that is a Suborder, a single-vendor Order or a parent Order.

## Settings that change it

| Setting | Default | Behaviour |
|---|---|---|
| WooCommerce `woocommerce_manage_stock` | `yes` | `no`: WooCommerce neither reduces nor restocks stock, and the restock checkbox is hidden. |
| Product "Manage stock?" | per product | Products that do not manage stock are never restocked. |
| "Restock refunded items" checkbox, per refund | checked (filter `woocommerce_restock_refunded_items`, default true) | Checked: refunded quantities return to stock. Unchecked: stock is unchanged. |

Filters: `woocommerce_restock_refunded_items` (checkbox default), `woocommerce_can_restock_refunded_items` (veto), `woocommerce_can_reduce_order_stock` (Dokan uses it to stop parent Orders reducing stock).

## Worked example

Product P manages stock; stock 10. A customer buys 2 × P from Vendor A and something from Vendor B. Suborder #101 (Vendor A) reduces P to 8; its line has `_reduced_stock = 2`, and the parent line on Order #100 gets the copied `_reduced_stock = 2`.

| Refund | Restock checkbox | Stock of P after |
|---|---|---|
| 1 × P on Suborder #101 | checked | 9 (Suborder line `_reduced_stock` → 1) |
| 1 × P on Suborder #101 | unchecked | 8 |
| 1 × P on parent Order #100 (Vendor accounting ignores it, Lite ADR 0004) | checked | 9 (parent line `_reduced_stock` → 1) |
| Both of the above for the same unit (Suborder for accounting, parent for the gateway), both checked | checked twice | 10 — the unit is restocked twice |

## Edge cases

- A refund with quantity but zero amount restocks without moving any money.
- A refund on a Suborder does not change the parent line's `_reduced_stock` copy, and the reverse; the two counters drift apart after the first refund.

## Why

No Dokan-specific decision is recorded for restocking. Dokan Lite deliberately reduces stock only on Vendor orders (Lite ADR 0004); restocking is left to WooCommerce's per-refund choice so that "goods returned" and "money returned" stay independent decisions.

## Consequences & risks

- Because Lite admins often refund a Suborder for Vendor accounting and the parent Order for the customer's money (see [ADR-0048](./0048-in-dokan-lite-the-store-admin-issues-refunds-through-woocommerce-and-they-take-effect-immediately.md)), leaving the checkbox checked on both restocks twice.
- Restocking is independent of who bears the money: the Vendor's stock comes back whenever the admin ticks the box, even on a goodwill refund where the customer kept the goods.

## Recommendations

- Document for Lite admins that only one of the two refunds (normally the Suborder refund) should have "Restock refunded items" checked.
- Consider making the parent line's `_reduced_stock` copy invisible to `wc_restock_refunded_items()` (for example under a different meta key used only for display), so a parent Order refund can never restock.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
