# Dokan runs its own MCP server on the shared adapter; every connection acts as one user

Dokan's abilities were reachable over MCP only through servers Dokan does not
control: the adapter's generic default server (every registered ability, for
any logged-in user with `read`) and WooCommerce's `/woocommerce/mcp` (REST-derived
tools, authenticated with WooCommerce API keys that only a Store Admin can mint).
Neither lists Dokan's own abilities, neither offers a vendor a way in, and the
WooCommerce endpoint is deprecated upstream.

We ship a Dokan server at `/wp-json/dokan/mcp` on the same `wordpress/mcp-adapter`
WooCommerce bundles, with a curated tool list (`Catalog`, filterable through
`dokan_mcp_server_abilities`) and our own transport. The transport authenticates
a Bearer credential and becomes the user behind it; the vendor scoping of
ADR-0006 / ADR-0007 then applies to every tool call because the transport flags
the Ability Context. No scoping lives in the server.

Two credentials, both bound to one user and never shared:

- an **OAuth 2.1** grant (authorization code, mandatory PKCE, dynamic client
  registration, rotating refresh tokens) approved on a consent page served from
  `parse_request`, so the `wp-login.php` round trip works without a REST nonce;
- a **personal connection token** minted from the settings screen, for clients
  without a browser.

A Store Admin may always connect. A Vendor or Vendor Staff may connect only while
the "Allow vendors to connect" switch is on and their store's selling is enabled,
and every credential they hold is revoked when either stops being true (`Grants`).
The switch is **off by default**: vendor connections are an explicit opt-in by the
marketplace, as the product request for the first release asked.

The settings screens describe the connection with their ordinary field types
(plugin-ui `info`, `copy_field`, `html` and `notice` variants; legacy `html`
fields), filled in when the screen is built. The actions on a connection
(create / rotate / revoke a token, revoke an app) are nonced `admin-post.php`
links. No custom React or Vue component, no settings-screen REST route.

## Consequences

Switching Dokan MCP on boots the adapter when WooCommerce's own `mcp_integration`
feature has not. The adapter's generic default server is kept off in that case
(`mcp_adapter_create_default_server`), so enabling Dokan never opens an unscoped
surface as a side effect; a site with WooCommerce's feature on keeps whatever
that feature creates.

The transport overrides `HttpTransport::check_permission()` rather than passing
the adapter's `transport_permission_callback`: the adapter treats a `WP_Error`
from that callback as "fall back to the `read` capability", which would let a
cookie-authenticated browser session through.

Tool calls bypass the adapter's `mcp_adapter_execute_ability_capability` filter
that `RequestContext` listens to, so the transport calls
`RequestContext::flag_mcp_request()` itself after authenticating. Without it the
permission pre-flight of a WooCommerce order ability would run unscoped.

Only digests of codes and tokens are stored. A personal token also keeps an
encrypted display copy keyed on the auth salt; rotating the salts leaves the
token working and the screen offering a rotation instead of the value.

Display-only field values ride along in a settings save because the new UI
submits every field of a page. `Actions` drops them before the repository
writes (`dokan_admin_settings_pre_save`, `dokan_save_settings_value`), so a
token shown on the screen is never persisted as a setting. The schema also
carries those values itself (`value` set at build time), which the registry
respects over stored values.

The discovery documents are served three ways (REST alias advertised in the
`WWW-Authenticate` challenge, RFC 8414 path-insert under `/.well-known/`, and
the path-suffix forms under the issuer), none of which needs a rewrite rule.
