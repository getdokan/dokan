import { test, expect, Page } from '@utils/test';
import { ProductAddonStorefrontPage, api } from './productAddonStorefrontPage';
import path from 'path';

// ============================================
// SESSION STORAGE
// ============================================
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// Storefront impact of product add-ons: the WooCommerce single-product page renders
// add-on fields from `_product_addons` (+ matching global add-ons), and the selected
// options adjust the price into the cart. Independent of the vendor product editor.

test.describe('Product Add-ons - Storefront Cart & Pricing', () => {
    let customer: ProductAddonStorefrontPage;
    let cPage: Page;
    let categoryId: number;
    const products: string[] = [];
    const addons: string[] = [];

    test.beforeAll(async ({ browser }) => {
        await api.init();
        categoryId = await api.getProductCategoryId();
        const ctx = await browser.newContext({ storageState: c1 });
        cPage = await ctx.newPage();
        customer = new ProductAddonStorefrontPage(cPage);
    });

    test.afterAll(async () => {
        for (const id of products) await api.deleteProduct(id).catch(() => undefined);
        for (const id of addons) await api.deleteAddon(id).catch(() => undefined);
        await cPage?.close();
        await api.dispose();
    });

    // ---- Happy Paths ---------------------------------------------------------
    test.describe('happy paths', () => {
        test('customer sees add-on fields on a product single page', { tag: ['@pro', '@customer', '@exploratory'] }, async () => {
            const p = await api.seedProductWithAddons([
                { name: 'Colour', type: 'multiple_choice', options: [{ label: 'Red', price: '10', price_type: 'flat_fee' }] },
            ]);
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.assertAddonRenders('Colour');
            await customer.assertOptionAvailable('Red');
        });

        test('flat-fee option adds a fixed amount to the price', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Engraving', type: 'multiple_choice', options: [{ label: 'Add engraving', price: '10', price_type: 'flat_fee' }] }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.selectOption('Add engraving');
            expect(await customer.readGrandTotal()).toBe(p.base + 10);
        });

        test('quantity-based option scales the add-on cost with quantity', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Per-unit', type: 'multiple_choice', options: [{ label: 'Unit fee', price: '5', price_type: 'quantity_based' }] }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.setQuantity(3);
            await customer.selectOption('Unit fee');
            expect(await customer.readGrandTotal()).toBe(p.base * 3 + 5 * 3);
        });

        test('percentage-based option adds a percent of the base price', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Premium', type: 'multiple_choice', options: [{ label: '10 percent', price: '10', price_type: 'percentage_based' }] }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.selectOption('10 percent');
            expect(await customer.readGrandTotal()).toBe(p.base + p.base * 0.1);
        });

        test('customer-defined price adds the entered amount', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Name your price', type: 'custom_price', min: 5, max: 500 }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.fillCustomPrice('25');
            expect(await customer.readGrandTotal()).toBe(p.base + 25);
        });

        test('category-restricted global add-on appears on a matching product', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons([], { categoryId });
            products.push(p.id);
            // Global add-ons are site-wide state another spec can wipe, and the WC PAO
            // create endpoint occasionally returns a non-object under load. Seed + render
            // together inside a retry so a single bad attempt self-heals.
            await expect(async () => {
                addons.push(await api.seedGlobalAddon(categoryId));
                await customer.gotoProduct(p.slug);
                await customer.assertAddonRenders('Gift wrap');
            }).toPass({ timeout: 60_000, intervals: [2_000, 4_000, 8_000] });
        });

        test('multiple add-on fields stack their prices on the total', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [
                    { name: 'Wrapping', type: 'multiple_choice', options: [{ label: 'Gift box', price: '10', price_type: 'flat_fee' }] },
                    { name: 'Card', type: 'multiple_choice', options: [{ label: 'Greeting card', price: '15', price_type: 'flat_fee' }] },
                ],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.selectOption('Gift box');
            await customer.selectOption('Greeting card');
            // Both flat fees are added on top of the base price.
            expect(await customer.readGrandTotal()).toBe(p.base + 10 + 15);
        });

        test('selected add-on carries into the cart', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Monogram', type: 'multiple_choice', options: [{ label: 'Add monogram', price: '20', price_type: 'flat_fee' }] }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.selectOption('Add monogram');
            expect(await customer.readGrandTotal()).toBe(p.base + 20);
            await customer.addToCart();
            // The chosen add-on is recorded against the cart line item.
            await customer.assertInCart('Monogram');
        });
    });

    // ---- Edge Cases ----------------------------------------------------------
    test.describe('edge cases', () => {
        test('input multiplier multiplies its price by the entered quantity', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons(
                [{ name: 'Copies', type: 'input_multiplier', price: '2', adjust_price: 1, price_type: 'flat_fee', min: 1, max: 99 }],
                { basePrice: '100' }
            );
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            const input = cPage.locator('.wc-pao-addon input[type="number"]').first();
            await input.fill('4');
            await input.blur();
            expect(await customer.readGrandTotal()).toBe(p.base + 2 * 4);
        });

        test('product with "exclude global add-ons" hides global add-ons', { tag: ['@pro', '@customer'] }, async () => {
            const addonId = await api.seedGlobalAddon(categoryId);
            addons.push(addonId);
            const p = await api.seedProductWithAddons([], { categoryId, excludeGlobal: true });
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.assertAddonHidden('Gift wrap');
        });
    });

    // ---- Negative Cases ------------------------------------------------------
    test.describe('negative cases', () => {
        test('required add-on field blocks Add to cart when empty', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons([
                { name: 'Required note', type: 'custom_text', required: 1 },
            ]);
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.assertAddToCartBlocked(p.name);
        });

        test('custom price below the minimum is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const p = await api.seedProductWithAddons([
                { name: 'Min price', type: 'custom_price', min: 50, max: 500 },
            ]);
            products.push(p.id);
            await customer.gotoProduct(p.slug);
            await customer.fillCustomPrice('10');
            await customer.assertAddToCartBlocked(p.name);
        });
    });
});
