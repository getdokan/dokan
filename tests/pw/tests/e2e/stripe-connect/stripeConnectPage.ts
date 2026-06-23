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
    threeDSDeclined: '4000 0084 0000 1629', // SCA required, then DECLINED (insufficient_funds) after authentication
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
        // Block checkout uses a React wrapper (no classic .is-ready/.is-empty); the
        // Express Checkout Element (Stripe Link / wallet buttons) mounts inside it.
        expressBlockWrap: '.dokan-stripe-pe-express-block',
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
        const container = this.page.locator(this.vendor.container);
        // Cold CI: the React vendor dashboard can render the manage route late (or need a reload) before
        // the Stripe Connect container mounts — retry the navigation a few times before failing.
        for (let attempt = 0; attempt < 3; attempt++) {
            await this.page.goto(this.vendor.stripeManageUrl);
            await this.page.waitForLoadState('domcontentloaded');
            try {
                await container.waitFor({ state: 'visible', timeout: 20_000 });
                return;
            } catch {
                await this.page.waitForTimeout(2_000); // SPA still hydrating — reload and retry
            }
        }
        await container.waitFor({ state: 'visible', timeout: 20_000 });
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
            // Only assert the redirect INITIATED — resolve as soon as the
            // navigation to Stripe commits. The default waitUntil:'load' waits for
            // Stripe's heavy external OAuth page to fully load, which routinely
            // exceeds 30s on CI (the observed flake) even though the redirect fired.
            this.page.waitForURL(/connect\.stripe\.com/, { timeout: 30_000, waitUntil: 'commit' }),
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

    /**
     * Click the vendor dashboard "Disconnect" button. Its href is the deauthorize URL
     * carrying the `dokan-stripe-vendor-deauthorize` nonce; navigating it runs
     * RegisterWithdrawMethods::deauthorize_vendor() on template_redirect, which attempts
     * the Stripe OAuth deauthorize and then UNCONDITIONALLY clears the local meta
     * (`_stripe_connect_access_key` + `dokan_connected_vendor_id`) and redirects back.
     */
    async disconnectVendorViaDashboard(): Promise<void> {
        await this.gotoVendorStripeManage();
        const disconnect = this.page.locator(this.vendor.disconnectButton);
        await expect(disconnect, 'connected vendor should see Disconnect before disconnecting').toBeVisible({ timeout: 20_000 });
        await disconnect.click();
        await this.page.waitForLoadState('domcontentloaded');
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
        // We deliberately do NOT abort/fulfill the Link JSON endpoints (merchant-ui-api/get-cookie, link.stripe.com,
        // api.stripe.com/v1/consumers…). Aborting throws an uncaught "Failed to fetch" that RACES the gateway's
        // classic JS init and on CI intermittently breaks it — place-order then fires NO payment-intent / confirm /
        // wc-ajax at all (verified in a CI trace). Fulfilling these with {} makes Link "proceed" and breaks the
        // confirm even locally. Leaving get-cookie alone lets the Payment Element init cleanly; Link's risk hCaptcha
        // is already blocked above, so Link enrolment degrades and the plain card confirm proceeds. Any residual
        // cold-CI first-attempt stall is handled by the in-test re-click in placeClassicOrderExpect*.
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

    /**
     * Select the Stripe Connect gateway and (by default) wait for the Payment Element to mount + settle.
     * Pass { expectPaymentElement: false } for the SAVED-TOKEN flow: when stored cards exist the classic
     * form defaults to a saved-token radio and the new-card PE stays HIDDEN, so waiting for it would time out.
     */
    async selectClassicGateway({ expectPaymentElement = true }: { expectPaymentElement?: boolean } = {}): Promise<void> {
        await this.waitForCheckoutSettled(); // settle any update from billing entry
        // The radio is overlaid by a styled <li> that intercepts pointer events, so
        // click its LABEL (what WC listens to). Confirm selection by the PE mounting
        // (it only renders when Stripe Connect is the chosen method) — avoids the
        // radio-state race from the update_checkout re-render.
        const label = this.page.locator('label[for="payment_method_dokan-stripe-connect"]');
        await label.scrollIntoViewIfNeeded().catch(() => undefined);
        await label.click();
        await this.waitForCheckoutSettled(); // settle the update_checkout from the gateway change
        if (expectPaymentElement) {
            // If the customer has saved cards, classic checkout defaults to a saved-token radio and the new-card
            // PE stays HIDDEN (the saved-card-default trap — what makes the PE "never mount" once a saved-card
            // test has run in the same session/shard). The new-card flow wants the PE, so pick "Use a new card"
            // first when that toggle is present (a no-op when there are no saved tokens).
            const useNewCard = this.page
                .locator('#wc-dokan-stripe-connect-payment-token-new, input[name="wc-dokan-stripe-connect-payment-token"][value="new"]')
                .first();
            if (await useNewCard.count().catch(() => 0)) {
                await useNewCard.check().catch(() => undefined);
                await this.waitForCheckoutSettled();
            }
            await this.page.locator(this.checkout.classicMount).waitFor({ state: 'visible', timeout: 30_000 });
            await this.waitForCheckoutSettled(); // ensure the PE box finished (re)rendering
        }
    }

    async placeClassicOrderExpectReceived(): Promise<void> {
        // Track whether the in-page Stripe confirm actually reaches Stripe. A cold-CI first attempt can be Link-
        // risk-stalled and never fire (no payment_intents/.../confirm request); a re-click in the now-warm session
        // isn't risk-challenged. Re-click ONCE, guarded on "no confirm fired", so a slow-but-real confirm is never
        // double-submitted. (Fresh-page test-level retries don't warm the session, so this in-test re-click is the
        // thing that actually clears the cold-CI classic-confirm stall.)
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout/i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        try {
            // Re-click up to 3×, each time ONLY if no confirm has reached Stripe yet (so a slow-but-real confirm is
            // never double-submitted), polling just 15s before retrying so a genuine cold stall is cleared fast.
            // Once the confirm fires (or we navigate) the loop exits and we wait the order out.
            for (let attempt = 0; attempt < 3 && !confirmFired; attempt++) {
                await this.waitForCheckoutSettled(); // don't click mid update_order_review — an in-flight update drops the confirm
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
        // The classic in-page confirm can stall on a cold first attempt (Link-risk on CI; a slow first PE confirm
        // locally), so the declined card never reaches Stripe → no decline → no error. Mirror the success/3DS
        // helpers: re-click ONLY while no confirm has fired (so a real-but-slow confirm isn't double-submitted),
        // then assert the decline error. A genuinely broken error-display still fails loudly at the assertion.
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout/i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        const errorVisible = () => this.page.locator(this.checkout.error).first().isVisible().catch(() => false);
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
            await expect(
                this.page.locator(this.checkout.error).first(),
                'declined card should surface an inline error',
            ).toBeVisible({ timeout: 40_000 });
            await expect(this.page, 'declined card must not reach order-received').not.toHaveURL(/order-received/);
        } finally {
            this.page.off('request', onReq);
        }
    }

    /**
     * Place a classic order paid with a 3DS card and wait until the SCA challenge frame actually attaches
     * (testmode-acs.stripe.com) before returning. Settles any in-flight update_order_review FIRST (a bare click
     * during an update silently drops the in-page confirm — an observed CI stall), and re-clicks once if the
     * first confirm stalls. Detects the ACS frame via page.frames() (Playwright flattens the nested cross-origin
     * frame). A genuine confirm-stall fails loudly HERE instead of masquerading as "Complete button not found".
     */
    async placeClassicOrderExpect3DS(): Promise<void> {
        // Track whether the in-page confirm actually reached Stripe — a cold-CI first attempt can be Link-risk-
        // stalled and never fire. Re-click ONCE only if no confirm fired (so a real-but-slow confirm that already
        // pushed the PI to requires_action is never double-submitted).
        let confirmFired = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|\/3ds2\//i.test(req.url())) confirmFired = true;
        };
        this.page.on('request', onReq);
        const acsAttached = () => this.page.frames().some(f => /testmode-acs\.stripe\.com|3d_secure_2/i.test(f.url()));
        const pollAcs = async (ms: number): Promise<boolean> => {
            const deadline = Date.now() + ms;
            while (Date.now() < deadline) {
                if (acsAttached()) return true;
                await this.page.waitForTimeout(1_000);
            }
            return false;
        };
        try {
            // Re-click up to 3× if no confirm has reached Stripe within 15s (cold-CI stall), each time only while
            // no confirm has fired (so a confirm already moving the PI to requires_action isn't double-submitted),
            // then keep polling for the ACS challenge frame.
            for (let attempt = 0; attempt < 3 && !confirmFired; attempt++) {
                await this.waitForCheckoutSettled();
                await this.page.locator(this.checkout.placeOrderClassic).click();
                const start = Date.now();
                while (Date.now() - start < 15_000) {
                    if (confirmFired || acsAttached()) break;
                    await this.page.waitForTimeout(1_000);
                }
            }
            if (await pollAcs(75_000)) return;
            throw new Error('Classic confirm stalled: the 3DS SCA challenge (testmode-acs.stripe.com) never loaded after place-order');
        } finally {
            this.page.off('request', onReq);
        }
    }

    // ---- Block checkout (WC Checkout block; the site default /checkout/) ----

    blockSelectors = {
        gatewayRadio: '#radio-control-wc-payment-method-options-dokan-stripe-connect',
        placeOrder: '.wc-block-components-checkout-place-order-button',
        error: '.wc-block-components-notice-banner.is-error, .woocommerce-error',
    };

    // WC Checkout block coupon panel (Suite C5). The coupon UI is a collapsible
    // panel: a `.wc-block-components-panel__button` ("Add a coupon") that expands
    // the `.wc-block-components-totals-coupon__form` holding the code input
    // (`#wc-block-components-totals-coupon__input-0`, placeholder "Enter code")
    // and the Apply button (`.wc-block-components-totals-coupon__button`).
    blockCoupon = {
        panelButton: '.wc-block-components-panel__button',
        form: '.wc-block-components-totals-coupon__form',
        input: '#wc-block-components-totals-coupon__input-0, .wc-block-components-totals-coupon__input input',
        applyButton: '.wc-block-components-totals-coupon__button',
        // A per-coupon removable chip rendered under the order summary once applied.
        appliedChip: '.wc-block-components-totals-discount, .wc-block-components-chip',
    };

    // Saved cards (Suite F) — WC core /my-account/payment-methods/ table. The
    // dokan-stripe-connect token rows render here as standard WC payment-method
    // rows: the method cell reads "Visa ending in 4242", the expires cell "12/34",
    // and the actions cell holds the Make-default / Delete links. Selectors match
    // woocommerce/templates/myaccount/payment-methods.php.
    myAccount = {
        url: toPath('my-account/payment-methods'),
        table: 'table.woocommerce-MyAccount-paymentMethods',
        rows: 'tr.payment-method',
        methodCell: 'td.payment-method-method',
        expiresCell: 'td.payment-method-expires',
        deleteBtn: 'a.button.delete',
        defaultBtn: 'a.button.default',
        // A row gains this class once it is the default payment method.
        defaultRow: 'tr.payment-method.default-payment-method',
    };

    // My-Account → Add payment method (Suite F). This SetupIntent flow ATTACHES
    // the pm on Stripe (unlike the block-checkout save path, which is a gateway
    // bug). The Payment Element mount id is shared with classic checkout
    // (confirmed from gateway source).
    addPaymentMethod = {
        url: toPath('my-account/add-payment-method'),
        form: '#add_payment_method',
        gatewayRadio: 'input[name="payment_method"][value="dokan-stripe-connect"]',
        gatewayLabel: 'label[for="payment_method_dokan-stripe-connect"]',
        mount: '#dokan-stripe-connect-payment-element',
        submit: '#place_order',
    };

    // Admin Subscriptions list (VS7) — the dokan-pro subscription module's React
    // page on the NEW admin dashboard (admin.php?page=dokan-dashboard#/subscriptions),
    // a @wedevs/plugin-ui DataViews grid (same family as the other admin DataViews
    // pages). No reliable search box on Pro DataViews pages, so we scan the rows.
    adminSubscriptions = {
        url: toPath('wp-admin/admin.php?page=dokan-dashboard#/subscriptions'),
        // The DataViews table + its data rows (tbody rows carry the vendor/pack data).
        table: '.dataviews-view-table, table.dataviews-view-table',
        rows: '.dataviews-view-table tbody tr, table.dataviews-view-table tbody tr',
    };

    async gotoBlockCheckout(): Promise<void> {
        await this.page.goto(this.checkout.blockUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.blockSelectors.placeOrder).waitFor({ state: 'visible', timeout: 30_000 });
    }

    /**
     * Fill the WC block checkout CONTACT + SHIPPING address as a GUEST (no saved address).
     * Field ids are the stable WC-Blocks ids (#email, #shipping-*). State options populate after
     * the country is set, so set country first. WC Blocks debounces an update_checkout after address
     * edits, so settle before the gateway/PE step.
     */
    async fillBlockGuestDetails(d: { email: string; firstName: string; lastName: string; address: string; city: string; state: string; postcode: string; country: string }): Promise<void> {
        const p = this.page;
        await p.locator('#email').fill(d.email);
        await p.locator('#shipping-country').selectOption(d.country);
        await p.locator('#shipping-first_name').fill(d.firstName);
        await p.locator('#shipping-last_name').fill(d.lastName);
        await p.locator('#shipping-address_1').fill(d.address);
        await p.locator('#shipping-city').fill(d.city);
        await p.locator('#shipping-state').selectOption(d.state).catch(() => undefined); // not all countries have states
        await p.locator('#shipping-postcode').fill(d.postcode);
        await p.waitForLoadState('networkidle').catch(() => undefined);
        await p.waitForTimeout(1_500); // let the debounced totals/shipping recompute settle
    }

    /** Select the Stripe Connect block payment method and wait for the PE to mount. */
    async selectBlockGateway(): Promise<void> {
        const radio = this.page.locator(this.blockSelectors.gatewayRadio);
        const mount = this.page.locator(this.checkout.blockMount);
        await radio.waitFor({ state: 'visible', timeout: 30_000 });
        // The WC Checkout block re-renders on hydration / shipping-rate + totals
        // updates, which can swallow the first radio click (the method never gets
        // selected, so its Payment Element never mounts — the observed cold-start
        // flake). Re-select until the PE actually mounts.
        const deadline = Date.now() + 45_000;
        while (Date.now() < deadline) {
            await radio.click({ timeout: 8_000 }).catch(() => undefined);
            try {
                await mount.waitFor({ state: 'visible', timeout: 8_000 });
                return;
            } catch {
                await this.page.waitForTimeout(700); // block still settling — re-select
            }
        }
        // Last attempt with a clear failure if the PE genuinely never mounts.
        await mount.waitFor({ state: 'visible', timeout: 10_000 });
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

    /**
     * Regression guard for the "Could not initialize Stripe" bug on the recurring
     * vendor-subscription (product_pack) block checkout: after the gateway is
     * selected, assert the Payment Element actually mounted (container visible + a
     * real Stripe card iframe rendered) and that NO init error surfaced. Does NOT
     * place an order. Call after selectBlockGateway().
     */
    async assertBlockPaymentElementReady(): Promise<void> {
        await expect(
            this.page.locator(this.checkout.blockMount),
            'Stripe Connect Payment Element should mount on the subscription-pack block checkout',
        ).toBeVisible({ timeout: 30_000 });
        // The PE-init failure renders the singular ".dokan-stripe-pe-error" list ("Could not initialize Stripe")
        // in place of the card fields — assert it is absent.
        await expect(
            this.page.locator('ul.dokan-stripe-pe-error'),
            'no Stripe Payment Element init error ("Could not initialize Stripe") should appear',
        ).toHaveCount(0);
        await expect(this.page.locator('body'), 'checkout must not show a Stripe init error').not.toContainText(/could not initialize stripe/i);
        // Strongest proof the Elements bootstrapped: a real Stripe card iframe is present (throws if none mounts).
        await this.findStripePeFrame();
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
        // Cold-start tolerant: on the first CI attempt the confirm (and thus the
        // ACS challenge appearing) is slow, so poll well past the warm timing.
        const deadline = Date.now() + 75_000;
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

    // ============================================
    // VENDOR SUBSCRIPTION DASHBOARD (cancel / reactivate / active-pack state)
    // ============================================

    // Vendor subscription packs page (DPS). The active-pack banner + the
    // cancel/reactivate form render here once the vendor holds an active pack.
    // The cancel/reactivate form id + submit name are shared; the hidden input
    // (dps_cancel_subscription vs dps_activate_subscription) + the success ?msg
    // distinguish the two server-side states.
    // Vendor subscription on the NEW React dashboard (/dashboard/new/#/subscription). The "Current Subscription"
    // card shows the active pack + a Cancel/Activate action. Cancel opens a confirm modal ("Yes, Cancel") then
    // calls REST (no navigation — SPA re-render) → a "still active till" alert + the action flips to "Activate".
    // Reactivate calls REST directly (no modal) → the alert clears + the action flips back to "Cancel".
    vendorSubscription = {
        dashboardUrl: toPath('dashboard/new/#/subscription?tab=packs'),
        cardTitle: 'Current Subscription',
    };

    async gotoVendorSubscriptionDashboard(): Promise<void> {
        await this.page.goto(this.vendorSubscription.dashboardUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await closeAnnouncementModal(this.page);
        // Wait for the React Current Subscription card to render.
        await this.page
            .getByText(this.vendorSubscription.cardTitle, { exact: false })
            .first()
            .waitFor({ state: 'visible', timeout: 30_000 });
    }

    /** VS4.1: assert the React Current Subscription card shows the active pack + the Cancel control. */
    async assertActivePackBanner(packTitle?: string): Promise<void> {
        await this.gotoVendorSubscriptionDashboard();
        await expect(
            this.page.getByText(/You are using/i).first(),
            'Current Subscription card should show the active pack for a subscribed vendor',
        ).toBeVisible({ timeout: 20_000 });
        if (packTitle) {
            await expect(this.page.getByText(packTitle, { exact: false }).first(), 'card names the active pack').toBeVisible();
        }
        await expect(
            this.page.getByRole('button', { name: 'Cancel', exact: true }),
            'the Cancel control renders for an active recurring subscription',
        ).toBeVisible();
    }

    /** VS5.1: cancel the recurring subscription via the React UI (Cancel → confirm modal → REST, SPA re-render). */
    async cancelSubscriptionFromDashboard(): Promise<void> {
        await this.gotoVendorSubscriptionDashboard();
        await this.page.getByRole('button', { name: 'Cancel', exact: true }).click();
        const confirm = this.page.getByRole('button', { name: 'Yes, Cancel' });
        await expect(confirm, 'a Cancel confirmation modal should appear').toBeVisible({ timeout: 10_000 });
        await confirm.click();
        // REST call → SPA re-render (no navigation): the cancelled-but-active alert appears + the action flips.
        await expect(
            this.page.getByText(/still active till/i).first(),
            'after cancel, the "still active till" alert should appear',
        ).toBeVisible({ timeout: 20_000 });
        await expect(
            this.page.getByRole('button', { name: 'Activate', exact: true }),
            'after cancel, the action should flip to Activate',
        ).toBeVisible();
    }

    /** VS5.2: reactivate the cancelled-but-active subscription via the React UI (Activate → REST, no modal). */
    async reactivateSubscriptionFromDashboard(): Promise<void> {
        await this.gotoVendorSubscriptionDashboard();
        await this.page.getByRole('button', { name: 'Activate', exact: true }).click();
        // Direct REST call → the cancelled alert clears and the action flips back to Cancel.
        await expect(
            this.page.getByText(/still active till/i),
            'after reactivate, the cancelled alert should clear',
        ).toHaveCount(0, { timeout: 20_000 });
        await expect(
            this.page.getByRole('button', { name: 'Cancel', exact: true }),
            'after reactivate, the action should flip back to Cancel',
        ).toBeVisible({ timeout: 20_000 });
    }

    // ============================================
    // SAVED CARDS (Suite F) — /my-account/payment-methods/
    // ============================================

    /** Open the customer's saved payment-methods page (logged-in context required). */
    async gotoMyAccountPaymentMethods(): Promise<void> {
        await this.page.goto(this.myAccount.url);
        await this.page.waitForLoadState('domcontentloaded');
        // The table only renders when ≥1 token exists; the page heading always does.
        await this.page.locator(this.myAccount.table).first().waitFor({ state: 'visible', timeout: 30_000 });
    }

    /**
     * Save a card via My Account → Add payment method (SetupIntent → pm ATTACHED on Stripe,
     * unlike the block-checkout save path). Fills the PE, submits form#add_payment_method
     * (→ confirmSetup → redirect back → finalise_add_payment_method attaches + tokenizes),
     * and waits for the saved-card redirect to /payment-methods/.
     */
    async addCardViaMyAccount(card: string = STRIPE_CARDS.success): Promise<void> {
        // Same Link/hCaptcha neutralisation classic checkout needs (CI runner IPs can escalate to a visible challenge).
        await this.page.route('**/stripe-connect-express-classic.js*', route =>
            route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
        );
        await this.page.route(/hcaptcha/i, route => route.abort());
        // Do NOT block the Link JSON endpoints — see gotoClassicCheckout: aborting get-cookie throws an uncaught
        // "Failed to fetch" that races the gateway JS init and can break the SetupIntent confirm; hCaptcha is
        // already blocked above so Link degrades on its own.
        await this.page.goto(this.addPaymentMethod.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.addPaymentMethod.form).waitFor({ state: 'visible', timeout: 30_000 });
        const radio = this.page.locator(this.addPaymentMethod.gatewayRadio);
        if ((await radio.count().catch(() => 0)) && !(await radio.isChecked().catch(() => false))) {
            const label = this.page.locator(this.addPaymentMethod.gatewayLabel);
            await label.scrollIntoViewIfNeeded().catch(() => undefined);
            await label.click().catch(() => undefined);
        }
        await this.page.locator(this.addPaymentMethod.mount).waitFor({ state: 'visible', timeout: 30_000 });
        await this.fillCardDetails(card);
        await this.page.locator(this.addPaymentMethod.submit).click();
        await this.page.waitForURL('**/my-account/payment-methods/**', { timeout: 90_000 });
        await this.page.locator(this.myAccount.table).first().waitFor({ state: 'visible', timeout: 20_000 });
    }

    /**
     * F2: assert a saved card is listed as "<Brand> ending in <last4>". WC core
     * renders the method cell as sprintf('%1$s ending in %2$s', brandLabel, last4),
     * so we match the last4 (the brand label varies — Visa/visa).
     */
    async assertSavedCardListed(last4: string = '4242'): Promise<void> {
        const row = this.page.locator(this.myAccount.rows).filter({ hasText: new RegExp(`ending in ${last4}`, 'i') });
        await expect(row.first(), `saved card ending in ${last4} should be listed`).toBeVisible({ timeout: 20_000 });
    }

    /**
     * F4: set the first saved card as default. WC nonce-redirects to
     * set-default-payment-method/{id} then back; the chosen row then carries the
     * `default-payment-method` class. Idempotent only at the UI level — call on a
     * row that is not already default.
     */
    async setSavedCardDefault(): Promise<void> {
        await this.page.locator(this.myAccount.rows).first().waitFor({ state: 'visible', timeout: 20_000 });
        const defaultLink = this.page.locator(this.myAccount.rows).locator(this.myAccount.defaultBtn).first();
        // WC marks the FIRST saved token as the default automatically (set_users_default), which already
        // fires woocommerce_payment_token_set_default → the gateway sets the Stripe default. So when there
        // is a single card there is NO "Make default" link to click — the default state already holds.
        // Click it only when a non-default card actually offers it; either way assert a default row exists.
        if (await defaultLink.count().catch(() => 0)) {
            await Promise.all([
                this.page.waitForLoadState('domcontentloaded'),
                defaultLink.click(),
            ]);
        }
        await expect(
            this.page.locator(this.myAccount.defaultRow).first(),
            'a saved card should be marked as the default payment method',
        ).toBeVisible({ timeout: 20_000 });
    }

    /**
     * F5: delete the first saved card. WC nonce-redirects to
     * delete-payment-method/{id} then back; the dokan-stripe-connect path also
     * detaches the PaymentMethod on Stripe.
     */
    async deleteSavedCard(): Promise<void> {
        const deleteLink = this.page.locator(this.myAccount.rows).locator(this.myAccount.deleteBtn).first();
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            deleteLink.click(),
        ]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /** F5: assert no saved-card row ends in the given last4 (deleted). */
    async assertSavedCardAbsent(last4: string = '4242'): Promise<void> {
        const row = this.page.locator(this.myAccount.rows).filter({ hasText: new RegExp(`ending in ${last4}`, 'i') });
        await expect(row, `saved card ending in ${last4} should be gone`).toHaveCount(0, { timeout: 20_000 });
    }

    /**
     * F1: tick the WC block "Save payment information to my account…" checkbox so
     * the entered card is tokenized on order placement. The block renders the WC
     * core save-card control, matched by its label text (the checkbox id varies
     * across WC versions). Call after selectBlockGateway() / before placing.
     */
    async tickSaveCardBlock(): Promise<void> {
        const checkbox = this.page.getByLabel(/save payment information/i).first();
        await checkbox.waitFor({ state: 'visible', timeout: 20_000 });
        await checkbox.check();
        await expect(checkbox, 'block save-card checkbox should be ticked').toBeChecked();
    }

    /**
     * F3: select an existing saved-token radio at CLASSIC checkout instead of
     * entering a new card. WC core renders the token radios as
     * input[name="wc-dokan-stripe-connect-payment-token"] (checkout.savedTokenRadios)
     * with value=WC token db id plus a 'new' option. With no id, picks the first
     * real saved token (value !== 'new'); otherwise the radio matching tokenDbId.
     * Server then routes through TokenProcessor (off-session charge on the pm_).
     */
    async selectSavedTokenClassic(tokenDbId?: string | number): Promise<void> {
        const radios = this.page.locator(this.checkout.savedTokenRadios);
        await radios.first().waitFor({ state: 'attached', timeout: 20_000 });
        const target =
            tokenDbId !== undefined
                ? radios.filter({ has: this.page.locator(`[value="${tokenDbId}"]`) }).first()
                : radios.filter({ hasNot: this.page.locator('[value="new"]') }).first();
        // The radio sits under a styled label; check() handles the underlying input.
        await target.check();
        await expect(target, 'a saved-token radio should be selected (not "new")').toBeChecked();
    }

    // ============================================
    // SETTINGS-BEHAVIOUR MATRIX (negative / gateway-availability)
    // ============================================

    /**
     * S3/S4: navigate to checkout and assert the dokan-stripe-connect payment
     * method is NOT available (radio + Payment Element mount both absent). Used
     * when the gateway is disabled or "almost ready" (not is_ready), so WC drops
     * it from the available gateways.
     */
    async assertGatewayAbsentAtCheckout(variant: 'classic' | 'block' = 'block'): Promise<void> {
        if (variant === 'classic') {
            await this.gotoClassicCheckout();
            await expect(
                this.page.locator(this.checkout.gatewayRadio),
                'Stripe Connect classic radio should be absent when the gateway is unavailable',
            ).toHaveCount(0, { timeout: 20_000 });
            await expect(
                this.page.locator(this.checkout.classicMount),
                'Stripe Connect classic Payment Element should never mount',
            ).toHaveCount(0);
            return;
        }
        await this.gotoBlockCheckout();
        await expect(
            this.page.locator(this.blockSelectors.gatewayRadio),
            'Stripe Connect block radio should be absent when the gateway is unavailable',
        ).toHaveCount(0, { timeout: 20_000 });
        await expect(
            this.page.locator(this.checkout.blockMount),
            'Stripe Connect block Payment Element should never mount',
        ).toHaveCount(0);
    }

    /**
     * S1: after the gateway is selected and place-order is clicked, assert the
     * non-connected-seller validation error fires (text /enabled Stripe as a
     * payment gateway/) and no order is created. The block runs at WC validation
     * before any Stripe confirm, so this is a card-less negative.
     */
    async assertCheckoutBlockedForNonConnectedVendor(variant: 'classic' | 'block' = 'classic'): Promise<void> {
        const errorSelector = variant === 'classic' ? this.checkout.error : this.blockSelectors.error;
        const placeOrder = variant === 'classic' ? this.checkout.placeOrderClassic : this.blockSelectors.placeOrder;
        const error = this.page.locator(errorSelector).first();
        // CLASSIC: the non-connected block is a SERVER validation that only runs once the WC form POSTS
        // (wc-ajax=checkout) — which the gateway does only after the in-page Stripe confirm. A cold-CI confirm can
        // risk-stall and never post, so the error never renders (the observed CI flake). Track whether the
        // confirm/post fired and re-click once in the warm session if it didn't (the warm attempt isn't
        // risk-challenged). BLOCK runs validation server-side before any confirm, so it needs no retry.
        let posted = false;
        const onReq = (req: { url(): string }) => {
            if (/payment_intents\/[^/]+\/confirm|wc-ajax=checkout/i.test(req.url())) posted = true;
        };
        this.page.on('request', onReq);
        try {
            if (variant === 'classic') {
                // Cold-CI: the block error only renders once the WC form POSTS (the confirm fires first). Re-click
                // up to 3× (every 15s) until the post reaches the server, guarded so a real post isn't double-fired.
                for (let attempt = 0; attempt < 3 && !posted; attempt++) {
                    await this.waitForCheckoutSettled();
                    await this.page.locator(placeOrder).click();
                    const start = Date.now();
                    while (Date.now() - start < 15_000) {
                        if (posted || (await error.isVisible().catch(() => false))) break;
                        await this.page.waitForTimeout(1_000);
                    }
                }
            } else {
                await this.page.locator(placeOrder).click();
            }
            await expect(error, 'non-connected vendor should block checkout with an error notice').toBeVisible({
                timeout: 40_000,
            });
            await expect(error, 'error should name the Stripe-not-configured cause').toContainText(
                /enabled Stripe as a payment gateway|Please remove/i,
            );
            await expect(this.page, 'a blocked checkout must not reach order-received').not.toHaveURL(/order-received/);
        } finally {
            this.page.off('request', onReq);
        }
    }

    /**
     * S4: assert the Stripe Connect withdraw method never registers on admin Dokan
     * settings → Withdraw Options (gateway not ready). Does NOT reuse
     * gotoWithdrawOptions(), which waits for the toggle to ATTACH and would hang
     * here — instead it opens the tab and asserts the toggle is absent.
     */
    async assertStripeWithdrawMethodAbsent(): Promise<void> {
        await this.gotoDokanSettings();
        await this.page.locator(this.admin.withdrawOptionsTab).click();
        await expect(
            this.page.locator(this.admin.withdrawMethodToggleInput(StripeConnectPage.WITHDRAW_METHOD)),
            'Stripe Connect withdraw method should not register when the gateway is not ready',
        ).toHaveCount(0, { timeout: 20_000 });
    }

    /**
     * S4: on the vendor payment settings page, assert the "Direct to Stripe
     * Connect" menu link and the connect button are both absent (the withdraw
     * method is unregistered, so the connect/manage UI never renders).
     */
    async assertVendorConnectUiAbsent(): Promise<void> {
        await this.page.goto(this.vendor.paymentSettingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await expect(
            this.page.locator(this.vendor.addStripeConnectLink),
            'the "Direct to Stripe Connect" menu link should be absent when the method is unregistered',
        ).toHaveCount(0, { timeout: 20_000 });
        await expect(
            this.page.locator(this.vendor.connectButton),
            'the vendor Stripe connect button should be absent when the method is unregistered',
        ).toHaveCount(0);
    }

    // ============================================
    // ADMIN SUBSCRIPTIONS (VS7) — React DataViews
    // ============================================

    /** Open the admin Subscriptions DataViews page and wait for the grid to render. */
    async gotoAdminSubscriptions(): Promise<void> {
        await this.page.goto(this.adminSubscriptions.url);
        await this.page.waitForLoadState('domcontentloaded');
        // Client-side DataViews grid — wait for at least one data row to render.
        await this.page.locator(this.adminSubscriptions.rows).first().waitFor({ state: 'visible', timeout: 30_000 });
    }

    /**
     * VS7: assert the subscribed vendor appears in the Subscriptions DataViews
     * list. No reliable search box on Pro DataViews pages, so scan the rows for
     * one containing the vendor store name (or the pack title).
     */
    async assertVendorInSubscriptionsList(storeNameOrPackTitle: string): Promise<void> {
        const row = this.page
            .locator(this.adminSubscriptions.rows)
            .filter({ hasText: storeNameOrPackTitle });
        await expect(
            row.first(),
            `subscriptions list should contain a row for "${storeNameOrPackTitle}"`,
        ).toBeVisible({ timeout: 20_000 });
    }

    // ============================================
    // EDGE (C5) — block coupon
    // ============================================

    /**
     * C5: apply a coupon at block checkout. Opens the collapsible coupon panel
     * (idempotent — only clicks the expander when the form is hidden), fills the
     * code, applies, and waits for the totals to refresh (an apply-coupon Store
     * API round-trip). Triggers the WC update that re-renders the payment box.
     */
    async applyCouponBlock(code: string): Promise<void> {
        const form = this.page.locator(this.blockCoupon.form);
        if (!(await form.isVisible().catch(() => false))) {
            await this.page.locator(this.blockCoupon.panelButton).first().click();
        }
        const input = this.page.locator(this.blockCoupon.input).first();
        await input.waitFor({ state: 'visible', timeout: 20_000 });
        await input.fill(code);
        // Apply, then wait for the Store API apply-coupon response so the totals
        // (and the re-rendered payment box) have settled before continuing.
        await Promise.all([
            this.page
                .waitForResponse(
                    res => /wc\/store\/v\d+\/cart\/apply-coupon|wc-ajax=apply_coupon/i.test(res.url()),
                    { timeout: 20_000 },
                )
                .catch(() => undefined),
            this.page.locator(this.blockCoupon.applyButton).first().click(),
        ]);
        await this.waitForCheckoutSettled();
    }

    /**
     * Select a WC-block shipping method by its label (e.g. /free shipping/i) and wait for the
     * Store-API rate change + the re-rendered payment box to settle. Changing the shipping method
     * fires update_checkout, which re-renders the totals and RE-MOUNTS the Stripe Payment Element.
     */
    async selectBlockShippingMethod(name: string | RegExp): Promise<void> {
        const control = this.page.locator('.wc-block-components-shipping-rates-control').first();
        await control.waitFor({ state: 'visible', timeout: 20_000 });
        await Promise.all([
            this.page
                .waitForResponse(res => /wc\/store\/v\d+\/cart\/(select-shipping-rate|update-customer)/i.test(res.url()), { timeout: 20_000 })
                .catch(() => undefined),
            control
                .getByRole('radio', { name })
                .first()
                .click({ timeout: 10_000 })
                .catch(async () => {
                    // Fallback: click the option label carrying the method name.
                    await control.locator('.wc-block-components-radio-control__option, label').filter({ hasText: name }).first().click();
                }),
        ]);
        await this.waitForCheckoutSettled();
    }
}
