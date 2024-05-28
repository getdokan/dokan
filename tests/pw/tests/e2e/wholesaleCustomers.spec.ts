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

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new WholesaleCustomersPage(aPage);

        const customerContext = await browser.newContext(data.auth.noAuth);
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesaleCustomersPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
        await apiUtils.createWholesaleCustomer(payloads.createCustomer1, payloads.adminAuth);
        //  [,, productName] = await apiUtils.createProduct(payloads.createWholesaleProduct(), payloads. vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view wholesale customers menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminWholesaleCustomersRenderProperly();
    });

    test('admin can search wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchWholesaleCustomer(data.predefined.customerInfo.username1);
    });

    test("admin can disable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'disable');
    });

    test("admin can enable customer's wholesale capability", { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'enable');
    });

    test('admin can edit wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editWholesaleCustomer(data.customer);
    });

    test('admin can view wholesale customer orders', { tag: ['@pro', '@admin'] }, async () => {
        await admin.viewWholesaleCustomerOrders(data.predefined.customerInfo.username1);
    });

    test('admin can delete wholesale customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'delete');
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

test.describe.skip('Wholesale customers test customer', () => {
    let customer: WholesaleCustomersPage;
    let customerPage: CustomerPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let wholesalePrice: string;
    let minimumWholesaleQuantity: string;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new WholesaleCustomersPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createWholesaleCustomer(payloads.createCustomer1, payloads.adminAuth); // todo: need to update customer auth if created wholesale or move to env setup

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
        await customer.assertWholesalePrice(wholesalePrice, minimumWholesaleQuantity);
        await customerPage.paymentOrder();
        await customerPage.loginPage.login(data.customer);
    });
});
