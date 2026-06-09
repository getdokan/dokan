import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Vendors this spec seeds via REST (apiUtils.createStore) so the admin vendor
// edit form is deterministic. This is an ADMIN-only spec: the vendor state it
// edits is created programmatically, never by driving the vendor UI.
// Names are namespaced "AVE" so this spec never collides with the other admin
// specs running in parallel. See admin-dashboard-seeding-strategy.md (§ Vendor edit).
export const adminVendorEditData = {
    // Primary vendor — the :id being edited. Read assertions (pre-fill, hidden
    // create-only fields) only read it, so they are parallel-safe.
    primary: { storeName: 'AVE Primary Store', userLogin: 'ave_primary_vendor', email: 'ave_primary_vendor@example.test' },
    // Dedicated mutation targets — each save test owns one vendor and resets it
    // via API in beforeAll, so tests never race each other for the same record.
    nameTarget: { storeName: 'AVE Name Target Store', userLogin: 'ave_name_target', email: 'ave_name_target@example.test' },
    phoneTarget: { storeName: 'AVE Phone Target Store', userLogin: 'ave_phone_target', email: 'ave_phone_target@example.test' },
    toggleTarget: { storeName: 'AVE Toggle Target Store', userLogin: 'ave_toggle_target', email: 'ave_toggle_target@example.test' },
    commissionTarget: { storeName: 'AVE Commission Target Store', userLogin: 'ave_commission_target', email: 'ave_commission_target@example.test' },
    discardTarget: { storeName: 'AVE Discard Target Store', userLogin: 'ave_discard_target', email: 'ave_discard_target@example.test' },
    leaveTarget: { storeName: 'AVE Leave Target Store', userLogin: 'ave_leave_target', email: 'ave_leave_target@example.test' },
    // A second vendor whose email is used to exercise the email availability check.
    foreign: { storeName: 'AVE Foreign Store', userLogin: 'ave_foreign_vendor', email: 'ave_foreign_vendor@example.test' },
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/vendor-create-edit/Edit.tsx + form/{index,General,Commission}.tsx.
// The edit form mounts the shared <Form> module (formKey 'dokan-edit-vendor',
// createForm=false) on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/vendors/edit/:id.
// NOTE on the Email field: General.tsx passes the email DebouncedInput `id: 'last-name'`
// (a source-side duplicate of the Last Name input id), so #last-name is ambiguous.
// We target email by input[type="email"] — the only email-typed input in the form.
// ============================================
export const adminVendorEditSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // Edit.tsx wraps the page in <Card> rendered by the @dokan/components root.
    puiRoot: '#dokan-admin-dashboard .pui-root',
    // VendorFormSkeleton renders animate-pulse blocks while the vendor loads.
    skeleton: '#dokan-admin-dashboard .animate-pulse',
    // Store Information > Store Name DebouncedInput -> SimpleInput id="store-name".
    storeNameInput: '#store-name',
    // Store Information > Phone SimpleInput id="phone".
    phoneInput: '#phone',
    // Store Information > Email DebouncedInput, type="email".
    emailInput: 'input[type="email"]',
    // Create-only fields that must NOT exist in edit (createForm=false).
    storeUrlInput: '#store-url',
    usernameInput: '#username',
    passwordInput: '#password',
    // PHP fatal markers / admin notices.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    noticeError: '.notice-error, body.error-page',
} as const;

// ============================================
// PAGE OBJECT — admin Vendor Edit form (Dokan 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/edit/:id
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler (a generic role=dialog handler would race the unsaved-changes leave modal).
// ============================================
export class AdminVendorEditPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Build the edit route for a given vendor (seller) id. */
    editUrl(id: string): string {
        return toPath(`wp-admin/admin.php?page=dokan-dashboard#/vendors/edit/${id}`);
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminVendorEditSelectors.reactRoot).first();
    }
    get puiRoot(): Locator {
        return this.page.locator(adminVendorEditSelectors.puiRoot).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Update Vendor' }).first();
    }
    /** Back-link to the vendor detail route ("Vendor"). */
    get backLink(): Locator {
        return this.page.getByRole('link', { name: 'Vendor' }).first();
    }
    get skeleton(): Locator {
        return this.page.locator(adminVendorEditSelectors.skeleton).first();
    }
    get storeNameInput(): Locator {
        return this.page.locator(adminVendorEditSelectors.storeNameInput).first();
    }
    get phoneInput(): Locator {
        return this.page.locator(adminVendorEditSelectors.phoneInput).first();
    }
    get emailInput(): Locator {
        return this.page.locator(adminVendorEditSelectors.emailInput).first();
    }
    get saveButton(): Locator {
        return this.page.getByRole('button', { name: 'Save Changes' }).first();
    }
    get discardButton(): Locator {
        return this.page.getByRole('button', { name: 'Discard' }).first();
    }

    /** A form tab button — General / Commission / Social Options. */
    tab(name: RegExp | string): Locator {
        return this.page.getByRole('button', { name }).first();
    }

    /** The ToggleSwitch in the General > Permission row identified by its heading
     *  text. Scoped to the NEAREST ancestor that actually contains a switch (the
     *  row) so it doesn't pick the first switch on the page. */
    permissionToggle(name: RegExp | string): Locator {
        return this.page.getByRole('heading', { name }).locator('xpath=ancestor::div[.//*[@role="switch"]][1]').getByRole('switch').first();
    }

    // ---- Navigation / readiness ----
    async goto(id: string): Promise<void> {
        await this.page.goto(this.editUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root paints AND the form header is visible (vendor resolved). */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
        // The store-name field only renders once the vendor object is populated.
        await this.storeNameInput.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminVendorEditSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        const notice = await this.page
            .locator(adminVendorEditSelectors.noticeError)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal && !notice;
    }

    // ---- Reads ----
    async storeNameValue(): Promise<string> {
        return (await this.storeNameInput.inputValue()).trim();
    }
    async phoneValue(): Promise<string> {
        return (await this.phoneInput.inputValue()).trim();
    }
    async emailValue(): Promise<string> {
        return (await this.emailInput.inputValue()).trim();
    }

    /** True if a create-only field exists in the DOM (it must NOT, in edit). */
    async hasCreateOnlyField(which: 'storeUrl' | 'username' | 'password'): Promise<boolean> {
        const selector = which === 'storeUrl' ? adminVendorEditSelectors.storeUrlInput : which === 'username' ? adminVendorEditSelectors.usernameInput : adminVendorEditSelectors.passwordInput;
        return (await this.page.locator(selector).count()) > 0;
    }

    /** True if the "Send an email to vendor about account" checkbox exists (must NOT, in edit). */
    async hasSendEmailCheckbox(): Promise<boolean> {
        return (await this.page.getByText('Send an email to vendor about account', { exact: false }).count()) > 0;
    }

    async isSkeletonVisible(): Promise<boolean> {
        return await this.skeleton.isVisible({ timeout: 5000 }).catch(() => false);
    }

    // ---- Field edits ----
    // dokan-ui DebouncedInput ignores Playwright fill() (single input event) — it
    // only commits on real per-keystroke input. Type with pressSequentially, then
    // blur to commit, then wait past the 500ms debounce so form state propagates.
    async setStoreName(value: string): Promise<void> {
        await this.storeNameInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.storeNameInput.click();
        await this.storeNameInput.fill('');
        await this.storeNameInput.pressSequentially(value, { delay: 25 });
        await this.storeNameInput.blur();
        await this.page.waitForTimeout(800);
    }

    async setPhone(value: string): Promise<void> {
        await this.phoneInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.phoneInput.fill(value);
        await this.page.waitForTimeout(400);
    }

    async setEmail(value: string): Promise<void> {
        await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.emailInput.click();
        await this.emailInput.fill('');
        await this.emailInput.pressSequentially(value, { delay: 25 });
        await this.emailInput.blur();
        await this.page.waitForTimeout(800);
    }

    /** Type into the Phone field char-by-char so the sanitizing onChange runs. */
    async typePhone(value: string): Promise<void> {
        await this.phoneInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.phoneInput.fill('');
        await this.phoneInput.pressSequentially(value, { delay: 20 });
        await this.page.waitForTimeout(400);
    }

    // ---- Tabs ----
    async openTab(name: RegExp | string): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(400);
    }

    // ---- Permission toggles ----
    async toggle(name: RegExp | string): Promise<void> {
        const toggle = this.permissionToggle(name);
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await toggle.scrollIntoViewIfNeeded().catch(() => undefined);
        await toggle.click();
        await this.page.waitForTimeout(300);
    }

    // ---- Commission (Fixed) ----
    /** Set the Fixed admin commission percentage + additional fee. Targets the two
     *  number inputs the FixedCommissionInput renders inside the Commission card. */
    async setFixedCommission(percentage: string, additionalFee: string): Promise<void> {
        const inputs = this.page.locator('input[type="number"]');
        await inputs.first().waitFor({ state: 'visible', timeout: 10000 });
        await inputs.nth(0).fill(percentage);
        await inputs.nth(1).fill(additionalFee);
        await this.page.waitForTimeout(400);
    }

    // ---- Save / Discard ----
    async save(): Promise<void> {
        await this.saveButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.saveButton.click();
    }

    async discard(): Promise<void> {
        await this.discardButton.click();
        await this.page.waitForTimeout(400);
    }

    async isDiscardEnabled(): Promise<boolean> {
        return await this.discardButton.isEnabled().catch(() => false);
    }

    /** Wait for the POST dokan/v1/stores/:id triggered by Save and return its response. */
    async saveAndWaitForUpdate(id: string): Promise<number> {
        const [resp] = await Promise.all([this.page.waitForResponse(resp => new RegExp(`/dokan/v1/stores/${id}\\b`).test(resp.url()) && resp.request().method() === 'POST', { timeout: 20000 }), this.save()]);
        return resp.status();
    }

    /** Save, returning BOTH the POST status and whether the (transient) success
     *  toast appeared. The toast waiter is armed BEFORE the click so the short-lived
     *  react-hot-toast isn't missed by a check that starts after the response. */
    async saveAndCaptureToast(id: string, toastText: string): Promise<{ status: number; toast: boolean }> {
        const respP = this.page.waitForResponse(r => new RegExp(`/dokan/v1/stores/${id}\\b`).test(r.url()) && r.request().method() === 'POST', { timeout: 20000 });
        const toastP = this.page
            .getByText(toastText, { exact: false })
            .first()
            .waitFor({ state: 'visible', timeout: 12000 })
            .then(() => true)
            .catch(() => false);
        await this.save();
        const resp = await respP;
        const toast = await toastP;
        return { status: resp.status(), toast };
    }

    // ---- Toasts / modals ----
    /** True when a toast whose text matches `text` is visible. A string is matched
     *  loosely (case-insensitive, regex-escaped) so toast copy variations still pass. */
    async hasToast(text: RegExp | string): Promise<boolean> {
        const matcher = typeof text === 'string' ? new RegExp(escapeRegExp(text), 'i') : text;
        return await this.page
            .getByText(matcher)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    /** The unsaved-changes leave modal description text. */
    get leaveModal(): Locator {
        return this.page.getByText('You have unsaved changes.', { exact: false }).first();
    }

    async isLeaveModalVisible(): Promise<boolean> {
        return await this.leaveModal.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** Click "Stay" on the unsaved-changes modal to keep editing. */
    async stayOnPage(): Promise<void> {
        const btn = this.page.getByRole('button', { name: 'Stay' }).first();
        await btn.waitFor({ state: 'visible', timeout: 5000 });
        await btn.click();
        await this.page.waitForTimeout(300);
    }

    /** Click "Leave Page" on the unsaved-changes modal to navigate to the pending route. */
    async leavePage(): Promise<void> {
        const btn = this.page.getByRole('button', { name: 'Leave Page' }).first();
        await btn.waitFor({ state: 'visible', timeout: 5000 });
        await btn.click();
        await this.page.waitForTimeout(300);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin vendor-edit UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
