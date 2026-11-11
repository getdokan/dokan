# Dokan registers its own MCP server on the WordPress MCP Adapter, and leaves the adapter's default server alone

Dokan's abilities (ADR-0005 to ADR-0007) were reachable over MCP only through
servers Dokan does not control. The first draft of this work therefore shipped
a Dokan server at `/wp-json/dokan/mcp` on the `wordpress/mcp-adapter` library,
with its own transport, a curated tool catalog, Dokan-named aliases of the
WooCommerce product and order abilities, schema rewrites for strict clients,
WooCommerce REST-key login and, at first, an OAuth server. Review removed the
OAuth server ("rely on WordPress and WooCommerce for authentication; Dokan
handles authorization only"), and WooCommerce 11.3 then removed the pattern the
rest was modelled on: its `/wp-json/woocommerce/mcp` endpoint, custom transport
and API-key header are gone, and WooCommerce now only registers abilities and
lets the MCP Adapter serve them. A second draft dropped the Dokan server and
served everything through the adapter's default server; that left a Vendor no
endpoint of their own and offered Dokan's abilities to every account that can
sign in to the default server.

Dokan keeps one endpoint, registered the adapter's way. On `mcp_adapter_init`
`Mcp\Server` calls the adapter's `create_server()` for the REST route
`/wp-json/dokan/mcp` (namespace `dokan`, route `mcp`), beside the adapter's
default server at `/wp-json/mcp/mcp-adapter-default-server`, which Dokan does
not create, configure or switch off. Dokan boots no adapter: whether one runs is
WooCommerce's and the adapter's call. The server is built only for a REST request
to its own route (or under WP-CLI), decided on the REST route WordPress
dispatches, which it knows before `rest_api_init` fires; the REST server that
wp-admin builds for editor preloads never gets it. When something builds the
REST server before WordPress has parsed the request, the route is not known
yet, so outside wp-admin the server is registered on that request rather than
lost.

A server registered on the adapter gets no ability by itself; only the default
server discovers abilities, by their MCP exposure flag. So `Mcp\Server` gathers
the tools itself and **follows the default server**: every ability that server
would offer on the site (WordPress's `core/*`, WooCommerce's product and order
abilities, any other plugin's public ones) is offered here too, under its own
name (`woocommerce/products-query` and so on; no Dokan-named alias, no schema
rewrite), and Dokan's own abilities are added. The WooCommerce product and
order abilities are also named in `Server::ABILITIES`, so they stay offered on
a WooCommerce that does not flag them. Abilities a WooCommerce version does
not register are skipped. Dokan's own abilities are registered with
`meta.mcp.public` off, so the default server neither lists nor runs them:
they are offered at `/dokan/mcp` and nowhere else. The server's description is
one paragraph of guidance, which the adapter hands a client as its
`instructions`.

Authentication is WordPress'. An assistant signs in the way the WordPress and
WooCommerce documentation describe: HTTP Basic with a WordPress Application
Password. The first draft declared its route a WooCommerce REST-key route so a
consumer key and secret worked there; the declaration matched the raw request
URI, so any WooCommerce key authenticated on every REST route whose query string
named the endpoint. There is no such declaration: WooCommerce keys authenticate
only on WooCommerce's own routes, as WooCommerce decides, before and after 11.3.

**A Vendor creates the Application Password on the Vendor Dashboard.** WordPress
offers Application Passwords on the profile screen and through
`authorize-application.php`, both in wp-admin, where Dokan does not admit
Vendors (always, on HPOS stores). `Mcp\VendorSettings` adds an "AI Assistant"
tab to the Store settings page; its field calls WordPress's own REST route,
`/wp/v2/users/me/application-passwords`, with the dashboard's REST nonce. Dokan
adds no endpoint, table or option for it, so WordPress keeps every decision:
who may create, list and revoke (`create_app_password` and its siblings, which
map to `edit_user` on oneself), and whether the feature is available at all
(`wp_is_application_passwords_available_for_user()`: HTTPS, or a security
plugin switching it off). When it is not, the tab says so and offers no form;
Dokan never forces it on. The password is shown once, when it is created:
WordPress stores a hash, so a listed password can be revoked but not read back
or copied. While it is on screen the same panel also offers a **token**: the
browser's base64 encoding of `username:password`, which is what an MCP client
sends after `Authorization: Basic`. The token is that Application Password in
another spelling, not a second credential; Dokan neither issues nor stores it,
so a password listed later has none to offer (the list carries no token
column), and making one available again would mean keeping the password. It is always the signed-in user's own (Vendor Staff
create theirs), and the wp-admin block stays as it is. The tab is the Vendor
Dashboard's side of "Allow vendors to connect": it is offered only while both
switches are on and that account may connect, to a Store Admin as well, who can
connect either way and creates theirs on the profile screen. It lives on the
React Store settings page; the legacy Store settings form has no counterpart
yet.

Authorization is Dokan's, asked at the door of its own server and again in the
Abilities layer, because the WooCommerce product and order abilities are also
served by the default server and by any third-party one:

- **The door.** `Mcp\Transport` extends the adapter's HTTP transport and
  answers its permission check with `Server::authorize()`: 401 when nobody is
  signed in, 403 with the reason when "Enable AI assistant access" is off or
  when `Access::user_can_connect()` says no. The adapter also accepts a
  per-server permission callback, but it reduces the answer to yes or no; the
  subclass keeps the reason for the assistant to pass on. The server is
  registered with the master switch off too, so a switched-off marketplace
  explains itself instead of answering 404.
- **Who may use the tools is decided in the permission callback too.** `Gate`
  wraps the permission callback of every ability Dokan governs (its own and the
  WooCommerce product and order abilities it vendor-scopes) so that a request
  that came through MCP, on whichever server, is refused with a reason when the
  switch is off (`dokan/*` only) or when `Access::user_can_connect()` says no: a
  Store Admin
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
  when Dokan's transport admitted the request, when any of the adapter's
  capability filters fired on it (the default transport's permission check,
  then each meta-tool's pre-flight, all before the target ability's own
  permission callback) or when the REST route WordPress dispatched is Dokan's
  server (`/dokan/mcp`), an adapter server (`/mcp/<server>`) or WooCommerce's
  pre-11.3 endpoint. Neither signal can be forged from a request URI: the
  route is the one WordPress matched, not the raw path or query string (the
  class of CVE-2026-119220). The Abilities REST API and in-process callers are
  an Ability Context (scoped by ADR-0006 / ADR-0007) but not an MCP request, so
  their abilities keep their own rules.
- **A vendor never sees another vendor's orders, and reads other stores'
  products as a shopper does.** Orders stay private to the owning vendor.
  Product reads keep the rule shipped in 5.0.15: `products-query` returns every
  store's published products, a vendor's unpublished ones only when they pass
  their own `vendor_id`, and a single product is readable when published or
  the vendor's own. Writes stay with the owning store. An earlier draft of this
  decision pinned product reads to the vendor's own store; that was withdrawn,
  because the published catalogue is public and a vendor's assistant is
  expected to answer what the marketplace sells. A vendor's order carries no
  `parent_id` at all (a Store Admin's does): the parent and, through it, the
  sibling Suborders are the marketplace's, and a `0` would read as "a top-level
  order".
- **A vendor without direct publishing does not go live through a tool.** A
  product created through an ability, or moved to a live status, takes the
  marketplace's new-product status, and the Store Admin gets the pending-review
  email once, as from the dashboard. A product that is already live stays live
  when it is edited, as on a REST edit that names no status.
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
or HTTPS. The connector URL they hand out is `/wp-json/dokan/mcp`.

## Consequences

Dokan no longer boots the adapter, aliases abilities, rewrites schemas, accepts
WooCommerce keys or touches the adapter's default server switch
(`mcp_adapter_create_default_server`). Whether MCP is available at all is
WooCommerce's and the adapter's call: before 11.3 WooCommerce's feature flag
boots the bundled adapter (0.3, whose `create_server()` and HTTP transport are
the ones used here); from 11.3 the standalone plugin does.

At `/dokan/mcp` `tools/list` shows each ability as a tool of its own, named
after the ability (`dokan-current-vendor`, `woocommerce-products-query`), so a
call is one step. An ability WordPress or WooCommerce adds later arrives there
by itself once its owner marks it public for MCP; the
`dokan_mcp_server_abilities` filter adds or removes one. The vendor rules cover
WooCommerce's product and order abilities by name prefix; anything else keeps
its own permission check and nothing more.

Dokan's abilities leave the adapter's default server, where 5.0.15 to 5.3.x
listed them with no switch at all. That server keeps serving WooCommerce's
abilities as WooCommerce exposes them, and the vendor rules follow them there:
gating the WooCommerce product and order abilities for vendors behind the two
switches is an intentional tightening. On a site that already had the adapter
and the 5.0.15 scoping, a vendor's assistant stops working until the marketplace
opts vendors in, and a subscriber's or customer's assistant never reaches the
store beyond what the `core/*` abilities answer.

An Application Password is not an MCP-only credential: it signs its user in on
every REST route with that user's own capabilities. Giving Vendors a button to
create one makes what a Vendor can already do with a browser session scriptable,
no more; it also means every REST route's own Vendor scoping matters as much as
the Abilities layer's.

WooCommerce 11.3 turned `MCPAdapterProvider::is_mcp_request()` into a
`doing_it_wrong` stub. `RequestContext` no longer calls it.

Only assistants that can send a username and password connect: Claude Code,
Cursor and VS Code through the `@automattic/mcp-wordpress-remote` proxy or a
header, Claude Desktop through the proxy, and claude.ai's custom connector where
its request-headers option (in beta) lets it send `Authorization: Basic` to a
site reachable from Anthropic's servers. Hosted connectors that sign in through
OAuth alone (ChatGPT) cannot, until WordPress or WooCommerce offer an OAuth
server to rely on.
