import { PayPalMarketplaceBlocksPage } from './paypalMarketplaceBlocksPage';
import { test } from '@utils/test';

const blocks = new PayPalMarketplaceBlocksPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — block checkout and cart', () => {
    // Two cases create a real PayPal order, which is a live round trip per path on top of the block's
    // own hydration.
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async () => {
        await blocks.setupAll();
    });

    test.afterAll(async () => {
        await blocks.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Availability on both paths                                      */
    /* -------------------------------------------------------------- */
    test('PP-BLK-01: the gateway is offered at block checkout for a connected vendor', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk01({ browser });
    });

    test('PP-BLK-02: the gateway is offered on the classic shortcode checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk02({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Equivalence of the two paths                                    */
    /* -------------------------------------------------------------- */
    test('PP-BLK-03: block and classic build equivalent purchase units for the same cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk03({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Multi-vendor sub orders                                         */
    /* -------------------------------------------------------------- */
    test('PP-BLK-04: a multi-vendor block order leaves no orphaned sub-order rows', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Cart block                                                      */
    /* -------------------------------------------------------------- */
    test('PP-BLK-05: the cart block renders with no console error attributable to the module', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Negative — unconnected vendor                                   */
    /* -------------------------------------------------------------- */
    test('PP-BLK-06: block checkout hides the gateway when the cart holds only an unconnected vendor', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk06({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Store API health                                                */
    /* -------------------------------------------------------------- */
    test('PP-BLK-07: the block checkout store-API calls succeed with no PHP notice', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await blocks.ppBlk07({ browser });
    });
});
