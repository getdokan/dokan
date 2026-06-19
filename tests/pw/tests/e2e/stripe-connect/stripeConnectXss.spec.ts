import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, SERVER_URL, hasCredentials, ensureCustomerAddress, setGatewayDescription } from './helpers';

/**
 * Suite N7 — stored XSS via the gateway DESCRIPTION at block checkout (R-xss).
 *
 * The block checkout renders the admin-controlled gateway description through React
 * dangerouslySetInnerHTML. An admin (or any actor who can set the description) can therefore
 * store markup that EXECUTES in every customer's browser at checkout. This test stores an
 * <img onerror> payload as the description and asserts it does NOT execute — the secure
 * behaviour (the description must be escaped / wp_kses_post-sanitised before rendering).
 *
 * CONFIRMED vulnerable on this build (live MCP check: window.__dokanXss was set), so the
 * assertion is wrapped in test.fail() — it runs the path and pins the bug (PASS while the
 * XSS fires, FLIPS to a real failure once the description is sanitised). Assertion NOT weakened.
 */
const NORMAL_DESC = 'Pay with your credit card via Stripe.';
const XSS_PAYLOAD = '<img src=x onerror="window.__dokanXss=1">Pay with card';

test.describe.serial('Stripe Connect — Suite N7 (stored XSS in the block gateway description)', () => {
    test.describe.configure({ timeout: 90_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await setGatewayDescription(XSS_PAYLOAD);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // ALWAYS restore the benign description so the payload can't poison other checkout specs on this worker.
        await setGatewayDescription(NORMAL_DESC);
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    test('N7: a script payload in the gateway description must NOT execute at block checkout (stored XSS)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.fail(true, 'R-xss: the block checkout renders the admin gateway description via dangerouslySetInnerHTML UNescaped → stored XSS. Expected-fail until the description is sanitised (wp_kses_post / escaped). See bugs-found.md.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway(); // renders the gateway description (where the payload lives)
            await page.waitForTimeout(2_500);  // give the <img onerror> a chance to fire if the markup is live

            const xssExecuted = await page.evaluate(() => Boolean((window as unknown as { __dokanXss?: unknown }).__dokanXss));
            expect(
                xssExecuted,
                'the gateway description must be escaped — a stored <img onerror> payload must NOT execute at block checkout',
            ).toBe(false);
            log.success('N7: gateway description payload did not execute (description is sanitised)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
