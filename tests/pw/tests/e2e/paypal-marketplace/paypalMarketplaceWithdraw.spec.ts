import { PayPalMarketplaceWithdrawPage } from './paypalMarketplaceWithdrawPage';
import { test } from '@utils/test';

const withdraw = new PayPalMarketplaceWithdrawPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — vendor withdraw method', () => {
    // Two cases drive the legacy Vue admin settings app and two drive the vendor dashboard, both of
    // which are full page loads behind a WordPress bootstrap.
    test.describe.configure({ timeout: 240_000 });

    test.beforeAll(async () => {
        await withdraw.setupAll();
    });

    // After EVERY test, not just at the end: CI runs one worker with retries, so a case that died
    // mid-mutation would otherwise hand the next test — and the next spec file — a site with the
    // PayPal method disabled or vendor 1 disconnected, and those would then fail or pass for reasons
    // that have nothing to do with what they assert.
    test.afterEach(async () => {
        await withdraw.teardownEach();
    });

    // The probe's balance top-up is the one mutation `afterEach` cannot undo: it is a row in
    // `wp_dokan_vendor_balance`, not an option, and it carries a fabricated `trn_id` (max+1) that
    // references no order. Left behind it permanently inflates vendor 1's earnings for every other
    // suite on this site — `dokan_get_seller_balance()` sums the table — so a withdraw spec that
    // asserts a computed balance would then be reading money this file invented. Deleted by the
    // marker written at insert time, so nothing any other spec inserted can match.
    test.afterAll(async () => {
        await withdraw.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Registration + admin enable/disable                             */
    /* -------------------------------------------------------------- */
    test('PP-WDR-01: the PayPal withdraw method is registered and enabled under the HYPHENATED key', { tag: ['@pro', '@admin'] }, async () => {
        await withdraw.ppWdr01();
    });

    test('PP-WDR-02: admin can enable the PayPal withdraw method from Withdraw Options', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await withdraw.ppWdr02({ browser });
    });

    test('PP-WDR-03: admin can disable the PayPal withdraw method and vendors stop being offered it', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        await withdraw.ppWdr03({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Vendor selectability                                            */
    /* -------------------------------------------------------------- */
    test('PP-WDR-04: a connected vendor is offered PayPal Marketplace as a payout method', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await withdraw.ppWdr04({ browser });
    });

    test('PP-WDR-05: an unconnected vendor cannot select PayPal Marketplace as a payout method', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await withdraw.ppWdr05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Withdraw requests                                               */
    /* -------------------------------------------------------------- */
    test('PP-WDR-06: a manual withdraw request naming the PayPal Marketplace method is refused as an inactive method', { tag: ['@pro', '@vendor'] }, async () => {
        await withdraw.ppWdr06();
    });

    test('PP-WDR-07: approving a PayPal withdrawal reduces the vendor balance by the approved amount', { tag: ['@pro', '@admin'] }, async () => {
        await withdraw.ppWdr07();
    });

    test('PP-WDR-08: cancelling a PayPal withdrawal leaves the vendor balance unchanged', { tag: ['@pro', '@admin'] }, async () => {
        await withdraw.ppWdr08();
    });
});
