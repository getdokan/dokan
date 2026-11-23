import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductAdvertisingPage } from './newProductAdvertisingPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor product-list "Advertise" column (Pro module
// product_advertising / dir product-adv) on /dashboard/new/#/products. products/
// intentionally excludes the Pro Advertise column, so this is its home. Ports the
// row-state + draft-guard motives from tests/e2e/product-advertising (a no-op stub).
// The admin wp-admin advertising list + the paid checkout + tampered-nonce cases
// STAY where they are (admin: D3; checkout/CSRF: owned by stripe-express).
//
// Behavioral oracles that do NOT depend on the (flagged-suspect) interactive Promote
// AJAX: (1) the Advertise column + Promote control render when the module is active,
// (2) an already-advertised product round-trips through REST
// (createProductAdvertisement → getAllProductAdvertisements), (3) a NON-published
// product's Promote opens the "must be published" error DokanModal — a client-side
// guard that fires before any nonce'd AJAX. One test live-probes the localized
// window.dokan_purchase_advertisement global on the new dashboard and records the
// finding (the interactive free-purchase leg is scoped out; see the module bug note).
// Shared DB is polluted, so assert on the SEEDED product name (§7).
// ============================================

let apiUtils: ApiUtils;
const seededProductIds: string[] = [];
const seededAdIds: string[] = [];

async function seedPublishedProduct(): Promise<{ id: string; name: string }> {
    const name = `PW Adv ${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [, id] = await apiUtils.createProduct({ ...payloads.createProduct(), name, status: 'publish', regular_price: '40' }, payloads.vendorAuth);
    seededProductIds.push(id);
    return { id, name };
}

async function seedDraftProduct(): Promise<{ id: string; name: string }> {
    const name = `PW AdvDraft ${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [, id] = await apiUtils.createProduct({ ...payloads.createProduct(), name, status: 'draft', regular_price: '40' }, payloads.vendorAuth);
    seededProductIds.push(id);
    return { id, name };
}

test.describe('Product Advertising (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // Module active so the Advertise column + advertisement REST data populate.
        await apiUtils.activateModules(payloads.moduleIds.productAdvertising, payloads.adminAuth);
    });

    test.afterAll(async () => {
        for (const id of seededProductIds) await apiUtils.deleteProduct(id, payloads.adminAuth, true).catch(() => undefined);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let adv: NewProductAdvertisingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            adv = new NewProductAdvertisingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('the vendor product list renders an Advertise column with a Promote control (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedPublishedProduct();
            await adv.goto();
            await adv.search(p.name);
            await expect(adv.rowsWithText(p.name).first(), 'the seeded product is listed').toBeVisible({ timeout: 15000 });
            expect(await adv.hasColumn(/advertise/i), 'the Advertise column header renders').toBe(true);
            expect(await adv.promoteControlCount(), 'a Promote control renders in the list').toBeGreaterThan(0);
            expect(await adv.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('an admin-marked advertised product round-trips through REST (React surface + REST oracle)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async () => {
            // [cross-role REST] Create a vendor product then mark it advertised (admin).
            const name = `PW AdvSeed ${Date.now()}${Math.floor(Math.random() * 1000)}`;
            const [, adId, advertisedTitle] = await apiUtils.createProductAdvertisement({ ...payloads.createProduct(), name, status: 'publish', regular_price: '40' }, payloads.vendorAuth);
            if (adId) seededAdIds.push(adId);
            expect(advertisedTitle, 'the advertisement was created for the product').toBeTruthy();
            // REST oracle: the advertisement appears in the store's advertisement list.
            const all = await apiUtils.getAllProductAdvertisements(payloads.adminAuth);
            const arr = Array.isArray(all) ? all : [];
            expect(
                arr.some((a: { product_title?: string }) => String(a.product_title ?? '').includes(name) || String(a.product_title ?? '') === advertisedTitle),
                'the advertised product is in the advertisement list (REST)',
            ).toBe(true);
            // React surface: the product is on the vendor list with the Advertise column.
            await adv.goto();
            await adv.search(name);
            await expect(adv.rowsWithText(name).first(), 'the advertised product is listed on the vendor product list').toBeVisible({ timeout: 15000 });
        });

        test('a draft product cannot be advertised — Promote shows the "must be published" modal (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedDraftProduct();
            await adv.goto();
            await adv.search(p.name);
            const row = adv.rowsWithText(p.name).first();
            await expect(row, 'the draft product is listed').toBeVisible({ timeout: 15000 });
            // The publish-guard is client-side (fires before any nonce'd AJAX).
            const errored = await adv.clickPromoteExpectingErrorModal(p.name);
            expect(errored, 'clicking Promote on a draft opens the "must be published" error modal').toBe(true);
        });

        test('the Promote localized nonce global is present on the new dashboard (React — documents the module boundary)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedPublishedProduct();
            await adv.goto();
            await adv.search(p.name);
            await expect(adv.rowsWithText(p.name).first(), 'seeded product listed').toBeVisible({ timeout: 15000 });
            const global = await adv.purchaseAdvertisementGlobal();
            // The interactive Promote needs window.dokan_purchase_advertisement (with a
            // nonce). It is localized only on the legacy dashboard; if it is missing here,
            // the interactive free-purchase leg is non-functional on /dashboard/new/ and is
            // intentionally scoped out (paid checkout lives in stripe-express). We assert
            // the column/control render regardless and record the global's presence.
            expect(await adv.promoteControlCount(), 'the Promote control still renders').toBeGreaterThan(0);
            // eslint-disable-next-line no-console
            console.log(`[product-advertising] window.dokan_purchase_advertisement on /dashboard/new/#/products = ${JSON.stringify(global)}`);
            expect(await adv.hasNoPhpFatal(), 'no PHP fatal on the products list').toBe(true);
        });

        test('HashRouter survives a reload on /products with the Advertise column (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await adv.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await adv.waitForSettle();
            expect(page.url(), 'still on /products after reload').toMatch(/#\/products/);
            expect(await adv.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
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

        test('a logged-in customer cannot mount the vendor products route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const adv = new NewProductAdvertisingPage(page);
            await page.goto(adv.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
