import { PayPalMarketplacePreflightPage } from './paypalMarketplacePreflightPage';
import { test } from '@utils/test';

const preflight = new PayPalMarketplacePreflightPage();

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
    test('PP-PRE-01: PayPal sandbox credentials are present when required', { tag: ['@pro', '@admin'] }, async () => {
        await preflight.ppPre01();
    });

    test('PP-PRE-02: real connected merchant ids are present, or money assertions are declared gated', { tag: ['@pro', '@admin'] }, async () => {
        await preflight.ppPre02();
    });

    test('PP-PRE-04: the supplied merchant ids have really consented to this partner app', { tag: ['@pro', '@admin'] }, async () => {
        await preflight.ppPre04();
    });

    test('PP-PRE-03: configuring PayPal must not deactivate the Stripe Express module', { tag: ['@pro', '@admin'] }, async () => {
        await preflight.ppPre03();
    });
});
