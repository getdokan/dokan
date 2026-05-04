import { test } from '@playwright/test';
import path from 'path';
import { CustomerPage } from './customerPage';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');     // Customer 1 session storage

// ============================================
// TEST SETUP
// ============================================

test.describe('Customer Tests @lite', () => {
    // ============================================
    // TEST CASES
    // ============================================
    // Note: To use a specific user session, create context with storageState
    // Example:
    // const context = await browser.newContext({ storageState: c1 });
    // const page = await context.newPage();

    test('customer can register', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.registerDefaultCustomer();
    });

    test('customer can login', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.loginDefaultCustomer();
    });

    test('customer can logout', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.loginDefaultCustomer();
        await customer.logoutDefaultCustomer();
    });

    test('customer can become a vendor', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.registerAndBecomeVendorDefaultCustomer();
    });

    test('customer can add billing details', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const page = await context.newPage();
        const customer = new CustomerPage(page);

        await customer.addDefaultBillingAddress();

        await page.close();
        await context.close();
    });

    test('customer can add shipping details', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const page = await context.newPage();
        const customer = new CustomerPage(page);

        await customer.addDefaultShippingAddress();

        await page.close();
        await context.close();
    });

    test('customer can add customer details', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const page = await context.newPage();
        const customer = new CustomerPage(page);

        await customer.addDefaultCustomerDetails();

        await page.close();
        await context.close();
    });

    // TODO: need to fix
    test('customer can add product to cart', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        // Used guest customer to avoid conflict with other tests
        const context = await browser.newContext();
        const page = await context.newPage();
        const customer = new CustomerPage(page);

        await customer.addDefaultProductToCartAndAssert();

        await page.close();
        await context.close();
    });

    test('customer can buy product', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const page = await context.newPage();
        const customer = new CustomerPage(page);

        await customer.buyDefaultProduct();

        await page.close();
        await context.close();
    });

    test('customer can buy multi-vendor products', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const page = await context.newPage();
        const customer = new CustomerPage(page);
        await customer.buyDefaultMultiVendorProducts();
        await page.close();
        await context.close();
    });

    // todo: customer can download downloadable product
});

