# Vendor order details in the Vendor panel — extension author guide

Vendor order details is server-rendered PHP. It stays that way. When a Vendor opens an
order in the Vendor panel, the panel asks a REST endpoint to render
`templates/orders/details.php` and injects the resulting HTML — it does not re-implement
the view in React.

**Your PHP hooks fire with the same arguments, in the same order, as they always have.**
What is new is a JavaScript event to re-initialise against, and one rule about where you
register your scripts.

- [What changes for you](#what-changes-for-you)
- [Hooks that fire](#hooks-that-fire)
- [Hooks that do not fire](#hooks-that-do-not-fire)
- [Re-initialising your JavaScript](#re-initialising-your-javascript)
- [Passing render-time data to the browser](#passing-render-time-data-to-the-browser)
- [The request context during a fragment render](#the-request-context-during-a-fragment-render)
- [The kill-switch](#the-kill-switch)
- [Reference](#reference)

## What changes for you

| | Legacy order details page | Vendor panel |
|---|---|---|
| Template | `templates/orders/details.php` | the same file |
| Theme overrides & `dokan_set_template_path` | honoured | honoured |
| In-template hooks | fire | fire |
| Page wrapper hooks | fire | **do not fire** |
| Your markup exists at DOM-ready | yes | **no** — it arrives later |
| `$_GET['order_id']`, view nonce, `dokan_is_seller_dashboard()` | present | present (simulated) |

Two things need action: **JavaScript that binds at DOM-ready**, and **assets registered
on `wp_enqueue_scripts` only**.

## Hooks that fire

Everything inside the details template, unchanged:

| Hook | Arguments |
|---|---|
| `dokan_order_detail_after_order_items` | `WC_Order $order` |
| `dokan_order_details_after_customer_info` | `WC_Order $order` |
| `dokan_order_detail_after_order_general_details` | `WC_Order $order` |
| `dokan_order_detail_after_order_notes` | `WC_Order $order` |
| `dokan_order_details_show_billing_address` (filter) | `bool $show, WC_Order $order` |
| `dokan_order_details_billing_address` (filter) | `string $html, WC_Order $order` |
| `dokan_order_details_show_shipping_address` (filter) | `bool $show, WC_Order $order` |
| `dokan_order_details_shipping_address` (filter) | `string $html, WC_Order $order` |
| `woocommerce_admin_order_item_headers` | `WC_Order $order` |
| `woocommerce_admin_order_item_types` (filter) | `array $types` |
| `woocommerce_order_item_{type}_html` | `int $item_id, WC_Order_Item $item, WC_Order $order` |

Plus two actions that exist **only** during a fragment render, if you need to tell the
two entry points apart:

```php
add_action( 'dokan_order_details_fragment_before', function ( $order ) { /* … */ } );
add_action( 'dokan_order_details_fragment_after',  function ( $order ) { /* … */ } );
```

And a filter on the response payload itself:

```php
add_filter( 'dokan_rest_prepare_order_details_html', function ( $data, $order, $request ) {
    return $data; // [ 'html' => …, 'inline_scripts' => [ … ], 'order' => [ … ] ]
}, 10, 3 );
```

## Hooks that do not fire

The page-level wrappers from `templates/orders/orders.php`:

`dokan_dashboard_wrap_start` · `dokan_dashboard_content_before` ·
`dokan_order_content_before` · `dokan_order_content_inside_before` ·
`dokan_order_inside_content` · `dokan_order_content_inside_after` ·
`dokan_dashboard_content_after` · `dokan_order_content_after` ·
`dokan_dashboard_wrap_end` · `dokan_order_status_filter_before`

This is a **documented boundary, not an oversight**: those hooks also render the PHP
sidebar navigation and the status-filter bar, and the panel provides both itself.

If you attach UI to one of them, move it to an in-template hook, or contribute a header
action from the panel side with a `Fill` on `dokan-header-actions`.

## Re-initialising your JavaScript

Your handlers run at DOM-ready, when the fragment does not exist yet. Two things fix
that, and you want both:

**1. Delegate your event handlers from `document`** so binding order stops mattering:

```js
// Before — silently does nothing in the panel.
jQuery( '#my-order-widget button' ).on( 'click', handler );

// After — works on the legacy page and in the panel.
jQuery( document ).on( 'click', '#my-order-widget button', handler );
```

**2. Re-run anything that initialises an element** — date pickers, select2, tooltips,
charts — when the fragment arrives. The event carries the container and the order id, and
is published on both channels, so use whichever suits your codebase:

```js
// Modern
wp.hooks.addAction(
    'dokan-order-details-fragment-rendered',
    'my-plugin/order-details',
    function ( container, orderId ) {
        jQuery( container ).find( '.my-datepicker:not(.hasDatepicker)' ).datepicker();
    }
);

// jQuery
jQuery( document.body ).on(
    'dokan-order-details-fragment-rendered',
    function ( event, container, orderId ) { /* … */ }
);
```

Guard against double-initialising (`:not(.hasDatepicker)`, `:not(.select2-hidden-accessible)`,
your own marker class) — the event fires again every time the Vendor opens another order.

Two more events are available:

| Event | Payload | Fires |
|---|---|---|
| `dokan-order-details-loaded` | `( order )` | order metadata is known, before the markup is inserted |
| `dokan-order-details-fragment-rendered` | `( container, orderId )` | markup is on the page and inline data is executing |
| `dokan-order-details-status-changed` | `( orderId, status, labelHtml )` | a Vendor changed the status inline and it persisted |

## Passing render-time data to the browser

`wp_add_inline_script()` from inside your template still works — the endpoint snapshots
the script registry before the render, diffs it afterwards, and the panel injects the
delta as real `<script>` elements before inserting the HTML.

**The rule this depends on: register your handle on `init`, enqueue it on
`wp_enqueue_scripts`.**

```php
// Registration must happen on `init`, because a REST request never reaches
// `wp_enqueue_scripts` — and `wp_add_inline_script()` silently no-ops for a handle
// that is not registered.
add_action( 'init', function () {
    wp_register_script( 'my-order-widget', plugins_url( 'widget.js', __FILE__ ), [ 'jquery' ], '1.0.0', true );
} );

add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_script( 'my-order-widget' );
} );

// Then, from inside a hook on the details template:
add_action( 'dokan_order_detail_after_order_items', function ( $order ) {
    wp_add_inline_script(
        'my-order-widget',
        'window.myOrderData = ' . wp_json_encode( [ 'orderId' => $order->get_id() ] ) . ';',
        'before'
    );
} );
```

Two things to know:

- The payload is executed at **global scope**, as a real script element — not `eval`,
  which would function-scope it and leave your consuming script finding nothing.
- **Do not declare render-time data with a top-level `let` or `const`.** Those bindings
  cannot be redeclared, so when the Vendor opens a second order the new payload throws a
  `SyntaxError` and your script keeps reading the *previous* order's data. Assign to
  `window`, or use `var`.

Script tags embedded in your rendered HTML are also re-created so they execute — HTML
assigned as a string never runs its scripts.

## The request context during a fragment render

Code written against a page render keeps working: for the duration of the render only,

- `dokan_is_seller_dashboard()` returns `true`,
- the `orders` query var is set,
- `$_GET['order_id']` / `$_REQUEST['order_id']` hold the order id,
- `$_GET['_wpnonce']` holds a valid `dokan_view_order` nonce.

All of it is restored afterwards, guaranteed, even if a hooked callback throws.
Authorization is established by the endpoint's own permission rule — the order-viewing
capability plus ownership through `dokan_get_current_user_id()` — before any of this
happens, and CSRF protection is preserved at the outer layer by the REST nonce.

**Do not call `wp_send_json_error()` or `wp_die()` from a render callback.** It
terminates the whole response mid-document, on the legacy page as well.

## The kill-switch

A marketplace admin can send the panel back to full-page navigation with one snippet.
The legacy URL never stops working, so this is free to flip:

```php
add_filter( 'dokan_vendor_panel_order_details_enabled', '__return_false' );
```

It currently defaults **off** and will default on once dokan-pro's companion change has
shipped.

## Reference

| | |
|---|---|
| Endpoint | `GET /dokan/v1/orders/<id>/details-html` (also on `v2`, `v3`) |
| Response | `{ html, inline_scripts: [ { handle, position, code } ], order: { id, number, status, status_label, date_created } }` |
| Panel route | `#/orders/<id>` |
| Legacy URL | `…/dashboard/orders/?order_id=<id>&_wpnonce=<dokan_view_order nonce>` — unchanged |
| Renderer | `WeDevs\Dokan\Order\DetailsFragment` |
| Decision record | `docs/adr/0005-vendor-order-details-stays-server-rendered.md` |
| Vocabulary | `CONTEXT.md` → *Vendor-facing surfaces* |
