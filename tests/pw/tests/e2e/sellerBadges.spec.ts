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

    test('dokan seller badge menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminSellerBadgeRenderProperly();
    });

    test('admin can preview seller badge @pro @exp @a', async () => {
        await admin.previewSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can view seller badge details @pro @exp @a', async () => {
        await admin.viewSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can search seller badge @pro @a', async () => {
        await admin.searchSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can create seller badge @pro @a', async () => {
        await admin.createSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.numberOfItemsSold });
    });

    test('admin can edit seller badge @pro @a', async () => {
        await admin.editSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.productsPublished });
    });

    test.skip('admin can filter vendors by seller badge @pro @a', async () => {
        await admin.filterVendorsByBadge(data.sellerBadge.eventName.productsPublished);
    });

    test.skip('admin can view seller badge vendors @pro @a', async () => {
        await admin.sellerBadgeVendors(data.sellerBadge.eventName.productsPublished);
    });

    test('admin can view seller badges acquired by vendor @pro @a', async () => {
        await admin.sellerBadgeAcquiredByVendor(data.predefined.vendorStores.vendor1);
    });

    test('admin can update seller badge status @pro @a', async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'draft');
    });

    test('admin can delete seller badge @pro @a', async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'delete');
    });

    test('admin can perform seller badge bulk action @pro @a', async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeFeatureProducts, payloads.adminAuth);
        await admin.sellerBadgeBulkAction('delete', data.sellerBadge.eventName.featuredProducts);
    });

    // vendor

    test('vendor badges menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorSellerBadgeRenderProperly();
    });

    test('vendor can view badge acquired congratulation popup message action @pro @v', async () => {
        await vendor.sellerBadgeCongratsPopup();
    });

    test('vendor can search seller badge @pro @v', async () => {
        await vendor.vendorSearchSellerBadge(data.sellerBadge.eventName.productsPublished);
    });

    test('vendor can filter seller badges @pro @v', async () => {
        await vendor.filterSellerBadges('available_badges');
    });
});
