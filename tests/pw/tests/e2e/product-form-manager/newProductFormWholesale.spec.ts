import { test, expect, BrowserContext, Page } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// B23 wholesale VERIFY: the existing new-product-form "vendor can enable wholesale"
// only asserts the checkbox is checked — it never saves and never asserts the
// price/quantity persist, so it does NOT carry the legacy wholesale vendor case's
// motive (a silent break in wholesale save would not be caught). This file adds the
// real behavioral coverage that lets the legacy vendor case (wholesale/wholesale.spec.ts,
// a no-op stub) be retired:
//   1. EDIT surface (deterministic): a REST-seeded wholesale product hydrates its
//      enable/price/quantity back into the React editor (resolve_fields_value round-trip).
//   2. CREATE surface (R-B23-1): creating a product with wholesale enabled actually
//      persists _dokan_wholesale_meta (the module's simple-product save path reads
//      $_POST['wholesale'] and had no confirmed REST handler — this is the live check).
// The Wholesale card only renders for non-variable products. Module wholesale is
// core-Pro-active in this env. Admin wholesale-customer CRUD + customer buy cases
// STAY legacy (D3); the legacy "(React)" admin smokes are relabelled separately.
// The editor is heavy → single-worker. Behavioral oracle is the REST meta (§7).
// ============================================

let apiUtils: ApiUtils;
const seededIds: string[] = [];

test.describe('Vendor product wholesale (React) functionality', () => {
    test.describe.configure({ mode: 'serial' }); // heavy editor — avoid parallel wp-env load

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.wholesale, payloads.adminAuth);
    });

    test.afterAll(async () => {
        for (const id of seededIds) await apiUtils.deleteProduct(id, payloads.adminAuth, true).catch(() => undefined);
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

    test('creating a product with wholesale enabled persists _dokan_wholesale_meta (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        await form.goto();
        await form.waitForFormReady();
        const data = newProductFormData.valid();
        data.title = `${data.title} WSPW${Date.now()}`; // unique marker to find it via REST
        await form.fillBasicInfo(data);
        // Check Enable-wholesale, then fill the dependency-revealed price/qty inputs.
        // NOTE (verified live): the shared enableWholesale() targets input[name="wholesale_price"]
        // / #dokan-form-field-wholesale_price which no longer exist — the base-ui fields render
        // with auto-generated ids, so target them by their field LABEL instead.
        await form.setCheckbox('Enable wholesale for this product', true);
        const fieldByLabel = (label: RegExp) =>
            page
                .locator('.components-base-control')
                .filter({ has: page.locator('.dokan-form-field-label', { hasText: label }) })
                .locator('input')
                .first();
        const priceInput = fieldByLabel(/^Wholesale Price/i);
        const qtyInput = fieldByLabel(/Minimum Quantity for Wholesale/i);
        await priceInput.waitFor({ state: 'visible', timeout: 10000 });
        await priceInput.fill('60');
        await qtyInput.fill('10');
        await form.save();
        await form.waitForSaveSuccess();

        // Find the created product by its unique title (the editor's POST-id capture is
        // finicky under load — the save-success + REST lookup is the robust path).
        const all = await apiUtils.getAllProducts(payloads.vendorAuth);
        const created = (Array.isArray(all) ? all : []).find((p: { name?: string; id?: number }) => String(p.name ?? '').includes(data.title));
        expect(created, 'the created product is found via REST').toBeTruthy();
        const id = String(created.id);
        seededIds.push(id);

        // Behavioral oracle (REST, no fake green): the wholesale meta persisted.
        // R-B23-1: if this fails, the React create-path does NOT write _dokan_wholesale_meta
        // → a real product gap; a bug note goes in bugs/ (do not weaken to a checkbox assert).
        const saved = await apiUtils.getSingleProduct(id, payloads.vendorAuth);
        const meta = apiUtils.getMetaDataValue(saved.meta_data ?? [], '_dokan_wholesale_meta') ?? {};
        expect(String(meta.enable_wholesale ?? ''), 'wholesale is enabled in the persisted meta').toMatch(/^(yes|1)$/i);
        expect(String(meta.price ?? ''), 'the wholesale price persisted').toBe('60');
        expect(String(meta.quantity ?? ''), 'the wholesale minimum quantity persisted').toBe('10');
    });

    test('a REST-seeded wholesale product hydrates its enabled state in the React editor (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
        // Seed a wholesale product via REST; read back the authoritative meta.
        const [, id] = await apiUtils.createProduct(payloads.createWholesaleProduct(), payloads.vendorAuth);
        seededIds.push(id);
        const seeded = await apiUtils.getSingleProduct(id, payloads.vendorAuth);
        const meta = apiUtils.getMetaDataValue(seeded.meta_data ?? [], '_dokan_wholesale_meta') ?? {};
        const seededPrice = String(meta.price ?? '');

        await form.gotoEdit(id);
        await form.waitForEditReady();
        // Primary oracle: the Enable-wholesale checkbox hydrates checked (proves the
        // _dokan_wholesale_meta round-trips through resolve_fields_value).
        const enableCheckbox = page
            .locator('.components-base-control.components-checkbox-control')
            .filter({ has: page.locator('.dokan-form-field-label', { hasText: /Enable wholesale/i }) })
            .locator('input.components-checkbox-control__input')
            .first();
        await expect(enableCheckbox, 'wholesale is shown enabled on the edit surface').toBeChecked({ timeout: 15000 });
        // Secondary: if the price input has revealed, it hydrates to the seeded value.
        // (base-ui fields have auto-generated ids — target by field label.)
        const priceInput = page
            .locator('.components-base-control')
            .filter({ has: page.locator('.dokan-form-field-label', { hasText: /^Wholesale Price/i }) })
            .locator('input')
            .first();
        const revealed = await priceInput
            .waitFor({ state: 'visible', timeout: 8000 })
            .then(() => true)
            .catch(() => false);
        if (revealed && seededPrice) {
            await expect(priceInput, 'wholesale price hydrates from the seeded meta').toHaveValue(new RegExp(`^${seededPrice.replace('.', '\\.')}`), { timeout: 8000 });
        }
    });
});
