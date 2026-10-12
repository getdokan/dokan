import { PayPalMarketplaceCheckoutPage } from './paypalMarketplaceCheckoutPage';
import { test } from '@utils/test';

const checkout = new PayPalMarketplaceCheckoutPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — checkout and capture', () => {
    /**
     * `retries: 0` is a MONEY decision, not a style one: a retried capturing case would take the
     * sandbox buyer's money a second time and leave a second set of ledger rows behind, so a flake
     * would corrupt the very balances the next case asserts on. The generous timeout covers a live
     * create-order round trip, a PayPal-hosted login and approval, and the redirect back.
     */
    test.describe.configure({ retries: 0, timeout: 420_000 });

    test.beforeAll(async () => {
        await checkout.setupAll();
    });

    test.afterAll(async () => {
        await checkout.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Availability                                                    */
    /* -------------------------------------------------------------- */
    test('PP-CHK-01: the gateway is offered when a connected vendor is in the cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk01({ browser });
    });

    test('PP-CHK-02: the gateway is not offered when the only vendor in the cart is unconnected', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk02({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Button rendering                                                */
    /* -------------------------------------------------------------- */
    test('PP-CHK-03: the PayPal smart buttons render on the classic checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk03({ browser });
    });

    test('PP-CHK-04: the standard redirect button renders when button_type is standard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Create payment                                                  */
    /* -------------------------------------------------------------- */
    test('PP-CHK-05: create-payment produces a PayPal order id and the WooCommerce order records it', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* The capture                                                     */
    /* -------------------------------------------------------------- */
    test('PP-CHK-06: a single-vendor order completes end to end and the money reconciles', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk06({ browser });
    });

    test('PP-CHK-07: the thank-you page renders the completed PayPal order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk07({ browser });
    });

    test('PP-CHK-08: cancelling on PayPal returns the shopper with the cart intact and nothing captured', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk08({ browser });
    });

    test('PP-CHK-09: the capture id is written to every sub order, not only to the parent', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk09({ browser });
    });

    test('PP-CHK-10: order notes record the PayPal capture, the transaction id and the processing fee', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk10({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Duplicate submission                                            */
    /* -------------------------------------------------------------- */
    test('PP-CHK-11: capturing twice for the same PayPal order credits the vendor once', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk11({ browser });
    });

    test('PP-CHK-12: going back to checkout after approval does not create a second order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk12({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Edges                                                           */
    /* -------------------------------------------------------------- */
    test('PP-CHK-13: a zero-total order never reaches PayPal', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk13({ browser });
    });

    test('PP-CHK-14: a product going out of stock between approval and capture leaves no unrecorded payment', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk14({ browser });
    });

    test('PP-CHK-15: losing the shopper session between approval and return leaves no orphaned capture', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await checkout.ppChk15({ browser });
    });
});
