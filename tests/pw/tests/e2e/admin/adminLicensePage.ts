import { Locator, Page } from '@playwright/test';
import { toPath, SERVER_URL } from '@utils/helpers';

// ============================================
// TEST DATA / ENDPOINTS — Admin License manager (Dokan Pro, new React admin
// dashboard, Dokan 5.0.0+).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/license (HashRouter).
//
// ADMIN-ONLY, Pro-gated area. The page mounts the LicensePage component
// (dokan-pro/src/admin/license-manager/LicensePage.tsx), registered onto the
// shared `dokan-admin-dashboard-routes` filter at path '/license'. On mount it
// GETs /dokan-pro/v1/license/status; when the status is_valid it renders the
// ACTIVE surface: an "Active" pill, a masked license_key SimpleInput, and the
// "Deactivate License" + "Refresh" buttons, plus the Activations Remaining /
// License Expiry usage cards.
//
// HARD SAFETY CONSTRAINT — this page object exposes NO deactivate flow. The
// shared environment has a live, activated Pro license; clicking "Deactivate
// License" would disable Dokan Pro for the whole env and break every @pro test.
// So there is intentionally no clickDeactivate()/confirmDeactivate() helper, and
// every test below is NON-DESTRUCTIVE (read-only assertions + the idempotent
// Refresh re-check). There is also nothing to seed in the DB — the license
// status is already Active in the shared env.
// ============================================
export const adminLicenseEndpoints = {
    // REST status endpoint the LicensePage fetches on mount (and again on Refresh).
    status: '**/dokan-pro/v1/license/status**',
    // Full server URLs for the role-rejection REST checks.
    statusUrl: `${SERVER_URL}/dokan-pro/v1/license/status`,
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/src/admin/license-manager/{index,LicensePage,HeaderImg}.tsx.
// The License manager is NOT the AdminDataViews table surface — it is a bespoke
// Card layout, so there is no DataViews table / status tab / row-action kebab
// here; selectors are role/text/name based off the real JSX.
// ============================================
export const adminLicenseSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // LicensePage h1 — { __( 'License', 'dokan' ) }.
    title: 'License',
    // "License Activation" card sub-heading (<h2>).
    activationHeading: 'License Activation',
    // The "Active" status pill (only rendered when status.is_valid).
    activePill: 'Active',
    // Masked license-key input — <SimpleInput name="license_key"
    // placeholder="Enter your key here">.
    licenseKeyInput: 'input[name="license_key"]',
    // The @wordpress/components Spinner shown while a status fetch is in flight.
    spinner: '.components-spinner',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — Admin License manager (Dokan Pro, 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/license (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler.
//
// SAFETY: no deactivate affordance is exposed (see file header). The only action
// helper is clickRefresh(), which re-GETs the status and keeps the license Active.
// ============================================
export class AdminLicensePage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/license');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminLicenseSelectors.reactRoot).first();
    }
    /** The page <h1> heading "License". */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminLicenseSelectors.title, exact: true }).first();
    }
    /** The "License Activation" card sub-heading. */
    get activationHeading(): Locator {
        return this.page.getByRole('heading', { name: adminLicenseSelectors.activationHeading, exact: true }).first();
    }
    /** The green "Active" status pill (present only when the license is_valid). */
    get activePill(): Locator {
        return this.reactRoot.getByText(adminLicenseSelectors.activePill, { exact: true }).first();
    }
    /** The masked license_key SimpleInput. */
    get licenseKeyInput(): Locator {
        return this.page.locator(adminLicenseSelectors.licenseKeyInput).first();
    }
    /** The "Deactivate License" DokanButton (NEVER clicked — assertion-only). */
    get deactivateButton(): Locator {
        return this.page.getByRole('button', { name: /Deactivate License/i }).first();
    }
    /** The "Refresh" DokanButton (re-checks the license status). */
    get refreshButton(): Locator {
        return this.page.getByRole('button', { name: /Refresh/i }).first();
    }
    /** Activations Remaining usage card label. "Activations Remaining" is rendered
     * as a plain card label (not a heading role), so match it by text. */
    get activationsRemainingHeading(): Locator {
        return this.page.getByText(/Activations Remaining/i).first();
    }
    get loadingSpinner(): Locator {
        return this.page.locator(adminLicenseSelectors.spinner).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root + the "License" title are visible. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminLicenseSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads (WAIT-correct: locator.isVisible() snapshots, so use waitFor) ----
    /** True once the "Active" status pill has painted. The status pill renders
     * only AFTER the GET status REST request resolves (is_valid), which lands
     * after the heading paints — so we WAIT for it (waitFor retries; isVisible()
     * would lose the fetch race). */
    async isActive(timeoutMs = 15000): Promise<boolean> {
        try {
            await this.activePill.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    /** True once the masked license_key field is present in the DOM. */
    async isLicenseKeyFieldVisible(timeoutMs = 15000): Promise<boolean> {
        try {
            await this.licenseKeyInput.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    // ---- Actions (NON-DESTRUCTIVE only) ----
    /** Click "Refresh" to re-GET the license status. Captures the status request
     * so we can assert the re-check fired, then waits for it to settle while the
     * license stays Active. This is the ONLY action helper — there is NO
     * deactivate helper by design (see file header). */
    async clickRefreshAndAwaitStatus(timeoutMs = 15000): Promise<void> {
        const btn = this.refreshButton;
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await Promise.all([
            this.page.waitForResponse(r => r.url().includes('/dokan-pro/v1/license/status') && r.request().method() === 'GET', { timeout: timeoutMs }),
            btn.click(),
        ]);
        // The in-flight Spinner clears once the re-check resolves.
        await this.loadingSpinner.waitFor({ state: 'hidden', timeout: timeoutMs }).catch(() => undefined);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin License UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
