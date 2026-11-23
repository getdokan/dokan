import { PayPalMarketplaceSecurityPage } from './paypalMarketplaceSecurityPage';
import { test } from '@utils/test';

const security = new PayPalMarketplaceSecurityPage();

// NOT `test.describe.serial`, deliberately. Playwright already runs every test in a single file
// sequentially in one worker, so `.serial` bought no ordering here — its only extra behaviour is
// ABORTING the rest of the group on the first failure. On 2026-07-31 that cost 46 of 68 cases:
// one early failure in each of the three PayPal files silently erased every case declared after it,
// and the run still summarised as mostly green. A skipped case reports as "not a failure", which is
// exactly the fake-green shape this suite exists to prevent — the cascade hides far more than it
// protects. Ordering is preserved; only the cascade is gone.
test.describe('PayPal Marketplace — security · REST / AJAX / IDOR / secret exposure', () => {
    test.describe.configure({ timeout: 180_000 });

    test.beforeAll(async () => {
        await security.setupAll();
    });

    test.afterAll(async () => {
        await security.teardownAll();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-01 — module REST routes reject unauthenticated callers.
    // ---------------------------------------------------------------------
    test('PP-SEC-01: the module REST routes reject an unauthenticated caller (Authorization blanked explicitly)', { tag: ['@pro', '@guest'] }, async () => {
        await security.ppSec01();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-02 — capture route is registered for logged-out callers.
    // ---------------------------------------------------------------------
    test('PP-SEC-02: the AJAX capture action is registered for logged-out callers behind a checkout-wide nonce only', { tag: ['@pro', '@customer'] }, async () => {
        await security.ppSec02();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-03 — capture route rejects an order id belonging to another shopper.
    // ---------------------------------------------------------------------
    test('PP-SEC-03: capture rejects an order id belonging to another shopper (no IDOR on payment capture)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await security.ppSec03({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-SEC-04 — create-payment rejects a tampered amount.
    // ---------------------------------------------------------------------
    test('PP-SEC-04: create-payment ignores a client-supplied amount and asks PayPal for the server-computed total', { tag: ['@pro', '@customer'] }, async () => {
        await security.ppSec04();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-05 — create-payment rejects a tampered payee merchant id.
    // ---------------------------------------------------------------------
    test('PP-SEC-05: create-payment ignores a client-supplied payee and names each sub order\'s own vendor to PayPal', { tag: ['@pro', '@customer'] }, async () => {
        await security.ppSec05();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-06 — vendor cannot read another vendor's merchant id via REST.
    // ---------------------------------------------------------------------
    test("PP-SEC-06: vendor2 cannot read vendor1's PayPal merchant id through any reachable REST route", { tag: ['@pro', '@vendor'] }, async () => {
        await security.ppSec06();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-07 — vendor cannot write another vendor's merchant id.
    // ---------------------------------------------------------------------
    test("PP-SEC-07: vendor2 cannot overwrite vendor1's PayPal merchant meta", { tag: ['@pro', '@vendor'] }, async () => {
        await security.ppSec07();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-08 — customer cannot reach vendor payment settings.
    // ---------------------------------------------------------------------
    test('PP-SEC-08: a customer cannot read or write vendor payment settings', { tag: ['@pro', '@customer'] }, async () => {
        await security.ppSec08();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-09 — connect action enforces its nonce.
    // ---------------------------------------------------------------------
    test('PP-SEC-09: the PayPal connect action refuses a request without a valid nonce', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await security.ppSec09({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-SEC-10 — disconnect action enforces its nonce and capability.
    // ---------------------------------------------------------------------
    test('PP-SEC-10: disconnect refuses a nonce-less call and cannot disconnect a different vendor', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await security.ppSec10({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-SEC-11 — client secret never reaches the frontend.
    // ---------------------------------------------------------------------
    test('PP-SEC-11: the PayPal client secret never reaches any rendered frontend page', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        await security.ppSec11({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-SEC-12 — client secret is not returned by any REST response.
    // ---------------------------------------------------------------------
    test('PP-SEC-12: no REST response hands the PayPal client secret to a vendor, a customer or an anonymous caller', { tag: ['@pro', '@admin'] }, async () => {
        await security.ppSec12();
    });

    // ---------------------------------------------------------------------
    // PP-SEC-13 — settings screen masks the stored secret.
    // ---------------------------------------------------------------------
    test('PP-SEC-13: the admin gateway settings screen renders the stored secret in a masked field', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await security.ppSec13({ browser });
    });

    // ---------------------------------------------------------------------
    // PP-SEC-14 — webhook endpoint is not a state-mutation oracle.
    // ---------------------------------------------------------------------
    test('PP-SEC-14: an unsigned forged refund webhook creates no refund and moves no money', { tag: ['@pro', '@guest'] }, async () => {
        await security.ppSec14();
    });

    /**
     * PP-SEC-15 — the case the suite was MISSING, added 2026-07-31 after DOK-029.
     *
     * PP-SEC-09 and PP-SEC-10 both passed while a real CSRF sat in this module, because both send a
     * WRONG nonce. All three guards in `authorize_paypal_marketplace()` are written
     * "<guard shape withheld>"
     * (source coordinates withheld), so a wrong nonce reaches `wp_verify_nonce` and
     * is correctly rejected — while the absent-nonce case is mishandled. The downstream effect is that the vendor's stored merchant id — the value that decides who is paid — can be overwritten. Full detail is in the private security tracker.
     *
     * The general lesson, worth applying beyond this module: a nonce-enforcement case needs THREE
     * inputs — valid, invalid, and ABSENT. Testing only the first two exercises the branch and
     * never the reachability of the branch.
     *
     * This asserts the CORRECT behaviour, so it fails against develop today. That failure IS the
     * live reproduction DOK-029 is waiting for. Do not soften it; it goes green when the product
     * verifies unconditionally.
     */
    test('PP-SEC-15: a connect-success callback with NO nonce must not overwrite the vendor merchant id', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await security.ppSec15({ browser });
    });
});
