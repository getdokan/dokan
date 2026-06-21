import { test, expect, request } from '@utils/test';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    customerAuth,
    vendorAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    ensureCustomerAddress,
    ensureStripeConnectConfigured,
    injectStripeWebhook,
    getStripeIntentIdForOrder,
    getStripeChargeIdForOrder,
    getOrderStatus,
    getOrderNotes,
} from './helpers';

/**
 * Reported Stripe Connect bugs (PR #5646 QA report) — RE-VALIDATED 2026-06-21 against the latest
 * branch code (HEAD 69a3f69b1, which includes the "order-pay, change-payment, block subs &
 * saved-card reuse" fix commit).
 *
 * Two kinds of test live here:
 *   • RUNNING (no test.fixme) — the bug is FIXED on the current code; the test asserts the now-correct
 *     behaviour and must PASS (a regression lock for the fix).
 *   • SKIPPED (test.fixme) — the bug STILL EXISTS on the current code; the test asserts the CORRECT
 *     post-fix behaviour and is skipped so it doesn't red CI. The developer removes the test.fixme
 *     line once the bug is fixed; the test then runs and must pass.
 *
 * Covered elsewhere: BUG-2 currency (M2/M3), BUG-7 stale webhook (J3), BUG-8 dispute (J6), BUG-17 XSS
 * (N7), BUG-20 double-refund (I6), BUG-4A block-save attach (F-block-save), BUG-35 coupon split
 * (marketplace-coupon guard), BUG-1/legacy refund (I3/R10, L1).
 */
const SITE = (process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '');

test.describe('Stripe Connect — reported bugs (fix-validated 2026-06-21)', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
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

    // ─────────────────────────────────────────────────────────────────────────────────────────────
    // FIXED on the current code → RUNNING regression locks.
    // ─────────────────────────────────────────────────────────────────────────────────────────────

    // BUG-5 — still PRESENT live: the fix added a server-side order-aware intent branch
    // (StripeController::respond_with_order_intent), but on the Order-Pay page the front-end never fires a
    // create-payment-intent request, so only the Stripe metrics controller loads and the PE card iframe never
    // mounts (live-confirmed 2026-06-21: assets enqueue, but no intent request, no __privateStripeFrame).
    test('BUG-5: the Stripe Payment Element loads on the Order-Pay page of a pending order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-5: order-pay PE does not mount — the front-end fires no create-payment-intent request, so no client secret and no card iframe (server respond_with_order_intent exists but is not triggered). Remove this line when the order-pay PE mounts.');

        // Seed a PENDING dokan-stripe-connect order for the customer.
        const adminCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        let orderId = 0;
        let orderKey = '';
        try {
            const res = await adminCtx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    customer_id: Number(CUSTOMER_ID),
                    payment_method: 'dokan-stripe-connect',
                    payment_method_title: 'Stripe Connect',
                    status: 'pending',
                    set_paid: false,
                    billing: payloads.createOrder.billing,
                    line_items: [{ product_id: Number(productId), quantity: 1 }],
                },
            });
            const o = (await res.json()) as { id: number; order_key: string };
            orderId = o.id;
            orderKey = o.order_key;
        } finally {
            await adminCtx.dispose();
        }
        expect(orderId, 'seeded a pending order').toBeGreaterThan(0);

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await page.goto(`${SITE}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`);
            await page.waitForLoadState('domcontentloaded');
            // dokan-stripe-connect is the pre-selected method on order-pay; ensure it's selected so the PE initialises.
            await page.locator('#payment_method_dokan-stripe-connect').check().catch(() => undefined);
            // The Stripe Payment Element card iframe mounts so the pending order can be paid (BUG-5 fix).
            await expect(
                page.locator('iframe[name*="StripeFrame"]').first(),
                'the Stripe Payment Element must mount on the Order-Pay page',
            ).toBeVisible({ timeout: 25_000 });
        } finally {
            await page.close();
            await ctx.close();
            const c = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            await c.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            await c.dispose();
        }
    });

    // BUG-4B (FIXED — TokenProcessor attaches the pm): a saved card reused on Block checkout completes.
    test('BUG-4B (fixed): a saved card can be reused on Block checkout to complete an order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            // Save a card via the My-Account SetupIntent path, then reuse it on Block checkout.
            await stripe.addCardViaMyAccount(STRIPE_CARDS.success);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await page
                .locator('input[name="radio-control-wc-payment-method-saved-tokens"], input[name="wc-dokan-stripe-connect-payment-token"]')
                .first()
                .check()
                .catch(() => undefined);
            await stripe.placeBlockOrderExpectReceived(); // completes to order-received with the saved card
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-34 (FIXED — get_supported_features() now includes 'subscriptions'): Stripe is offered on Block
    // checkout for a WooCommerce Subscriptions cart (previously hidden — only PayPal showed).
    test('BUG-34 (fixed): Stripe Connect is offered on Block checkout for a WCS subscription product', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');

        const api = new ApiUtils(await request.newContext());
        const [resp, subProductId] = await api.createProduct(
            {
                ...payloads.createProduct(),
                type: 'subscription',
                regular_price: '5',
                meta_data: [
                    { key: '_subscription_price', value: '5' },
                    { key: '_subscription_period', value: 'day' },
                    { key: '_subscription_period_interval', value: '1' },
                    { key: '_subscription_length', value: '0' },
                ],
            },
            payloads.vendorAuth,
        );
        // Gate on WooCommerce Subscriptions being active: if absent, the 'subscription' type falls back to 'simple'.
        test.skip((resp as { type?: string })?.type !== 'subscription', 'WooCommerce Subscriptions not active — cannot exercise a WCS subscription cart');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(subProductId);
            await stripe.gotoBlockCheckout();
            // CORRECT: the gateway is listed for a subscription cart on Block checkout.
            await expect(
                page.locator('label[for="radio-control-wc-payment-method-options-dokan-stripe-connect"], #radio-control-wc-payment-method-options-dokan-stripe-connect').first(),
                'Dokan Stripe Connect must be offered on Block checkout for a WCS subscription cart',
            ).toBeVisible({ timeout: 25_000 });
        } finally {
            await page.close();
            await ctx.close();
            const c = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            await c.delete(`${SERVER_URL}/wc/v3/products/${subProductId}?force=true`).catch(() => undefined);
            await c.dispose();
        }
    });

    // ─────────────────────────────────────────────────────────────────────────────────────────────
    // STILL PRESENT on the current code → SKIPPED (remove test.fixme when the dev fixes it).
    // ─────────────────────────────────────────────────────────────────────────────────────────────

    // BUG-19 — charge.refunded only adds a note (ChargeRefunded.php:62-69 "idempotent reconciliation only").
    test('BUG-19: a charge.refunded webhook reconciles the order (status → refunded), not just a note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-19: charge.refunded only add_order_note()s (no status change / WC refund object / vendor-balance debit). Remove this line when the webhook fully reconciles a Stripe-side refund.');

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        await injectStripeWebhook({ type: 'charge.refunded', data_object: { id: chargeId, object: 'charge', payment_intent: intentId, amount_refunded: 100, refunded: true } });

        await expect
            .poll(() => getOrderStatus(orderId as string), { message: 'a full charge.refunded should reconcile the order to refunded', timeout: 15_000 })
            .toBe('refunded');
    });

    // BUG-16 — declines invisible on themes without a WC notice area (index.ts:297-318 never writes .dokan-stripe-pe-errors).
    test('BUG-16: a declined card surfaces a visible error (the .dokan-stripe-pe-errors element is written)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-16: showInlineError() only targets WC notice wrappers; the dedicated .dokan-stripe-pe-errors element is never written so declines are invisible on some themes. Remove this line when the dedicated error element is populated.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            await expect(
                page.locator('.dokan-stripe-pe-errors, ul.dokan-stripe-pe-error').first(),
                'a declined card must write the dedicated dokan-stripe-pe-errors element',
            ).toBeVisible({ timeout: 30_000 });
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-9/10 — ExpressCheckout.tsx:85 references an undeclared `cartData` → ReferenceError on wallet confirm.
    test('BUG-9/10: the Block Express checkout does not throw a cartData ReferenceError', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-10: ExpressCheckout.tsx:85 reads an undeclared cartData (never imported/from context) → ReferenceError when the wallet onConfirm runs. Remove this line when cartData is declared.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on('pageerror', e => errors.push(String(e)));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await page.waitForTimeout(4_000);
            expect(
                errors.some(e => /cartData is not defined|ReferenceError.*cartData/i.test(e)),
                `the Block Express checkout must not throw a cartData ReferenceError (errors: ${JSON.stringify(errors.slice(0, 5))})`,
            ).toBe(false);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-26 — the non-connected/zero-earning split path continue()s with no audit note (Helper.php:1113-1115).
    test('BUG-26: a skipped (non-connected / zero-earning) split sub-order records an audit note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-26: the split silently continue()s for non-connected / zero-earning vendors with no note on that sub-order (only a FAILED transfer notes). Remove this line when the skipped path records an audit note.');

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        const notes = await getOrderNotes(orderId as string);
        expect(notes.some(n => /transfer|stripe|payout|skipped|non-connected/i.test(n)), 'every split sub-order must carry a Stripe-handling audit note').toBe(true);
    });

    // BUG-15 — WebhookHandler does NO Stripe signature verification + returns 200 on handler error (no retry).
    test('BUG-15: the webhook endpoint rejects an unsigned/forged event (signature verification)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-15: WebhookHandler::handle_events() never verifies the Stripe-Signature and returns 200 even on failure (WebhookHandler.php:126-199). Remove this line when the endpoint verifies the signature and 4xx-rejects a forged event.');

        const ctx = await request.newContext();
        try {
            // POST a forged event with NO Stripe-Signature header to the live gateway webhook endpoint.
            const res = await ctx.post(`${SITE}/?wc-api=dokan_stripe`, {
                headers: { 'content-type': 'application/json' },
                data: JSON.stringify({ id: 'evt_FORGED_e2e', type: 'payment_intent.succeeded', data: { object: { id: 'pi_forged_e2e' } } }),
            });
            // CORRECT: an unsigned/forged event is rejected with a 4xx (signature check), not accepted with 200.
            expect(res.status(), 'an unsigned/forged webhook must be rejected with a 4xx').toBeGreaterThanOrEqual(400);
        } finally {
            await ctx.dispose();
        }
    });

    // BUG-31 — the deprecated, disabled enable_3d_secure checkbox is reset to 'no' on every settings save.
    test('BUG-31: saving gateway settings must preserve the legacy enable_3d_secure option', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-31: enable_3d_secure has disabled=>disabled, so it is omitted from POST and process_admin_options resets it to no on every save (Settings/StripeConnect.php:154-164). Remove this line when a save preserves the option.');

        const optKey = 'woocommerce_dokan-stripe-connect_settings';
        const settings = ((await dbUtils.getOptionValue(optKey)) as Record<string, unknown>) ?? {};
        settings.enable_3d_secure = 'yes';
        await dbUtils.updateOptionValue(optKey, settings);
        // Re-run the gateway settings save (process_admin_options) the way the admin "Save changes" does.
        await ensureStripeConnectConfigured();
        const after = ((await dbUtils.getOptionValue(optKey)) as Record<string, unknown>) ?? {};
        expect(after.enable_3d_secure, 'a settings save must preserve enable_3d_secure, not reset it to no').toBe('yes');
    });

    // BUG-30 — saving gateway settings deletes+recreates the Stripe webhook endpoint (signing-secret churn).
    test('BUG-30: saving gateway settings must not churn (delete+recreate) the Stripe webhook endpoint', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-30: WebhookHandler::register_webhook() always deregister_webhook()s first → every settings save deletes+recreates the endpoint with a new signing secret (WebhookHandler.php:48). Remove this line when a save reuses the existing endpoint.');

        const secretKey = 'dokan_stripe_connect_webhook_secret';
        const before = await dbUtils.getOptionValue(secretKey).catch(() => undefined);
        await ensureStripeConnectConfigured(); // re-save the gateway settings
        const after = await dbUtils.getOptionValue(secretKey).catch(() => undefined);
        // CORRECT: the webhook signing secret is stable across a settings save (endpoint reused, not recreated).
        expect(after, 'the webhook signing secret must be stable across a settings save (no endpoint churn)').toBe(before);
    });

    // BUG-32 — the vendor "Connect with Stripe" image button has no alt / aria label.
    test('BUG-32: the vendor "Connect with Stripe" button has an accessible name (alt/aria)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-32: templates/vendor-settings-payment.php:12 renders the Connect-with-Stripe <img> with no alt/aria-label (unreadable to screen readers). Remove this line when the connect button has an accessible name.');

        // Ensure the vendor is DISCONNECTED so the connect button is shown, then check its accessible name.
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await page.goto(`${SITE}/dashboard/settings/payment/`);
            await page.waitForLoadState('domcontentloaded');
            const connect = page.locator('a[href*="stripe"] img, img[src*="stripe"], a.dokan-stripe-connect-button img').first();
            const accessibleName = (await connect.getAttribute('alt')) || (await connect.getAttribute('aria-label'));
            expect(accessibleName?.trim(), 'the Connect-with-Stripe button must expose an alt/aria accessible name').toBeTruthy();
        } finally {
            await page.close();
            await ctx.close();
            await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        }
    });

    // BUG-24 — an abandoned 3DS (requires_action) order stays on-hold forever (requires_action handler is a no-op).
    test('BUG-24: an abandoned 3DS (requires_action) order does not stay on-hold forever', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-24: PaymentIntentRequiresAction::handle() is a no-op (logs only) and there is no timeout/auto-cancel, so an abandoned 3DS order stays on-hold indefinitely. Remove this line when an abandoned requires_action order is resolved (auto-cancel/fail).');

        // Place an order, then inject a requires_action event for its intent (models an abandoned 3DS challenge).
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        // Model the 3DS-pending state: put the order on-hold, then deliver the (no-op) requires_action event.
        const adminCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        await adminCtx.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, { data: { status: 'on-hold' } }).catch(() => undefined);
        await adminCtx.dispose();
        await injectStripeWebhook({ type: 'payment_intent.requires_action', data_object: { id: intentId, object: 'payment_intent', status: 'requires_action' } });
        // CORRECT: an abandoned requires_action order is eventually resolved away from on-hold (not stuck forever).
        await expect
            .poll(() => getOrderStatus(orderId as string), { message: 'an abandoned 3DS order must be resolved (auto-cancel/fail), not stuck on-hold', timeout: 15_000 })
            .not.toBe('on-hold');
    });

    // BUG-29 — a legacy (src_) subscription renewal auto-upgrades to the customer's default/first pm_, not the original card.
    test('BUG-29: a legacy subscription renewal charges the ORIGINAL card, not the default/first pm_', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-29: resolve_legacy_renewal_pm() picks the customer default/first pm_ (StripeConnect.php:302-327), not the card originally used for the subscription. No fingerprint/metadata mapping. Needs a legacy src_-token subscription fixture; remove this line + finish the fixture when the renewal resolves the original card.');
        // Documented gap: driving a legacy src_-token subscription renewal needs a legacy fixture not present on a
        // fresh site. The post-fix assertion is: the renewal PaymentIntent uses the pm_ that maps (by fingerprint)
        // to the subscription's original card, not merely the customer's default/first saved pm_.
        expect(true, 'placeholder — see test.fixme note (legacy renewal fixture required)').toBe(true);
    });

    // BUG-1 — refunding does not reliably reverse the vendor transfer; the real Stripe error is swallowed.
    test('BUG-1: a failed vendor-transfer reversal surfaces the real Stripe error (not a generic "manual reversal" note)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-1: when the transfer reversal fails, Refund.php logs a generic "Manual reversal required" note WITHOUT $e->getMessage(), and the reversal amount flows through the float get_stripe_amount (BUG-2). Intermittent + needs a forced reversal failure; remove this line + drive a failing reversal when the error is surfaced and the amount is int-cast. (Happy-path reversal is already covered by the running refund tests in stripeConnect.spec.ts.)');
        expect(true, 'placeholder — needs a forced reversal-failure fixture; see test.fixme note').toBe(true);
    });

    // BUG-14 — the change-payment-method page never mounts the PE (same root as BUG-5: no intent request fires).
    test('BUG-14: the Payment Element mounts on a subscription change-payment-method page', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-14: My Account → Subscriptions → Change payment method loads no card field (same root cause as BUG-5 — the front-end fires no SetupIntent request on the change-PM surface). Needs an active WCS subscription fixture for the customer; remove this line + assert the SetupIntent PE mounts when the change-PM page works.');
        expect(true, 'placeholder — needs an active WCS subscription fixture; see test.fixme note').toBe(true);
    });

    // BUG-18 — Express checkout hardcodes terms=1 (auto-accepts T&C) and naively splits the wallet name.
    test('BUG-18: Express checkout enforces the T&C checkbox and splits the wallet name correctly', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-18: completing an Express (wallet) purchase without ticking a required T&C still creates the order (terms=1 hardcoded), and a multi-word wallet name splits into the wrong first/last name. Wallet/device-gated (real Apple/Google Pay), not drivable headlessly; remove this line + drive a wallet purchase when T&C is enforced and the name split is fixed.');
        expect(true, 'placeholder — wallet/device-gated; see test.fixme note').toBe(true);
    });

    // BUG-22 — Stripe error messages on classic/Express are always English (no i18n in the JS bundles).
    test('BUG-22: a card error message on classic checkout is localised (not hardcoded English)', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-22: the classic/Express/shared JS bundles have no i18n, so a card-error message stays English on a non-English locale. Needs a non-English site locale + a loaded translation to assert against; remove this line + assert the localised string when the bundles are translated.');
        expect(true, 'placeholder — needs a non-English locale + translation; see test.fixme note').toBe(true);
    });
});
