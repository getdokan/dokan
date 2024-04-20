import { test, request, Page } from '@playwright/test';
import { ProductReviewsPage } from '@pages/productReviewsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = process.env;

test.describe('Product Reviews test', () => {
    let vendor: ProductReviewsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let reviewMessage: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductReviewsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    //vendor

    test('vendor product reviews menu page is rendering properly', { tag: ['@pro', '@exp', '@v'] }, async () => {
        await vendor.vendorProductReviewsRenderProperly();
    });

    test('vendor can view product review', { tag: ['@pro', '@exp', '@v'] }, async () => {
        await vendor.viewProductReview(reviewMessage);
    });

    test('vendor can unApprove product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('unApprove', reviewMessage);
    });

    test('vendor can spam product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('spam', reviewMessage);
    });

    test('vendor can trash product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('trash', reviewMessage);
    });

    test('vendor can approve product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'hold' }, payloads.vendorAuth);
        await vendor.updateProductReview('approve', reviewMessage);
    });

    test('vendor can restore trashed product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('restore', reviewMessage);
    });

    test('vendor can permanently-delete product review', { tag: ['@pro', '@v'] }, async () => {
        const [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('permanently-delete', reviewMessage);
    });

    test.skip('vendor can perform product reviews bulk action', { tag: ['@pro', '@v'] }, async () => {
        // todo: might cause other tests to fail in parallel
        await vendor.productReviewsBulkActions('hold');
    });
});
