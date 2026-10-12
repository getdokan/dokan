import { PayPalMarketplaceSplitPage } from './paypalMarketplaceSplitPage';
import { test } from '@utils/test';

const split = new PayPalMarketplaceSplitPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — multi-vendor split', () => {
    // Every case creates at least one live PayPal order; PP-SPL-12 additionally drives PayPal's
    // hosted approval window and a capture.
    test.describe.configure({ timeout: 420_000 });

    test.beforeAll(async () => {
        await split.setupAll();
    });

    test.afterAll(async () => {
        await split.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-01 … PP-SPL-04 — identity and money, per unit             */
    /* -------------------------------------------------------------- */
    test('PP-SPL-01: a two-vendor cart produces two purchase units', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl01({ browser });
    });

    test('PP-SPL-02: each purchase unit is payable to its own vendor merchant id', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl02({ browser });
    });

    test('PP-SPL-03: unit amounts sum to the order total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl03({ browser });
    });

    test('PP-SPL-04: platform fee equals the admin commission per sub order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-05 — the clamp                                           */
    /* -------------------------------------------------------------- */
    test('PP-SPL-05: platform fee is clamped at zero, never negative', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-06 / PP-SPL-07 — shipping and tax ride their own unit     */
    /* -------------------------------------------------------------- */
    test('PP-SPL-06: shipping is allocated to the vendor\'s own unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl06({ browser });
    });

    test('PP-SPL-07: tax is allocated to the vendor\'s own unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl07({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-08 — coupon                                              */
    /* -------------------------------------------------------------- */
    test('PP-SPL-08: a vendor coupon collapses into a single breakdown discount on that vendor\'s unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl08({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-09 — the deliberate quantity-one item shape               */
    /* -------------------------------------------------------------- */
    test('PP-SPL-09: line items are sent with quantity one and subtotal unit amounts', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl09({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-10 — the two identifiers                                 */
    /* -------------------------------------------------------------- */
    test('PP-SPL-10: invoice_id is the parent order id and custom_id the sub order id', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl10({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-11 — negative fee items                                  */
    /* -------------------------------------------------------------- */
    test('PP-SPL-11: negative-fee items are dropped from the payload', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await split.ppSpl11({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-12 — the capture, and the only true money oracle          */
    /* -------------------------------------------------------------- */
    test('PP-SPL-12: vendor earnings recorded after capture match the split', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        await split.ppSpl12({ browser });
    });
});
