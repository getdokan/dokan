import { Locator, Page, Route } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — admin Dashboard home (Dokan 5.0.0+ React admin dashboard)
// ============================================
// This is an ADMIN-only spec. The live happy-path counts are seeded via REST
// (apiUtils.createStore / createCustomer / createOrderWithStatus /
// createProductReview, admin auth) in the spec; the read-only dashboard
// endpoints (admin notices, error / empty / skeleton states) are MOCKED via
// page.route — they are PHP/option-driven and not seedable.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Dashboard home).
// All seeded names are namespaced 'ADH' so this spec never collides with the
// other admin specs running in parallel.
export const adminDashboardHomeData = {
    // A vendor + customer + order + review that produce live numbers so the
    // genuine end-to-end happy paths assert against real data.
    vendor: { storeName: 'ADH Store', userLogin: 'adh_vendor', email: 'adh_vendor@example.test' },
    customer: { username: 'adh_customer', email: 'adh_customer@example.test', password: 'Password123#' },

    // The documented stack of section headings on the home route, in order.
    // Vendor Metrics (Pro) and Most Reported Vendors (option-gated) are checked
    // separately so the Lite happy path stays deterministic.
    sectionHeadingsInOrder: ['To-Do', 'Analytics', 'Monthly Overview', 'Daily Sales Chart', 'All-Time Marketplace Stats', 'Top Performing Vendors', 'Most Reviewed Products'] as const,
} as const;

// ============================================
// SELECTORS — verified against
//   src/admin/dashboard/pages/dashboard/index.tsx + section components,
//   src/components/AdminHeader.tsx,
//   src/admin/dashboard/pages/dashboard/components/AdminNotices.tsx.
// The dashboard mounts on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/ (HashRouter). Every section heading is an
// <h3>; the page title is the <h1> 'Dashboard'.
// ============================================
export const adminDashboardHomeSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    pageTitle: 'h1.wp-heading-inline',
    // AdminNotices wrapper + parts (AdminNotices.tsx). AdminHeader mounts MULTIPLE
    // AdminNotices instances (different scopes); only the one our mock fills has
    // content, so always target the VISIBLE wrap (:visible) — `.first()` could pick
    // an empty, hidden instance.
    noticesWrap: '.dokan-admin-notices-wrap:visible',
    noticeSlide: '.dokan-admin-notices-wrap:visible .dokan-admin-notice',
    noticeTitle: '.dokan-admin-notices-wrap:visible .dokan-message h3',
    noticeCounter: '.dokan-admin-notices-wrap:visible .notice-count',
    noticeNext: ".dokan-admin-notices-wrap:visible button[aria-label='Next notice']",
    noticePrev: ".dokan-admin-notices-wrap:visible button[aria-label='Previous notice']",
    noticeSlidesTrack: '.dokan-admin-notices-wrap:visible .dokan-notice-slides',
    // A section-level red error box (text-red-500 / bg-red-50) — class fragment
    // shared by every section's error branch.
    sectionError: '.bg-red-50',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// The dashboard REST endpoints (apiFetch path dokan/v1/admin/dashboard/*). The
// notices endpoint AdminHeader mounts is dokan/v1/admin/notices/admin (it is
// requested 2x — scope=global and scope empty — so a single glob covers both).
export const adminDashboardHomeEndpoints = {
    noticesAdmin: '**/dokan/v1/admin/notices/admin*',
    todo: '**/dokan/v1/admin/dashboard/todo*',
    analytics: '**/dokan/v1/admin/dashboard/analytics*',
    monthlyOverview: '**/dokan/v1/admin/dashboard/monthly-overview*',
    allTimeStats: '**/dokan/v1/admin/dashboard/all-time-stats*',
    salesChart: '**/dokan/v1/admin/dashboard/sales-chart*',
    topPerformingVendors: '**/dokan/v1/admin/dashboard/top-performing-vendors*',
    mostReviewedProducts: '**/dokan/v1/admin/dashboard/most-reviewed-products*',
    mostReportedVendors: '**/dokan/v1/admin/dashboard/most-reported-vendors*',
} as const;

// ============================================
// MOCK FIXTURES — fed to page.route().fulfill().
// ============================================
export const adminNoticeFixtures = {
    // 2 notices -> slider exposes the 'X of Y' counter + prev/next nav.
    two: [
        { type: 'info', title: 'ADH Notice One', description: 'First mocked admin notice.', priority: 10, show_close_button: false },
        { type: 'info', title: 'ADH Notice Two', description: 'Second mocked admin notice.', priority: 10, show_close_button: false },
    ],
    // 1 notice -> no nav, no counter.
    one: [{ type: 'info', title: 'ADH Solo Notice', description: 'Only mocked admin notice.', priority: 10, show_close_button: false }],
    // A notice whose action carries confirm_message -> DokanModal confirmation.
    confirm: [
        {
            type: 'warning',
            title: 'ADH Confirm Notice',
            description: 'This action needs confirmation.',
            priority: 10,
            show_close_button: false,
            actions: [{ type: 'primary', text: 'Run Update', confirm_message: 'Are you absolutely sure you want to run the update?', ajax_data: { action: 'adh_noop', nonce: 'adh' } }],
        },
    ],
    empty: [] as unknown[],
} as const;

// ============================================
// PAGE OBJECT — admin Dashboard home (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// notice confirmation modal).
// ============================================
export class AdminDashboardHomePage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.reactRoot).first();
    }

    get pageTitle(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.pageTitle).first();
    }

    /** A section heading by its visible text — every section title is an <h3>. */
    sectionHeading(name: string): Locator {
        return this.page.getByRole('heading', { name, level: 3 }).first();
    }

    get noticesWrap(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.noticesWrap).first();
    }

    get noticeCounter(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.noticeCounter).first();
    }

    get noticeNext(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.noticeNext).first();
    }

    get noticePrev(): Locator {
        return this.page.locator(adminDashboardHomeSelectors.noticePrev).first();
    }

    /** A visible (faded-in, opacity 1) notice slide by its title text. */
    noticeTitleByText(title: string): Locator {
        return this.page.locator(adminDashboardHomeSelectors.noticeTitle, { hasText: new RegExp(escapeRegExp(title), 'i') }).first();
    }

    /** The All-Time stats grid — the section that holds the currency cards. */
    get allTimeStatsGrid(): Locator {
        return this.sectionHeading('All-Time Marketplace Stats').locator('xpath=ancestor::div[contains(@class,"mt-8")][1]');
    }

    // ---- Mocking (route-mock read-only endpoints) ----
    /** Stub the dokan/v1/admin/notices/admin endpoint with a fixture array. */
    async mockAdminNotices(notices: unknown): Promise<void> {
        await this.page.route(adminDashboardHomeEndpoints.noticesAdmin, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(notices) });
        });
    }

    /** Fail a dashboard section endpoint with a 500 so its red error box renders. */
    async mockSectionError(endpointGlob: string, message = 'Internal Server Error'): Promise<void> {
        await this.page.route(endpointGlob, async (route: Route) => {
            await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'internal_error', message }) });
        });
    }

    /** Delay a section endpoint so its skeleton is observable before data lands. */
    async mockSectionDelay(endpointGlob: string, delayMs = 4000): Promise<void> {
        await this.page.route(endpointGlob, async (route: Route) => {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND the first section heading paints. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.sectionHeading('To-Do')
            .waitFor({ state: 'visible', timeout: timeoutMs })
            .catch(() => undefined);
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminDashboardHomeSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** Visible y-position of a section heading (for documented-order assertions). */
    async headingTop(name: string): Promise<number> {
        const heading = this.sectionHeading(name);
        await heading.waitFor({ state: 'visible', timeout: 15000 });
        const box = await heading.boundingBox();
        return box ? box.y : Number.MAX_SAFE_INTEGER;
    }

    async isSectionVisible(name: string): Promise<boolean> {
        return await this.sectionHeading(name)
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    /** True when ANY section red error box is visible. */
    async isSectionErrorVisible(): Promise<boolean> {
        return await this.page
            .locator(adminDashboardHomeSelectors.sectionError)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    /** Innermost text of the All-Time stats grid (for currency-format checks). */
    async allTimeStatsText(): Promise<string> {
        const grid = this.allTimeStatsGrid;
        await grid.waitFor({ state: 'visible', timeout: 15000 });
        return (await grid.innerText()).trim();
    }

    // ---- Notices ----
    async isNoticesVisible(): Promise<boolean> {
        return await this.noticesWrap.isVisible({ timeout: 8000 }).catch(() => false);
    }

    async noticesCount(): Promise<number> {
        return await this.page.locator(adminDashboardHomeSelectors.noticesWrap).count();
    }

    /** Text of the 'X of Y' counter, normalised (RawHTML wraps the numbers). */
    async counterText(): Promise<string> {
        await this.noticeCounter.waitFor({ state: 'visible', timeout: 8000 });
        return (await this.noticeCounter.innerText()).replace(/\s+/g, ' ').trim();
    }

    async clickNextNotice(): Promise<void> {
        await this.noticeNext.waitFor({ state: 'visible', timeout: 8000 });
        await this.noticeNext.click();
        await this.page.waitForTimeout(500); // fade transition.
    }

    /** Click a notice action button by its label, e.g. 'Run Update'. */
    async clickNoticeAction(label: string): Promise<void> {
        const btn = this.noticesWrap.getByRole('button', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await btn.waitFor({ state: 'visible', timeout: 8000 });
        await btn.click();
    }

    /** The notice confirmation modal (DokanModal namespace admin-notice-confirmation). */
    get confirmModal(): Locator {
        return this.page
            .getByRole('dialog')
            .filter({ hasText: /Are you sure\?|Updater Alert!/i })
            .first();
    }

    async isConfirmModalVisible(): Promise<boolean> {
        return await this.confirmModal.isVisible({ timeout: 8000 }).catch(() => false);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Dashboard home UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const toDoVisible = await this.sectionHeading('To-Do')
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        return !rootVisible && !toDoVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
