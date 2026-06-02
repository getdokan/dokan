import { test, expect, Page } from '@utils/test';
import {
    ProductFormManagerAddonsPage,
    api,
    addonMatrix,
    imageOptionAddon,
} from './productFormManagerAddonsPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(
    __dirname,
    '../../../playwright/.auth/vendorStorageState.json'
);

// PR: "enhance: Allow modules to chain promises before saving product in editor"
//
// That PR is what lets the Product Add-ons module hook into the new Product Form
// Manager (the React product editor under src/dashboard/product-editor). The Pro
// module registers a `product_addons` field whose data is persisted to the
// `_product_addons` meta during the editor's save flow.
//
// These tests drive the REAL Add-ons UI in the new editor and assert that every
// add-on type AND every sub-control it offers (display, title format, required,
// description, restrictions + min/max range, price adjustment with type + value,
// and multiple priced options across all three price types) round-trips into the
// product's `_product_addons` meta — proving the product is saved with every
// option the add-ons feature provides.

test.describe('Product form manager - Product Add-ons', () => {
    let vendor: ProductFormManagerAddonsPage;
    let vPage: Page;
    let categoryId: number;
    const productIds: string[] = [];

    test.beforeAll(async ({ browser }) => {
        await api.init();
        categoryId = await api.getProductCategoryId();

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductFormManagerAddonsPage(vPage);
    });

    test.afterAll(async () => {
        for (const id of productIds) {
            await api.deleteProduct(id).catch(() => undefined);
        }
        await vPage?.close();
        await api.dispose();
    });

    test(
        'vendor can create a product with every add-on type and every sub-control in the new editor',
        { tag: ['@pro', '@vendor'] },
        async () => {
            test.slow();
            const [id] = await api.createVendorProduct(categoryId);
            productIds.push(id);

            const specs = addonMatrix(id);
            await vendor.assertAddonsPersist(id, specs);
        }
    );

    test(
        'vendor can configure an image add-on with one option per price type',
        { tag: ['@pro', '@vendor'] },
        async () => {
            test.slow();
            const [id] = await api.createVendorProduct(categoryId);
            productIds.push(id);

            await vendor.assertAddonsPersist(id, [imageOptionAddon(id)]);
        }
    );

    test(
        'vendor can reopen the editor, remove an option and an add-on, and the changes persist',
        { tag: ['@pro', '@vendor'] },
        async () => {
            test.slow();
            const [id] = await api.createVendorProduct(categoryId);
            productIds.push(id);

            // Seed two add-ons (the kept one has two options) and prove they saved.
            const keep = `Keep ${id}`;
            const drop = `Drop ${id}`;
            await vendor.assertAddonsPersist(id, [
                {
                    type: 'multiple_choice',
                    name: keep,
                    options: [
                        { label: 'A', price: '1', priceType: 'flat_fee' },
                        { label: 'B', price: '2', priceType: 'flat_fee' },
                    ],
                },
                { type: 'custom_text', name: drop },
            ]);

            // Reopen the editor — both add-ons must hydrate from the saved meta.
            await vendor.reopen(id);
            await vendor.assertCardVisible(keep);
            await vendor.assertCardVisible(drop);

            // Remove the 2nd option from the kept add-on and delete the other add-on.
            await vendor.removeOption(keep, 1);
            await vendor.removeAddon(drop);
            await vendor.save();

            // Only the kept add-on survives, now with a single option.
            const saved = await api.getProductAddons(id);
            expect(saved.length).toBe(1);
            expect(saved[0].name).toBe(keep);
            expect(saved[0].options.length).toBe(1);
            expect(saved[0].options[0].label).toBe('A');
        }
    );
});
