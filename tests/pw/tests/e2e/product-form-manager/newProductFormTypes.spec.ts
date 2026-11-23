import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage } from './newProductFormPage';
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
});
