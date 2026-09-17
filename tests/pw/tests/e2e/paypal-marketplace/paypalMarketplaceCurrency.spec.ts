import { PayPalMarketplaceCurrencyPage } from './paypalMarketplaceCurrencyPage';
import { test } from '@utils/test';

const currency = new PayPalMarketplaceCurrencyPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — currency support', () => {
    // Several cases render classic checkout two or three times over a cold PHP cache, and PP-CUR-07
    // creates a third vendor with a product.
    test.describe.configure({ timeout: 240_000 });

    test.beforeAll(async () => {
        await currency.setupAll();
    });

    /*
     * Reset the two GLOBAL knobs after EVERY case, not just at the end of the file. A case that
     * dies between "set JPY" and its restore would otherwise leave the whole site trading in yen,
     * and the next spec on this worker would fail somewhere with no mention of currency anywhere in
     * its output.
     */
    test.afterEach(async () => {
        await currency.teardownEach();
    });

    test.afterAll(async () => {
        await currency.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Availability                                                    */
    /* -------------------------------------------------------------- */
    test('PP-CUR-01: a supported store currency leaves the gateway available at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await currency.ppCur01({ browser });
    });

    test('PP-CUR-02: an unsupported store currency removes the gateway from checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await currency.ppCur02({ browser });
    });

    test('PP-CUR-03: an unsupported currency disables the gateway in memory only', { tag: ['@pro', '@admin'] }, async () => {
        await currency.ppCur03();
    });

    test('PP-CUR-04: the admin settings screen warns instead of rendering the form on an unsupported currency', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await currency.ppCur04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Amounts                                                         */
    /* -------------------------------------------------------------- */
    test('PP-CUR-05: zero-decimal currency amounts carry no fractional part', { tag: ['@pro', '@admin'] }, async () => {
        await currency.ppCur05();
    });

    test('PP-CUR-06: a zero-decimal multi-vendor split still reconciles', { tag: ['@pro', '@admin'] }, async () => {
        await currency.ppCur06();
    });

    test('PP-CUR-07: rounding on a three-way split neither loses nor invents money', { tag: ['@pro', '@admin'] }, async () => {
        await currency.ppCur07();
    });

    /* -------------------------------------------------------------- */
    /* Change, filter, mismatch                                        */
    /* -------------------------------------------------------------- */
    test('PP-CUR-08: a mid-session currency change is reflected at checkout without a stale gateway', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await currency.ppCur08({ browser });
    });

    test('PP-CUR-09: the supported-currency filter is honoured', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await currency.ppCur09({ browser });
    });

    test('PP-CUR-10: a vendor whose PayPal account currency differs from the store is not detected by the module', { tag: ['@pro', '@admin'] }, async () => {
        await currency.ppCur10();
    });
});
