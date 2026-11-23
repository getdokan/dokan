import { test, Page } from '@utils/test';
import { ProductEnquiryPage, ApiUtils, data, dbData, dbUtils, payloads } from './productEnquiryPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { VENDOR_ID, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Product Enquiry test', () => {
    let admin: ProductEnquiryPage;
    let customer: ProductEnquiryPage;
    let guest: ProductEnquiryPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductEnquiryPage(aPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new ProductEnquiryPage(cPage);
        apiUtils = new ApiUtils(null);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, PRODUCT_ID, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productEnquiry, payloads.adminAuth);
        await aPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable product enquiry module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductEnquiryModule(data.predefined.simpleProduct.product1.name);
    });

    test('customer can enquire product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('guest customer can enquire product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new ProductEnquiryPage(page);
        await guest.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('admin can disable product enquiry module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productEnquiry, payloads.adminAuth);
        await admin.disableProductEnquiryModule(data.predefined.simpleProduct.product1.name);
    });
});
