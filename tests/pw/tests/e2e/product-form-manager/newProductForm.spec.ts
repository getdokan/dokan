import { test, expect, BrowserContext, Page } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

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
        test('vendor can create a simple product with required fields', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const data = newProductFormData.valid();

            await form.fillBasicInfo(data);
            await form.save();

            await form.waitForSaveSuccess();
        });

        test('vendor can create a product with every option filled', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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

        test('vendor can save a product as draft', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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
        test('handles a very long title (300+ chars) gracefully', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.title.fill(newProductFormData.invalid.longTitle);

            // Either the field truncates or stores the full value — both are
            // graceful. We just want to assert nothing breaks the form.
            const v = await form.title.inputValue();
            expect(v.length).toBeGreaterThan(0);
        });

        test('preserves special characters in the title field', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await form.title.fill(newProductFormData.invalid.specialTitle);

            expect(await form.title.inputValue()).toBe(newProductFormData.invalid.specialTitle);
        });

        test('preserves the title field after a validation error', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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
    // PRODUCT IMAGES — feature image & gallery
    // Per-variation images don't exist in the React product editor (neither
    // Lite nor Pro render a variation image uploader), so they aren't covered.
    // ============================================
    test.describe('product images', () => {
        test.describe('happy paths', () => {
            test('vendor can add a feature image', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
                await form.uploadFeatureImage(newProductFormData.images.feature);

                await expect(form.featureImagePreview).toHaveCount(1);
            });

            test('vendor can add multiple gallery images', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
                await form.uploadGallery(newProductFormData.images.gallery);

                await expect(form.galleryImagePreviews).toHaveCount(newProductFormData.images.gallery.length);
            });

            test('vendor can create and save a product with feature and gallery images', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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
            test('vendor can remove a feature image after adding it', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
                await form.uploadFeatureImage(newProductFormData.images.feature);
                await expect(form.featureImagePreview).toHaveCount(1);

                await form.removeFeatureImage();

                await expect(form.featureImagePreview).toHaveCount(0);
            });

            test('vendor can remove a single gallery image while keeping the rest', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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

            test('vendor can select multiple product categories', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
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
            test('single mode limits the vendor to one product category', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
                await form.selectCategory(cat.a);
                await form.selectCategory(cat.b);
                expect(await form.selectedCategoryCount(), 'single mode must keep exactly one category').toBe(1);
                expect(await form.isCategorySelected(cat.b), 'the last pick is the one kept').toBe(true);
            });
        });
    });
});
