import { Page, expect } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';

// The suite's strict tsconfig doesn't pull in `@types/node`, so `process` would
// otherwise be flagged as undefined. Declare it locally (same pattern as
// `abuse-reports/abuseReportsPage.ts`) to keep the file type-clean.
declare const process: { env: Record<string, string | undefined> };

/**
 * Stripe test cards (test mode only). Expiry must be any future date, CVC any
 * 3 digits, ZIP any value. Mirrors the cards listed in the manual-test-plan §2.3.
 */
export const STRIPE_CARDS = {
    success: '4242 4242 4242 4242',
    threeDS: '4000 0025 0000 3155', // SCA required (on-session)
    threeDSRenewal: '4000 0027 6000 3184', // SCA required (off-session/renewal)
    declined: '4000 0000 0000 0002', // card_declined
    insufficientFunds: '4000 0000 0000 9995',
    expired: '4000 0000 0000 0069',
    incorrectCvc: '4000 0000 0000 0127',
    exp: '12 / 34',
    cvc: '123',
    zip: '10003',
} as const;

/**
 * Stripe Connect test credentials. Sourced from env vars whose names match the
 * dokan-pro CI workflow (`e2e_api_tests.yml`) so CI injects them automatically;
 * locally they live in `tests/pw/.env` (gitignored).
 *
 * `clientId` is the test Connect Client ID (`ca_…`) for the SAME account as the
 * keys. The gateway is only "ready" (and the vendor connect button / withdraw
 * method only render) when enabled + secret key + client id are all set
 * (dokan-pro `RegisterWithdrawMethods::admin_notices`). When `clientId` is empty
 * the gateway stays "almost ready" and the vendor-connect flow must be skipped.
 */
export const STRIPE_CONNECT_KEYS = {
    publishable: process.env.TEST_PUBLISH_KEY_STRIPE_CONNECT || '',
    secret: process.env.TEST_SECRET_KEY_STRIPE_CONNECT || '',
    clientId: process.env.TEST_CLIENT_ID_STRIPE_CONNECT || '',
} as const;

/**
 * Connected-account ids seeded onto the vendors (dokan_connected_vendor_id).
 * Read from .env so real Stripe test connected accounts can be dropped in without
 * touching code; falls back to placeholders (enough for the card charge, which is
 * on the platform account — real transfers need real accounts).
 */
export const STRIPE_CONNECTED_ACCOUNTS = {
    vendor1: process.env.STRIPE_VENDOR1_ACCT || 'acct_seeded_demo_vendor1',
    vendor2: process.env.STRIPE_VENDOR2_ACCT || 'acct_seeded_demo_vendor2',
} as const;

/** True when both connected-account ids look like REAL Stripe accounts (not placeholders). */
export const HAS_REAL_CONNECTED_ACCOUNTS =
    /^acct_[A-Za-z0-9]+$/.test(STRIPE_CONNECTED_ACCOUNTS.vendor1) &&
    !STRIPE_CONNECTED_ACCOUNTS.vendor1.includes('seeded_demo') &&
    /^acct_[A-Za-z0-9]+$/.test(STRIPE_CONNECTED_ACCOUNTS.vendor2) &&
    !STRIPE_CONNECTED_ACCOUNTS.vendor2.includes('seeded_demo');

export const ALMOST_READY_NOTICE = 'Stripe Connect module is almost ready!';

export interface GatewayConfig {
    publishable: string;
    secret: string;
    clientId?: string;
    enable?: boolean;
    testmode?: boolean;
    savedCards?: boolean;
    allowNonConnected?: boolean;
}

export class StripeConnectPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        // Vendor dashboard flows are blocked by the Dokan Pro 5.0 announcement
        // modal unless dismissed; harmless no-op on admin pages.
        void closeAnnouncementModal(page);
    }

    // ============================================
    // SELECTORS
    // ============================================

    admin = {
        // Modules page (legacy Vue UI; toggle is `input.toogle-checkbox` inside
        // `label.switch`, scoped per card via the bulk-select `input[value=<slug>]`).
        modulesUrl: toPath('wp-admin/admin.php?page=dokan#/modules'),
        moduleCard: (slug: string) => `.module-card:has(input[value="${slug}"])`,
        moduleToggleInput: (slug: string) => `.module-card:has(input[value="${slug}"]) input.toogle-checkbox`,
        moduleToggleSwitch: (slug: string) => `.module-card:has(input[value="${slug}"]) label.switch`,

        // WC payment gateway settings (field ids = woocommerce_<gatewayId>_<field>).
        gatewayUrl: toPath('wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan-stripe-connect'),
        enabled: '#woocommerce_dokan-stripe-connect_enabled',
        testmode: '#woocommerce_dokan-stripe-connect_testmode',
        testPublishableKey: '#woocommerce_dokan-stripe-connect_test_publishable_key',
        testSecretKey: '#woocommerce_dokan-stripe-connect_test_secret_key',
        testClientId: '#woocommerce_dokan-stripe-connect_test_client_id',
        savedCards: '#woocommerce_dokan-stripe-connect_saved_cards',
        allowNonConnectedSellers: '#woocommerce_dokan-stripe-connect_allow_non_connected_sellers',
        enable3dSecure: '#woocommerce_dokan-stripe-connect_enable_3d_secure', // rendered disabled (SCA always on)
        saveButton: 'button.woocommerce-save-button[name="save"]',

        // Dokan settings (where gateway readiness surfaces + the withdraw method
        // is enabled for vendors). Legacy Vue UI; the withdraw-methods control is
        // a `.multicheck_fields` group of `label.switch` toggles keyed by method
        // value (the gateway id `dokan-stripe-connect`). Save = #submit (admin-ajax
        // action=dokan_save_settings).
        dokanSettingsUrl: toPath('wp-admin/admin.php?page=dokan#/settings'),
        withdrawOptionsTab: 'div.nav-tab:has(div.nav-title:text-is("Withdraw Options"))',
        almostReadyNotice: `text=${ALMOST_READY_NOTICE}`,
        dokanSettingsSaveButton: '#submit',
        withdrawMethodToggleInput: (value: string) => `.multicheck_fields input.toogle-checkbox[value="${value}"]`,
        withdrawMethodToggleSwitch: (value: string) => `.multicheck_fields label.switch:has(input[value="${value}"])`,
    };

    static readonly WITHDRAW_METHOD = 'dokan-stripe-connect';

    vendor = {
        paymentSettingsUrl: toPath('dashboard/settings/payment'),
        // The connect/disconnect UI lives on the Stripe Connect MANAGE sub-route.
        // Real path: payment page → hover "Add Payment Method" (a CSS-hover
        // dropdown) → click "Direct to Stripe Connect". The link's href IS the
        // manage route, so a direct nav is also valid (used for state probes).
        stripeManageUrl: toPath('dashboard/settings/payment-manage-dokan-stripe-connect'),
        addPaymentMethodTrigger: '#toggle-vendor-payment-method-drop-down',
        addStripeConnectLink: 'a[href*="payment-manage-dokan-stripe-connect"]',
        container: '.dokan-stripe-connect-container',
        connectButton: 'a.dokan-stripe-connect-link',
        disconnectButton: '.dokan-stripe-connect-container a.dokan-btn-danger',
        connectedAlert: '.dokan-stripe-connect-container .dokan-alert-success',
        notConnectedAlert: '.dokan-stripe-connect-container .dokan-alert-warning',
    };

    static readonly STRIPE_OAUTH_URL = 'https://connect.stripe.com/oauth/authorize';

    // Checkout selectors — verified live + against the PR source.
    checkout = {
        // Classic = a [woocommerce_checkout] shortcode page (the default /checkout/
        // on this site is the WC Checkout BLOCK). ensureClassicCheckoutPage() creates it.
        classicUrl: toPath('classic-checkout'),
        blockUrl: toPath('checkout'),
        addToCart: (productId: string | number) => toPath(`?add-to-cart=${productId}`),
        gatewayRadio: 'input[name="payment_method"][value="dokan-stripe-connect"]',
        classicMount: '#dokan-stripe-connect-payment-element',
        classicFieldset: '#wc-dokan-stripe-connect-cc-form',
        blockMount: '.dokan-stripe-connect-payment-element',
        savedTokenRadios: 'input[name="wc-dokan-stripe-connect-payment-token"]',
        saveCardCheckbox: '#wc-dokan-stripe-connect-new-payment-method',
        expressWrap: '.dokan-stripe-pe-express-wrap',
        expressMount: '#dokan-stripe-connect-express-checkout',
        error: 'ul.dokan-stripe-pe-error, .woocommerce-error, .wc-block-components-notice-banner.is-error',
        placeOrderClassic: '#place_order',
        // Block place-order button (text node lives in a child span).
        placeOrderBlock: '.wc-block-components-checkout-place-order-button',
        orderReceived: '.woocommerce-order-received, .woocommerce-thankyou-order-received',
        // Classic billing fields.
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

    /**
     * Idempotently set a module's active state via the modules-page UI toggle.
     * Waits on the real REST activate/deactivate response, then confirms the
     * toggle reflects the desired state.
     */
    async setModuleEnabled(slug: string, enabled: boolean): Promise<void> {
        const toggle = this.page.locator(this.admin.moduleToggleInput(slug));
        if ((await toggle.isChecked()) === enabled) {
            return; // already in desired state
        }
        const endpoint = enabled ? 'activate' : 'deactivate';
        await Promise.all([
            this.page.waitForResponse(
                res => res.url().includes(`/modules/${endpoint}`) && res.ok(),
                { timeout: 30_000 },
            ),
            this.page.locator(this.admin.moduleToggleSwitch(slug)).click(),
        ]);
        await expect(toggle, `module "${slug}" should be ${enabled ? 'enabled' : 'disabled'}`).toBeChecked({
            checked: enabled,
            timeout: 15_000,
        });
    }

    // ============================================
    // GATEWAY SETTINGS (admin)
    // ============================================

    async gotoGatewaySettings(): Promise<void> {
        await this.page.goto(this.admin.gatewayUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.admin.enabled).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /**
     * Fill + save the Stripe Connect gateway settings. WooCommerce reloads the
     * settings page on save (full form POST), so we wait for that and confirm
     * the form is back before returning.
     */
    async configureGateway(config: GatewayConfig): Promise<void> {
        const {
            publishable,
            secret,
            clientId = '',
            enable = true,
            testmode = true,
            savedCards = true,
            allowNonConnected = false,
        } = config;

        await this.gotoGatewaySettings();

        await this.page.locator(this.admin.enabled).setChecked(enable);
        await this.page.locator(this.admin.testmode).setChecked(testmode);
        await this.page.locator(this.admin.testPublishableKey).fill(publishable);
        await this.page.locator(this.admin.testSecretKey).fill(secret);
        if (clientId) {
            await this.page.locator(this.admin.testClientId).fill(clientId);
        }
        await this.page.locator(this.admin.savedCards).setChecked(savedCards);
        await this.page.locator(this.admin.allowNonConnectedSellers).setChecked(allowNonConnected);

        await this.page.locator(this.admin.saveButton).click();
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

    /** The "3D Secure / SCA" field is rendered disabled (SCA is unconditional). */
    async assert3dSecureFieldDisabled(): Promise<void> {
        await this.gotoGatewaySettings();
        await expect(this.page.locator(this.admin.enable3dSecure), '3DS field is disabled (SCA always on)').toBeDisabled();
    }

    // ============================================
    // GATEWAY READINESS (admin → Dokan settings)
    // ============================================

    async gotoDokanSettings(): Promise<void> {
        await this.page.goto(this.admin.dokanSettingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator('.nav-tab').first().waitFor({ state: 'visible', timeout: 30_000 });
    }

    /**
     * The gateway is "ready" only when enabled + secret + client id are all set.
     * Until then dokan-pro renders the "almost ready" admin notice and the Stripe
     * Connect withdraw method / vendor connect button never register.
     *
     * The notice is conditionally *rendered* (present in the DOM only while
     * NOT ready), but it can sit inside a collapsed notices panel — so its
     * visibility is unreliable. Assert on DOM attachment, not visibility.
     */
    async assertGatewayReady(): Promise<void> {
        await this.gotoDokanSettings();
        await expect(
            this.page.locator(this.admin.almostReadyNotice).first(),
            'gateway should be ready — the "almost ready" notice must be gone',
        ).not.toBeAttached({ timeout: 20_000 });
    }

    async assertGatewayAlmostReady(): Promise<void> {
        await this.gotoDokanSettings();
        await expect(
            this.page.locator(this.admin.almostReadyNotice).first(),
            'gateway should report "almost ready" without a client id',
        ).toBeAttached({ timeout: 20_000 });
    }

    // ============================================
    // WITHDRAW METHOD (admin → Dokan settings → Withdraw Options)
    // ============================================

    async gotoWithdrawOptions(): Promise<void> {
        await this.gotoDokanSettings();
        await this.page.locator(this.admin.withdrawOptionsTab).click();
        // The Stripe Connect toggle only renders here once the gateway is ready.
        await this.page
            .locator(this.admin.withdrawMethodToggleInput(StripeConnectPage.WITHDRAW_METHOD))
            .waitFor({ state: 'attached', timeout: 20_000 });
    }

    /**
     * Enable (or disable) Stripe Connect as a vendor withdraw method and save.
     * This is what surfaces the connect button in the vendor dashboard. Idempotent
     * — skips the toggle+save when already in the desired state. Requires the
     * gateway to be ready (client id set), or the toggle won't exist.
     */
    async setStripeWithdrawMethodEnabled(enabled = true): Promise<void> {
        const value = StripeConnectPage.WITHDRAW_METHOD;
        await this.gotoWithdrawOptions();
        const toggle = this.page.locator(this.admin.withdrawMethodToggleInput(value));
        if ((await toggle.isChecked()) === enabled) {
            return; // already persisted in the desired state
        }
        await this.page.locator(this.admin.withdrawMethodToggleSwitch(value)).click();
        await Promise.all([
            this.page.waitForResponse(
                res =>
                    res.url().includes('admin-ajax.php') &&
                    res.request().method() === 'POST' &&
                    (res.request().postData() ?? '').includes('action=dokan_save_settings'),
                { timeout: 30_000 },
            ),
            this.page.locator(this.admin.dokanSettingsSaveButton).click(),
        ]);
        // confirm it persisted
        await this.gotoWithdrawOptions();
        await expect(
            this.page.locator(this.admin.withdrawMethodToggleInput(value)),
            'Stripe Connect withdraw method should persist as enabled',
        ).toBeChecked({ checked: enabled, timeout: 15_000 });
    }

    // ============================================
    // VENDOR CONNECT (vendor dashboard)
    // ============================================

    /** Open the Stripe Connect manage page directly (robust, state-independent). */
    async gotoVendorStripeManage(): Promise<void> {
        await this.page.goto(this.vendor.stripeManageUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.vendor.container).waitFor({ state: 'visible', timeout: 20_000 });
    }

    /**
     * Open the Stripe Connect manage page the way a vendor does: payment settings
     * → hover "Add Payment Method" → click "Direct to Stripe Connect".
     */
    async gotoVendorStripeViaPaymentMenu(): Promise<void> {
        await this.page.goto(this.vendor.paymentSettingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.vendor.addPaymentMethodTrigger).hover();
        await this.page.locator(this.vendor.addStripeConnectLink).click();
        await this.page.locator(this.vendor.container).waitFor({ state: 'visible', timeout: 20_000 });
    }

    async isVendorConnected(): Promise<boolean> {
        await this.gotoVendorStripeManage();
        return this.page.locator(this.vendor.disconnectButton).isVisible().catch(() => false);
    }

    /**
     * Assert the connect button renders and is wired to Stripe OAuth (its href is
     * a `connect.stripe.com/oauth/authorize` URL built from the client id),
     * navigating the real vendor path (Payments → Add Payment Method → Direct to
     * Stripe Connect). Verifies "vendor can add Stripe Connect payment method".
     */
    async assertConnectButtonVisible(): Promise<void> {
        await this.gotoVendorStripeViaPaymentMenu();
        const connect = this.page.locator(this.vendor.connectButton);
        await expect(connect, 'vendor Stripe connect button should render').toBeVisible({ timeout: 20_000 });
        await expect(connect, 'connect button should point to Stripe OAuth').toHaveAttribute(
            'href',
            new RegExp('^' + StripeConnectPage.STRIPE_OAUTH_URL.replace(/[.]/g, '\\.')),
        );
    }

    /**
     * Click "Connect with Stripe" and assert the vendor is taken to Stripe's
     * hosted OAuth page. The OAuth round-trip itself is Stripe-hosted and cannot
     * be automated further — completing it is manual, or the connected state is
     * seeded via user meta for downstream money tests. (Hits external Stripe.)
     */
    async clickConnectExpectStripeRedirect(): Promise<void> {
        await this.gotoVendorStripeManage();
        await Promise.all([
            this.page.waitForURL(/connect\.stripe\.com/, { timeout: 30_000 }),
            this.page.locator(this.vendor.connectButton).click(),
        ]);
    }

    /** Assert the vendor sees the CONNECTED state (Disconnect + Merchant ID). */
    async assertVendorConnectedUI(expectedAccountId?: string): Promise<void> {
        await this.gotoVendorStripeManage();
        await expect(this.page.locator(this.vendor.disconnectButton), 'connected vendor should see Disconnect').toBeVisible({
            timeout: 20_000,
        });
        if (expectedAccountId) {
            await expect(
                this.page.locator(this.vendor.connectedAlert),
                'connected alert should show the Merchant ID',
            ).toContainText(expectedAccountId);
        }
    }

    /** Assert the vendor sees the NOT-CONNECTED state (Connect button). */
    async assertVendorNotConnectedUI(): Promise<void> {
        await this.gotoVendorStripeManage();
        await expect(this.page.locator(this.vendor.connectButton), 'unconnected vendor should see Connect').toBeVisible({
            timeout: 20_000,
        });
    }

    // ============================================
    // CARD ENTRY (Stripe Payment Element iframe) — for upcoming checkout specs
    // ============================================

    /**
     * Fill the Stripe Payment Element card fields. The PE iframe `name` is
     * randomized (`__privateStripeFrame*`); discover it by the frame that
     * actually contains a card-number input. Field ids are stable
     * (`#payment-numberInput` / `#payment-expiryInput` / `#payment-cvcInput`).
     */
    private static readonly PE_NUMBER = '#payment-numberInput, input[name="number"]';
    private static readonly PE_EXPIRY = '#payment-expiryInput, input[name="expiry"]';
    private static readonly PE_CVC = '#payment-cvcInput, input[name="cvc"]';
    private static readonly PE_ZIP = '#payment-postalCodeInput, input[name="postalCode"]';

    /** Find the (re-mountable) PE iframe that currently holds the card-number field. */
    private async findStripePeFrame() {
        const deadline = Date.now() + 30_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                if (!frame.name().includes('__privateStripeFrame')) {
                    continue;
                }
                if (await frame.locator(StripeConnectPage.PE_NUMBER).count().catch(() => 0)) {
                    return frame;
                }
            }
            await this.page.waitForTimeout(400);
        }
        throw new Error('Stripe Payment Element card iframe not found');
    }

    /**
     * Fill the Stripe Payment Element. The PE iframe is cross-origin and can
     * RE-MOUNT (WC `updated_checkout` re-renders the payment box), which detaches
     * the frame mid-entry. So fill all three fields against a freshly-resolved
     * frame and verify the card number stuck — retry the WHOLE entry if the PE
     * re-mounted (a per-field retry would leave the number blank in a new frame).
     */
    async fillCardDetails(card: string = STRIPE_CARDS.success): Promise<void> {
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
                    await zip.first().fill(STRIPE_CARDS.zip).catch(() => undefined);
                }
                // Confirm the number stuck (PE didn't re-mount empty mid-entry).
                const val = (await frame.locator(StripeConnectPage.PE_NUMBER).first().inputValue().catch(() => '')).replace(/\s/g, '');
                if (val.length >= 12) {
                    return;
                }
                lastErr = new Error('card number did not persist — PE re-mounted during entry');
            } catch (err) {
                lastErr = err; // detached/closed frame → re-resolve and retry the whole entry
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

    async gotoClassicCheckout(): Promise<void> {
        // The classic Stripe Express Checkout Element (Link/Apple/Google Pay) loads
        // an invisible hCaptcha from js.stripe.com that, over HTTP (and on CI runner
        // IPs), escalates into a VISIBLE hCaptcha challenge. That challenge blocks
        // the place-order submit (no wc-ajax=checkout / no PaymentIntent confirm
        // ever fires), so the classic card + 3DS flows time out. We only exercise
        // the CARD Payment Element here (wallets can't work over HTTP anyway), so
        // neutralise the wallet script — it loads as a no-op, the Express element
        // never mounts, and no hCaptcha is triggered. Block checkout is untouched.
        await this.page.route('**/stripe-connect-express-classic.js*', route =>
            route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
        );
        // Stripe Link (inside the Payment Element) loads an invisible hCaptcha that,
        // on CI runner IPs, escalates into a VISIBLE interactive challenge —
        // unsolvable by automation — which blocks the classic in-page confirm
        // (place-order never submits). A plain card payment doesn't require
        // hCaptcha (it gates Link enrolment, not the card charge), so block all
        // hCaptcha resources: Link enrolment is skipped and the card confirm
        // proceeds. Does NOT touch the 3DS challenge (served from
        // testmode-acs.stripe.com, no "hcaptcha" in the URL).
        await this.page.route(/hcaptcha/i, route => route.abort());
        await this.page.goto(this.checkout.classicUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.checkout.placeOrderClassic).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /** Fill the classic checkout billing fields (overwrites any pre-filled values). */
    async fillBillingClassic(billing = StripeConnectPage.BILLING): Promise<void> {
        const f = this.checkout.billing;
        // Country first — WC re-renders the state field when it changes.
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

    /**
     * WC blocks the classic checkout form with a `.blockOverlay` while an
     * `update_checkout` AJAX runs. Selecting a gateway / changing billing triggers
     * one, which RE-RENDERS the payment box (re-mounting the PE iframe). Wait it
     * out so the Payment Element is stable before card entry — otherwise the
     * iframe detaches mid-fill (the observed flake).
     */
    async waitForCheckoutSettled(): Promise<void> {
        await this.page
            .waitForFunction(() => !document.querySelector('.blockOverlay'), { timeout: 20_000 })
            .catch(() => undefined);
    }

    /** Select the Stripe Connect gateway and wait for the Payment Element to mount + settle. */
    async selectClassicGateway(): Promise<void> {
        await this.waitForCheckoutSettled(); // settle any update from billing entry
        // The radio is overlaid by a styled <li> that intercepts pointer events, so
        // click its LABEL (what WC listens to). Confirm selection by the PE mounting
        // (it only renders when Stripe Connect is the chosen method) — avoids the
        // radio-state race from the update_checkout re-render.
        const label = this.page.locator('label[for="payment_method_dokan-stripe-connect"]');
        await label.scrollIntoViewIfNeeded().catch(() => undefined);
        await label.click();
        await this.waitForCheckoutSettled(); // settle the update_checkout from the gateway change
        await this.page.locator(this.checkout.classicMount).waitFor({ state: 'visible', timeout: 30_000 });
        await this.waitForCheckoutSettled(); // ensure the PE box finished (re)rendering
    }

    async placeClassicOrderExpectReceived(): Promise<void> {
        await this.page.locator(this.checkout.placeOrderClassic).click();
        await this.page.waitForURL('**/order-received/**', { timeout: 60_000 });
    }

    async placeClassicOrderExpectError(): Promise<void> {
        await this.page.locator(this.checkout.placeOrderClassic).click();
        await expect(
            this.page.locator(this.checkout.error).first(),
            'declined card should surface an inline error',
        ).toBeVisible({ timeout: 40_000 });
        await expect(this.page, 'declined card must not reach order-received').not.toHaveURL(/order-received/);
    }

    // ---- Block checkout (WC Checkout block; the site default /checkout/) ----

    blockSelectors = {
        gatewayRadio: '#radio-control-wc-payment-method-options-dokan-stripe-connect',
        placeOrder: '.wc-block-components-checkout-place-order-button',
        error: '.wc-block-components-notice-banner.is-error, .woocommerce-error',
    };

    async gotoBlockCheckout(): Promise<void> {
        await this.page.goto(this.checkout.blockUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.blockSelectors.placeOrder).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /** Select the Stripe Connect block payment method and wait for the PE to mount. */
    async selectBlockGateway(): Promise<void> {
        const radio = this.page.locator(this.blockSelectors.gatewayRadio);
        await radio.waitFor({ state: 'visible', timeout: 30_000 });
        await radio.click();
        await this.page.locator(this.checkout.blockMount).waitFor({ state: 'visible', timeout: 30_000 });
    }

    async placeBlockOrderExpectReceived(): Promise<void> {
        // Block places the WC order first, then confirms the intent with
        // redirect:'always' → returns to order-received.
        await this.page.locator(this.blockSelectors.placeOrder).click();
        await this.page.waitForURL('**/order-received/**', { timeout: 90_000 });
    }

    async placeBlockOrderExpectError(): Promise<void> {
        await this.page.locator(this.blockSelectors.placeOrder).click();
        await expect(
            this.page.locator(this.blockSelectors.error).first(),
            'declined card should surface a block error notice',
        ).toBeVisible({ timeout: 40_000 });
        await expect(this.page, 'declined card must not reach order-received').not.toHaveURL(/order-received/);
    }

    // ---- 3DS / SCA ----

    /**
     * Complete the Stripe test 3DS/SCA challenge. The challenge renders in deeply
     * nested cross-origin iframes; Playwright flattens them into page.frames(), so
     * poll every frame for the test "Complete authentication" button and click it.
     */
    /**
     * Complete the Stripe test 3DS/SCA challenge. The challenge renders in a Stripe
     * ACS test frame (`testmode-acs.stripe.com/3d_secure_2_test/…`) with a
     * "Complete" button. Poll every frame (it's deeply nested + cross-origin) and
     * click it. NOTE: completing the challenge settles the ORDER server-side, but
     * the browser doesn't reliably redirect to order-received in automation — so
     * callers assert the order STATUS, not the URL.
     */
    async complete3DSChallenge(): Promise<void> {
        const deadline = Date.now() + 45_000;
        while (Date.now() < deadline) {
            for (const frame of this.page.frames()) {
                for (const name of [/complete authentication/i, /^complete$/i, /authorize test payment/i]) {
                    const btn = frame.getByRole('button', { name }).first();
                    if ((await btn.count().catch(() => 0)) > 0) {
                        await btn.click({ timeout: 8_000 }).catch(() => undefined);
                        // Confirm the auth was submitted — the ACS frame navigates away,
                        // detaching the button. If it lingers, the click didn't register
                        // (the flake), so click once more.
                        await btn.waitFor({ state: 'detached', timeout: 12_000 }).catch(async () => {
                            await btn.click({ timeout: 5_000 }).catch(() => undefined);
                        });
                        await this.page.waitForTimeout(2_000); // let Stripe process the auth
                        return;
                    }
                }
            }
            await this.page.waitForTimeout(500);
        }
        throw new Error('Stripe 3DS challenge "Complete" button not found');
    }
}
