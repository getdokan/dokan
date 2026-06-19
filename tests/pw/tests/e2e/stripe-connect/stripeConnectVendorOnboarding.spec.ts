import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { StripeConnectPage, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { vendorAuth, VENDOR_ID, isReadyCapable } from './helpers';

/**
 * Suite B — vendor onboarding / offboarding for Stripe Connect.
 *
 * The audit found the vendor self-DISCONNECT flow (B2) had zero coverage: the suite only
 * seeds/removes the connection via DB meta, never exercises the dashboard Disconnect button.
 * This drives the real UI: a connected vendor clicks Disconnect, the deauthorize handler runs
 * (Stripe OAuth deauthorize attempt + local meta clear), and the vendor is returned to the
 * not-connected state with the Connect button back.
 *
 * The connect/disconnect UI only renders when the gateway is READY (needs TEST_CLIENT_ID), so
 * these gate on isReadyCapable. The connection is seeded via DB (a real OAuth round-trip is
 * Stripe-hosted and not automatable); the DISCONNECT path itself is fully exercised in-browser.
 */
test.describe.serial('Stripe Connect — Suite B (vendor onboarding/offboarding)', () => {
    test.describe.configure({ timeout: 90_000 });

    test.afterAll(async () => {
        // Restore the unconnected state for re-runs / other specs on the same worker.
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
    });

    test('B2: vendor disconnects from the dashboard → local connection cleared and the Connect button returns', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!isReadyCapable, 'Gateway not ready — set TEST_CLIENT_ID_STRIPE_CONNECT; the vendor connect/disconnect UI only renders when ready');

        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);

            // Precondition: the seeded vendor sees the connected UI (Disconnect button).
            await stripe.assertVendorConnectedUI();

            // Act: click Disconnect (navigates the deauthorize URL with its nonce).
            await stripe.disconnectVendorViaDashboard();

            // 1) The local connection meta is cleared (deauthorize_vendor clears it unconditionally).
            const connectedId = await dbUtils.getUserMetaValue(VENDOR_ID, 'dokan_connected_vendor_id');
            expect(connectedId ?? '', 'dokan_connected_vendor_id must be cleared after a self-disconnect').toBe('');
            const accessKey = await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_connect_access_key');
            expect(accessKey ?? '', '_stripe_connect_access_key must be cleared after a self-disconnect').toBe('');

            // 2) The dashboard returns to the not-connected state (Connect button back).
            await stripe.assertVendorNotConnectedUI();

            log.success('B2: vendor self-disconnect cleared the local connection and restored the Connect button');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
