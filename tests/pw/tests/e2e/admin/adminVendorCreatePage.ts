import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// The Admin "Add New Vendor" form is admin-only — it does not need any seeded
// vendor/customer state to render. The handful of fixtures below are seeded via
// REST (apiUtils.createStore) only so the negative availability checks have a
// real existing username/email/store-slug to collide with. Every fixture name is
// namespaced with the "AVC" prefix so this spec never collides with the other
// admin specs that run in parallel.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md.
export const adminVendorCreateData = {
    // An already-registered vendor used to assert the live "Not Available"
    // username / email / store-slug availability indicators on the create form.
    existing: {
        storeName: 'AVC Existing Store',
        userLogin: 'avc_existing_vendor',
        email: 'avc_existing_vendor@example.test',
    },
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/vendor-create-edit/Create.tsx + form/index.tsx +
// form/General.tsx + form/utils.tsx.
// The create form mounts on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/vendors/create. Inputs are dokan-ui
// SimpleInput/DebouncedInput, so the `input.id` from the JSX lands on the real
// <input> (e.g. id="store-name"). NOTE: the Email field is given id="last-name"
// in the source (a duplicate-id bug), so Email is targeted by its placeholder
// "Enter email address" rather than by id.
// ============================================
export const adminVendorCreateSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // General-tab fields (ids come straight from the SimpleInput `input.id`).
    storeName: '#store-name',
    storeUrl: '#store-url',
    firstName: '#first-name',
    lastName: '#last-name',
    username: '#username',
    password: '#password',
    phone: '#phone',
    // Email placeholder (its id collides with last-name in the source JSX).
    emailPlaceholder: 'Enter email address',
    // Availability indicators rendered by getStoreSearchText().
    available: 'text=/^\\s*Available\\s*$/',
    notAvailable: 'text=/Not Available/i',
    searching: 'text=/Searching/i',
    // Toasts (dokan-ui useToast renders into a role=status / toast container).
    successToast: 'text=/Vendor Added Successfully/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Non-admin permission wall (wp_die) when a vendor/customer hits the page.
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Add New Vendor form (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/create
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// commission sub-category confirm modal).
// ============================================
export class AdminVendorCreatePage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/vendors/create');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminVendorCreateSelectors.reactRoot).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Add New Vendor' }).first();
    }
    get backLink(): Locator {
        return this.page.getByRole('link', { name: /Vendors/i }).first();
    }
    get storeNameInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.storeName).first();
    }
    get storeUrlInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.storeUrl).first();
    }
    get firstNameInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.firstName).first();
    }
    get lastNameInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.lastName).first();
    }
    get emailInput(): Locator {
        return this.page.getByPlaceholder(adminVendorCreateSelectors.emailPlaceholder).first();
    }
    get usernameInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.username).first();
    }
    get passwordInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.password).first();
    }
    get phoneInput(): Locator {
        return this.page.locator(adminVendorCreateSelectors.phone).first();
    }
    get addVendorButton(): Locator {
        return this.page.getByRole('button', { name: /Add Vendor/i }).first();
    }
    get cancelButton(): Locator {
        return this.page.getByRole('button', { name: /^Cancel$/i }).first();
    }
    get generateButton(): Locator {
        return this.page.getByRole('button', { name: /^Generate$/i }).first();
    }
    get successToast(): Locator {
        return this.page.locator(adminVendorCreateSelectors.successToast).first();
    }

    /** A form tab button by visible label — General / Commission / Social Options. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('button', { name }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND the Store Name field has painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.storeNameInput.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminVendorCreateSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Tabs ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(500); // tab content swap.
    }

    /** True when a tab button carries the active accent class (#7047EB). */
    async isTabActive(name: RegExp): Promise<boolean> {
        const cls = (await this.tab(name).getAttribute('class')) ?? '';
        return /#7047EB|7047EB/.test(cls);
    }

    // ---- Field entry ----
    // Each field is a dokan-ui DebouncedInput. Playwright fill() (single input
    // event) does NOT update its controlled state — the slug-derive / availability
    // / form state only react to real per-keystroke input events. So type with
    // pressSequentially, then blur to commit, then wait for debounce + derive.
    private async typeInto(loc: Locator, value: string, settleMs = 900): Promise<void> {
        await loc.click();
        await loc.fill(''); // clear any existing value
        await loc.pressSequentially(value, { delay: 25 });
        await loc.blur();
        await this.page.waitForTimeout(settleMs);
    }

    async fillStoreName(value: string): Promise<void> {
        await this.typeInto(this.storeNameInput, value);
    }

    async fillStoreUrl(value: string): Promise<void> {
        await this.typeInto(this.storeUrlInput, value);
    }

    async fillEmail(value: string): Promise<void> {
        await this.typeInto(this.emailInput, value);
    }

    async fillUsername(value: string): Promise<void> {
        await this.typeInto(this.usernameInput, value);
    }

    async fillPassword(value: string): Promise<void> {
        await this.typeInto(this.passwordInput, value, 300);
    }

    async fillPhone(value: string): Promise<void> {
        await this.phoneInput.fill(value);
        await this.page.waitForTimeout(200);
    }

    async readPhone(): Promise<string> {
        return await this.phoneInput.inputValue();
    }

    async readPassword(): Promise<string> {
        return await this.passwordInput.inputValue();
    }

    async readStoreUrl(): Promise<string> {
        return await this.storeUrlInput.inputValue();
    }

    /** Click the Generate button and return the regenerated password value. */
    async clickGenerate(): Promise<string> {
        await this.generateButton.click();
        await this.page.waitForTimeout(300);
        return await this.readPassword();
    }

    /**
     * Fill every required field with valid data.
     * `slug` is left to the auto-derived value unless overridden.
     */
    async fillRequiredFields(data: { storeName: string; email: string; username: string; password: string; slug?: string }): Promise<void> {
        await this.fillStoreName(data.storeName);
        if (data.slug) {
            await this.fillStoreUrl(data.slug);
        }
        await this.fillEmail(data.email);
        await this.fillUsername(data.username);
        await this.fillPassword(data.password);
    }

    // ---- Submission ----
    /** Click Add Vendor and resolve once navigation back to #/vendors completes. */
    async submitAndExpectSuccess(): Promise<void> {
        await this.addVendorButton.click();
        await this.page.waitForURL(/#\/vendors$/, { timeout: 20000 }).catch(() => undefined);
    }

    /**
     * Click Add Vendor and capture whether a POST /dokan/v1/stores/ was fired
     * within the window. Used by the required-field-validation negative test:
     * client-side validateForm must block the POST entirely.
     */
    async submitAndDetectPost(windowMs = 2500): Promise<boolean> {
        let posted = false;
        const onRequest = (req: { method: () => string; url: () => string }) => {
            if (req.method() === 'POST' && /\/dokan\/v1\/stores\/?($|\?)/.test(req.url())) {
                posted = true;
            }
        };
        this.page.on('request', onRequest);
        await this.addVendorButton.click();
        await this.page.waitForTimeout(windowMs);
        this.page.off('request', onRequest);
        return posted;
    }

    // ---- Availability indicators ----
    // The indicator is rendered AFTER a debounced AJAX availability check, so we
    // must WAIT for it. locator.isVisible() does NOT wait (it snapshots the
    // current state and ignores its timeout), which raced the AJAX response and
    // intermittently reported a free slug as unavailable; waitFor() retries.
    async isStoreUrlAvailable(): Promise<boolean> {
        return await this.page
            .locator(adminVendorCreateSelectors.available)
            .first()
            .waitFor({ state: 'visible', timeout: 12000 })
            .then(() => true)
            .catch(() => false);
    }

    async isNotAvailableShown(): Promise<boolean> {
        return await this.page
            .locator(adminVendorCreateSelectors.notAvailable)
            .first()
            .waitFor({ state: 'visible', timeout: 12000 })
            .then(() => true)
            .catch(() => false);
    }

    // ---- Validation ----
    /** True when an inline required-field error is rendered for the named label. */
    async hasFieldError(message: RegExp): Promise<boolean> {
        return await this.page
            .getByText(message)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin create form is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
