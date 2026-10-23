# A coupon used on a multi-vendor order counts one use for the order and one for each Suborder

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

WooCommerce coupons can carry a total **usage limit** (`usage_limit`) and a **usage limit per user** (`usage_limit_per_user`). WooCommerce counts a use per *order*: each order that carries the coupon and reaches a counted status increments the coupon's `usage_count` and adds one `_used_by` entry for the Customer. Dokan turns a multi-vendor Order into a parent Order plus one Suborder per Vendor, and each Suborder carries its own coupon line (see [ADR-0086](./0086-a-coupon-discount-is-split-across-suborders-exactly-as-woocommerce-allocated-it-to-each-line-item.md)). Teammates ask: "If a Customer uses a 'once per customer' coupon on a basket from two stores, how many uses is that?" Dokan has no code of its own for coupon usage; the answer follows from how WooCommerce's counter meets Dokan's Suborders.

## Rule

**Every order that carries the coupon is counted separately by WooCommerce. A multi-vendor Order that uses a coupon therefore records one use for the parent Order plus one use for each Suborder that received the coupon. A single-vendor Order (no Suborders) records one use.**

The chain, as the code shows it:

1. **Checkout.** WooCommerce validates the coupon once, against the cart, using the counts that exist at that moment (`WC_Discounts::validate_coupon_usage_limit()` and `validate_coupon_user_usage_limit()`, `wc:includes/class-wc-discounts.php:628-701`).
2. **Suborders get coupon lines.** Each Suborder whose items were discounted by the coupon gets a `WC_Order_Item_Coupon` for that code (`Order\Manager::create_coupons()`, `lite:includes/Order/Manager.php:821-879`). Suborders do not copy the parent's order meta, so they do not inherit its `_recorded_coupon_usage_counts` flag.
3. **Counting happens on status changes.** WooCommerce's `wc_update_coupon_usage_counts()` runs on `woocommerce_order_status_pending`, `processing`, `on-hold`, `completed`, `cancelled`, `failed` and on trashing (`wc:includes/wc-order-functions.php:1080-1086`). For an order in a counted status that has not yet recorded usage, it sets `_recorded_coupon_usage_counts` on that order and calls `WC_Coupon::increase_usage_count()` for every coupon code on it (`wc:includes/wc-order-functions.php:1020-1078`), which raises `usage_count` and adds a `_used_by` row (`wc:includes/data-stores/class-wc-coupon-data-store-cpt.php:368-384`).
4. **Suborders change status through Dokan's cascade.** A new Suborder is created without a status and then given the parent's status (`lite:includes/Order/Manager.php:652`). An order without a status reads as `pending` (`wc:includes/abstracts/abstract-wc-order.php:658-672`, used by `set_status()` at `:904`), and WooCommerce records a status transition only when the old and new statuses differ (`wc:includes/class-wc-order.php:319-336`). At checkout the parent is still `pending`, so no status hook fires for the Suborder at creation. When the parent later moves (for example from `pending` to `processing` on payment), Dokan calls `update_status()` on each Suborder whose current status allows that transition (`Order\Hooks::on_order_status_change()`, `lite:includes/Order/Hooks.php:125-137`; the transition list is `Order\Hooks::is_status_change_allowed()`, `lite:includes/Order/Hooks.php:199-213`), which fires `woocommerce_order_status_processing` for each Suborder (`wc:includes/class-wc-order.php:457`). Each Suborder then records its own use.
5. **Reversal is symmetric.** When an order that recorded usage moves to `cancelled`, `failed` or trash, the same function decreases the count once for that order (`wc:includes/wc-order-functions.php:1042-1044`). A cancelled parent cascades to its Suborders, so each one gives its use back.

## Settings that change it

Per coupon (WooCommerce coupon settings):

| Field | Default | Effect under this rule |
|---|---|---|
| `usage_limit` (Usage limit per coupon) | empty = unlimited | A multi-vendor Order with N Suborders carrying the coupon consumes 1 + N uses. |
| `usage_limit_per_user` (Usage limit per user) | empty = unlimited | The Customer's `_used_by` entries grow by 1 + N for the same Order. |

Dokan Lite has no setting that changes how uses are counted.

## Worked example

Coupon `WELCOME`: `percent` 10 %, `usage_limit_per_user = 2`, `usage_limit = 100`, current `usage_count = 0`.

1. Customer C buys from Vendor A only. One order, no Suborders. After payment (`processing`): `usage_count = 1`; C has 1 use.
2. Customer C later buys from Vendors A and B with `WELCOME`. At checkout C has 1 use < 2, so the coupon is accepted. The Order is split into Suborders #A and #B, both with a `WELCOME` coupon line. On payment the parent moves to `processing` (+1) and Dokan moves #A and #B to `processing` (+1 each). Now `usage_count = 4` and C has 4 recorded uses.
3. C tries `WELCOME` a third time: refused ("usage limit reached"), even though C placed only two Orders.

If the Order in step 2 is then cancelled, the parent and both Suborders move to `cancelled` and each gives back one use: `usage_count = 1`.

## Edge cases

- **Vendor without eligible items.** A Suborder that did not receive the coupon line (none of its items were discounted) records nothing.
- **Coupons added after checkout.** `WC_Order::apply_coupon()` records usage for the order it runs on (`wc:includes/abstracts/abstract-wc-order.php:1735-1745`); mirroring onto Suborders (see [ADR-0085](./0085-a-coupon-added-to-or-removed-from-a-parent-order-is-mirrored-onto-its-suborders.md)) repeats this per Suborder.
- **Status changes on a single Suborder** (for example a Vendor cancelling their own Vendor order) increase or decrease only that Suborder's share of the count.
- **Validation happens before the extra uses exist.** The limit is checked against the cart at checkout, so a coupon with `usage_limit = 1` is still accepted for a multi-vendor Order and ends with `usage_count` greater than its limit.
- **Add-on Vendor coupons** that are restricted to one Vendor's products typically reach only that Vendor's Suborder, so they record two uses (parent plus one Suborder).

## Why

No recorded decision. WooCommerce counts per order; Dokan creates additional orders and did not exclude them from counting. No Dokan code reads or writes `usage_count`, `_used_by` or `_recorded_coupon_usage_counts`.

## Consequences & risks

- "Once per customer" and "first N customers" promotions are used up faster than intended whenever Customers buy from more than one Vendor.
- WooCommerce coupon reports and the coupon list's "Usage / Limit" column overstate real redemptions on multi-vendor marketplaces.
- Because the extra uses are released on cancellation, the inflation is reversible, but only through status changes.

## Recommendations

- Decide the intended rule explicitly (almost certainly "one use per Customer Order") and implement it, for example by marking each Suborder's coupon usage as already recorded when the Suborder is created, or by short-circuiting `wc_update_coupon_usage_counts()` for orders that have a parent.
- Until then, set usage limits with this multiplier in mind and tell Store Admins about it.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
