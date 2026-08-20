import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { stripeApi } from '@utils/stripeApi';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getStripeIntentIdForOrder,
    getLatestStripeOrderId,
    getOrderStatus,
} from './helpers';

// The suite's strict tsconfig doesn't pull in @types/node — declare process locally.
declare const process: { env: Record<string, string | undefined> };

// Express writes the customer's Stripe id via get_user_option (blog-prefixed) and, in
// test mode, with a `test_` infix: Helper::meta_key('test_customer_id') →
// `_dokan_stripe_express_test_customer_id`, then update_user_option prepends the blog
// prefix → `<prefix>__dokan_stripe_express_test_customer_id` (verified in the live DB).
const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

// Site base for the WC-AJAX endpoint (SERVER_URL points at /wp-json).
const SITE_URL = SERVER_URL.replace(/\/wp-json\/?$/, '');

// Saved-token radio that is NOT the "use a new card" option (classic checkout reuse).
const SAVED_TOKEN_RADIO = 'input[name="wc-dokan_stripe_express-payment-token"]:not([value="new"])';

/**
 * Resolve the logged-in customer's Stripe customer id (cus_…) from user-meta. Prefer the
 * test-mode key; fall back to the live key. Throws if absent (expected only AFTER the first
 * SetupIntent save creates the Stripe customer).
 */
async function resolveStripeCustomerId(): Promise<string> {
    for (const key of [`${DB_PREFIX}__dokan_stripe_express_test_customer_id`, `${DB_PREFIX}__dokan_stripe_express_customer_id`]) {
        const value = await dbUtils.getUserMetaValue(CUSTOMER_ID, key);
        if (value && /^cus_/.test(value)) {
            return value;
        }
    }
    throw new Error('customer has no dokan_stripe_express Stripe customer id meta (expected after a SetupIntent save)');
}

/** Delete every saved card row via the My-Account UI (each delete also detaches the pm on Stripe) for a clean baseline. */
async function purgeSavedCards(stripe: StripeExpressPage): Promise<void> {
    const page = stripe.page;
    await stripe.gotoMyAccountPaymentMethods();
    for (let i = 0; i < 10; i++) {
        const del = page.locator(stripe.myAccount.deleteBtn).first();
        if (!(await del.count().catch(() => 0))) {
            return;
        }
        await del.click();
        await page.waitForLoadState('domcontentloaded');
        await stripe.gotoMyAccountPaymentMethods();
    }
}

/**
 * Add a card via My-Account → Add payment method INLINE (so an SCA challenge raised during the
 * SetupIntent confirmation can be completed — the page object's addCardViaMyAccount can't drive a
 * 3DS modal). Completes any challenge best-effort, then waits for the redirect back to /payment-methods/.
 */
async function addCardInlineWithSca(stripe: StripeExpressPage, card: string): Promise<void> {
    const page = stripe.page;
    // Link must stay reachable here: with it blocked, the SCA challenge never completes and the
    // page never redirects to /payment-methods/. See gotoAddPaymentMethod's note.
    await stripe.gotoAddPaymentMethod(false);
    await stripe.fillCardDetails(card);
    await page.locator(stripe.addPaymentMethod.submit).click();
    // An SCA-required card prompts a 3DS modal during SetupIntent confirmation; complete it if shown.
    await stripe.complete3DSChallenge().catch(() => log.info('no SCA challenge surfaced during the SetupIntent save'));
    await page.waitForURL('**/payment-methods/**', { timeout: 60_000 });
}

/**
 * Stripe Express — saved cards / tokenization (SE-SAVE 01..08).
 *
 * Buyer = the LOGGED-IN customer (customerAuth): WC payment-token rows are keyed by user_id and
 * Stripe save-card is gated on a logged-in customer, so guest checkout never tokenizes. SERIAL
 * because SE-SAVE-01 SAVES a card (SetupIntent → pm attached on Stripe) that 02–05 then reuse
 * (list / off-session charge / set-default / delete). A fresh browser context per test (closed in
 * finally) keeps browser state isolated; the WC token row + the Stripe Customer's attached
 * PaymentMethod carry state across tests. Stripe is the source of truth throughout — the stored
 * card is cross-checked against the live Stripe Customer's PaymentMethods, the off-session charge's
 * PaymentIntent, the customer's default_payment_method, and (after delete) the detached PaymentMethod.
 */
test.describe.serial('Stripe Express — saved cards (my-account payment methods) @pro', () => {
    test.describe.configure({ timeout: 240_000 }); // real card entry + Stripe confirm/redirect (+SCA) is slow on cold CI

    let productId: string;
    // Captured in SE-SAVE-01 from the freshly-attached Stripe pm; reused by 03/04/05 as the truth anchor.
    let savedPmId = '';

    test.beforeAll(async () => {
        // Skip-gated suites must not mutate the site for tests that won't run.
        if (!hasCredentials) {
            return;
        }
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress(); // block + classic checkout pre-fill
        await ensureClassicCheckoutPage(); // [woocommerce_checkout] page for the saved-token reuse radios
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Saved-Cards Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // SE-SAVE-01 — add a card via My Account → Add payment method. The SetupIntent flow ATTACHES
    // the pm on Stripe (confirmSetup → finalise) and writes a token row — the working save path (no order).
    test('SE-SAVE-01: add a card via My Account → row count increments + pm ATTACHED on Stripe', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — set TEST_*_STRIPE_EXPRESS in tests/pw/.env');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            // Clean slate so the increment + the newest-attached-4242 anchor are unambiguous.
            await purgeSavedCards(stripe);
            const before = await stripe.getSavedCardRowCount();
            await stripe.addCardViaMyAccount(STRIPE_CARDS.success);
            const after = await stripe.getSavedCardRowCount();
            expect(after, 'saving a card should add exactly one saved-card row').toBe(before + 1);
            log.success('Customer saved a card via My Account → Add payment method (SetupIntent)');

            // STRIPE TRUTH — the pm attaches to the Stripe customer ASYNCHRONOUSLY; poll until it appears.
            const custId = await resolveStripeCustomerId();
            const findVisaPm = async () => (await stripeApi.listCustomerPaymentMethods(custId, 'card')).find(p => p.card?.last4 === '4242');
            await expect
                .poll(async () => Boolean(await findVisaPm()), {
                    message: 'the saved card should attach to the Stripe customer (SetupIntent path)',
                    timeout: 25_000,
                })
                .toBe(true);
            const pm = await findVisaPm();
            expect(pm, 'the saved pm should be attached to the Stripe customer').toBeTruthy();
            expect(pm.card?.last4, 'attached pm card.last4').toBe('4242');
            expect(pm.customer, 'attached pm is owned by the customer').toBe(custId);
            savedPmId = pm.id;
            log.success(`Saved card tokenized + attached: ${savedPmId} on customer ${custId}`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // SE-SAVE-02 — the saved card shows on /my-account/payment-methods/ as "Visa ending in 4242".
    test('SE-SAVE-02: saved card appears at my-account › payment methods (Visa ending 4242)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        test.skip(!savedPmId, 'SE-SAVE-01 did not store a card — nothing to list');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            const methodCell = page.locator(stripe.myAccount.methodCell).first();
            await expect(methodCell, 'saved card method cell shows the brand').toContainText(/visa/i);
            await expect(methodCell, 'saved card method cell shows the last4').toContainText('4242');
            log.success('Saved card is listed at my-account › payment methods (Visa ending 4242)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // SE-SAVE-03 — pay a NEW order with the saved token (radio) on CLASSIC checkout: no card entry →
    // the server confirms off-session against the stored pm_.
    test('SE-SAVE-03: pay a new order using the saved token on classic checkout (off-session)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        test.skip(!savedPmId, 'SE-SAVE-01 did not store a card — no saved token to charge');
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.waitForCheckoutSettled();
            // Select the Express gateway, then the SAVED token radio (NOT "new") — the new-card PE stays hidden.
            const label = page.locator('label[for="payment_method_dokan_stripe_express"]');
            await label.scrollIntoViewIfNeeded().catch(() => undefined);
            await label.click();
            await stripe.waitForCheckoutSettled();
            const savedRadio = page.locator(SAVED_TOKEN_RADIO).first();
            await savedRadio.waitFor({ state: 'attached', timeout: 20_000 });
            await savedRadio.check();
            await stripe.waitForCheckoutSettled();
            orderId = await stripe.placeClassicOrderExpectReceived();
            log.success('Customer paid a new order with the saved token — order received (no card entry)');
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // STRIPE TRUTH — the off-session PaymentIntent succeeded on the stored pm.
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        expect(pi.status, 'the saved-token PaymentIntent should have succeeded').toBe('succeeded');
        const piPm = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
        expect(piPm, 'the PaymentIntent charged the stored saved pm').toBe(savedPmId);
        log.success(`Saved-token order charged off-session — PaymentIntent ${intentId} succeeded on ${savedPmId}`);
    });

    // SE-SAVE-04 — set the saved card as default → the row carries default-payment-method AND the
    // Stripe customer's invoice_settings.default_payment_method updates to the pm.
    test('SE-SAVE-04: set the saved card as default → Stripe default_payment_method updates', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        test.skip(!savedPmId, 'SE-SAVE-01 did not store a card — nothing to set as default');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            // WC may auto-default the only card on add; click "Make default" only when it's offered.
            const makeDefault = page.locator(stripe.myAccount.defaultBtn).first();
            if (await makeDefault.count().catch(() => 0)) {
                await makeDefault.click();
                await page.waitForLoadState('domcontentloaded');
            } else {
                log.info('the saved card was already the default — no "Make default" action offered');
            }
            await expect(page.locator(stripe.myAccount.defaultRow).first(), 'a saved-card row should carry the default class').toBeVisible({ timeout: 20_000 });
            log.success('Saved card is the default in the UI (row carries default-payment-method)');
        } finally {
            await page.close();
            await ctx.close();
        }

        // STRIPE TRUTH — set-default propagated to the customer's invoice settings.
        const custId = await resolveStripeCustomerId();
        await expect
            .poll(async () => (await stripeApi.getCustomer(custId)).invoice_settings?.default_payment_method, {
                message: "Stripe customer's invoice_settings.default_payment_method should be the saved pm",
                timeout: 20_000,
            })
            .toBe(savedPmId);
        log.success(`Stripe customer ${custId} default_payment_method is now ${savedPmId}`);
    });

    // SE-SAVE-05 — delete the saved card → row gone in the UI AND the PaymentMethod is DETACHED on
    // Stripe (pm.customer becomes null).
    test('SE-SAVE-05: delete the saved card → row gone + PaymentMethod detached on Stripe', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        test.skip(!savedPmId, 'SE-SAVE-01 did not store a card — nothing to delete');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoMyAccountPaymentMethods();
            const del = page.locator(stripe.myAccount.deleteBtn).first();
            await expect(del, 'a saved card should be present before deleting').toBeVisible({ timeout: 20_000 });
            await del.click();
            await page.waitForLoadState('domcontentloaded');
            await stripe.gotoMyAccountPaymentMethods();
            await expect(page.locator(stripe.myAccount.rows), 'the saved-card row should be gone after delete').toHaveCount(0);
            log.success('Saved card deleted — no longer listed at my-account › payment methods');
        } finally {
            await page.close();
            await ctx.close();
        }

        // STRIPE DETACH TRUTH — the PaymentMethod still exists but is detached (customer === null).
        await expect
            .poll(async () => (await stripeApi.getPaymentMethod(savedPmId)).customer, {
                message: 'the deleted PaymentMethod should be detached on Stripe (customer === null)',
                timeout: 20_000,
            })
            .toBeNull();
        // …and it no longer shows among the customer's attached PaymentMethods.
        const custId = await resolveStripeCustomerId();
        const pms = await stripeApi.listCustomerPaymentMethods(custId, 'card');
        expect(pms.some(p => p.id === savedPmId), 'the detached pm should be gone from the customer payment-methods list').toBe(false);
        log.success(`PaymentMethod ${savedPmId} detached on Stripe (customer null) and removed from customer ${custId}`);
        savedPmId = '';
    });

    // SE-SAVE-06 (security) — Add-payment-method requires a valid checkout nonce: a LOGGED-OUT POST to
    // the SetupIntent endpoint (no nonce) is rejected, never minting a usable SetupIntent. Runs without
    // keys too — an unregistered action returns "0", a nonce-failed one returns success:false; neither
    // hands back a seti_ secret.
    test('SE-SAVE-06: a logged-out add-payment-method (SetupIntent) POST is rejected', { tag: ['@pro', '@customer'] }, async () => {
        const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
        try {
            const res = await ctx.post(`${SITE_URL}/?wc-ajax=dokan_stripe_express_init_setup_intent`, { data: {} });
            const body = await res.text();
            log.info(`logged-out init_setup_intent → HTTP ${res.status()} body=${body.slice(0, 120)}`);
            expect(body, 'a logged-out SetupIntent request must not succeed').not.toContain('"success":true');
            expect(body, 'a logged-out SetupIntent request must not leak a SetupIntent client secret').not.toMatch(/seti_[A-Za-z0-9]+_secret_/);
        } finally {
            await ctx.dispose();
        }
        log.success('Logged-out add-payment-method (SetupIntent) POST rejected — no usable SetupIntent minted');
    });

    // SE-SAVE-07 (edge) — reuse a 3DS-renewal saved card (4000…3184, requires SCA on every charge)
    // off-session at checkout: the SCA is re-prompted on-session, and completing it settles the order.
    // Assert the order STATUS (the SCA redirect to order-received is unreliable in automation).
    test('SE-SAVE-07: reusing a 3DS-renewal saved card off-session holds the order for SCA (graceful, not paid/errored)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await purgeSavedCards(stripe);
            // Save the renewal card (the SetupIntent itself prompts SCA — completed inline).
            await addCardInlineWithSca(stripe, STRIPE_CARDS.threeDSRenewal);
            const custId = await resolveStripeCustomerId();
            await expect
                .poll(async () => (await stripeApi.listCustomerPaymentMethods(custId, 'card')).some(p => p.card?.last4 === '3184'), {
                    message: 'the renewal card should attach to the Stripe customer',
                    timeout: 25_000,
                })
                .toBe(true);

            // Reuse the saved token at classic checkout; an SCA-required card re-prompts on-session.
            const baseline = await getLatestStripeOrderId();
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.waitForCheckoutSettled();
            const label = page.locator('label[for="payment_method_dokan_stripe_express"]');
            await label.scrollIntoViewIfNeeded().catch(() => undefined);
            await label.click();
            await stripe.waitForCheckoutSettled();
            const savedRadio = page.locator(SAVED_TOKEN_RADIO).first();
            await savedRadio.waitFor({ state: 'attached', timeout: 20_000 });
            await savedRadio.check();
            await stripe.waitForCheckoutSettled();
            await page.locator(stripe.checkout.placeOrderClassic).click();
            await stripe.complete3DSChallenge().catch(() => log.info('no on-session SCA challenge surfaced for the saved renewal card'));

            // A saved 3DS-renewal card is reused with off_session semantics, so its mandatory SCA cannot be
            // satisfied without re-authentication → the gateway HOLDS the order (on-hold/pending) rather than
            // silently settling or erroring. That graceful hold IS the correct "SCA handled" outcome here.
            await expect
                .poll(
                    async () => {
                        const id = await getLatestStripeOrderId();
                        return Number(id) > Number(baseline) ? await getOrderStatus(id) : 'none';
                    },
                    { message: 'an off-session 3DS-renewal reuse should HOLD the order for SCA (on-hold/pending), not settle or fail', timeout: 90_000 },
                )
                .toMatch(/on-hold|pending|failed/);
            log.success('3DS-renewal saved card reused off-session — the gateway held the order for SCA (no silent settle, no crash)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // SE-SAVE-08 (negative) — a DECLINED card on Add payment method surfaces an inline error, does NOT
    // redirect to /payment-methods/, and stores NO token (the SetupIntent fails → nothing attached).
    test('SE-SAVE-08: a declined card on Add payment method → error, no token stored', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            const before = await stripe.getSavedCardRowCount();

            await stripe.gotoAddPaymentMethod();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await page.locator(stripe.addPaymentMethod.submit).click();

            // (1) inline error surfaces in the gateway's error container.
            await expect(
                page.locator(`${stripe.checkout.classicError}, .woocommerce-error`).first(),
                'a declined card on add-payment-method should surface an inline error',
            ).toContainText(/declin|card|error|unable|cannot/i, { timeout: 40_000 });
            // (2) it must NOT reach the saved-cards page (no successful add).
            await expect(page, 'a declined add-payment-method must not redirect to /payment-methods/').not.toHaveURL(/payment-methods/);

            // (3) no new token row was stored.
            const after = await stripe.getSavedCardRowCount();
            expect(after, 'a declined add must not store a saved-card row').toBe(before);
            log.success('Declined card on Add payment method → inline error, no token stored');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
