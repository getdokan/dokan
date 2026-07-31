import { test, expect, request } from '@utils/test';
import { BASE_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    vendorAuth,
    VENDOR_ID,
    VENDOR2_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureVendorStoreAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
} from './helpers';

/**
 * Stripe Express — vendor onboarding (SE-ONB).
 *
 * Hosted Account-Links onboarding from the vendor dashboard
 * (`settings/payment-manage-dokan_stripe_express`). Serial because every test
 * toggles the SHARED vendor1 connection state (seed → connected UI, remove →
 * Connect button), so they must not interleave on one worker.
 *
 * The connect/disconnect UI only renders when the gateway is API-ready, so the
 * UI cases gate on `hasCredentials`. SE-ONB-02 deliberately hits the EXTERNAL
 * Stripe-hosted onboarding URL (commit-only redirect assert). The security case
 * (SE-ONB-10/11) is deterministic and needs no keys — it drives a logged-out
 * admin-ajax POST and asserts the signup is rejected.
 */
test.describe.serial('Stripe Express — vendor onboarding @pro', () => {
    test.describe.configure({ timeout: 150_000 });

    // admin-ajax endpoint that backs the Express hosted-onboarding signup.
    const ADMIN_AJAX_URL = `${BASE_URL.replace(/\/$/, '')}/wp-admin/admin-ajax.php`;
    const SIGNUP_ACTION = 'dokan_stripe_express_vendor_signup';

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        // The Connect button only renders when the vendor's store address has a supported country.
        await ensureVendorStoreAddress(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR2_ID);
    });

    test.afterAll(async () => {
        // Restore the unconnected state so later workers / re-runs start clean.
        await removeStripeExpressConnectedVendor(VENDOR_ID);
    });

    // ---- SE-ONB-01: not-connected vendor sees the Connect button ----
    test('SE-ONB-01: a not-connected vendor sees the Connect button', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the onboarding UI only renders when the gateway is API-ready');
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertVendorNotConnectedUI();
            log.success('SE-ONB-01: not-connected vendor renders the Connect button');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-ONB-02: clicking Connect redirects to the Stripe-hosted onboarding URL ----
    test('SE-ONB-02: clicking Connect redirects to a Stripe-hosted onboarding URL', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — Connect POSTs vendor_signup and hits the external Stripe Account-Link');
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            // commit-only: the destination is Stripe-hosted (connect.stripe.com), not automatable past redirect.
            await new StripeExpressPage(page).clickConnectExpectStripeRedirect();
            expect(page.url(), 'Connect should redirect the vendor to a Stripe-hosted onboarding URL').toMatch(/stripe\.com/);
            log.success('SE-ONB-02: Connect redirected to the Stripe-hosted onboarding flow');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-ONB-04: a seeded-connected vendor shows the connected UI ----
    test('SE-ONB-04: a seeded-connected vendor shows the connected UI (Disconnect + Visit Dashboard)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the onboarding UI only renders when the gateway is API-ready');
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertVendorConnectedUI();
            log.success('SE-ONB-04: seeded-connected vendor renders the connected UI');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-ONB-05: vendor disconnects from the dashboard → Connect button returns ----
    test('SE-ONB-05: a connected vendor disconnects from the dashboard → not-connected UI returns', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the onboarding UI only renders when the gateway is API-ready');
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            // Precondition: the seeded vendor sees the connected UI.
            await stripe.assertVendorConnectedUI();
            // Act: click Disconnect (POST dokan_stripe_express_vendor_disconnect → trash).
            await stripe.disconnectVendorViaDashboard();
            // The dashboard returns to the not-connected state (Connect button back).
            await stripe.assertVendorNotConnectedUI();
            log.success('SE-ONB-05: vendor self-disconnect restored the Connect button');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-ONB-10 / SE-ONB-11: onboarding signup AJAX rejects a logged-out, bad-nonce, foreign-seller POST ----
    test('SE-ONB-10/11: logged-out vendor_signup with a bad nonce + foreign seller_id is rejected (nonce/cap + IDOR)', { tag: ['@pro', '@vendor'] }, async () => {
        // Deterministic — needs NO Stripe keys. A logged-out caller has neither the
        // dokan_stripe_express_vendor_payment_settings nonce nor the dokan_manage_withdraw cap,
        // and the foreign seller_id models the IDOR attempt (vendor A onboarding vendor B).
        // Authorization forced to '' so an api-config admin-auth leak cannot apply.
        const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
        try {
            const res = await ctx.post(ADMIN_AJAX_URL, {
                form: {
                    action: SIGNUP_ACTION,
                    seller_id: VENDOR2_ID, // foreign vendor (IDOR target)
                    nonce: 'forged-nonce',
                    _wpnonce: 'forged-nonce',
                    security: 'forged-nonce',
                },
            });
            const status = res.status();
            const body = await res.text();
            const trimmed = body.trim();

            // A rejected admin-ajax signup manifests as one of: an HTTP error status, the
            // bare WP failure tokens ('-1' nonce-fail / '0' no-handler), or a JSON error.
            const rejected =
                status >= 400 ||
                trimmed === '-1' ||
                trimmed === '0' ||
                body.includes('"success":false');

            expect(rejected, `logged-out vendor_signup must be rejected (status=${status}, body=${trimmed.slice(0, 160)})`).toBeTruthy();
            // It must NOT have produced a Stripe onboarding link or reported success.
            expect(body, 'a rejected signup must not return a Stripe-hosted onboarding URL').not.toContain('connect.stripe.com');
            expect(body, 'a rejected signup must not report success').not.toContain('"success":true');

            log.success('SE-ONB-10/11: logged-out, bad-nonce, foreign-seller signup was rejected with no onboarding URL');
        } finally {
            await ctx.dispose();
        }
    });
});
