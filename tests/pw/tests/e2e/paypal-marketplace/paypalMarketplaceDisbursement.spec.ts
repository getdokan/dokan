import { PayPalMarketplaceDisbursementPage } from './paypalMarketplaceDisbursementPage';
import { test } from '@utils/test';

const disbursement = new PayPalMarketplaceDisbursementPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — disbursement', () => {
    // Each money case is a full classic checkout, a live buyer approval on paypal.com, a live capture
    // and (for the delayed modes) two cron passes with polling.
    test.describe.configure({ timeout: 600_000 });

    test.beforeAll(async () => {
        await disbursement.setupAll();
    });

    test.afterAll(async () => {
        await disbursement.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* INSTANT                                                         */
    /* -------------------------------------------------------------- */
    test('PP-DIS-01: INSTANT mode disburses at capture', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis01({ browser });
    });

    /* -------------------------------------------------------------- */
    /* ON_ORDER_COMPLETE                                               */
    /* -------------------------------------------------------------- */
    test('PP-DIS-02: ON_ORDER_COMPLETE parks funds until the order completes', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis02({ browser });
    });

    test('PP-DIS-03: ON_ORDER_COMPLETE releases on the status transition', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis03({ browser });
    });

    test('PP-DIS-04: ON_ORDER_COMPLETE orders never enter the daily delayed queue', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* DELAYED                                                         */
    /* -------------------------------------------------------------- */
    test('PP-DIS-05: DELAYED mode parks funds with the configured delay', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis05({ browser });
    });

    test('PP-DIS-06: the daily scheduled job releases matured delayed funds', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis06({ browser });
    });

    test('PP-DIS-07: unmatured delayed funds are not released early', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis07({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Delay-period configuration                                      */
    /* -------------------------------------------------------------- */
    test('PP-DIS-08: delay period is clamped at the documented maximum', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await disbursement.ppDis08({ browser });
    });

    test('PP-DIS-09: empty delay period releases immediately rather than after seven days', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis09({ browser });
    });

    /* -------------------------------------------------------------- */
    /* What PayPal is actually told                                    */
    /* -------------------------------------------------------------- */
    test('PP-DIS-10: non-instant modes are transmitted to PayPal as DELAYED', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis10({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Ledger effects of a release                                     */
    /* -------------------------------------------------------------- */
    test('PP-DIS-11: reverse withdrawal is created on delayed disbursement', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        await disbursement.ppDis11({ browser });
    });

    test('PP-DIS-12: reverting an order status does not double-release funds', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis12({ browser });
    });

    test('PP-DIS-13: vendor withdraw balance reflects released funds only', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        await disbursement.ppDis13({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Multi-vendor hygiene                                            */
    /* -------------------------------------------------------------- */
    test('PP-DIS-14: orphan sub-order rows are reported but do not fail the run', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await disbursement.ppDis14({ browser });
    });
});
