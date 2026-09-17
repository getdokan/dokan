import { PayPalMarketplaceOnboardingPage } from './paypalMarketplaceOnboardingPage';
import { test } from '@utils/test';

const onboarding = new PayPalMarketplaceOnboardingPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

// NOT `test.describe.serial`. Playwright already runs a single file sequentially in one worker,
// so `.serial` adds nothing but an abort-the-rest-of-the-group cascade — which on 2026-07-31 cost
// this suite 46 of 68 cases while the run still summarised as green.
test.describe('PayPal Marketplace — vendor onboarding and connection', () => {
    test.describe.configure({ timeout: 240_000 });

    test.beforeAll(async () => {
        await onboarding.setupAll();
    });

    test.afterAll(async () => {
        await onboarding.teardownAll();
    });

    // -----------------------------------------------------------------
    // PP-ONB-01 — unconnected vendor sees the connect UI.
    // -----------------------------------------------------------------
    test('PP-ONB-01: an unconnected vendor is offered the PayPal connect UI and no connected state', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb01({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-02 — empty email is rejected.
    // -----------------------------------------------------------------
    test('PP-ONB-02: a connect attempt with an empty email is rejected and writes no vendor state', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb02({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-03 — nonce enforcement: absent, forged, and valid.
    // -----------------------------------------------------------------
    test('PP-ONB-03: the connect action refuses an absent nonce and a forged nonce, and accepts a real one', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb03({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-04 — unsupported store country is blocked, on both surfaces.
    // -----------------------------------------------------------------
    test('PP-ONB-04: a vendor with an unsupported store country is blocked, and sees the redirect message not the AJAX one', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb04({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-05 — a MISSING store country hits the same guard.
    // -----------------------------------------------------------------
    test('PP-ONB-05: a vendor with no store country at all is blocked by the identical guard', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb05({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-06 — supported country reaches a REAL PayPal referral handoff.
    // -----------------------------------------------------------------
    test('PP-ONB-06: a supported-country vendor is handed a live PayPal-hosted referral URL, and stays unconnected until PayPal says otherwise', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb06({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-07 — the country allow list is hardcoded, not admin-configurable.
    // -----------------------------------------------------------------
    test('PP-ONB-07: the admin gateway settings expose no allowed/restricted-countries control', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await onboarding.ppOnb07({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-08 — connected vendor renders the connected state.
    // -----------------------------------------------------------------
    test('PP-ONB-08: a connected vendor sees the connected state, their merchant id and a disconnect control', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb08({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-09 — seeding writes the SANDBOX key only.
    // -----------------------------------------------------------------
    test('PP-ONB-09: a sandbox-mode connection writes the test meta key and never the live one', { tag: ['@pro', '@vendor'] }, async () => {
        await onboarding.ppOnb09();
    });

    // -----------------------------------------------------------------
    // PP-ONB-10 — flipping to live mode makes a sandbox vendor read unconnected.
    // -----------------------------------------------------------------
    test('PP-ONB-10: a sandbox-connected vendor reads as unconnected in live mode, and reconnects when sandbox returns', { tag: ['@pro', '@admin', '@vendor'] }, async () => {
        await onboarding.ppOnb10();
    });

    // -----------------------------------------------------------------
    // PP-ONB-11 — disconnect clears every PayPal meta.
    // -----------------------------------------------------------------
    test('PP-ONB-11: a vendor disconnecting from the dashboard has all six PayPal metas removed', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb11({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-12 — MERCHANT.ONBOARDING.COMPLETED connects the vendor.
    // -----------------------------------------------------------------
    test('PP-ONB-12: MERCHANT.ONBOARDING.COMPLETED writes the vendor merchant state from PayPal', { tag: ['@pro', '@vendor'] }, async () => {
        await onboarding.ppOnb12();
    });

    // -----------------------------------------------------------------
    // PP-ONB-13 — SELLER-EMAIL-CONFIRMED refreshes vendor state.
    // -----------------------------------------------------------------
    test('PP-ONB-13: CUSTOMER.MERCHANT-INTEGRATION.SELLER-EMAIL-CONFIRMED refreshes the stored email-confirmed state', { tag: ['@pro', '@vendor'] }, async () => {
        await onboarding.ppOnb13();
    });

    // -----------------------------------------------------------------
    // PP-ONB-14 — CAPABILITY-UPDATED refreshes receivability.
    // -----------------------------------------------------------------
    test('PP-ONB-14: CUSTOMER.MERCHANT-INTEGRATION.CAPABILITY-UPDATED refreshes the stored payments-receivable state', { tag: ['@pro', '@vendor'] }, async () => {
        await onboarding.ppOnb14();
    });

    // -----------------------------------------------------------------
    // PP-ONB-15 — PARTNER-CONSENT.REVOKED disconnects the vendor.
    // -----------------------------------------------------------------
    test('PP-ONB-15: MERCHANT.PARTNER-CONSENT.REVOKED removes every PayPal meta for that vendor', { tag: ['@pro', '@vendor'] }, async () => {
        await onboarding.ppOnb15();
    });

    // -----------------------------------------------------------------
    // PP-ONB-16 — a vendor who cannot receive payment is not offered at checkout.
    // -----------------------------------------------------------------
    test('PP-ONB-16: the gateway hides at checkout when a cart vendor cannot receive payment', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb16({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-17 — vendor A cannot read or alter vendor B's PayPal settings.
    // -----------------------------------------------------------------
    test("PP-ONB-17: vendor2 can neither read nor write vendor1's PayPal connection", { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await onboarding.ppOnb17({ browser });
    });

    // -----------------------------------------------------------------
    // PP-ONB-18 — the merchant id never reaches the storefront.
    // -----------------------------------------------------------------
    test('PP-ONB-18: a vendor merchant id never appears in storefront HTML for an anonymous visitor', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await onboarding.ppOnb18({ browser });
    });
});
