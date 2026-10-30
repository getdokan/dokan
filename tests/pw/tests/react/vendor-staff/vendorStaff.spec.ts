import { test, expect, withUserPage } from '../_shared/fixtures';
import { authOf, createStaff, setStaffCaps, staffCaps } from '../_shared/seed';
import { endPoints } from '@utils/apiEndPoints';
import { VendorStaffPage } from './vendorStaffPage';

// Risk: P0 Vendor staff (React). Ids (#Vn) refer to tests/pw/baseline/failure-modes/vendor-staff.md.
// Every test uses its own staff member, so tests run in parallel.

const unique = () => `PW-${Date.now()}${Math.floor(Math.random() * 1000)}`;
type StaffRecord = { ID: number; user_email: string; first_name: string; last_name: string };
const vendorStaff = async (api: Parameters<typeof createStaff>[0]) => (await api.get(endPoints.getAllVendorStaffs, { headers: authOf('vendor1'), params: { per_page: 100 } }))[1] as StaffRecord[];

test.describe('Vendor staff management (React)', () => {
    let screen: VendorStaffPage;

    test.beforeEach(async ({ vendorPage }) => {
        screen = new VendorStaffPage(vendorPage);
    });

    test('#V9 vendor creates a staff member and it is saved under the vendor', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const lastName = unique();
        const email = `${lastName.toLowerCase()}@example.com`;
        await screen.gotoCreate();
        await screen.fillForm({ firstName: 'Staff', lastName, email, phone: '0123456789' });
        expect((await screen.submit('Create')).status()).toBeLessThan(400);

        const saved = (await vendorStaff(api)).find(s => s.user_email === email);
        expect(saved, `staff ${email} listed for vendor1`).toBeDefined();
        expect([saved!.first_name, saved!.last_name]).toEqual(['Staff', lastName]);
    });

    test('#V10 vendor edits a staff member and the change is saved', { tag: ['@pro', '@vendor', '@p1'] }, async ({ api }) => {
        const staff = await createStaff(api);
        const lastName = unique();
        await screen.gotoEdit(staff.id);
        await expect(screen.page.locator('#email')).toHaveValue(staff.email);
        await screen.page.locator('#last_name').fill(lastName);
        expect((await screen.submit('Update')).status()).toBeLessThan(400);
        expect((await api.get(endPoints.getSingleVendorStaff(staff.id), { headers: authOf('vendor1') }))[1].last_name).toBe(lastName);
    });

    test('#V11 a permission granted in Manage Permissions is saved and enforced', { tag: ['@pro', '@vendor', '@staff', '@p0'] }, async ({ api }) => {
        const staff = await createStaff(api);
        await screen.gotoPermissions(staff.id);
        await expect(screen.cap('dokan_view_withdraw_menu')).not.toBeChecked();
        await screen.cap('dokan_view_withdraw_menu').check({ force: true });
        await screen.cap('dokan_manage_withdraw').check({ force: true });
        expect((await screen.savePermissions()).status()).toBeLessThan(400);

        const caps = await staffCaps(api, staff.id);
        expect([caps.dokan_view_withdraw_menu, caps.dokan_manage_withdraw]).toEqual([true, true]);
        expect((await api.get(endPoints.getAllWithdraws, { headers: staff.auth }, false))[0].status()).toBe(200);
    });

    test('#V12 reset puts a granted permission back to the default', { tag: ['@pro', '@vendor', '@p1'] }, async ({ api }) => {
        const staff = await createStaff(api);
        await setStaffCaps(api, staff.id, { dokan_view_withdraw_menu: true });
        await screen.gotoPermissions(staff.id);
        await expect(screen.cap('dokan_view_withdraw_menu')).toBeChecked();
        expect((await screen.resetPermissions()).status()).toBeLessThan(400);
        expect((await staffCaps(api, staff.id)).dokan_view_withdraw_menu).not.toBe(true);
    });

    test('#V13 vendor deletes a staff member and the account loses access', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const staff = await createStaff(api);
        await screen.gotoList();
        // The list has no search; it is sorted newest first, so the new staff member is on page 1.
        await expect(screen.row(staff.name)).toHaveCount(1);
        expect((await screen.table.rowAction(screen.row(staff.name), 'Delete')).status()).toBeLessThan(400);

        expect((await vendorStaff(api)).map(s => String(s.ID))).not.toContain(staff.id);
        expect((await api.get(endPoints.getAllProducts, { headers: staff.auth }, false))[0].status()).toBeGreaterThanOrEqual(400);
    });
});

test.describe('What a staff member sees (React)', () => {
    test('#V14 staff without order permissions has no Orders menu and is denied the orders screen', { tag: ['@pro', '@staff', '@p0'] }, async ({ api, browser }) => {
        const staff = await createStaff(api);
        await setStaffCaps(api, staff.id, { dokan_view_order: false, dokan_manage_order: false, dokan_view_order_menu: false });
        await withUserPage(browser, staff, async page => {
            const screen = new VendorStaffPage(page);
            await page.goto('dashboard/new/#/orders');
            await expect(screen.sidebarLink('Products')).toBeVisible();
            await expect(screen.sidebarLink('Orders')).toHaveCount(0);
            await expect(screen.permissionDenied).toBeVisible();
            await expect(page.locator('table tbody tr a').first()).toHaveCount(0);
        });
    });

    test('#V15 staff is denied the staff-management screen', { tag: ['@pro', '@staff', '@p0'] }, async ({ api, browser }) => {
        const staff = await createStaff(api);
        await withUserPage(browser, staff, async page => {
            const screen = new VendorStaffPage(page);
            await page.goto('dashboard/new/#/staffs');
            await expect(screen.permissionDenied).toBeVisible();
            await expect(screen.sidebarLink('Staff')).toHaveCount(0);
            await expect(page.locator('#staff-data-view')).toHaveCount(0);
        });
    });
});
