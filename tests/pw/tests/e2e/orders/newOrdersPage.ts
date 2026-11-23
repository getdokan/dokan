import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    PHP_FATAL,
    actionMenuItem as dvActionMenuItem,
    hasNoPhpFatal as dvHasNoPhpFatal,
    openRowActionMenu,
} from '@utils/dataViews';

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/orders render
// (tmp-explore/orders.json + orders.html). DataViews list (Lite).
// ============================================
export const newOrdersSelectors = {
    reactRoot: REACT_ROOT,
    // The React orders surface wrapper (src/dashboard/orders/OrderList.tsx).
    ordersWrapper: '.dokan-orders-wrapper, .dokan-react-orders',
    heading: 'h3:has-text("Orders")',
    // Export control in the header actions.
    exportButton: 'button:has-text("Export All")',
    // "Export Filtered" entry — only present once the export dropdown is open.
    exportFilteredOption: 'button:has-text("Export Filtered")',
    // DataViews table + rows.
    dataViewsTable: 'table',
    dataRow: 'table tbody tr',
    columnHeader: 'table thead th',
    // Search input — DataViews header. Placeholder is "Search Orders".
    searchInput: 'input[placeholder="Search Orders"], input[placeholder*="Search"]',
    // Status tabs are role=tab buttons whose accessible name carries a count,
    // e.g. "All (0)", "Processing (0)". Match on the leading label.
    statusTab: (label: string) => `[role="tab"]:has-text("${label}")`,
    // Filter UI.
    addFilter: 'button:has-text("Add Filter")',
    reset: 'button:has-text("Reset")',
    // 3-dot row actions menu (scoped to tbody — the toolbar Actions shares the
    // same aria-label).
    rowActionsBtn: ROW_ACTIONS_BTN,
    // Action-menu items rendered by DataViews.
    actionMenuItem: dvActionMenuItem,
    // Destructive status-change actions are confirmed in an AlertDialog
    // (@wedevs/plugin-ui DataViews wraps `isDestructive` actions in a
    // confirmation popup). The popup carries data-slot="alert-dialog-content";
    // the confirm button data-slot="alert-dialog-action".
    confirmDialog: '[data-slot="alert-dialog-content"]',
    confirmButton: '[data-slot="alert-dialog-content"] [data-slot="alert-dialog-action"]',
    // Empty-state banner ("No Order Yet" / "All your orders will be listed here").
    emptyState: 'text=/No Order Yet|no orders|no items|nothing to show|create your first/i',
    // PHP fatal markers.
    phpFatal: PHP_FATAL,
    // The orders list REST endpoint the React hook fetches from
    // (useOrders → apiFetch '/dokan/v1/orders'). Used to wait on refetches.
    ordersRestPath: '/dokan/v1/orders',
} as const;

// Status-change menu items DataViews exposes (depend on the current status).
export const statusChangeActions = [
    'Change status to on-hold',
    'Change status to processing',
    'Change status to completed',
    'Change status to cancelled',
] as const;

// ============================================
// PAGE OBJECT — new React vendor Order list (Dokan 5.0.0+)
// Surface: /dashboard/new/#/orders (DataViews list, Lite).
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 — shared DataViews primitives
// come from @utils/dataViews; the REST-gated search/tab/settle orchestration
// below is orders-specific and stays local.
// ============================================
export class NewOrdersPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/orders');
    // Customer-facing WooCommerce My Account order pages.
    readonly myAccountOrdersUrl = toPath('my-account/orders/');
    readonly myAccountViewOrderUrl = (orderId: string | number): string => toPath(`my-account/view-order/${orderId}/`);

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get reactRoot(): Locator { return this.page.locator(newOrdersSelectors.reactRoot).first(); }
    get heading(): Locator { return this.page.locator(newOrdersSelectors.heading).first(); }
    get exportButton(): Locator { return this.page.locator(newOrdersSelectors.exportButton).first(); }
    get exportFilteredOption(): Locator { return this.page.locator(newOrdersSelectors.exportFilteredOption).first(); }
    get columnHeaders(): Locator { return this.page.locator(newOrdersSelectors.columnHeader); }
    get selectAllCheckbox(): Locator { return this.page.locator('input[aria-label="Select all"], input#inspector-checkbox-control-0').first(); }
    get searchInput(): Locator { return this.page.locator(newOrdersSelectors.searchInput).first(); }
    get emptyState(): Locator { return this.page.locator(newOrdersSelectors.emptyState).first(); }
    statusTab(label: string): Locator { return this.page.locator(newOrdersSelectors.statusTab(label)).first(); }
    actionMenuItem(label: string): Locator { return this.page.locator(newOrdersSelectors.actionMenuItem(label)).first(); }
    get confirmDialog(): Locator { return this.page.locator(newOrdersSelectors.confirmDialog).first(); }
    get confirmButton(): Locator { return this.page.locator(newOrdersSelectors.confirmButton).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /**
     * Wait until the React root is visible AND the DataViews list has actually
     * settled: the loading skeleton is gone AND either >=1 real data row OR the
     * empty-state banner is present.
     *
     * READINESS RACE this guards against: on initial load (and on a refetch
     * while `data` is still empty) the @wedevs/plugin-ui DataViews renders a
     * skeleton `<tbody>` of `per_page` placeholder `<tr>` rows, each containing a
     * `[data-slot="skeleton"]` div (the `bg-muted animate-pulse` Skeleton
     * component). Those skeleton rows match the generic `table tbody tr`
     * selector, so a naive "rows > 0" check returns immediately while the real
     * `/dokan/v1/orders` fetch is still in flight (slow on this large DB). A
     * read of getRowCount() then subtracts the skeletons back out and reports 0.
     *
     * We therefore poll until the skeleton rows disappear before deciding the
     * list is ready. The orders REST list call is slow on the polluted live DB,
     * so we poll up to ~15s.
     */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.waitForListSettled(15000);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- DataViews list helpers ----
    /**
     * Pure, non-blocking count of real data rows (skeletons excluded). While the
     * list loads/refetches, DataViews renders a skeleton `<tbody>` of `per_page`
     * placeholder `<tr>` rows, each containing a `[data-slot="skeleton"]` div, so
     * we subtract those. NOTE: this does NOT wait — a read taken mid-load (only
     * skeleton rows present) returns 0. Callers that need an accurate count must
     * settle the list first; `getRowCount()` does that for them.
     */
    private async countRealRows(): Promise<number> {
        const all = this.page.locator(newOrdersSelectors.dataRow);
        const skeleton = this.page.locator(`${newOrdersSelectors.dataRow}:has([data-slot="skeleton"])`);
        const total = await all.count();
        const skeletonRows = await skeleton.count();
        return total - skeletonRows;
    }

    /**
     * Settle the DataViews list, then return the count of real data rows.
     *
     * This is the public API the spec relies on. Settling first is essential:
     * the list is async-loaded from a slow `/dokan/v1/orders` call on a large
     * DB, and until it resolves the body holds only skeleton rows. Counting
     * before the skeleton clears would subtract those back out and report 0
     * even though seeded/accumulated orders exist — the readiness race behind
     * the original failures. After settling, the count reflects real rows (or 0
     * only when the genuine empty-state banner is shown).
     */
    async getRowCount(): Promise<number> {
        await this.waitForListSettled(15000);
        return this.countRealRows();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        // Settle first so this reflects the resolved list, not a mid-load frame
        // (the skeleton table and the empty banner never coexist).
        await this.waitForListSettled(15000);
        return await this.emptyState.isVisible({ timeout: 1000 }).catch(() => false);
    }

    /**
     * Type a query into the DataViews search box and wait for the list to
     * actually refetch.
     *
     * The search box is a controlled @wedevs/plugin-ui InputGroupInput whose
     * onChange is debounced 500ms before it commits the value to the view
     * (`view.search`) → filterArgs → the `/dokan/v1/orders` refetch in
     * useOrders. We wait on that REST response (carrying `search=<query>`)
     * rather than a fixed timeout so the assertion runs only after the list
     * has been refiltered. The list also flips to a loading skeleton during
     * the refetch, so we additionally wait for it to settle.
     */
    async fillSearch(query: string): Promise<void> {
        const input = this.searchInput;
        await input.waitFor({ state: 'visible', timeout: 10000 });

        const refetch = this.page
            .waitForResponse(
                res =>
                    res.url().includes(newOrdersSelectors.ordersRestPath) &&
                    decodeURIComponent(res.url()).includes(`search=${query}`) &&
                    res.request().method() === 'GET',
                { timeout: 15000 },
            )
            .catch(() => null);

        await input.click();
        await input.fill(query);
        await refetch;
        await this.waitForListSettled();
    }

    async clearSearch(): Promise<void> {
        const input = this.searchInput;
        if (!(await input.isVisible().catch(() => false))) return;

        const refetch = this.page
            .waitForResponse(
                res =>
                    res.url().includes(newOrdersSelectors.ordersRestPath) &&
                    res.request().method() === 'GET',
                { timeout: 15000 },
            )
            .catch(() => null);
        await input.fill('');
        await refetch;
        await this.waitForListSettled();
    }

    /**
     * Wait until the DataViews list has finished loading/refetching: the loading
     * skeleton rows are gone AND either >=1 real row OR the empty-state banner is
     * present. Guards every row-count / empty-state read against a mid-load
     * frame (the readiness race). Polls up to `timeoutMs` because the orders
     * REST list call is slow on the polluted live DB. Uses `countRealRows()`
     * (not `getRowCount()`) to avoid recursing back into this settle.
     */
    private async waitForListSettled(timeoutMs = 15000): Promise<void> {
        const skeleton = this.page.locator(`${newOrdersSelectors.dataRow}:has([data-slot="skeleton"])`);
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const loading = (await skeleton.count()) > 0;
            if (!loading) {
                const rows = await this.countRealRows();
                const empty = await this.emptyState.isVisible({ timeout: 100 }).catch(() => false);
                if (rows > 0 || empty) return;
            }
            await this.page.waitForTimeout(150);
        }
    }

    /** Click a status tab (e.g. "Processing", "Completed") and let it refilter. */
    async clickStatusTab(label: string): Promise<void> {
        const tab = this.statusTab(label);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);

        // Selecting a tab pushes a new `status` into filterArgs → a fresh
        // `/dokan/v1/orders` GET. Wait on that refetch, then on the list
        // settling, rather than a fixed delay, so the subsequent row-count read
        // is taken only once the refiltered list has resolved.
        const refetch = this.page
            .waitForResponse(
                res =>
                    res.url().includes(newOrdersSelectors.ordersRestPath) &&
                    res.request().method() === 'GET',
                { timeout: 15000 },
            )
            .catch(() => null);

        await tab.click();
        await refetch;
        await this.waitForListSettled();
    }

    /** Open the per-row 3-dot Actions menu and wait for "View" to render. */
    async openRowActionMenuByIndex(index = 0): Promise<void> {
        await openRowActionMenu(this.page, index, 'View');
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await this.actionMenuItem(label).click();
    }

    /** Which status-change actions are currently visible in the open menu. */
    async visibleStatusChangeActions(): Promise<string[]> {
        const visible: string[] = [];
        for (const label of statusChangeActions) {
            const present = await this.actionMenuItem(label).isVisible({ timeout: 500 }).catch(() => false);
            if (present) visible.push(label);
        }
        return visible;
    }

    /**
     * Drive a status-change action through the confirmation dialog and wait for
     * the resulting non-GET REST request.
     *
     * The DataViews status-change actions are flagged `isDestructive`, so
     * @wedevs/plugin-ui intercepts the menu-item click and pops a confirmation
     * AlertDialog instead of firing immediately. The actual
     * `PUT /dokan/v1/orders/:id` (useOrders → updateOrderStatus) only fires once
     * the dialog's confirm button is clicked. Clicking the menu item alone
     * issues no request — that was the bug.
     *
     * @param label the status-change menu item to invoke (e.g. "Change status to completed").
     * @returns whether a non-GET REST request was observed.
     */
    private async confirmStatusChange(label: string): Promise<boolean> {
        const item = this.actionMenuItem(label);
        await item.click();

        // The confirmation dialog appears; its confirm button repeats the label.
        await this.confirmDialog.waitFor({ state: 'visible', timeout: 5000 });

        // The status update is a PUT to /dokan/v1/orders/:id.
        const reqPromise = this.page
            .waitForRequest(
                req =>
                    req.url().includes(newOrdersSelectors.ordersRestPath) &&
                    req.method() !== 'GET',
                { timeout: 15000 },
            )
            .catch(() => null);

        await this.confirmButton.click();
        const req = await reqPromise;

        // Dialog closes and the list refetches once the mutation resolves.
        await this.confirmDialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
        return req !== null;
    }

    /**
     * Open the first row's action menu, invoke the first available status-change
     * action (confirming the dialog), and capture the non-GET REST request it
     * issues. Returns the label that was clicked (or null if none available).
     */
    async changeFirstRowStatusAndCaptureRequest(): Promise<{ label: string | null; sawNonGet: boolean }> {
        await this.openRowActionMenuByIndex(0);
        const available = await this.visibleStatusChangeActions();
        const label = available[0];
        if (!label) {
            await this.page.keyboard.press('Escape').catch(() => undefined);
            return { label: null, sawNonGet: false };
        }
        const sawNonGet = await this.confirmStatusChange(label);
        return { label, sawNonGet };
    }

    /**
     * Deterministically complete a SPECIFIC order by id, regardless of how many
     * other orders are seeded. Searches for the order id (which the order
     * column renders as `#<number|id>`), isolating it to a single row, then
     * drives that row's "Change status to completed" action through the
     * confirmation dialog. Returns whether the mutation's non-GET request fired.
     */
    async completeOrderById(orderId: string | number): Promise<boolean> {
        await this.fillSearch(String(orderId));
        // The order column links read "#<id>"; confirm the target row is present.
        const targetRow = this.page
            .locator(newOrdersSelectors.dataRow)
            .filter({ hasText: `#${orderId}` })
            .first();
        if (!(await targetRow.isVisible({ timeout: 5000 }).catch(() => false))) {
            return false;
        }
        const actionsBtn = targetRow.locator("button[aria-label='Actions']").first();
        await actionsBtn.click();
        const item = this.actionMenuItem('Change status to completed');
        if (!(await item.isVisible({ timeout: 2000 }).catch(() => false))) {
            await this.page.keyboard.press('Escape').catch(() => undefined);
            return false;
        }
        const sawNonGet = await this.confirmStatusChange('Change status to completed');
        await this.page.waitForTimeout(500);
        return sawNonGet;
    }

    async getColumnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map((t) => t.trim().toLowerCase());
    }

    /** Open the "Export All" header dropdown (reveals Export All / Export Filtered). */
    async openExportMenu(): Promise<void> {
        await this.exportButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.exportButton.click();
        await this.exportFilteredOption.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    /** A list row located precisely by its `#<id>` order link. */
    orderRowById(orderId: string | number): Locator {
        return this.page
            .locator(newOrdersSelectors.dataRow)
            .filter({ has: this.page.getByRole('link', { name: `#${orderId}`, exact: true }) })
            .first();
    }

    /** Tick the selection checkbox of a specific order row. */
    async selectOrderRow(orderId: string | number): Promise<void> {
        const cb = this.orderRowById(orderId).locator('input[type="checkbox"]').first();
        await cb.waitFor({ state: 'visible', timeout: 10000 });
        await cb.check();
        await this.page.waitForTimeout(300);
    }

    /**
     * Click a bulk status-change toolbar button (e.g. "Change status to completed")
     * for the currently-selected rows and confirm the destructive AlertDialog if
     * it appears. Settles the list afterwards. Caller verifies the outcome.
     */
    async bulkChangeStatus(label: string): Promise<void> {
        const btn = this.page.getByRole('button', { name: label, exact: true }).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        if (await this.confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
            const req = this.page
                .waitForRequest(r => r.url().includes(newOrdersSelectors.ordersRestPath) && r.method() !== 'GET', { timeout: 15000 })
                .catch(() => null);
            await this.confirmButton.click();
            await req;
            await this.confirmDialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
        }
        await this.waitForListSettled();
    }

    /** Click the first row's "View" action and wait for navigation away from the list. */
    async viewFirstOrder(): Promise<void> {
        await this.openRowActionMenuByIndex(0);
        await Promise.all([
            this.page.waitForURL(url => !/#\/orders$/.test(url.toString()), { timeout: 15000 }).catch(() => undefined),
            this.clickActionMenuItem('View'),
        ]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // Customer-facing WooCommerce My Account order pages.
    // ============================================
    get customerOrderRows(): Locator {
        return this.page.locator('.woocommerce-orders-table tbody tr.woocommerce-orders-table__row, table.shop_table tbody tr.order');
    }

    async gotoMyAccountOrders(): Promise<void> {
        await this.page.goto(this.myAccountOrdersUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getCustomerOrderRowCount(): Promise<number> {
        await this.page
            .locator('.woocommerce-orders-table, table.shop_table, .woocommerce-MyAccount-content')
            .first()
            .waitFor({ state: 'visible', timeout: 15000 })
            .catch(() => undefined);
        return await this.customerOrderRows.count();
    }

    /** Open the customer order details page directly and confirm it rendered. */
    async customerViewOrderDetails(orderId: string | number): Promise<void> {
        await this.page.goto(this.myAccountViewOrderUrl(orderId));
        await this.page.waitForLoadState('domcontentloaded');
        await expect(
            this.page.locator('.woocommerce-order-details, .order_details, .woocommerce-MyAccount-content').first(),
            'customer order details should render',
        ).toBeVisible({ timeout: 15000 });
    }
}
