import { Page, expect } from '@playwright/test';


import { closeAnnouncementModal, toPath } from '@utils/helpers';

/**
 * Page object for the new vendor React dashboard (Dokan 5.0.0+).
 *
 * Two distinct React shells live behind /dashboard:
 *
 *   1. The reports / analytics React app at /dashboard/?path=/analytics/Overview
 *      (rendered by `dokan-pro/src/react/vendor-dashboard/reports`).
 *   2. The new full-width vendor dashboard at /dashboard/new/ which mounts
 *      `#dokan-vendor-dashboard-root` (template templates/dashboard/new-dashboard.php)
 *      and uses HashRouter routes registered in src/routing/routes.tsx
 *      (`/products`, `/orders`, `/withdraw`, `/withdraw-requests`,
 *      `/products/create`, `/products/:id/edit`, `/reverse-withdrawal`).
 *
 * This page object covers BOTH shells. The constants below distinguish them.
 *
 * Prerequisite: enable the new layout via Admin → Dokan → Settings → Appearance:
 *   - Vendor Dashboard Style: New UI    (`dokan_appearance.vendor_layout_style = 'latest'`)
 *   - Vendor Product Editor: New UI     (`dokan_appearance.vendor_product_editor = 'latest'`)
 *
 * Self-contained per NEW_UI_HOUSE_STYLE.md §1 (announcement dismissal comes
 * from the shared @utils/helpers closeAnnouncementModal — F3 consolidation).
 */
export class NewVendorDashboardPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // --------------------------------------------------------------------
    // ROUTES
    // --------------------------------------------------------------------
    // Reports React app — query-param routes
    readonly analytics = {
        overview: '/analytics/Overview',
        stock: '/analytics/stock',
        orders: '/analytics/orders',
        revenue: '/analytics/revenue',
        products: '/analytics/products',
        statement: '/analytics/statement',
        variations: '/analytics/variations',
        categories: '/analytics/categories',
    } as const;

    // New full-width dashboard React app — HashRouter routes
    readonly newDashboard = {
        products: '/products',
        productsCreate: '/products/create',
        productsEdit: (productId: number) => `/products/${productId}/edit`,
        orders: '/orders',
        withdraw: '/withdraw',
        withdrawRequests: '/withdraw-requests',
        reverseWithdrawal: '/reverse-withdrawal',
    } as const;

    selectors = {
        // Analytics React shell (legacy menu wraps it)
        legacyMenuWrapper: '#primary',
        legacyDashboardMenu: '.dokan-dashboard-menu',
        reportsMenuActive: '.dokan-dashboard-menu li.reports.active',
        dashboardMenuActive: '.dokan-dashboard-menu li.dashboard.active',
        analyticsRoot: '#dokan-vendor-dashboard, .woocommerce-layout, .dokan-react-root, .woocommerce-analytics, .dokan-vendor-dashboard-app',

        // New full-width dashboard React root
        newDashboardRoot: '#dokan-vendor-dashboard-root',
        newDashboardLayout: '#dokan-vendor-dashboard-root .dokan-layout, #dokan-vendor-dashboard-root',
        // The React app shows a <Skeleton> while loading; once finished the
        // primary content area shows feature-specific markup.
        loadingSpinner: '#dokan-vendor-dashboard-root [role="status"]',

        // Page-not-found / WP fatal (defensive checks)
        phpFatal: "text=/Fatal error|Parse error|There has been a critical error/i",
    };

    // --------------------------------------------------------------------
    // ANALYTICS SHELL (legacy /dashboard wrap)
    // --------------------------------------------------------------------
    private analyticsRouteUrl(path: string): string {
        return toPath(`dashboard/?path=${encodeURIComponent(path)}`);
    }

    async gotoAnalyticsRoute(routeKey: keyof NewVendorDashboardPage['analytics']) {
        await this.page.goto(this.analyticsRouteUrl(this.analytics[routeKey]));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForAnalyticsReady();
    }

    async waitForAnalyticsReady(timeoutMs = 20000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const reactRoot = await this.page.locator(this.selectors.analyticsRoot).first().isVisible({ timeout: 250 }).catch(() => false);
            if (reactRoot) return;
            const legacyActive = await this.page.locator(`${this.selectors.reportsMenuActive}, ${this.selectors.dashboardMenuActive}`).first().isVisible({ timeout: 250 }).catch(() => false);
            if (legacyActive) return;
            await this.page.waitForTimeout(250);
        }
    }

    async getCurrentAnalyticsPath(): Promise<string | null> {
        const url = new URL(this.page.url());
        return url.searchParams.get('path');
    }

    async assertAnalyticsRouteMounted(routeKey: keyof NewVendorDashboardPage['analytics']): Promise<void> {
        const path = this.analytics[routeKey];
        const got = await this.getCurrentAnalyticsPath();
        expect(got, `URL should preserve path=${path}`).toBe(path);

        const reactVisible = await this.page.locator(this.selectors.analyticsRoot).first().isVisible({ timeout: 5000 }).catch(() => false);
        const legacyActive = await this.page.locator(`${this.selectors.reportsMenuActive}, ${this.selectors.dashboardMenuActive}`).first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(
            reactVisible || legacyActive,
            `Route ${path} should render the React shell or the legacy menu should reflect the active state`,
        ).toBe(true);
    }

    // --------------------------------------------------------------------
    // NEW FULL-WIDTH DASHBOARD (HashRouter)
    // --------------------------------------------------------------------
    private newDashboardUrl(hashRoute = ''): string {
        const trimmed = hashRoute.startsWith('/') ? hashRoute : `/${hashRoute}`;
        return toPath(`dashboard/new/#${trimmed}`);
    }

    async gotoNewDashboardRoot(): Promise<void> {
        await this.page.goto(toPath(`dashboard/new/`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForNewDashboardReady();
    }

    async gotoNewDashboardRoute(hashRoute: string): Promise<void> {
        await this.page.goto(this.newDashboardUrl(hashRoute));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForNewDashboardReady();
    }

    async waitForNewDashboardReady(timeoutMs = 30000): Promise<void> {
        // Wait for the React root container to mount.
        await this.page.locator(this.selectors.newDashboardRoot).waitFor({ state: 'visible', timeout: timeoutMs });
        // Then wait for the loading skeleton to disappear (or content to fill in).
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const spinnerVisible = await this.page.locator(this.selectors.loadingSpinner).first().isVisible({ timeout: 250 }).catch(() => false);
            if (!spinnerVisible) return;
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoServerError(): Promise<boolean> {
        const fatal = await this.page.locator(this.selectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }
}
