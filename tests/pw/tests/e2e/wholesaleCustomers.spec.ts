import { test, request, Page } from '@playwright/test';
import { WholesaleCustomersPage } from '@pages/wholesaleCustomersPage';
import { CustomerPage } from '@pages/customerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbData } from '@utils/dbData';

test.describe('Wholesale customers test (admin)', () => {
    let admin: WholesaleCustomersPage;
    let customer: WholesaleCustomersPage;
    let customerPage: CustomerPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let customerId: string;
    let customerName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new WholesaleCustomersPage(aPage);

        const customerContext = await browser.newContext();
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesaleCustomersPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        [, customerId, customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
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
        await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, { ...dbData.dokan.wholesaleSettings, need_approval_for_wholesale_customer: 'on' });
        await customerPage.customerRegister(data.customer.customerInfo);
        await customer.customerRequestForBecomeWholesaleCustomer();
    });
});

test.describe('Wholesale customers test customer', () => {
    let customer: WholesaleCustomersPage;
    let customerPage: CustomerPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let wholesalePrice: string;
    let minimumWholesaleQuantity: string;

    test.beforeAll(async ({ browser }) => {
        apiUtils = new ApiUtils(await request.newContext());

        const [, , customerName] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);

        const customerContext = await browser.newContext(data.header.userAuth(customerName));
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesaleCustomersPage(cPage);

        const [responseBody, ,] = await apiUtils.createProduct(payloads.createWholesaleProduct(), payloads.vendorAuth);
        productName = responseBody.name;
        wholesalePrice = responseBody.meta_data[0]['value']['price'];
        minimumWholesaleQuantity = responseBody.meta_data[0]['value']['quantity'];
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    test('customer can see wholesale price on shop archive', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewWholeSalePrice(productName);
    });

    test('customer can buy wholesale product', { tag: ['@pro', '@customer'] }, async () => {
        await customerPage.addProductToCart(productName, 'single-product', true, minimumWholesaleQuantity);
        await customerPage.goToCart();
        await customer.assertWholesalePrice(wholesalePrice, minimumWholesaleQuantity);
        await customerPage.goToCheckout();
        await customerPage.paymentOrder();
    });
});
