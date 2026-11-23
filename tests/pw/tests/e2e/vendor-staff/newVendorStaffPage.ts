import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    PHP_FATAL,
    DATA_ROW_ANY,
    actionMenuItem as dvActionMenuItem,
    waitForRootReady as dvWaitForRootReady,
    waitForListReady as dvWaitForListReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    openRowActionMenu,
    clickActionMenuItem as dvClickActionMenuItem,
    dataViewsConfirm,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React Staff surface (Dokan Pro, module vendor_staff).
// Surfaces:
//   /dashboard/new/#/staffs                 → DataViews staff list (no search, no tabs)
//                                             (dokan-pro/modules/vendor-staff/src/js/
//                                              components/StaffList.tsx)
//   /dashboard/new/#/staffs/create          → create form (CreateStaff.tsx)
//   /dashboard/new/#/staffs/update/:id      → edit form (CreateStaff.tsx, edit mode)
//   /dashboard/new/#/staffs/permissions/:id → capability checkboxes (ManagePermissions.tsx)
// The DataViews wrapper renders id="staff-data-view". The Name cell is a DokanLink →
// /staffs/update/{id}. Row actions: Edit / Manage / Delete (destructive alertdialog).
// The Phone field is a cleave.js MaskedInput → type with pressSequentially, not fill().
// Capability checkboxes have input.id === the capability key. The staff sidebar
// (aside.dokan-frontend-sidebar) is server-filtered by capability, so unpermitted
// menu links simply do not render.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (shared DataViews primitives from @utils/dataViews).
// ============================================
export const newVendorStaffSelectors = {
    reactRoot: REACT_ROOT,

    // ---- List ----
    listContainer: '#staff-data-view',
    heading: 'h3:has-text("Staff")',
    addNewStaffButton: 'button:has-text("Add New Staff")',
    dataRow: DATA_ROW_ANY,
    // The Name cell is a clickable div (class="!dokan-link ... cursor-pointer",
    // Tailwind important prefix — NOT an <a>) that navigates to the edit route.
    nameLink: '[class*="dokan-link"]',
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    // Destructive delete confirm (plugin-ui AlertDialog).
    deleteConfirmBtn: '[data-slot="alert-dialog-content"] [data-slot="alert-dialog-action"]',
    emptyState: 'text=/no data found|no staff|nothing to show/i',
    successToast: 'div[role="status"]',

    // ---- Create / edit form ----
    firstNameInput: '#first_name',
    lastNameInput: '#last_name',
    emailInput: '#email',
    phoneInput: '#phone',
    createButton: 'button:has-text("Create")',
    updateButton: 'button:has-text("Update")',

    // ---- Permissions ----
    capCheckbox: (cap: string): string => `#${cap}`,
    savePermissionsButton: 'button:has-text("Save Permissions")',
    resetButton: 'button:has-text("Reset")',
    resetConfirmButton: 'button:has-text("Yes, Reset")',

    // ---- Sidebar (staff menu-visibility) ----
    sidebar: 'aside.dokan-frontend-sidebar',
    sidebarLink: (name: string): string => `aside.dokan-frontend-sidebar nav a:has(span:text-is("${name}"))`,

    // ---- Access-control states ----
    permissionDenied: 'h1:has-text("Permission Denied")',
    notFound: 'text=/the page can.?t be found/i',

    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    staffRest: /dokan\/v[0-9]+\/vendor-staff\b/i,
    capabilitiesRest: /dokan\/v[0-9]+\/vendor-staff\/\d+\/capabilities/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor Staff (Dokan Pro).
// ============================================
export class NewVendorStaffPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/staffs');
    readonly createUrl = toPath('dashboard/new/#/staffs/create');
    readonly dashboardUrl = toPath('dashboard/new/');
    updateUrl(id: string | number): string {
        return toPath(`dashboard/new/#/staffs/update/${id}`);
    }
    permissionsUrl(id: string | number): string {
        return toPath(`dashboard/new/#/staffs/permissions/${id}`);
    }

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator {
        return this.page.locator(newVendorStaffSelectors.heading).first();
    }
    get addNewStaffButton(): Locator {
        return this.page.locator(newVendorStaffSelectors.addNewStaffButton).first();
    }
    get createButton(): Locator {
        return this.page.locator(newVendorStaffSelectors.createButton).first();
    }
    get updateButton(): Locator {
        return this.page.locator(newVendorStaffSelectors.updateButton).first();
    }
    get savePermissionsButton(): Locator {
        return this.page.locator(newVendorStaffSelectors.savePermissionsButton).first();
    }
    rowByName(name: string): Locator {
        return this.page.locator(newVendorStaffSelectors.dataRow).filter({ hasText: name }).first();
    }
    rowsWithText(text: string): Locator {
        return this.page.locator(newVendorStaffSelectors.dataRow).filter({ hasText: text });
    }
    sidebarLink(name: string): Locator {
        return this.page.locator(newVendorStaffSelectors.sidebarLink(name)).first();
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await dvWaitForListReady(this.page, {
            rowSelector: newVendorStaffSelectors.dataRow,
            emptyState: newVendorStaffSelectors.emptyState,
            extraReady: () => this.heading.isVisible(),
        });
    }

    async gotoCreate(): Promise<void> {
        await this.page.goto(this.createUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page.locator(newVendorStaffSelectors.firstNameInput).first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async gotoEdit(id: string | number): Promise<void> {
        await this.page.goto(this.updateUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page.locator(newVendorStaffSelectors.emailInput).first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async gotoPermissions(id: string | number): Promise<void> {
        await this.page.goto(this.permissionsUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.savePermissionsButton.waitFor({ state: 'visible', timeout: 20000 });
    }

    async gotoDashboardRoot(): Promise<void> {
        await this.page.goto(this.dashboardUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page).catch(() => undefined);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- Form actions ----
    async fillStaffForm(data: { firstName: string; lastName: string; email: string; phone?: string }): Promise<void> {
        await this.page.locator(newVendorStaffSelectors.firstNameInput).fill(data.firstName);
        await this.page.locator(newVendorStaffSelectors.lastNameInput).fill(data.lastName);
        await this.page.locator(newVendorStaffSelectors.emailInput).fill(data.email);
        if (data.phone) {
            // cleave.js MaskedInput — type char-by-char so onChange commits rawValue.
            const phone = this.page.locator(newVendorStaffSelectors.phoneInput).first();
            await phone.click();
            await phone.pressSequentially(data.phone, { delay: 40 });
        }
    }

    /** Submit the create form; gate on the create POST. */
    async submitCreate(): Promise<void> {
        await Promise.all([this.page.waitForResponse(r => newVendorStaffSelectors.staffRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.createButton.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Submit the edit form; gate on the update PUT. */
    async submitUpdate(): Promise<void> {
        await Promise.all([this.page.waitForResponse(r => newVendorStaffSelectors.staffRest.test(r.url()) && r.request().method() === 'PUT', { timeout: 20000 }).catch(() => undefined), this.updateButton.click()]);
        await this.page.waitForTimeout(800);
    }

    async getEmailFieldValue(): Promise<string> {
        return await this.page.locator(newVendorStaffSelectors.emailInput).inputValue();
    }

    // ---- Permissions ----
    capCheckbox(cap: string): Locator {
        return this.page.locator(newVendorStaffSelectors.capCheckbox(cap)).first();
    }

    async isCapChecked(cap: string): Promise<boolean> {
        return await this.capCheckbox(cap)
            .isChecked()
            .catch(() => false);
    }

    async setCap(cap: string, checked: boolean): Promise<void> {
        const box = this.capCheckbox(cap);
        await box.waitFor({ state: 'attached', timeout: 10000 });
        if (checked) await box.check({ force: true });
        else await box.uncheck({ force: true });
    }

    async savePermissions(): Promise<void> {
        await Promise.all([this.page.waitForResponse(r => newVendorStaffSelectors.capabilitiesRest.test(r.url()) && r.request().method() !== 'GET', { timeout: 20000 }).catch(() => undefined), this.savePermissionsButton.click()]);
        await this.page.waitForTimeout(800);
    }

    async resetPermissions(): Promise<void> {
        await this.page.locator(newVendorStaffSelectors.resetButton).first().click();
        const confirm = this.page.locator(newVendorStaffSelectors.resetConfirmButton).first();
        await confirm.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([this.page.waitForResponse(r => newVendorStaffSelectors.capabilitiesRest.test(r.url()) && r.request().method() !== 'GET', { timeout: 20000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(800);
    }

    // ---- List row actions ----
    /** Open the Name link of a row to navigate to its edit form. */
    async openStaffByName(name: string): Promise<void> {
        const row = this.rowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const link = row.locator(newVendorStaffSelectors.nameLink).first();
        await Promise.all([this.page.waitForURL(/#\/staffs\/update\/\d+/, { timeout: 15000 }).catch(() => undefined), link.click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async rowActionItems(name: string): Promise<string[]> {
        const row = this.rowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const labels: string[] = [];
        for (const label of ['Edit', 'Manage', 'Delete']) {
            if (
                await this.page
                    .locator(newVendorStaffSelectors.actionMenuItem(label))
                    .first()
                    .isVisible({ timeout: 2000 })
                    .catch(() => false)
            )
                labels.push(label);
        }
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return labels;
    }

    /** Delete a staff row via its action menu + destructive confirm; gate on DELETE. */
    async deleteStaffByName(name: string): Promise<void> {
        const row = this.rowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await openRowActionMenu(this.page, 0, 'Delete').catch(async () => {
            await row.locator("button[aria-label='Actions']").first().click();
        });
        await dvClickActionMenuItem(this.page, 'Delete');
        // plugin-ui destructive AlertDialog.
        const confirm = this.page.locator(newVendorStaffSelectors.deleteConfirmBtn).first();
        const dialog = dataViewsConfirm(this.page);
        await Promise.all([
            this.page.waitForResponse(r => newVendorStaffSelectors.staffRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 20000 }).catch(() => undefined),
            (async () => {
                if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) await confirm.click();
                else if (await dialog.isVisible({ timeout: 3000 }).catch(() => false))
                    await dialog
                        .getByRole('button')
                        .filter({ hasNotText: /^Cancel$/ })
                        .last()
                        .click();
            })(),
        ]);
        await this.page.waitForTimeout(1000);
    }

    // ---- Toast ----
    async toastHasText(text: RegExp | string): Promise<boolean> {
        const toast = this.page.locator(newVendorStaffSelectors.successToast).filter({ hasText: text }).first();
        return await toast.isVisible({ timeout: 8000 }).catch(() => false);
    }

    // ---- Staff frontend login (my-account form; no staff storage state exists) ----
    async frontendLogin(username: string, password: string): Promise<void> {
        await this.page.goto(toPath('my-account'), { waitUntil: 'domcontentloaded' });
        const userField = this.page.locator('#username');
        if (await userField.isVisible().catch(() => false)) {
            await userField.fill(username);
            await this.page.locator('#password').fill(password);
            await this.page
                .locator('#rememberme')
                .check()
                .catch(() => undefined);
            await this.page.locator('//button[@value="Log in"]').click();
            await this.page.waitForLoadState('load');
            await expect
                .poll(
                    async () => {
                        const cookies = await this.page.context().cookies();
                        return cookies.some(c => c.name.startsWith('wordpress_logged_in_'));
                    },
                    { timeout: 15000 },
                )
                .toBe(true);
        }
    }
}
