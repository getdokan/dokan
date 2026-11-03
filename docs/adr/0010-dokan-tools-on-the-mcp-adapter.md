# Dokan serves its tools through the WordPress MCP Adapter's default server, and runs no server of its own

Dokan's abilities (ADR-0005 to ADR-0007) were reachable over MCP only through
servers Dokan does not control. The first draft of this work therefore shipped
a Dokan server at `/wp-json/dokan/mcp` on the `wordpress/mcp-adapter` library,
with its own transport, a curated tool catalog, Dokan-named aliases of the
WooCommerce product and order abilities, schema rewrites for strict clients,
WooCommerce REST-key login and, at first, an OAuth server. Review removed the
OAuth server ("rely on WordPress and WooCommerce for authentication; Dokan
handles authorization only"), and WooCommerce 11.3 then removed the very pattern
the rest was modelled on: its `/wp-json/woocommerce/mcp` endpoint, custom
transport and API-key header are gone, and WooCommerce now only registers
abilities and lets the MCP Adapter's default server expose them.

Dokan follows WooCommerce and the adapter. Dokan registers abilities with the
Abilities API (through WooCommerce's `woocommerce_ability_definition_classes`
loader, as since 5.0.15), and the MCP Adapter's default server at
`/wp-json/mcp/mcp-adapter-default-server` serves them next to WooCommerce's and
everybody else's, through its three meta-tools: discover-abilities,
get-ability-info and execute-ability. Dokan creates no server, declares no
route, boots no adapter and touches no credential. The settings screens hand
out the default server's URL, and Dokan appends one paragraph to that server's
description, which the adapter hands a client as its `instructions`
(`mcp_adapter_default_server_config`).

Authentication is WordPress'. An assistant signs in the way the WordPress and
WooCommerce documentation describe: HTTP Basic with a WordPress Application
Password. The first draft declared its route a WooCommerce REST-key route so a
consumer key and secret worked there; the declaration matched the raw request
URI, so any WooCommerce key authenticated on every REST route whose query string
named the endpoint. There is no such declaration any more: WooCommerce keys
authenticate only on WooCommerce's own routes, as WooCommerce decides, before
and after 11.3.

Authorization is Dokan's, and it lives in the Abilities layer (`Mcp\Gate`),
which is the only layer the default server consults:

- **Exposure follows the master switch.** The adapter lists an ability when
  `meta.mcp.public` is on and refuses to run one whose flag is off. `Gate` sets
  the flag of every `dokan/*` ability from "Enable AI assistant access"
  (`wp_register_ability_args`, after the scope classes), so a switched-off site
  neither lists nor runs Dokan's tools. WooCommerce's abilities are not Dokan's
  to hide, but the vendor scoping of ADR-0006 / ADR-0007 applies to them either
  way.
- **Who may use the tools is decided in the permission callback.** `Gate`
  wraps the permission callback of every ability Dokan governs (its own and the
  WooCommerce product and order abilities it vendor-scopes) so that a request
  that came through MCP is refused with a reason when the switch is off
  (`dokan/*` only) or when `Access::user_can_connect()` says no: a Store Admin
  always may; a Vendor or Vendor Staff only while **both** "Enable AI assistant
  access" and "Allow vendors to connect" are on and their store's selling is
  enabled; anyone else (a customer, a subscriber) never. The settings screen
  offers vendor access beneath the master switch, so the master switch closes
  vendor access with it rather than leaving a stored "on" live. Vendor access is
  **off by default**: vendor connections are an explicit opt-in by the
  marketplace. Because the check runs on every call, a vendor whose store is
  disabled is cut off at once; there is nothing of Dokan's to revoke.
- **The wrapper holds on every WordPress with the Abilities API.** The scope
  classes and `Gate` wrap `permission_callback` and `execute_callback` in place
  on `wp_register_ability_args` (WordPress 6.9), and apply the same decisions a
  second time on WordPress 7.1's `wp_ability_permission_result`; both are
  idempotent. WooCommerce 11.3's product-create and product-update attach their
  execute callback after registration (`ActionableAbility`), so they cannot be
  wrapped: for them the vendor is resolved and `vendor_id` stripped on
  `wp_ability_normalize_input`, and the owning vendor added on
  `wp_ability_execute_result`, both WordPress 7.1. On WordPress 7.0 with
  WooCommerce 11.3 a Store Admin cannot name the vendor of a product created
  over MCP and create / update responses carry no `vendor`; everything that
  decides permission still holds there.
- **Only MCP carries that policy.** `RequestContext::is_mcp_request()` is true
  when any of the adapter's capability filters fired on this request (the
  transport's permission check, then each meta-tool's pre-flight, all before
  the target ability's own permission callback) or when the REST route
  WordPress dispatched is an adapter server (`/mcp/<server>`) or WooCommerce's
  pre-11.3 endpoint. Neither signal can be forged from a request URI: the
  route is the one WordPress matched, not the raw path or query string (the
  class of CVE-2026-119220). The Abilities REST API and in-process callers are
  an Ability Context (scoped by ADR-0006 / ADR-0007) but not an MCP request, so
  their abilities keep their own rules.
- **A vendor never sees another vendor.** Orders were already private to the
  owning vendor. Products now are too: `ProductAbilityScope` pins a vendor's
  `products-query` to their own store, refuses a `vendor_id` naming another
  store instead of silently redirecting, and denies a single-product read of
  another vendor's listing even when it is published. Store admins keep every
  store; a customer keeps the storefront's published view. A vendor's order
  carries no `parent_id` at all (a Store Admin's does): the parent and, through
  it, the sibling Suborders are the marketplace's, and a `0` would read as "a
  top-level order".
- **Every WooCommerce order ability is covered by name prefix**, including
  ones added after this decision such as `woocommerce/order-notes-query`
  (11.3): the ownership check, the vendor-access policy and the explained
  refusal apply to it without a code change.

The settings screens describe the connection with their ordinary field types
(plugin-ui `switch`, `copy_field`, `info` and `notice` variants; legacy
`switcher` and `html` fields), filled in when the screen is built. Display-only
values are stripped before a save (`DisplayFields`). The screen says what is
missing: the MCP Adapter plugin (WooCommerce 11.3 and newer), WooCommerce's
"MCP Integration" feature (10.9 to 11.2, which bundle the adapter behind it),
the adapter's default server, or HTTPS.

## Consequences

Dokan no longer boots the adapter, builds a server, aliases abilities, rewrites
schemas or touches the adapter's default server switch
(`mcp_adapter_create_default_server`). Whether MCP is available at all is
WooCommerce's and the adapter's call: before 11.3 WooCommerce's feature flag
boots the bundled adapter; from 11.3 the standalone plugin does.

On the default server `tools/list` shows the adapter's three meta-tools; a
client finds Dokan's abilities through discover-abilities, so a tool call is
two steps rather than one. Nothing of Dokan's is listed twice, and a WooCommerce
ability added later is served without a Dokan release.

Switching the master switch on exposes Dokan's abilities to assistants only;
before this change the abilities registered in 5.0.15 were listed by the
default server with no switch at all. Gating the WooCommerce product and order
abilities for vendors behind the two switches is an intentional tightening: on
a site that already had the adapter and the 5.0.15 scoping, a vendor's
assistant stops working until the marketplace opts vendors in, and a
subscriber's or customer's assistant never reaches the store beyond what the
`core/*` abilities answer.

WooCommerce 11.3 turned `MCPAdapterProvider::is_mcp_request()` into a
`doing_it_wrong` stub. `RequestContext` no longer calls it.

Only assistants that can send a username and password connect: Claude Code,
Cursor and VS Code through the `@automattic/mcp-wordpress-remote` proxy or a
header, Claude Desktop through the proxy, and claude.ai's custom connector where
its request-headers option (in beta) lets it send `Authorization: Basic` to a
site reachable from Anthropic's servers. Hosted connectors that sign in through
OAuth alone (ChatGPT) cannot, until WordPress or WooCommerce offer an OAuth
server to rely on.
