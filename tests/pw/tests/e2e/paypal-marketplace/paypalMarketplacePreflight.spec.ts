import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { parseBoolean } from '@utils/helpers';
import {
    hasCredentials,
    HAS_REAL_MERCHANTS,
    PAYPAL_MERCHANTS,
    merchantGateReason,
    ensurePayPalConfigured,
    getPayPalStatus,
    getBothMerchantConsents,
    isPayableMerchant,
    seedBothPayPalVendors,
} from './helpers';

declare const process: { env: Record<string, string | undefined> };

/**
 * Fail-loud pre-flight for the PayPal Marketplace suite (PP-PRE-01 / 02 / 03).
 *
 * Nearly every money / checkout / split / disbursement / refund test self-skips when the
 * PayPal sandbox credentials are absent (`test.skip(!hasCredentials)`). Locally, and on fork
 * PRs where GitHub withholds repo secrets, that is correct. On an internal CI run where the
 * secrets ARE expected, a silent skip produces a fully GREEN run with near-zero real coverage —
 * a false safety signal hiding exactly the regressions the suite exists to catch. This spec
 * converts that silent skip into a LOUD failure, but only when the secrets are expected, gated
 * on `PAYPAL_MARKETPLACE_REQUIRED`.
 *
 *   - PAYPAL_MARKETPLACE_REQUIRED unset/false (fork PR / local): soft — skip-with-warning.
 *   - PAYPAL_MARKETPLACE_REQUIRED=true but credentials missing: hard FAIL — PP-PRE-01.
 *   - Credentials present but no real connected merchant ids: WARN only — the capture/split/
 *     refund money tests document-skip while the keyed config tests still run — PP-PRE-02.
 *   - Merchant ids that LOOK real but PayPal refuses as payees: hard FAIL — PP-PRE-04. This is
 *     not a legitimate configuration; it opens every money gate and then fails each capture with
 *     an opaque payee error far from the cause.
 *
 * PayPal needs THREE values where Stripe Express needed two: `Helper::is_ready()` is
 * `enabled && partner_id && client_id && client_secret`, so a missing partner id alone leaves
 * the gateway unavailable.
 *
 * Tagged @pro so it runs only in the Pro lane. No role tag on PP-PRE-01/02 — they are pure env
 * guards with no page interaction. Never tag @serial: `playwright.config.ts` grepInverts it in
 * BOTH lanes, which would silently delete this file from CI — precisely the failure this spec
 * exists to prevent.
 */
test.describe('PayPal Marketplace — pre-flight (fail loud when secrets are required but missing)', () => {
    const required = parseBoolean(process.env.PAYPAL_MARKETPLACE_REQUIRED);

    const merchantWarning =
        `Credentials present but no usable connected merchant ids ` +
        `(vendor1="${PAYPAL_MERCHANTS.vendor1}", vendor2="${PAYPAL_MERCHANTS.vendor2}") — ` +
        'capture / split / disbursement / refund money tests will skip (documented gap). ' +
        `Reason: ${merchantGateReason() ?? 'unknown'} ` +
        'Set PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID and PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID to real ' +
        'sandbox merchant ids that completed partner-referral consent for the SAME partner app as the keys.';

    test('PP-PRE-01: PayPal sandbox credentials are present when required', { tag: ['@pro', '@admin'] }, async () => {
        // Credentials absent AND not required (fork PR / local) is the one legitimate
        // configuration in which this case has nothing to prove — it becomes a DECLARED skip
        // so the missing money coverage is visible in the report. Every other combination
        // executes at least one assertion below: an early `return` here would report PASSED
        // for a run in which nothing was checked at all.
        test.skip(
            !required && !hasCredentials,
            'PayPal credentials absent and not required here (fork PR / local) — money/checkout tests will skip. Set TEST_MERCHANT_ID_PAYPAL_MARKETPLACE + TEST_CLIENT_ID_PAYPAL_MARKETPLACE + TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE to run them.',
        );

        expect(
            hasCredentials,
            'PAYPAL_MARKETPLACE_REQUIRED=true but TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE are missing — EVERY PayPal money/checkout/split/refund test would silently skip to green, reporting a passing suite with zero money coverage. Inject the secrets in the workflow env.',
        ).toBe(true);

        // Half the claim of this case is product-side: "money/checkout tests will run". Three
        // non-empty env strings do not establish that — only `Helper::is_ready()` does, and it
        // is `enabled && partner_id && client_id && client_secret` (Helper.php:101-105). Without
        // this read the case would still report green with the module deactivated or the keys
        // rejected by the configure route, which is exactly the false safety signal the file exists
        // to kill.
        await ensurePayPalConfigured();
        const status = await getPayPalStatus();

        expect(
            status.is_ready,
            'PAYPAL sandbox credentials are present but Helper::is_ready() is false after the mu-plugin configure route ran, so every money/checkout/split/refund spec would skip or fail against an unconfigured gateway while this preflight reported green — the three keys exist as strings but do not produce a usable gateway (enabled && partner_id && client_id && client_secret, Helper.php:101-105). Check that the paypal_marketplace module is active and that /configure-paypal-marketplace persisted all three values into the gateway settings.',
        ).toBe(true);

        log.success('PP-PRE-01: PayPal pre-flight passed — credentials present and Helper::is_ready() true.');
    });

    test('PP-PRE-02: real connected merchant ids are present, or money assertions are declared gated', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'PP-PRE-02 only makes sense once credentials exist — PP-PRE-01 already reported their absence.');

        // Format-usable ids are only half the claim. The other half — that Dokan really treats those
        // ids as connected, receivable vendors — is product state, so it is read back from
        // `Helper::is_seller_enable_for_receive_payment()` rather than echoed from the payload we
        // just posted. Whether PayPal will accept them as payees is a third question, answered over
        // the network by PP-PRE-04.
        //
        // Asserted BEFORE the merchant gate below on purpose. The seed route and the receivable
        // getter behave identically for placeholder ids, so a credentials-present / merchants-absent
        // run (the normal CI shape without the two merchant secrets) still proves the vendor
        // connection contract instead of asserting nothing at all.
        const seeds = await seedBothPayPalVendors();

        expect(
            seeds.length,
            'seedBothPayPalVendors() returned no vendor results — the /seed-paypal-vendor route stopped seeding both suite vendors, so every money spec would run against vendors whose connection state was never established.',
        ).toBe(2);

        for (const seed of seeds) {
            expect(
                seed.receivable,
                `vendor ${seed.vendor_id} was seeded with merchant id "${seed.merchant_id}" but Helper::is_seller_enable_for_receive_payment() still reports false — the six mode-swapped vendor metas the module reads (see /status vendor_meta_keys) no longer match what the seed route writes, so PayPal::is_available() will fail validate_cart_items() and the gateway will never appear at checkout while every money spec's gate reports open.`,
            ).toBe(true);
        }

        // Deliberately never FAILS on merchants-absent: credentials-present / merchants-absent is a
        // legitimate configuration in which the config, security, webhook and XSS specs all still
        // run for real. It is a declared SKIP rather than a bare return so the documented money-gap
        // is visible in the run report instead of hiding behind a green tick — and it comes AFTER the
        // seeding assertions above, so the skip loses no coverage it could have had.
        if (!HAS_REAL_MERCHANTS) log.warn(merchantWarning);
        test.skip(!HAS_REAL_MERCHANTS, merchantWarning);

        log.success(
            `PP-PRE-02: ${seeds.length} vendors seeded and reported receivable by the module. Whether PayPal will actually accept them as payees is a separate question, answered over the network by PP-PRE-04.`,
        );
    });

    test('PP-PRE-04: the supplied merchant ids have really consented to this partner app', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Consent cannot be queried without partner credentials — PP-PRE-01 already reported their absence.');
        test.skip(
            !HAS_REAL_MERCHANTS,
            'Merchant ids are placeholders or malformed, so the money specs are already gated by PP-PRE-02 — there is nothing whose consent could be checked.',
        );

        // Unlike PP-PRE-02 this one FAILS. "Real-looking ids that PayPal refuses" is not a
        // legitimate configuration: it is indistinguishable from a working setup at import time,
        // opens every money gate, and then fails each capture with an opaque payee error far from
        // the actual cause. Deliberately not gated on PAYPAL_MARKETPLACE_REQUIRED — supplying a
        // non-placeholder merchant id IS the claim that it works, locally as much as in CI.
        const consents = await getBothMerchantConsents();

        for (const [label, consent] of Object.entries(consents)) {
            expect(
                isPayableMerchant(consent),
                `${label} merchant id "${consent.merchantId}" is NOT payable by this partner app (partner_id=${process.env.TEST_MERCHANT_ID_PAYPAL_MARKETPLACE}). ` +
                    `PayPal says: ${consent.reason ?? `connected=${consent.connected}, payments_receivable=${consent.paymentsReceivable}`}. ` +
                    'A merchant id is only the account\'s identity — consent for THIS partner app is separate state and is what a capture actually requires. ' +
                    'Two distinct causes produce this: (a) the sandbox REST app was created as type Merchant rather than Platform, so it holds no partner scopes at all and app type cannot be changed after creation; ' +
                    '(b) the app is correct but this vendor never completed the hosted consent flow at dashboard/settings/payment-manage-dokan-paypal-marketplace. ' +
                    'PayPal\'s message above distinguishes them. Left un-checked, every capture / split / disbursement / refund test would run and fail against PayPal instead of gating.',
            ).toBe(true);
        }

        // Dokan mints the tracking id as `_dokan_paypal_<random>_<wp_user_id>`. A consent granted
        // through some other integration against the same sandbox account would carry a foreign
        // tracking id, so this is what separates "this vendor is connected to our marketplace"
        // from "this vendor is connected to something".
        for (const [label, consent] of Object.entries(consents)) {
            log.info(
                `PP-PRE-04: ${label} ${consent.merchantId} payable — tracking_id=${consent.trackingId ?? 'none'}, primary_email_confirmed=${consent.primaryEmailConfirmed}.`,
            );
        }

        log.success('PP-PRE-04: both vendor merchant ids are consented and payable — money-movement tests will run for real.');
    });

    test('PP-PRE-03: configuring PayPal must not deactivate the Stripe Express module', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Configuring the gateway needs credentials; without them there is no configure step that could deactivate a sibling module.');

        const before = await getPayPalStatus();
        await ensurePayPalConfigured();
        const after = await getPayPalStatus();

        expect(
            after.module_active,
            'the PayPal Marketplace module must be active after ensurePayPalConfigured()',
        ).toBe(true);

        // The Stripe Express mu-plugin's configure route force-REMOVES the legacy `stripe` module
        // from dokan_pro_active_modules. A PayPal route written by symmetry could remove
        // `stripe_express` and silently skip the entire Stripe suite on the same CI worker — a
        // whole suite vanishing with zero failures reported. This asserts it did not happen.
        expect(
            after.stripe_express_active,
            `configuring PayPal deactivated the stripe_express module (was ${before.stripe_express_active}, now ${after.stripe_express_active}) — the PayPal configure route must MERGE into dokan_pro_active_modules and remove nothing, or the entire Stripe Express suite silently skips on this worker.`,
        ).toBe(true);

        expect(
            after.withdraw_method_on,
            'the hyphenated withdraw method "dokan-paypal-marketplace" must be present in dokan_withdraw[withdraw_methods] after configuration — note the gateway id uses underscores and is a different string.',
        ).toBe(true);

        log.success('PP-PRE-03: PayPal configured; stripe_express still active and withdraw method registered.');
    });
});
