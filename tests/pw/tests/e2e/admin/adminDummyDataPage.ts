import { Locator, Page, Route, Request } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — admin Dummy Data importer (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/dummy-data
// ============================================
// This is an ADMIN-only area. The importer has NO seedable list state — it is
// driven entirely by three option/CSV-backed REST endpoints
// (GET dokan/v1/dummy-data/status, POST .../import, DELETE .../clear, all
// gated on manage_woocommerce). To assert each of the three body states
// (StatusSkeleton / Importer / Result) deterministically WITHOUT polluting the
// DB, this page object MOCKS the read-only status + CSV endpoints via
// page.route and INTERCEPTS the destructive import/clear so the network call is
// observed but never reaches WordPress. Real (un-mocked) import/clear runs are
// kept @exploratory in the spec. Namespaced data uses the "ADD" prefix.
// ============================================
export const adminDummyDataData = {
    // A namespaced CSV header line (matches the real dummy-data.csv columns the
    // importer papaparses) plus one vendor row + one product row. The "ADD"
    // prefix keeps any accidentally-imported entity identifiable.
    csvHeader: 'type,id,first_name,last_name,username,email,store_name,name,description,vendor,attribute_1_name,attribute_1_value,attribute_1_visible,attribute_1_global,attribute_2_name,attribute_2_value,attribute_2_visible,attribute_2_global,manage_stock',
    vendorRow: 'vendor,1,ADD,Vendor,add_dummy_vendor,add_dummy_vendor@example.test,ADD Dummy Store,,,,,,,,,,,,',
    productRow: 'product,,,,,,,ADD Dummy Product,A dummy product,1,Color,"Red,Blue",yes,,Size,"S,M",yes,,1',
} as const;

// ============================================
// ENDPOINT GLOBS — used with page.route() / page.waitForRequest().
// ============================================
export const adminDummyDataEndpoints = {
    status: '**/dokan/v1/dummy-data/status**',
    import: '**/dokan/v1/dummy-data/import**',
    clear: '**/dokan/v1/dummy-data/clear**',
    // The CSV file the importer fetches on mount lives at
    // window.dokanAdminDashboard.urls.dummy_data — a .csv asset under the plugin.
    csv: '**/*.csv**',
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/dummy-data/{index,Importer,Result,StatusSkeleton}.tsx
// The page mounts the React admin dashboard on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/dummy-data (HashRouter, .pui-root shell).
// ============================================
export const adminDummyDataSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    puiRoot: '#dokan-admin-dashboard .pui-root',
    // StatusSkeleton — wrapper has .animate-pulse and an sr-only "Loading…".
    skeleton: '.animate-pulse',
    // Importer body — native <progress> element + "Run the Importer" button.
    progressBar: 'progress',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// Status endpoint response shapes the importer branches on.
export const statusYes = { import_status: 'yes' };
export const statusNo = { import_status: 'no' };

// ============================================
// PAGE OBJECT — admin Dummy Data importer (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/dummy-data
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Clear-Data confirmation modal).
// ============================================
export class AdminDummyDataPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/dummy-data');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminDummyDataSelectors.reactRoot).first();
    }
    get puiRoot(): Locator {
        return this.page.locator(adminDummyDataSelectors.puiRoot).first();
    }
    /** The page <h2> heading "Dummy data". */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Dummy data', exact: true }).first();
    }
    /** The card sub-heading "Import dummy vendors and products". */
    get cardHeading(): Locator {
        return this.page.getByRole('heading', { name: /Import dummy vendors and products/i }).first();
    }
    get backToToolsButton(): Locator {
        return this.page.getByRole('button', { name: /Back to Tools/i }).first();
    }

    // --- Importer body ---
    get importerHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Data Importer', exact: true }).first();
    }
    get progressBar(): Locator {
        return this.page.locator(adminDummyDataSelectors.progressBar).first();
    }
    get runImporterButton(): Locator {
        return this.page.getByRole('button', { name: /Run the Importer/i }).first();
    }

    // --- Result body ---
    get completeHeading(): Locator {
        return this.page.getByRole('heading', { name: /Dummy Data Import complete/i }).first();
    }
    get viewVendorsButton(): Locator {
        return this.page.getByRole('button', { name: /View Dummy Vendors/i }).first();
    }
    get viewProductsLink(): Locator {
        return this.page.getByRole('link', { name: /View Dummy Products/i }).first();
    }
    get clearDataButton(): Locator {
        return this.page.getByRole('button', { name: /Clear Data/i }).first();
    }

    // --- Skeleton ---
    get skeleton(): Locator {
        return this.page.locator(adminDummyDataSelectors.skeleton).first();
    }

    // --- Clear confirmation modal (DokanModal, heading "Confirmation") ---
    get confirmModal(): Locator {
        return this.page.getByRole('dialog').first();
    }
    get confirmModalTitle(): Locator {
        return this.page.getByRole('heading', { name: 'Confirmation', exact: true }).first();
    }
    get confirmModalDescription(): Locator {
        return this.page.getByText(/Are you sure you want to remove all dummy data\?/i).first();
    }

    // ---- Mocking (route-mock the option/CSV-backed endpoints) ----
    /** Stub GET dokan/v1/dummy-data/status with {import_status}. */
    async mockStatus(body: typeof statusYes | typeof statusNo): Promise<void> {
        await this.page.route(adminDummyDataEndpoints.status, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
        });
    }

    /** Delay GET status so the StatusSkeleton stays observable, then resolve. */
    async mockStatusDelayed(body: typeof statusYes | typeof statusNo, delayMs = 3000): Promise<void> {
        await this.page.route(adminDummyDataEndpoints.status, async (route: Route) => {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
        });
    }

    /** Fail GET status with a 500 so the error toast fires and the skeleton clears. */
    async mockStatusError(message = 'Something went wrong'): Promise<void> {
        await this.page.route(adminDummyDataEndpoints.status, async (route: Route) => {
            await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'internal_error', message }) });
        });
    }

    /** Serve a deterministic namespaced CSV for the mount-time CSV fetch. */
    async mockCsv(rows: string[] = [adminDummyDataData.vendorRow, adminDummyDataData.productRow]): Promise<void> {
        const body = [adminDummyDataData.csvHeader, ...rows].join('\n');
        await this.page.route(adminDummyDataEndpoints.csv, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'text/csv', body });
        });
    }

    /** Intercept POST import so it is OBSERVED but never reaches WordPress.
     * Returns the incoming vendor_index + 1 so the importer recursion advances
     * and reaches 100% without writing any rows to the DB. */
    async stubImport(): Promise<void> {
        await this.page.route(adminDummyDataEndpoints.import, async (route: Route, req: Request) => {
            let nextIndex = 1;
            try {
                const data = req.postDataJSON() as { vendor_index?: number };
                nextIndex = (data?.vendor_index ?? 0) + 1;
            } catch {
                nextIndex = 1;
            }
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ vendor_index: nextIndex }) });
        });
    }

    /** Intercept DELETE clear so it is OBSERVED but never reaches WordPress. */
    async stubClear(): Promise<void> {
        await this.page.route(adminDummyDataEndpoints.clear, async (route: Route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        });
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React shell (.pui-root) is visible. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.puiRoot.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminDummyDataSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** The native <progress> value as a number (0..100). */
    async progressValue(): Promise<number> {
        const val = await this.progressBar.getAttribute('value');
        return Number(val ?? '0');
    }

    // ---- Actions ----
    /** Click "Run the Importer" (caller must have stubbed POST import first). */
    async clickRunImporter(): Promise<void> {
        await this.runImporterButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.runImporterButton.click();
    }

    /** Open the Clear-Data confirmation modal WITHOUT confirming. */
    async openClearModal(): Promise<void> {
        await this.clearDataButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.clearDataButton.click();
        await this.confirmModalTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Click the modal's confirm button (DokanModal default "Confirm"). */
    async confirmClear(): Promise<void> {
        const btn = this.confirmModal.getByRole('button', { name: /^(Confirm|Yes|Delete|Clear|Remove)/i }).last();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
    }

    /** Dismiss the modal via its Cancel/Close affordance, without confirming. */
    async cancelClear(): Promise<void> {
        const cancel = this.confirmModal.getByRole('button', { name: /^(Cancel|Close|No)/i }).first();
        if (await cancel.isVisible().catch(() => false)) {
            await cancel.click();
            return;
        }
        // Fallback: Escape closes the DokanModal.
        await this.page.keyboard.press('Escape');
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Dummy Data UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
