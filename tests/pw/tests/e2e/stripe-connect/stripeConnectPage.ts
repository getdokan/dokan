import { Page, Frame, expect, request } from '@playwright/test';
import { toPath, closeAnnouncementModal, SERVER_URL, parseBoolean } from '@utils/helpers';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';

// The suite's strict tsconfig doesn't pull in `@types/node`, so `process` would otherwise be
// flagged as undefined. Declared locally, same as the Stripe Express page object.
declare const process: { env: Record<string, string | undefined> };

/** Stripe test cards (test mode only). Expiry = any future date, CVC = any 3 digits. */
export const STRIPE_CARDS = {
    success: '4242 4242 4242 4242',
    threeDS: '4000 0025 0000 3155', // SCA required (on-session)
    declined: '4000 0000 0000 0002', // card_declined
    exp: '12 / 34',
    cvc: '123',
    zip: '10003',
} as const;

/**
 * Stripe Connect test credentials. Env var names match the dokan CI secrets.
 *
 * Connect DOES need an OAuth client id, unlike Express: `Helper::is_ready()`
 * (`modules/stripe/includes/Helper.php:50`) returns false without one, and a gateway that is not
 * ready never renders at checkout. A key pair on its own is not enough here.
 */
export const STRIPE_CONNECT_KEYS = {
    publishable: process.env.TEST_PUBLISH_KEY_STRIPE_CONNECT || '',
    secret: process.env.TEST_SECRET_KEY_STRIPE_CONNECT || '',
    clientId: process.env.TEST_CLIENT_ID_STRIPE_CONNECT || '',
} as const;

/**
 * Real connected-account ids (`acct_…`) seeded onto vendors for money assertions. These belong to
 * the CONNECT platform, which is a different Stripe account from the Express platform — the two
 * sets of account ids are not interchangeable.
 */
export const STRIPE_CONNECT_CONNECTED_ACCOUNTS = {
    vendor1: process.env.STRIPE_VENDOR1_ACCT || 'acct_seeded_demo_connect_vendor1',
    vendor2: process.env.STRIPE_VENDOR2_ACCT || 'acct_seeded_demo_connect_vendor2',
} as const;

/** True when both connected-account ids look like REAL Stripe accounts, not placeholders. */
export const HAS_REAL_CONNECTED_ACCOUNTS =
    /^acct_[A-Za-z0-9]+$/.test(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1) && !STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1.includes('seeded_demo') && /^acct_[A-Za-z0-9]+$/.test(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2) && !STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2.includes('seeded_demo');

/**
 * Page object for the Stripe Connect revamp (PR #5646), house style: intention-named methods, no
 * raw locators in the spec bodies, assertions made against the UI or the Stripe/WC API.
 *
 * Selectors below come from the 2026-08-21 live UI harvest of the revamp build
 * (`evidence/2026-08-21-stripe-connect-revamp/harvest/HARVEST.md`) and are re-validated against the
 * running site before any case is ticked.
 *
 * The checkout mechanics deliberately repeat what the Stripe Express page object already learned the
 * hard way (Payment Element re-mounts mid-fill; a Blocks Place Order press that silently never runs
 * the submit handler; an SPA redirect that flakes after a successful payment). Those are properties
 * of Stripe's element and of WooCommerce Blocks, not of either gateway. They are re-implemented here
 * rather than shared because extracting them would mean editing a 1111-line file that a currently
 * passing suite depends on. If a third Stripe gateway ever appears, extract then.
 */
export class StripeConnectPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        // Vendor dashboard flows are blocked by the Dokan Pro 5.0 announcement modal unless
        // dismissed; harmless no-op on admin/checkout pages.
        void closeAnnouncementModal(page);
    }

    static readonly GATEWAY_ID = 'dokan-stripe-connect';
    static readonly WITHDRAW_METHOD = 'dokan-stripe-connect';
    static readonly MODULE_SLUG = 'stripe';

    // ============================================
    // SELECTORS
    // ============================================

    admin = {
        // WC payment-gateway settings. The gateway id uses HYPHENS, so the WC field ids do too.
        gatewayUrl: toPath('wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan-stripe-connect'),
        enabled: '#woocommerce_dokan-stripe-connect_enabled',
        testmode: '#woocommerce_dokan-stripe-connect_testmode',
        testPublishableKey: '#woocommerce_dokan-stripe-connect_test_publishable_key',
        testSecretKey: '#woocommerce_dokan-stripe-connect_test_secret_key',
        testClientId: '#woocommerce_dokan-stripe-connect_test_client_id',
        title: '#woocommerce_dokan-stripe-connect_title',
        sellerPaysFee: '#woocommerce_dokan-stripe-connect_seller_pays_the_processing_fee',
        saveButton: 'button.woocommerce-save-button[name="save"], button[name="save"]',
    };

    vendor = {
        paymentSettingsUrl: toPath('dashboard/settings/payment'),
        manageUrl: toPath('dashboard/settings/payment-manage-dokan-stripe-connect'),
        connectedText: /your account is connected with stripe/i,
        disconnectLink: 'a[href*="action=dokan-disconnect-stripe"]',
    };

    checkout = {
        classicUrl: toPath('classic-checkout'),
        blockUrl: toPath('checkout'),
        addToCart: (productId: string | number) => toPath(`?add-to-cart=${productId}`),
        // Classic ([woocommerce_checkout] shortcode page).
        classicRadio: '#payment_method_dokan-stripe-connect',
        classicLabel: 'label[for="payment_method_dokan-stripe-connect"]',
        classicFieldset: '#wc-dokan-stripe-connect-cc-form',
        classicMount: '#dokan-stripe-connect-payment-element',
        // The harvest recorded the plural class; the module source also emits a singular one on some
        // paths. Match both rather than picking one and having the assertion silently never fire.
        classicError: '.dokan-stripe-pe-errors, .dokan-stripe-pe-error',
        saveCardCheckbox: '#wc-dokan-stripe-connect-new-payment-method',
        savedTokenRadios: 'input[name="wc-dokan-stripe-connect-payment-token"]',
        placeOrderClassic: '#place_order',
        // Block (WC Checkout block — the site default /checkout/).
        blockMount: '#dokan-stripe-connect-payment-element',
        orderReceived: '.woocommerce-order-received, .woocommerce-thankyou-order-received',
        billing: {
            firstName: '#billing_first_name',
            lastName: '#billing_last_name',
            email: '#billing_email',
            phone: '#billing_phone',
            address1: '#billing_address_1',
            city: '#billing_city',
            postcode: '#billing_postcode',
            country: '#billing_country',
            state: '#billing_state',
        },
    };

    blockSelectors = {
        gatewayRadio: '#radio-control-wc-payment-method-options-dokan-stripe-connect',
        gatewayLabel: 'label[for="radio-control-wc-payment-method-options-dokan-stripe-connect"]',
        content: '#radio-control-wc-payment-method-options-dokan-stripe-connect__content',
        placeOrder: '.wc-block-components-checkout-place-order-button',
        error: '.wc-block-components-notice-banner.is-error, .woocommerce-error',
    };

    myAccount = {
        url: toPath('my-account/payment-methods'),
        table: 'table.woocommerce-MyAccount-paymentMethods',
        rows: 'tr.payment-method',
        deleteBtn: 'a.button.delete',
    };

    static readonly BILLING = {
        firstName: 'customer1',
        lastName: 'c1',
        email: 'customer1@email.com',
        phone: MOBILE_TEST_PHONE,
        address1: 'abc street',
        city: 'New York',
        postcode: '10003',
        country: 'US',
        state: 'NY',
    };

    // ============================================
    // CARD ENTRY (Stripe Payment Element)
    // ============================================

    private static readonly PE_NUMBER = '#payment-numberInput, input[name="number"]';
    private static readonly PE_EXPIRY = '#payment-expiryInput, input[name="expiry"]';
    private static readonly PE_CVC = '#payment-cvcInput, input[name="cvc"]';
    private static readonly PE_ZIP = '#payment-postalCodeInput, input[name="postalCode"]';

    /** Find the (re-mountable) Payment Element iframe that currently holds the card-number field. */
    private async findStripePeFrame(): Promise<Frame> {
        const deadline = Date.now() + 30_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                if (
                    await frame
                        .locator(StripeConnectPage.PE_NUMBER)
                        .count()
                        .catch(() => 0)
                ) {
                    return frame;
                }
            }
            await this.page.waitForTimeout(400);
        }
        throw new Error('Stripe Payment Element card iframe not found (did the Card accordion open?)');
    }

    /**
     * Open the Card tab if the Payment Element rendered as a multi-method accordion. Idempotent: a
     * no-op when the card number field is already mounted, which is the common Connect case.
     */
    private async openCardAccordion(): Promise<void> {
        const deadline = Date.now() + 20_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                if (
                    await frame
                        .locator(StripeConnectPage.PE_NUMBER)
                        .count()
                        .catch(() => 0)
                ) {
                    return;
                }
            }
            let clicked = false;
            for (const frame of this.page.frames()) {
                if (!frame.url().includes('js.stripe.com') && !frame.name().includes('__privateStripeFrame')) {
                    continue;
                }
                const cardBtn = frame.getByRole('button', { name: /^card$/i }).first();
                if (await cardBtn.count().catch(() => 0)) {
                    await cardBtn.click({ timeout: 4_000 }).catch(() => undefined);
                    clicked = true;
                    break;
                }
            }
            await this.page.waitForTimeout(clicked ? 800 : 500);
        }
    }

    /**
     * Fill the Stripe Payment Element, verifying that ALL THREE fields persisted.
     *
     * Checking only the card number is not enough: the element can re-mount mid-entry (WooCommerce
     * re-renders and detaches the cross-origin frame), which leaves the number populated while
     * silently dropping expiry and CVC. An incomplete element makes the later Place Order press a
     * silent no-op — no checkout request, no order, and a failure that looks like a declined card.
     */
    async fillCardDetails(card: string = STRIPE_CARDS.success): Promise<void> {
        await this.openCardAccordion();
        const deadline = Date.now() + 45_000;
        let lastErr: unknown;
        while (Date.now() < deadline) {
            try {
                const frame = await this.findStripePeFrame();
                await frame.locator(StripeConnectPage.PE_NUMBER).first().fill(card, { timeout: 8_000 });
                await frame.locator(StripeConnectPage.PE_EXPIRY).first().fill(STRIPE_CARDS.exp, { timeout: 8_000 });
                await frame.locator(StripeConnectPage.PE_CVC).first().fill(STRIPE_CARDS.cvc, { timeout: 8_000 });
                const zip = frame.locator(StripeConnectPage.PE_ZIP);
                if (await zip.count().catch(() => 0)) {
                    await zip
                        .first()
                        .fill(STRIPE_CARDS.zip)
                        .catch(() => undefined);
                }
                const read = async (sel: string) =>
                    (
                        await frame
                            .locator(sel)
                            .first()
                            .inputValue()
                            .catch(() => '')
                    ).replace(/\s/g, '');
                const [num, exp, cvc] = await Promise.all([read(StripeConnectPage.PE_NUMBER), read(StripeConnectPage.PE_EXPIRY), read(StripeConnectPage.PE_CVC)]);
                if (num.length >= 12 && exp.length >= 4 && cvc.length >= 3) {
                    return;
                }
                lastErr = new Error(`card did not fully persist — the Payment Element re-mounted during entry (number=${num.length} chars, expiry="${exp}", cvc=${cvc.length} chars)`);
            } catch (err) {
                lastErr = err;
                await this.openCardAccordion();
            }
            await this.page.waitForTimeout(700);
        }
        throw lastErr ?? new Error('failed to fill the Stripe Payment Element');
    }

    /** Tick "Save payment method" so the charge mints a reusable token (SCTOK-01). */
    async saveCardAtCheckout(): Promise<void> {
        const box = this.page.locator(this.checkout.saveCardCheckbox).first();
        await expect(box, 'the save-card checkbox must exist when saved_cards is enabled').toBeVisible({ timeout: 15_000 });
        await box.check();
        await expect(box, 'the save-card checkbox must actually be checked').toBeChecked();
    }

    // ============================================
    // CART
    // ============================================

    async addProductToCart(productId: string | number): Promise<void> {
        await this.page.goto(this.checkout.addToCart(productId));
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // BLOCK CHECKOUT
    // ============================================

    /**
     * Open the WC Checkout block.
     *
     * The Stripe wallet element initialises an invisible hCaptcha as its Link-enrolment gate, and on
     * CI runner IP ranges that invisible check escalates into a visible challenge which blocks the
     * in-page card confirm. A plain card charge never needs Link, so the wallet backend is cut for
     * card flows; the Card element itself is untouched. Wallet-render cases pass blockWallet=false.
     */
    async gotoBlockCheckout(blockWallet = true): Promise<void> {
        if (blockWallet) {
            await this.page.route(/merchant-ui-api\.stripe\.com/i, route => route.abort());
        }
        await this.page.route(/hcaptcha/i, route => route.abort());
        for (let attempt = 1; attempt <= 2; attempt++) {
            await this.page.goto(this.checkout.blockUrl, { waitUntil: 'domcontentloaded' });
            await this.page.waitForLoadState('networkidle').catch(() => undefined);
            try {
                await this.page.locator(this.blockSelectors.placeOrder).waitFor({ state: 'visible', timeout: 45_000 });
                return;
            } catch (err) {
                if (attempt === 2) {
                    throw err;
                }
            }
        }
    }

    /** Fill the block checkout contact + shipping address as a GUEST (nothing pre-fills). */
    async fillBlockGuestDetails(d: { email: string; firstName: string; lastName: string; address: string; city: string; state: string; postcode: string; country: string; phone?: string }): Promise<void> {
        const p = this.page;
        await p.locator('#email').fill(d.email);
        await p.locator('#shipping-country').selectOption(d.country);
        await p.locator('#shipping-first_name').fill(d.firstName);
        await p.locator('#shipping-last_name').fill(d.lastName);
        await p.locator('#shipping-address_1').fill(d.address);
        await p.locator('#shipping-city').fill(d.city);
        await p
            .locator('#shipping-state')
            .selectOption(d.state)
            .catch(() => undefined);
        await p.locator('#shipping-postcode').fill(d.postcode);
        if (d.phone) {
            // Fail loudly rather than guarding on presence. A required-but-empty phone makes the
            // block refuse to submit, which reads identically to "the store has no phone field".
            const phoneField = p.locator('#shipping-phone, #billing-phone, input[id$="-phone"]').first();
            await expect(phoneField, 'the block checkout phone field must exist for a guest — Place Order is a silent no-op without it').toBeVisible({
                timeout: 15_000,
            });
            await phoneField.fill(d.phone);
            await expect(phoneField, 'the guest phone must actually persist into the field').toHaveValue(/\d/);
        }
        await p.waitForLoadState('networkidle').catch(() => undefined);
        await p.waitForTimeout(1_500);
    }

    /** Select Stripe Connect at the block checkout and wait for the Payment Element to mount. */
    async selectBlockGateway(): Promise<void> {
        const radio = this.page.locator(this.blockSelectors.gatewayRadio);
        const mount = this.page.locator(this.checkout.blockMount);
        await radio.waitFor({ state: 'visible', timeout: 30_000 });
        const deadline = Date.now() + 45_000;
        while (Date.now() < deadline) {
            await this.page
                .locator(this.blockSelectors.gatewayLabel)
                .click({ timeout: 8_000 })
                .catch(() => undefined);
            try {
                await mount.waitFor({ state: 'visible', timeout: 8_000 });
                return;
            } catch {
                await this.page.waitForTimeout(700);
            }
        }
        await mount.waitFor({ state: 'visible', timeout: 10_000 });
    }

    /** WooCommerce Blocks' own checkout status, or null when it cannot be read. */
    private async blockCheckoutStatus(): Promise<string | null> {
        return this.page
            .evaluate(() => {
                const select = (window as any).wp?.data?.select;
                const checkout = select?.('wc/store/checkout');
                try {
                    return typeof checkout?.getCheckoutStatus === 'function' ? String(checkout.getCheckoutStatus()) : null;
                } catch {
                    return null;
                }
            })
            .catch(() => null);
    }

    /**
     * Press Place Order and confirm the checkout actually began submitting; press again if it did not.
     *
     * React re-renders the place-order button while cart totals and payment methods resolve, so on a
     * slow link the click can land on a node that has just been replaced. Playwright reports the click
     * as successful and Blocks' status never leaves "idle" — nothing was submitted. Re-pressing is safe
     * precisely BECAUSE it is conditional on the status still being idle: idle means no submission is in
     * flight, so there is no risk of a second order. Once the status moves, this returns and lets the
     * real assertions decide, so a payment that genuinely fails still fails.
     */
    private async pressPlaceOrderUntilSubmitting(selector: string): Promise<void> {
        const ATTEMPTS = 3;
        const CONFIRM_MS = 4_000;
        const POLL_MS = 200;

        for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
            await this.page.locator(selector).click();
            const deadline = Date.now() + CONFIRM_MS;
            while (Date.now() < deadline) {
                const status = await this.blockCheckoutStatus();
                if (status === null) {
                    return; // store unreadable — do not risk a blind second press
                }
                if (status !== 'idle') {
                    return; // submission started
                }
                await this.page.waitForTimeout(POLL_MS);
            }
        }
    }

    /** Newest existing dokan-stripe-connect order id (0 if none) — the pre-payment baseline. */
    async connectOrderBaseline(): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,parent_id,payment_method`);
            const orders = (await res.json().catch(() => [])) as Array<{ id: number; parent_id: number; payment_method: string }>;
            // Only top-level orders. A multi-vendor payment also creates sub-orders, whose ids are
            // HIGHER than their parent's, so an unfiltered "newest" would return a sub-order and the
            // caller would then assert against a fragment of the payment instead of the whole one.
            const o = Array.isArray(orders) ? orders.find(x => x.payment_method === StripeConnectPage.GATEWAY_ID && Number(x.parent_id) === 0) : undefined;
            return o ? Number(o.id) : 0;
        } finally {
            await ctx.dispose();
        }
    }

    /**
     * Newest PAID Stripe Connect order id (0 if none).
     *
     * Distinct from connectOrderBaseline(), which counts orders at ANY status. WooCommerce creates
     * the order row BEFORE the payment is attempted, so a declined card legitimately leaves a new
     * unpaid row behind (observed: on-hold). Asserting "no new order id" would therefore fail on
     * correct behaviour. What must not happen is a new order reaching a PAID status, which is what
     * this measures.
     */
    async latestPaidConnectOrderId(): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,parent_id,status,payment_method`);
            const orders = (await res.json().catch(() => [])) as Array<{ id: number; parent_id: number; status: string; payment_method: string }>;
            // Top-level orders only — see connectOrderBaseline().
            const o = Array.isArray(orders) ? orders.find(x => x.payment_method === StripeConnectPage.GATEWAY_ID && Number(x.parent_id) === 0 && /processing|completed/.test(x.status)) : undefined;
            return o ? Number(o.id) : 0;
        } finally {
            await ctx.dispose();
        }
    }

    /**
     * Confirm a genuinely NEW Stripe Connect order settled to a paid status, and return its id.
     * This is the fallback oracle when the SPA redirect flakes after a successful payment. It is not
     * a softened assertion: it requires a new order, paid, on this gateway, or it throws.
     */
    private async confirmNewPaidConnectOrder(baseline: number): Promise<string> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            let found: { id: number; status: string } | undefined;
            await expect
                .poll(
                    async () => {
                        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,parent_id,status,payment_method`);
                        const orders = (await res.json().catch(() => [])) as Array<{ id: number; parent_id: number; status: string; payment_method: string }>;
                        found = Array.isArray(orders) ? orders.find(x => x.payment_method === StripeConnectPage.GATEWAY_ID && Number(x.parent_id) === 0 && Number(x.id) > baseline) : undefined;
                        return found ? found.status : 'none';
                    },
                    {
                        message: `a NEW ${StripeConnectPage.GATEWAY_ID} order (id > ${baseline}) should settle to a paid status`,
                        timeout: 120_000,
                    },
                )
                .toMatch(/processing|completed/);
            return String(found?.id);
        } finally {
            await ctx.dispose();
        }
    }

    /**
     * Place the block-checkout order and return the resulting order id.
     *
     * The payment completes reliably, but the client-side redirect to /order-received does not, so a
     * hard waitForURL flakes on an order that was genuinely paid. Fast path reads the id from the URL;
     * otherwise the order is confirmed through the WC REST API.
     */
    async placeBlockOrderExpectReceived(baselineOverride?: number): Promise<string> {
        const baseline = baselineOverride ?? (await this.connectOrderBaseline());

        // Record what Blocks actually did with the click. Without this, "the Store API rejected the
        // payment" and "the click was a no-op" collapse into the same symptom: no new order.
        const storeApiAttempts: string[] = [];
        const onResponse = (res: { url(): string; status(): number; request(): { method(): string }; text(): Promise<string> }) => {
            if (res.request().method() !== 'POST' || !/\/wc\/store\/v1\/checkout/.test(res.url())) {
                return;
            }
            const status = res.status();
            void res
                .text()
                .then(body => storeApiAttempts.push(`HTTP ${status}: ${body.slice(0, 300)}`))
                .catch(() => storeApiAttempts.push(`HTTP ${status}: <body unavailable>`));
        };
        this.page.on('response', onResponse);

        try {
            await this.pressPlaceOrderUntilSubmitting(this.blockSelectors.placeOrder);
            try {
                // On CI the redirect is the known-unreliable path, so the wait is short there and the
                // time is spent on the settle poll, which is what actually decides pass or fail.
                await this.page.waitForURL('**/order-received/**', { timeout: parseBoolean(process.env.CI) ? 15_000 : 60_000 });
                const m = this.page.url().match(/order-received\/(\d+)/);
                if (m?.[1]) return m[1];
            } catch {
                // redirect flaked after a successful payment — confirm through the API below
            }
            try {
                return await this.confirmNewPaidConnectOrder(baseline);
            } catch (err) {
                let detail: string;
                if (storeApiAttempts.length) {
                    detail = `Store API checkout attempts:\n  ${storeApiAttempts.join('\n  ')}`;
                } else {
                    const notices = await this.page
                        .locator('.wc-block-components-notice-banner, .wc-block-components-validation-error')
                        .allInnerTexts()
                        .catch(() => [] as string[]);
                    const peError = await this.page
                        .locator(this.checkout.classicError)
                        .first()
                        .innerText()
                        .catch(() => '');
                    // The Payment Element renders field-level validation INSIDE its iframe, so a
                    // main-document-only read reports "no error" when it really means "not visible".
                    const peFrameError = await this.findStripePeFrame()
                        .then(frame => frame.locator('p[role="alert"], .p-FieldError, [id$="-errorText"]').allInnerTexts())
                        .then(texts => texts.join(' | '))
                        .catch(() => '');
                    const why =
                        [...notices, peError, peFrameError]
                            .map(t => t.trim())
                            .filter(Boolean)
                            .join(' | ') || '<no validation message in the page OR inside the Payment Element iframe>';
                    detail = 'The Blocks checkout never issued POST /wc/store/v1/checkout — the Place Order click was a NO-OP, so no ' + `payment was attempted. This is a checkout-submission failure, not a declined payment.\nBlock validation said: ${why}`;
                }
                throw new Error(`${String(err)}\n\n${detail}`);
            }
        } finally {
            this.page.off('response', onResponse);
        }
    }

    /** Press Place Order at the block checkout expecting a visible failure and no order. */
    async placeBlockOrderExpectError(): Promise<void> {
        const paidBaseline = await this.latestPaidConnectOrderId();
        await this.pressPlaceOrderUntilSubmitting(this.blockSelectors.placeOrder);
        await expect(this.page.locator(this.blockSelectors.error).first(), 'a declined card should surface a visible checkout error').toBeVisible({
            timeout: 60_000,
        });
        await expect(this.page, 'a declined card must not reach order-received').not.toHaveURL(/order-received/);
        expect(await this.latestPaidConnectOrderId(), 'a declined card must not create a NEW PAID Stripe Connect order').toBe(paidBaseline);
    }

    // ============================================
    // CLASSIC CHECKOUT
    // ============================================

    async gotoClassicCheckout(): Promise<void> {
        await this.page.route(/hcaptcha/i, route => route.abort());
        await this.page.goto(this.checkout.classicUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.checkout.placeOrderClassic).waitFor({ state: 'visible', timeout: 30_000 });
    }

    async fillBillingClassic(billing = StripeConnectPage.BILLING): Promise<void> {
        const f = this.checkout.billing;
        await this.page.selectOption(f.country, billing.country).catch(() => undefined);
        await this.page.fill(f.firstName, billing.firstName);
        await this.page.fill(f.lastName, billing.lastName);
        await this.page.fill(f.address1, billing.address1);
        await this.page.fill(f.city, billing.city);
        await this.page.fill(f.postcode, billing.postcode);
        await this.page.selectOption(f.state, billing.state).catch(async () => {
            await this.page.fill(f.state, billing.state).catch(() => undefined);
        });
        if (
            await this.page
                .locator(f.email)
                .isVisible()
                .catch(() => false)
        ) {
            await this.page.fill(f.email, billing.email);
        }
        if (
            await this.page
                .locator(f.phone)
                .isVisible()
                .catch(() => false)
        ) {
            await this.page.fill(f.phone, billing.phone);
        }
    }

    /** WC blocks the classic form with .blockOverlay during update_checkout AJAX; wait it out. */
    async waitForCheckoutSettled(): Promise<void> {
        await this.page.waitForFunction(() => !document.querySelector('.blockOverlay'), { timeout: 20_000 }).catch(() => undefined);
    }

    /** Select Stripe Connect on the classic checkout and wait for the Payment Element to mount. */
    async selectClassicGateway(): Promise<void> {
        await this.waitForCheckoutSettled();
        const label = this.page.locator(this.checkout.classicLabel);
        await label.scrollIntoViewIfNeeded().catch(() => undefined);
        await label.click();
        await this.waitForCheckoutSettled();
        const useNewCard = this.page.locator(`${this.checkout.savedTokenRadios}[value="new"]`).first();
        if (await useNewCard.count().catch(() => 0)) {
            await useNewCard.check().catch(() => undefined);
            await this.waitForCheckoutSettled();
        }
        await this.page.locator(this.checkout.classicMount).waitFor({ state: 'visible', timeout: 30_000 });
        await this.waitForCheckoutSettled();
    }

    async placeClassicOrderExpectReceived(): Promise<string> {
        const baseline = await this.connectOrderBaseline();
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout|stripe-connect\/payment-intent/i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        try {
            for (let attempt = 0; attempt < 3 && !confirmFired; attempt++) {
                await this.waitForCheckoutSettled();
                await this.page.locator(this.checkout.placeOrderClassic).click();
                const start = Date.now();
                while (Date.now() - start < 15_000) {
                    if (confirmFired || this.page.url().includes('order-received')) break;
                    await this.page.waitForTimeout(1_000);
                }
            }
            try {
                await this.page.waitForURL('**/order-received/**', { timeout: 60_000 });
                const m = this.page.url().match(/order-received\/(\d+)/);
                if (m?.[1]) return m[1];
            } catch {
                // payment submitted but the redirect flaked — confirm the real order via the API
            }
            return await this.confirmNewPaidConnectOrder(baseline);
        } finally {
            this.page.off('request', onReq);
        }
    }

    async placeClassicOrderExpectError(): Promise<void> {
        const paidBaseline = await this.latestPaidConnectOrderId();
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout/i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        const errorVisible = () =>
            this.page
                .locator(this.checkout.classicError)
                .first()
                .isVisible()
                .catch(() => false);
        try {
            for (let attempt = 0; attempt < 3 && !confirmFired; attempt++) {
                await this.waitForCheckoutSettled();
                await this.page.locator(this.checkout.placeOrderClassic).click();
                const start = Date.now();
                while (Date.now() - start < 15_000) {
                    if (confirmFired || (await errorVisible()) || this.page.url().includes('order-received')) break;
                    await this.page.waitForTimeout(1_000);
                }
            }
            await expect(this.page.locator(this.checkout.classicError).first(), 'a declined card should surface an inline error').toBeVisible({
                timeout: 40_000,
            });
            await expect(this.page, 'a declined card must not reach order-received').not.toHaveURL(/order-received/);
            expect(await this.latestPaidConnectOrderId(), 'a declined card must not create a NEW PAID Stripe Connect order').toBe(paidBaseline);
        } finally {
            this.page.off('request', onReq);
        }
    }

    // ============================================
    // 3DS / SCA
    // ============================================

    /**
     * Complete the Stripe test 3DS challenge. It renders in a Stripe ACS test frame
     * (testmode-acs.stripe.com), so every frame is polled — the frame is cross-origin and nested.
     * Completing settles the order server-side, but the browser does not reliably redirect, so
     * callers assert order STATUS rather than the URL.
     */
    async completeThreeDsChallenge(): Promise<void> {
        const deadline = Date.now() + 75_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                for (const name of [/complete authentication/i, /^complete$/i, /authorize test payment/i]) {
                    const btn = frame.getByRole('button', { name }).first();
                    if ((await btn.count().catch(() => 0)) > 0) {
                        await btn.click({ timeout: 8_000 }).catch(() => undefined);
                        await btn.waitFor({ state: 'detached', timeout: 12_000 }).catch(async () => {
                            await btn.click({ timeout: 5_000 }).catch(() => undefined);
                        });
                        await this.page.waitForTimeout(2_000);
                        return;
                    }
                }
            }
            await this.page.waitForTimeout(500);
        }
        throw new Error('Stripe 3DS challenge "Complete" button not found');
    }

    /** Abandon the 3DS challenge by clicking Fail, the Stripe test ACS frame's reject button. */
    async failThreeDsChallenge(): Promise<void> {
        const deadline = Date.now() + 75_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                const btn = frame.getByRole('button', { name: /^fail$/i }).first();
                if ((await btn.count().catch(() => 0)) > 0) {
                    await btn.click({ timeout: 8_000 }).catch(() => undefined);
                    await this.page.waitForTimeout(2_000);
                    return;
                }
            }
            await this.page.waitForTimeout(500);
        }
        throw new Error('Stripe 3DS challenge "Fail" button not found');
    }

    // ============================================
    // SAVED CARDS (My Account)
    // ============================================

    async gotoMyAccountPaymentMethods(): Promise<void> {
        await this.page.goto(this.myAccount.url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getSavedCardRowCount(): Promise<number> {
        await this.gotoMyAccountPaymentMethods();
        return this.page.locator(this.myAccount.rows).count();
    }

    /**
     * Remove every saved card from My Account, through the UI.
     *
     * Without this the saved-card case is order-dependent: it passes on a customer who has no cards
     * and fails on the second run, because saving the SAME card again does not add a second row.
     * That produced a green first run and a red re-run, which is worse than either. Starting from a
     * known-empty list makes "a card appeared" mean what it says.
     */
    async deleteAllSavedCards(): Promise<void> {
        await this.gotoMyAccountPaymentMethods();
        // Re-query each pass: deleting a row navigates and invalidates the previous handles.
        for (let guard = 0; guard < 10; guard++) {
            const del = this.page.locator(this.myAccount.deleteBtn).first();
            if (!(await del.count().catch(() => 0))) {
                return;
            }
            await del.click();
            await this.page.waitForLoadState('domcontentloaded');
        }
    }

    /** Pay the classic checkout with an already-saved card token instead of a new card. */
    async selectSavedCardClassic(): Promise<void> {
        await this.waitForCheckoutSettled();
        await this.page.locator(this.checkout.classicLabel).click();
        await this.waitForCheckoutSettled();
        const saved = this.page.locator(`${this.checkout.savedTokenRadios}:not([value="new"])`).first();
        await expect(saved, 'a saved Stripe Connect card token should be offered at checkout').toBeVisible({ timeout: 20_000 });
        await saved.check();
        await this.waitForCheckoutSettled();
    }
}
