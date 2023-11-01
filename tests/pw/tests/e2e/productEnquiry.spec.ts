import { test, Page } from '@playwright/test';
import { ProductEnquiryPage } from '@pages/productEnquiryPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID, CUSTOMER_ID } = data.env;

test.describe('Product Enquiry test', () => {
    // let admin: ProductEnquiryPage;
    let customer: ProductEnquiryPage;
    let guest: ProductEnquiryPage;
    let cPage: Page, uPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        // const adminContext = await browser.newContext(data.auth.adminAuth);
        // aPage = await adminContext.newPage();
        // admin = new ProductEnquiryPage(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ProductEnquiryPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        uPage = await guestContext.newPage();
        guest = new ProductEnquiryPage(uPage);

        apiUtils = new ApiUtils(request);
        const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await cPage.close();
        await uPage.close();
    });

    test('customer can enquire product @pro', async () => {
        await customer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('guest customer can enquire product @pro', async () => {
        await guest.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });
});
