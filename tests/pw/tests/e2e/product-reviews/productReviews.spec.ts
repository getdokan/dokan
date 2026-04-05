import { test, Page } from '@playwright/test';
import { ProductReviewsPage, ApiUtils, payloads } from './productReviewsPage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const { PRODUCT_ID } = process.env;

test.describe.skip('Product Reviews test', () => {
    let vendor: ProductReviewsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let reviewMessage: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductReviewsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('vendor can view product reviews menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorProductReviewsRenderProperly(); });
    test('vendor can view product review', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.viewProductReview(reviewMessage); });

    test('vendor can unApprove product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('unApprove', m);
    });

    test('vendor can spam product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('spam', m);
    });

    test('vendor can trash product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('trash', m);
    });

    test('vendor can approve product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'hold' }, payloads.vendorAuth);
        await vendor.updateProductReview('approve', m);
    });

    test('vendor can restore trashed product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('restore', m);
    });

    test('vendor can permanently-delete product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('permanently-delete', m);
    });

    test('vendor can perform bulk action on product reviews', { tag: ['@pro', '@vendor', '@serial'] }, async () => {
        await vendor.productReviewsBulkActions('hold');
    });
});
