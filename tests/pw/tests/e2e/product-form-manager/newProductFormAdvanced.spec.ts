import { test, expect, BrowserContext, Page } from '@utils/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

test.describe('Vendor new product form (React) advanced options', () => {
    let ctx: BrowserContext;
    let page: Page;
    let form: NewProductFormPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        form = new NewProductFormPage(page);
        await form.goto();
        await form.waitForFormReady();
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    // ============================================
    // PRODUCT TYPES
    // ============================================
    test.describe('product types', () => {
        test('toggling downloadable checks the Downloadable option', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.enableDownloadable();

            await expect(form.downloadableToggle).toBeChecked();
        });

        test('toggling virtual checks the Virtual option', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.enableVirtual();

            await expect(form.virtualToggle).toBeChecked();
        });

        test('switching to variable type reveals the Attributes section', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.setProductType('variable');

            await expect(page.locator('#dokan-form-field-attributes')).toBeVisible();
        });
    });

    // ============================================
    // INVENTORY
    // ============================================
    test.describe('inventory', () => {
        test('accepts a valid GTIN/UPC/EAN', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.gtin.fill('0123456789012');

            expect(await form.gtin.inputValue()).toBe('0123456789012');
        });

        test('vendor can fill SKU', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const data = newProductFormData.valid();
            await form.sku.fill(data.sku);

            expect(await form.sku.inputValue()).toBe(data.sku);
        });

        test('vendor can toggle Manage Stock', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.enableManageStock();

            await expect(form.manageStockToggle).toBeChecked();
        });
    });

    // ============================================
    // ATTRIBUTES
    // ============================================
    test.describe('attributes', () => {
        test('vendor can add a global attribute whose terms lazy-load', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // "sizes" (terms s/m/l) is seeded by _env.setup.ts.
            await form.addGlobalAttribute('sizes');
            await expect(form.attributeCard('sizes')).toBeVisible();

            await form.selectAllAttributeTerms();

            await expect(form.attributeTermsValue).toContainText('s');
            await expect(form.attributeTermsValue).toContainText('m');
            await expect(form.attributeTermsValue).toContainText('l');
        });
    });

    // ============================================
    // SIDEBAR OPTIONS
    // ============================================
    test.describe('sidebar options', () => {
        test('vendor can change product visibility', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.selectVisibility('hidden');

            await expect(form.visibility).toHaveText(/hidden/i);
        });

        test('vendor can toggle product reviews off', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.setCheckbox('Enable product reviews', false);

            await expect(form.enableReviews).not.toBeChecked();
        });

        test('vendor can fill the purchase note', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const data = newProductFormData.valid();

            await form.purchaseNote.fill(data.purchaseNote);

            expect(await form.purchaseNote.inputValue()).toBe(data.purchaseNote);
        });
    });

    // ============================================
    // ADVANCED OPTIONS — Pro only
    // ============================================
    test.describe('advanced options', () => {
        test('vendor can enable wholesale', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.enableWholesale('60', '10');

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Enable wholesale/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });

        test('vendor can override the default RMA settings', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.overrideRma();

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Override your default RMA/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });

        test('vendor can enable bulk discount', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await form.enableBulkDiscount();

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Enable bulk discount/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });
    });
});
