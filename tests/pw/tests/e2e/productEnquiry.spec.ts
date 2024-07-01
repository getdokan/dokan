import { test, request, Page } from '@playwright/test';
import { ProductEnquiryPage } from '@pages/productEnquiryPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
// import { payloads } from '@utils/payloads';

const { VENDOR_ID, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Product Enquiry test', () => {
    let customer: ProductEnquiryPage;
    let guest: ProductEnquiryPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ProductEnquiryPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        // const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth); //todo: might not needed
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, PRODUCT_ID, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    test('customer can enquire product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('guest customer can enquire product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new ProductEnquiryPage(page);
        await guest.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });
});
