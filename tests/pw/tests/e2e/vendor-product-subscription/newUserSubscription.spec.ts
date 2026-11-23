import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewUserSubscriptionPage } from './newUserSubscriptionPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "User Subscription" list (Pro module vsp /
// vendor-subscription-product) at /dashboard/new/#/user-subscription. Ports the
// legacy "vendor can view user subscriptions menu page" + the (previously skipped,
// unseedable) filter/view cases from tests/e2e/vendor-product-subscription (a no-op
// stub) to the real React DataViews list. The customer my-account subscription
// flows + admin cases STAY (D3).
//
// A subscription RECORD has no dokan create-REST — it is seeded via WooCommerce
// core POST /wc/v3/subscriptions (admin) with a _dokan_vendor_id meta so the
// vendor scoping picks it up. That seeder is verified live in beforeAll; if it does
// not surface on the vendor list, the DATA-dependent tests are skipped with a
// fail-loud reason (never faked), while the route/mount/reload/cross-role smokes
// still run. Behavioral oracle: the seeded subscription's "#<id>" row appears and
// its detail route opens. Shared DB is polluted, so assert on the SEEDED id (§7).
// ============================================

const { VENDOR_ID, CUSTOMER_ID } = process.env;
const WC_SUBSCRIPTIONS = `${SERVER_URL}/wc/v3/subscriptions`;
const PRODUCT_SUBSCRIPTIONS = `${SERVER_URL}/dokan/v1/product-subscriptions`;

let apiUtils: ApiUtils;
let subProductId: string;
let seededSubId = '';
let seedOk = false;

/** Ids currently on the vendor's product-subscriptions list. */
async function vendorSubIds(): Promise<string[]> {
    const [, body] = await apiUtils.get(`${PRODUCT_SUBSCRIPTIONS}?per_page=100`, { headers: payloads.vendorAuth }, false);
    const arr = Array.isArray(body) ? body : (body?.data ?? []);
    return arr.map((s: { id?: number | string }) => String(s.id));
}

test.describe('User Subscription (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.productSubscription, payloads.adminAuth);
        // 1) A subscription product owned by the vendor.
        const [, pid] = await apiUtils.createProduct(payloads.createSimpleSubscriptionProduct(), payloads.vendorAuth);
        subProductId = pid;
        // 2) A subscription RECORD via WC core REST, tagged with the vendor via meta.
        const [resp, body] = await apiUtils.post(WC_SUBSCRIPTIONS, {
            data: {
                customer_id: Number(CUSTOMER_ID),
                status: 'active',
                billing_period: 'month',
                billing_interval: 1,
                line_items: [{ product_id: Number(subProductId), quantity: 1 }],
                meta_data: [{ key: '_dokan_vendor_id', value: VENDOR_ID }],
            },
            headers: payloads.adminAuth,
        });
        if (resp.ok() && body?.id) {
            seededSubId = String(body.id);
            // 3) Confirm the vendor scoping surfaces it (poll — WC write may lag).
            for (let i = 0; i < 10; i++) {
                if ((await vendorSubIds()).includes(seededSubId)) {
                    seedOk = true;
                    break;
                }
                await new Promise(r => setTimeout(r, 600));
            }
        }
    });

    test.afterAll(async () => {
        if (seededSubId) await apiUtils.delete(`${WC_SUBSCRIPTIONS}/${seededSubId}?force=true`, { headers: payloads.adminAuth }).catch(() => undefined);
        if (subProductId) await apiUtils.deleteProduct(subProductId, payloads.adminAuth, true).catch(() => undefined);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let subs: NewUserSubscriptionPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            subs = new NewUserSubscriptionPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the User Subscription list mounted at #/user-subscription (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subs.goto();
            expect(page.url(), 'on the /user-subscription route').toMatch(/#\/user-subscription/);
            // Either data columns render OR the empty state — both are valid renders.
            const rendered = (await subs.columnHeaders.count()) > 0 || (await subs.emptyStateVisible());
            expect(rendered, 'the list surface (columns or empty state) renders').toBe(true);
            expect(await subs.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees a seeded subscription row with its columns (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.skip(!seedOk, 'WC subscription seed did not surface on the vendor list (subscription records are not reliably REST-seedable here)');
            await subs.goto();
            await expect(subs.rowsWithText(`#${seededSubId}`).first(), 'the seeded subscription row is listed').toBeVisible({ timeout: 15000 });
            expect(await subs.hasColumn(/subscription/i), 'Subscription column').toBe(true);
            expect(await subs.hasColumn(/status/i), 'Status column').toBe(true);
            expect(await subs.hasColumn(/total/i), 'Total column').toBe(true);
        });

        test('the seeded subscription Status column reflects its active state (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.skip(!seedOk, 'WC subscription seed did not surface on the vendor list');
            await subs.goto();
            const row = subs.rowsWithText(`#${seededSubId}`).first();
            await expect(row, 'seeded subscription row visible').toBeVisible({ timeout: 15000 });
            await expect(row, 'the row shows an Active status badge').toContainText(/active/i, { timeout: 10000 });
        });

        test('View opens the subscription detail route (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.skip(!seedOk, 'WC subscription seed did not surface on the vendor list');
            await subs.goto();
            await subs.openDetail(`#${seededSubId}`);
            expect(page.url(), 'navigated to the /user-subscription/:id detail route').toMatch(/#\/user-subscription\/\d+/);
            expect(await subs.hasNoPhpFatal(), 'no PHP fatal on the detail route').toBe(true);
        });

        test('HashRouter survives a reload on /user-subscription (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subs.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await subs.waitForSettle();
            expect(page.url(), 'still on /user-subscription after reload').toMatch(/#\/user-subscription/);
            expect(await subs.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        let ctx: BrowserContext;
        let page: Page;

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a logged-in customer cannot mount the vendor User Subscription route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const subs = new NewUserSubscriptionPage(page);
            await page.goto(subs.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
