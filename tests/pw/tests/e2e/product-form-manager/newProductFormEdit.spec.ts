import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage } from './newProductFormPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor product EDIT surface.
// Surface: /dashboard/new/#/products/:productId/edit (dokan-lite/src/dashboard/
//          product-editor/App.tsx — create + edit share App).
// Ported from the legacy `products-details` spec (95 vendor cases, all driven
// through a no-op STUB page object — vacuous green). The sibling
// newProductForm*.spec.ts here cover CREATE only and assert field-stick, not
// persistence; this file drives the EDIT surface and asserts persistence via
// REST getSingleProduct + a reload. Lite feature (a few @pro fields).
// ============================================

let apiUtils: ApiUtils;
const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

/**
 * Seed a fresh simple product owned by the fixture vendor; returns its id.
 * A `regular_price` is included by default: the React editor's "Update Product"
 * button is `disabled` while the form is invalid, and a price is required — so a
 * priceless seed would leave every non-price edit unable to save.
 */
async function seedProduct(overrides: Record<string, unknown> = {}): Promise<string> {
    const [, id] = await apiUtils.createProduct({ ...payloads.createProductRequiredFields(), regular_price: '50', ...overrides }, payloads.vendorAuth);
    return id;
}

async function getProduct(id: string): Promise<Record<string, any>> {
    return (await apiUtils.getSingleProduct(id, payloads.vendorAuth)) as Record<string, any>;
}

test.describe('Vendor product editor (React) — edit persistence', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    let ctx: BrowserContext;
    let page: Page;
    let form: NewProductFormPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        form = new NewProductFormPage(page);
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    test('vendor can edit the product title on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        const newTitle = `PW edited title ${stamp()}`;
        await form.gotoEdit(id);
        await form.title.fill(newTitle);
        await form.saveEdit();
        expect(String((await getProduct(id)).name), 'title persisted (REST)').toBe(newTitle);
        // Reload re-prefills from init/fields — the new title survives.
        await form.gotoEdit(id);
        expect(await form.titleValue(), 'edited title shown after reload').toBe(newTitle);
    });

    test('vendor can set a product price on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        await form.gotoEdit(id);
        await form.fillPrice(form.price, '123');
        await form.saveEdit();
        expect(String((await getProduct(id)).regular_price), 'regular price persisted (REST)').toBe('123');
    });

    test('vendor can add a discount sale price on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct({ regular_price: '100' });
        await form.gotoEdit(id);
        await form.fillPrice(form.salePrice, '80');
        await form.saveEdit();
        const p = await getProduct(id);
        expect(String(p.sale_price), 'sale price persisted (REST)').toBe('80');
        expect(Boolean(p.on_sale), 'product is on sale (REST)').toBe(true);
    });

    test('vendor cannot set a sale price above the regular price (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct({ regular_price: '100' });
        await form.gotoEdit(id);
        await form.fillPrice(form.salePrice, '150');
        // Blocked: either the Update button is disabled or the PUT never fires.
        const putFired = page
            .waitForResponse(r => /dokan\/v[0-9]+\/products\/\d+/i.test(r.url()) && r.request().method() === 'PUT', { timeout: 4000 })
            .then(() => true)
            .catch(() => false);
        if (!(await form.saveIsDisabled())) await form.saveButton.click();
        expect(await putFired, 'no product PUT fired for an invalid sale price').toBe(false);
        expect(String((await getProduct(id)).sale_price ?? ''), 'sale price was not saved (REST)').toBe('');
    });

    test('vendor can edit the short and long descriptions on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        const shortMarker = `PW short ${stamp()}`;
        const longMarker = `PW long ${stamp()}`;
        await form.gotoEdit(id);
        await form.setShortDescription(shortMarker);
        await form.setDescription(longMarker);
        await form.saveEdit();
        const p = await getProduct(id);
        expect(String(p.short_description), 'short description persisted (REST)').toContain(shortMarker);
        expect(String(p.description), 'long description persisted (REST)').toContain(longMarker);
    });

    test('vendor can make a product virtual on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        await form.gotoEdit(id);
        await form.enableVirtual();
        await form.saveEdit();
        expect(Boolean((await getProduct(id)).virtual), 'product is virtual (REST)').toBe(true);
    });

    // BACKLOG (documented in CONVERSION-LOG): manage-stock + quantity,
    // stock-status select, and add-tags do not persist through their dynamic /
    // react-select interactions on the EDIT surface (they behave differently
    // than on create). They need live selector work (the stockQty id is
    // random, the stock-status select is hidden once manage_stock is on, and
    // the creatable tags select re-renders its input mid-type). Deferred to a
    // later batch rather than shipped flaky.

    test('vendor can set the SKU on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        const sku = `PW-SKU-${stamp()}`;
        await form.gotoEdit(id);
        await form.sku.fill(sku);
        await form.saveEdit();
        expect(String((await getProduct(id)).sku), 'SKU persisted (REST)').toBe(sku);
    });

    test('vendor can set catalog visibility to hidden on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        await form.gotoEdit(id);
        await form.selectVisibility('hidden');
        await form.saveEdit();
        expect(String((await getProduct(id)).catalog_visibility), 'catalog visibility persisted (REST)').toBe('hidden');
    });

    test('vendor can change the product category on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        // Seed a distinct category to switch to.
        const catName = `PW Cat ${stamp()}`;
        const [, newCatId] = await apiUtils.createCategory({ ...payloads.createCategory, name: catName }, payloads.adminAuth);
        const id = await seedProduct();
        await form.gotoEdit(id);
        await form.selectCategory(catName);
        await form.saveEdit();
        const catIds = ((await getProduct(id)).categories ?? []).map((c: { id: number }) => String(c.id));
        expect(catIds, 'new category persisted (REST)').toContain(String(newCatId));
    });

    test('vendor can add a feature image on the edit form (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const id = await seedProduct();
        await form.gotoEdit(id);
        await form.uploadFeatureImage(data.image.avatar);
        await form.saveEdit();
        const images = (await getProduct(id)).images ?? [];
        expect(images.length, 'a feature image was attached (REST)').toBeGreaterThanOrEqual(1);
    });
});
