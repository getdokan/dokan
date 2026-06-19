import { test, expect, request, Page, BrowserContext } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, hasCredentials, getStripeIntentIdForOrder, ensureCustomerAddress, ensureClassicCheckoutPage } from './helpers';

declare const process: { env: Record<string, string | undefined> };

// dbUtils encapsulates the table prefix internally; the suite-local token-cleanup
// query needs it too, so read it the same way dbUtils does (default 'wp').
const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/**
 * Suite F — Saved Cards (dokan-stripe-connect).
 *
 * Buyer = the LOGGED-IN customer (customerAuth): WC payment-token rows are keyed
 * by user_id and Stripe save-card is gated on is_user_logged_in(), so guest
 * checkout never tokenizes. Serial because F1 SAVES a card at block checkout that
 * F2–F5 then reuse (list / charge off-session / set-default / detach). A fresh
 * browser context per test (closed in finally) keeps state isolated; the DB token
 * + the Stripe customer's attached PaymentMethod carry the state across tests.
 *
 * Stripe is the source of truth throughout: the stored token's `pm_…` value is
 * cross-checked against the live Stripe Customer's PaymentMethods, the
 * off-session charge's PaymentIntent, the customer's default_payment_method, and
 * (after delete) the detached PaymentMethod.
 */
test.describe.serial('Stripe Connect — saved cards (my-account payment methods)', () => {
    test.describe.configure({ timeout: 180_000 }); // real card entry + Stripe confirm/redirect is slow (cold CI first attempt)

    let productId: string;
    // Captured in F1 from the DB token row; reused by F3/F4/F5 as the Stripe truth anchor.
    let savedPmId = '';

    /** The customer's Stripe customer id (cus_…), written to user meta on the first save-card purchase. */
    async function getStripeCustomerId(): Promise<string> {
        const custId = await dbUtils.getUserMetaValue(CUSTOMER_ID, 'dokan_stripe_customer_id');
        expect(custId, 'customer should have a dokan_stripe_customer_id user meta after saving a card').toBeTruthy();
        return custId as string;
    }

    /** Resolve the single stored dokan-stripe-connect pm_ token row for the customer (asserts exactly one expected shape). */
    async function getStoredPmToken(): Promise<{ token_id: number; token: string; last4: string; brand: string }> {
        const tokens = await dbUtils.getCustomerPaymentTokens(CUSTOMER_ID, 'dokan-stripe-connect');
        const pmToken = tokens.find(t => /^pm_/.test(t.token) && t.type === 'dokan_stripe_connect_dynamic_payment_method');
        expect(pmToken, "a dokan-stripe-connect 'pm_' token row should be stored for the customer").toBeTruthy();
        return pmToken as { token_id: number; token: string; last4: string; brand: string };
    }

    /** Delete ALL of the customer's saved payment tokens + their meta directly (re-run hygiene). */
    async function purgeCustomerTokens(): Promise<void> {
        const ids = (await dbUtils.getCustomerPaymentTokens(CUSTOMER_ID, 'dokan-stripe-connect')).map(t => t.token_id);
        for (const id of ids) {
            await dbUtils.dbQuery(`DELETE FROM ${DB_PREFIX}_woocommerce_payment_tokenmeta WHERE payment_token_id = ?;`, [id]);
        }
        await dbUtils.dbQuery(`DELETE FROM ${DB_PREFIX}_woocommerce_payment_tokens WHERE user_id = ? AND gateway_id = ?;`, [
            String(CUSTOMER_ID),
            'dokan-stripe-connect',
        ]);
    }

    test.beforeAll(async () => {
        // Skip-gated suites must not mutate the site for tests that won't run.
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress(); // block + classic checkout pre-fill
        await ensureClassicCheckoutPage(); // [woocommerce_checkout] page for the F3 saved-token radios
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        // A purchasable connected-vendor product so the gateway is available at checkout.
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        // Clean slate so F1 asserts a freshly-saved card (and last4 4242 isn't a stale leftover).
        await purgeCustomerTokens();
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        // Delete any saved tokens still left (e.g. if F5 didn't run) so re-runs / other
        // suites on the same worker start clean — the Stripe-side detach happens in F5.
        await purgeCustomerTokens();
    });

    // F-block-save (GATEWAY BUG, documented — not executed): block-checkout "save card" stores a token whose
    // Stripe PaymentMethod is NEVER attached (PI setup_future_usage=null → post-confirm attach rejected → swallowed,
    // token saved anyway). modules/stripe/includes/Processors/IntentProcessor.php:374-394. See bugs-found.md.
    test('F-block-save (gateway bug): saving a card at block checkout should ATTACH the pm on Stripe — expected-fail guard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // CONFIRMED bug (IntentProcessor.php:374-394): block-checkout "save card" writes the WC token but its Stripe
        // pm is NEVER attached (block PI has setup_future_usage=null → post-confirm attach is rejected + swallowed),
        // so the saved card is unusable off-session. The assertion below asserts the CORRECT behaviour (pm attached);
        // test.fail() runs it as an EXPECTED FAILURE so CI executes the save path and pins the bug. Assertion NOT weakened.
        test.fail(true, 'Block-save no-attach: token saved but Stripe pm never attached (setup_future_usage=null) — see bugs-found.md');
        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.tickSaveCardBlock();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }
        const pmToken = await getStoredPmToken();
        const custId = await getStripeCustomerId();
        const pms = await stripeApi.listCustomerPaymentMethods(custId, 'card');
        expect(pms.some(p => p.id === pmToken.token), 'block-saved pm should be attached to the customer').toBe(true);
    });

    // F1 — save a card via My Account → Add payment method. This SetupIntent flow
    // ATTACHES the pm on Stripe (confirmSetup → finalise_add_payment_method) and
    // writes a DynamicPaymentMethod token row — the working save path (no order).
    test('F1: save a card via My Account → token stored + pm ATTACHED on Stripe', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addCardViaMyAccount(STRIPE_CARDS.success);
            log.success('Customer saved a card via My Account → Add payment method (SetupIntent)');
        } finally {
            await page.close();
            await ctx.close();
        }
        const pmToken = await getStoredPmToken();
        expect(pmToken.token, "stored token value is a Stripe PaymentMethod id (pm_…)").toMatch(/^pm_/);
        expect(pmToken.last4, 'stored token last4').toBe('4242');
        expect(pmToken.brand.toLowerCase(), 'stored token brand is Visa').toBe('visa');
        savedPmId = pmToken.token;
        const custId = await getStripeCustomerId();
        // The SetupIntent attaches the pm to the customer ASYNCHRONOUSLY; on a cold CI runner the attach
        // can lag the redirect back to /payment-methods/, so poll the customer's pms until it appears.
        const findPm = async () => (await stripeApi.listCustomerPaymentMethods(custId, 'card')).find(p => p.id === savedPmId);
        await expect
            .poll(async () => Boolean(await findPm()), {
                message: 'the stored pm should attach to the Stripe customer (SetupIntent path)',
                timeout: 25_000,
            })
            .toBe(true);
        const pm = await findPm();
        expect(pm, 'the stored pm should be attached to the Stripe customer (SetupIntent path)').toBeTruthy();
        expect(pm.card?.last4, 'attached pm card.last4').toBe('4242');
        expect(pm.customer, 'attached pm is owned by the customer').toBe(custId);
        log.success(`Saved card tokenized + attached: ${savedPmId} on customer ${custId}`);
    });

    // F2 — the saved card shows on /my-account/payment-methods/ as "Visa ending in 4242".
    test('F2: saved card appears at my-account › payment methods', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!savedPmId, 'F1 did not store a card — nothing to list');
        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            await stripe.assertSavedCardListed('4242'); // method cell "Visa ending in 4242"
            log.success('Saved card is listed at my-account › payment methods (ending in 4242)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // F3 — pay a NEW order with the saved token (radio) on CLASSIC checkout: no card
    // entry → server routes through TokenProcessor (off-session confirm on the pm_).
    test('F3: pay a new order using the saved token on classic checkout (off-session)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!savedPmId, 'F1 did not store a card — no saved token to charge');
        let orderId: string | undefined;
        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            // Saved-token flow: the new-card PE stays hidden while a stored token is selected,
            // so skip the PE-mount wait (it would time out).
            await stripe.selectClassicGateway({ expectPaymentElement: false });
            await stripe.selectSavedTokenClassic(); // pick the stored token radio (NOT "new") — no card iframe entry
            await stripe.placeClassicOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
            log.success('Customer paid a new order with the saved token — order received (no card entry)');
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // (2) Order settled to a paid status.
        const api = new ApiUtils(await request.newContext());
        await expect
            .poll(
                async () => {
                    const [, o] = await api.getSingleOrder(orderId as string, payloads.adminAuth);
                    return o.status as string;
                },
                { message: 'the saved-token order should settle to a paid status', timeout: 60_000 },
            )
            .toMatch(/processing|completed/);

        // (3) STRIPE TRUTH — the off-session PaymentIntent succeeded on the stored pm.
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        expect(pi.status, 'the saved-token PaymentIntent should have succeeded').toBe('succeeded');
        const piPm = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
        expect(piPm, 'the PaymentIntent charged the stored saved pm').toBe(savedPmId);
        log.success(`Saved-token order charged off-session — PaymentIntent ${intentId} succeeded on ${savedPmId}`);
    });

    // F4 — set the saved card as default → Stripe customer's
    // invoice_settings.default_payment_method updates to the pm.
    test('F4: set the saved card as default → Stripe default_payment_method updates', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!savedPmId, 'F1 did not store a card — nothing to set as default');
        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            await stripe.setSavedCardDefault(); // clicks "Make default", asserts the row gains default-payment-method
            log.success('Saved card set as default in the UI (row carries default-payment-method)');
        } finally {
            await page.close();
            await ctx.close();
        }

        // STRIPE TRUTH — set-default propagated to the customer's invoice settings.
        const custId = await getStripeCustomerId();
        await expect
            .poll(async () => (await stripeApi.getCustomer(custId)).invoice_settings?.default_payment_method, {
                message: "Stripe customer's invoice_settings.default_payment_method should be the saved pm",
                timeout: 20_000,
            })
            .toBe(savedPmId);
        log.success(`Stripe customer ${custId} default_payment_method is now ${savedPmId}`);
    });

    // F5 — delete the saved card → token row gone in the UI/DB AND the
    // PaymentMethod is DETACHED on Stripe (pm.customer becomes null).
    test('F5: delete the saved card → row gone + PaymentMethod detached on Stripe', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!savedPmId, 'F1 did not store a card — nothing to delete');
        // Capture the pm id from the DB BEFORE deletion (the row is removed by the delete).
        const pmToDelete = (await getStoredPmToken()).token;
        expect(pmToDelete, 'the pm to delete is the F1-saved pm').toBe(savedPmId);

        const ctx: BrowserContext = await browser.newContext({ storageState: customerAuth });
        const page: Page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            await stripe.deleteSavedCard(); // nonce route → woocommerce_payment_token_deleted → Stripe detach
            await stripe.assertSavedCardAbsent('4242'); // row gone in the UI
            log.success('Saved card deleted — no longer listed at my-account › payment methods');
        } finally {
            await page.close();
            await ctx.close();
        }

        // (1) DB — no dokan-stripe-connect token rows remain.
        expect(
            (await dbUtils.getCustomerPaymentTokens(CUSTOMER_ID, 'dokan-stripe-connect')).length,
            'no saved-card token rows should remain after delete',
        ).toBe(0);

        // (2) STRIPE DETACH TRUTH (primary) — the PaymentMethod still exists but is detached (customer === null).
        await expect
            .poll(async () => (await stripeApi.getPaymentMethod(pmToDelete)).customer, {
                message: 'the deleted PaymentMethod should be detached on Stripe (customer === null)',
                timeout: 20_000,
            })
            .toBeNull();

        // …and it no longer shows among the customer's attached PaymentMethods.
        const custId = await getStripeCustomerId();
        const pms = await stripeApi.listCustomerPaymentMethods(custId, 'card');
        expect(pms.some(p => p.id === pmToDelete), 'the detached pm should be gone from the customer payment-methods list').toBe(false);
        log.success(`PaymentMethod ${pmToDelete} detached on Stripe (customer null) and removed from customer ${custId}`);
    });
});
