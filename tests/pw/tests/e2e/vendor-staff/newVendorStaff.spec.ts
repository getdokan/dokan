import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewVendorStaffPage, newVendorStaffSelectors } from './newVendorStaffPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the React vendor Staff feature (Pro module vendor_staff).
// Surfaces: /dashboard/new/#/staffs(+/create, /update/:id, /permissions/:id).
// Ported from the legacy `vendor-staff` spec (a 100% no-op stub — legacy green
// is vacuous), driving the React UI. Staff menu-visibility is re-targeted to the
// React sidebar; the admin module-toggle motive is a REST-driven business flow.
// ============================================

const { USER_PASSWORD } = process.env;

let apiUtils: ApiUtils;
let staff1Name: string;
let staff1Email: string;
const createdIds: string[] = [];

const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** A staff payload with a matchable unique full name and a known password. */
function uniqueStaff(label: string): { username: string; first_name: string; last_name: string; email: string; phone: string; password: string } {
    const base = payloads.createStaff();
    return { ...base, first_name: 'Staff', last_name: `PW-${label}-${stamp()}`, password: String(USER_PASSWORD) };
}

async function seedStaff(label: string): Promise<{ id: string; name: string; email: string; username: string; password: string }> {
    const payload = uniqueStaff(label);
    const [, id] = await apiUtils.createVendorStaff(payload, payloads.vendorAuth);
    createdIds.push(id);
    return { id, name: `${payload.first_name} ${payload.last_name}`, email: payload.email, username: payload.username, password: payload.password };
}

async function deleteStaff(id: string): Promise<void> {
    await apiUtils.delete(endPoints.deleteVendorStaff(id), { data: { id, force: true }, headers: payloads.vendorAuth }).catch(() => undefined);
}

test.describe('Vendor Staff (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
        // Dedupe: remove leftover PW- staff so page-1 (order=desc) ordering + row
        // assertions stay deterministic on the shared DB.
        const all = await apiUtils.getAllVendorStaffs(payloads.vendorAuth).catch(() => []);
        for (const s of Array.isArray(all) ? all : []) {
            if (String(s?.last_name ?? '').startsWith('PW-')) await deleteStaff(String(s.ID ?? s.id));
        }
        const seeded = await seedStaff('base');
        staff1Name = seeded.name;
        staff1Email = seeded.email;
    });

    test.afterAll(async () => {
        for (const id of createdIds) await deleteStaff(id);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let staff: NewVendorStaffPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            staff = new NewVendorStaffPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the staff list with the seeded staff (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await staff.gotoList();
            expect(page.url(), 'on the /staffs route').toMatch(/#\/staffs/);
            await expect(staff.heading, 'the "Staff" header renders').toBeVisible({ timeout: 15000 });
            await expect(staff.rowByName(staff1Name), 'seeded staff row is listed').toBeVisible({ timeout: 15000 });
            expect(await staff.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can add a new staff member (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const s = uniqueStaff('add');
            await staff.gotoCreate();
            await staff.fillStaffForm({ firstName: s.first_name, lastName: s.last_name, email: s.email, phone: '0123456789' });
            await staff.submitCreate();
            // Behavioral oracle: the create POST (gated in submitCreate) landed and the
            // new staff renders in the React list (order=desc → newest is on page 1).
            await staff.gotoList();
            await expect(staff.rowByName(`${s.first_name} ${s.last_name}`), 'new staff appears in the list').toBeVisible({ timeout: 15000 });
            // Best-effort cleanup tracking (match by user_email; the beforeAll dedupe
            // also sweeps leftover PW- staff, so a paginated miss here is harmless).
            const all = await apiUtils.getAllVendorStaffs(payloads.vendorAuth).catch(() => []);
            const found = (Array.isArray(all) ? all : []).find((x: { user_email?: string; ID?: number; id?: number }) => String(x.user_email ?? '').toLowerCase() === s.email.toLowerCase());
            if (found) createdIds.push(String(found.ID ?? found.id));
        });

        test('vendor can edit a staff member (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const target = await seedStaff('edit');
            const newLast = `PW-edited-${stamp()}`;
            await staff.gotoEdit(target.id);
            expect(await staff.getEmailFieldValue(), 'edit form is prefilled with the staff email').toBe(target.email);
            await page.locator(newVendorStaffSelectors.lastNameInput).fill(newLast);
            await staff.submitUpdate();
            // REST oracle: the last name changed.
            const [, body] = await apiUtils.get(`${endPoints.deleteVendorStaff(target.id)}`, { headers: payloads.vendorAuth }, false);
            expect(String(body?.last_name ?? ''), 'edited last name persisted (REST)').toBe(newLast);
        });

        test('vendor can grant a staff permission (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const target = await seedStaff('perm');
            await staff.gotoPermissions(target.id);
            // Withdraw menu is NOT a default staff capability.
            expect(await staff.isCapChecked('dokan_view_withdraw_menu'), 'withdraw menu cap starts unchecked').toBe(false);
            await staff.setCap('dokan_view_withdraw_menu', true);
            await staff.savePermissions();
            // REST oracle: the capability is now granted (present AND truthy).
            const [, caps] = await apiUtils.get(`${endPoints.deleteVendorStaff(target.id)}/capabilities`, { headers: payloads.vendorAuth }, false);
            const map = (caps ?? {}) as Record<string, boolean>;
            expect(Boolean(map['dokan_view_withdraw_menu']), 'withdraw menu cap granted (REST)').toBe(true);
        });

        test('vendor can reset staff permissions to defaults (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const target = await seedStaff('reset');
            // Grant a non-default cap first (via REST) so reset has something to revoke.
            await apiUtils.updateStaffCapabilities(target.id, { capabilities: [{ capability: 'dokan_view_withdraw_menu', access: true }] }, payloads.vendorAuth);
            await staff.gotoPermissions(target.id);
            expect(await staff.isCapChecked('dokan_view_withdraw_menu'), 'granted cap is checked before reset').toBe(true);
            await staff.resetPermissions();
            // REST oracle: the withdraw cap is gone; a default cap remains.
            const [, caps] = await apiUtils.get(`${endPoints.deleteVendorStaff(target.id)}/capabilities`, { headers: payloads.vendorAuth }, false);
            const map = (caps ?? {}) as Record<string, boolean>;
            expect(Boolean(map['dokan_view_withdraw_menu']), 'withdraw cap revoked by reset (REST)').toBe(false);
        });

        test('vendor can delete a staff member (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const target = await seedStaff('del');
            await staff.gotoList();
            await staff.deleteStaffByName(target.name);
            // REST oracle: the staff no longer resolves.
            const id = await apiUtils.getStaffId(target.username, payloads.vendorAuth);
            expect(id, 'deleted staff no longer resolves (REST)').toBeFalsy();
        });

        test('the staff Name link opens the edit form (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await staff.gotoList();
            await staff.openStaffByName(staff1Name);
            expect(page.url(), 'navigated to the edit route').toMatch(/#\/staffs\/update\/\d+/);
            expect(await staff.getEmailFieldValue(), 'edit form prefilled with the seeded email').toBe(staff1Email);
        });

        test('the row Actions menu offers Edit / Manage / Delete (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await staff.gotoList();
            const items = await staff.rowActionItems(staff1Name);
            expect(items, 'row actions include Edit, Manage and Delete').toEqual(expect.arrayContaining(['Edit', 'Manage', 'Delete']));
        });

        test('HashRouter survives a reload on /staffs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await staff.gotoList();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newVendorStaffSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            expect(page.url(), 'reload keeps the #/staffs route').toMatch(/#\/staffs/);
            expect(await staff.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('staff (menu visibility)', () => {
        let staffActor: { id: string; name: string; email: string; username: string; password: string };

        test.beforeAll(async () => {
            staffActor = await seedStaff('actor');
        });

        test('staff with default permissions sees only permitted menus in the React sidebar (React)', { tag: ['@pro', '@staff', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext();
            const page = await ctx.newPage();
            const staff = new NewVendorStaffPage(page);
            try {
                await staff.frontendLogin(staffActor.username, staffActor.password);
                await staff.gotoDashboardRoot();
                await expect(page.locator(newVendorStaffSelectors.sidebar), 'staff sees the vendor dashboard sidebar').toBeVisible({ timeout: 20000 });
                await expect(staff.sidebarLink('Products'), 'Products menu (default cap) is visible to staff').toBeVisible({ timeout: 10000 });
                await expect(staff.sidebarLink('Orders'), 'Orders menu (default cap) is visible to staff').toBeVisible({ timeout: 10000 });
                await expect(staff.sidebarLink('Withdraw'), 'Withdraw menu (no default cap) is hidden from staff').toHaveCount(0);
                await expect(staff.sidebarLink('Staff'), 'Staff-management menu is hidden from staff').toHaveCount(0);
            } finally {
                await page.close();
                await ctx.close();
            }
        });

        test('staff gains a sidebar menu when the vendor grants the capability (React)', { tag: ['@pro', '@staff', '@vendor', '@new-ui'] }, async ({ browser }) => {
            const actor = await seedStaff('grant');
            const ctx = await browser.newContext();
            const page = await ctx.newPage();
            const staff = new NewVendorStaffPage(page);
            try {
                await staff.frontendLogin(actor.username, actor.password);
                await staff.gotoDashboardRoot();
                await expect(staff.sidebarLink('Withdraw'), 'Withdraw menu absent before the grant').toHaveCount(0);
                // Vendor grants the capability via REST.
                await apiUtils.updateStaffCapabilities(actor.id, { capabilities: [{ capability: 'dokan_view_withdraw_menu', access: true }] }, payloads.vendorAuth);
                await staff.gotoDashboardRoot();
                await expect(staff.sidebarLink('Withdraw'), 'Withdraw menu appears after the vendor grants the capability').toBeVisible({ timeout: 15000 });
            } finally {
                await page.close();
                await ctx.close();
            }
        });

        test('staff cannot access the staff-management route (React)', { tag: ['@pro', '@staff', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext();
            const page = await ctx.newPage();
            const staff = new NewVendorStaffPage(page);
            try {
                await staff.frontendLogin(staffActor.username, staffActor.password);
                await page.goto(staff.listUrl);
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(2500);
                await expect(page.locator(newVendorStaffSelectors.permissionDenied), 'staff is denied the staff-management route').toBeVisible({ timeout: 15000 });
                await expect(page.locator(newVendorStaffSelectors.listContainer), 'the staff list table does not render for a staff user').toHaveCount(0);
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });

    // ---------------------------------------------------------------
    test.describe('admin (module gate)', () => {
        test('deactivating the vendor-staff module removes the Staff route from the vendor dashboard (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const staff = new NewVendorStaffPage(page);
            try {
                // Admin deactivates the module via REST.
                await apiUtils.deactivateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
                await staff.gotoDashboardRoot();
                await expect(staff.sidebarLink('Staff'), 'Staff menu removed from the sidebar when the module is off').toHaveCount(0);
            } finally {
                // Always restore the module (other specs depend on it being active).
                await apiUtils.activateModules(payloads.moduleIds.vendorStaff, payloads.adminAuth);
                await page.close();
                await ctx.close();
            }

            // Re-activation restores the Staff menu (assert, not just fire).
            const ctx2 = await browser.newContext({ storageState: v1 });
            const page2 = await ctx2.newPage();
            const staff2 = new NewVendorStaffPage(page2);
            try {
                await staff2.gotoDashboardRoot();
                await expect(staff2.sidebarLink('Staff'), 'Staff menu returns after the module is re-activated').toBeVisible({ timeout: 15000 });
            } finally {
                await page2.close();
                await ctx2.close();
            }
        });
    });
});
