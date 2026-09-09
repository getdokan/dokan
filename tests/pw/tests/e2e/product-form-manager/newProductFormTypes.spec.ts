import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Non-simple product CREATION on the React editor at /dashboard/new/#/products/create.
// The sibling newProductForm* specs cover SIMPLE create; this adds the virtual-create
// gap (full create + persist, not just the toggle), confirming via REST after save.
//
// LIMITATION found live (B17): the React editor lists External/Affiliate and Group
// Product in the type dropdown but does NOT render their type-specific fields
// (external_url / button_text / grouped_products wrappers are absent after choosing
// the type), so external/grouped CREATE cannot be driven from this form yet. Those,
// plus variable (two-step) and subscription (module-gated) creates, are backlog.
// The React editor also requires a non-empty description before Save enables.
// ============================================

let apiUtils: ApiUtils;
const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const seededIds: string[] = [];

async function getById(id: string): Promise<Record<string, any> | undefined> {
    if (!id) return undefined;
    seededIds.push(id);
    return (await apiUtils.getSingleProduct(id, payloads.vendorAuth)) as Record<string, any>;
}

test.describe('Vendor product editor (React) — product types', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        for (const id of seededIds) await apiUtils.deleteProduct(id, payloads.vendorAuth, true).catch(() => undefined);
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

    test('vendor can create a virtual product (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const name = `PW virtual ${stamp()}`;
        await form.goto();
        await form.waitForFormReady();
        // Same driver path the passing simple-create test uses (title + price +
        // short/long description satisfy the editor's validity), then flip Virtual.
        await form.fillBasicInfo({ title: name, price: '25', shortDescription: 'PW short', description: 'PW virtual product description' });
        await form.enableVirtual();
        await form.save();
        await form.waitForSaveSuccess();
        // REST oracle: resolve the created product by its unique name.
        const id = await apiUtils.getProductId(name, payloads.vendorAuth);
        const p = await getById(String(id));
        expect(p, 'virtual product created (REST)').toBeTruthy();
        expect(Boolean(p?.virtual), 'product is virtual (REST)').toBe(true);
    });

    // ============================================
    // VIRTUAL ↔ SHIPPING
    // A virtual product is intangible: checking Virtual must hide the shipping
    // sub-form (requires-shipping, weight/dimensions, shipping class) while Tax
    // stays, and the product must persist with `_disable_shipping = yes`. The
    // linkage lives in dokan-pro's product-editor FormSchema, so these are @pro.
    // `_disable_shipping` is read from the DB — that protected `_`-meta is not
    // guaranteed in the WC REST body.
    // ============================================
    test.describe('virtual product shipping — happy paths', () => {
        test('checking Virtual hides the shipping fields and keeps the Tax fields', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.goto();
            await form.waitForFormReady();
            await form.waitForDigitalOptions();

            await expect(form.weight).toBeVisible();
            await expect(form.shippingClassField).toHaveCount(1);
            // Tax presence depends on wc_tax_enabled(); capture it so the check
            // holds whether or not taxes are enabled in the environment.
            const taxCount = await form.taxStatusField.count();

            await form.enableVirtual();

            await expect(form.weight).toHaveCount(0);
            await expect(form.shippingClassField).toHaveCount(0);
            await expect(form.taxStatusField).toHaveCount(taxCount);
            await expect(form.taxClassField).toHaveCount(taxCount);
        });

        test('unchecking Virtual restores the shipping fields', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.goto();
            await form.waitForFormReady();
            await form.waitForDigitalOptions();

            await form.enableVirtual();
            await expect(form.shippingClassField).toHaveCount(0);

            await form.setCheckbox('Virtual', false);

            await expect(form.weight).toBeVisible();
            await expect(form.shippingClassField).toHaveCount(1);
        });

        test('creating a virtual product persists it as virtual', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            await form.goto();
            await form.waitForFormReady();

            const id = await form.createVirtualProduct(newProductFormData.valid());
            expect(id, 'save returns a product id').toBeTruthy();
            await form.waitForSaveSuccess();

            const p = await getById(String(id));
            expect(Boolean(p?.virtual), 'product is virtual (REST)').toBe(true);
        });

        test('a saved virtual product reopens as virtual with shipping hidden', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            await form.goto();
            await form.waitForFormReady();

            const id = await form.createVirtualProduct(newProductFormData.valid());
            expect(id).toBeTruthy();
            await form.waitForSaveSuccess();
            seededIds.push(String(id));

            await form.gotoEdit(id as number);
            await form.waitForDigitalOptions();

            await expect(form.virtualToggle).toBeChecked();
            await expect(form.weight).toHaveCount(0);
            await expect(form.shippingClassField).toHaveCount(0);
        });

        test('vendor can create a virtual downloadable product', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            await form.goto();
            await form.waitForFormReady();

            await form.fillBasicInfo(newProductFormData.valid());
            await form.waitForDigitalOptions();
            await form.enableVirtual();
            await form.enableDownloadable();

            const id = await form.saveAndGetProductId();
            expect(id).toBeTruthy();
            await form.waitForSaveSuccess();

            const p = await getById(String(id));
            expect(Boolean(p?.virtual), 'virtual (REST)').toBe(true);
            expect(Boolean(p?.downloadable), 'downloadable (REST)').toBe(true);
        });
    });

    test.describe('virtual product shipping — edge cases', () => {
        test('entering shipping data then enabling Virtual still saves a virtual product', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            const data = newProductFormData.valid();
            await form.goto();
            await form.waitForFormReady();

            await form.fillBasicInfo(data);
            await form.waitForDigitalOptions();
            await form.fillShipping(data);
            await expect(form.weight).toHaveValue(new RegExp(data.weight));
            await form.enableVirtual();
            await expect(form.weight).toHaveCount(0);

            const id = await form.saveAndGetProductId();
            expect(id).toBeTruthy();
            await form.waitForSaveSuccess();

            const p = await getById(String(id));
            expect(Boolean(p?.virtual), 'virtual (REST)').toBe(true);
        });

        test('toggling Virtual off restores the shipping form and saves a physical product', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            const data = newProductFormData.valid();
            await form.goto();
            await form.waitForFormReady();

            await form.fillBasicInfo(data);
            await form.waitForDigitalOptions();
            await form.enableVirtual();
            await form.setCheckbox('Virtual', false);
            await expect(form.weight).toBeVisible();
            await form.fillShipping(data);

            const id = await form.saveAndGetProductId();
            expect(id).toBeTruthy();
            await form.waitForSaveSuccess();

            const p = await getById(String(id));
            expect(Boolean(p?.virtual), 'saved as physical (REST)').toBe(false);
        });

        test('Virtual is not offered for variable products', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.goto();
            await form.waitForFormReady();
            await form.waitForDigitalOptions();
            await expect(form.virtualToggle).toBeVisible();

            await form.setProductType('variable');

            await expect(form.virtualToggle).toHaveCount(0);
        });
    });

    test.describe('virtual product shipping — negative cases', () => {
        test('a virtual product saves without any shipping information', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.slow();
            await form.goto();
            await form.waitForFormReady();

            // No weight/dimensions/shipping class supplied — save must not be blocked.
            const id = await form.createVirtualProduct(newProductFormData.valid());
            expect(id, 'save not blocked by missing shipping').toBeTruthy();
            await form.waitForSaveSuccess();

            const p = await getById(String(id));
            expect(Boolean(p?.virtual), 'virtual (REST)').toBe(true);
        });
    });
});
