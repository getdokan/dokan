import { test, request, Page } from '@playwright/test';
import { FollowStorePage } from '@pages/followStorePage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

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
        await apiUtils.followUnfollowStore(VENDOR_ID, payloads.customerAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // follow store

    // customer

    test('customer followed vendors menu page is rendering properly @pro @exp @c', async () => {
        await customer.customerFollowedVendorsRenderProperly();
    });

    test('customer can follow store on store listing @pro @c', async () => {
        await customer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromStoreListing);
    });

    test('customer can follow store on single store @pro @c', async () => {
        await customer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromSingleStore);
    });

    //vendor

    test('vendor followers menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorFollowersRenderProperly();
    });

    test('vendor can view followers @pro @v', async () => {
        await vendor.vendorViewFollowers();
    });
});
