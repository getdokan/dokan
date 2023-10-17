import { test, Page } from '@playwright/test';
import { VendorStaffPage } from '@pages/vendorStaffPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor staff test', () => {
    let vendor: VendorStaffPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const staff = data.staff();

    test.beforeAll(async ({ browser, request }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorStaffPage(vPage);

        apiUtils = new ApiUtils(request);
        await apiUtils.createVendorStaff({...payloads.createStaff(), first_name: staff.firstName, last_name: staff.lastName}, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor staff menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorStaffRenderProperly();
    });

    test('vendor can add new staff @pro', async () => {
        await vendor.addStaff(data.staff());
    });

    test('vendor can edit staff @pro', async () => {
        await vendor.editStaff(staff);
    });

    test('vendor can manage staff permission @pro', async () => {
        await vendor.manageStaffPermission(staff.firstName + ' ' + staff.lastName);
    });

    test('vendor can delete staff @pro', async () => {
        await vendor.deleteStaff(staff.firstName + ' ' + staff.lastName);
    });
});
