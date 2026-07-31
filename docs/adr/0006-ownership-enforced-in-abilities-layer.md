# Ownership is enforced by the Abilities layer, not delegated to WooCommerce

`wc_rest_check_post_permissions()` is not a uniform authorization boundary.
Measured against a live install, for a Vendor acting on another Vendor's
records over MCP:

| Check | Result |
|---|---|
| `wc_rest_check_post_permissions( 'product', 'edit', $foreign_product )` | `false` |
| `wc_rest_check_post_permissions( 'shop_order', 'edit', $foreign_order )` | `true` |
| ...the same order check with `OrderAbilityScope` removed | `true` |

Products are denied because `seller` lacks `edit_others_products`; the
equivalent order check passes anyway, because the `shop_order` capability
mapping resolves differently. `current_user_can( 'edit_post', $foreign_order )`
does return `false` — WooCommerce's REST helper simply does not reach the same
answer.

So we enforce Ownership ourselves, for both products and orders, through one
shared gate, and keep native capabilities as an independent second layer rather
than as the primary control.

## Consequences

The product-side check is redundant *today* and will look like dead code. It is
not: it is the only thing that would still hold if WooCommerce's product
capability mapping ever changed the way the order mapping already differs.
Do not remove it on the grounds that native capabilities already deny.

`OrderAbilityScope` previously carried a comment stating that writes "are left
to WooCommerce's native capabilities." That was never true of the code, and
acting on it would have opened cross-vendor order writes. The comment goes.

**Amended by [ADR-0007](./0007-staff-actions-gated-by-dokan-capabilities.md).**
Native capabilities are a second layer for Vendors only. For Vendor Staff the
Abilities layer deliberately overrides a native denial, because native
capabilities give the wrong answer for that actor.
