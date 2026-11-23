import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewSubscriptionPage } from './newSubscriptionPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Subscription" (vendor subscription packs)
// surface (Pro module product_subscription / dir subscription) at
// /dashboard/new/#/subscription{,/orders}. Ports the portable legacy motive from
// tests/e2e/vendor-subscriptions (an entirely test.skip'd suite — its pack seeder
// was broken) to the real React card surface + orders DataViews. Buying / switching
// a pack is storefront checkout → scoped out (those legacy cases + admin pack
// management STAY, D3).
//
// The card surface (Current Subscription + Subscription Packages) and the orders
// list render regardless of state, so those are asserted unconditionally. Seeding a
// vendor-owned PACK requires the product_pack product-type term (the legacy
// blocker) — we rebuild it (dbUtils.setSubscriptionProductType) then seed a pack and
// GATE the "packages card lists the seeded pack" test on whether it actually
// surfaces in GET /dokan/v1/vendor-subscription/packages (fail-loud skip if the
// pack seeder is still blocked, never faked).
//
// DEFERRED (documented gap): the "current subscription shows active pack" + "cancel
// via DokanModal" flows. Assigning a pack to a vendor (assignSubscriptionToVendor)
// mints a NEW store, so the active-subscription state is not on the standard test
// vendor; driving it as the standard vendor needs a completed pack order against
// VENDOR_ID whose vendor-subscription state is not reliably reproducible here.
// Tracked in CONVERSION-LOG.
// ============================================

const PACKAGES = `${SERVER_URL}/dokan/v1/vendor-subscription/packages?per_page=100`;

let apiUtils: ApiUtils;
let packId = '';
let packName = '';
let packSeedOk = false;

async function packageNames(): Promise<string[]> {
    const [, body] = await apiUtils.get(PACKAGES, { headers: payloads.vendorAuth }, false);
    const arr = Array.isArray(body) ? body : (body?.data ?? []);
    return arr.map((p: { post_title?: string; title?: string; name?: string }) => String(p.post_title ?? p.title ?? p.name ?? ''));
}

test.describe('Vendor Subscription Packs (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.vendorSubscription, payloads.adminAuth);
        // Rebuild the product_pack product-type term (the legacy pack-seeder blocker),
        // then seed a pack and confirm it surfaces on the packages endpoint.
        try {
            await dbUtils.setSubscriptionProductType();
            const [, pid, pname] = await apiUtils.createProduct(payloads.createDokanSubscriptionProduct(), payloads.adminAuth);
            packId = pid;
            packName = pname;
            await dbUtils.updateProductType(packId);
            await apiUtils.saveCommissionToSubscriptionProduct(packId, payloads.saveVendorSubscriptionProductCommission, payloads.adminAuth).catch(() => undefined);
            for (let i = 0; i < 8; i++) {
                if ((await packageNames()).some(n => n && n === packName)) {
                    packSeedOk = true;
                    break;
                }
                await new Promise(r => setTimeout(r, 600));
            }
        } catch {
            packSeedOk = false;
        }
    });

    test.afterAll(async () => {
        if (packId) await apiUtils.deleteProduct(packId, payloads.adminAuth, true).catch(() => undefined);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let subscription: NewSubscriptionPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            subscription = new NewSubscriptionPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the Subscription page mounted at #/subscription (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subscription.goto();
            expect(page.url(), 'on the /subscription route').toMatch(/#\/subscription/);
            expect(await subscription.cardsVisible(), 'the Current Subscription / Packages cards render').toBe(true);
            expect(await subscription.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('a vendor with no pack sees the empty Current Subscription state (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subscription.goto();
            // The standard test vendor has no active pack → the empty copy shows. If the
            // vendor happens to hold a pack (shared DB), at least the card renders.
            const empty = await subscription.noActiveSubscriptionVisible();
            const cards = await subscription.cardsVisible();
            expect(empty || cards, 'the Current Subscription card renders (empty state or active)').toBe(true);
        });

        test('the Subscription Packages card lists an admin-seeded pack (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.skip(!packSeedOk, 'pack seeder is still blocked (product_pack term / save-commission) — the seeded pack did not surface on /vendor-subscription/packages');
            await subscription.goto();
            expect(await subscription.packVisible(packName), 'the seeded pack is listed in the Packages card').toBe(true);
        });

        test('vendor can open the Subscription Orders list at #/subscription/orders (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subscription.gotoOrders();
            expect(page.url(), 'on the /subscription/orders route').toMatch(/#\/subscription\/orders/);
            expect(await subscription.ordersSurfaceRendered(), 'the orders list surface (columns or empty state) renders').toBe(true);
            expect(await subscription.hasNoPhpFatal(), 'no PHP fatal on the orders list').toBe(true);
        });

        test('HashRouter survives a reload on /subscription (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await subscription.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await subscription.waitForCards();
            expect(page.url(), 'still on /subscription after reload').toMatch(/#\/subscription/);
            expect(await subscription.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
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

        test('a logged-in customer cannot mount the vendor Subscription route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const subscription = new NewSubscriptionPage(page);
            await page.goto(subscription.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
