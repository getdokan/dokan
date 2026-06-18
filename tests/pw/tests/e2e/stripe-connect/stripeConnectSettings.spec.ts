import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CONNECT_KEYS, STRIPE_CONNECTED_ACCOUNTS, STRIPE_CARDS } from './stripeConnectPage';
import {
    adminAuth,
    vendorAuth,
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    ensureClassicCheckoutPage,
    getStripeChargeIdForOrder,
} from './helpers';

/**
 * Stripe Connect — settings-behaviour matrix.
 *
 * Exercises how the THREE global gateway switches change checkout/admin/vendor
 * behaviour, toggling ONE setting at a time via dbUtils.setStripeGatewaySetting
 * (a deep-merge into the serialized woocommerce_dokan-stripe-connect_settings
 * option so the saved test keys are never clobbered):
 *   S1  allow_non_connected_sellers OFF → a cart with a NON-connected vendor's
 *       product is BLOCKED at WC checkout validation.
 *   S2  allow_non_connected_sellers ON  → the same cart is ALLOWED → order
 *       received, the charge lands on the PLATFORM with NO vendor transfer.
 *   S3  enabled OFF                      → the gateway is dropped from the
 *       available payment methods at checkout (radio + PE mount absent).
 *   S4  test_client_id empty (almost-ready) → the Stripe Connect withdraw method
 *       and the vendor connect UI never render.
 *
 * CRITICAL TEARDOWN: S3 disables the gateway and S4 wipes the client id — both
 * GLOBAL settings. afterEach restores the full WORKING config after every test,
 * and afterAll restores it again + re-seeds VENDOR_ID as connected, so the other
 * Stripe Connect suites on the same worker/DB are never poisoned.
 */
test.describe.serial('Stripe Connect — settings-behaviour matrix', () => {
    test.describe.configure({ timeout: 180_000 }); // S2 does a real card charge through checkout

    // The non-connected vendor for S1/S2 (VENDOR2_ID); the connected vendor is VENDOR_ID.
    let nonConnectedProductId: string; // owned by VENDOR2_ID (non-connected)
    let connectedProductId: string; // owned by VENDOR_ID (connected) — for S3/S4

    /** Restore the full working gateway config + the connected vendor so no global toggle leaks. */
    async function restoreWorkingGatewayConfig(): Promise<void> {
        await dbUtils.setStripeGatewaySetting('enabled', 'yes');
        await dbUtils.setStripeGatewaySetting('allow_non_connected_sellers', 'no');
        await dbUtils.setStripeGatewaySetting('test_client_id', STRIPE_CONNECT_KEYS.clientId);
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
    }

    test.beforeAll(async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        await ensureClassicCheckoutPage();
        // Start from the known-good gateway config so every case toggles from the same baseline.
        await restoreWorkingGatewayConfig();
        // VENDOR2_ID is the NON-connected vendor for S1/S2 (this IS the "non-connected" primitive:
        // it deletes dokan_connected_vendor_id + _stripe_connect_access_key, the meta Validation keys on).
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);
        const api = new ApiUtils(await request.newContext());
        // Plain simple products — NOT a product_pack/advertisement (those early-return out of the
        // non-connected-seller validation block).
        [, nonConnectedProductId] = await api.createProduct(payloads.createProduct(), payloads.vendor2Auth);
        [, connectedProductId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    // Restore the working config after EVERY test so a failing case can't leak a
    // disabled gateway / empty client id into the next case or another suite.
    test.afterEach(async () => {
        if (!hasCredentials) {
            return;
        }
        await restoreWorkingGatewayConfig();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // Final restore of the full working gateway config + reconnect VENDOR_ID, then
        // drop VENDOR2_ID's (non-existent) connection to leave it as the suite found it.
        await restoreWorkingGatewayConfig();
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            if (nonConnectedProductId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${nonConnectedProductId}?force=true`);
            }
            if (connectedProductId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${connectedProductId}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
    });

    test('S1: allow_non_connected_sellers OFF → non-connected vendor cart is BLOCKED at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // Toggle ONE setting: allow_non_connected_sellers OFF (keys/enabled untouched).
        await dbUtils.setStripeGatewaySetting('allow_non_connected_sellers', 'no');
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID); // guarantee the vendor is non-connected

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(nonConnectedProductId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            // The gateway must be SELECTED — check_vendor_configure_stripe only runs when
            // the chosen method is dokan-stripe-connect. The gateway is still enabled+ready,
            // so the radio + Payment Element are available; only WC validation blocks the order.
            await stripe.selectClassicGateway();
            // The classic Payment Element validates the card CLIENT-SIDE on submit; fill a valid
            // card so the PE's own "card incomplete" error never fires, the WC form posts, and the
            // real SERVER-side non-connected-seller block runs (which is what this test proves).
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // Asserts the /enabled Stripe as a payment gateway/ error notice is visible and
            // that the order never reaches order-received (the server non-connected block).
            await stripe.assertCheckoutBlockedForNonConnectedVendor('classic');
            log.success('allow_non_connected_sellers OFF — non-connected vendor cart blocked at checkout with the expected error');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('S2: allow_non_connected_sellers ON → cart ALLOWED → charge on platform, no vendor transfer', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // Toggle ONE setting: allow_non_connected_sellers ON. Validation now returns early,
        // so the same non-connected-vendor cart sails through checkout.
        await dbUtils.setStripeGatewaySetting('allow_non_connected_sellers', 'yes');
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(nonConnectedProductId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            // No validation error should appear before placing the order.
            await expect(
                page.locator(stripe.checkout.error),
                'allow_non_connected_sellers ON must not block the non-connected vendor cart',
            ).toHaveCount(0);
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeClassicOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
            log.success('allow_non_connected_sellers ON — non-connected vendor cart reached order-received');
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // BEHAVIOUR: the non-connected vendor yields no split → funds stay on the PLATFORM and
        // NO Transfer::create lands. Assert the charge succeeded on the platform with zero transfers.
        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        const charge = await stripeApi.getCharge(chargeId);
        expect(charge.status, 'the platform charge succeeded').toBe('succeeded');
        expect(charge.amount_refunded, 'the charge was not refunded').toBe(0);
        await expect
            .poll(async () => (await stripeApi.transfersForCharge(chargeId)).length, {
                message: 'a non-connected vendor must NOT receive any Stripe transfer (charge stays on the platform)',
                timeout: 15_000,
            })
            .toBe(0);
        log.success(`Charge ${chargeId} settled on the platform with NO vendor transfer (non-connected vendor → no split)`);
    });

    test('S3: gateway enabled OFF → the Stripe Connect method is ABSENT at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // Connected vendor + product so the only variable is the enabled flag.
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        // Toggle ONE setting: enabled OFF → is_ready() false → is_available() false → WC drops the gateway.
        await dbUtils.setStripeGatewaySetting('enabled', 'no');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            // The block checkout is the site default; the radio + the Payment Element mount
            // must both be absent when the gateway is disabled.
            await stripe.assertGatewayAbsentAtCheckout('block');
            log.success('enabled OFF — the dokan-stripe-connect method is absent at block checkout');
        } finally {
            await page.close();
            await ctx.close();
        }
        // afterEach restores enabled:'yes' so downstream suites still see the gateway ready.
    });

    test('S4: almost-ready (no client id) → vendor connect UI + Stripe withdraw method ABSENT', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // Toggle ONE setting: clear the client id → get_client_id() '' → is_ready() false → the
        // withdraw method never registers and the vendor connect/manage UI never renders.
        await dbUtils.setStripeGatewaySetting('test_client_id', '');

        // (a) admin — the Stripe Connect withdraw-method toggle never registers.
        const aCtx = await browser.newContext({ storageState: adminAuth });
        const aPage = await aCtx.newPage();
        try {
            const stripeAdmin = new StripeConnectPage(aPage);
            await stripeAdmin.assertStripeWithdrawMethodAbsent();
            log.success('almost-ready (no client id) — Stripe Connect withdraw method is absent in admin Withdraw Options');
        } finally {
            await aPage.close();
            await aCtx.close();
        }

        // (b) vendor — the "Direct to Stripe Connect" menu link + connect button never render.
        const vCtx = await browser.newContext({ storageState: vendorAuth });
        const vPage = await vCtx.newPage();
        try {
            const stripeVendor = new StripeConnectPage(vPage);
            await stripeVendor.assertVendorConnectUiAbsent();
            log.success('almost-ready (no client id) — vendor Stripe Connect connect UI is absent');
        } finally {
            await vPage.close();
            await vCtx.close();
        }
        // afterEach restores the client id so downstream suites see the gateway ready again.
    });
});
