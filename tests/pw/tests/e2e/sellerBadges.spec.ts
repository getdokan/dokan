import { test, request, Page } from '@playwright/test';
import { SellerBadgesPage } from '@pages/sellerBadgesPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Seller badge test', () => {
    let admin: SellerBadgesPage;
    let vendor: SellerBadgesPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new SellerBadgesPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new SellerBadgesPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createSellerBadge(payloads.createSellerBadgeProductsPublished, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view seller badge menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminSellerBadgeRenderProperly();
    });

    test('admin can preview seller badge', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.previewSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can view seller badge details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.viewSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can search seller badge', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can create seller badge', { tag: ['@pro', '@admin'] }, async () => {
        await admin.createSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.numberOfItemsSold });
    });

    test('admin can edit seller badge', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.productsPublished });
    });

    test.skip('admin can filter vendors by seller badge', { tag: ['@pro', '@admin'] }, async () => {
        // todo: need to wait 1 min after badge create; run via background process;
        await admin.filterVendorsByBadge(data.sellerBadge.eventName.productsPublished);
    });

    test.skip('admin can view seller badge vendors', { tag: ['@pro', '@admin'] }, async () => {
        // todo: need to wait 1 min after badge create; run via background process;
        await admin.sellerBadgeVendors(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can view seller badges acquired by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.sellerBadgeAcquiredByVendor(data.predefined.vendorStores.vendor1);
    });

    test('admin can update seller badge status', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'draft');
    });

    test('admin can delete seller badge', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'delete');
    });

    test('admin can perform bulk action on seller badges', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeFeatureProducts, payloads.adminAuth);
        await admin.sellerBadgeBulkAction('delete', data.sellerBadge.eventName.featuredProducts);
    });

    // vendor

    test('vendor can view badges menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorSellerBadgeRenderProperly();
    });

    test('vendor can view badge acquired congratulation popup message action', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.sellerBadgeCongratsPopup();
    });

    test('vendor can search seller badge', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorSearchSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('vendor can filter seller badges', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterSellerBadges('available_badges');
    });
});
