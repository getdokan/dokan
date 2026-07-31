# Authorization & Roles (RBAC reference)

How Dokan decides who may touch what. Read before writing any permission
callback, capability check, or ownership guard.

Vocabulary for these actors lives in [`CONTEXT.md`](../../../../CONTEXT.md);
decisions and their rationale in [`docs/adr/`](../../../../docs/adr/).

## The model in one table

| Capability | Store Admin † | Vendor | Vendor Staff ‡ | Customer | Anonymous |
|---|---|---|---|---|---|
| Read published product | All | All | All | All | All |
| Read unpublished product | All | Own | Vendor's | None | None |
| Create product | Any ※ | Own (forced) | Vendor's (forced) | None | None |
| Update / delete product | All | Own | Vendor's | None | None |
| List / read orders | All | Own | Vendor's | Own purchases | None |
| Update order | All | Own | Vendor's | None | None |
| Withdrawals | All | Own | Vendor's | None | None |
| Store profile settings | All | Own | Vendor's | None | None |
| Vendor directory — approved | All | All | All | All | All |
| Vendor directory — pending | All | None | None | None | None |
| Operating Terms | All | None | None | None | None |

† `manage_woocommerce` — the canonical admin capability for vendor
authorization (ADR-0005). `manage_options` still gates parts of the REST
surface but draws no boundary in the vendor model.
‡ Staff additionally need the matching `dokan_*` capability for that row. Scope
resolves to their Vendor; the capability decides whether the action is
permitted at all. Both must pass.
※ Admins must supply a valid `vendor_id`. Vendors and Staff may supply one only
to narrow scope, never to widen it.

**Operating Terms** — commission, selling activation, direct publishing,
featured — separate the marketplace from its Vendors. A Vendor may never set
the terms they operate under. Enforced at `Vendor\Manager::update():315`.

## Roles and capabilities

`seller` is the only role Dokan registers (`Installer::user_roles()`);
`administrator` and `shop_manager` are granted `dokandar` + every `dokan_*`
capability at install. `customer` is untouched. `vendor_staff` is a Pro
capability plus `_vendor_id` meta, not a Lite role.

Source of truth for the custom capability list is `dokan_get_all_caps()`
(filterable via `dokan_get_all_cap`) — read it rather than trusting any list
copied into docs. Groups: overview, report, order, coupon, review, withdraw,
product, and the dashboard menu gates.

Gate capabilities: `dokandar` = "is a vendor" (synthetic, not core),
`manage_woocommerce` = Store Admin, `manage_options` = Site Admin.

## Helper functions

| Function | Behaviour |
|---|---|
| `dokan_get_current_user_id()` | Current user, or the parent Vendor if they hold `vendor_staff` (via `_vendor_id`). **The primary staff→vendor resolution point** — use it, not `get_current_user_id()`, in any vendor-scoped path. |
| `dokan_is_user_seller( $id, $exclude_staff = false )` | `user_can($id,'dokandar')`; pass `true` to isolate true Vendor owners. |
| `dokan_is_product_author( $product_id )` | Product `post_author` vs current user, staff-resolved. |
| `dokan_get_seller_id_by_order( $order )` | Vendor owning an order. |
| `dokan_is_seller_enabled( $id )` | Selling Activation (`dokan_enable_selling`). |
| `dokan_is_seller_trusted( $id )` | Direct Publishing (`dokan_publishing`). |
| `VendorUtil::get_vendor_id_for_user( $id )` | Vendor owner → own ID; staff → parent; else `0`. |

## Vendor Staff (Pro)

Staff hold the `vendor_staff` capability and `_vendor_id` meta. Pro's
`Staffs::handle_staff_user_capabilities()` grants a fixed WP baseline
(`edit_posts`, `edit_published_posts`, `publish_posts`, `edit_shop_orders`,
`edit_product`, `upload_files`, `dokandar`) plus the per-staff subset from
`dokan_get_staff_capabilities()`.

The baseline **omits `edit_products` (plural) and `edit_others_products`**.
Since staff act on records authored by their parent, native capability checks
deny them — which is why staff authorization must go through the `dokan_*`
model, not native caps (ADR-0007).

`VendorAuthorizable::can_access_vendor_store()` is the most complete
owner/admin/staff pattern in the codebase — reuse it rather than hand-rolling.

## REST permission patterns

General shape: `manage_options` or `manage_woocommerce` bypass → `dokandar`
gate → `dokan_*` feature capability → ownership check.

- **`ProductController`** — list/create gate on `dokan_view_product_menu` /
  `dokan_add_product`. Single-item read requires `dokandar` +
  `dokan_is_product_author()`. Update/delete check the capability only at the
  callback; **ownership is enforced deeper in the handler**, so don't assume
  the permission callback is the whole guard.
- **`OrderController`** — update additionally requires the site setting
  `order_status_change`, an admin flag layered on top of capability.
  `get_single_order_permissions_check()` compares against
  `get_current_user_id()` with no staff resolution.
- **`StoreController`** — most reads public; `update_store_permissions_check()`
  resolves staff→parent then calls `can_access_vendor_store()`.

## `map_meta_cap`

One filter in Lite: `Order/Admin/Permissions::map_meta_caps()`, registered
`is_admin()`-only. For a shop order it reads `_dokan_vendor_id` and, on a
match, remaps the required capability down to `edit_shop_orders` — this is how
a Vendor edits their own order in wp-admin without `edit_others_shop_orders`.
Because it is `is_admin()`-gated it **never runs for REST or Abilities
requests**.

Products have no `map_meta_cap` filter; ownership is enforced at the REST and
query layers.

## Abilities / MCP scoping layer

`includes/Abilities/` — an additive layer active only inside an **Ability
Context**: any registered ability executing, from any caller.
`wp_before_execute_ability` fires inside `WP_Ability::execute()` regardless of
transport, so a non-MCP ability call **is** scoped. A URL match is only a
secondary fallback; the result is filterable.

- **`ProductAbilityScope`** — published products public; unpublished readable
  by owner or admin. List queries: own-store filter allows all statuses, any
  other filter forces `post_status = publish`. Create forces authorship to the
  resolved vendor.
- **`OrderAbilityScope`** — orders private to the owning vendor for *every*
  context. **Load-bearing for writes**: with its permission filter removed,
  `wc_rest_check_post_permissions( 'shop_order', 'edit', $foreign )` returns
  `true`. Never "simplify" it away.
- **`Definitions/*`** — Dokan-native abilities, self-scoped via
  `dokan_get_current_user_id()`; no caller-supplied vendor ID can override
  scope. Each declares the capability it requires via `required_capability()`
  and shares `AbstractVendorAbility::check_permission()`: Store Admins pass,
  everyone else must be a Vendor **and** hold that capability. The check runs
  both as the permission callback and inside `execute()`, because ability
  callbacks are public and reachable without the Abilities API running its own
  pre-flight. Filterable via `dokan_ability_required_capability`.

### Verified: `wc_rest_check_post_permissions()` is not a uniform boundary

| Check (Vendor → another Vendor's record) | Result |
|---|---|
| `( 'product', 'edit', $foreign )` | `false` — denied |
| `( 'shop_order', 'edit', $foreign )` | `true` — **permitted** |

Do not treat it as an authorization boundary. Enforce Ownership yourself
(ADR-0006).

### Two ability layers

WooCommerce registers products/orders twice: **Layer 1** REST-proxy
(`woocommerce/products-list|get|create|update|delete`) and **Layer 2** domain
(`woocommerce/product-create|update`, `products-query`). `/woocommerce/mcp`
exposes **Layer 1 only**; Layer 2 is reachable via the abilities REST API and
third-party MCP servers. When targeting abilities by name, cover both — the
scope classes' ability-name constants list each layer explicitly, and the
enrichment handles both result shapes (Layer 2 `products`/`orders`, Layer 1
`data` or a bare payload).

## Writing a vendor-owned record

Never decide a write from a native capability check. Route it through
`OwnershipGate::can_write( $object_type, $context, $object_id, $permission )`,
which denies when the record belongs to another Vendor and grants when it
belongs to the caller's Vendor Scope *and* they hold the Dokan capability for
the action (`dokan_edit_product`, `dokan_manage_order`, …). Store admins and
non-vendors pass through untouched; collection-level checks are left to the
list-query scoping. The requirement is filterable via
`dokan_ability_write_capability`.

The grant half matters as much as the deny half: Vendor Staff hold
`edit_product` but not `edit_others_products` while acting on records authored
by their parent, so native capabilities refuse writes that Dokan's own REST API
allows. The gate is what keeps the two surfaces in agreement.

## Known defects (open)

- `StoreController::get_restricted_fields_for_update()` gates on
  `manage_options` (vs `manage_woocommerce` elsewhere) and matches meta-key
  names against request-parameter names, so it strips nothing. The real
  protection is `Vendor\Manager::update()`'s capability gate.
- `Manager::update():325-335` resets `dokan_publishing` and
  `dokan_feature_seller` to `no` when those keys are simply absent, so a
  partial admin update silently clears them.
- `StoreController::get_restricted_fields_for_update()` gates on
  `manage_options` (vs `manage_woocommerce` elsewhere) and matches meta-key
  names against request-parameter names, so it strips nothing.
- `Manager::update():325-335` resets `dokan_publishing` and
  `dokan_feature_seller` to `no` when those keys are simply absent, so a
  partial admin update silently clears them.
