import { test, expect, request } from '@utils/test';
import { SERVER_URL, toPath } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
} from './helpers';

/**
 * Stripe Express — SE-WALLET (Payment Request / Express Checkout wallet element).
 *
 * IMPORTANT naming: the WALLET element (block express method `dokan_stripe_express_checkout`,
 * + the classic Payment Request button) is DISTINCT from the Express card gateway/Payment
 * Element (`dokan_stripe_express`). These tests assert the wallet surfaces RENDER (Stripe Link /
 * Apple-Google Pay container is present and mounts cleanly); they do NOT drive an OS-native
 * wallet sheet — that needs a real device + Stripe domain registration and stays deferred
 * (SE-WALLET-05).
 *
 * Serial because beforeAll flips the shared gateway `payment_request` master toggle + button
 * locations on (the shared configure helper only writes the card-gateway settings) and seeds the
 * connected vendor; afterAll restores. Every wallet surface self-skips without keys.
 */

// PRB markup output by PaymentRequest\Manager::render_payment_request_button (display:none until a
// real wallet is detected by JS — assert ATTACHED, not visible). Resolved from the module source.
const PRB_WRAPPER = '#dokan-stripe-express-payment-request-wrapper';
const PRB_BUTTON = '#dokan-stripe-express-payment-request-button';

// One serialized WC gateway option holds every Express setting (incl. the wallet toggle/locations).
const GATEWAY_SETTINGS_OPTION = 'woocommerce_dokan_stripe_express_settings';

// A classic ([woocommerce_cart] shortcode) cart page so the classic-cart PRB hook
// (`woocommerce_proceed_to_checkout`) fires — the block Cart does not emit that hook.
const CLASSIC_CART_SLUG = 'classic-cart';

/** Shallow-merge a patch into the serialized gateway settings option (replaces arrays wholesale). */
async function patchGatewaySettings(patch: Record<string, unknown>): Promise<void> {
    const settings = (await dbUtils.getOptionValue(GATEWAY_SETTINGS_OPTION)) as Record<string, unknown>;
    await dbUtils.setOptionValue(GATEWAY_SETTINGS_OPTION, { ...settings, ...patch });
}

/** Idempotently create a /classic-cart/ page with the [woocommerce_cart] shortcode (classic-hook PRB). */
async function ensureClassicCartPage(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wp/v2/pages?slug=${CLASSIC_CART_SLUG}&status=publish`);
        const pages = (await res.json().catch(() => [])) as unknown[];
        if (!Array.isArray(pages) || pages.length === 0) {
            await ctx.post(`${SERVER_URL}/wp/v2/pages`, {
                data: { title: 'Classic Cart', slug: CLASSIC_CART_SLUG, status: 'publish', content: '[woocommerce_cart]' },
            });
        }
    } finally {
        await ctx.dispose();
    }
}

test.describe.serial('Stripe Express — wallet / Express Checkout element @pro', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;
    let productPermalink: string;

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await ensureClassicCartPage();
        // The product's seller must be a CONNECTED Express vendor — the product-page PRB gate
        // checks Helper::is_seller_connected(). Seed vendor1 (the product author) as connected.
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        // Turn the wallet master toggle on + register every button location. Without this the
        // block Express element and the product/cart PRB never render (verify_gateway_env →
        // is_enabled() gate). Restored in afterAll.
        if (hasCredentials) {
            await patchGatewaySettings({ payment_request: 'yes', payment_request_button_locations: ['product', 'cart', 'checkout'] });
        }
        const api = new ApiUtils(await request.newContext());
        const [createdProduct, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Wallet Product' }, payloads.vendorAuth);
        productId = id;
        productPermalink = String(createdProduct?.permalink ?? '');
        await api.dispose();
    });

    test.afterAll(async () => {
        if (hasCredentials) {
            await patchGatewaySettings({ payment_request: 'no' });
        }
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // ---- SE-WALLET-01 — block Express Checkout / Link wallet element renders ----

    test('SE-WALLET-01: the Express Checkout / Link wallet element renders on block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the wallet element needs the publishable key');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout(false); // wallet-render test: keep Link/Express Checkout element
            // The wallet element (block express method dokan_stripe_express_checkout) is DISTINCT from
            // the card gateway/PE (dokan_stripe_express) — assert the wallet "Express Checkout" surface.
            await stripe.assertExpressCheckoutElementRenders();
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-WALLET-02 — product-page PRB container ----

    test('SE-WALLET-02: the Payment Request button container renders on the product page (location includes product)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the PRB needs the publishable key + payment_request enabled');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await page.goto(productPermalink || toPath(`?p=${productId}`));
            await page.waitForLoadState('domcontentloaded');
            // The PRB wrapper is output (display:none) on the product page when payment_request is on,
            // 'product' is a configured location and the seller is connected. JS only SHOWS it once a
            // real Apple/Google Pay wallet is available on the device — so assert it is ATTACHED.
            await expect(page.locator(PRB_BUTTON), 'the PRB container should be present on the product page').toBeAttached({ timeout: 25_000 });
            await expect(page.locator(PRB_WRAPPER), 'the PRB wrapper should be present on the product page').toBeAttached({ timeout: 25_000 });
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-WALLET-03 — cart-page PRB present when configured, absent when location unchecked ----

    test('SE-WALLET-03: the PRB renders on the cart when "cart" is a location and is absent when it is unchecked', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the PRB needs the publishable key + payment_request enabled');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await new StripeExpressPage(page).addProductToCart(productId);

            // Configured (beforeAll set locations to include 'cart') → the cart PRB container renders.
            await page.goto(toPath(CLASSIC_CART_SLUG));
            await page.waitForLoadState('domcontentloaded');
            await expect(page.locator(PRB_BUTTON), 'the PRB container should be present on the cart when "cart" is a location').toBeAttached({ timeout: 25_000 });

            // Negative: drop 'cart' from the locations → the cart PRB no longer renders. Always restore.
            try {
                await patchGatewaySettings({ payment_request_button_locations: ['product'] });
                await page.reload();
                await page.waitForLoadState('domcontentloaded');
                await expect(page.locator(PRB_WRAPPER), 'the PRB must be absent on the cart when "cart" is NOT a location').toHaveCount(0);
            } finally {
                await patchGatewaySettings({ payment_request_button_locations: ['product', 'cart', 'checkout'] });
            }
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-WALLET-04 — no console / cartData error when the wallet element mounts (BUG-9/10 analogue) ----

    test('SE-WALLET-04: the wallet element mounts with no cartData / Express-load console error', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the wallet element needs the publishable key');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on('pageerror', e => errors.push(String(e)));
        page.on('console', m => {
            if (m.type() === 'error') {
                errors.push(m.text());
            }
        });
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout(false); // wallet-render test: keep Link/Express Checkout element
            await stripe.assertExpressCheckoutElementRenders();
            // Let the Express Checkout element finish mounting (its onConfirm/cart wiring runs async).
            await page.waitForTimeout(4_000);
            // Regression guard: the wallet element must not throw an undeclared-cartData ReferenceError
            // nor fail to load. Scope to the meaningful crash signatures so unrelated third-party Stripe
            // console noise can't flake the guard (we are NOT weakening — these are the real failures).
            const fatal = errors.filter(e => /cartData is not defined|ReferenceError.*cartData|Failed to load Express Checkout Element/i.test(e));
            expect(fatal, `the wallet element must mount without a cartData/Express-load error (saw: ${JSON.stringify(errors.slice(0, 8))})`).toEqual([]);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-WALLET-05 — native Apple/Google Pay sheets (deferred) ----

    test('SE-WALLET-05: native Apple/Google Pay wallet sheets are deferred (documented skip)', { tag: ['@pro', '@customer'] }, async () => {
        log.skip('SE-WALLET-05: native Apple/Google Pay payment sheets need a real device + Stripe domain registration — not drivable in headless automation. Wallet-element RENDER is covered by SE-WALLET-01..04; the native sheet stays deferred.');
        test.skip(true, 'Native Apple/Google Pay wallet sheets require a real device + domain registration; render-only coverage lives in SE-WALLET-01..04.');
    });
});
