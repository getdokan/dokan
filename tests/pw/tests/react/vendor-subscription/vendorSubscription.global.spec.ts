//COVERAGE_TAG: GET /dokan/v1/vendor-subscription/vendor/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/vendor-subscription/update/(?P<id>[\d]+)/
//COVERAGE_TAG: GET /dokan/v1/vendor-subscription/packages

import { test, expect, withUserPage } from '../_shared/fixtures';
import { createVendor, createProductAs, type FreshVendor } from '../_shared/seed';
import { moneyDigits } from '../_shared/dataViewsTable';
import { setDokanSetting } from '../_shared/wp';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { createPack, deletePack, assignPack, purchasePack, type Pack } from './subscriptionSeed';
import { VendorSubscriptionPage } from './vendorSubscriptionPage';

// Risk: P0 Vendor subscription. Failure-mode ids (#Sn) refer to tests/pw/baseline/failure-modes/vendor-subscription.md.
// Since 5.2.0 the whole feature (REST, React screens, limits) only loads with enable_pricing on, which also stops every
// vendor without a pack from publishing. So this file runs in react_global, and each test uses its own fresh vendor.

const SUBSCRIPTION = (vendorId: string) => `${SERVER_URL}/dokan/v1/vendor-subscription/vendor/${vendorId}`;
const PACKAGES = `${SERVER_URL}/dokan/v1/vendor-subscription/packages`;

let previous: string;
let pack: Pack;

test.beforeAll(() => {
    previous = setDokanSetting('dokan_product_subscription', 'enable_pricing', 'on');
    pack = createPack({ products: 1, validityDays: 30, price: '19.50' });
});

test.afterAll(() => {
    setDokanSetting('dokan_product_subscription', 'enable_pricing', previous || 'off');
    if (pack) deletePack(pack);
});

test.describe('Vendor subscription limits (REST)', () => {
    test('#S1 the product over the pack limit is not published', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const vendor = await createVendor(api);
        await assignPack(api, vendor.id, pack);

        expect((await createProductAs(api, vendor.auth)).status).toBe('publish');
        const overLimit = await createProductAs(api, vendor.auth);
        expect(overLimit.status ?? overLimit.code, 'second product on a 1-product pack').not.toBe('publish');
    });

    test('#S2 a vendor without a pack cannot publish', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const vendor = await createVendor(api);
        const product = await createProductAs(api, vendor.auth);
        expect(product.status ?? product.code).not.toBe('publish');
    });

    test('#S7 a vendor only ever reads their own subscription', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const [mine, other] = await Promise.all([createVendor(api), createVendor(api)]);
        await assignPack(api, other.id, pack);
        // The id in the path is ignored for vendors: the answer is about the caller, or an error, never about `other`.
        const [, body] = await api.get(SUBSCRIPTION(other.id), { headers: mine.auth }, false);
        expect(JSON.stringify(body), JSON.stringify(body)).not.toContain(pack.title);
        if (body.id !== undefined) expect(String(body.id)).toBe(mine.id);
    });

    test('#S8 customers are refused', { tag: ['@pro', '@customer', '@p0'] }, async ({ api }) => {
        const [response] = await api.get(PACKAGES, { headers: payloads.customerAuth }, false);
        expect(response.status()).toBe(403);
    });
});

test.describe('Vendor subscription without a pack (React)', () => {
    test('#S11 a vendor without a pack is told so and offered the pack to buy', { tag: ['@pro', '@vendor', '@p1'] }, async ({ api, browser }) => {
        const vendor = await createVendor(api);
        await withUserPage(browser, vendor, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.goto();
            await expect(screen.current).toContainText("You don't have an active subscription.");
            await expect(screen.packCard(pack.title).getByText('Buy Now', { exact: true })).toBeVisible();
        });
    });

    test('#S8 a customer cannot open the vendor Subscription screen', { tag: ['@pro', '@customer', '@p1'] }, async ({ customerPage }) => {
        await customerPage.goto('dashboard/new/#/subscription');
        await expect(customerPage.locator('#dokan-vendor-dashboard-root')).toHaveCount(0);
        await expect(customerPage.getByText('Current Subscription')).toHaveCount(0);
    });
});

test.describe('Vendor subscription (React)', () => {
    let vendor: FreshVendor;

    test.beforeEach(async ({ api }) => {
        vendor = await createVendor(api);
        await assignPack(api, vendor.id, pack);
    });

    test('#S3 current subscription shows the assigned pack, its product limit and expiry', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api, browser }) => {
        const [, subscription] = await api.get(SUBSCRIPTION(vendor.id), { headers: payloads.adminAuth });
        await withUserPage(browser, vendor, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.goto();
            await expect(screen.current).toContainText(pack.title);
            await expect(screen.current).toContainText(`You can add ${pack.products} product`);
            await expect(screen.current).toContainText(subscription.end_date);
        });
    });

    test('#S4 packages list the pack at its price, marked as the vendor\'s pack', { tag: ['@pro', '@vendor', '@p1'] }, async ({ browser }) => {
        await withUserPage(browser, vendor, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.goto();
            const card = screen.packCard(pack.title);
            await expect(card).toBeVisible();
            expect(moneyDigits(await card.innerText())).toContain(moneyDigits(pack.price));
            await expect(card.getByText('Your Pack', { exact: true })).toBeVisible();
        });
    });

    test('#S5 vendor cancels the subscription', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api, browser }) => {
        await withUserPage(browser, vendor, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.goto();
            expect((await screen.cancel()).status()).toBeLessThan(400);
        });
        // A cancelled non-recurring pack stays usable until its end date, flagged as cancelled.
        const [, after] = await api.get(SUBSCRIPTION(vendor.id), { headers: payloads.adminAuth });
        expect(after.has_active_cancelled_sub).toBe(true);
        expect(String(after.subscription_id)).toBe(pack.id);
    });

    test('#S6 subscription orders list the vendor\'s purchased pack with its order total', { tag: ['@pro', '@vendor', '@p1'] }, async ({ api, browser }) => {
        // Only checkout-purchased packs are listed; admin-assigned ones never are (FINDINGS.md S3).
        const buyer = await createVendor(api);
        const { orderId, total } = purchasePack(buyer.id, pack);
        await withUserPage(browser, buyer, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.gotoOrders();
            await expect(screen.orders.rows).toHaveCount(1);
            const row = screen.orders.rows.first();
            await expect(row).toContainText(orderId);
            expect(moneyDigits(await (await screen.orders.cell(row, 'Total')).innerText())).toBe(moneyDigits(total));
        });
    });

    test('#S9 the Subscription Orders deep link loads the orders', { tag: ['@pro', '@vendor', '@p1'] }, async ({ api, browser }) => {
        // Known bug (FINDINGS.md #2): the standalone route renders SubscriptionOrders without a vendorId, so its
        // fetch never runs and the list stays on skeleton rows. Remove test.fail once fixed.
        test.fail();
        const buyer = await createVendor(api);
        purchasePack(buyer.id, pack);
        await withUserPage(browser, buyer, async page => {
            const screen = new VendorSubscriptionPage(page);
            await screen.gotoOrdersRoute();
            await expect(screen.orders.rows).toHaveCount(1, { timeout: 10000 });
        });
    });

    test('#S10 the subscription page loads the vendor\'s pack without a failed request', { tag: ['@pro', '@vendor', '@p1'] }, async ({ browser }) => {
        // Known bug (FINDINGS.md #3): GET /dokan/v1/products/{pack} answers 403 for every vendor. Remove test.fail once fixed.
        test.fail();
        await withUserPage(browser, vendor, async page => {
            const packRequest = page.waitForResponse(r => r.url().includes(`/dokan/v1/products/${pack.id}`));
            await new VendorSubscriptionPage(page).goto();
            expect((await packRequest).status()).toBeLessThan(400);
        });
    });
});
