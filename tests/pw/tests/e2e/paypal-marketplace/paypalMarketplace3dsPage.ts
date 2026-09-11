import { PERSISTENT_CART_META, VENDOR1_EMAIL } from './paypalMarketplaceShared';
import { test, expect, request } from '@utils/test';
import type { Browser } from '@utils/test';
import { BASE_URL, SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage } from './paypalMarketplacePage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, PAYPAL_MERCHANTS, hasCredentials, ensurePayPalConfigured, getPayPalStatus, seedPayPalConnectedVendor, ensureCustomerAddress, ensureClassicCheckoutPage, mergeGatewaySettings, cardFormMarkers, describeProbe } from './helpers';
import type { PayPalStatus } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const CHECKOUT = PayPalMarketplacePage.classic;

export const UCC = PayPalMarketplacePage.ucc;

/**
 * PayPal Marketplace — 3D Secure gating (PP-3DS-01 … PP-3DS-04).
 *
 * ---------------------------------------------------------------------------
 * What this area can and cannot prove
 * ---------------------------------------------------------------------------
 *
 * The module's only 3DS surface is the Unbranded Credit Card (UCC) hosted-fields path. The
 * challenge itself is requested by the browser SDK — `hf.submit({ contingencies: ['3D_SECURE'], … })`
 * at `assets/src/js/paypal-checkout.js:410` — and a COMPLETED challenge is unreachable from a test:
 * it needs a real card, a real issuer ACS page, and a PayPal account that PayPal itself has vetted
 * for `PPCP_CUSTOM`. That is why PP-3DS-04 is declared not-automatable rather than faked.
 *
 * What IS deterministic, and what this file therefore tests, is the GATING that decides whether the
 * 3DS-capable card form is rendered at all. Dokan makes that decision entirely server-side, in
 * `Helper::is_ucc_enabled()` (`includes/Helper.php:178-190`) plus a per-seller check in
 * `CartManager::is_ucc_enabled_for_all_seller_in_cart()` (`includes/Cart/CartManager.php:48-66`):
 *
 *   1. `Helper::get_button_type() === 'smart'`
 *   2. `Helper::is_ucc_mode_allowed()` — the `ucc_mode` gateway setting is `'yes'`
 *   3. the WooCommerce BASE country is one of the seven UCC countries (AU, CA, FR, IT, ES, US, GB)
 *   4. the store currency is in that country's UCC currency list
 *   5. every seller in the cart carries the mode-swapped `_dokan_paypal_test_enable_for_ucc` meta
 *
 * Gates 1-4 are all local state this suite can set. Gate 5 is a user meta the test mu-plugin seeds
 * (`seedPayPalConnectedVendor(..., { ucc: true })`). None of them consults PayPal, so the RENDERING
 * of the card form is fully reachable locally even though a working hosted field is not: PayPal-side
 * `PPCP_CUSTOM` vetting only decides whether `paypal.HostedFields.isEligible()` returns true in the
 * browser, which happens after — and independently of — the markup this file asserts on.
 *
 * ---------------------------------------------------------------------------
 * Why every negative here carries a positive control
 * ---------------------------------------------------------------------------
 *
 * "The card fields are absent" is trivially true on a site where the gateway is not ready, the cart
 * is empty, the checkout page did not render, or the vendor is not connected. Each of the three
 * negatives therefore does the same three things before asserting an absence:
 *
 *   - proves `is_ready === true` over the mu-plugin `/status` route, in the same test;
 *   - opens ALL FIVE gates and proves the UCC surface really does render (the positive control);
 *   - closes exactly ONE gate, and proves the surface disappeared while the gateway itself is
 *     still offered at checkout.
 *
 * Without the middle step the negatives would pass identically against a module with the UCC
 * feature ripped out entirely, which is the exact fake-green shape this suite exists to prevent.
 *
 * Not `test.describe.serial`, and never tagged `@serial`. `.serial` aborts the rest of the group on
 * the first failure — on 2026-07-31 that silently erased 46 of 68 cases from a run that still
 * summarised as green — and `@serial` is grepInverted out of BOTH CI lanes at
 * `playwright.config.ts:13`, which would delete this file from CI without a single reported failure.
 * A file already runs sequentially in one worker, so ordering is unaffected.
 */

/* ------------------------------------------------------------------ */
/* Gate vocabulary — copied from the product, with its source          */
/* ------------------------------------------------------------------ */

/**
 * `Helper::get_advanced_credit_card_debit_card_supported_countries()` (`Helper.php:199-212`).
 * Seven entries; the value is a display name, so the CODE is the key and a membership test must
 * look at keys. Mirrored here as a plain list because that is all a country check needs.
 */
export const UCC_COUNTRIES: readonly string[] = ['AU', 'CA', 'FR', 'IT', 'ES', 'US', 'GB'];

/**
 * The mu-plugin `/status` route also reports that same list as the PRODUCT computes it
 * (`array_keys( Helper::get_advanced_credit_card_debit_card_supported_countries() )`, filters applied),
 * which is what PP-3DS-02 checks the mirror above against.
 *
 * Declared here rather than on `PayPalStatus` in `helpers.ts`: that interface is shared by every PayPal
 * spec and this one field is read in this file only. Optional, so a run against an older copy of the
 * mu-plugin fails on the assertion with a named reason instead of throwing on an undefined value.
 */
export type UccStatus = PayPalStatus & { ucc_supported_countries?: string[] };

/** `Helper::get_advanced_credit_card_debit_card_us_supported_currencies()` (`Helper.php:368-379`). */
export const UCC_US_CURRENCIES: readonly string[] = ['AUD', 'CAD', 'EUR', 'GBP', 'JPY', 'USD'];

/** `Helper::get_advanced_credit_card_debit_card_non_us_supported_currencies()` (`Helper.php:336-357`). */
export const UCC_NON_US_CURRENCIES: readonly string[] = [
    'AUD',
    'CAD',
    'CHF',
    'CZK',
    'DKK',
    'EUR',
    'GBP',
    'HKD',
    'HUF',
    'JPY',
    'NOK',
    'NZD',
    'PLN',
    'SEK',
    'SGD',
    'USD',
];

/**
 * The country PP-3DS-02 switches the store to.
 *
 * Germany is deliberate rather than arbitrary: it is absent from the seven UCC countries but PRESENT
 * in `Helper::get_branded_payment_supported_countries()`, and gateway availability
 * (`PayPal::is_available()` → `Helper::is_ready()` + `Helper::validate_cart_items()`) does not look
 * at the base country at all. So the gateway stays offered at checkout under DE, and the only thing
 * that changes is the UCC gate — which is what makes the resulting absence attributable.
 */
export const NON_UCC_COUNTRY = 'DE';

/** WooCommerce stores base location as `COUNTRY` or `COUNTRY:STATE`; `get_base_country()` reads the first half. */
export const BASE_COUNTRY_OPTION = 'woocommerce_default_country';

/* ------------------------------------------------------------------ */
/* Page markers                                                        */
/* ------------------------------------------------------------------ */

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/**
 * The UCC / 3DS surface, harvested from the product rather than from a rendered page.
 *
 * Two independent server-rendered markers, produced by two different code paths, which is what makes
 * the probe hard to fool:
 *
 *   - The card form itself comes from `PayPal::payment_fields()` (`PaymentMethods/PayPal.php:182-190`),
 *     which loads `templates/3DS-payment-option.php` only when
 *     `CartManager::is_ucc_enabled_for_all_seller_in_cart()` is true. That template is also the only
 *     place `#payments-sdk__contingency-lightbox` — the container the 3DS challenge is drawn into —
 *     ever appears, so its presence is the closest observable proxy for "3DS is wired up here".
 *   - The unbranded Pay button comes from `CartHandler::display_paypal_button()`
 *     (`Cart/CartHandler.php:271-278`), hooked to `woocommerce_review_order_after_submit`. It is NOT
 *     gated on gateway availability, only on the smart button type and the same UCC check, so it
 *     moves independently of the payment-method list.
 *
 * Everything is counted, never asserted visible: WooCommerce keeps every unselected `.payment_box`
 * in the DOM at `display:none`, and `#paypal-button-container` ships with an inline `display:none`
 * that only the PayPal SDK removes. A visibility assertion here would fail on a correctly rendered
 * page and would have nothing to do with the gate under test.
 */

/** Single-site persistent-cart user meta — the exact row `dbUtils.clearCustomerCart()` deletes. */


/**
 * The vendor's PayPal sandbox account login, env-driven like every other identity in this suite.
 * Hardcoding it would seed the vendor's `..._email` meta with the wrong account on any machine whose
 * sandbox business account differs from the QA one, while the merchant id seeded beside it stayed
 * right — a mismatch no assertion in this file would catch.
 */


/* ------------------------------------------------------------------ */
/* Stored state                                                        */
/* ------------------------------------------------------------------ */

/**
 * The raw stored base location, `COUNTRY` or `COUNTRY:STATE`, or `null` when the option row does not
 * exist at all.
 *
 * Read and restored WHOLE, never as the derived country. Writing back only the country half would
 * silently drop the store's base STATE — the default install is `US:NY` — and take WooCommerce tax
 * rates and shipping zones with it for every later spec on the worker.
 *
 * The absent row is kept DISTINCT from the empty string on purpose: collapsing it to `''` would make
 * the restore path write an empty `woocommerce_default_country` into a store that had no such row,
 * changing the base location for every later spec instead of leaving it alone.
 */
export async function readBaseLocation(): Promise<string | null> {
    const value = await dbUtils.getOptionValueOrNull(BASE_COUNTRY_OPTION);
    return value === null || value === undefined ? null : String(value);
}

/**
 * Put the base location back exactly as it was found — including "no row at all".
 *
 * `dbUtils.setOptionValue()` cannot express an absent option (it INSERTs), so a store that started
 * without a `woocommerce_default_country` row has the row DELETED again rather than being left
 * holding a value this file invented.
 *
 * `undefined` means the baseline was never captured (beforeAll died before its first read), and is a
 * deliberate no-op: deleting or rewriting the store's base location off an unknown baseline would do
 * more damage than the failure that got us here.
 */
export async function restoreBaseLocation(original: string | null | undefined): Promise<void> {
    if (original === undefined) {
        return;
    }
    if (original === null) {
        await dbUtils.deleteOptionRow([BASE_COUNTRY_OPTION]);
        return;
    }
    await dbUtils.setOptionValue(BASE_COUNTRY_OPTION, original, false);
}

/** Readable rendering of a base location for assertion messages, with the two absent cases named apart. */
export const baseLocationLabel = (value: string | null | undefined): string =>
    value === undefined ? '(never captured — beforeAll died before reading it)' : (value ?? '(no option row)');

/** The country half, which is exactly what `WC()->countries->get_base_country()` returns. */
export function countryOf(baseLocation: string): string {
    return baseLocation.split(':')[0] ?? '';
}

/** The base country as `Helper::is_ucc_enabled()` sees it; `''` when no base location is stored. */
export async function readBaseCountry(): Promise<string> {
    return countryOf((await readBaseLocation()) ?? '');
}

/** The country and currency halves of `Helper::is_ucc_enabled()`, evaluated exactly as the product does. */
export function countryCurrencyGatesOpen(country: string, currency: string): boolean {
    if (!UCC_COUNTRIES.includes(country)) {
        return false;
    }
    const currencies = country === 'US' ? UCC_US_CURRENCIES : UCC_NON_US_CURRENCIES;
    return currencies.includes(currency);
}

/* ------------------------------------------------------------------ */
/* Checkout probe                                                      */
/* ------------------------------------------------------------------ */

export interface CheckoutProbe {
    /** Is the PayPal Marketplace radio rendered at all? The positive control for every absence below. */
    gatewayOffered: boolean;
    container: number;
    cardNumber: number;
    cardExpiry: number;
    cvv: number;
    nameOnCard: number;
    contingencyLightbox: number;
    unbranded: number;
    unbrandedButton: number;
    sdkScript: number;
    sdkSrc: string | null;
    /**
     * `dokan_paypal.is_ucc_enabled` as the browser sees it. `wp_localize_script()` casts every scalar
     * to a string, so PHP `true` arrives as `'1'` and PHP `false` as `''` — the checkout script relies
     * on that truthiness at `paypal-checkout.js:277`. `null` means the localized object is absent
     * entirely, which is what a non-smart button type produces.
     */
    localizedUccEnabled: string | null;
}

/**
 * Load the classic checkout as the customer with one product in the cart, and report every UCC
 * marker on the page.
 *
 * Deliberately local rather than added to `PayPalMarketplacePage`: the markers it collects belong to
 * one gate in one module surface and are not an interaction any other spec needs, and the shared page
 * object is being extended by sibling agents in parallel — editing it for a private read would risk a
 * write race for no reuse. The two interactions that ARE shared (`addProductToCart`) come from the
 * page object.
 */
export async function probeCheckout(browser: Browser, productId: string): Promise<CheckoutProbe> {
    // `baseURL` is passed explicitly and never left to the runner: `PayPalMarketplacePage.addProductToCart()`
    // navigates with a RELATIVE url (`/?p=…&add-to-cart=…`), and a relative goto in a context that carries no
    // base url fails outright with "Cannot navigate to invalid URL" — which would kill every probe in this file
    // before a single UCC marker was read, i.e. before the positive control could prove anything.
    const ctx = await browser.newContext({ storageState: customerAuth, baseURL: BASE_URL });
    const page = await ctx.newPage();
    try {
        const paypal = new PayPalMarketplacePage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await paypal.addProductToCart(productId);

        // The cart is verified BEFORE navigating, and off the database rather than off the page,
        // because the classic `[woocommerce_checkout]` shortcode renders NOTHING for an empty cart
        // (`WC_Shortcode_Checkout::checkout()` returns early). An empty cart is therefore
        // indistinguishable from "no payment methods offered" on the checkout page itself, and every
        // absence assertion in this file would pass for that wrong reason. WooCommerce writes this
        // meta from the `woocommerce_add_to_cart` action, which fires only on a SUCCESSFUL add.
        const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
        expect(
            persistentCart,
            `the customer cart must hold product ${productId} before checkout is opened — an empty cart renders no payment methods and no order review at all, which would make every "UCC card fields are absent" assertion in this file pass without the UCC gate having been exercised`,
        ).toMatch(new RegExp(`"product_id";(i:${productId};|s:\\d+:"${productId}")`));

        await page.goto(CHECKOUT.url, { waitUntil: 'domcontentloaded' });
        // WooCommerce renders #place_order even when no gateway is available, so it is a safe anchor
        // for the positive and the negative cases alike: it proves the order form rendered without
        // implying anything about which gateways it offers.
        await expect(page.locator(CHECKOUT.placeOrder), 'the classic checkout page must render the order form before any UCC marker can be read from it').toBeVisible({
            timeout: 60_000,
        });

        const sdkScript = await page.locator(UCC.sdkScript).count();

        return {
            gatewayOffered: (await page.locator(CHECKOUT.radio).count()) > 0,
            container: await page.locator(UCC.container).count(),
            cardNumber: await page.locator(UCC.cardNumber).count(),
            cardExpiry: await page.locator(UCC.cardExpiry).count(),
            cvv: await page.locator(UCC.cvv).count(),
            nameOnCard: await page.locator(UCC.nameOnCard).count(),
            contingencyLightbox: await page.locator(UCC.contingencyLightbox).count(),
            unbranded: await page.locator(UCC.unbranded).count(),
            unbrandedButton: await page.locator(UCC.unbrandedButton).count(),
            sdkScript,
            sdkSrc: sdkScript > 0 ? await page.locator(UCC.sdkScript).first().getAttribute('src') : null,
            localizedUccEnabled: await page.evaluate(() => {
                const w = window as unknown as { dokan_paypal?: Record<string, unknown> };
                if (!w.dokan_paypal) {
                    return null;
                }
                const value = w.dokan_paypal['is_ucc_enabled'];
                return value === undefined || value === null ? '' : String(value);
            }),
        };
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Gate manipulation                                                   */
/* ------------------------------------------------------------------ */

/**
 * Open all five local UCC gates. Country and currency are NOT written here — they are environment
 * state each test asserts on instead, so a store that cannot host UCC skips with a named reason
 * rather than silently having its configuration rewritten by a test.
 */
export async function openAllLocalUccGates(): Promise<void> {
    await mergeGatewaySettings({ enabled: 'yes', test_mode: 'yes', button_type: 'smart', ucc_mode: 'yes' });
    await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL, ucc: true });
}

/**
 * Return the site to the suite's baseline: smart button, UCC OFF, original base country, and a vendor
 * whose UCC meta is cleared.
 *
 * The vendor reset matters beyond this file. `seedPayPalConnectedVendor` defaults `ucc` to false
 * precisely because UCC is not genuinely seedable end to end, so leaving the meta set would hand every
 * later checkout spec on this worker a card form none of them expect.
 */
export async function restoreBaseline(originalBaseLocation: string | null | undefined): Promise<void> {
    await mergeGatewaySettings({ button_type: 'smart', ucc_mode: 'no' });
    await restoreBaseLocation(originalBaseLocation);
    if (hasCredentials) {
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL, ucc: false });
    }
}

/* ------------------------------------------------------------------ */
/* Skip reasons                                                        */
/* ------------------------------------------------------------------ */

export const MODULE_SKIP =
    'the paypal_marketplace module is inactive, so no gateway, no checkout script and no UCC template exist — ' +
    'this case would be asserting the absence of a feature that was never loaded. Activate the module (site setup does it) before reading anything into this result.';

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() can never be true and the gateway is never offered at checkout. ' +
    'Every "the card fields are absent" assertion would then pass against a gateway that renders nothing at all. PP-PRE-01 reports the absence.';

/**
 * Flipped by the environment check inside each test rather than at module load, because it needs the
 * store currency from the mu-plugin `/status` route.
 */
export function environmentSkipReason(country: string, currency: string): string {
    return (
        `this store cannot host the UCC surface at all: Helper::is_ucc_enabled() requires the WooCommerce base country to be one of ${UCC_COUNTRIES.join(', ')} ` +
        `and the store currency to be one of that country's UCC currencies, and this store is ${country || '(no base country set)'} / ${currency || '(no currency)'}. ` +
        'Without that the positive control cannot render the card form, so the negative below would prove nothing — it would pass on a site where UCC is simply unavailable. ' +
        'Set a UCC-eligible base country and currency in WooCommerce before reading anything into this result.'
    );
}

/* ------------------------------------------------------------------ */
/* Shared assertions                                                   */
/* ------------------------------------------------------------------ */

/**
 * The positive control. Proves that with all five gates open the 3DS-capable card form really is
 * rendered on this environment, so the single-gate negative that follows is a measurement of that
 * gate and not of a missing feature.
 */
export function assertUccSurfaceRenders(probe: CheckoutProbe): void {
    expect(
        probe.gatewayOffered,
        `positive control: the PayPal Marketplace radio must be offered at classic checkout with all five UCC gates open — without it the card form could never render for any reason, and the negative that follows would prove nothing about the UCC gate. Probe: ${describeProbe(probe)}`,
    ).toBe(true);

    expect(
        probe.cardNumber,
        `positive control: templates/3DS-payment-option.php must render #dpm_card_number when every UCC gate is open. If it does not, a marketplace that has correctly enabled unbranded card payments shows customers no card form at all, and every "absent" assertion in this file is meaningless. Probe: ${describeProbe(probe)}`,
    ).toBe(1);
    expect(probe.cardExpiry, `positive control: the expiry field #dpm_card_expiry must render alongside the card number. Probe: ${describeProbe(probe)}`).toBe(1);
    expect(probe.cvv, `positive control: the CVV field #dpm_cvv must render alongside the card number. Probe: ${describeProbe(probe)}`).toBe(1);
    expect(probe.nameOnCard, `positive control: the cardholder-name input #dpm_name_on_card must render alongside the card number. Probe: ${describeProbe(probe)}`).toBe(1);

    expect(
        probe.contingencyLightbox,
        `positive control: #payments-sdk__contingency-lightbox must render — it is the container the 3D Secure challenge is drawn into, and it exists nowhere else in the module. Without it a challenge has nowhere to appear even when PayPal requests one. Probe: ${describeProbe(probe)}`,
    ).toBe(1);

    expect(
        probe.unbrandedButton,
        `positive control: the unbranded Pay button #pay_unbranded_order must render — it is the only submit control on the UCC path, because CartHandler::display_paypal_button() hides #place_order when PayPal is selected. Probe: ${describeProbe(probe)}`,
    ).toBe(1);

    expect(
        probe.sdkSrc ?? '',
        `positive control: the PayPal SDK must be requested with the hosted-fields component (CartManager::get_paypal_sdk_url() appends "components=hosted-fields,buttons"). Without that component paypal.HostedFields is undefined in the browser and no card field can ever be mounted. Probe: ${describeProbe(probe)}`,
    ).toContain('components=hosted-fields');

    expect(
        probe.localizedUccEnabled,
        `positive control: dokan_paypal.is_ucc_enabled must be truthy in the localized data — paypal-checkout.js:276-279 refuses to call HostedFields.render() without it, so a falsy value here means the card form is dead markup. wp_localize_script casts PHP true to the string "1". Probe: ${describeProbe(probe)}`,
    ).toBe('1');
}

/**
 * The negative. Every card-form marker gone, the unbranded submit control gone, and the SDK no longer
 * asked for the hosted-fields component — while the gateway itself is still on offer, which is what
 * makes the absence attributable to the one gate the test closed.
 */
export function assertUccSurfaceAbsent(probe: CheckoutProbe, closedGate: string, consequence: string): void {
    expect(
        probe.gatewayOffered,
        `the PayPal Marketplace radio must still be offered at classic checkout with only ${closedGate} changed — if the gateway itself disappeared, the missing card fields say nothing about the UCC gate and this case would be passing for the wrong reason. Probe: ${describeProbe(probe)}`,
    ).toBe(true);

    expect(
        cardFormMarkers(probe),
        `${consequence} Every marker from templates/3DS-payment-option.php must be gone with ${closedGate}; a rendered card form here means a customer is shown card inputs that no hosted field will ever mount into, and PayPal::process_payment() would still take them down the branded PayPal redirect. Probe: ${describeProbe(probe)}`,
    ).toBe(0);

    expect(
        probe.unbranded + probe.unbrandedButton,
        `the unbranded Pay button must be gone with ${closedGate} — CartHandler::display_paypal_button() renders it only for the UCC path, and it stays permanently disabled without hosted fields to validate, so leaving it on the page strands the customer with a dead submit control after #place_order has been hidden. Probe: ${describeProbe(probe)}`,
    ).toBe(0);
}

export let productId = '';

/**
 * The WHOLE stored base location (`US:NY`, not `US`), captured once so the base-country case can
 * put the store back exactly as it found it, state included. `null` means the option row was
 * genuinely absent and must be absent again after this file; `undefined` means beforeAll never got
 * as far as reading it, and nothing is restored off an unknown baseline.
 */
export let originalBaseLocation: string | null | undefined;

/* ================================================================== */
/* PP-3DS-04 — declared not automatable                               */
/* ================================================================== */

/**
 * Recorded as a skipped test rather than omitted, so the case keeps an id in the run output and
 * anyone reconciling the catalogue sees a stated reason instead of a silent gap.
 *
 * Flip this to `true` only alongside a real fixture: a sandbox buyer card that PayPal's sandbox
 * issuer will actually challenge, on a merchant whose `PPCP_CUSTOM` capability PayPal has vetted
 * for every seller in the cart. Merely observing that both suite vendors report `PPCP_CUSTOM`
 * SUBSCRIBED is NOT that fixture — subscription is a capability grant, whereas completing a
 * challenge additionally needs `paypal.HostedFields.isEligible()` to return true in a real
 * browser, a card enrolled in 3DS, and the issuer's ACS page to be driveable.
 */
export const HAS_VETTED_3DS_CHALLENGE_FIXTURE = false;

export class PayPalMarketplace3dsPage {
    async setupAll(): Promise<void> {
        // No test.skip() here on purpose: inside a beforeAll it silently voids the entire describe,
        // and four cases would vanish from the run with no skip reason printed for any of them.
        originalBaseLocation = await readBaseLocation();
        if (!hasCredentials) {
            return;
        }

        await ensurePayPalConfigured({ button_type: 'smart', ucc_mode: 'no' });
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL, ucc: false });

        const api = new ApiUtils(await request.newContext());
        const [, createdId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Marketplace 3DS Product' }, payloads.vendorAuth);
        productId = createdId;
        await api.dispose();
    }

    async teardownEach(): Promise<void> {
        // The base location is read BEFORE the restore, never after. A readback taken after
        // restoreBaseline() could only echo the value that call just wrote, so it could never fail;
        // taken before, it is a real leak check — it fails if a case left the store on a foreign base
        // country, which is exactly what PP-3DS-02's own try/finally exists to prevent. The restore
        // still runs before the assertion, so a leak this catches is repaired rather than left behind.
        const beforeRestore = await readBaseLocation();
        await restoreBaseline(originalBaseLocation);
        expect(
            beforeRestore,
            `no case in this file may leave the store base location changed: it was "${baseLocationLabel(originalBaseLocation)}" when the file started and reads "${baseLocationLabel(beforeRestore)}" at teardown. The WHOLE value is compared, country AND state — leaving "US" where it was "US:NY" quietly changes tax rates, shipping zones and gateway availability for every later spec on this worker.`,
        ).toBe(originalBaseLocation);
    }

    async teardownAll(): Promise<void> {
        await restoreBaseline(originalBaseLocation);
        if (!productId) {
            return;
        }
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    }

    async pp3ds01({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const baseCountry = await readBaseCountry();
        test.skip(!countryCurrencyGatesOpen(baseCountry, status.store_currency), environmentSkipReason(baseCountry, status.store_currency));

        expect(
            status.is_ready,
            `Helper::is_ready() must be true before any absence is asserted: on an unready gateway PayPal is never offered at checkout, so "no card fields" would be true no matter what ucc_mode said. Gateway state: enabled=${status.is_enabled}, partner id present=${status.has_partner_id}, module active=${status.module_active}.`,
        ).toBe(true);

        // ---- Positive control: all five gates open, the card form renders. ----
        await openAllLocalUccGates();
        const enabled = await getPayPalStatus();
        expect(enabled.ucc_mode, 'precondition: ucc_mode must read "yes" before the positive control runs, or the control is measuring the same state as the negative').toBe('yes');
        expect(enabled.button_type, 'precondition: the smart button type is gate 1 of Helper::is_ucc_enabled(); with any other value the positive control cannot render').toBe('smart');

        assertUccSurfaceRenders(await probeCheckout(browser, productId));

        // ---- Negative: close exactly one gate. ----
        await mergeGatewaySettings({ ucc_mode: 'no' });
        const disabled = await getPayPalStatus();
        expect(disabled.ucc_mode, 'precondition: ucc_mode must read "no" for the negative — Helper::is_ucc_mode_allowed() compares against the literal "yes" (Helper.php:165-169)').toBe('no');
        expect(disabled.button_type, 'only ucc_mode may differ between the two probes; the button type must still be smart').toBe('smart');

        const probe = await probeCheckout(browser, productId);
        assertUccSurfaceAbsent(
            probe,
            'ucc_mode turned off',
            'A marketplace that has NOT opted into unbranded card payments must not collect card details on its checkout page.',
        );

        expect(
            probe.localizedUccEnabled,
            `dokan_paypal.is_ucc_enabled must be falsy with ucc_mode off — paypal-checkout.js:276-279 keys the whole hosted-fields initialisation on it, and a truthy value would have the browser mount card fields the server never rendered. wp_localize_script casts PHP false to the empty string. Probe: ${describeProbe(probe)}`,
        ).toBe('');

        expect(
            probe.sdkSrc ?? '',
            `the PayPal SDK must not be asked for the hosted-fields component with ucc_mode off — requesting it loads unbranded-card machinery the store has not enabled, and CartManager::get_paypal_sdk_url() appends it only behind the same gate. SDK src: ${probe.sdkSrc ?? '(no SDK tag on the page)'}`,
        ).not.toContain('components=hosted-fields');

        log.success('PP-3DS-01: the UCC card form renders with ucc_mode on and disappears with it off; only that setting differed between the two probes.');
    }

    async pp3ds02({ browser }: { browser: Browser }): Promise<void> {
        const status: UccStatus = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Both country checks are made against the list the PRODUCT reports over the mu-plugin /status
        // route — `array_keys( Helper::get_advanced_credit_card_debit_card_supported_countries() )`,
        // filters applied — and never against UCC_COUNTRIES alone: comparing the file's own constants
        // to each other could not fail against any state of the product. They run BEFORE the
        // environment skip below on purpose, because that skip is itself decided by the mirrored list,
        // so a drifted mirror would otherwise silently skip all three cases instead of failing one.
        const productUccCountries = [...(status.ucc_supported_countries ?? [])].sort();

        expect(
            productUccCountries,
            `the mirrored UCC country list in this file must still match Helper::get_advanced_credit_card_debit_card_supported_countries(); it is what countryCurrencyGatesOpen() uses to decide whether these cases run at all, so drift here silently mis-gates all three. An empty list means the /status route reported nothing — an out-of-date mu-plugin copy, or a Helper:: that no longer exposes the map — rather than a product whose list changed. Product reported: ${JSON.stringify(productUccCountries)}`,
        ).toEqual([...UCC_COUNTRIES].sort());

        expect(
            productUccCountries,
            `the country this case switches to must be OUTSIDE the countries the product supports for unbranded cards, or it closes no gate at all. ${NON_UCC_COUNTRY} is in Helper::get_branded_payment_supported_countries() but must not be in get_advanced_credit_card_debit_card_supported_countries(). Product reported: ${JSON.stringify(productUccCountries)}`,
        ).not.toContain(NON_UCC_COUNTRY);

        const baseCountry = await readBaseCountry();
        test.skip(!countryCurrencyGatesOpen(baseCountry, status.store_currency), environmentSkipReason(baseCountry, status.store_currency));

        expect(
            status.is_ready,
            `Helper::is_ready() must be true before any absence is asserted: on an unready gateway PayPal is never offered at checkout, so "no card fields" would be true whatever the store country was. Gateway state: enabled=${status.is_enabled}, partner id present=${status.has_partner_id}.`,
        ).toBe(true);

        // ---- Positive control: an eligible base country, all five gates open. ----
        await openAllLocalUccGates();
        assertUccSurfaceRenders(await probeCheckout(browser, productId));

        // ---- Negative: move the store to a non-UCC country and change nothing else. ----
        try {
            await dbUtils.setOptionValue(BASE_COUNTRY_OPTION, NON_UCC_COUNTRY, false);
            expect(
                await readBaseCountry(),
                `precondition: the WooCommerce base country must actually read ${NON_UCC_COUNTRY} before the negative — Helper::is_ucc_enabled() reads WC()->countries->get_base_country(), which is the half of "${BASE_COUNTRY_OPTION}" before the colon`,
            ).toBe(NON_UCC_COUNTRY);

            const stillOn = await getPayPalStatus();
            expect(stillOn.ucc_mode, 'only the base country may differ between the two probes; ucc_mode must still be "yes"').toBe('yes');
            expect(stillOn.button_type, 'only the base country may differ between the two probes; the button type must still be smart').toBe('smart');

            const probe = await probeCheckout(browser, productId);
            assertUccSurfaceAbsent(
                probe,
                `the store base country moved to ${NON_UCC_COUNTRY}`,
                `PayPal does not offer advanced card processing to merchants based in ${NON_UCC_COUNTRY}, so a card form there collects details that can never be charged.`,
            );

            expect(
                probe.localizedUccEnabled,
                `dokan_paypal.is_ucc_enabled must be falsy for a ${NON_UCC_COUNTRY}-based store — the country check is gate 3 of Helper::is_ucc_enabled() (Helper.php:186-189), and a truthy value would have the browser try to mount hosted fields PayPal will refuse to serve. Probe: ${describeProbe(probe)}`,
            ).toBe('');

            expect(
                probe.sdkSrc ?? '',
                `the SDK must not request the hosted-fields component for a ${NON_UCC_COUNTRY}-based store. SDK src: ${probe.sdkSrc ?? '(no SDK tag on the page)'}`,
            ).not.toContain('components=hosted-fields');
        } finally {
            // Restored here as well as in afterEach: an assertion failure above must not leave the
            // whole site on a foreign base country for the rest of the run. The afterEach hook reads
            // the stored value BEFORE it restores anything, so it fails the case if this line ever
            // stops doing its job.
            await restoreBaseLocation(originalBaseLocation);
        }

        log.success(`PP-3DS-02: the UCC card form renders for a UCC-eligible store country and disappears under ${NON_UCC_COUNTRY}; only the base country differed.`);
    }

    async pp3ds03({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const baseCountry = await readBaseCountry();
        test.skip(!countryCurrencyGatesOpen(baseCountry, status.store_currency), environmentSkipReason(baseCountry, status.store_currency));

        expect(
            status.is_ready,
            `Helper::is_ready() must be true before any absence is asserted: on an unready gateway PayPal is never offered at checkout, so "no card fields" would be true whatever the button type was. Gateway state: enabled=${status.is_enabled}, partner id present=${status.has_partner_id}.`,
        ).toBe(true);

        // ---- Positive control: smart button, all five gates open. ----
        await openAllLocalUccGates();
        const smart = await probeCheckout(browser, productId);
        assertUccSurfaceRenders(smart);
        expect(
            smart.sdkScript,
            `positive control: the PayPal SDK tag must be enqueued on the smart path — CartHandler::payment_scripts() is the only thing that enqueues it, and the negative below is precisely that it stops doing so. Probe: ${describeProbe(smart)}`,
        ).toBe(1);

        // ---- Negative: switch to the standard button and change nothing else. ----
        await mergeGatewaySettings({ button_type: 'standard' });
        const standard = await getPayPalStatus();
        expect(
            standard.button_type,
            'precondition: button_type must read "standard" for the negative — Helper::is_ucc_enabled() compares against the literal "smart" (Helper.php:185)',
        ).toBe('standard');
        expect(standard.ucc_mode, 'only the button type may differ between the two probes; ucc_mode must still be "yes"').toBe('yes');

        const probe = await probeCheckout(browser, productId);
        assertUccSurfaceAbsent(
            probe,
            'the standard button type selected',
            'The standard button type has no client-side card handling at all, so a card form on that path could never be submitted.',
        );

        // The catalogue's expected result for this case, asserted at its source. `payment_scripts()`
        // returns early on any non-smart button type (`Cart/CartHandler.php:95-97`), BEFORE the SDK is
        // enqueued and before the data is localized — so the hosted-fields component is not merely
        // omitted from the SDK URL, the SDK is never requested at all.
        expect(
            probe.sdkScript,
            `the PayPal JS SDK must not be enqueued at all on the standard button path — CartHandler::payment_scripts() returns before wp_enqueue_script() for any non-smart button type, so an SDK tag here means the early return no longer holds and the hosted-fields component could reach a page that has no card form to mount it into. Probe: ${describeProbe(probe)}`,
        ).toBe(0);

        expect(
            probe.sdkSrc ?? '',
            `no SDK tag exists on the standard path, so the hosted-fields component cannot be requested. SDK src: ${probe.sdkSrc ?? '(no SDK tag on the page, as expected)'}`,
        ).not.toContain('components=hosted-fields');

        expect(
            probe.localizedUccEnabled,
            `the dokan_paypal localized object must be absent entirely on the standard button path — it is written by the same wp_localize_script() call that follows the enqueue, so any value here (even a falsy one) means scripts were localized past the early return. Probe: ${describeProbe(probe)}`,
        ).toBeNull();

        log.success('PP-3DS-03: the standard button type suppresses the UCC card form and the PayPal SDK enqueue entirely, while the gateway stays on offer.');
    }

    async pp3ds04(): Promise<void> {
        test.skip(
            !HAS_VETTED_3DS_CHALLENGE_FIXTURE,
            'NOT AUTOMATABLE — the final gate requires PayPal to have reported the PPCP_CUSTOM capability as subscribed for EVERY seller in the cart, which is granted by PayPal\'s own merchant vetting and cannot be seeded locally. Beyond that, the challenge itself is raised by PayPal\'s SDK inside #payments-sdk__contingency-lightbox from hf.submit({ contingencies: ["3D_SECURE"] }) at paypal-checkout.js:410, and completing it needs a 3DS-enrolled card plus the issuer\'s own ACS page — neither of which any API in this suite can produce. Writing this as a passing test would mean asserting against a challenge that never appeared, which is exactly the fake-green shape PP-3DS-01…03 exist to avoid. The reachable half of this area — that the 3DS template and its lightbox container render, and that each gate suppresses them — is covered by PP-3DS-01, PP-3DS-02 and PP-3DS-03.',
        );

        // Left unreachable on purpose. With a real fixture, drive a card through
        // #dpm_card_number / #dpm_card_expiry / #dpm_cvv, submit via #pay_unbranded_order, and assert
        // BOTH that the challenge iframe mounted inside #payments-sdk__contingency-lightbox AND that
        // the resulting order carries a liability-shift outcome in its PayPal capture response —
        // asserting only that the order completed would pass identically with 3DS switched off.
        expect(HAS_VETTED_3DS_CHALLENGE_FIXTURE, 'unreachable while no PayPal-vetted 3DS challenge fixture exists').toBe(true);
    }
}
