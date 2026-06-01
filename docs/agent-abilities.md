# Dokan Agent Abilities — WooCommerce Canonical Abilities API (F-16a + F-18)

**Strategy ref:** [Dokan Agentic Commerce Strategy](https://hackmd.io/@anikfahmid/dokan-agentic-strategy) — F-16, F-18  
**Horizon:** H1 — Agent Accessible  
**Ships in:** Dokan Lite (free)  
**Ship target:** June 23, 2026 (WooCommerce 10.9 release day)

---

## What It Does

Registers Dokan marketplace operations as **WooCommerce Canonical Abilities** — a transport-neutral capability layer that exposes the same operation across REST, MCP (Model Context Protocol), WP-CLI, and future AI surfaces with one registration.

Every AI client that supports WooCommerce Canonical Abilities — Claude Desktop, ChatGPT + MCP, Cursor, GitHub Copilot, WP AI Agent — gains the ability to query and manage your Dokan marketplace without any custom integration.

---

## Abilities Registered in Lite (8 free + 9 vendor self-service)

### Admin / Marketplace Operator Abilities (F-16a)

| Ability | What It Does | Access Level |
|---------|-------------|--------------|
| `dokan/vendors-query` | Search vendors by rating, sales, category, location | Admin read |
| `dokan/vendor-get` | Full vendor profile + storefront URL + policies | Public read |
| `dokan/vendor-products-query` | Products filtered by vendor | Public read |
| `dokan/vendor-orders-query` | Orders filtered by vendor ID | Admin read |
| `dokan/vendor-approve` | Approve a pending vendor application | Admin write |
| `dokan/vendor-suspend` | Suspend an active vendor | Admin write |
| `dokan/vendor-commission-set` | Update commission rate per vendor or category | Admin write |
| `dokan/marketplace-stats-summary` | Aggregate marketplace stats (vendor count, GMV, avg rating) | Admin read |

### Vendor Self-Service Abilities (F-18)

| Ability | What It Does | Access Level |
|---------|-------------|--------------|
| `dokan-vendor/product-create` | Vendor creates their own product | Vendor |
| `dokan-vendor/product-update` | Vendor updates their own product fields | Vendor (owner check) |
| `dokan-vendor/inventory-update` | Bulk stock + status update across own products | Vendor (per-row check) |
| `dokan-vendor/withdrawal-request` | Request payout; validates balance + minimum threshold | Vendor (no staff delegation) |
| `dokan-vendor/store-update` | Update storefront fields (name, bio, social, banner) | Vendor (no staff delegation) |
| `dokan-vendor/orders-query` | Vendor's own orders | Vendor |
| `dokan-vendor/sales-summary` | Vendor's sales + earnings summary | Vendor |
| `dokan-vendor/withdrawal-history` | Past payout history | Vendor |
| `dokan-vendor/customer-message` | Send message to a customer on a vendor order | Vendor |

---

## How Agents Use These

### Claude Desktop (via MCP)

Add Dokan to Claude Desktop's MCP config using WooCommerce MCP (`mcp-remote`). Claude discovers all Dokan + WooCommerce abilities automatically.

Example prompts:
- *"Show me vendors with a rating above 4.5 who sell camping gear"*
- *"Approve the pending vendor application from GreenLeather Co"*
- *"Set a 12% commission for the Electronics category"*
- *"What are this month's marketplace stats?"*

### Vendor using Claude Desktop

Vendors generate a WordPress Application Password (Users → Profile → Application Passwords) and add it to their own MCP config. They can then manage their store entirely through Claude:

- *"Create a product called 'Trail Shoes' at $89 with 50 units"*
- *"Update stock for product 123 to 25 units"*
- *"I want to request a $200 withdrawal to PayPal"*
- *"Change my shop name to 'GreenLeather Co'"*

### WP-CLI

```bash
wp abilities run dokan/vendors-query --filter='{"rating":{"gte":4.5}}'
wp abilities run dokan/vendor-approve --vendor_id=42
wp abilities run dokan/marketplace-stats-summary
```

### REST API

```
GET /wp-json/wp-abilities/v1/abilities/dokan%2Fvendors-query/run?filter[rating][gte]=4.5
POST /wp-json/wp-abilities/v1/abilities/dokan%2Fvendor-approve/run
```

---

## Permission Model

### Admin abilities
- Read abilities: require `dokan_view_vendor_list` capability
- Write abilities: require `manage_woocommerce` capability
- Admins bypass all checks

### Vendor abilities
- `vendor_only` — parent vendor OR vendor staff (via `dokan_get_current_user_id()`)
- `vendor_only_no_staff` — parent vendor only; raw `get_current_user_id()` (withdrawal and store updates)
- Per-resource ownership check inside every execute callback

**Auth for vendors:** WordPress Application Password under Users → Profile → Application Passwords. Paste into Claude Desktop or any MCP client. Every ability call enforces vendor-scope server-side.

---

## What This Replaces

| Previously planned | Absorbed by |
|-------------------|------------|
| F-02 Dokan MCP Server (P2 now) | Abilities auto-expose via WC MCP — no separate server needed |
| F-07 Admin AI Agent (P2 now) | Same abilities power WC AI Agent automatically |
| F-14 Multi-Vendor Comparison API (P2 now) | Shipped as `dokan/spmv-vendors-for-product` in Pro (F-16b) |

---

## Implementation Files

| File | Role |
|------|------|
| `includes/AgentAbilities/Manager.php` | Registers all abilities via `wp_register_ability()` on `wp_abilities_api_init`; hooks `woocommerce_mcp_include_ability` |
| `includes/AgentAbilities/Permissions.php` | Shared permission callbacks (`admin_read`, `admin_write`, `vendor_only`, `vendor_only_no_staff`) |
| `includes/AgentAbilities/Schemas.php` | Input/output JSON schemas shared across abilities |
| `includes/AgentAbilities/Abilities/VendorsQuery.php` | `dokan/vendors-query` |
| `includes/AgentAbilities/Abilities/VendorGet.php` | `dokan/vendor-get` |
| `includes/AgentAbilities/Abilities/VendorProductsQuery.php` | `dokan/vendor-products-query` |
| `includes/AgentAbilities/Abilities/VendorOrdersQuery.php` | `dokan/vendor-orders-query` |
| `includes/AgentAbilities/Abilities/VendorApprove.php` | `dokan/vendor-approve` |
| `includes/AgentAbilities/Abilities/VendorSuspend.php` | `dokan/vendor-suspend` |
| `includes/AgentAbilities/Abilities/VendorCommissionSet.php` | `dokan/vendor-commission-set` |
| `includes/AgentAbilities/Abilities/MarketplaceStatsSummary.php` | `dokan/marketplace-stats-summary` |
| *(F-18 ability classes in same dir)* | 9 `dokan-vendor/*` vendor self-service abilities |

---

## Related Features

- **F-16b Agent Abilities Pro** (dokan-pro) — 5 additional paid abilities: SPMV comparison, semantic search, bookings, auctions, subscriptions
- **F-05 Semantic Search** — `dokan/products-semantic-search` (Pro) bridges F-05 for agent clients
- **F-04 Agent Discovery** — registers ability endpoint in `/ai-agent-policy` so crawlers know agents can query this marketplace
