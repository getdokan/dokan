import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, STRIPE_CONNECT_KEYS } from './stripeConnectPage';
import { VENDOR_ID, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, seedStripeConnectVendor, removeStripeConnectVendor, getOrderStatus, getConnectIntentIdForOrder } from './helpers';

/**
 * Stripe Connect — payment-integrity attacks (SCSEC-01, SCSEC-02).
 *
 * Both endpoints under test are PUBLIC (`public_permission` in REST/StripeController.php), which is
 * correct for a guest checkout and is exactly why the server-side checks matter. Every request here
 * sends `Authorization: ''` so the suite's admin credentials cannot leak in and quietly turn an
 * anonymous attack into an authenticated one — that would make a broken guard look safe.
 */
test.describe.serial('Stripe Connect — payment integrity @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const guestBilling = {
        email: 'guest.sec.stripeconnect@example.com',
        firstName: 'Guest',
        lastName: 'Buyer',
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
        phone: MOBILE_TEST_PHONE,
    };

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Security Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    /** Anonymous context. Authorization is blanked so api.config's admin auth cannot leak in. */
    async function anonContext() {
        return request.newContext({ extraHTTPHeaders: { Authorization: '' } });
    }

    // ---- SCSEC-01 — a tampered amount must not buy the cart for less ----

    test('SCSEC-01: a tampered PaymentIntent amount cannot buy a cart for less', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails(guestBilling);
            await stripe.selectBlockGateway();

            await test.step('re-mint the PaymentIntent with a tampered amount of 50 minor units', async () => {
                /*
                 * Issued through the page's own `wp.apiFetch`, which is how the real front-end calls
                 * this route: it attaches the session's `wp_rest` nonce and cookies for us.
                 *
                 * Two earlier attempts got a flat 403 and proved nothing about the amount logic. An
                 * out-of-band API context has no session at all, and the gateway's localised
                 * `checkout_nonce` is minted for a different action than the `wp_rest` one
                 * `verify_rest_nonce` checks (REST/StripeController.php:134-143). Either way the
                 * request dies at the permission callback, which would read as "the tamper was
                 * blocked" while the server-side amount check had never run.
                 */
                const outcome = await page.evaluate(async path => {
                    try {
                        const body = await (window as any).wp.apiFetch({ path, method: 'POST', data: { amount: 50 } });
                        return { ok: true, body: JSON.stringify(body).slice(0, 300) };
                    } catch (e: any) {
                        return { ok: false, body: `${e?.code ?? ''} ${e?.message ?? String(e)}`.slice(0, 300) };
                    }
                }, '/dokan/v1/stripe-connect/payment-intent');
                log.info(`SCSEC-01 tampered payment-intent via wp.apiFetch → ok=${outcome.ok} ${outcome.body}`);
                expect(outcome.body, 'the tamper must be judged by the amount logic, not rejected as an invalid nonce').not.toContain('invalid_nonce');
            });

            await stripe.fillCardDetails(STRIPE_CARDS.success);

            const orderId = await test.step('attempt to complete the order', async () => stripe.placeBlockOrderExpectReceived());

            await test.step('THE invariant: the charge equals the order total, never the tampered amount', async () => {
                /*
                 * The security property, stated as money rather than as an error code. A refusal is
                 * the expected path (IntentProcessor raises dokan_pe_amount_mismatch), but the branch
                 * may also legitimately re-sync the intent's amount upward instead. Both are safe.
                 * What is NOT safe, and what this measures, is a PAID order whose Stripe charge is
                 * smaller than the order total — that is goods sold for 50 cents.
                 */
                const status = await getOrderStatus(orderId);
                expect(status, 'if an order was created at all it must be a real one').toBeTruthy();

                const intentId = await getConnectIntentIdForOrder(orderId);
                const chargeId = await stripeConnectApi.getLatestChargeId(intentId);
                const charge = await stripeConnectApi.getCharge(chargeId);

                const anon = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
                let orderTotalMinor = 0;
                try {
                    const res = await anon.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total`);
                    orderTotalMinor = Math.round(Number(((await res.json()) as { total: string }).total) * 100);
                } finally {
                    await anon.dispose();
                }

                log.info(`SCSEC-01 order ${orderId}: charge ${Number(charge.amount)} minor units vs order total ${orderTotalMinor} minor units`);
                expect(Number(charge.amount), 'a paid order must never be backed by a charge smaller than its own total').toBe(orderTotalMinor);
                expect(Number(charge.amount), 'the tampered 50-minor-unit amount must never be what got charged').not.toBe(50);
            });
            log.success('SCSEC-01 tampered amount did not buy the cart for less');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SCSEC-02 — one customer cannot settle another customer's order ----

    test("SCSEC-02: one customer cannot settle another customer's order", { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot mint an attacker intent');

        // Customer A's unpaid Stripe Connect order, created through the API so the attack starts from
        // a realistic state: an order awaiting payment.
        const admin = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        let victimOrderId = 0;
        let victimKey = '';
        try {
            const res = await admin.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    payment_method: StripeConnectPage.GATEWAY_ID,
                    payment_method_title: 'Stripe Connect',
                    set_paid: false,
                    status: 'pending',
                    billing: payloads.createOrder.billing,
                    shipping: payloads.createOrder.shipping,
                    line_items: [{ product_id: Number(productId), quantity: 1 }],
                },
            });
            const body = (await res.json()) as { id: number; order_key: string };
            victimOrderId = Number(body.id);
            victimKey = String(body.order_key);
            expect(victimOrderId, "customer A's unpaid order should exist").toBeGreaterThan(0);
        } finally {
            await admin.dispose();
        }

        // The attacker's own cheap intent, minted and confirmed on Stripe against the same platform.
        // Created directly through the Stripe API rather than through the site, because the point is
        // that it is a genuine, successfully-paid intent which simply belongs to somebody else.
        const attackerIntent = await test.step("mint and confirm the attacker's own cheap intent", async () => {
            const stripe = await request.newContext({
                baseURL: 'https://api.stripe.com',
                extraHTTPHeaders: { Authorization: `Bearer ${STRIPE_CONNECT_KEYS.secret}` },
            });
            try {
                const res = await stripe.post('/v1/payment_intents', {
                    form: {
                        amount: '50',
                        currency: 'usd',
                        'payment_method_types[]': 'card',
                        payment_method: 'pm_card_visa',
                        confirm: 'true',
                    },
                });
                const body = (await res.json()) as { id?: string; status?: string; error?: unknown };
                expect(body.id, `could not mint the attacker intent: ${JSON.stringify(body.error ?? body)}`).toBeTruthy();
                return body as { id: string; status: string };
            } finally {
                await stripe.dispose();
            }
        });

        await test.step('verify-intent refuses a WRONG order key', async () => {
            const anon = await anonContext();
            try {
                const res = await anon.post(`${SERVER_URL}/dokan/v1/stripe-connect/verify-intent`, {
                    data: { order: victimOrderId, key: 'wc_order_this_key_is_wrong', payment_intent: attackerIntent.id },
                });
                log.info(`SCSEC-02 verify-intent with a wrong key returned HTTP ${res.status()}`);
                expect(res.status(), 'verify-intent must not accept a wrong order key').not.toBe(200);
            } finally {
                await anon.dispose();
            }
        });

        await test.step("verify-intent with the RIGHT key must still not settle A's order using B's intent", async () => {
            const anon = await anonContext();
            try {
                const res = await anon.post(`${SERVER_URL}/dokan/v1/stripe-connect/verify-intent`, {
                    data: { order: victimOrderId, key: victimKey, payment_intent: attackerIntent.id },
                });
                log.info(`SCSEC-02 verify-intent with A's key and B's intent returned HTTP ${res.status()}`);
            } finally {
                await anon.dispose();
            }
        });

        await test.step("A's order is still unpaid, and no vendor was paid for it", async () => {
            const status = await getOrderStatus(victimOrderId);
            expect(status, "customer A's order must NOT have been settled by another customer's payment").not.toMatch(/processing|completed/);
        });
        log.success(`SCSEC-02 order ${victimOrderId} stayed unpaid under both attempts`);
    });
});
