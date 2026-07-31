# Vendor Staff actions over MCP are gated by `dokan_*` capabilities

Vendor Staff could edit their Vendor's products through Dokan's own REST API but
not through the WooCommerce Abilities/MCP path. Measured against a live install,
staff user 16 (parent Vendor 2) editing product 626:

| Path | Result |
|---|---|
| `PUT /dokan/v1/products/626` | `200` — price changed |
| `PUT /wc/v3/products/626` | `403` — unchanged |

Dokan's REST authorizes on the `dokan_*` capability model plus
`dokan_is_product_author()`, which resolves staff to their parent Vendor. The
Abilities path authorizes on native WordPress capabilities, and staff hold
`edit_product` but not `edit_others_products` while the record is authored by
the parent. So MCP granted *less* than the dashboard for the same user and
record.

We fix this in the Abilities layer rather than in native capabilities: the
shared ownership gate grants an operation when the record resolves to the acting
Vendor Scope **and** the actor holds the relevant `dokan_*` capability,
returning `true` even where a native capability check would deny.

The gate applies to **every actor below Store Admin, on reads as well as
writes**, with each ability declaring the capability it requires in its
registration arguments. The read half is not hypothetical: staff 16 does not
hold `dokan_manage_withdraw`, yet `dokan/withdraws-query` returned the parent
Vendor's withdrawal records and `dokan/vendor-stats-get` exposed revenue, because
the `Definitions/*` abilities check only `dokan_is_user_seller()` — which
resolves staff to their parent and passes. Applying the gate uniformly rather
than only to staff is behaviourally free for a default Vendor, who holds all 67
`dokan_*` capabilities, and bites only where a site has deliberately narrowed
them.

## Considered options

Remapping the product meta-capability via `map_meta_cap` — mirroring
`Order/Admin/Permissions::map_meta_caps()`, which already does this for orders
but is registered `is_admin()`-only — was rejected. It would have made
`current_user_can()` correct everywhere and kept ADR-0006's layering intact, but
it changes capability answers globally, well beyond the MCP surface being
designed here. Making staff read-only over MCP was also rejected, as it breaks
parity with the dashboard.

## Consequences

The `dokan_*` capabilities become the action model on the MCP write path, while
Ownership remains the record-level control — both must pass. Native capabilities
stop acting as a backstop for Vendor Staff specifically (see the amendment to
ADR-0006), so a defect in the ownership gate is not caught by a second layer for
that actor. The gate is correspondingly the highest-risk code in the Abilities
layer and should carry the densest tests.
