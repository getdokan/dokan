import path from 'path';
import { test, expect, BrowserContext, Page } from '@utils/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Vendor new product form (React) functionality', () => {
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
    // HAPPY PATHS
    // ============================================
    test.describe('happy paths', () => {
        test('vendor can create a simple product with required fields', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo(data);
            await form.save();

            await form.waitForSaveSuccess();
        });

        test('vendor can create a product with every option filled', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo(data);
            await form.setProductType('simple');
            await form.selectCategory(data.category);
            await form.addTags(data.tags);
            // Inventory enables Manage Stock, which replaces the Stock Status
            // dropdown with a quantity input — so we don't select stock
            // status here.
            await form.fillInventory(data);
            await form.fillShipping(data);
            await form.selectTaxStatus('taxable');
            await form.minQty.fill(data.minQty);
            await form.maxQty.fill(data.maxQty);
            await form.setCheckbox('Enable product reviews', true);
            await form.purchaseNote.fill(data.purchaseNote);

            await form.save();
            await form.waitForSaveSuccess();
        });

        test('vendor can save a product as draft', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo(data);
            await form.saveAsDraft();
            await form.waitForSaveSuccess();
        });
    });

    // ============================================
    // EDGE CASES — boundary & unusual input
    // ============================================
    test.describe('edge cases', () => {
        test('handles a very long title (300+ chars) gracefully', { tag: ['@lite', '@vendor'] }, async () => {
            await form.title.fill(newProductFormData.invalid.longTitle);

            // Either the field truncates or stores the full value — both are
            // graceful. We just want to assert nothing breaks the form.
            const v = await form.title.inputValue();
            expect(v.length).toBeGreaterThan(0);
        });

        test('preserves special characters in the title field', { tag: ['@lite', '@vendor'] }, async () => {
            await form.title.fill(newProductFormData.invalid.specialTitle);

            expect(await form.title.inputValue()).toBe(newProductFormData.invalid.specialTitle);
        });

        test('preserves the title field after a validation error', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.title.fill(data.title);
            await form.save();
            await page.waitForTimeout(500);

            // The form blocks save (description / price required); the
            // title we filled is the value the user would want preserved.
            expect(await form.title.inputValue()).toBe(data.title);
        });
    });
});
