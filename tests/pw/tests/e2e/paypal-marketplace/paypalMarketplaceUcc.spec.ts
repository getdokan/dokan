import { PayPalMarketplaceUccPage } from './paypalMarketplaceUccPage';
import { test } from '@utils/test';

const ucc = new PayPalMarketplaceUccPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — unbranded Advanced Card (UCC)', () => {
    // Each card case loads the classic checkout, waits for the PayPal SDK, mounts three cross-origin
    // iframes, types a card and waits on two live PayPal round trips.
    test.describe.configure({ timeout: 420_000 });

    test.beforeAll(async () => {
        await ucc.setupAll();
    });

    // After EVERY case, not only at the end: a case that dies mid-mutation would otherwise leave
    // ucc_mode on and the vendors UCC-flagged for every later PayPal spec on this worker, which would
    // hand them a card form none of them expect and fail PP-SET-19 in a different file.
    test.afterEach(async () => {
        await ucc.teardownEach();
    });

    test.afterAll(async () => {
        await ucc.teardownAll();
    });

    /* ================================================================== */
    /* PP-UCC-01 — the gate the product resolves, then the form it produces */
    /* ================================================================== */
    test('PP-UCC-01: the card form is offered and its hosted fields mount when Helper::is_ucc_enabled() resolves true', { tag: ['@pro', '@customer'] }, async ({
        browser,
    }) => {
        await ucc.ppUcc01({
        browser,
    });
    });

    /* ================================================================== */
    /* PP-UCC-02 — gate 5 is all-or-nothing across the cart                */
    /* ================================================================== */
    test('PP-UCC-02: the card form is withdrawn when one seller in the cart lacks the UCC meta', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc02({ browser });
    });

    /* ================================================================== */
    /* PP-UCC-03 — a card payment captures, with no PayPal login          */
    /* ================================================================== */
    test('PP-UCC-03: a card payment captures without any PayPal-hosted page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc03({ browser });
    });

    /* ================================================================== */
    /* PP-UCC-04 — the split facts a wallet capture would have written     */
    /* ================================================================== */
    test('PP-UCC-04: a captured card order carries the same commission and fee facts as a wallet capture', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc04({ browser });
    });

    /* ================================================================== */
    /* PP-UCC-05 — capture id on EVERY sub order, plus the parent copy     */
    /* ================================================================== */
    test('PP-UCC-05: a multi-vendor card capture writes a capture id to every sub order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc05({ browser });
    });

    /* ================================================================== */
    /* PP-UCC-06 — an incomplete card cannot start a payment              */
    /* ================================================================== */
    test('PP-UCC-06: the unbranded Pay button is gated on hosted-field validity', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc06({ browser });
    });

    /* ================================================================== */
    /* PP-UCC-07 — the SDK tag a split card cart needs                     */
    /* ================================================================== */
    test('PP-UCC-07: the SDK tag carries the client token and every seller merchant id for a split cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await ucc.ppUcc07({ browser });
    });
});
