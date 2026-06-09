import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminVendorEditPage, adminVendorEditData } from './adminVendorEditPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN VENDOR EDIT — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/edit/:id (shared Form
// module, formKey 'dokan-edit-vendor', createForm=false).
//
// ADMIN-ONLY spec. The vendor being edited (and the foreign-email vendor used for
// the availability check) are seeded via the REST API (apiUtils.createStore,
// admin auth) — this spec never drives the vendor UI. Persistence is verified by
// reloading the form AND/OR reading back via apiUtils.getSingleStore.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Vendor edit).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const ids: {
    primary?: string;
    nameTarget?: string;
    phoneTarget?: string;
    toggleTarget?: string;
    commissionTarget?: string;
    discardTarget?: string;
    leaveTarget?: string;
    foreign?: string;
} = {};

// Seed a vendor store (idempotent — createStore updates if it already exists),
// merging Fixed commission fields so the Commission tab pre-fills deterministically.
async function seedVendor(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    // Resolve by EMAIL — it's stable, whereas store_name may have been renamed by a
    // prior run of the rename/leave tests (so getSellerId-by-name would miss and the
    // reset would PUT to /stores/<undefined>). Then reset store_name to the baseline
    // so the read-back assertions are deterministic across reruns.
    const all = await apiUtils.getAllStores(payloads.adminAuth).catch(() => []);
    const match = (Array.isArray(all) ? all : []).find((s: { email?: string }) => (s?.email || '').toLowerCase() === v.email.toLowerCase());
    if (match && (match as { id?: number }).id) {
        const sellerId = String((match as { id: number }).id);
        await apiUtils.updateStore(sellerId, { store_name: v.storeName }, payloads.adminAuth).catch(() => undefined);
        return sellerId;
    }
    const [, id] = await apiUtils.createStore(
        {
            ...payloads.createStore(),
            store_name: v.storeName,
            user_login: v.userLogin,
            email: v.email,
            enabled: true,
            trusted: true,
            featured: false,
            admin_commission_type: 'fixed',
            admin_commission: '10',
            admin_additional_fee: '5',
        },
        payloads.adminAuth,
    );
    return id;
}

test.describe('Admin Vendor Edit functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        ids.primary = await seedVendor(adminVendorEditData.primary);
        ids.nameTarget = await seedVendor(adminVendorEditData.nameTarget);
        ids.phoneTarget = await seedVendor(adminVendorEditData.phoneTarget);
        ids.toggleTarget = await seedVendor(adminVendorEditData.toggleTarget);
        ids.commissionTarget = await seedVendor(adminVendorEditData.commissionTarget);
        ids.discardTarget = await seedVendor(adminVendorEditData.discardTarget);
        ids.leaveTarget = await seedVendor(adminVendorEditData.leaveTarget);
        ids.foreign = await seedVendor(adminVendorEditData.foreign);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let edit: AdminVendorEditPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            edit = new AdminVendorEditPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('edit route mounts the Update Vendor form pre-filled from GET stores/:id', { tag: ['@lite', '@admin'] }, async () => {
            await edit.goto(ids.primary!);
            await expect(edit.reactRoot).toBeVisible();
            await expect(edit.heading).toBeVisible();
            await expect(edit.backLink).toBeVisible();
            expect(await edit.storeNameValue(), 'store name pre-fills from the vendor').toBe(adminVendorEditData.primary.storeName);
            expect(await edit.emailValue(), 'email pre-fills from the vendor').toBe(adminVendorEditData.primary.email);
            expect(await edit.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('edit form hides create-only fields (Store URL, Username, Password, send-email checkbox)', { tag: ['@lite', '@admin'] }, async () => {
            await edit.goto(ids.primary!);
            await expect(edit.storeNameInput).toBeVisible();
            expect(await edit.hasCreateOnlyField('storeUrl'), 'no Store URL input in edit').toBe(false);
            expect(await edit.hasCreateOnlyField('username'), 'no Username input in edit').toBe(false);
            expect(await edit.hasCreateOnlyField('password'), 'no Password input in edit').toBe(false);
            expect(await edit.hasSendEmailCheckbox(), 'no send-email checkbox in edit').toBe(false);
        });

        test('editing Store Name and saving persists via stores/:id and shows the success toast', { tag: ['@lite', '@admin'] }, async () => {
            // Reset to the seeded baseline so reruns are deterministic.
            await apiUtils.updateStore(ids.nameTarget!, { store_name: adminVendorEditData.nameTarget.storeName }, payloads.adminAuth);
            const newName = `${adminVendorEditData.nameTarget.storeName} Edited`;
            await edit.goto(ids.nameTarget!);
            await edit.setStoreName(newName);
            const { status, toast } = await edit.saveAndCaptureToast(ids.nameTarget!, 'Vendor Updated Successfully.');
            expect(status, 'POST stores/:id succeeds').toBeLessThan(300);
            expect(toast, 'success toast appears').toBe(true);
            // Read back via REST — the source of truth for persistence.
            await expect.poll(async () => (await apiUtils.getSingleStore(ids.nameTarget!, payloads.adminAuth))?.store_name, { timeout: 15000 }).toBe(newName);
        });

        test('editing Phone and saving persists the new phone number', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStore(ids.phoneTarget!, { phone: '0123456789' }, payloads.adminAuth);
            const newPhone = '01711223344';
            await edit.goto(ids.phoneTarget!);
            await edit.setPhone(newPhone);
            const status = await edit.saveAndWaitForUpdate(ids.phoneTarget!);
            expect(status, 'POST stores/:id succeeds').toBeLessThan(300);
            await expect.poll(async () => (await apiUtils.getSingleStore(ids.phoneTarget!, payloads.adminAuth))?.phone, { timeout: 15000 }).toBe(newPhone);
        });

        test('toggling Make Vendor Featured and saving persists the featured flag', { tag: ['@lite', '@admin'] }, async () => {
            // Start from a known state (featured off) so the toggle flips on.
            await apiUtils.updateStore(ids.toggleTarget!, { featured: false }, payloads.adminAuth);
            await edit.goto(ids.toggleTarget!);
            await edit.toggle('Make Vendor Featured');
            const status = await edit.saveAndWaitForUpdate(ids.toggleTarget!);
            expect(status, 'POST stores/:id succeeds').toBeLessThan(300);
            await expect.poll(async () => Boolean((await apiUtils.getSingleStore(ids.toggleTarget!, payloads.adminAuth))?.featured), { timeout: 15000 }).toBe(true);
        });

        test.fixme('Commission tab Fixed type pre-fills and persists percentage + additional fee', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await apiUtils.updateStore(ids.commissionTarget!, { admin_commission_type: 'fixed', admin_commission: '10', admin_additional_fee: '5' }, payloads.adminAuth);
            await edit.goto(ids.commissionTarget!);
            await edit.openTab('Commission');
            await edit.setFixedCommission('15', '7');
            const status = await edit.saveAndWaitForUpdate(ids.commissionTarget!);
            expect(status, 'POST stores/:id succeeds').toBeLessThan(300);
            await expect.poll(async () => String((await apiUtils.getSingleStore(ids.commissionTarget!, payloads.adminAuth))?.admin_commission), { timeout: 15000 }).toBe('15');
        });

        test('Discard is disabled until dirty and reverts edits to the loaded vendor', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStore(ids.discardTarget!, { store_name: adminVendorEditData.discardTarget.storeName }, payloads.adminAuth);
            await edit.goto(ids.discardTarget!);
            expect(await edit.isDiscardEnabled(), 'Discard disabled on a pristine form').toBe(false);
            await edit.setStoreName(`${adminVendorEditData.discardTarget.storeName} Dirty`);
            expect(await edit.isDiscardEnabled(), 'Discard enables once the form is dirty').toBe(true);
            await edit.discard();
            expect(await edit.storeNameValue(), 'Discard reverts the store name').toBe(adminVendorEditData.discardTarget.storeName);
            expect(await edit.isDiscardEnabled(), 'Discard disables again after revert').toBe(false);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let edit: AdminVendorEditPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            edit = new AdminVendorEditPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Phone input strips disallowed characters, keeping only digits and . - _ ( ) +', { tag: ['@lite', '@admin'] }, async () => {
            await edit.goto(ids.primary!);
            await edit.typePhone('abc+1 (555) 12.3');
            const value = await edit.phoneValue();
            expect(/[a-zA-Z\s]/.test(value), 'no letters or whitespace remain in the phone field').toBe(false);
            expect(value, 'allowed characters survive sanitization').toBe('+1(555)12.3');
        });

        test('reloading directly on the edit route re-fetches and renders the form', { tag: ['@lite', '@admin'] }, async () => {
            await edit.goto(ids.primary!);
            await edit.reload();
            expect(page.url()).toMatch(/#\/vendors\/edit\/\d+/);
            await expect(edit.puiRoot).toBeVisible();
            await expect(edit.heading).toBeVisible();
            expect(await edit.storeNameValue(), 'form re-populates after reload').toBe(adminVendorEditData.primary.storeName);
        });

        // @exploratory: observed live — clicking the in-app "Vendor" back-link with
        // unsaved changes navigates straight to #/vendors/:id with NO leave-confirm
        // modal. The unsaved-changes guard appears to cover only browser
        // refresh/close (beforeunload), not React-Router link clicks — a product
        // behaviour to confirm. Excluded from the gate until the real guarded path
        // (or the product fix) is pinned down.
        test.fixme('navigating away with unsaved changes opens the leave-confirm modal and stays on the page', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await edit.goto(ids.leaveTarget!);
            await edit.setStoreName(`${adminVendorEditData.leaveTarget.storeName} Unsaved`);
            // Click the back-link to attempt a hash navigation away from the edit route.
            await edit.backLink.click();
            expect(await edit.isLeaveModalVisible(), 'leave-confirm modal appears').toBe(true);
            // The hashchange guard reverts the hash to keep us on the edit route.
            expect(page.url()).toMatch(/#\/vendors\/edit\/\d+/);
            await edit.stayOnPage();
            expect(page.url(), 'Stay keeps us on the edit route').toMatch(/#\/vendors\/edit\/\d+/);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let edit: AdminVendorEditPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            edit = new AdminVendorEditPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('clearing required Store Name blocks save (no stores/:id POST is sent)', { tag: ['@lite', '@admin'] }, async () => {
            await edit.goto(ids.primary!);
            await edit.setStoreName('');
            // Click Save, then assert no POST stores/:id fires within the window —
            // validateForm short-circuits before requestEditVendor when required fields are empty.
            await edit.save();
            const posted = await page
                .waitForResponse(resp => new RegExp(`/dokan/v1/stores/${ids.primary}\\b`).test(resp.url()) && resp.request().method() === 'POST', { timeout: 4000 })
                .then(() => true)
                .catch(() => false);
            expect(posted, 'validation blocks the save POST when Store Name is empty').toBe(false);
            expect(await edit.hasToast('Store Name is required'), 'inline required error is shown').toBe(true);
        });

        test('a logged-in vendor cannot access the admin vendor-edit route', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vedit = new AdminVendorEditPage(vpage);
            await vpage.goto(vedit.editUrl(ids.primary!));
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vedit.isAccessDenied(), 'a vendor must not see the admin vendor-edit UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot access the admin vendor-edit route', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const cedit = new AdminVendorEditPage(cpage);
            await cpage.goto(cedit.editUrl(ids.primary!));
            await cpage.waitForLoadState('domcontentloaded');
            expect(await cedit.isAccessDenied(), 'a customer must not see the admin vendor-edit UI').toBe(true);
            await cctx.close();
        });
    });
});
