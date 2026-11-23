import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductsPage } from './newProductsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Pro-only list row/bulk actions on the vendor product list DataViews at
// /dashboard/new/#/products (dokan-pro/src/features/products/actions). The Lite
// list coverage (render/columns/tabs/search/quick-view/delete/bulk-publish) lives
// in newProducts.spec.ts — this file adds the Pro-only actions it doesn't assert:
// Quick Edit (DokanModal), Duplicate (POST /dokan/v2/products/:id/duplicate), and
// the Pro menu items' presence. Behavioral oracles confirm via REST. B17 gap.
// ============================================

let apiUtils: ApiUtils;
const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const seededIds: string[] = [];

/** Seed a simple product with a unique matchable name; returns [id, name]. */
async function seedProduct(): Promise<{ id: string; name: string }> {
    const name = `PW pro ${stamp()}`;
    const [, id] = await apiUtils.createProduct({ ...payloads.createProduct(), name, regular_price: '60' }, payloads.vendorAuth);
    seededIds.push(id);
    return { id, name };
}

test.describe('Vendor products list — Pro actions (React)', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        for (const id of seededIds) await apiUtils.deleteProduct(id, payloads.vendorAuth, true).catch(() => undefined);
        await apiUtils?.dispose();
    });

    let ctx: BrowserContext;
    let page: Page;
    let products: NewProductsPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        products = new NewProductsPage(page);
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    test('vendor sees the Pro row actions (Quick Edit / Duplicate) in the 3-dot menu (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        const p = await seedProduct();
        await products.goto();
        await products.search(p.name);
        const labels = (await products.rowMenuItemLabels(p.name)).map(l => l.toLowerCase());
        expect(
            labels.some(l => l.includes('quick edit')),
            'Quick Edit is offered (Pro)',
        ).toBe(true);
        expect(
            labels.some(l => l.includes('duplicate')),
            'Duplicate is offered (Pro)',
        ).toBe(true);
    });

    test('vendor can duplicate a product from the row menu (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        const p = await seedProduct();
        await products.goto();
        await products.search(p.name);
        await products.openRowActionMenu(p.name);
        await Promise.all([page.waitForResponse(r => /dokan\/v[0-9]+\/products\/\d+\/duplicate/i.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), products.clickMenuItem('Duplicate')]);
        await page.waitForTimeout(1500);
        // REST oracle: a second product now shares the base name (the copy).
        const all = await apiUtils.getAllProducts(payloads.vendorAuth);
        const matches = (Array.isArray(all) ? all : []).filter((x: { name?: string; id?: number }) => String(x.name ?? '').includes(p.name));
        expect(matches.length, 'the product was duplicated (REST — 2 rows share the name)').toBeGreaterThanOrEqual(2);
        for (const m of matches) if (String(m.id) !== p.id) seededIds.push(String(m.id));
    });

    test('vendor can quick-edit a product price (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        const p = await seedProduct();
        await products.goto();
        await products.search(p.name);
        await products.openRowActionMenu(p.name);
        await products.clickMenuItem('Quick Edit');
        // DokanModal "Quick Edit Product" reuses the editor; the price is a cleave input.
        const modal = page
            .getByRole('dialog')
            .filter({ hasText: /Quick Edit/i })
            .first();
        await modal.waitFor({ state: 'visible', timeout: 15000 });
        const priceInput = modal.locator('#regular_price').first();
        await priceInput.waitFor({ state: 'visible', timeout: 10000 });
        await priceInput.click();
        await priceInput.evaluate((el: HTMLInputElement) => el.select());
        await page.keyboard.press('Delete');
        await priceInput.pressSequentially('88', { delay: 40 });
        await priceInput.press('Tab').catch(() => undefined);
        const update = modal.getByRole('button', { name: /^Update Product/i }).first();
        await Promise.all([page.waitForResponse(r => /dokan\/v[0-9]+\/products\/batch/i.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), update.click()]);
        await page.waitForTimeout(1000);
        // REST oracle: the price persisted.
        expect(String((await apiUtils.getSingleProduct(p.id, payloads.vendorAuth)).regular_price), 'quick-edited price persisted (REST)').toBe('88');
    });
});
