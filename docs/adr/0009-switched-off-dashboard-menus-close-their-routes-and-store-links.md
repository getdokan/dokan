# Switched-off dashboard menus close their SPA routes, and the store page follows

The Dashboard Menu Manager (Pro) lets the admin switch a vendor dashboard menu or
a Settings submenu off. Lite already honours the flag it leaves on
`dokan_get_dashboard_nav()` items (`is_switched_on === false`) in the React
sidebar and its collapsed-state popover, and Pro refuses the legacy page on
`dokan_dashboard_shortcode_query_vars`. Two surfaces still ignored it: the hash
router opened `#settings/social` and `#settings/seo` by URL, and the store page
kept rendering the vendor's social links — in Lite's `templates/store-header.php`
(all four header layouts) and in Pro's Elementor *Store Social Profile* widget —
although the vendor could no longer manage them (plugin-internal-tasks#2493; the
product decision that a switched-off page also hides its links is recorded in
dokan-pro ADR-0015).

We decided that Lite owns the two gates and Pro only flips them:

1. **Routes.** `dokan_get_restricted_dashboard_routes()` turns the nav into the
   SPA routes under a switched-off item — the part after `#` of its `url`, so an
   item without a React route contributes nothing — and `Assets` localizes the
   list as `dokanFrontend.restrictedRoutes` on the seller dashboard.
   `withRouter()` renders the existing `Forbidden` view when the *registered
   path of the route the router matched* equals, or sits below, a restricted
   route, next to the capability gate it already applies. The typed URL is
   never re-parsed: React Router matches it case-insensitively and decoded,
   so `#settings/Social` and `#settings/%73ocial` reach the `/settings/social`
   route, and a gate that compared `location.pathname` opened on exactly those
   forms. The list travels with the SPA's own script handle because the legacy
   vendor layout hosts the same SPA without `vendorDashboardLayoutConfig`.
2. **Store page.** `templates/store-header.php` reads the links through a new
   filter, `dokan_store_social_profiles( array $social_info, Vendor $vendor )`.
   Pro's Elementor tag applies the same filter, and Pro's Menu Manager returns
   `[]` from it while the Social Profile page is restricted.

## Considered options

Reading `vendorDashboardLayoutConfig.sidebarNav` in the router was rejected: it
exists only for the "latest" vendor layout, and a gate that fails open under the
legacy layout is worse than none. Masking the social data itself (through
`dokan_vendor_shop_data`) was rejected: it would blank the settings form and
REST `stores/{id}`, and a vendor saving the masked form would destroy their
links. Having each Pro feature skip registering its route was rejected: it needs
per-feature code plus the restricted keys in JS, and misses routes under a
switched-off *left* menu.

## Consequences

- Anything that sets `is_switched_on => false` on a `dokan_get_dashboard_nav`
  item closes that item's SPA routes too, not only its sidebar entry; the flag
  is the single switch, and a route registered through `dokan-dashboard-routes`
  needs no code of its own to be gated.
- The route gate is per viewer, derived from the nav the signed-in user sees,
  like the capability gate beside it; it only ever hides. The REST endpoints
  behind the routes are unchanged — the gate is page-level, the same as the
  legacy restriction.
- Themes overriding `store-header.php` must apply `dokan_store_social_profiles`
  to keep the behaviour. The REST `social` field still carries the stored links,
  by design: nothing is masked at the data layer.
