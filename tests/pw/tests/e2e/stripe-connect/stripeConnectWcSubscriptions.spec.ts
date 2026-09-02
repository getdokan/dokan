import { test, expect, request, Browser } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    VENDOR_ID,
    CUSTOMER_ID,
    restoreCustomerRole,
    customerAuth,
    hasCredentials,
    HAS_REAL_CONNECTED_ACCOUNTS,
    ensureStripeConnectConfigured,
    restoreStripeExpress,
    ensureClassicCheckoutPage,
    ensureCustomerAddress,
    seedStripeConnectVendor,
    removeStripeConnectVendor,
    getOrderStatus,
    getSubOrderIds,
    getConnectIntentIdForOrder,
    forceRenewal,
    getVendorBalance,
} from './helpers';

/**
 * Stripe Connect — a vendor's WooCommerce Subscriptions product (SCSUB-01, SCSUB-02, SCSUB-06).
 *
 * This is the other kind of subscription in Dokan, and the one where money reaches a vendor. A
 * shopper buys a recurring product from a connected vendor, so the initial payment splits like any
 * order and every later renewal has to split again.
 *
 * `6b3f2999a` fixed the renewal half. `RenewalProcessor` created the transfers but never wrote the
 * vendor balance ledger, because `IntentController::process_vendor_payment()` skips sub-orders that
 * already carry a transfer id and therefore had nothing to book. The money left the platform while
 * the vendor's withdrawable balance still showed the renewal earning, so the vendor could withdraw
 * it a second time. SCSUB-06 is the guard for that.
 */
test.describe.serial('Stripe Connect — vendor WooCommerce subscription product @pro', () => {
    test.describe.configure({ timeout: 420_000 });

    let productId: string;
    let parentOrderId = '';
    let vendorAccount = '';

    /** The vendor's approved auto-withdraws, newest first. */
    async function approvedWithdraws(): Promise<Array<{ id: number; amount: number; order_id?: number; note?: string }>> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.vendorAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/dokan/v1/withdraw?status=approved&per_page=50&orderby=id&order=desc`);
            if (!res.ok()) {
                throw new Error(`dokan/v1/withdraw failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
            }
            const body = (await res.json().catch(() => [])) as Array<{ id: number; amount: number | string; order_id?: number; note?: string }>;
            return Array.isArray(body) ? body.map(w => ({ ...w, amount: Number(w.amount) })) : [];
        } finally {
            await ctx.dispose();
        }
    }

    async function dokanEarning(orderId: string | number): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/dokan/v1/orders/${orderId}`);
            const body = (await res.json()) as { earning?: number | string };
            expect(body.earning, `dokan/v1/orders/${orderId} should report an earning`).not.toBeUndefined();
            return Number(body.earning);
        } finally {
            await ctx.dispose();
        }
    }

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured({ saved_cards: 'yes' });
        await ensureClassicCheckoutPage();
        await ensureCustomerAddress();
        vendorAccount = STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1;
        await seedStripeConnectVendor(VENDOR_ID, vendorAccount);

        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct(
            { ...payloads.createSimpleSubscriptionProduct(), name: 'Stripe Connect Vendor Subscription Product' },
            payloads.vendorAuth,
        );
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
            if (productId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    test('SCSUB-01: a customer buys a vendor subscription product and the vendor is paid once', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // No save-card tick here on purpose. WooCommerce Subscriptions forces tokenisation for a
            // recurring cart and hides the opt-in checkbox entirely, so ticking it fails on a
            // checkbox that correctly does not exist. The renewal in SCSUB-02 is what proves the
            // token really was stored.
            parentOrderId = await stripe.placeClassicOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await getOrderStatus(parentOrderId), 'the initial subscription payment should settle').toMatch(/processing|completed/);

        const intentId = await getConnectIntentIdForOrder(parentOrderId);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);
        const transfers = await stripeConnectApi.transfersForChargeToVendor(chargeId, vendorAccount);
        expect(transfers, `the vendor account ${vendorAccount} should receive exactly one transfer from the initial charge`).toHaveLength(1);

        log.success(`Initial subscription order ${parentOrderId} paid the vendor once from charge ${chargeId}`);
    });

    test('SCSUB-02: a renewal charges once and pays the vendor once', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no subscription to renew');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');
        test.skip(!parentOrderId, 'no initial subscription order was created');

        const renewal = await forceRenewal({ orderId: parentOrderId });
        expect(renewal.gateway, 'the renewal is billed through the Stripe Connect gateway').toBe('dokan-stripe-connect');
        expect(renewal.renewal_order, 'a renewal order was created').toBeTruthy();

        await expect
            .poll(async () => getOrderStatus(renewal.renewal_order), {
                message: 'the renewal order should settle to a paid status',
                timeout: 90_000,
            })
            .toMatch(/processing|completed/);

        const renewalIntent = await getConnectIntentIdForOrder(renewal.renewal_order);
        expect(renewalIntent, 'the renewal order carries its own PaymentIntent').toMatch(/^pi_/);
        const renewalCharge = await stripeConnectApi.getLatestChargeId(renewalIntent);

        const transfers = await stripeConnectApi.transfersForChargeToVendor(renewalCharge, vendorAccount);
        expect(transfers, `the vendor should be paid exactly once for the renewal (charge ${renewalCharge})`).toHaveLength(1);

        // The renewal charge is a different charge from the initial one. If they were the same the
        // transfer count above would be satisfied by the first order's payout and prove nothing.
        const initialIntent = await getConnectIntentIdForOrder(parentOrderId);
        const initialCharge = await stripeConnectApi.getLatestChargeId(initialIntent);
        expect(renewalCharge, 'the renewal must create its own charge, not reuse the first one').not.toBe(initialCharge);

        log.success(`Renewal order ${renewal.renewal_order} charged ${renewalCharge} and paid the vendor once`);
    });

    // SCSUB-06 — the ledger half of the same renewal. This is the fix in 6b3f2999a.
    test('SCSUB-06: a renewal books the vendor payout so it cannot be withdrawn twice', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no subscription to renew');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — no transfer would be made to book');
        test.skip(!parentOrderId, 'no initial subscription order was created');

        const balanceBefore = await getVendorBalance(payloads.vendorAuth as Record<string, string>);
        const withdrawsBefore = await approvedWithdraws();

        const renewal = await forceRenewal({ orderId: parentOrderId });
        await expect
            .poll(async () => getOrderStatus(renewal.renewal_order), {
                message: 'the renewal order should settle before its ledger effects are judged',
                timeout: 90_000,
            })
            .toMatch(/processing|completed/);

        // The vendor is paid on the SUB-order, so that is the id the ledger row references.
        const subOrders = await getSubOrderIds(renewal.renewal_order);
        const paidOrderId: number = subOrders[0] ?? Number(renewal.renewal_order);
        const earning = await dokanEarning(paidOrderId);
        expect(earning, 'the renewal should credit the vendor a positive earning').toBeGreaterThan(0);

        // A transfer really was made, so a booking is genuinely owed. Without this the case could
        // pass on a renewal that paid nobody.
        const renewalIntent = await getConnectIntentIdForOrder(renewal.renewal_order);
        const renewalCharge = await stripeConnectApi.getLatestChargeId(renewalIntent);
        expect(
            await stripeConnectApi.transfersForChargeToVendor(renewalCharge, vendorAccount),
            'the renewal paid the vendor, so the payout must be booked',
        ).toHaveLength(1);

        const withdrawsAfter = await approvedWithdraws();
        const newWithdraws = withdrawsAfter.filter(w => !withdrawsBefore.some(b => b.id === w.id));
        expect(newWithdraws, 'the renewal payout must be recorded as exactly one approved auto-withdraw').toHaveLength(1);
        expect(Number(newWithdraws[0]?.amount ?? 0), "the booked withdraw must equal the vendor's renewal earning").toBeCloseTo(earning, 2);
        // The note carries the order id, so this pins the record to THIS renewal. Without it any
        // unrelated auto-withdraw appearing in the same window would satisfy the count above.
        expect(
            String(newWithdraws[0]?.note ?? ''),
            `the booked withdraw should reference the renewal sub-order ${paidOrderId} (note: ${newWithdraws[0]?.note})`,
        ).toContain(String(paidOrderId));

        // The money already left the platform, so it must not still be sitting in the vendor's
        // withdrawable balance. Before the fix this grew by the renewal earning every cycle.
        const balanceAfter = await getVendorBalance(payloads.vendorAuth as Record<string, string>);
        expect(
            balanceAfter,
            `the renewal earning was transferred, so the withdrawable balance must not grow by it (before ${balanceBefore}, after ${balanceAfter}, earning ${earning})`,
        ).toBeLessThan(balanceBefore + earning);

        log.success(`Renewal ${renewal.renewal_order} booked one withdraw of ${newWithdraws[0]?.amount} against earning ${earning}`);
    });
});

/**
 * SCTOK-02 — a free-trial subscription costs nothing today, so the checkout has to collect a card
 * through a SetupIntent instead of a PaymentIntent.
 *
 * `6b3f2999a` added the backend half of that: `IntentController` now returns early for a SetupIntent
 * so a zero-total order stops throwing `dokan_charge_id_not_found` out of `do_action()`.
 *
 * The frontend half is missing. Measured on 2026-08-27 against dokan-pro `6b3f2999a`: on a
 * zero-total cart the classic checkout enqueues no Stripe assets at all, so no card field is drawn
 * and the shopper cannot subscribe. `StripeCheckout::maybe_enqueue_pe_classic()` returns early when
 * `cart_total_minor <= 0`, and only order-pay, change-payment-method and add-payment-method are
 * exempted from that guard. Filed under getdokan/plugin-internal-tasks#2293.
 *
 * The non-trial control below is what makes the failing case trustworthy: it proves the fixture,
 * the vendor connection and the gateway all work, so the trial case can only be failing for the
 * reason claimed.
 */
test.describe.serial('Stripe Connect — zero-total subscription checkout @pro', () => {
    test.describe.configure({ timeout: 420_000 });

    let trialProductId: string;
    let controlProductId: string;

    /** Load the classic checkout for one product and report what the payment box actually contains. */
    async function inspectCheckout(browser: Browser, productId: string) {
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await page.locator(stripe.checkout.classicRadio).waitFor({ state: 'attached', timeout: 30_000 }).catch(() => undefined);
            await page.waitForTimeout(6_000); // the element mounts asynchronously after the gateway renders
            return await page.evaluate(() => {
                const mount = document.querySelector('#dokan-stripe-connect-payment-element');
                return {
                    total: Number(
                        (document.querySelector('.order-total .amount')?.textContent ?? '0').replace(/[^0-9.,-]/g, '').replace(',', '.'),
                    ),
                    gatewayOffered: !!document.querySelector('input[name="payment_method"][value="dokan-stripe-connect"]'),
                    cardFields: document.querySelectorAll('iframe[name^="__privateStripeFrame"]').length,
                    mountChildren: mount ? mount.children.length : -1,
                    stripeAssets: Array.from(document.querySelectorAll('script[src]'))
                        .map(el => (el as HTMLScriptElement).src)
                        .filter(src => /stripe/i.test(src)).length,
                };
            });
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured({ saved_cards: 'yes' });
        await ensureClassicCheckoutPage();
        await ensureCustomerAddress();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);

        const base = payloads.createSimpleSubscriptionProduct();
        const api = new ApiUtils(await request.newContext());
        const [, trialId] = await api.createProduct(
            {
                ...base,
                name: 'Stripe Connect Free Trial Subscription',
                meta_data: [
                    ...base.meta_data,
                    { key: '_subscription_trial_length', value: '7' },
                    { key: '_subscription_trial_period', value: 'day' },
                ],
            },
            payloads.vendorAuth,
        );
        const [, controlId] = await api.createProduct(
            { ...payloads.createSimpleSubscriptionProduct(), name: 'Stripe Connect Paid Subscription Control' },
            payloads.vendorAuth,
        );
        trialProductId = trialId;
        controlProductId = controlId;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const id of [trialProductId, controlProductId]) {
                if (id) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`).catch(() => undefined);
                }
            }
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    // The control. If this ever fails, the case below proves nothing and must not be read as a defect.
    test('SCTOK-02 (control): a paid subscription product renders a card field', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const seen = await inspectCheckout(browser, controlProductId);
        expect(seen.total, 'the control cart should cost something today').toBeGreaterThan(0);
        expect(seen.gatewayOffered, 'the control checkout should offer Stripe Connect').toBe(true);
        expect(seen.cardFields, `the control checkout should draw a card field (saw ${JSON.stringify(seen)})`).toBeGreaterThan(0);
        log.success(`Control: total ${seen.total}, ${seen.cardFields} card field(s), ${seen.stripeAssets} Stripe assets`);
    });

    test('SCTOK-02: a free-trial cart must still collect a card through a SetupIntent', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const seen = await inspectCheckout(browser, trialProductId);

        // Positive controls first, so a broken fixture cannot masquerade as the defect.
        expect(seen.total, 'a free-trial cart costs nothing up front').toBe(0);
        expect(seen.gatewayOffered, 'Stripe Connect is still offered on a zero-total subscription cart').toBe(true);

        log.info(`SCTOK-02 zero-total checkout: ${JSON.stringify(seen)}`);

        /*
         * CONFIRMED DEFECT. `test.fail()` is imperative and one line before the failing assertion,
         * so the two controls above still report honestly.
         */
        test.fail();
        expect(
            seen.cardFields,
            `a shopper must be able to enter a card for a free-trial subscription (saw ${JSON.stringify(seen)})`,
        ).toBeGreaterThan(0);
    });
});

/**
 * File-level teardown: hand the shared customer back as a customer.
 *
 * Placed at file scope rather than inside either describe so it runs whichever of them executed.
 * See restoreCustomerRole for why this matters — WooCommerce Subscriptions replaces the `customer`
 * role with `subscriber` on purchase, and the next spec in the shard inherits that.
 */
test.afterAll(async () => {
    if (!hasCredentials) {
        return;
    }
    await restoreCustomerRole(CUSTOMER_ID);
});
