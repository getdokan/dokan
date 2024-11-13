import { test, request, Page } from '@playwright/test';
import { FollowStorePage } from '@pages/followStorePage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

const { CUSTOMER_ID, VENDOR_ID, VENDOR2_ID } = process.env;

test.describe('Follow stores functionality test', () => {
    let vendor: FollowStorePage;
    let customer: FollowStorePage;
    let vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new FollowStorePage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new FollowStorePage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // follow store

    // customer

    test('customer can view followed vendors menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerFollowedVendorsRenderProperly();
    });

    test('customer can view followed vendors', { tag: ['@pro', '@customer'] }, async () => {
        await dbUtils.followVendor(CUSTOMER_ID, VENDOR_ID);
        await customer.customerViewFollowedVendors(data.predefined.vendorStores.vendor1);
    });

    test('customer can follow store on store list page', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.unfollowStore(VENDOR_ID, payloads.customerAuth);
        await customer.followUnfollowStore(data.predefined.vendorStores.vendor1, 'Following', data.predefined.vendorStores.followFromStoreListing);
    });

    test('customer can follow store on single store', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.unfollowStore(VENDOR2_ID, payloads.customerAuth);
        await customer.followUnfollowStore(data.predefined.vendorStores.vendor2, 'Following', data.predefined.vendorStores.followFromSingleStore);
    });

    test('customer can unfollow store on store list page', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.followStore(VENDOR_ID, payloads.customerAuth);
        await customer.followUnfollowStore(data.predefined.vendorStores.vendor1, 'Follow', data.predefined.vendorStores.followFromStoreListing);
    });

    test('customer can unfollow store on single store', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.followStore(VENDOR2_ID, payloads.customerAuth);
        await customer.followUnfollowStore(data.predefined.vendorStores.vendor2, 'Follow', data.predefined.vendorStores.followFromSingleStore);
    });

    //vendor

    test('vendor can view followers menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorFollowersRenderProperly();
    });

    test('vendor can view followers', { tag: ['@pro', '@vendor'] }, async () => {
        await apiUtils.followStore(VENDOR_ID, payloads.customerAuth);
        await vendor.vendorViewFollowers();
    });
});
