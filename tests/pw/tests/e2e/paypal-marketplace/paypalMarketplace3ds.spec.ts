import { PayPalMarketplace3dsPage } from './paypalMarketplace3dsPage';
import { test } from '@utils/test';

const pp3ds = new PayPalMarketplace3dsPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — 3D Secure gating', () => {
    // Each case loads the classic checkout twice (positive control, then the negative), and each load
    // is preceded by a cart rebuild.
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async () => {
        await pp3ds.setupAll();
    });

    // After EVERY test, not just at the end: a case that dies mid-mutation would otherwise leave the
    // store on a foreign base country, or the vendor UCC-enabled, for every later test in this file
    // AND every later PayPal spec on this worker.
    test.afterEach(async () => {
        await pp3ds.teardownEach();
    });

    test.afterAll(async () => {
        await pp3ds.teardownAll();
    });

    /* ================================================================== */
    /* PP-3DS-01 — the ucc_mode setting gate                              */
    /* ================================================================== */
    test('PP-3DS-01: UCC card fields are absent when UCC mode is off', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await pp3ds.pp3ds01({ browser });
    });

    /* ================================================================== */
    /* PP-3DS-02 — the store-country gate                                 */
    /* ================================================================== */
    test('PP-3DS-02: UCC card fields are absent for a non-UCC store country', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await pp3ds.pp3ds02({ browser });
    });

    /* ================================================================== */
    /* PP-3DS-03 — the button-type gate                                   */
    /* ================================================================== */
    test('PP-3DS-03: UCC card fields are absent with the standard button type', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await pp3ds.pp3ds03({ browser });
    });

    test('PP-3DS-04: completing a 3DS challenge is not automatable', { tag: ['@pro', '@customer'] }, async () => {
        await pp3ds.pp3ds04();
    });
});
