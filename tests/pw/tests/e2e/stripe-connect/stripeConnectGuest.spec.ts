import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, SERVER_URL, hasCredentials } from './helpers';

/**
 * Suite C2/D2 — GUEST checkout via Stripe Connect (block).
 *
 * The audit found every checkout test runs as a logged-in customer (customerAuth) — a guest
 * paying via Stripe Connect was never exercised. This runs a fresh context with NO storageState
 * (a true guest, empty session cart), fills the block contact + address, pays with a real card,
 * and asserts the order completes as a GUEST order (customer_id 0) paid via the gateway.
 */
test.describe.serial('Stripe Connect — Suite C2/D2 (guest checkout)', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // A connected-vendor product to buy. Guest checkout itself needs no saved address.
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    test('C2/D2: a guest can buy via Stripe Connect on block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        // NO storageState → a real guest with a fresh, empty session cart.
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({
                email: 'guest.stripeconnect@example.com',
                firstName: 'Guest',
                lastName: 'Buyer',
                address: '123 Test Street',
                city: 'New York',
                state: 'NY',
                postcode: '10001',
                country: 'US',
            });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'guest reached order-received').toBeTruthy();

        // The order is a GUEST order (customer_id 0) paid via the Stripe Connect gateway.
        const ctx2 = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx2.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=status,payment_method,customer_id,billing`);
            const o = (await res.json()) as { status: string; payment_method: string; customer_id: number; billing: { email: string } };
            expect(o.payment_method, 'guest order paid via the Stripe Connect gateway').toBe('dokan-stripe-connect');
            expect(o.status, 'guest order should settle to a paid status').toMatch(/processing|completed/);
            expect(o.customer_id, 'order was placed as a GUEST (customer_id 0)').toBe(0);
            expect(o.billing?.email, 'guest billing email was captured').toBe('guest.stripeconnect@example.com');
        } finally {
            await ctx2.dispose();
        }
        log.success(`C2/D2: guest bought via Stripe Connect → guest order ${orderId} settled`);
    });
});
