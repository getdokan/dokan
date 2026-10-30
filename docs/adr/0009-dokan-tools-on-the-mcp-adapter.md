# Dokan serves its tools through the WordPress MCP Adapter: a Dokan server under the adapter's namespace, and the adapter's default server

Dokan's abilities (ADR-0005 to ADR-0007) were reachable over MCP only through
servers Dokan does not control. The first draft of this work therefore shipped
a Dokan server at `/wp-json/dokan/mcp` on the `wordpress/mcp-adapter` library,
with its own transport, a curated tool catalog, Dokan-named aliases of the
WooCommerce product and order abilities, schema rewrites for strict clients and,
at first, an OAuth server. Review removed the OAuth server ("rely on WordPress
and WooCommerce for authentication; Dokan handles authorization only"), and
WooCommerce 11.3 then removed the very pattern the rest was modelled on: its
`/wp-json/woocommerce/mcp` endpoint, custom transport and API-key header are
gone, and WooCommerce now only registers abilities and lets the MCP Adapter's
default server expose them.

Dokan follows WooCommerce and the adapter. Dokan registers abilities with the
Abilities API (through WooCommerce's `woocommerce_ability_definition_classes`
loader, as since 5.0.15), and the MCP Adapter's default server at
`/wp-json/mcp/mcp-adapter-default-server` serves them next to WooCommerce's and
everybody else's, through its three meta-tools: discover-abilities,
get-ability-info and execute-ability.

Dokan also registers a server of its own **on the adapter, the adapter's way**:
`Mcp\Server` calls `create_server()` on `mcp_adapter_init`, under the adapter's
`mcp` namespace, so it is `/wp-json/mcp/dokan` and appears in the adapter's own
index beside the default server. It uses the adapter's transport unchanged and
offers one tool per ability: Dokan's five and the seven WooCommerce product and
order abilities the Abilities layer vendor-scopes, under their real names
(`woocommerce-orders-query`, not an alias). The adapter documents the two
together, "you can use both at the same time": the default server for
discovery, the custom server so that a client such as claude.ai lists, describes
and approves each tool individually. The settings screens hand out the Dokan
server's URL and name the default server beside it.

Authentication is WordPress'. An assistant signs in to either server the
way the WordPress and WooCommerce documentation describe: HTTP Basic with a
WordPress Application Password. Dokan issues no credential, runs no login flow
and no longer declares any route a WooCommerce REST-key route; WooCommerce keys
authenticate only on WooCommerce's own routes, so they do not work here, and the
settings copy does not offer them.

Authorization is Dokan's, and it lives in the Abilities layer (`Mcp\Gate`),
which is the only layer the default server consults:

- **Exposure follows the master switch.** The adapter lists an ability when
  `meta.mcp.public` is on and refuses to run one whose flag is off. `Gate` sets
  the flag of every `dokan/*` ability from "Enable AI assistant access"
  (`wp_register_ability_args`, after the scope classes), so a switched-off site
  neither lists nor runs Dokan's tools. WooCommerce's abilities are not Dokan's
  to hide.
- **Who may use the tools is decided on the permission result.** On
  `wp_ability_permission_result`, for the abilities Dokan governs (its own and
  the WooCommerce product and order abilities it vendor-scopes), a request that
  came through MCP is refused with a reason when the switch is off (`dokan/*`
  only) or when `Access::user_can_connect()` says no: a Store Admin always may;
  a Vendor or Vendor Staff only while "Allow vendors to connect" is on and
  their store's selling is enabled. The switch is **off by default**: vendor
  connections are an explicit opt-in by the marketplace, as the product request
  for the first release asked. Because the check runs on every call, a vendor
  whose store is disabled is cut off at once; there is nothing of Dokan's to
  revoke.
- **Only MCP carries that policy.** `RequestContext::is_mcp_request()` is true
  when any of the adapter's capability filters fired on this request (the
  transport's permission check, then each meta-tool's pre-flight, all before
  the target ability's own permission callback) or when the request URI is an
  adapter server route (`/wp-json/mcp/<server>`), which is how a tool call on
  the Dokan server is recognised: the adapter's direct tool calls do not fire
  the execute filter. The Abilities REST API and in-process callers are an
  Ability Context (scoped by ADR-0006 / ADR-0007) but not an MCP request, so
  their abilities keep their own rules.
- **A vendor never sees another vendor.** Orders were already private to the
  owning vendor. Products now are too: `ProductAbilityScope` pins a vendor's
  `products-query` to their own store, refuses a `vendor_id` naming another
  store instead of silently redirecting, and denies a single-product read of
  another vendor's listing even when it is published. Store admins keep every
  store; a customer keeps the storefront's published view.

The vendor scoping of ADR-0006 / ADR-0007 applies to every tool call unchanged,
because it follows the Ability and not the server: the adapter's
execute-ability tool fires `mcp_adapter_execute_ability_capability` before the
target ability's permission callback, and `wp_before_execute_ability` during
execution. A Vendor calling `woocommerce/orders-query` through the default server
receives only their own orders.

The settings screens describe the connection with their ordinary field types
(plugin-ui `switch`, `copy_field`, `info` and `notice` variants; legacy
`switcher` and `html` fields), filled in when the screen is built. Display-only
values are stripped before a save (`DisplayFields`). When the MCP Adapter
plugin is not active, the screen says so and names the plugin to install;
WooCommerce 11.3 stopped bundling the adapter.

## Consequences

Dokan no longer boots the adapter, builds a server or touches the adapter's
default server switch (`mcp_adapter_create_default_server`). A site needs the
MCP Adapter plugin active for any MCP access, Dokan's or WooCommerce's; the
settings screen warns when it is missing or when something else disabled the
default server.

On the default server `tools/list` shows the adapter's three meta-tools; on
the Dokan server it shows the twelve tools with their own schemas and
annotations. Clients on the MCP TypeScript SDK validate results against those
schemas with format checking, and list a tool's fields from its top-level
`properties`; WooCommerce declares timezone-less dates as `date-time` and keeps
product-create fields inside `oneOf` branches. `ToolSchemas` therefore still
drops the format and mirrors the branch properties, for the server's tool
abilities only; values and server-side validation are unchanged.

The Dokan-named aliases (`dokan/products-query` and friends) are gone: they
existed so the first server could list only Dokan names, and next to the
default server they would duplicate WooCommerce's own abilities. Pro's output
shaping and the vendor scoping were always hooked on the WooCommerce names.

Switching the master switch on exposes Dokan's abilities to assistants only;
before this change the abilities registered in 5.0.15 were listed by the
default server with no switch at all. Gating the WooCommerce product and order
abilities for vendors behind "Allow vendors to connect" is an intentional
tightening: on a site that already had the adapter and the 5.0.15 scoping, a
vendor's assistant stops working until the marketplace opts vendors in.

`Access::governs()` matches by prefix, so every `woocommerce/product*` and
`woocommerce/order*` ability is covered, including ones Dokan does not scope
yet such as `woocommerce/order-notes-query`: a vendor without vendor access is
refused those too. And because `Gate` runs first on the permission result, its
refusal replaces one the ability itself had already decided; a vendor outside
the policy reads Dokan's reason, not WooCommerce's.

WooCommerce 11.3 turned `MCPAdapterProvider::is_mcp_request()` into a
`doing_it_wrong` stub. `RequestContext` no longer calls it, and recognises
`/wp-json/mcp/<server>` instead of `/wp-json/woocommerce/mcp`.

Only assistants that can send a username and password connect: Claude Code,
Cursor and VS Code through the `@automattic/mcp-wordpress-remote` proxy or a
header, Claude Desktop through the proxy, and claude.ai's custom connector where
its request-headers option (in beta) lets it send `Authorization: Basic` to a
site reachable from Anthropic's servers. Hosted connectors that sign in through
OAuth alone (ChatGPT) cannot, until WordPress or WooCommerce offer an OAuth
server to rely on.
