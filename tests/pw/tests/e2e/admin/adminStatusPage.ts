import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — Admin Status page (Dokan 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/status (HashRouter).
//
// ADMIN-ONLY, READ-ONLY page. The route is registered by Dokan LITE via the
// `dokan-admin-dashboard-routes` wp.hooks filter (src/Status/index.tsx, id
// 'dokan-status', path '/status'), so this is a @lite area even in a Pro env.
//
// The Status component (src/Status/Status.tsx) fetches
//   GET dokan/v1/admin/dashboard/status
// (DokanRESTAdminController -> namespace 'dokan/v1/admin', base 'dashboard',
//  permission_callback = check_permission -> current_user_can('manage_woocommerce')).
// On a clean Dokan that endpoint returns NO status elements, so the component
// renders its "up-to-date" empty state:
//   <h2>Status</h2>
//   "Your Dokan is up-to-date."
//   "Latest Version:" + "Lite: <lite_version>" ( + "| <plan>: <pro_version>" when Pro).
// There is NOTHING to seed in the DB — every state is server-derived and the
// default render is the up-to-date screen. No tabs, no DataViews table, no
// search box, no row actions. See new-dashboards-test-cases.md.
// ============================================
export const adminStatusData = {
    // REST endpoint the Status page fetches on mount; requires manage_woocommerce.
    statusPath: '/dokan/v1/admin/dashboard/status',
} as const;

// ============================================
// SELECTORS — verified against src/Status/Status.tsx.
// ============================================
export const adminStatusSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // The page <h2> — { __( 'Status', 'dokan-lite' ) }.
    title: 'Status',
    // Empty / up-to-date state copy — { __( 'Your Dokan is up-to-date.', 'dokan-lite' ) }.
    upToDate: 'text=Your Dokan is up-to-date.',
    // The latest-version line label — { __( 'Latest Version:', 'dokan-lite' ) }.
    latestVersion: 'text=/Latest Version:/i',
    // The "Lite:" span carrying the version number.
    liteVersion: 'text=/Lite:/i',
    // Loading state copy — { __( 'Checking your Dokan Status', 'dokan-lite' ) }.
    loadingText: 'text=Checking your Dokan Status',
    // PHP fatal marker (the WordPress critical-error page phrase).
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — Admin Status page (Dokan 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/status (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler.
// ============================================
export class AdminStatusPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/status');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminStatusSelectors.reactRoot).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminStatusSelectors.title, exact: true }).first();
    }
    get upToDate(): Locator {
        return this.page.locator(adminStatusSelectors.upToDate).first();
    }
    get latestVersion(): Locator {
        return this.page.locator(adminStatusSelectors.latestVersion).first();
    }
    get liteVersion(): Locator {
        return this.page.locator(adminStatusSelectors.liteVersion).first();
    }
    get loadingText(): Locator {
        return this.page.locator(adminStatusSelectors.loadingText).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root + the "Status" heading are visible. */
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
            .locator(adminStatusSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** Wait for the body to settle: the up-to-date screen paints after the REST
     * fetch resolves and the loading spinner clears. locator.isVisible() does NOT
     * retry (it snapshots the current state and ignores its timeout), so this
     * loops with waitFor-style polling until the up-to-date copy OR the latest-
     * version line is present. */
    async waitForContent(timeoutMs = 20000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (await this.upToDate.isVisible().catch(() => false)) return;
            if (await this.latestVersion.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    /** True once the "Your Dokan is up-to-date." empty state has painted. */
    async isUpToDateVisible(timeoutMs = 15000): Promise<boolean> {
        try {
            await this.upToDate.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    /** True once the "Latest Version: Lite: …" line has painted. */
    async isVersionLineVisible(timeoutMs = 15000): Promise<boolean> {
        try {
            await this.latestVersion.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Status UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
