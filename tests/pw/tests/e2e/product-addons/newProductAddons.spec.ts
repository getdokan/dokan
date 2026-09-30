import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductAddonsPage } from './newProductAddonsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Product Addons" global list (Pro module
// product_addon) at /dashboard/new/#/settings/product-addon. Ports the legacy
// "vendor can view product addons menu page" + "vendor can remove global product
// addon" (tests/e2e/product-addons, whose page object is a no-op stub) to the real
// React DataViews list. The create / edit / import / export / field-remove flows
// are a LEGACY full-page form (settingsUrl?add=1 / ?edit=) → scoped OUT (those
// legacy vendor cases STAY). Admin enable/disable-module cases STAY (D3).
//
// A global vendor addon is a WC Product-Add-ons group whose post_author is the
// vendor: seed createProductAddon(admin) then reassign post_author to VENDOR_ID
// via dbUtils.updateCell so it surfaces on the vendor's REST list. Behavioral
// oracle for delete: the row disappears AND the vendor REST list no longer returns
// the id. Shared DB may hold other addons, so assert on the SEEDED addon name (§7).
// Requires the WooCommerce Product Add-ons plugin active (else seeding 404s).
// ============================================

const { VENDOR_ID } = process.env;
const VENDOR_ADDONS = `${SERVER_URL}/dokan/v1/vendor/product-addons`;

let apiUtils: ApiUtils;
let categoryId: string;
let categoryName: string;
const seededIds: string[] = [];

/** Seed a global addon owned by the vendor (createProductAddon + reassign post_author). */
async function seedVendorAddon(): Promise<{ id: string; name: string }> {
    const [, id, name] = await apiUtils.createProductAddon({ ...payloads.createGlobalProductAddons(), restrict_to_categories: [categoryId] }, payloads.adminAuth);
    await dbUtils.updateCell(id, VENDOR_ID);
    seededIds.push(id);
    return { id, name };
}

/** Ids currently returned by the vendor's product-addons REST list. */
async function vendorAddonIds(): Promise<string[]> {
    const [, body] = await apiUtils.get(VENDOR_ADDONS, { headers: payloads.vendorAuth }, false);
    const arr = Array.isArray(body) ? body : (body?.data ?? []);
    return arr.map((a: { id?: number | string }) => String(a.id));
}

test.describe('Product Addons (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Product-Addons route + REST only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.productAddon, payloads.adminAuth);
        const [, catId, catName] = await apiUtils.createCategory(payloads.createCategoryRandom(), payloads.adminAuth);
        categoryId = catId;
        categoryName = catName;
    });

    test.afterAll(async () => {
        for (const id of seededIds) await apiUtils.deleteProductAddon(id, payloads.adminAuth).catch(() => undefined);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let addons: NewProductAddonsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            addons = new NewProductAddonsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the global product-addons list with a seeded addon (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const addon = await seedVendorAddon();
            await addons.goto();
            expect(page.url(), 'on the /settings/product-addon route').toMatch(/#\/settings\/product-addon/);
            await expect(addons.rowsWithText(addon.name).first(), 'the seeded addon row is listed').toBeVisible({ timeout: 15000 });
            expect(await addons.hasColumn(/name/i), 'Name column').toBe(true);
            expect(await addons.hasColumn(/priority/i), 'Priority column').toBe(true);
            expect(await addons.hasColumn(/categor/i), 'Product Categories column').toBe(true);
            expect(await addons.hasColumn(/fields/i), 'Number of Fields column').toBe(true);
            expect(await addons.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the seeded addon row shows its restricted category (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const addon = await seedVendorAddon();
            await addons.goto();
            const row = addons.rowsWithText(addon.name).first();
            await expect(row, 'seeded addon row visible').toBeVisible({ timeout: 15000 });
            await expect(row, 'the Product Categories cell shows the seeded category').toContainText(categoryName, { timeout: 10000 });
        });

        test('vendor can search global product addons by name (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const a1 = await seedVendorAddon();
            const a2 = await seedVendorAddon();
            await addons.goto();
            await addons.search(a1.name);
            await expect(addons.rowsWithText(a1.name).first(), 'the matching addon remains').toBeVisible({ timeout: 15000 });
            await expect(addons.rowsWithText(a2.name), 'the other addon is filtered out').toHaveCount(0, { timeout: 10000 });
            await addons.clearSearch();
            await expect(addons.rowsWithText(a2.name).first(), 'the other addon returns after clearing').toBeVisible({ timeout: 15000 });
        });

        test('vendor can delete a global product addon from the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const addon = await seedVendorAddon();
            await addons.goto();
            await addons.search(addon.name);
            await expect(addons.rowsWithText(addon.name).first(), 'addon present before delete').toBeVisible({ timeout: 15000 });
            await addons.deleteAddon(addon.name);
            // UI oracle: the row is gone.
            await expect(addons.rowsWithText(addon.name), 'addon row removed from the list').toHaveCount(0, { timeout: 15000 });
            // REST oracle: the vendor list no longer returns the id.
            expect(await vendorAddonIds(), 'the addon id is gone from the vendor REST list').not.toContain(addon.id);
        });

        test('the Create New Addon link points at the addon form (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await seedVendorAddon();
            await addons.goto();
            const href = await addons.createNewAddonHref();
            expect(href, 'Create New Addon links to the settings/product-addon form (legacy)').toMatch(/settings\/product-addon/);
            expect(href, 'the link opens the add form').toMatch(/add=1|[?&]add/);
        });

        test('HashRouter survives a reload on /settings/product-addon (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await addons.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await addons.waitForSettle();
            expect(page.url(), 'still on /settings/product-addon after reload').toMatch(/#\/settings\/product-addon/);
            expect(await addons.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
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

        test('a logged-in customer cannot mount the vendor Product Addons route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const addons = new NewProductAddonsPage(page);
            await page.goto(addons.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
