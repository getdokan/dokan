import { PayPalMarketplaceEdgePage } from './paypalMarketplaceEdgePage';
import { test } from '@utils/test';

const edge = new PayPalMarketplaceEdgePage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

// NOT `test.describe.serial` — see the file header.
test.describe('PayPal Marketplace — edge cases and error paths', () => {
    // Several cases build an eleven-vendor cart, drive a real checkout POST, or deactivate and
    // reactivate the module (whose deactivation hook makes a live PayPal call on shutdown).
    test.describe.configure({ timeout: 600_000 });

    test.beforeAll(async () => {
        await edge.setupAll();
    });

    // Restore after EVERY test so a case that dies mid-mutation cannot hand the next one a
    // disabled gateway, a foreign currency, an armed interceptor or somebody else's cart.
    test.afterEach(async () => {
        await edge.teardownEach();
    });

    test.afterAll(async () => {
        await edge.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Cart composition                                                */
    /* -------------------------------------------------------------- */
    test('PP-EDG-01: a cart mixing a connected and an unconnected vendor withdraws the gateway and blocks checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg01({ browser });
    });

    test('PP-EDG-02: a cart holding eleven vendors is rejected with the module\'s ten-vendor cap message', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg02({ browser });
    });

    test('PP-EDG-03: a cart at exactly ten vendors is accepted — the cap does not fire on the boundary', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg03({ browser });
    });

    test('PP-EDG-04: add-to-cart is blocked for an unconnected vendor only while PayPal is the sole gateway', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg04({ browser });
    });

    test('PP-EDG-05: the cart-item validation filter can reject one specific item', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Module / gateway lifecycle                                      */
    /* -------------------------------------------------------------- */
    test('PP-EDG-06: deactivating the module removes the gateway from checkout, settings and REST', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await edge.ppEdg06({ browser });
    });

    test('PP-EDG-07: disabling the gateway short-circuits its controllers while gateway registration survives', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await edge.ppEdg07({ browser });
    });

    test('PP-EDG-08: needs_setup() ignores both the enabled state and currency validity', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await edge.ppEdg08({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Payment routes and the outgoing payload                         */
    /* -------------------------------------------------------------- */
    test('PP-EDG-09: the cart payment route rejects a guest with an empty cart', { tag: ['@pro', '@customer'] }, async () => {
        await edge.ppEdg09();
    });

    test('PP-EDG-10: a very large order total is transmitted without precision loss', { tag: ['@pro', '@customer'] }, async () => {
        await edge.ppEdg10();
    });

    test('PP-EDG-11: an order with only shipping value and a zero-priced product still builds a reconciling payload', { tag: ['@pro', '@customer'] }, async () => {
        await edge.ppEdg11();
    });

    /* -------------------------------------------------------------- */
    /* Deleted vendor                                                  */
    /* -------------------------------------------------------------- */
    test('PP-EDG-12: an order whose vendor was deleted after capture still renders in wp-admin', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await edge.ppEdg12({ browser });
    });
});
