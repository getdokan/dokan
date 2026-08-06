# `dokan/v1/paypal-marketplace/create-payment` (cart route) has no nonce and no rate limit — one anonymous caller can force unbounded WooCommerce draft-order and live PayPal-order creation

**Component:** Dokan Pro → PayPal Marketplace module → REST (`PayPalController`)
**Version observed:** dokan-pro 5.0.9 (`74f2f3303`)
**Severity:** Medium — hardening / abuse (resource exhaustion). Each anonymous request costs the site
one persisted WooCommerce order and one live PayPal order created under the platform's own PayPal
credentials, and nothing bounds the rate. No privilege escalation and no cross-customer data access
is claimed: the created order is verified to be a guest order (`customer_id === 0`) built from the
caller's own session cart.
**Type:** Bug (security hardening)
**Discovered by:** PayPal Marketplace E2E suite, while writing case `PP-GST-05`
**Spec:** `tests/pw/tests/e2e/paypal-marketplace/paypalMarketplaceGuest.spec.ts`

## Summary

**Anonymous reachability of this route is by design and is not the finding.** Guest checkout is a
supported feature of this module: `woocommerce_enable_guest_checkout` is `yes` on the test site,
`PP-GST-01` (P0) asserts that a logged-out visitor is offered the gateway at checkout, and
`check_cart_permission()` (`REST/V1/PayPalController.php:81-96`) calls `wc_load_cart()` with an
explicit comment that WooCommerce loads neither the session nor the cart on REST requests and that
both are required to build the order. A logged-out shopper reaching this route with a populated cart
is the product working as intended.

The residual finding is narrower: the route carries **no nonce and no rate limit**, and the handler
behind it is not read-only. `create_cart_payment()` calls `get_draft_order()`, which runs
WooCommerce's `OrderController::create_order_from_cart()` and saves a real order, then calls
`PayPal::process_payment()`, which builds the purchase units and creates a real PayPal order through
the platform's own PayPal credentials. So a single scripted client — no account, no page load, no
token of any kind — can repeat `add-to-cart` + `POST create-payment` in a loop and make the site
manufacture one WooCommerce order plus one live PayPal order per request, indefinitely.

The marginal exposure over WooCommerce's own guest checkout is that this path needs no rendered page
and no nonce: WooCommerce's checkout POST carries `woocommerce-process-checkout-nonce`, so scripting
it means first fetching a checkout page and scraping the nonce, and WooCommerce additionally applies
its own order-creation rate limiting on the Store API. This route has neither, so it is the cheapest
way to drive the cost.

The sibling order-based routes (`create-payment/(?P<order_id>\d+)` and `capture-payment/…`) are out
of scope here: they use `check_order_permission()` →
`is_order_payable_by_current_customer()`, which asserts the caller against the session's
draft/awaiting-payment order or the logged-in customer.

## Evidence

`wp-content/plugins/dokan-pro/modules/paypal-marketplace/includes/REST/V1/PayPalController.php:47-53`

```php
register_rest_route(
    $this->namespace, '/' . $this->rest_base . '/create-payment', array(
        'methods'             => 'POST',
        'callback'            => array( $this, 'create_cart_payment' ),
        'permission_callback' => array( $this, 'check_cart_permission' ),
    )
);
```

`…/REST/V1/PayPalController.php:81-96` — the whole permission callback. Note that the cart load is
deliberate and documented; what is absent is any nonce check and any throttle:

```php
public function check_cart_permission() {
    if ( ! WC()->cart instanceof \WC_Cart && function_exists( 'wc_load_cart' ) ) {
        wc_load_cart();
    }

    if ( ! WC()->cart instanceof \WC_Cart || WC()->cart->is_empty() ) {
        return new WP_Error(
            'dokan_paypal_empty_cart',
            __( 'There is nothing in your cart to pay for.', 'dokan' ),
            array( 'status' => 400 )
        );
    }

    return true;
}
```

Observed on the running test site (`http://localhost:9999`, dokan-pro 5.0.9, gateway enabled,
sandbox mode), with no credentials and no cookies at all:

```
$ curl -s -X POST http://localhost:9999/wp-json/dokan/v1/paypal-marketplace/create-payment
{"code":"dokan_paypal_empty_cart","message":"There is nothing in your cart to pay for.","data":{"status":400}}
HTTP 400
```

The request was rejected only for having nothing to buy — i.e. the request needed no token to reach
the cart check, and populating a cart is one more anonymous GET away.

`PP-GST-05` performs the same probe with a populated anonymous session and proves, before claiming
anything, that the session really is anonymous (`wp/v2/users/me` answers `rest_not_logged_in`) and
that the server really can see that session's cart (`wc/store/v1/cart` reports a non-empty cart).
What that case asserts is the ownership of the result, not a refusal — see the notes at the end.

## Steps to reproduce

1. Activate the `paypal_marketplace` module and enable the PayPal Marketplace gateway (the route is
   only registered when `Helper::is_enabled()` is true — `module.php:98-101,116`).
2. With no cookies and no authentication, populate an anonymous cart:
   `GET /?p=<product_id>&add-to-cart=<product_id>` (keep the cookie jar).
3. With the same cookie jar and still no authentication:
   `POST /wp-json/dokan/v1/paypal-marketplace/create-payment`.
4. Repeat step 3 (or steps 2-3 with a fresh cookie jar) in a loop, and watch
   `wp-admin/edit.php?post_type=shop_order` and the PayPal sandbox dashboard grow one order each per
   request.

## Expected

A guest may reach this route — that part must not change — but the route bounds what an unattended
client can make the site create. At minimum one of:

- a WP REST nonce (`X-WP-Nonce` for `wp_rest`, or the Store API's `Nonce` header), so the call has to
  originate from a page the site itself rendered, exactly as WooCommerce's own classic checkout POST
  requires `woocommerce-process-checkout-nonce`; or
- a per-session/per-IP rate limit on `get_draft_order()` creating a NEW order and on the outbound
  PayPal `create_order()` call, of the kind WooCommerce applies to its own Store API checkout; or
- reuse of the session's existing draft order instead of creating a fresh one per request, so a loop
  costs one order rather than N.

## Actual

The route requires nothing but a non-empty cart in the caller's own session. Every request creates a
new WooCommerce order and a new live PayPal order under the platform's PayPal credentials, and the
request can be repeated without bound by a client that never renders a page.

Verified rather than assumed, by `PP-GST-05`, so that the report claims no more than it measured:

- the order created for an anonymous caller has `customer_id === 0` — a guest order, not an existing
  account's order; and
- its total matches that caller's own session cart total — the route does not build a payment from
  somebody else's basket; and
- the PayPal order id returned is the one stored on that newly created order, and the order id
  returned is newer than every order that existed before the call — no other customer's order,
  PayPal order or approval URL is disclosed.

So the impact is order-table and PayPal-order spam, plus the noise and cost that follows on the
PayPal side, not access to other customers' data.

## Suggested fix

Keep the cart as the scope of the payment and keep the route reachable by guests. Add proof that the
request came from the site's own checkout. Concretely, in `check_cart_permission()` — which has to
take the request object WordPress already passes to every `permission_callback`, i.e.
`public function check_cart_permission( $request )`:

```php
if ( ! wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' ) ) {
    return new WP_Error(
        'dokan_paypal_invalid_nonce',
        __( 'Your session has expired. Please reload the checkout and try again.', 'dokan' ),
        array( 'status' => rest_authorization_required_code() )
    );
}
```

A nonce does not break guest checkout: `wp_create_nonce( 'wp_rest' )` is issued to logged-out
visitors too, and the blocks integration already runs on a page WordPress rendered, so it has
`wpApiSettings.nonce` available — the client change is one header on its `fetch`. If a nonce is
judged too strict for the guest flow, a per-session/IP throttle on creating a NEW draft order (or
reusing the session's existing one) is the weaker alternative, but something has to bound it.

## Notes for whoever picks this up

- **`PP-GST-05` does not guard this finding, and it is not an expected failure.** An abuse limit
  cannot be measured by a single well-behaved request, and asserting that the route must answer
  `401`/`403` would declare guest checkout — a shipped, P0-tested feature — to be a defect, and
  would be red both before and after any fix, since a legitimate anonymous guest still receives a
  `200`. What `PP-GST-05` asserts instead is what must stay true while the route remains reachable:
  the payment is bound to customer `0`, to that caller's own session cart total, and to an order
  created by that very call, with no other customer's order id, PayPal order id or approval URL in
  the response. It passes today and turns red only if one of those bindings breaks.
- An E2E case for the fix would be the mirror image: with a nonce in place, a request carrying a
  valid `X-WP-Nonce` still succeeds for a guest (guest checkout is preserved) and the same request
  without the header is refused. That case is not written yet — writing it before the product side
  is decided would be writing a test for a design that does not exist.
- If the module team's verdict is that the current behaviour is acceptable — for instance because
  WooCommerce's own guest checkout is likewise reachable by a scripted client after one nonce
  fetch — record that verdict on this issue and close it. That is a legitimate outcome for a
  hardening report; nothing in the test suite will start failing as a result.
- The order-based routes are already guarded (`check_order_permission()`,
  `is_order_payable_by_current_customer()`, `PayPalController.php:195-260`). Any fix here should not
  disturb them; they are covered separately by the security spec.
