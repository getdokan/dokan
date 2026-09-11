import { PayPalMarketplaceXssPage } from './paypalMarketplaceXssPage';
import { test } from '@utils/test';

const xss = new PayPalMarketplaceXssPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — stored and reflected XSS', () => {
    // Every real UI save runs process_admin_options(), which calls out to PayPal to register the
    // webhook (list, delete stale, create). Several cases save twice.
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async () => {
        await xss.setupAll();
    });

    /**
     * Restore after EVERY test.
     *
     * A payload left in `title` or `description` is not merely untidy — it would be rendered by every
     * later PayPal spec on this worker and by the WooCommerce payments screen, and a vendor left
     * disconnected by PP-XSS-05/06 would make every later availability assertion fail for a reason
     * that has nothing to do with the case reporting it. The whole option is REPLACED rather than
     * merged so a key written by a test that died mid-way cannot survive.
     */
    test.afterEach(async () => {
        await xss.teardownEach();
    });

    test.afterAll(async () => {
        await xss.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Customer-facing surfaces                                        */
    /* -------------------------------------------------------------- */
    test('PP-XSS-01: a payload stored in the gateway description does not execute at checkout', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await xss.ppXss01({ browser });
    });

    test('PP-XSS-02: a payload stored in the gateway title does not execute at checkout', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await xss.ppXss02({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Admin surfaces                                                  */
    /* -------------------------------------------------------------- */
    test('PP-XSS-03: a payload stored in the gateway title does not execute anywhere in wp-admin', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await xss.ppXss03({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Vendor-controlled strings                                       */
    /* -------------------------------------------------------------- */
    test('PP-XSS-04: a payload in a vendor-controlled string never reaches PayPal unescaped', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await xss.ppXss04({ browser });
    });

    test('PP-XSS-05: a payload in a vendor PayPal email is escaped on the vendor payment-settings screen', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await xss.ppXss05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Settings that are never rendered, and option integrity          */
    /* -------------------------------------------------------------- */
    test('PP-XSS-06: payloads in the notice interval and marketplace logo reach no vendor-dashboard surface', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await xss.ppXss06({ browser });
    });

    test('PP-XSS-07: a payload round-trip through the settings form leaves sibling keys and the stored value intact', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await xss.ppXss07({ browser });
    });
});
