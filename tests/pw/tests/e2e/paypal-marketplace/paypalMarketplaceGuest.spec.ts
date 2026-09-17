import { PayPalMarketplaceGuestPage } from './paypalMarketplaceGuestPage';
import { test } from '@utils/test';

const guest = new PayPalMarketplaceGuestPage();

test.describe('PayPal Marketplace — guest checkout · PP-GST', () => {
    // Every happy path here places a real order, and `PayPal::process_payment()` makes a live
    // outbound call to PayPal to create the order before the response comes back.
    test.describe.configure({ timeout: 240_000 });

    test.beforeAll(async () => {
        await guest.setupAll();
    });

    test.afterAll(async () => {
        await guest.teardownAll();
    });

    // ---------------------------------------------------------------------
    // PP-GST-01 — a logged-out visitor is offered the gateway at checkout.
    // ---------------------------------------------------------------------
    test('PP-GST-01: a logged-out visitor holding a connected vendor product is offered PayPal Marketplace at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await guest.ppGst01({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-GST-02 — the guest order records the correct billing identity.
    // ---------------------------------------------------------------------
    test('PP-GST-02: a guest order is recorded against customer id 0 and keeps the billing email the visitor submitted', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await guest.ppGst02({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-GST-03 — guest-to-account creation preserves the order.
    // ---------------------------------------------------------------------
    test('PP-GST-03: a guest who ticks "create an account" keeps the order, attached to the new account', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await guest.ppGst03({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-GST-04 — guest order tracking is reachable.
    // ---------------------------------------------------------------------
    test('PP-GST-04: a guest can look their order up again through the order-tracking form', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await guest.ppGst04({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-GST-05 — what the cart create-payment route gives an anonymous caller.
    // ---------------------------------------------------------------------
    /*
     * PP-GST-05 — the security properties that are actually true, asserted so they stay true.
     *
     * What this case does NOT claim: that anonymous reachability is a defect. It is the shipped,
     * deliberate design of guest checkout. `woocommerce_enable_guest_checkout` is `yes` on this
     * site, PP-GST-01 (P0) asserts that a logged-out visitor IS offered this gateway, and
     * `check_cart_permission()` (REST/V1/PayPalController.php:81-96) calls `wc_load_cart()` with an
     * explicit comment that WooCommerce loads neither session nor cart on REST requests and both are
     * needed to build the order. A case asserting "the route must answer 401/403" would declare a
     * P0 feature to be a bug AND could never go green — a legitimate anonymous guest would still get
     * a 200 after any nonce or throttle the module might add. A test that can only ever be red
     * proves exactly as little as one that can only ever be green.
     *
     * What it DOES assert, because these are the properties whose loss would be a real incident:
     *   a. the payment an anonymous caller obtains is bound to customer 0 — a guest — and not to any
     *      logged-in user's account;
     *   b. it is bound to that caller's OWN session cart: the order total matches the total
     *      `wc/store/v1/cart` reports for the very same anonymous session, so the route cannot be
     *      reaching into another session's cart;
     *   c. it leaks no other customer's order: the WooCommerce order id it returns is newer than
     *      every order that existed before the call (so it was created BY this call rather than
     *      handed over from someone else), the PayPal order id it returns is the one stored on that
     *      new order, and any approval token in the redirect URL is that same PayPal order id.
     *
     * The three controls above the subject stay, and they are not decoration: without them a
     * refusal, or an empty-cart answer, would be a transport bug reported as a security property.
     *
     * The branch structure is exhaustive and every branch pins product output, so the case keeps a
     * meaning in the world where the module later adds a nonce or a throttle: in that world an
     * anonymous curl caller is refused, the refusal branch demands a recognisable authorization
     * code, and the case still passes — while a route that silently started attaching guest payments
     * to somebody's account, or building them from another basket, still goes red.
     *
     * The residual hardening finding — no nonce and no rate limit, so anonymous draft-order and live
     * PayPal-order creation is unbounded — is filed as
     * `bugs/paypal-cart-create-payment-authorises-on-cart-alone.md`. It is a resource-abuse report,
     * not an expected failure, and this case does not guard it: an abuse limit cannot be measured by
     * a single well-behaved request.
     */
    test('PP-GST-05: the cart create-payment route serves an anonymous caller only its own guest cart — customer 0, own cart total, no other customer\'s order', { tag: ['@pro', '@guest'] }, async () => {
        await guest.ppGst05();
    });
});
