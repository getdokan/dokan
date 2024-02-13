import { test, request, Page } from '@playwright/test';
import { ProductEnquiryPage } from '@pages/productEnquiryPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe('Product Enquiry test', () => {
    let customer: ProductEnquiryPage;
    let guest: ProductEnquiryPage;
    let cPage: Page, gPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ProductEnquiryPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        gPage = await guestContext.newPage();
        guest = new ProductEnquiryPage(gPage);

        apiUtils = new ApiUtils(await request.newContext());
        const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await cPage.close();
        await gPage.close();
        await apiUtils.dispose();
    });

    test('customer can enquire product @pro @c', async () => {
        await customer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });

    test('guest customer can enquire product @pro @g', async () => {
        await guest.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
    });
});
