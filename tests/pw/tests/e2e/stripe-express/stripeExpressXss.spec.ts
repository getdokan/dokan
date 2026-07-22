import { test, expect, request, Browser } from '@utils/test';
import { SERVER_URL, toPath } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    adminAuth,
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    setGatewayDescription,
    setExpressGatewaySettings,
    getStripeChargeIdForOrder,
} from './helpers';

/**
 * Stripe Express — SE-XSS (stored XSS / output escaping).
 *
 * The gateway DESCRIPTION + TITLE are admin-controlled strings that surface in every
 * customer's browser at checkout (block radio label + description). If they were rendered
 * raw, an actor who can set them could store markup that EXECUTES for every shopper.
 * Server-side both run through Helper::sanitize_html() (wp_kses → only <br>/<img> sans
 * onerror), so a <script>/<img onerror> payload must land as inert TEXT, not execute.
 *
 * SE-XSS-01 — stored payload in the DESCRIPTION renders as text at block checkout.
 * SE-XSS-02 — stored payload in the TITLE is escaped on the method label.
 * SE-XSS-03 — statement_descriptor strips script/markup chars on save (input sanitisation).
 * SE-XSS-04 — a raw script-laced "intent_id" in an order note is escaped on the admin order
 *             screen (defense-in-depth render layer — the update_order_status mismatch note).
 *
 * describe.serial because it mutates GLOBAL gateway settings (description/title/descriptor)
 * and seeds the shared connected vendor. The DESCRIPTION payload is injected once in beforeAll
 * and RESTORED in afterAll (setGatewayDescription back to benign + ensureStripeExpressConfigured()
 * to re-assert a clean gateway). Each per-test mutation (title, descriptor) restores itself.
 * The checkout-render cases self-skip without keys (`!hasCredentials`); the order-note render
 * case (SE-XSS-04) needs no keys, so the product is created unconditionally.
 */

// Unique sentinels (per run) so the assertions can't false-match leftover markup.
const DESC_SENTINEL = `SEXSSDESC${Date.now()}`;
const DESC_PAYLOAD = `<img src=x onerror="window.__seDescXss=1"><script>window.__seDescXss=1</script>${DESC_SENTINEL}`;
const DEFAULT_TITLE = 'Stripe Express';
const DEFAULT_DESC = 'Pay with your credit card via Stripe Express.';

/** Set the gateway TITLE via the admin WC settings UI (no mu-plugin/title param exists — done inline). */
async function setGatewayTitleViaAdmin(browser: Browser, title: string): Promise<void> {
    const ctx = await browser.newContext({ storageState: adminAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeExpressPage(page);
        await stripe.gotoGatewaySettings();
        await page.locator(stripe.admin.title).fill(title);
        await page.locator(stripe.admin.saveButton).first().click();
        await page.waitForLoadState('domcontentloaded');
        await page.locator(stripe.admin.enabled).waitFor({ state: 'visible', timeout: 30_000 });
    } finally {
        await page.close();
        await ctx.close();
    }
}

test.describe.serial('Stripe Express — SE-XSS (stored XSS / output escaping) @pro', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;
    const createdOrderIds: string[] = [];

    test.beforeAll(async () => {
        // SE-XSS-04 (order-note render escaping) runs WITHOUT keys, so the product is created
        // unconditionally; the gateway/description/vendor seeding only matters for the
        // checkout-render cases (SE-XSS-01/02/03), which self-skip when keys are absent.
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express XSS Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();

        if (!hasCredentials) {
            return;
        }
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        // Inject the stored DESCRIPTION payload (mu-plugin writes the raw option, bypassing WC's
        // input sanitisation — so this exercises the OUTPUT sanitiser at checkout).
        await setGatewayDescription(DESC_PAYLOAD);
    });

    test.afterAll(async () => {
        if (hasCredentials) {
            // ALWAYS restore a benign description first so the payload can't poison other checkout
            // specs on this worker (ensureStripeExpressConfigured MERGES settings and does not clear
            // an existing description), then re-assert a clean gateway config + drop the seeded vendor.
            await setGatewayDescription(DEFAULT_DESC);
            await ensureStripeExpressConfigured();
            await removeStripeExpressConnectedVendor(VENDOR_ID);
        }
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
            for (const orderId of createdOrderIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
    });

    // ---- SE-XSS-01 — stored DESCRIPTION payload renders as TEXT at block checkout ----

    test('SE-XSS-01: a stored script payload in the gateway DESCRIPTION renders as text (not executed) at block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be configured for the description to render at checkout');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let dialogMessage: string | null = null;
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss().catch(() => undefined);
        });
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway(); // renders the gateway description (where the payload lives)
            await page.waitForTimeout(2_500); // give an <img onerror>/inline script a chance to fire if live

            // Self-scope to the element rendering our sentinel and read its markup + the execution flag.
            const probe = await page.evaluate((sentinel: string) => {
                const w = window as unknown as { __seDescXss?: unknown };
                let host: Element | null = null;
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let current: Node | null = walker.nextNode();
                while (current) {
                    if ((current.textContent ?? '').includes(sentinel)) {
                        host = current.parentElement;
                        break;
                    }
                    current = walker.nextNode();
                }
                return {
                    executed: Boolean(w.__seDescXss),
                    sentinelRendered: host !== null,
                    containerHtml: host ? host.innerHTML : '',
                };
            }, DESC_SENTINEL);

            expect(probe.executed, 'a stored <img onerror>/<script> description payload must NOT execute at block checkout').toBe(false);
            expect(dialogMessage, 'the stored description payload must not raise an alert dialog').toBeNull();
            expect(probe.sentinelRendered, 'the description must actually render (sentinel present) so the payload path is exercised').toBe(true);
            expect(probe.containerHtml, 'the rendered description must contain no live <script> tag').not.toContain('<script');
            expect(probe.containerHtml.toLowerCase(), 'the rendered description must contain no onerror handler').not.toContain('onerror');
            await expect(page.getByText(DESC_SENTINEL).first(), 'the payload renders as inert TEXT (sentinel visible)').toBeVisible();
            log.success('SE-XSS-01: gateway description payload rendered as text and did not execute (output sanitised)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-XSS-02 — stored TITLE payload is escaped on the block method label ----

    test('SE-XSS-02: a stored script payload in the gateway TITLE is escaped on the checkout method label', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be configured for the title to render at checkout');

        const titleSentinel = `SEXSSTITLE${Date.now()}`;
        const titlePayload = `<img src=x onerror="window.__seTitleXss=1"><script>window.__seTitleXss=1</script>${titleSentinel}`;

        // Set the payload title (admin UI — the mu-plugin exposes no title param).
        await setGatewayTitleViaAdmin(browser, titlePayload);
        try {
            const ctx = await browser.newContext({ storageState: customerAuth });
            const page = await ctx.newPage();
            let dialogMessage: string | null = null;
            page.on('dialog', async dialog => {
                dialogMessage = dialog.message();
                await dialog.dismiss().catch(() => undefined);
            });
            try {
                const stripe = new StripeExpressPage(page);
                await dbUtils.clearCustomerCart(CUSTOMER_ID);
                await stripe.addProductToCart(productId);
                await stripe.gotoBlockCheckout();
                await stripe.selectBlockGateway();
                await page.waitForTimeout(2_500);

                const labelHtml = await page.locator(stripe.blockSelectors.gatewayLabel).first().innerHTML();
                const executed = await page.evaluate(() => Boolean((window as unknown as { __seTitleXss?: unknown }).__seTitleXss));

                expect(executed, 'a stored payload in the gateway title must NOT execute on the method label').toBe(false);
                expect(dialogMessage, 'the stored title payload must not raise an alert dialog').toBeNull();
                expect(labelHtml, 'the method label must contain no live <script> tag').not.toContain('<script');
                expect(labelHtml.toLowerCase(), 'the method label must contain no onerror handler').not.toContain('onerror');
                await expect(page.getByText(titleSentinel).first(), 'the title payload renders as inert TEXT (sentinel visible)').toBeVisible();
                log.success('SE-XSS-02: gateway title payload was escaped on the checkout method label (did not execute)');
            } finally {
                await page.close();
                await ctx.close();
            }
        } finally {
            // Guaranteed restore so the payload title cannot leak into later checkout specs.
            await setGatewayTitleViaAdmin(browser, DEFAULT_TITLE).catch(err => log.warn(`SE-XSS-02: failed to restore gateway title: ${String(err)}`));
        }
    });

    // ---- SE-XSS-03 — statement_descriptor strips script/markup chars on save ----

    test('SE-XSS-03: a markup/script statement_descriptor is sanitised before it reaches Stripe (charge descriptor is clean)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — needs a real charge to inspect the descriptor sent to Stripe');

        // statement_descriptor is NOT a customer-facing string (it is the bank-statement field), so the
        // real protection is that Dokan CLEANS it before sending to Stripe — a raw <script>/<img onerror>
        // payload (with markup + >22 chars) would otherwise make Stripe REJECT the PaymentIntent (no order).
        // So: a successful order-received PROVES the cleaning ran, and the charge descriptor must be markup-free.
        const stmtPayload = '<script>alert(1)</script><img src=x onerror=1>ExpressShop';
        await setExpressGatewaySettings({ statement_descriptor: stmtPayload });

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            const orderId = await stripe.placeBlockOrderExpectReceived();
            expect(orderId, 'order reached order-received → the markup descriptor was cleaned (Stripe would reject a raw <script> value)').toBeTruthy();

            const charge = await stripeApi.getCharge(await getStripeChargeIdForOrder(orderId as string));
            const descriptor = String(charge.statement_descriptor ?? '');
            expect(descriptor, 'the descriptor sent to Stripe must carry no markup characters').not.toMatch(/[<>]/);
            expect(descriptor.toLowerCase(), 'the descriptor sent to Stripe must contain no <script>/onerror').not.toMatch(/script|onerror/);
            log.success(`SE-XSS-03: markup statement_descriptor sanitised before Stripe (charge descriptor="${descriptor}")`);
        } finally {
            // Restore — clear the descriptor so nothing carries into other specs.
            try {
                await setExpressGatewaySettings({ statement_descriptor: '' });
            } catch (err) {
                log.warn(`SE-XSS-03: failed to clear statement_descriptor: ${String(err)}`);
            }
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-XSS-04 — raw "intent_id" in an order note is escaped on the admin order screen ----

    test('SE-XSS-04: a script-laced intent_id in an order note is escaped on the admin order screen (defense-in-depth)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const noteSentinel = `SEXSSNOTE${Date.now()}`;
        // The update_order_status mismatch note interpolates the raw intent_id — model that with a payload id.
        const forgedIntent = `pi_<script>window.__seNoteXss=1</script><img src=x onerror="window.__seNoteXss=1">${noteSentinel}`;
        const noteText = `Stripe Express: the payment intent (${forgedIntent}) could not be matched to this order.`;

        // Create an order + the malicious note via direct WC REST (admin), then verify how WP renders it.
        let orderId: string;
        const apiCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const orderRes = await apiCtx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: { status: 'processing', line_items: [{ product_id: Number(productId), quantity: 1 }] },
            });
            expect(orderRes.ok(), 'order created for the note-render check').toBeTruthy();
            orderId = String((await orderRes.json()).id);
            createdOrderIds.push(orderId);
            const noteRes = await apiCtx.post(`${SERVER_URL}/wc/v3/orders/${orderId}/notes`, { data: { note: noteText } });
            expect(noteRes.ok(), 'malicious order note created').toBeTruthy();
        } finally {
            await apiCtx.dispose();
        }

        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        let dialogMessage: string | null = null;
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss().catch(() => undefined);
        });
        try {
            await page.goto(toPath(`wp-admin/admin.php?page=wc-orders&action=edit&id=${orderId}`));
            await page.waitForLoadState('domcontentloaded');

            const note = page.locator('ul.order_notes li.note').filter({ hasText: noteSentinel }).first();
            await expect(note, 'the order note should render with the sentinel as text').toBeVisible({ timeout: 30_000 });
            await page.waitForTimeout(1_500); // give any payload a chance to fire if it were live

            const noteHtml = await note.locator('.note_content').innerHTML().catch(() => note.innerHTML());
            const executed = await page.evaluate(() => Boolean((window as unknown as { __seNoteXss?: unknown }).__seNoteXss));

            expect(executed, 'a script/onerror payload in an order note must NOT execute on the admin order screen').toBe(false);
            expect(dialogMessage, 'the order-note payload must not raise an alert dialog').toBeNull();
            expect(noteHtml, 'the rendered order note must contain no live <script> tag').not.toContain('<script');
            expect(noteHtml.toLowerCase(), 'the rendered order note must contain no onerror handler').not.toContain('onerror');
            log.success('SE-XSS-04: a raw script-laced intent_id in an order note was escaped on the admin order screen');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
