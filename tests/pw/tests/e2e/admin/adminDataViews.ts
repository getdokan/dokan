import { Locator, Page } from '@playwright/test';

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

    const rows = page.locator('table tbody tr');
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
