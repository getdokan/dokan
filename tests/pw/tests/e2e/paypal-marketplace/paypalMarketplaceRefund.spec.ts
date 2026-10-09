import { PayPalMarketplaceRefundPage } from './paypalMarketplaceRefundPage';
import { test } from '@utils/test';

const refund = new PayPalMarketplaceRefundPage();

/* ------------------------------------------------------------------ */
/* Suite                                                                */
/* ------------------------------------------------------------------ */
test.describe('PayPal Marketplace — refunds', () => {
    /**
     * Every case buys something, waits for a human-speed hosted approval on paypal.com, captures, and
     * then refunds — several live round trips per case, on a third-party site.
     */
    test.describe.configure({ timeout: 900_000 });

    test.beforeAll(async () => {
        await refund.setupAll();
    });

    test.afterAll(async () => {
        await refund.teardownAll();
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-01 — full refund, single vendor                          */
    /* -------------------------------------------------------------- */
    test('PP-REF-01: a full refund on a single-vendor order succeeds and reverses the vendor earning', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef01({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-02 — partial refund                                      */
    /* -------------------------------------------------------------- */
    test('PP-REF-02: a partial refund records the requested amount and reduces the refundable balance', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef02({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-03 — second refund on the same capture (DOK-019 guard)   */
    /* -------------------------------------------------------------- */

    /**
     * PP-REF-03 is a PASSING regression guard, not a `fixme`. DOK-019 (a second refund on one capture
     * failing with `DUPLICATE_INVOICE_ID`) was fixed in the installed 5.0.9 by suffixing the Dokan
     * refund id onto the invoice id (`includes/Refund.php:135-141`), so the correct behaviour is
     * assertable today and the pre-fix error string is kept as a negative anchor.
     */
    test('PP-REF-03: a second refund on the same capture succeeds with a distinct refund id (DOK-019 guard)', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef03({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-04 — multi-vendor isolation                              */
    /* -------------------------------------------------------------- */
    test('PP-REF-04: a multi-vendor partial refund touches only the targeted vendor', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef04({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-05 — block checkout, multi-vendor (DOK-018 guard)        */
    /* -------------------------------------------------------------- */

    /**
     * PP-REF-05 is a PASSING regression guard for DOK-018 — a block-checkout multi-vendor refund that
     * could not find its capture id. The fix shipped in 5.0.9: `protect_paid_sub_orders()`
     * (`Order/OrderController.php:83-140`), registered at priority 9 on
     * `woocommerce_store_api_checkout_order_processed` so it removes Lite's splitter before it runs, plus
     * the vendor-keyed fallback written by `OrderManager::store_capture_payment_data()`
     * (`Order/OrderManager.php:595-608`) and applied by `restore_capture_payment_data()` (`:642-...`).
     *
     * The case drives the checkout block's REAL sequence, because both halves of the fix only exist
     * inside it: create-payment splits the Store API draft order, the buyer approves on PayPal, the
     * module's capture-payment route captures onto those sub orders, and only THEN is the order placed
     * through `POST /wc/store/v1/checkout` — the request in which Lite's splitter used to `delete( true )`
     * every sub order and build different ones carrying none of the capture data. The buyer's return
     * redirect is blocked in the browser (see `approveOnPayPalWithoutReturning()`), because letting it
     * through hands the capture to `maybe_process_order_redirect()`, takes the order out of
     * `checkout-draft`, and makes the Store API place a second order — closing the window entirely.
     */
    test('PP-REF-05: a block-checkout multi-vendor refund finds its capture id (DOK-018 guard)', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef05({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-06 — over-refund rejected                                */
    /* -------------------------------------------------------------- */

    /**
     * Driven through the VENDOR's own AJAX transport rather than the mu-plugin route, because that is
     * where the guard being tested lives: `Request::validate()` → `Validator::validate_refund_amount()`
     * (`dokan-pro/includes/Refund/Validator.php:62-78`). The mu-plugin route calls
     * `dokan_pro()->refund->create()` directly and bypasses the validator entirely, so testing there
     * would prove nothing about what a real user can do.
     */
    test('PP-REF-06: a refund larger than the captured amount is rejected before any PayPal call', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await refund.ppRef06({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-07 — refund of a fully refunded order                    */
    /* -------------------------------------------------------------- */
    test('PP-REF-07: a further refund on an already fully-refunded order is rejected cleanly', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        await refund.ppRef07({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-08 — vendor request reaches the admin queue              */
    /* -------------------------------------------------------------- */

    /**
     * ⚠️ Read the failure message before filing anything. This case asserts the CATALOGUED expectation —
     * a vendor-initiated request waits, pending, for admin action — against a module that processes and
     * approves it inside the creation hook (`includes/Refund.php:132-216`, and `:123-130` for a manual
     * request). If the assertion below fails, the deviation is real and consequential (a vendor refunds
     * a customer with no admin gate, and the admin refund queue never shows a PayPal-marketplace request
     * at all) but it may equally be a DELIBERATE design for a gateway where the vendor holds the funds —
     * in which case the catalogue, not the product, is what needs correcting. That determination is the
     * reader's; what this case guarantees is that the behaviour cannot pass unnoticed.
     */
    test('PP-REF-08: a vendor-initiated refund request reaches the admin refund queue for approval', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        await refund.ppRef08({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-09 — admin approval executes the PayPal refund           */
    /* -------------------------------------------------------------- */

    /**
     * The precondition ("a pending vendor refund request") is checked, not assumed. If the product has
     * already processed the request by the time it exists — see PP-REF-08 — there is no pending request
     * for an admin to approve, and this case SKIPS with the observed status rather than inventing one:
     * writing a `pending` row by hand and approving it would test a state the product never produces.
     * The moment a pending request becomes reachable, this case runs for real without being touched.
     */
    test('PP-REF-09: admin approval of a pending vendor refund executes the PayPal refund', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        await refund.ppRef09({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-10 — admin rejection moves no money                      */
    /* -------------------------------------------------------------- */
    test('PP-REF-10: admin rejection of a pending vendor refund moves no money', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        await refund.ppRef10({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-11 — refund on a delayed-disbursement order              */
    /* -------------------------------------------------------------- */
    test('PP-REF-11: a refund on a delayed-disbursement order reverses the payment and releases nothing', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef11({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-12 — shipping and tax refundable from the vendor's share */
    /* -------------------------------------------------------------- */
    test('PP-REF-12: shipping and tax are refundable, with the seller as their recipient', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef12({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-13 — gateway fee is read, never assumed                  */
    /* -------------------------------------------------------------- */
    test('PP-REF-13: the gateway processing fee on a refund is read from meta and still reconciles', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        await refund.ppRef13({ browser });
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-14 — the vendor-side reversal ledger                     */
    /* -------------------------------------------------------------- */
    test('PP-REF-14: a completed refund is recorded in the vendor ledger with the correct sign and amount', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        await refund.ppRef14({ browser });
    });
});
