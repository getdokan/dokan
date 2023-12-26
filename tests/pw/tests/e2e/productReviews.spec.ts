import { test, Page } from '@playwright/test';
import { ProductReviewsPage } from '@pages/productReviewsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = global as any;

test.describe('Product Reviews test', () => {
    let vendor: ProductReviewsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let reviewMessage: string;

    test.beforeAll(async ({ browser, request }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductReviewsPage(vPage);

        apiUtils = new ApiUtils(request);
        [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor product reviews menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorProductReviewsRenderProperly();
    });

    test('vendor can view product review @pro @explo', async () => {
        await vendor.viewProductReview(reviewMessage);
    });

    test('vendor can unApprove product review @pro', async () => {
        await vendor.updateProductReview('unApprove', reviewMessage);
    });

    test('vendor can spam product review @pro', async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('spam', reviewMessage);
    });

    test('vendor can trash product review @pro', async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('trash', reviewMessage);
    });

    test('vendor can approve product review @pro', async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'hold' }, payloads.vendorAuth);
        await vendor.updateProductReview('approve', reviewMessage);
    });

    test('vendor can restore trashed product review @pro', async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('restore', reviewMessage);
    });

    test('vendor can permanently-delete product review @pro', async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('permanently-delete', reviewMessage);
    });

    test('vendor can perform product reviews bulk action @pro', async () => {
        await vendor.productReviewsBulkActions('hold');
    });
});
