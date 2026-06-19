import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, SERVER_URL, hasCredentials, ensureCustomerAddress } from './helpers';

/**
 * Suite E — Express Checkout Element (Stripe Link / wallets) on the WC block checkout.
 *
 * The coverage audit found ZERO Express coverage — the single biggest gap. Live
 * verification on localhost:9999 confirmed the block Express Checkout Element DOES
 * render (Stripe Link + Amazon Pay sandbox buttons inside Stripe iframes), so the
 * element-eligibility surface (manual case E1) is automatable even though the
 * OS-native Apple/Google Pay sheets (E4/E5) are not (they need a real device +
 * domain registration and stay deferred). This test asserts the Express element
 * mounts and exposes a Stripe payment frame — it does NOT drive a wallet sheet.
 */

const EXPRESS_BLOCK_WRAP = '.dokan-stripe-pe-express-block';

test.describe.serial('Stripe Connect — Suite E (Express Checkout element)', () => {
    test.describe.configure({ timeout: 120_000 });

    let productId: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        // A placeholder connected vendor is enough for the gateway + Express element to render
        // (the Express element is gated on the gateway being available, not on a real account).
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        productId = id;
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    test('E1: the Express Checkout element (Stripe Link / wallets) renders on block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — the Express element needs the publishable key');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();

            // 1) The Dokan Stripe Connect block Express wrapper mounts.
            const wrap = page.locator(EXPRESS_BLOCK_WRAP);
            await expect(wrap, 'the Stripe Connect block Express wrapper should mount').toBeAttached({ timeout: 30_000 });

            // 2) It renders the Stripe Express Checkout Element (Link / wallet buttons) inside a Stripe iframe.
            const expressIframe = wrap.locator('iframe').first();
            await expect(expressIframe, 'the Express element should render a Stripe iframe (Link / wallet buttons)').toBeAttached({ timeout: 30_000 });

            // 3) The WC block surfaces the "Express Checkout" heading when an express method is available.
            await expect(
                page.getByRole('heading', { name: /express checkout/i }),
                'the "Express Checkout" heading should be visible when the Express element is available',
            ).toBeVisible({ timeout: 15_000 });

            log.success('E1: Express Checkout element renders on block checkout (Stripe iframe present under the Express Checkout heading)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
