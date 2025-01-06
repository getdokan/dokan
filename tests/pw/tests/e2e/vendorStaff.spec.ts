import { test, request, Page } from '@playwright/test';
import { VendorStaffPage } from '@pages/vendorStaffPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor staff test (vendor)', () => {
    let admin: VendorStaffPage;
    let vendor: VendorStaffPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    const staff = data.staff();

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorStaffPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorStaffPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createVendorStaff({ ...payloads.createStaff(), first_name: staff.firstName, last_name: staff.lastName }, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    test('admin can enable vendor staff manager module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableVendorStaffModule();
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
    let admin: VendorStaffPage;
    let staff: VendorStaffPage;
    let aPage: Page, sPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorStaffPage(aPage);

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

    test('admin can disable vendor staff manager module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
        await admin.disableVendorStaffModule();
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
