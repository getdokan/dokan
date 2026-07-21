# Vendor order details stays server-rendered, bridged into the panel as a fragment

The Vendor panel is React, but Vendor order details is not and will not become a React
screen. `templates/orders/details.php` fires eleven Dokan extension hooks plus
WooCommerce's item-rendering hooks, and Pro injects shipments, delivery time, store
pickup and the entire item/refund table through them. A REST endpoint
(`GET /dokan/v{1,2,3}/orders/<id>/details-html`) renders that same template and returns
its markup; the panel's `/orders/:orderId` route fetches the HTML, injects it, and fires
a documented event so legacy and third-party JavaScript can bind to the new markup.

The legacy order-details URL keeps working unchanged, with no redirect, and both entry
points call the same template — so they cannot drift, rollback is free, and the links
already sitting in Vendors' inboxes keep resolving.

Consequences worth knowing before "fixing" any of this:

- **Page-level wrapper hooks do not fire in a fragment.** `dokan_dashboard_wrap_start`,
  `dokan_dashboard_content_before`, `dokan_order_content_before`,
  `dokan_order_content_inside_before`, `dokan_order_inside_content` and their `_after`
  counterparts are skipped deliberately: they also render the PHP sidebar navigation and
  the status-filter bar, both of which the panel already provides. Everything *inside*
  the template fires untouched.
- **Pro's "Edit Order" control lived on that status-filter bar.** The panel header
  re-provides it. Anything else attached to those wrapper hooks needs the same treatment.
- **The render simulates a page request.** For the duration of the render only, dashboard
  detection reports true, the `orders` query var and the order id are present, and a
  valid `dokan_view_order` nonce is fabricated. Extension code was written against a page
  render — Pro's shipment panel reads the order id from the request and ignores the
  argument the hook passes it, and terminates the whole response if a nonce is present
  but does not verify. Authorization is already established by the endpoint's permission
  rule before any of this runs, and CSRF is preserved at the outer layer by the REST
  nonce. Everything is restored in a `finally`, so a throwing callback cannot leak state
  into the next request.
- **The endpoint does not reuse the shared single-order permission rule.**
  `get_single_order_permissions_check()` compares against the raw current user id, which
  refuses Vendor staff who can open the legacy page. That is a real bug, but fixing it
  changes already-shipped public v1/v2/v3 routes and needs its own change and coverage.
  The fragment endpoint has its own rule: the order-viewing capability plus ownership
  resolved through `dokan_get_current_user_id()`.
- **Render-time inline data only works for handles that exist during a REST request.**
  Hence the rule published to extension authors: register script handles on `init`,
  enqueue them on `wp_enqueue_scripts`.
- **The feature is behind `dokan_vendor_panel_order_details_enabled`**, which defaults
  off until dokan-pro's companion change ships. Without it the delivery-time panel
  renders dead and unstyled, refund requests submit an empty order id, and the shipment
  date picker never initialises.

Three alternatives were rejected. A **React rewrite** would silently delete every hooked
contribution — affected Vendors would get no error, just missing features. A **Gutenberg
dynamic block** through core's block-renderer endpoint is editor-shaped and gated on
`edit_posts`, which is both wrong for Vendors and far too permissive; a Dokan-owned
endpoint lets us own the permission rule, the nonce and the response shape. An **iframe**
(or Shadow DOM) would isolate the markup at the cost of breaking the delegated-handler
contract and reintroducing exactly the "two products stitched together" feel the
migration exists to remove.

A general "legacy fragment" registry for other PHP surfaces — coupons, reports, settings
tabs — is deliberately deferred until a second surface needs one. Designing a general
HTML-returning endpoint against a single consumer is a security surface we do not need
yet.
