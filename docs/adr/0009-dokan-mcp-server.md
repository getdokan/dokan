# Dokan runs its own MCP server on the shared adapter; WordPress and WooCommerce authenticate, Dokan authorizes

Dokan's abilities were reachable over MCP only through servers Dokan does not
control: the adapter's generic default server (every registered ability, for
any logged-in user with `read`) and WooCommerce's `/woocommerce/mcp` (REST-derived
tools, authenticated with WooCommerce API keys that only a Store Admin can mint).
Neither lists Dokan's own abilities, neither offers a vendor a way in, and the
WooCommerce endpoint is deprecated upstream.

We ship a Dokan server at `/wp-json/dokan/mcp` on the same `wordpress/mcp-adapter`
WooCommerce bundles, with a curated tool list (`Catalog`, filterable through
`dokan_mcp_server_abilities`) and our own transport.

Dokan issues no credential and runs no login flow. An AI client signs in the way
any REST client signs in to this site, with HTTP Basic authentication: a
WordPress Application Password, or a WooCommerce REST API consumer key and
secret. WordPress resolves the first on every REST request. WooCommerce resolves
the second only on routes it considers its own, so the MCP route is declared one
of them (`woocommerce_rest_is_request_to_rest_api`) and a consumer key works here
exactly as on `/wc/v3`, including the key's Read/Write permission check and
last-access bookkeeping. A cookie session counts only with a REST nonce, as
everywhere else in the REST API.

The transport (`Transport`) decides authorization only, in this order: the
server switch, TLS, that somebody signed in at all, and
`Access::user_can_connect()` — a Store Admin always, a Vendor or Vendor Staff
only while the "Allow vendors to connect" switch is on and their store's selling
is enabled. The switch is **off by default**: vendor connections are an explicit
opt-in by the marketplace, as the product request for the first release asked.
Because the check runs on every request, a vendor whose store is disabled, or
whose role changes, is cut off at once; there is nothing of Dokan's to revoke.
Revoking the credential itself is WordPress' job (the profile screen) or
WooCommerce's (the REST API keys screen).

The transport becomes nobody. It reads the user WordPress already set, records
it (`Session`) and flags the Ability Context, so the vendor scoping of ADR-0006 /
ADR-0007 applies to every tool call. No scoping lives in the server.

Vendors cannot open wp-admin, so they create their application password on
WordPress' own approval screen (`wp-admin/authorize-application.php`), which the
admin-area block lets through for a user who may connect while MCP is on.
Vendor Staff hold none of the capabilities WooCommerce admits to wp-admin
(`edit_posts`, `manage_woocommerce`, `view_admin_dashboard`), so a staff
member's password is created by the store admin on that user's profile screen.

The settings screens describe the connection with their ordinary field types
(plugin-ui `info`, `copy_field`, `html` and `notice` variants; legacy `html`
fields), filled in when the screen is built. No custom React or Vue component,
no settings-screen REST route, no action links: there is nothing to create or
revoke from the screen.

## Consequences

Switching Dokan MCP on boots the adapter when WooCommerce's own `mcp_integration`
feature has not. The adapter's generic default server is kept off in that case
(`mcp_adapter_create_default_server`), so enabling Dokan never opens an unscoped
surface as a side effect; a site with WooCommerce's feature on keeps whatever
that feature creates.

The transport overrides `HttpTransport::check_permission()` rather than passing
the adapter's `transport_permission_callback`: the adapter treats a `WP_Error`
from that callback as "fall back to the `read` capability", which would let any
signed-in user through.

Tool calls bypass the adapter's `mcp_adapter_execute_ability_capability` filter
that `RequestContext` listens to, so the transport calls
`RequestContext::flag_mcp_request()` itself after authorizing. Without it the
permission pre-flight of a WooCommerce order ability would run unscoped.

Only assistants that can send a username and password connect: Claude Code and
Cursor through a header, Claude Desktop through a local proxy. Hosted connectors
that sign in through OAuth alone (claude.ai, ChatGPT) cannot, until WordPress or
WooCommerce offer an OAuth server to rely on. The first draft of this server
shipped its own OAuth 2.1 server, consent page and personal tokens; review
decided Dokan does not own an authentication layer, and they were removed.

A WooCommerce key with Read-only permission cannot use the server at all: every
MCP request is a POST, which WooCommerce's permission check treats as a write.

Display-only field values ride along in a settings save because the new UI
submits every field of a page. `DisplayFields` drops them before the repository
writes (`dokan_admin_settings_pre_save`, `dokan_save_settings_value`), so a
connector URL shown on the screen is never persisted as a setting.
