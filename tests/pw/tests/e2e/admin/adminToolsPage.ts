import { Locator, Page, Route, Request } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — Admin Tools (Dokan 5.0.0+ React admin dashboard, Pro surface)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/tools
// ============================================
// This is an ADMIN-only ACTION-BUTTONS page (template: Dummy Data). It is a
// bespoke card list (Tools.tsx) of "tool sections" — NOT a DataViews table.
// Every section is a <ToolsSection> wrapper carrying a stable id on its outer
// <div> (create_pages, regenerate_order_commission, check_duplicate_suborders,
// rewrite_product_variations_author, dokan_import_dummy_data, distance_matrix),
// a name <h2>, a description <p>, and a single DokanButton.
//
// SAFETY: the actions are destructive / env-polluting — they regenerate sync
// tables, queue background commission rebuilds, scan every order, create WP
// pages and (via navigation) import dummy vendors/products. So NO test clicks a
// destructive button against the real backend. The one safe-to-exercise success
// flow (Installation Guide -> create-pages) is driven entirely by page.route
// MOCKS of its REST endpoints (route.fulfill), so the click is observed and the
// success toast renders WITHOUT WordPress creating any pages. Anything that
// would need a real, un-mocked destructive call is left untested or, where the
// affordance must be exercised, tagged @exploratory with a stubbed network.
//
// The tool endpoints all live under dokan/v1/admin/tools/* (ToolsController,
// namespace dokan/v1/admin, base 'tools') gated on manage_woocommerce.
// ============================================
export const adminToolsData = {
    // Section wrapper ids (ToolsSection renders id={type.id} on its outer div).
    // ImportDummyData has no own REST call — its button just navigates to
    // #/dummy-data. DistanceMatrix only mounts when the Table Rate Shipping
    // module is active (active_modules includes 'table_rate_shipping').
    sections: {
        createPages: 'create_pages',
        regenerateCommission: 'regenerate_order_commission',
        duplicateOrders: 'check_duplicate_suborders',
        regenerateVariableAuthor: 'rewrite_product_variations_author',
        importDummyData: 'dokan_import_dummy_data',
        distanceMatrix: 'distance_matrix',
    },
    // Visible section names (ToolsSection <h2>).
    names: {
        createPages: 'Installation Guide',
        regenerateCommission: 'Regenerate Order Commission',
        duplicateOrders: 'Duplicate Order Checker',
        regenerateVariableAuthor: 'Regenerate Variable Product Author IDs',
        importDummyData: 'Import Dummy Vendors and Products',
        distanceMatrix: 'Distance Matrix API Test',
    },
    // Visible button labels (ToolsSection DokanButton label). NOTE three sections
    // share the "Regenerate" label, so button lookups MUST be section-scoped.
    buttons: {
        regenerate: 'Regenerate',
        checkOrders: 'Check Orders',
        importDummyData: 'Import Dummy Data',
        getDistance: 'Get Distance',
    },
} as const;

// ============================================
// ENDPOINT GLOBS — used with page.route() / page.waitForRequest().
// All under dokan/v1/admin/tools/*. Trailing ** captures any query string.
// ============================================
export const adminToolsEndpoints = {
    // InstallationGuide GETs this on mount; if all_pages_exists it DISABLES the
    // Regenerate button. Mock it to false to keep create-pages clickable.
    checkPages: '**/dokan/v1/admin/tools/check-all-dokan-pages-exists**',
    createPages: '**/dokan/v1/admin/tools/create-pages**',
    regenerateCommission: '**/dokan/v1/admin/tools/regenerate-order-commission**',
    duplicateOrders: '**/dokan/v1/admin/tools/check-duplicate-suborders**',
    regenerateVariableAuthor: '**/dokan/v1/admin/tools/rewrite-product-variations-author**',
    getDistance: '**/dokan/v1/admin/tools/get-distance-btwn-address**',
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/components/Tools/{Tools,ToolsSection}.tsx + sections/*.
// The page mounts the React admin dashboard on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/tools (HashRouter).
// ============================================
export const adminToolsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // ToolsSection wrapper: <div id={type.id}> — scope button lookups to this.
    section: (id: string) => `#dokan-admin-dashboard #${id}`,
    // Native <progress> inside a section (Duplicate Order Checker only).
    progressBar: 'progress',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — Admin Tools (Dokan 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/tools (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler.
// ============================================
export class AdminToolsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/tools');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminToolsSelectors.reactRoot).first();
    }
    /** The page <h2> heading "Tools". */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Tools', exact: true }).first();
    }
    /** The card sub-heading "Essential Marketplace Tools". */
    get cardHeading(): Locator {
        return this.page.getByRole('heading', { name: /Essential Marketplace Tools/i }).first();
    }

    /** A tool section's wrapper <div id={id}>. */
    section(id: string): Locator {
        return this.page.locator(adminToolsSelectors.section(id)).first();
    }

    /** The section's name <h2> (located by its stable id wrapper). */
    sectionName(id: string): Locator {
        return this.section(id).getByRole('heading').first();
    }

    /** The single DokanButton inside a section, scoped to its id wrapper so the
     * three shared-label "Regenerate" buttons don't collide. */
    sectionButton(id: string): Locator {
        return this.section(id).getByRole('button').first();
    }

    /** The Duplicate Order Checker's native <progress> bar (only renders after click). */
    get duplicateProgressBar(): Locator {
        return this.section(adminToolsData.sections.duplicateOrders).locator(adminToolsSelectors.progressBar).first();
    }

    // --- Distance Matrix inputs ---
    get distanceAddress1(): Locator {
        return this.page.locator('#address1').first();
    }
    get distanceAddress2(): Locator {
        return this.page.locator('#address2').first();
    }

    // --- Toasts (react-hot-toast via DokanToaster; title rendered as text) ---
    toast(text: string | RegExp): Locator {
        return this.page.getByText(text).first();
    }

    // ---- Mocking (route-mock the tool REST endpoints) ----
    /** Stub GET check-all-dokan-pages-exists so the Regenerate button stays
     * ENABLED (all_pages_exists:false). Without this the button may be disabled
     * on mount in environments where the pages already exist. */
    async mockCheckPages(allExist = false): Promise<void> {
        await this.page.route(adminToolsEndpoints.checkPages, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ all_pages_exists: allExist }) });
        });
    }

    /** Stub POST create-pages with a success body (never reaches WordPress). */
    async stubCreatePages(message = 'Required pages created or already exist.'): Promise<void> {
        await this.page.route(adminToolsEndpoints.createPages, async (route: Route) => {
            await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message }) });
        });
    }

    /** Make POST create-pages fail with a 500 (the section toasts an error). */
    async stubCreatePagesError(message = 'Could not create pages.'): Promise<void> {
        await this.page.route(adminToolsEndpoints.createPages, async (route: Route) => {
            await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'internal_error', message }) });
        });
    }

    /** Stub POST regenerate-order-commission with a success body. */
    async stubRegenerateCommission(message = 'Order commission regeneration has been queued.'): Promise<void> {
        await this.page.route(adminToolsEndpoints.regenerateCommission, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message }) });
        });
    }

    /** Stub POST rewrite-product-variations-author with a success body. */
    async stubRegenerateVariableAuthor(message = 'Variable product author rewrite has been queued.'): Promise<void> {
        await this.page.route(adminToolsEndpoints.regenerateVariableAuthor, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message }) });
        });
    }

    /** Stub POST check-duplicate-suborders so the recursive scan completes in one
     * pass (done:'All') and the progress bar reaches 100% without touching the DB. */
    async stubDuplicateOrders(): Promise<void> {
        await this.page.route(adminToolsEndpoints.duplicateOrders, async (route: Route, req: Request) => {
            let total = 0;
            try {
                const data = req.postDataJSON() as { total_orders?: number };
                total = Number(data?.total_orders ?? 0);
            } catch {
                total = 0;
            }
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ offset: 'All', done: 'All', total_orders: total, message: 'Duplicate order check finished.' }),
            });
        });
    }

    /** Stub POST get-distance-btwn-address with a success body (never hits the
     * Google Distance Matrix API). */
    async stubGetDistance(distance = '12.3 km'): Promise<void> {
        await this.page.route(adminToolsEndpoints.getDistance, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ distance, message: distance }) });
        });
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root + the "Tools" heading are visible. */
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
            .locator(adminToolsSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** True if a tool section is present (some sections are module-gated, e.g.
     * Distance Matrix needs Table Rate Shipping). Uses waitFor (NOT
     * isVisible({timeout}), which snapshots and ignores its timeout). */
    async isSectionVisible(id: string, timeoutMs = 10000): Promise<boolean> {
        try {
            await this.section(id).waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    /** The Duplicate Order Checker <progress> value as a number (0..100). */
    async duplicateProgressValue(): Promise<number> {
        const val = await this.duplicateProgressBar.getAttribute('value');
        return Number(val ?? '0');
    }

    // ---- Actions ----
    /** Click a section's button (caller must have stubbed its endpoint first). */
    async clickSectionButton(id: string): Promise<void> {
        const btn = this.sectionButton(id);
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Tools UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
