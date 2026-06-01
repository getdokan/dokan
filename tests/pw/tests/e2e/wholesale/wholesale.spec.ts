import { Page, expect, test } from '@utils/test';
import { WholesalePage, CustomerPage, ProductsPage, ApiUtils, dbUtils, dbData, data, payloads } from './wholesalePage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// KEEP skipped: page-object methods (WholesalePage/CustomerPage/ApiUtils) are stubs with no real implementation.
test.describe.skip('Wholesale test (admin)', () => {
    let admin: WholesalePage;
    let customer: WholesalePage;
    let customerPage: CustomerPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let customerId: string;
    let customerName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new WholesalePage(aPage);
        const customerContext = await browser.newContext();
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesalePage(cPage);
        apiUtils = new ApiUtils(null);
        [, customerId, customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
        await apiUtils.activateModules(payloads.moduleIds.wholesale, payloads.adminAuth);
        await aPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable wholesale module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableWholesaleModule(); });
    test('admin can view wholesale customers menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminWholesaleCustomersRenderProperly(); });
    test('admin can search wholesale customer', { tag: ['@pro', '@admin'] }, async () => { await admin.searchWholesaleCustomer(customerName); });
    test("admin can disable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => { await admin.updateWholesaleCustomer(customerName, 'disable'); });
    test("admin can enable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => { await admin.updateWholesaleCustomer(customerName, 'enable'); });
    test('admin can edit wholesale customer', { tag: ['@pro', '@admin'] }, async () => { await admin.editWholesaleCustomer({ ...data.customer, username: customerName }); });
    test('admin can view wholesale customer orders', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, customer_id: customerId }, payloads.vendorAuth);
        await admin.viewWholesaleCustomerOrders(customerName);
    });
    test('admin can delete wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        const [, , customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
        await admin.updateWholesaleCustomer(customerName, 'delete');
    });
    test('admin can perform bulk action on wholesale customers', { tag: ['@pro', '@admin'] }, async () => { await admin.wholesaleCustomerBulkAction('activate'); });

    test('customer can become a wholesale customer', { tag: ['@pro', '@customer'] }, async () => {
        await customerPage.customerRegister(data.customer.customerInfo);
        await customer.customerBecomeWholesaleCustomer();
    });
    test('customer can request for become a wholesale customer', { tag: ['@pro', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.wholesale, { need_approval_for_wholesale_customer: 'on' });
        await customerPage.customerRegister(data.customer.customerInfo);
        await customer.customerRequestForBecomeWholesaleCustomer();
    });
});

test.describe('Wholesale test (vendor)', () => {
    let vendor: ProductsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , productName] = await apiUtils.createProduct(payloads.createProductRequiredFields(), payloads.vendorAuth);
    });

    test.afterAll(async () => { await vPage?.close(); });

    test('vendor can create wholesale product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addProductWholesaleOptions(productName, data.product.productInfo.wholesaleOption); });
});

test.describe('Wholesale test (customer)', () => {
    let admin: WholesalePage;
    let customer: WholesalePage;
    let customerPage: CustomerPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let wholesalePrice: string;
    let minimumWholesaleQuantity: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new WholesalePage(aPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
        const customerContext = await browser.newContext();
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesalePage(cPage);
        const [responseBody] = await apiUtils.createProduct(payloads.createWholesaleProduct(), payloads.vendorAuth);
        productName = responseBody.name;
        wholesalePrice = responseBody.meta_data[0]['value']['price'];
        minimumWholesaleQuantity = responseBody.meta_data[0]['value']['quantity'];
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.wholesale, payloads.adminAuth);
        await dbUtils.setOptionValue(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
        await aPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('all users can see wholesale price', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, '@todo fix this test');
        await admin.viewWholeSalePrice(productName);
    });
    test('customer (wholesale) can only see wholesale price', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, '@todo fix this test');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.wholesale, { wholesale_price_display: 'wholesale_customer' });
        await customer.viewWholeSalePrice(productName);
        await admin.viewWholeSalePrice(productName, false);
    });
    test('customer can see wholesale price on shop archive', { tag: ['@pro', '@admin'] }, async () => { await customer.viewWholeSalePrice(productName, true, false); });
    test("customer can't see wholesale price on shop archive", { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.wholesale, { display_price_in_shop_archieve: 'off' });
        await customer.viewWholeSalePrice(productName, false, false);
    });
    test('customer (wholesale) can buy wholesale product', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, '@todo fix this test');
        await customerPage.addProductToCart(productName, 'single-product', true, minimumWholesaleQuantity);
        await customerPage.goToCart();
        await customer.assertWholesalePrice(wholesalePrice, minimumWholesaleQuantity);
        await customerPage.goToCheckout();
        await customerPage.paymentOrder();
    });
    test('admin can disable wholesale module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.wholesale, payloads.adminAuth);
        await admin.disableWholesaleModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Wholesale (React) Tests @pro', () => {
    test('Test Case 1 - Admin wholesale customer page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/wholesale-customer`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Wholesale page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/wholesale-customer`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

