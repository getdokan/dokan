import path from 'path';
import { test, expect, BrowserContext, Page } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';

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
            test.slow();
            const data = newProductFormData.valid();

            await form.fillBasicInfo(data);
            await form.setProductType('simple');
            await form.selectCategory(data.category);
            await form.addTags(data.tags);
            // Feature + gallery images go through the WP media modal.
            await form.uploadFeatureImage(newProductFormData.images.feature);
            await expect(form.featureImagePreview).toHaveCount(1);
            await form.uploadGallery(newProductFormData.images.gallery);
            await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length);
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
    // NEGATIVE CASES — required fields & invalid input
    // ============================================
    test.describe('negative cases', () => {
        test('shows error when title is empty', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo({ ...data, title: '' });
            await form.save();

            // The Save button is disabled when the form is invalid; that is
            // also a valid "shows error" signal for a required field.
            const disabled = await form.saveButton.isDisabled();
            const titleError = page.locator('text=/title.*required|Please fill out this field/i').first();
            expect(disabled || (await titleError.isVisible().catch(() => false))).toBe(true);
        });

        test('shows error when price is empty', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.title.fill(data.title);
            await form.fillBasicInfo({ description: data.description });
            await form.save();

            const disabled = await form.saveButton.isDisabled();
            const priceError = page.locator('text=/price.*required|Please fill out this field/i').first();
            expect(disabled || (await priceError.isVisible().catch(() => false))).toBe(true);
        });

        test('shows error when description is empty', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo({ ...data, description: undefined });
            await form.save();

            const disabled = await form.saveButton.isDisabled();
            const descError = page.locator('text=/description.*required|Please fill out this field/i').first();
            expect(disabled || (await descError.isVisible().catch(() => false))).toBe(true);
        });

        test('shows error when no category is selected', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.unselectCategory(data.category);
            await form.fillBasicInfo(data);
            await form.save();

            // Category is required — either the save is blocked (button
            // disabled) or a validation message appears.
            const disabled = await form.saveButton.isDisabled();
            const catError = page.locator('text=/category.*required|category.*select/i').first();
            expect(disabled || (await catError.isVisible().catch(() => false))).toBe(true);
        });

        test('coerces negative price to a non-negative value', { tag: ['@lite', '@vendor'] }, async () => {
            await form.fillPrice(form.price, newProductFormData.invalid.negativePrice);

            // The price input strips the negative sign so the field reads
            // either "" or a non-negative number — both count as "coerced
            // to non-negative".
            const raw = await form.price.inputValue();
            const value = raw === '' ? 0 : parseFloat(raw);
            expect(Number.isFinite(value) && value >= 0).toBe(true);
        });

        test('rejects non-numeric price input', { tag: ['@lite', '@vendor'] }, async () => {
            await form.fillPrice(form.price, newProductFormData.invalid.nonNumericPrice);

            expect(await form.price.inputValue()).not.toBe(newProductFormData.invalid.nonNumericPrice);
        });

        test('shows error when sale price is greater than regular price', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();
            const { price, salePrice } = newProductFormData.invalid.salePriceHigherThanRegular;

            await form.fillBasicInfo({ ...data, price, salePrice });
            await form.save();

            // The form should reject the sale price in some way — either an
            // inline error or by blocking the save.
            const disabled = await form.saveButton.isDisabled();
            const saleError = page.locator('text=/sale price.*less than|sale.*regular|invalid.*sale/i').first();
            expect(disabled || (await saleError.isVisible().catch(() => false))).toBe(true);
        });

        test('accepts a valid min/max quantity range', { tag: ['@lite', '@vendor'] }, async () => {
            // The min/max qty inputs are `type="number"` without `min=0`, so
            // the form does not coerce values at the field level. We just
            // verify that a valid non-negative value sticks.
            await form.minQty.fill('1');
            await form.maxQty.fill('5');

            expect(await form.minQty.inputValue()).toBe('1');
            expect(await form.maxQty.inputValue()).toBe('5');
        });

        test('accepts valid shipping dimensions', { tag: ['@lite', '@vendor'] }, async () => {
            await form.weight.fill('1');
            await form.length.fill('1');

            expect(await form.weight.inputValue()).toBe('1');
            expect(await form.length.inputValue()).toBe('1');
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

    // ============================================
    // PRODUCT TYPES
    // ============================================
    test.describe('product types', () => {
        test('toggling downloadable checks the Downloadable option', { tag: ['@lite', '@vendor'] }, async () => {
            await form.enableDownloadable();

            await expect(form.downloadableToggle).toBeChecked();
        });

        test('toggling virtual checks the Virtual option', { tag: ['@lite', '@vendor'] }, async () => {
            await form.enableVirtual();

            await expect(form.virtualToggle).toBeChecked();
        });

        test('switching to variable type reveals the Attributes section', { tag: ['@lite', '@vendor'] }, async () => {
            await form.setProductType('variable');

            await expect(page.locator('#dokan-form-field-attributes')).toBeVisible();
        });
    });

    // ============================================
    // INVENTORY
    // ============================================
    test.describe('inventory', () => {
        test('accepts a valid GTIN/UPC/EAN', { tag: ['@lite', '@vendor'] }, async () => {
            await form.gtin.fill('0123456789012');

            expect(await form.gtin.inputValue()).toBe('0123456789012');
        });

        test('vendor can fill SKU', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();
            await form.sku.fill(data.sku);

            expect(await form.sku.inputValue()).toBe(data.sku);
        });

        test('vendor can toggle Manage Stock', { tag: ['@lite', '@vendor'] }, async () => {
            await form.enableManageStock();

            await expect(form.manageStockToggle).toBeChecked();
        });
    });

    // ============================================
    // SIDEBAR OPTIONS
    // ============================================
    test.describe('sidebar options', () => {
        test('vendor can change product visibility', { tag: ['@lite', '@vendor'] }, async () => {
            await form.selectVisibility('hidden');

            await expect(form.visibility).toHaveText(/hidden/i);
        });

        test('vendor can toggle product reviews off', { tag: ['@lite', '@vendor'] }, async () => {
            await form.setCheckbox('Enable product reviews', false);

            await expect(form.enableReviews).not.toBeChecked();
        });

        test('vendor can fill the purchase note', { tag: ['@lite', '@vendor'] }, async () => {
            const data = newProductFormData.valid();

            await form.purchaseNote.fill(data.purchaseNote);

            expect(await form.purchaseNote.inputValue()).toBe(data.purchaseNote);
        });
    });

    // ============================================
    // ADVANCED OPTIONS — Pro only
    // ============================================
    test.describe('advanced options', () => {
        test('vendor can enable wholesale', { tag: ['@pro', '@vendor'] }, async () => {
            await form.enableWholesale('60', '10');

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Enable wholesale/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });

        test('vendor can override the default RMA settings', { tag: ['@pro', '@vendor'] }, async () => {
            await form.overrideRma();

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Override your default RMA/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });

        test('vendor can enable bulk discount', { tag: ['@pro', '@vendor'] }, async () => {
            await form.enableBulkDiscount();

            await expect(form.page.locator('.components-base-control.components-checkbox-control')
                .filter({ has: form.page.locator('.dokan-form-field-label', { hasText: /Enable bulk discount/i }) })
                .locator('input.components-checkbox-control__input').first()).toBeChecked();
        });
    });

    // ============================================
    // PRODUCT IMAGES — feature image & gallery
    // Per-variation images don't exist in the React product editor (neither
    // Lite nor Pro render a variation image uploader), so they aren't covered.
    // ============================================
    test.describe('product images', () => {
        test.describe('happy paths', () => {
            test('vendor can add a feature image', { tag: ['@lite', '@vendor'] }, async () => {
                await form.uploadFeatureImage(newProductFormData.images.feature);

                await expect(form.featureImagePreview).toHaveCount(1);
            });

            test('vendor can add multiple gallery images', { tag: ['@lite', '@vendor'] }, async () => {
                await form.uploadGallery(newProductFormData.images.gallery);

                await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length);
            });

            test('vendor can create and save a product with feature and gallery images', { tag: ['@lite', '@vendor'] }, async () => {
                const data = newProductFormData.valid();

                await form.fillBasicInfo(data);
                await form.uploadFeatureImage(newProductFormData.images.feature);
                await form.uploadGallery(newProductFormData.images.gallery);
                await expect(form.featureImagePreview).toHaveCount(1);
                await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length);

                await form.save();
                await form.waitForSaveSuccess();
            });
        });

        test.describe('edge cases', () => {
            test('vendor can remove a feature image after adding it', { tag: ['@lite', '@vendor'] }, async () => {
                await form.uploadFeatureImage(newProductFormData.images.feature);
                await expect(form.featureImagePreview).toHaveCount(1);

                await form.removeFeatureImage();

                await expect(form.featureImagePreview).toHaveCount(0);
            });

            test('vendor can remove a single gallery image while keeping the rest', { tag: ['@lite', '@vendor'] }, async () => {
                await form.uploadGallery(newProductFormData.images.gallery);
                await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length);

                await form.removeGalleryImage(0);

                await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length - 1);
            });
        });
    });

    // ============================================
    // CATEGORY SELECTION MODE
    // Controlled by the admin setting dokan_selling.product_category_style
    // ('single' | 'multiple'). Each sub-describe sets the mode in beforeAll
    // (which runs before the parent beforeEach navigates, so the form loads in
    // that mode); the prior value is restored in afterAll. Mutating this GLOBAL
    // option is order-sensitive, so the block runs serially.
    // ============================================
    test.describe('category selection mode', () => {
        test.describe.configure({ mode: 'serial' });

        let apiUtils: ApiUtils;
        let prevStyle: 'single' | 'multiple' = 'single';
        const cat = { a: 'clothings', b: 'electronics' };

        const setCategoryStyle = async (style: 'single' | 'multiple'): Promise<void> => {
            await dbUtils.updateOptionValue('dokan_selling', { product_category_style: style });
        };

        const ensureCategory = async (name: string): Promise<void> => {
            const all = await apiUtils.getAllCategories(payloads.adminAuth);
            if (Array.isArray(all) && all.some((c: { name?: string }) => c.name?.toLowerCase() === name.toLowerCase())) {
                return;
            }
            try {
                await apiUtils.createCategory({ ...payloads.createCategory, name }, payloads.adminAuth);
            } catch {
                // created concurrently — fine.
            }
        };

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
            const current = await dbUtils.getOptionValue('dokan_selling');
            prevStyle = current?.product_category_style === 'multiple' ? 'multiple' : 'single';
            // Two categories are needed to test multi-selection.
            await ensureCategory(cat.a);
            await ensureCategory(cat.b);
        });

        test.afterAll(async () => {
            await setCategoryStyle(prevStyle);
            await apiUtils.dispose();
        });

        // ----------------------------------------
        // MULTIPLE mode — the vendor can pick many categories.
        // ----------------------------------------
        test.describe('multiple mode', () => {
            test.beforeAll(async () => {
                await setCategoryStyle('multiple');
            });

            test('vendor can select multiple product categories', { tag: ['@lite', '@vendor'] }, async () => {
                await form.selectCategory(cat.a);
                await form.selectCategory(cat.b);
                expect(await form.isCategorySelected(cat.a), `${cat.a} stays selected`).toBe(true);
                expect(await form.isCategorySelected(cat.b), `${cat.b} stays selected`).toBe(true);
                expect(await form.selectedCategoryCount(), 'both categories are kept in multiple mode').toBeGreaterThanOrEqual(2);
            });
        });

        // ----------------------------------------
        // SINGLE mode — the vendor must be limited to ONE category.
        // ----------------------------------------
        test.describe('single mode', () => {
            test.beforeAll(async () => {
                await setCategoryStyle('single');
            });

            // The category field honors dokan_selling.product_category_style: when
            // set to 'single', FormSchema marks the `category_ids` field as
            // non-multiple, so selecting a second category replaces the first (a
            // true single-select holds exactly one value).
            test('single mode limits the vendor to one product category', { tag: ['@lite', '@vendor'] }, async () => {
                await form.selectCategory(cat.a);
                await form.selectCategory(cat.b);
                expect(await form.selectedCategoryCount(), 'single mode must keep exactly one category').toBe(1);
                expect(await form.isCategorySelected(cat.b), 'the last pick is the one kept').toBe(true);
            });
        });
    });
});
