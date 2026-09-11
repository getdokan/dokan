import { PayPalMarketplaceSettingsPage } from './paypalMarketplaceSettingsPage';
import { test } from '@utils/test';

const settings = new PayPalMarketplaceSettingsPage();

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

// NOT `test.describe.serial`, deliberately. Playwright already runs every test in a single file
// sequentially in one worker, so `.serial` bought no ordering here — its only extra behaviour is
// ABORTING the rest of the group on the first failure. On 2026-07-31 that cost 46 of 68 cases:
// one early failure in each of the three PayPal files silently erased every case declared after it,
// and the run still summarised as mostly green. A skipped case reports as "not a failure", which is
// exactly the fake-green shape this suite exists to prevent — the cascade hides far more than it
// protects. Ordering is preserved; only the cascade is gone.
test.describe('PayPal Marketplace — admin gateway settings', () => {
    // Every real UI save runs process_admin_options(), which calls out to PayPal to register the
    // webhook. Several cases save two or three times.
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async () => {
        await settings.setupAll();
    });

    // Restore after EVERY test, so a failing case cannot leave a disabled, mis-keyed or
    // wrongly-moded gateway behind for the next test — or the next spec file on this worker.
    test.afterEach(async () => {
        await settings.teardownEach();
    });

    test.afterAll(async () => {
        await settings.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* Rendering + persistence                                         */
    /* -------------------------------------------------------------- */
    test('PP-SET-01: the gateway settings section renders at its own URL', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet01({ browser });
    });

    test('PP-SET-02: enabling the gateway through the admin UI persists', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet02({ browser });
    });

    test('PP-SET-03: enabling PayPal sandbox through the admin UI persists as test_mode', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet03({ browser });
    });

    test('PP-SET-04: sandbox credential fields persist across a reload', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Readiness — the positive baseline and its negatives             */
    /* -------------------------------------------------------------- */
    test('PP-SET-05: the gateway reaches ready state once all four conditions hold', { tag: ['@pro', '@admin'] }, async () => {
        await settings.ppSet05();
    });

    test('PP-SET-06: a ready gateway is offered at checkout with its configured title', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await settings.ppSet06({ browser });
    });

    test('PP-SET-07: an empty sandbox client id leaves the gateway not ready and hidden at checkout', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await settings.ppSet07({ browser });
    });

    test('PP-SET-08: an empty sandbox client secret leaves the gateway not ready and hidden at checkout', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await settings.ppSet08({ browser });
    });

    test('PP-SET-09: an empty partner/merchant id leaves the gateway not ready', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet09({ browser });
    });

    test('PP-SET-10: whitespace-only credentials are treated as absent', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet10({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Sandbox / live mode swap                                        */
    /* -------------------------------------------------------------- */
    test('PP-SET-11: sandbox off with only sandbox keys populated leaves the gateway not ready', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet11({ browser });
    });

    test('PP-SET-12: live and sandbox credentials are stored independently', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet12({ browser });
    });

    test('PP-SET-13: partner id is shared across modes, not mode-swapped', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet13({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Disbursement                                                    */
    /* -------------------------------------------------------------- */
    test('PP-SET-14: disbursement mode defaults to INSTANT and every value round-trips', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet14({ browser });
    });

    test('PP-SET-15: the delay-period field is revealed only for the delayed disbursement mode', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet15({ browser });
    });

    test('PP-SET-16: an unset delay period resolves to 0 while the form advertises 7', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet16({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Button, UCC, notices, attribution                               */
    /* -------------------------------------------------------------- */
    test('PP-SET-17: button type defaults to smart and both values round-trip', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet17({ browser });
    });

    test('PP-SET-18: gateway title and description round-trip and render at checkout', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await settings.ppSet18({ browser });
    });

    test('PP-SET-19: the UCC mode toggle persists', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet19({ browser });
    });

    test('PP-SET-20: vendor-dashboard notice settings persist', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet20({ browser });
    });

    test('PP-SET-21: the notice-interval field is revealed only when announcements are enabled', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet21({ browser });
    });

    test('PP-SET-22: the BN code defaults to the Dokan attribution value', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet22({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Dead configuration                                              */
    /* -------------------------------------------------------------- */
    /* PP-SET-23 (webhook registration) is deliberately NOT here — see the sibling describe at the
       bottom of this file for why a case that is expected to fail environmentally cannot sit in a
       serial group. */
    test('PP-SET-24: max_error is unreachable configuration', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet24({ browser });
    });

    /* -------------------------------------------------------------- */
    /* Restore                                                         */
    /* -------------------------------------------------------------- */
    test('PP-SET-25: the restored configuration leaves the gateway working for later specs', { tag: ['@pro', '@admin'] }, async () => {
        await settings.ppSet25();
    });
});

/* ------------------------------------------------------------------ */
/* PP-SET-23 — isolated on purpose                                     */
/* ------------------------------------------------------------------ */

/**
 * This case is EXPECTED to fail on any host PayPal cannot reach, and that is exactly why it is not
 * in the serial describe above.
 *
 * `WebhookHandler::register_webhook()` posts `home_url( 'wc-api/dokan-paypal', 'https' )` to PayPal;
 * on this environment that resolves to localhost:9999, PayPal refuses it, the handler takes its
 * `is_wp_error` branch and `delete_option()`s the very key it was supposed to write. Inside
 * `test.describe.serial` that one environmental failure would SKIP every case declared after it —
 * PP-SET-24 and, worse, PP-SET-25, whose whole job is to prove the gateway was left working for the
 * rest of the suite — and with `retries: 2` on CI the same two cases would be erased on all three
 * attempts, leaving a report that reads "1 failed, 2 skipped" and never says whether the restore
 * held. A failure that deletes other cases' results is more expensive than the failure itself.
 *
 * The only ordering this case needs is "after the gateway is configured", which its own `beforeAll`
 * guarantees without borrowing the serial group's.
 */
test.describe('PayPal Marketplace — webhook registration on save (PP-SET-23)', () => {
    test.describe.configure({ timeout: 300_000 });

    test.beforeAll(async () => {
        await settings.setupAll2();
    });

    // The save below leaves a mutated gateway (mode swap, cleared webhook rows) behind, so the same
    // restore the serial group runs after every test runs here too.
    test.afterAll(async () => {
        await settings.teardownAll2();
    });

    test('PP-SET-23: saving the settings registers a PayPal webhook id under the sandbox key', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await settings.ppSet23({ browser });
    });
});
