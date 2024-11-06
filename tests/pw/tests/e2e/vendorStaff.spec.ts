import { test, request, Page } from '@playwright/test';
import { VendorStaffPage } from '@pages/vendorStaffPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor staff test (vendor)', () => {
    let vendor: VendorStaffPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const staff = data.staff();

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorStaffPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createVendorStaff({ ...payloads.createStaff(), first_name: staff.firstName, last_name: staff.lastName }, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    test('vendor can view staff menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorStaffRenderProperly();
    });

    test('vendor can add new staff', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addStaff(data.staff());
    });

    test('vendor can edit staff', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editStaff(staff);
    });

    test('vendor can manage staff permission', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.manageStaffPermission(staff.firstName + ' ' + staff.lastName);
    });

    test('vendor can delete staff', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.deleteStaff(staff.firstName + ' ' + staff.lastName);
    });
});

test.describe('Vendor staff test (vendorStaff)', () => {
    let staff: VendorStaffPage;
    let sPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        apiUtils = new ApiUtils(await request.newContext());

        const [, staffId, staffName] = await apiUtils.createVendorStaff(payloads.createStaff(), payloads.vendorAuth);
        const staffContext = await browser.newContext(data.header.userAuth(staffName));
        sPage = await staffContext.newPage();
        staff = new VendorStaffPage(sPage);

        const payload = createPayload(data.vendorStaff.basicMenu);
        await apiUtils.updateStaffCapabilities(staffId, payload, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await sPage.close();
    });

    test('VendorStaff can view allowed menus', { tag: ['@pro', '@staff'] }, async () => {
        await staff.viewPermittedMenus(data.vendorStaff.basicMenuNames);
    });
});

function createPayload(capabilitiesArray: string[], access = true) {
    return {
        capabilities: capabilitiesArray.map(capability => ({
            capability: capability,
            access: access,
        })),
    };
}
