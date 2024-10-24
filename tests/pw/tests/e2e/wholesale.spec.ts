import { test, request, Page } from '@playwright/test';
import { WholesalePage } from '@pages/wholesalePage';
import { ProductsPage } from '@pages/productsPage';
import { CustomerPage } from '@pages/customerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbData } from '@utils/dbData';

test.describe('Wholesale test (admin)', () => {
    let admin: WholesalePage;
    let customer: WholesalePage;
    let customerPage: CustomerPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let customerId: string;
    let customerName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new WholesalePage(aPage);

        const customerContext = await browser.newContext();
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesalePage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        [, customerId, customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
        await aPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view wholesale customers menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminWholesaleCustomersRenderProperly();
    });

    test('admin can search wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchWholesaleCustomer(customerName);
    });

    test("admin can disable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateWholesaleCustomer(customerName, 'disable');
    });

    test("admin can enable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateWholesaleCustomer(customerName, 'enable');
    });

    test('admin can edit wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editWholesaleCustomer({ ...data.customer, username: customerName });
    });

    test('admin can view wholesale customer orders', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, customer_id: customerId }, payloads.vendorAuth);
        await admin.viewWholesaleCustomerOrders(customerName);
    });

    test('admin can delete wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        const [, , customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
        await admin.updateWholesaleCustomer(customerName, 'delete');
    });

    test('admin can perform bulk action on wholesale customers', { tag: ['@pro', '@admin'] }, async () => {
        await admin.wholesaleCustomerBulkAction('activate');
    });

    //customer

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
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , productName] = await apiUtils.createProduct(payloads.createProductRequiredFields(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor can create wholesale product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductWholesaleOptions(productName, data.product.productInfo.wholesaleOption);
    });
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
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new WholesalePage(aPage);

        apiUtils = new ApiUtils(await request.newContext());

        const [, , customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);

        const customerContext = await browser.newContext(data.header.userAuth(customerName));
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesalePage(cPage);

        const [responseBody, ,] = await apiUtils.createProduct(payloads.createWholesaleProduct(), payloads.vendorAuth);
        productName = responseBody.name;
        wholesalePrice = responseBody.meta_data[0]['value']['price'];
        minimumWholesaleQuantity = responseBody.meta_data[0]['value']['quantity'];
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
        await aPage.close();
        await cPage.close();
    });

    test('All users can see wholesale price', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, '@todo fix this test');
        await admin.viewWholeSalePrice(productName);
    });

    test('customer (wholesale) can only see wholesale price', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, '@todo fix this test');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.wholesale, { wholesale_price_display: 'wholesale_customer' });
        await customer.viewWholeSalePrice(productName);
        await admin.viewWholeSalePrice(productName, false);
    });

    test('customer can see wholesale price on shop archive', { tag: ['@pro', '@admin'] }, async () => {
        await customer.viewWholeSalePrice(productName, true, false);
    });

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
});
