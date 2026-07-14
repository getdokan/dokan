import { Page, Frame, expect } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';

// The suite's strict tsconfig doesn't pull in `@types/node`, so `process` would
// otherwise be flagged as undefined. Declare it locally (same pattern as the
// stripe-connect page object) to keep the file type-clean.
declare const process: { env: Record<string, string | undefined> };

/**
 * Stripe test cards (test mode only). Expiry = any future date, CVC = any 3 digits,
 * ZIP = any value. Same set the Stripe Connect suite uses.
 */
export const STRIPE_CARDS = {
    success: '4242 4242 4242 4242',
    threeDS: '4000 0025 0000 3155', // SCA required (on-session)
    threeDSRenewal: '4000 0027 6000 3184', // SCA required (off-session/renewal)
    threeDSDeclined: '4000 0084 0000 1629', // SCA required, then DECLINED after authentication
    declined: '4000 0000 0000 0002', // card_declined
    insufficientFunds: '4000 0000 0000 9995',
    expired: '4000 0000 0000 0069',
    incorrectCvc: '4000 0000 0000 0127',
    exp: '12 / 34',
    cvc: '123',
    zip: '10003',
} as const;

/**
 * Stripe Express test credentials. Env var names match the dokan CI workflow +
 * `payloads.stripeExpress`/`data.stripeExpress`, so CI injects them automatically;
 * locally they live in `tests/pw/.env` (gitignored). Express has NO OAuth client id
 * (hosted Account Links, not OAuth) — so there is no `clientId` here.
 */
export const STRIPE_EXPRESS_KEYS = {
    publishable: process.env.TEST_PUBLISH_KEY_STRIPE_EXPRESS || '',
    secret: process.env.TEST_SECRET_KEY_STRIPE_EXPRESS || '',
} as const;

/**
 * Real connected-account ids (`acct_…`) seeded onto vendors for money assertions.
 * Read from .env so genuine Stripe test connected accounts (under the SAME platform
 * as the keys) can be dropped in; falls back to placeholders (enough to render the
 * connected UI + charge on the platform, but NOT enough for a real Transfer).
 */
export const STRIPE_EXPRESS_CONNECTED_ACCOUNTS = {
    vendor1: process.env.STRIPE_EXPRESS_VENDOR1_ACCT || 'acct_seeded_demo_express_vendor1',
    vendor2: process.env.STRIPE_EXPRESS_VENDOR2_ACCT || 'acct_seeded_demo_express_vendor2',
} as const;

/** True when both connected-account ids look like REAL Stripe accounts (not placeholders). */
export const HAS_REAL_CONNECTED_ACCOUNTS =
    /^acct_[A-Za-z0-9]+$/.test(STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1) &&
    !STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1.includes('seeded_demo') &&
    /^acct_[A-Za-z0-9]+$/.test(STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2) &&
    !STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2.includes('seeded_demo');

export interface GatewayConfig {
    publishable: string;
    secret: string;
    enable?: boolean;
    testmode?: boolean;
    savedCards?: boolean;
    capture?: boolean;
}

export class StripeExpressPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        // Vendor dashboard flows are blocked by the Dokan Pro 5.0 announcement
        // modal unless dismissed; harmless no-op on admin/checkout pages.
        void closeAnnouncementModal(page);
    }

    static readonly GATEWAY_ID = 'dokan_stripe_express';
    static readonly WITHDRAW_METHOD = 'dokan_stripe_express';
    static readonly MODULE_SLUG = 'stripe_express';

    // ============================================
    // SELECTORS
    // ============================================

    admin = {
        // Modules page (legacy Vue UI; toggle scoped per card via the bulk-select input[value=<slug>]).
        modulesUrl: toPath('wp-admin/admin.php?page=dokan#/modules'),
        moduleToggleInput: (slug: string) => `.module-card:has(input[value="${slug}"]) input.toogle-checkbox`,
        moduleToggleSwitch: (slug: string) => `.module-card:has(input[value="${slug}"]) label.switch`,

        // WC payment-gateway settings (field ids = woocommerce_<gatewayId>_<field>; gateway id uses UNDERSCORES).
        gatewayUrl: toPath('wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan_stripe_express'),
        enabled: '#woocommerce_dokan_stripe_express_enabled',
        testmode: '#woocommerce_dokan_stripe_express_testmode',
        sandboxMode: '#woocommerce_dokan_stripe_express_sandbox_mode',
        testPublishableKey: '#woocommerce_dokan_stripe_express_test_publishable_key',
        testSecretKey: '#woocommerce_dokan_stripe_express_test_secret_key',
        savedCards: '#woocommerce_dokan_stripe_express_saved_cards',
        capture: '#woocommerce_dokan_stripe_express_capture',
        title: '#woocommerce_dokan_stripe_express_title',
        description: '#woocommerce_dokan_stripe_express_description',
        statementDescriptor: '#woocommerce_dokan_stripe_express_statement_descriptor',
        disburseMode: '#woocommerce_dokan_stripe_express_disburse_mode',
        paymentRequest: '#woocommerce_dokan_stripe_express_payment_request',
        // Express has NO `enable_3d_secure` field (SCA always on) and NO `allow_non_connected_sellers`.
        enable3dSecure: '#woocommerce_dokan_stripe_express_enable_3d_secure',
        allowNonConnected: '#woocommerce_dokan_stripe_express_allow_non_connected_sellers',
        saveButton: 'button.woocommerce-save-button[name="save"], button[name="save"]',

        // Dokan settings → Withdraw Options (legacy Vue UI).
        dokanSettingsUrl: toPath('wp-admin/admin.php?page=dokan#/settings'),
        withdrawOptionsTab: 'div.nav-tab:has(div.nav-title:text-is("Withdraw Options"))',
        dokanSettingsSaveButton: '#submit',
        withdrawMethodToggleInput: (value: string) => `.multicheck_fields input.toogle-checkbox[value="${value}"]`,
        withdrawMethodToggleSwitch: (value: string) => `.multicheck_fields label.switch:has(input[value="${value}"])`,
    };

    vendor = {
        paymentSettingsUrl: toPath('dashboard/settings/payment'),
        // The Express connect/onboarding UI lives on the gateway MANAGE sub-route.
        manageUrl: toPath('dashboard/settings/payment-manage-dokan_stripe_express'),
        addPaymentMethodTrigger: '#toggle-vendor-payment-method-drop-down',
        addExpressLink: 'a[href*="payment-manage-dokan_stripe_express"]',
        connectButton: '#dokan-stripe-express-account-connect',
        disconnectButton: '#dokan-stripe-express-account-disconnect',
        dashboardLoginButton: '#dokan-stripe-express-dashboard-login',
        cancelOnboardingButton: '#dokan-stripe-express-account-cancel',
        onboardingButtonsWrap: '#dokan-stripe-express-vendor-onboarding-buttons',
        countryField: '#dokan_stripe_express_vendor_country',
        merchantIdAlert: '.dokan-alert-success, .alert-success',
    };

    // Checkout selectors — verified live (block) + against the module source (classic).
    checkout = {
        classicUrl: toPath('classic-checkout'),
        blockUrl: toPath('checkout'),
        addToCart: (productId: string | number) => toPath(`?add-to-cart=${productId}`),
        // Classic ([woocommerce_checkout] shortcode page).
        classicMount: '#dokan-stripe-express-element',
        classicFieldset: '#dokan-stripe-express-form',
        classicError: '#dokan-stripe-express-errors',
        placeOrderClassic: '#place_order',
        // Block (WC Checkout block — the site default /checkout/).
        blockMount: '#dokan-stripe-express-payment-element',
        savedTokenRadios: 'input[name="wc-dokan_stripe_express-payment-token"]',
        saveCardCheckbox: '#wc-dokan_stripe_express-new-payment-method',
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
        gatewayRadio: '#radio-control-wc-payment-method-options-dokan_stripe_express',
        gatewayLabel: 'label[for="radio-control-wc-payment-method-options-dokan_stripe_express"]',
        placeOrder: '.wc-block-components-checkout-place-order-button',
        error: '.wc-block-components-notice-banner.is-error, .woocommerce-error',
        // The Express Checkout / Link wallet element (block express method dokan_stripe_express_checkout).
        expressCheckoutHeading: /express checkout/i,
    };

    static readonly BILLING = {
        firstName: 'customer1',
        lastName: 'c1',
        email: 'customer1@email.com',
        phone: '(555) 555-5555',
        address1: 'abc street',
        city: 'New York',
        postcode: '10003',
        country: 'US',
        state: 'NY',
    };

    // Saved cards — WC core /my-account/payment-methods/. dokan_stripe_express tokens render as standard rows.
    myAccount = {
        url: toPath('my-account/payment-methods'),
        table: 'table.woocommerce-MyAccount-paymentMethods',
        rows: 'tr.payment-method',
        methodCell: 'td.payment-method-method',
        deleteBtn: 'a.button.delete',
        defaultBtn: 'a.button.default',
        defaultRow: 'tr.payment-method.default-payment-method',
    };

    // My-Account → Add payment method (SetupIntent flow → pm ATTACHED on Stripe).
    addPaymentMethod = {
        url: toPath('my-account/add-payment-method'),
        form: '#add_payment_method',
        gatewayRadio: 'input[name="payment_method"][value="dokan_stripe_express"]',
        gatewayLabel: 'label[for="payment_method_dokan_stripe_express"]',
        mount: '#dokan-stripe-express-element',
        submit: '#place_order',
    };

    vendorSubscription = {
        dashboardUrl: toPath('dashboard/subscription'),
        packsUrl: toPath('dashboard/subscription'),
    };

    // ============================================
    // MODULES (admin)
    // ============================================

    async gotoModules(): Promise<void> {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator('.module-card').first().waitFor({ state: 'visible', timeout: 30_000 });
    }

    async isModuleEnabled(slug: string): Promise<boolean> {
        return this.page.locator(this.admin.moduleToggleInput(slug)).isChecked();
    }

    /** Idempotently set a module's active state via the modules-page UI toggle (waits on the real REST response). */
    async setModuleEnabled(slug: string, enabled: boolean): Promise<void> {
        const toggle = this.page.locator(this.admin.moduleToggleInput(slug));
        if ((await toggle.isChecked()) === enabled) {
            return;
        }
        const endpoint = enabled ? 'activate' : 'deactivate';
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes(`/modules/${endpoint}`) && res.ok(), { timeout: 30_000 }),
            this.page.locator(this.admin.moduleToggleSwitch(slug)).click(),
        ]);
        await expect(toggle, `module "${slug}" should be ${enabled ? 'enabled' : 'disabled'}`).toBeChecked({ checked: enabled, timeout: 15_000 });
    }

    // ============================================
    // GATEWAY SETTINGS (admin)
    // ============================================

    async gotoGatewaySettings(): Promise<void> {
        await this.page.goto(this.admin.gatewayUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.admin.enabled).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /** Fill + save the Stripe Express gateway settings (testmode). WC reloads the page on save. */
    async configureGateway(config: GatewayConfig): Promise<void> {
        const { publishable, secret, enable = true, testmode = true, savedCards = true, capture = false } = config;
        await this.gotoGatewaySettings();
        await this.page.locator(this.admin.enabled).setChecked(enable);
        await this.page.locator(this.admin.testmode).setChecked(testmode);
        await this.page.locator(this.admin.sandboxMode).setChecked(false);
        await this.page.locator(this.admin.testPublishableKey).fill(publishable);
        await this.page.locator(this.admin.testSecretKey).fill(secret);
        await this.page.locator(this.admin.savedCards).setChecked(savedCards);
        await this.page.locator(this.admin.capture).setChecked(capture);
        await this.page.locator(this.admin.saveButton).first().click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.admin.enabled).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /** Re-read the gateway settings page and assert the key fields persisted. */
    async assertGatewayConfigured(expected: { enabled?: boolean; testmode?: boolean } = {}): Promise<void> {
        const { enabled = true, testmode = true } = expected;
        await this.gotoGatewaySettings();
        await expect(this.page.locator(this.admin.enabled), 'gateway enabled persisted').toBeChecked({ checked: enabled });
        await expect(this.page.locator(this.admin.testmode), 'test mode persisted').toBeChecked({ checked: testmode });
        await expect(this.page.locator(this.admin.testPublishableKey), 'test publishable key persisted').not.toHaveValue('');
        await expect(this.page.locator(this.admin.testSecretKey), 'test secret key persisted').not.toHaveValue('');
    }

    /** Express has NO 3D-Secure toggle field (SCA is unconditional). */
    async assertNo3dSecureField(): Promise<void> {
        await this.gotoGatewaySettings();
        await expect(this.page.locator(this.admin.enable3dSecure), 'Express must have no enable_3d_secure field').toHaveCount(0);
    }

    /** Express has NO `allow_non_connected_sellers` field (gateway available regardless of connection). */
    async assertNoAllowNonConnectedField(): Promise<void> {
        await this.gotoGatewaySettings();
        await expect(this.page.locator(this.admin.allowNonConnected), 'Express must have no allow_non_connected_sellers field').toHaveCount(0);
    }

    // ============================================
    // WITHDRAW METHOD (admin → Dokan settings → Withdraw Options)
    // ============================================

    async gotoWithdrawOptions(): Promise<void> {
        await this.page.goto(this.admin.dokanSettingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator('.nav-tab').first().waitFor({ state: 'visible', timeout: 30_000 });
        await this.page.locator(this.admin.withdrawOptionsTab).click();
        await this.page.locator(this.admin.withdrawMethodToggleInput(StripeExpressPage.WITHDRAW_METHOD)).waitFor({ state: 'attached', timeout: 20_000 });
    }

    async setWithdrawMethodEnabled(enabled = true): Promise<void> {
        await this.gotoWithdrawOptions();
        const toggle = this.page.locator(this.admin.withdrawMethodToggleInput(StripeExpressPage.WITHDRAW_METHOD));
        if ((await toggle.isChecked()) === enabled) {
            return;
        }
        await this.page.locator(this.admin.withdrawMethodToggleSwitch(StripeExpressPage.WITHDRAW_METHOD)).click();
        await Promise.all([
            this.page.waitForResponse(
                res => res.url().includes('admin-ajax.php') && res.request().method() === 'POST' && (res.request().postData() ?? '').includes('action=dokan_save_settings'),
                { timeout: 30_000 },
            ),
            this.page.locator(this.admin.dokanSettingsSaveButton).click(),
        ]);
    }

    // ============================================
    // VENDOR ONBOARDING (vendor dashboard)
    // ============================================

    async gotoVendorManage(): Promise<void> {
        // Any of the three state markers means the manage page rendered.
        const anyMarker = this.page.locator([this.vendor.connectButton, this.vendor.disconnectButton, this.vendor.dashboardLoginButton].join(', '));
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                // The disconnect/connect actions self-reload the page; a goto issued while that
                // reload is in flight throws net::ERR_ABORTED. Keep the goto INSIDE the retry so
                // an aborted navigation (or a still-hydrating SPA) just retries instead of failing.
                await this.page.goto(this.vendor.manageUrl, { waitUntil: 'domcontentloaded' });
                await closeAnnouncementModal(this.page);
                await anyMarker.first().waitFor({ state: 'visible', timeout: 15_000 });
                return;
            } catch {
                await this.page.waitForTimeout(2_000);
            }
        }
        // Final attempt: let the caller's assertion fail loudly if nothing rendered.
        await this.page.goto(this.vendor.manageUrl, { waitUntil: 'domcontentloaded' });
        await anyMarker.first().waitFor({ state: 'visible', timeout: 15_000 });
    }

    async isVendorConnected(): Promise<boolean> {
        await this.gotoVendorManage();
        return this.page.locator(this.vendor.disconnectButton).isVisible().catch(() => false);
    }

    /** Assert the NOT-connected state: the Connect button renders. */
    async assertVendorNotConnectedUI(): Promise<void> {
        await this.gotoVendorManage();
        await expect(this.page.locator(this.vendor.connectButton), 'unconnected vendor should see the Connect button').toBeVisible({ timeout: 20_000 });
    }

    /** Assert the CONNECTED state: Disconnect + Visit-Dashboard buttons (+ optional Merchant ID). */
    async assertVendorConnectedUI(expectedAccountId?: string): Promise<void> {
        await this.gotoVendorManage();
        await expect(this.page.locator(this.vendor.disconnectButton), 'connected vendor should see Disconnect').toBeVisible({ timeout: 20_000 });
        await expect(this.page.locator(this.vendor.dashboardLoginButton), 'connected vendor should see Visit Express Dashboard').toBeVisible();
        if (expectedAccountId) {
            await expect(this.page.locator(this.vendor.merchantIdAlert), 'connected alert should show the Merchant ID').toContainText(expectedAccountId);
        }
    }

    /** Click Connect and assert the vendor is redirected to a Stripe-hosted onboarding URL (commit-only). */
    async clickConnectExpectStripeRedirect(): Promise<void> {
        await this.gotoVendorManage();
        await Promise.all([
            this.page.waitForURL(/connect\.stripe\.com|stripe\.com/, { timeout: 30_000, waitUntil: 'commit' }),
            this.page.locator(this.vendor.connectButton).click(),
        ]);
    }

    /** Click Disconnect (POST dokan_stripe_express_vendor_disconnect → trash → connect button returns). */
    async disconnectVendorViaDashboard(): Promise<void> {
        await this.gotoVendorManage();
        const disconnect = this.page.locator(this.vendor.disconnectButton);
        await expect(disconnect, 'connected vendor should see Disconnect before disconnecting').toBeVisible({ timeout: 20_000 });
        await disconnect.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // CARD ENTRY (Stripe Payment Element) — accordion-aware
    // ============================================

    private static readonly PE_NUMBER = '#payment-numberInput, input[name="number"]';
    private static readonly PE_EXPIRY = '#payment-expiryInput, input[name="expiry"]';
    private static readonly PE_CVC = '#payment-cvcInput, input[name="cvc"]';
    private static readonly PE_ZIP = '#payment-postalCodeInput, input[name="postalCode"]';

    /**
     * The Express Payment Element is a MULTI-METHOD accordion (Card / wallets / bank /
     * crypto …) and does NOT default to Card. Click the "Card" tab so the card fields
     * mount. Idempotent: a no-op if the card number field is already present.
     * (Verified live: the element defaults to a non-card method.)
     */
    private async openCardAccordion(): Promise<void> {
        const deadline = Date.now() + 20_000;
        while (Date.now() < deadline) {
            // Already on the card fields?
            for (const frame of this.page.frames()) {
                if (await frame.locator(StripeExpressPage.PE_NUMBER).count().catch(() => 0)) {
                    return;
                }
            }
            // Click a "Card" tab/button inside any Stripe Payment-Element iframe.
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
        // No accordion (single-method card-only config) is fine — fillCardDetails will resolve the frame.
    }

    /** Find the (re-mountable) PE iframe that currently holds the card-number field. */
    private async findStripePeFrame(): Promise<Frame> {
        const deadline = Date.now() + 30_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                if (await frame.locator(StripeExpressPage.PE_NUMBER).count().catch(() => 0)) {
                    return frame;
                }
            }
            await this.page.waitForTimeout(400);
        }
        throw new Error('Stripe Payment Element card iframe not found (did the "Card" accordion open?)');
    }

    /**
     * Fill the Stripe Payment Element. FIRST opens the Card accordion (Express defaults
     * to a non-card method), then fills against a freshly-resolved frame and verifies the
     * number stuck — retrying the WHOLE entry if the PE re-mounts (WC re-render detaches
     * the cross-origin frame mid-fill).
     */
    async fillCardDetails(card: string = STRIPE_CARDS.success): Promise<void> {
        await this.openCardAccordion();
        const deadline = Date.now() + 45_000;
        let lastErr: unknown;
        while (Date.now() < deadline) {
            try {
                const frame = await this.findStripePeFrame();
                await frame.locator(StripeExpressPage.PE_NUMBER).first().fill(card, { timeout: 8_000 });
                await frame.locator(StripeExpressPage.PE_EXPIRY).first().fill(STRIPE_CARDS.exp, { timeout: 8_000 });
                await frame.locator(StripeExpressPage.PE_CVC).first().fill(STRIPE_CARDS.cvc, { timeout: 8_000 });
                const zip = frame.locator(StripeExpressPage.PE_ZIP);
                if (await zip.count().catch(() => 0)) {
                    await zip.first().fill(STRIPE_CARDS.zip).catch(() => undefined);
                }
                const val = (await frame.locator(StripeExpressPage.PE_NUMBER).first().inputValue().catch(() => '')).replace(/\s/g, '');
                if (val.length >= 12) {
                    return;
                }
                lastErr = new Error('card number did not persist — PE re-mounted during entry');
            } catch (err) {
                lastErr = err;
                await this.openCardAccordion(); // a re-mount may have reset to a non-card tab
            }
            await this.page.waitForTimeout(700);
        }
        throw lastErr ?? new Error('failed to fill Stripe Payment Element');
    }

    // ============================================
    // CHECKOUT (customer)
    // ============================================

    async addProductToCart(productId: string | number): Promise<void> {
        await this.page.goto(this.checkout.addToCart(productId));
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ---- Block checkout (WC Checkout block; the site default /checkout/) ----

    async gotoBlockCheckout(blockWallet = true): Promise<void> {
        // The Stripe Express Checkout / Link WALLET element initialises an invisible hCaptcha (its Link-
        // enrolment gate). On CI runner IPs that invisible hCaptcha ESCALATES into a VISIBLE challenge which
        // blocks the in-page card confirm, so the order never reaches order-received (90s waitForURL timeout).
        // A plain card charge does not need Link, so for card flows block the Link backend (merchant-ui-api)
        // so the wallet element never mounts and hCaptcha is never requested. The Card element
        // (api.stripe.com + js.stripe.com core) is untouched. Wallet-render tests pass blockWallet=false.
        // Verified live (browser network trace): merchant-ui-api.stripe.com/link → express-checkout element
        // → hcaptcha resources; cutting the first link stops the chain.
        if (blockWallet) {
            await this.page.route(/merchant-ui-api\.stripe\.com/i, route => route.abort());
        }
        await this.page.route(/hcaptcha/i, route => route.abort());
        // The WC Checkout block hydrates client-side; under load (Docker + a busy suite) that occasionally
        // overruns a 30s wait. Wait for network idle and, if the place-order button still hasn't rendered,
        // reload once before failing. This is a render-timing guard — the page itself renders fine (verified
        // live: button present, 0 console errors), it just occasionally hydrates slowly.
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

    /** Fill the WC block checkout CONTACT + SHIPPING address as a GUEST (no saved address). */
    async fillBlockGuestDetails(d: { email: string; firstName: string; lastName: string; address: string; city: string; state: string; postcode: string; country: string }): Promise<void> {
        const p = this.page;
        await p.locator('#email').fill(d.email);
        await p.locator('#shipping-country').selectOption(d.country);
        await p.locator('#shipping-first_name').fill(d.firstName);
        await p.locator('#shipping-last_name').fill(d.lastName);
        await p.locator('#shipping-address_1').fill(d.address);
        await p.locator('#shipping-city').fill(d.city);
        await p.locator('#shipping-state').selectOption(d.state).catch(() => undefined);
        await p.locator('#shipping-postcode').fill(d.postcode);
        await p.waitForLoadState('networkidle').catch(() => undefined);
        await p.waitForTimeout(1_500);
    }

    /** Select the Stripe Express block payment method and wait for the PE to mount. */
    async selectBlockGateway(): Promise<void> {
        const radio = this.page.locator(this.blockSelectors.gatewayRadio);
        const mount = this.page.locator(this.checkout.blockMount);
        await radio.waitFor({ state: 'visible', timeout: 30_000 });
        const deadline = Date.now() + 45_000;
        while (Date.now() < deadline) {
            await this.page.locator(this.blockSelectors.gatewayLabel).click({ timeout: 8_000 }).catch(() => undefined);
            try {
                await mount.waitFor({ state: 'visible', timeout: 8_000 });
                return;
            } catch {
                await this.page.waitForTimeout(700);
            }
        }
        await mount.waitFor({ state: 'visible', timeout: 10_000 });
    }

    async placeBlockOrderExpectReceived(): Promise<void> {
        await this.page.locator(this.blockSelectors.placeOrder).click();
        await this.page.waitForURL('**/order-received/**', { timeout: 90_000 });
    }

    async placeBlockOrderExpectError(): Promise<void> {
        await this.page.locator(this.blockSelectors.placeOrder).click();
        await expect(this.page.locator(this.blockSelectors.error).first(), 'declined card should surface a block error notice').toBeVisible({ timeout: 40_000 });
        await expect(this.page, 'declined card must not reach order-received').not.toHaveURL(/order-received/);
    }

    /** Assert the block Payment Element mounted (container visible + real Stripe card iframe) with no init error. */
    async assertBlockPaymentElementReady(): Promise<void> {
        await expect(this.page.locator(this.checkout.blockMount), 'Express Payment Element should mount on block checkout').toBeVisible({ timeout: 30_000 });
        await expect(this.page.locator('body'), 'checkout must not show a Stripe init error').not.toContainText(/could not initialize stripe/i);
        await this.openCardAccordion();
        await this.findStripePeFrame();
    }

    /** Assert the Express Checkout / Link wallet element renders on block checkout. */
    async assertExpressCheckoutElementRenders(): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: this.blockSelectors.expressCheckoutHeading }),
            'the "Express Checkout" heading should render when the wallet element is available',
        ).toBeVisible({ timeout: 20_000 });
    }

    // ---- Classic checkout ([woocommerce_checkout] shortcode page) ----

    async gotoClassicCheckout(): Promise<void> {
        // Stripe Link inside the Payment Element loads an invisible hCaptcha that on CI runner IPs can
        // escalate into a VISIBLE challenge blocking the in-page confirm. A plain card charge doesn't
        // need hCaptcha (it gates Link enrolment), so block hCaptcha resources. Block checkout untouched.
        await this.page.route(/hcaptcha/i, route => route.abort());
        await this.page.goto(this.checkout.classicUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.checkout.placeOrderClassic).waitFor({ state: 'visible', timeout: 30_000 });
    }

    async fillBillingClassic(billing = StripeExpressPage.BILLING): Promise<void> {
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
        if (await this.page.locator(f.email).isVisible().catch(() => false)) {
            await this.page.fill(f.email, billing.email);
        }
        if (await this.page.locator(f.phone).isVisible().catch(() => false)) {
            await this.page.fill(f.phone, billing.phone);
        }
    }

    /** WC blocks the classic form with .blockOverlay during update_checkout AJAX; wait it out. */
    async waitForCheckoutSettled(): Promise<void> {
        await this.page.waitForFunction(() => !document.querySelector('.blockOverlay'), { timeout: 20_000 }).catch(() => undefined);
    }

    /** Select Stripe Express on classic checkout and wait for the Payment Element to mount. */
    async selectClassicGateway(): Promise<void> {
        await this.waitForCheckoutSettled();
        const label = this.page.locator('label[for="payment_method_dokan_stripe_express"]');
        await label.scrollIntoViewIfNeeded().catch(() => undefined);
        await label.click();
        await this.waitForCheckoutSettled();
        const useNewCard = this.page.locator('#wc-dokan_stripe_express-payment-token-new, input[name="wc-dokan_stripe_express-payment-token"][value="new"]').first();
        if (await useNewCard.count().catch(() => 0)) {
            await useNewCard.check().catch(() => undefined);
            await this.waitForCheckoutSettled();
        }
        await this.page.locator(this.checkout.classicMount).waitFor({ state: 'visible', timeout: 30_000 });
        await this.waitForCheckoutSettled();
    }

    async placeClassicOrderExpectReceived(): Promise<void> {
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout|dokan_stripe_express_verify_intent/i.test(req.url())) confirmFired = true;
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
            await this.page.waitForURL('**/order-received/**', { timeout: 75_000 });
        } finally {
            this.page.off('request', onReq);
        }
    }

    async placeClassicOrderExpectError(): Promise<void> {
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout/i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        const errorVisible = () => this.page.locator(this.checkout.classicError).first().isVisible().catch(() => false);
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
            await expect(this.page.locator(this.checkout.classicError).first(), 'declined card should surface an inline error').toBeVisible({ timeout: 40_000 });
            await expect(this.page, 'declined card must not reach order-received').not.toHaveURL(/order-received/);
        } finally {
            this.page.off('request', onReq);
        }
    }

    // ============================================
    // 3DS / SCA
    // ============================================

    /**
     * Complete the Stripe test 3DS/SCA challenge. The challenge renders in a Stripe ACS
     * test frame (testmode-acs.stripe.com); poll every frame (deeply nested + cross-origin)
     * and click "Complete". Completing settles the ORDER server-side, but the browser
     * doesn't reliably redirect — callers assert order STATUS, not the URL.
     */
    async complete3DSChallenge(): Promise<void> {
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

    // ============================================
    // SAVED CARDS (My Account)
    // ============================================

    async gotoMyAccountPaymentMethods(): Promise<void> {
        await this.page.goto(this.myAccount.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.myAccount.table).first().waitFor({ state: 'visible', timeout: 30_000 }).catch(() => undefined);
    }

    /**
     * Save a card via My Account → Add payment method (SetupIntent → pm ATTACHED on Stripe).
     * Fills the PE (accordion-aware), submits form#add_payment_method, waits for the redirect
     * back to /payment-methods/.
     */
    async addCardViaMyAccount(card: string = STRIPE_CARDS.success): Promise<void> {
        await this.page.route(/hcaptcha/i, route => route.abort());
        await this.page.goto(this.addPaymentMethod.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.addPaymentMethod.form).waitFor({ state: 'visible', timeout: 30_000 });
        const radio = this.page.locator(this.addPaymentMethod.gatewayRadio);
        if ((await radio.count().catch(() => 0)) && !(await radio.isChecked().catch(() => false))) {
            await this.page.locator(this.addPaymentMethod.gatewayLabel).click().catch(() => undefined);
        }
        await this.page.locator(this.addPaymentMethod.mount).waitFor({ state: 'visible', timeout: 30_000 });
        await this.fillCardDetails(card);
        await this.page.locator(this.addPaymentMethod.submit).click();
        // The SetupIntent confirms in-page (a Stripe round-trip) and WC then redirects to the saved-methods
        // list (…/payment-methods/?redirect_status=succeeded — verified live). That round-trip can exceed
        // 60s when the suite is hammering the Stripe test API, so wait generously rather than fail a slow-
        // but-successful add. A genuine failure surfaces as an error notice on the add-payment-method page.
        await this.page.waitForURL('**/payment-methods/**', { timeout: 120_000 });
    }

    async getSavedCardRowCount(): Promise<number> {
        await this.gotoMyAccountPaymentMethods();
        return this.page.locator(this.myAccount.rows).count();
    }

    // ============================================
    // VENDOR SUBSCRIPTION DASHBOARD
    // ============================================

    async gotoVendorSubscriptionDashboard(): Promise<void> {
        await this.page.goto(this.vendorSubscription.dashboardUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await closeAnnouncementModal(this.page);
    }
}
