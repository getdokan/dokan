import { Locator, Page } from '@playwright/test';

/** A DataViews loading-skeleton placeholder (rendered while isLoading is true). */
export const SKELETON = '[data-slot="skeleton"]';
/** A real (non-skeleton) DataViews table row — excludes loading rows. */
export const DATA_ROW = 'table tbody tr:not(:has([data-slot="skeleton"]))';

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

/**
 * Wait for a DataViews list to settle after a tab switch, search, or initial
 * load. The list refetches asynchronously and paints stale/cached rows first, so
 * reading row counts / empty state too early yields stale data. We let the
 * debounced request dispatch, wait for the network to go idle, then confirm the
 * table painted its fresh state (>=1 row OR the empty state). Network waits fall
 * back to their timeout (never throw) so background polling can't wedge the suite.
 */
export async function waitForDataViewsSettle(
    page: Page,
    opts: { timeout?: number; debounceMs?: number } = {}
): Promise<void> {
    const timeout = opts.timeout ?? 10000;
    const debounceMs = opts.debounceMs ?? 350;

    await page.waitForTimeout(debounceMs); // let a debounced search/tab request dispatch.
    await page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);

    // Wait out the loading skeleton so its <tr>s aren't read as fresh data.
    await page.locator(SKELETON).first().waitFor({ state: 'hidden', timeout }).catch(() => undefined);

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

// --- Generic DataViews filter validation -----------------------------------
// Drives the shared admin filter flow (Filter button -> popover field-name ->
// react-select option) so a smoke test can assert a filter reaches the backend
// AND re-renders the table.

const DATAVIEWS_EMPTY = /no data found|nothing to show|no items|no results|no [a-z]+ found/i;
const PHP_FATAL = 'text=/Fatal error|Parse error|There has been a critical error/i';

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
    await popover.getByRole('button', { name: check.field, exact: typeof check.field === 'string' }).first().click();
    const control = page.locator('.react-select__control').first();
    await control.waitFor({ state: 'visible', timeout: 10000 });

    const reqPromise = page
        .waitForRequest(r => r.url().includes(check.requestFragment) && r.method() === 'GET', { timeout: 15000 })
        .catch(() => null);
    await control.click();
    const optionFilter = check.option
        ? { hasText: typeof check.option === 'string' ? new RegExp(`^${check.option}$`, 'i') : check.option }
        : undefined;
    const option = optionFilter ? page.locator('.react-select__option').filter(optionFilter).first() : page.locator('.react-select__option').first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    const req = await reqPromise;

    await waitForDataViewsSettle(page, { debounceMs: 600 });
    const rowCount = await page.locator(DATA_ROW).count();
    const emptyVisible = await page.getByText(DATAVIEWS_EMPTY).first().isVisible({ timeout: 3000 }).catch(() => false);
    const skeletonStuck = await page.locator(SKELETON).first().isVisible({ timeout: 500 }).catch(() => false);
    const noPhpFatal = !(await page.locator(PHP_FATAL).first().isVisible({ timeout: 500 }).catch(() => false));

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
