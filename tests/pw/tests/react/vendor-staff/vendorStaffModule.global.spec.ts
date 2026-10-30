import { test, expect } from '../_shared/fixtures';
import { authOf } from '../_shared/seed';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { VendorStaffPage } from './vendorStaffPage';

// Risk: Vendor staff, module switch (#V16 in tests/pw/baseline/failure-modes/vendor-staff.md).
// Deactivating a Pro module is marketplace-wide, so this runs in react_global and always re-activates.

test.describe('Vendor staff module switched off', () => {
    test.beforeAll(async ({ api }) => {
        await api.deactivateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
    });

    test.afterAll(async ({ api }) => {
        await api.activateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
    });

    test('#V16 the Staff screen, menu and REST disappear for vendors', { tag: ['@pro', '@admin', '@vendor', '@p1'] }, async ({ api, vendorPage }) => {
        expect((await api.get(endPoints.getAllVendorStaffs, { headers: authOf('vendor1') }, false))[0].status()).toBe(404);
        const screen = new VendorStaffPage(vendorPage);
        await vendorPage.goto('dashboard/new/#/staffs');
        // A vendor's sidebar lists Products twice (menu and its sub-item).
        await expect(screen.sidebarLink('Products').first()).toBeVisible();
        await expect(screen.sidebarLink('Staff')).toHaveCount(0);
        await expect(vendorPage.locator('#staff-data-view')).toHaveCount(0);
    });
});
