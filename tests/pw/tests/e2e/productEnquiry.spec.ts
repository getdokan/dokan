import { test, request, Page } from '@playwright/test';
import { ProductEnquiryPage } from '@pages/productEnquiryPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Product Enquiry test', () => {
    let admin: ProductEnquiryPage;
    let customer: ProductEnquiryPage;
    let guest: ProductEnquiryPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductEnquiryPage(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ProductEnquiryPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, PRODUCT_ID, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productEnquiry, payloads.adminAuth);
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can enable product enquiry module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductEnquiryModule(data.predefined.simpleProduct.product1.name);
    });

    // customer

    test('customer can enquire product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('guest customer can enquire product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new ProductEnquiryPage(page);
        await guest.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    // admin

    test('admin can disable product enquiry module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productEnquiry, payloads.adminAuth);
        await admin.disableProductEnquiryModule(data.predefined.simpleProduct.product1.name);
    });
});
