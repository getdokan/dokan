import { Locator, Page } from '@playwright/test';

// ============================================================================
// Shared @wedevs/plugin-ui DataViews helpers (NEW_UI_HOUSE_STYLE.md §5).
//
// One canonical home for the DataViews patterns that were previously
// copy-pasted between spec folders (orders/newOrderListPage.ts →
// new-orders / new-seller-badge / new-store-reviews / new-withdraw /
// vendor-products) and the admin-side tests/e2e/admin/adminDataViews.ts
// (which now re-exports this module).
//
// Two readiness models coexist here on purpose:
//   - waitForDataViewsSettle(): the admin model — debounce + networkidle +
//     skeleton-gone + fresh-paint poll. Kept byte-compatible with the former
//     adminDataViews.ts implementation (~29 admin importers rely on it).
//   - waitForListReady(): the vendor model — poll rows OR empty state OR a
//     surface-specific extra readiness signal, 250ms interval (§5 contract).
// Surface-specific orchestration (REST-gated search, skeleton-row math,
// DokanModal confirms) stays in each folder's page object, composed from
// these primitives.
// ============================================================================

// ---- Selector constants ----------------------------------------------------

/** The vendor React dashboard SPA mount point (templates/dashboard/new-dashboard.php). */
export const REACT_ROOT = '#dokan-vendor-dashboard-root';

/** A DataViews loading-skeleton placeholder (rendered while isLoading is true). */
export const SKELETON = '[data-slot="skeleton"]';

/** Skeleton superset: some vendor surfaces render the animate-pulse variant. */
export const SKELETON_ANY = '[data-slot="skeleton"], .animate-pulse';

/** A real (non-skeleton) DataViews table row — excludes loading rows. */
export const DATA_ROW = 'table tbody tr:not(:has([data-slot="skeleton"]))';

/** Any body row, INCLUDING skeleton placeholder rows shown while loading. */
export const DATA_ROW_ANY = 'table tbody tr';

/**
 * A settled data row across both DataViews renderings (table and role=row
 * grid): no skeleton placeholder, no animate-pulse bar, not the header row.
 */
export const DATA_ROW_SETTLED = 'table tbody tr:not(:has([data-slot="skeleton"])):not(:has(.animate-pulse)), [role="rowgroup"] [role="row"]:not(:has([role="columnheader"])):not(:has([data-slot="skeleton"])):not(:has(.animate-pulse))';

/** Per-row 3-dot actions button (scoped to tbody — the toolbar also has one). */
export const ROW_ACTIONS_BTN = "//tbody//tr//button[@aria-label='Actions']";

/** An action-menu item rendered by DataViews, matched by exact visible label. */
export const actionMenuItem = (label: string): string => `//*[@role='menuitem'][normalize-space()='${label}']`;

/** A status tab (role=tab button whose accessible name starts with the label). */
export const statusTab = (label: string): string => `[role="tab"]:has-text("${label}")`;

/** DataViews header search input ("Search", "Search Orders", …). */
export const SEARCH_INPUT = 'input[type="search"], input[placeholder*="Search"]';

/** The funnel icon that toggles the Add Filter / Reset panel open. */
export const FILTER_ICON_BTN = 'button[title="Filter"]';
export const ADD_FILTER_BTN = 'button:has-text("Add Filter")';
export const RESET_FILTER_BTN = 'button:has-text("Reset")';

/** PHP fatal markers — every new-UI page object exposes hasNoPhpFatal() on this. */
export const PHP_FATAL = 'text=/Fatal error|Parse error|There has been a critical error/i';

/** Generic DataViews empty-state copy (per-surface extras stay in the folder). */
export const DATAVIEWS_EMPTY = /no data found|nothing to show|no items|no results|no [a-z]+ found/i;

/** Parses the count out of a tab's accessible name, e.g. "Approved (3)" -> 3. */
export const TAB_COUNT_RE = /\((\d+)\)/;

// ---- Readiness --------------------------------------------------------------

/** Wait for the vendor React dashboard SPA root to mount.
 *  Default 60s (was 30s): a MAX budget that returns as soon as the root paints,
 *  so it costs nothing on a fast (local) env — it only gives the heavy React
 *  surfaces (product editor ~37s) headroom on slower CI runners. */
export async function waitForRootReady(page: Page, timeoutMs = 60000): Promise<void> {
    await page.locator(REACT_ROOT).first().waitFor({ state: 'visible', timeout: timeoutMs });
}

export interface ListReadyOpts {
    /** Total poll budget (default 15s — REST list calls are slow on the polluted live DB). */
    timeoutMs?: number;
    /** Row selector that signals data has painted (default DATA_ROW_ANY). */
    rowSelector?: string;
    /** Empty-state signal: a Playwright selector string or a text RegExp (default DATAVIEWS_EMPTY). */
    emptyState?: string | RegExp;
    /** Surface-specific extra readiness signal (e.g. the status-tab strip is visible). */
    extraReady?: () => Promise<boolean>;
}

/**
 * The §5 vendor list-ready contract: the list is ready when >=1 row OR an
 * empty-state OR a surface-specific extra signal is present — poll at 250ms
 * up to `timeoutMs`. Call waitForRootReady() first (or use a page-object
 * method that does).
 */
export async function waitForListReady(page: Page, opts: ListReadyOpts = {}): Promise<void> {
    const timeoutMs = opts.timeoutMs ?? 30000; // was 15s — MAX budget, returns early; extra headroom for slow CI.
    const rows = page.locator(opts.rowSelector ?? DATA_ROW_ANY);
    const empty = typeof opts.emptyState === 'string' ? page.locator(opts.emptyState) : page.getByText(opts.emptyState ?? DATAVIEWS_EMPTY);
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if ((await rows.count()) > 0) return;
        if ((await empty.count()) > 0) return;
        if (opts.extraReady && (await opts.extraReady().catch(() => false))) return;
        await page.waitForTimeout(250);
    }
}

/**
 * Wait for a DataViews list to settle after a tab switch, search, or initial
 * load. The list refetches asynchronously and paints stale/cached rows first, so
 * reading row counts / empty state too early yields stale data. We let the
 * debounced request dispatch, wait for the network to go idle, then confirm the
 * table painted its fresh state (>=1 row OR the empty state). Network waits fall
 * back to their timeout (never throw) so background polling can't wedge the suite.
 */
export async function waitForDataViewsSettle(page: Page, opts: { timeout?: number; debounceMs?: number } = {}): Promise<void> {
    const timeout = opts.timeout ?? 20000; // was 10s — networkidle/skeleton waits fall back gracefully; headroom for slow CI.
    const debounceMs = opts.debounceMs ?? 350;

    await page.waitForTimeout(debounceMs); // let a debounced search/tab request dispatch.
    await page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);

    // Wait out the loading skeleton so its <tr>s aren't read as fresh data.
    await page
        .locator(SKELETON)
        .first()
        .waitFor({ state: 'hidden', timeout })
        .catch(() => undefined);

    const rows = page.locator(DATA_ROW);
    const empty = page.getByText(/no data found/i).first();
    const start = Date.now();
    while (Date.now() - start < 5000) {
        if (await empty.isVisible({ timeout: 250 }).catch(() => false)) {
            return; // terminal empty state painted.
        }
        if ((await rows.count()) > 0) {
            return; // fresh rows painted.
        }
        await page.waitForTimeout(150);
    }
}

// ---- Reads ------------------------------------------------------------------

/** No PHP fatal / critical-error markup on the page (the standing oracle). */
export async function hasNoPhpFatal(page: Page): Promise<boolean> {
    const fatal = await page
        .locator(PHP_FATAL)
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);
    return !fatal;
}

/**
 * Raw row count — does NOT settle and does NOT exclude skeleton rows. Use for
 * surfaces without a skeleton loading state, after an explicit settle, or when
 * reproducing the legacy skeleton-blind semantics.
 */
export async function rawRowCount(page: Page, rowSelector: string = DATA_ROW_ANY): Promise<number> {
    return await page.locator(rowSelector).count();
}

/** True when an empty-state signal is visible (selector string or text RegExp). */
export async function isEmptyStateVisible(page: Page, empty: string | RegExp = DATAVIEWS_EMPTY, timeout = 2000): Promise<boolean> {
    const locator = typeof empty === 'string' ? page.locator(empty) : page.getByText(empty);
    return await locator
        .first()
        .isVisible({ timeout })
        .catch(() => false);
}

/** Parse the numeric count from a tab's text, e.g. "Available Badges (3)" -> 3. */
export function parseTabCount(text: string | null | undefined): number {
    const match = (text ?? '').match(TAB_COUNT_RE);
    return match ? Number(match[1]) : 0;
}

// ---- Interactions -----------------------------------------------------------

/**
 * Open the per-row 3-dot Actions menu. Pass `readyItem` (a menu label that is
 * always present on the surface, e.g. 'View' / 'Quick view' / 'Cancel') to wait
 * for the menu to actually render before returning.
 */
export async function openRowActionMenu(page: Page, index = 0, readyItem?: string): Promise<void> {
    const buttons = page.locator(ROW_ACTIONS_BTN);
    await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
    await buttons.nth(index).click();
    if (readyItem) {
        await page
            .locator(actionMenuItem(readyItem))
            .first()
            .waitFor({ state: 'visible', timeout: 5000 })
            .catch(() => undefined);
    }
}

export async function clickActionMenuItem(page: Page, label: string): Promise<void> {
    await page.locator(actionMenuItem(label)).first().click();
}

export interface DebouncedSearchOpts {
    /** Search input selector (default SEARCH_INPUT). */
    selector?: string;
    /** Fixed post-fill debounce (DataViews commits the query ~300-500ms after typing). */
    debounceMs?: number;
}

/**
 * Debounce-based DataViews search fill. Surfaces whose refetch can be observed
 * on the wire should prefer a REST-response-gated fill in their page object
 * (see new-orders/newOrdersPage.ts) — this helper is the fixed-sleep fallback.
 */
export async function fillDataViewsSearch(page: Page, query: string, opts: DebouncedSearchOpts = {}): Promise<void> {
    const input = page.locator(opts.selector ?? SEARCH_INPUT).first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(query);
    await page.waitForTimeout(opts.debounceMs ?? 800);
}

export async function clearDataViewsSearch(page: Page, opts: DebouncedSearchOpts = {}): Promise<void> {
    const input = page.locator(opts.selector ?? SEARCH_INPUT).first();
    if (await input.isVisible().catch(() => false)) {
        await input.fill('');
        await page.waitForTimeout(opts.debounceMs ?? 600);
    }
}

// ---- Filter panel (funnel toggle) --------------------------------------------

/**
 * Open the filter row. The Add Filter / Reset controls live in a panel that
 * DataViews keeps hidden (display:none) until the funnel icon
 * (button[title="Filter"]) toggles it into view. Idempotent: if Reset is
 * already visible the panel is open, so we don't click the funnel again
 * (which would toggle it back closed).
 */
export async function openFilterPanel(page: Page): Promise<void> {
    const reset = page.locator(RESET_FILTER_BTN).first();
    if (await reset.isVisible().catch(() => false)) return;
    const funnel = page.locator(FILTER_ICON_BTN).first();
    if (await funnel.isVisible().catch(() => false)) {
        await funnel.click();
        await reset.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }
}

/** Either the expanded Add Filter/Reset controls or the funnel affordance exists. */
export async function hasFilterControls(page: Page): Promise<boolean> {
    await openFilterPanel(page);
    const addFilter = await page
        .locator(ADD_FILTER_BTN)
        .first()
        .isVisible()
        .catch(() => false);
    const reset = await page
        .locator(RESET_FILTER_BTN)
        .first()
        .isVisible()
        .catch(() => false);
    const funnel = await page
        .locator(FILTER_ICON_BTN)
        .first()
        .isVisible()
        .catch(() => false);
    return (addFilter && reset) || funnel;
}

// ---- Inline action confirm (role="alertdialog") -------------------------------
// Shared helpers for the @wedevs/plugin-ui DataViews inline action confirm
// (role="alertdialog") used across every Dokan admin DataView table. The primary
// confirm label is inconsistent across tables (bare verb vs "Yes, <Verb>"), so
// the helpers target "the button that is NOT the exact 'Cancel' dismiss" rather
// than matching a verb.

/** The Plugin UI DataViews inline confirm (role="alertdialog"). */
export function dataViewsConfirm(page: Page): Locator {
    return page.getByRole('alertdialog').first();
}

/**
 * Click the primary confirm button (everything that is NOT the exact "Cancel"
 * dismiss button), so it is robust even for actions like "Cancel Withdrawal"
 * whose confirm button itself contains the word "Cancel".
 */
export async function confirmDataViewsAction(page: Page, timeout = 10000): Promise<void> {
    const dialog = dataViewsConfirm(page);
    await dialog.waitFor({ state: 'visible', timeout });
    const confirm = dialog
        .getByRole('button')
        .filter({ hasNotText: /^Cancel$/ })
        .last();
    await confirm.waitFor({ state: 'visible', timeout });
    await confirm.click();
    await page.waitForTimeout(1200); // mutation request + DataViews refetch/repaint.
}

/** Dismiss the inline confirm via its exact "Cancel" button (no mutation). */
export async function dismissDataViewsAction(page: Page, timeout = 10000): Promise<void> {
    const dialog = dataViewsConfirm(page);
    await dialog.waitFor({ state: 'visible', timeout });
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).first().click();
    await dialog.waitFor({ state: 'hidden', timeout }).catch(() => undefined);
}

/** True when the inline confirm is currently open. */
export async function isDataViewsConfirmOpen(page: Page, timeout = 5000): Promise<boolean> {
    return await dataViewsConfirm(page)
        .isVisible({ timeout })
        .catch(() => false);
}

// --- Generic DataViews filter validation -----------------------------------
// Drives the shared admin filter flow (Filter button -> popover field-name ->
// react-select option) so a smoke test can assert a filter reaches the backend
// AND re-renders the table.

export interface DataViewsFilterCheck {
    requestFragment: string;
    field: string | RegExp;
    option?: string | RegExp;
}

export interface DataViewsFilterResult {
    requestFired: boolean;
    requestUrl: string | null;
    rowCount: number;
    emptyVisible: boolean;
    skeletonStuck: boolean;
    noPhpFatal: boolean;
    /** Filter reached the backend AND the table repainted with no stuck skeleton / fatal. */
    ok: boolean;
}

export async function applyAndValidateDataViewsFilter(page: Page, check: DataViewsFilterCheck): Promise<DataViewsFilterResult> {
    const filterBtn = page.getByRole('button', { name: 'Filter', exact: true }).first();
    await filterBtn.waitFor({ state: 'visible', timeout: 10000 });
    await filterBtn.click();
    await page.waitForTimeout(600);

    // Scope to the popover — tables have a same-named sortable column header (e.g.
    // "Vendor"), so an unscoped match would sort the table instead.
    const popover = page.locator('.components-popover__content').last();
    await popover
        .getByRole('button', { name: check.field, exact: typeof check.field === 'string' })
        .first()
        .click();
    const control = page.locator('.react-select__control').first();
    await control.waitFor({ state: 'visible', timeout: 10000 });

    const reqPromise = page.waitForRequest(r => r.url().includes(check.requestFragment) && r.method() === 'GET', { timeout: 15000 }).catch(() => null);
    await control.click();
    const optionFilter = check.option ? { hasText: typeof check.option === 'string' ? new RegExp(`^${check.option}$`, 'i') : check.option } : undefined;
    const option = optionFilter ? page.locator('.react-select__option').filter(optionFilter).first() : page.locator('.react-select__option').first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    const req = await reqPromise;

    await waitForDataViewsSettle(page, { debounceMs: 600 });
    const rowCount = await page.locator(DATA_ROW).count();
    const emptyVisible = await page
        .getByText(DATAVIEWS_EMPTY)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
    const skeletonStuck = await page
        .locator(SKELETON)
        .first()
        .isVisible({ timeout: 500 })
        .catch(() => false);
    const noPhpFatal = !(await page
        .locator(PHP_FATAL)
        .first()
        .isVisible({ timeout: 500 })
        .catch(() => false));

    return {
        requestFired: !!req,
        requestUrl: req?.url() ?? null,
        rowCount,
        emptyVisible,
        skeletonStuck,
        noPhpFatal,
        ok: !!req && !skeletonStuck && noPhpFatal && (rowCount > 0 || emptyVisible),
    };
}
