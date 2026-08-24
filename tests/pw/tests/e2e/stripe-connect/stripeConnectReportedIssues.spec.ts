import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, ensureClassicCheckoutPage, seedStripeConnectVendor, removeStripeConnectVendor } from './helpers';

/**
 * Validation of the manually-filed Stripe Connect issues.
 *
 * These are NOT Tier 1 cases and nothing here ticks a Tier 1 box. They exist because a second tester
 * filed sub-issues under getdokan/plugin-internal-tasks#2293 and each claim needs to be reproduced
 * or refuted on this build rather than taken on trust. Each test asserts the CORRECT behaviour, so a
 * confirmed defect fails and an unreproduced claim passes — and either way the run says which.
 */
test.describe.serial('Stripe Connect — validation of reported issues @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const guestBilling = {
        email: 'guest.issues.stripeconnect@example.com',
        firstName: 'Guest',
        lastName: 'Buyer',
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
        phone: MOBILE_TEST_PHONE,
    };

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureClassicCheckoutPage();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Issue Validation' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    // ---- #2295 — the block checkout replaces Stripe's reason with a generic message ----

    test('#2295: a declined card shows the real Stripe reason on BOTH checkouts', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        let blockMessage = '';
        let classicMessage = '';

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        try {
            const stripe = new StripeConnectPage(pageA);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email: 'guest.msg.block@example.com' });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeBlockOrderExpectError().catch(() => undefined);
            blockMessage = (
                await pageA
                    .locator(stripe.blockSelectors.error)
                    .first()
                    .innerText()
                    .catch(() => '')
            )
                .replace(/\s+/g, ' ')
                .trim();
        } finally {
            await pageA.close();
            await ctxA.close();
        }

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        try {
            const stripe = new StripeConnectPage(pageB);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeClassicOrderExpectError().catch(() => undefined);
            classicMessage = (
                await pageB
                    .locator(stripe.checkout.classicError)
                    .first()
                    .innerText()
                    .catch(() => '')
            )
                .replace(/\s+/g, ' ')
                .trim();
        } finally {
            await pageB.close();
            await ctxB.close();
        }

        log.info(`#2295 block message:   "${blockMessage}"`);
        log.info(`#2295 classic message: "${classicMessage}"`);

        expect(classicMessage, 'the classic checkout should say why the card failed').toMatch(/declin/i);
        /*
         * CONFIRMED DEFECT — getdokan/plugin-internal-tasks#2295, reproduced verbatim on this build:
         *   classic: "Your card has been declined."
         *   block:   "Something went wrong. Please contact us to get assistance."
         * The decline is handled correctly underneath; only the message the shopper reads is wrong,
         * which is what makes it a support problem rather than a money one.
         *
         * test.fail() is imperative and one line before the failing assertion, so the positive
         * control above (the classic checkout DOES show the reason) still reports honestly.
         */
        test.fail();
        expect(blockMessage.toLowerCase(), 'the block checkout should show the real decline reason, not a generic message').not.toContain('something went wrong');
    });

    // ---- #2297 — editing a checkout field after entering the card silently wipes it ----

    test('#2297: editing an address field after entering the card does not silently wipe it', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        let framesBefore: string[] = [];
        let framesAfter: string[] = [];
        let cardSpecificNotice = '';
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            // The issue's own evidence is that the Payment Element is REPLACED: its iframe name
            // changes across the recalculation. That is observable from outside the cross-origin
            // frame, unlike the card value itself, so it is what this measures.
            const stripeFrameNames = async () =>
                page.evaluate(() =>
                    Array.from(document.querySelectorAll('iframe'))
                        .map(f => (f as HTMLIFrameElement).name)
                        .filter(n => /privateStripeFrame/.test(n)),
                );

            framesBefore = await stripeFrameNames();

            // Observe the recalculation itself. Without this, "the frames did not change" is
            // consistent with the element surviving AND with the recalculation never having run,
            // and those are opposite conclusions.
            let updateFired = false;
            page.on('request', req => {
                if (/wc-ajax=update_order_review/.test(req.url())) {
                    updateFired = true;
                }
            });

            await test.step('change a billing field that forces WooCommerce to recalculate the order review', async () => {
                /*
                 * Postcode, not city. The issue says "edit the billing city", but WooCommerce only
                 * runs update_order_review for fields that can change shipping or tax. Editing the
                 * city fired nothing on this site, which made an earlier version of this test report
                 * "did not reproduce" without the recalculation ever having happened — a vacuous pass.
                 */
                await page.fill('#billing_postcode', '02108');
                await page.locator('#billing_postcode').blur();
                /*
                 * Ask WooCommerce for the recalculation explicitly.
                 *
                 * Filling the field and blurring it did not fire update_order_review on this site,
                 * for either city or postcode — the checkout script binds to its own change handling
                 * and a programmatic fill does not always reach it. `update_checkout` is WooCommerce's
                 * own documented trigger for exactly this recalculation, so using it exercises the
                 * scenario the issue describes rather than a near-miss of it. The assertion below
                 * still requires the request to actually happen.
                 */
                await page.evaluate(() => (window as any).jQuery?.(document.body).trigger('update_checkout'));
                await page.waitForTimeout(1_000);
                await stripe.waitForCheckoutSettled();
                await page.waitForTimeout(3_000);
            });

            framesAfter = await stripeFrameNames();

            // Only notices that actually mention the card/payment count as a warning. The earlier
            // version of this test accepted ANY non-empty notice and therefore passed on
            // WooCommerce's standard "Returning customer?" and "Have a coupon?" banners, which say
            // nothing about the card. That was a false pass and is the reason for this filter.
            const notices = await page
                .locator('.dokan-stripe-pe-errors, .woocommerce-error, .woocommerce-info, .woocommerce-message')
                .allInnerTexts()
                .catch(() => [] as string[]);
            cardSpecificNotice = notices
                .map(t => t.trim())
                .filter(t => /card|payment method|re-?enter/i.test(t) && !/coupon|returning customer/i.test(t))
                .join(' | ');

            expect(updateFired, 'the billing edit must actually trigger update_order_review, or this case proves nothing').toBe(true);
            log.info(`#2297 stripe frames before: ${JSON.stringify(framesBefore)}`);
            log.info(`#2297 stripe frames after:  ${JSON.stringify(framesAfter)}`);
            log.info(`#2297 card-specific notice: "${cardSpecificNotice}"`);
        } finally {
            await page.close();
            await ctx.close();
        }

        const elementWasReplaced = framesBefore.length > 0 && framesAfter.length > 0 && framesBefore.join(',') !== framesAfter.join(',');

        /*
         * The claim: the recalculation destroys the Payment Element holding the typed card, and the
         * shopper is told nothing until they press Place order. Asserted as the correct behaviour —
         * either the element survives, or the shopper is warned at the moment it is replaced.
         */
        if (elementWasReplaced) {
            /*
             * CONFIRMED DEFECT — getdokan/plugin-internal-tasks#2297, reproduced on this build once
             * the recalculation is genuinely triggered: two of the four Stripe frames are replaced
             * (4937 → 49314, 4939 → 49316), so the element holding the typed card is destroyed, and
             * no card-specific notice is shown at that moment.
             */
            test.fail();
            expect(cardSpecificNotice, 'the Payment Element was replaced by the recalculation, so the shopper must be told at that moment that the card needs re-entering').not.toBe('');
        } else {
            log.success('#2297 did not reproduce: the Payment Element survived the recalculation on this build.');
        }
    });

    // ---- #2298 — the checkout mints a PaymentIntent twice per page load ----

    test('#2298: one PaymentIntent request per checkout page load', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — the gateway would not mint an intent');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        const intentRequests: string[] = [];
        try {
            page.on('request', req => {
                if (req.method() === 'POST' && /stripe-connect\/payment-intent/.test(req.url())) {
                    intentRequests.push(req.url());
                }
            });
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email: 'guest.intent.count@example.com' });
            await stripe.selectBlockGateway();
            await page.waitForTimeout(4_000);
        } finally {
            await page.close();
            await ctx.close();
        }

        log.info(`#2298 payment-intent POSTs observed on one page load: ${intentRequests.length}`);
        expect(intentRequests.length, `the checkout should mint one PaymentIntent per page load, observed ${intentRequests.length}`).toBeLessThanOrEqual(1);
    });
});
