import { Locator, Page } from '@playwright/test';

// ============================================================================
// Shared helpers for the @wedevs/plugin-ui DataViews inline action confirm used
// across every Dokan admin DataView table (WP Admin → Dokan → React dashboard).
//
// The admin tables migrated from the hand-rolled DokanModal (role="dialog") to
// the Plugin UI DataViews built-in confirm. Verified live (2026-06-15):
//   • container: role="alertdialog", stable class `.pui-dataview-alert-dialog`
//   • <h2> heading (action title) + <p> description
//   • exactly two buttons: "Cancel" and a primary confirm.
//
// IMPORTANT: the primary confirm label is NOT consistent across tables — the
// `confirmButtonLabel` each action declares varies. Verified live (2026-06-15):
//   • bare verb: Withdraw ("Approve"), Abuse Reports ("Delete"), RFQ /
//     Store Reviews / Announcements ("Move to Trash"), Verifications ("Approve"),
//     Wholesale ("Deactivate").
//   • "Yes, <Verb>": Vendors ("Yes, Disable"), Seller Badge ("Yes, Delete"),
//     Advertising ("Yes, Expire"), Refunds ("Yes, Cancel").
// (This label inconsistency is a tracked UX nit — see the bug notes.) Because the
// label is unreliable, the confirm helper targets "the button that is NOT the
// exact 'Cancel' dismiss" instead of matching a verb. That is also why actions
// whose own verb is "Cancel" (e.g. Cancel Withdrawal → "Yes, Cancel") still work.
//
// The old page objects waited for getByRole('dialog') and clicked a button whose
// name equalled the action label ("Approve" / "Delete" / "Move to Trash"). Both
// assumptions broke: the role is now "alertdialog" and the confirm label moved.
// These helpers target the new surface in one place so the page objects don't
// each re-encode it.
// ============================================================================

/** The Plugin UI DataViews inline confirm (role="alertdialog"). */
export function dataViewsConfirm(page: Page): Locator {
    return page.getByRole('alertdialog').first();
}

/**
 * Click the primary confirm button of the inline confirm — i.e. everything that
 * is NOT the "Cancel" dismiss button (e.g. "Yes, Approve", "Yes, Delete").
 * Using "not exactly Cancel" is robust even for actions like "Cancel Withdrawal"
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
 * Wait for a DataViews list to SETTLE after a tab switch, search, or initial
 * load. The list refetches asynchronously (debounced search + REST roundtrip)
 * and paints STALE/cached rows first, so reading row counts / empty state too
 * early yields stale data — the root cause of the flaky "empty state" / "row
 * count" / "row not found" checks.
 *
 * The reliable signal is the refetch itself, so we:
 *   1. allow any debounced request to dispatch (`debounceMs`),
 *   2. wait for the network to go idle (the REST refetch completes),
 *   3. confirm the table has painted its fresh state (>=1 row OR the
 *      "No data found" empty state).
 * Network waits fall back to their timeout (never throw) so a page with
 * background polling can't wedge the suite.
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
