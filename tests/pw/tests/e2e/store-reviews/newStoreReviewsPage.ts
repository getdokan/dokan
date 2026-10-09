import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    SKELETON_ANY,
    DATA_ROW_SETTLED,
    PHP_FATAL,
    statusTab,
    waitForRootReady as dvWaitForRootReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    parseTabCount,
} from '@utils/dataViews';

// ============================================
// TEST DATA
// ============================================
// The React vendor `/reviews` surface (Dokan Pro `ReviewsController::get_reviews`)
// lists PRODUCT-review comments left on the vendor's products — NOT the
// `dokan_store_reviews` post type. So the seeded row is a product review created
// against the vendor's product (PRODUCT_ID), and the visible "Review" column is
// the comment content (`item.review`).
//
// The DataViews "Review" column truncates the content to 20 chars
// (constants.tsx -> ShortContent maxLength={20}). Keep `content` short enough to
// render in full, and assert against `matchText` (the leading, untruncated
// portion) so the assertion survives truncation.
const REVIEW_NANO = Math.random().toString(36).slice(2, 8); // unique per run
// Per-call counter so every seeded review has a distinct author + email. WP's
// duplicate-comment guard (wp_check_comment_duplicate) blocks a second comment
// with the same post + content + (author OR email); the suite seeds several
// reviews with the SAME body (so the matchText assertions stay deterministic),
// so we vary author AND email per call to avoid the 409 "duplicate" rejection.
let __reviewSeq = 0;
export const newStoreReviewData = {
    // Kept for backwards-compat with the spec's text assertions.
    title: 'pw-new-ui review',
    // The review body shown in the DataViews "Review" column (kept <= 20 chars
    // so it is not truncated, making the text assertion deterministic).
    content: `pwrev ${REVIEW_NANO}`,
    // The first ~18 chars are guaranteed to be visible even after truncation.
    matchText: `pwrev ${REVIEW_NANO}`,
    rating: 4,
    reviewer: 'pw new-ui customer',
    reviewer_email: 'customer1@g.com',
    /** WC product-review payload (POST wc/v3/products/reviews). Author + email
     *  are unique per call to dodge WP's duplicate-comment guard; the review
     *  BODY stays constant so the `matchText` list assertions remain stable. */
    review: () => {
        __reviewSeq += 1;
        const u = `${REVIEW_NANO}-${__reviewSeq}`;
        return {
            review: newStoreReviewData.content,
            reviewer: `${newStoreReviewData.reviewer} ${u}`,
            reviewer_email: `pwrev-${u}@example.com`,
            rating: newStoreReviewData.rating,
            status: 'approved' as const,
        };
    },
} as const;

export type StoreReviewPayload = ReturnType<typeof newStoreReviewData.review>;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/reviews render.
// DataViews list (unified @wedevs/plugin-ui). Status tabs render as
// <button role="tab"> whose text carries a count, e.g. "Approved (0)".
// Empty-state copy on a fresh list is exactly "No data found".
// ============================================
export const newStoreReviewsSelectors = {
    reactRoot: REACT_ROOT,
    heading: 'text=/^Reviews$/',
    // Status tabs are role=tab buttons; the count is part of the text but NOT
    // matched here so the selector is stable as the count changes.
    tab: statusTab,
    approvedTab: '[role="tab"]:has-text("Approved")',
    pendingTab: '[role="tab"]:has-text("Pending")',
    spamTab: '[role="tab"]:has-text("Spam")',
    trashTab: '[role="tab"]:has-text("Trash")',
    // DataViews table + rows (only present when the list has data).
    table: 'table, [role="table"]',
    // All body rows, INCLUDING skeleton placeholder rows shown while loading.
    dataRow: 'table tbody tr, [role="rowgroup"] [role="row"]',
    // Skeleton placeholder bars rendered inside loading rows
    // (@wedevs/plugin-ui DataViews: <div data-slot="skeleton" class="animate-pulse">).
    skeleton: SKELETON_ANY,
    // A settled data row = a body row that contains NO skeleton placeholder and
    // is NOT the column-header row (header cells use role=columnheader).
    settledRow: DATA_ROW_SETTLED,
    // Empty state copy verified on a fresh seed: "No data found".
    emptyState: 'text=/no data found/i',
    phpFatal: PHP_FATAL,
} as const;

// ============================================
// PAGE OBJECT — new React Store/Product Reviews list (Dokan 5.0.0+)
// Surface: /dashboard/new/#/reviews (DataViews). Pro feature.
// Self-contained per the house-style golden rule §1 (folders never import
// each other; shared DataViews primitives come from @utils/dataViews). The
// skeleton-aware settle loop is reviews-specific and stays local.
// ============================================
export class NewStoreReviewsPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/reviews');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newStoreReviewsSelectors.heading).first(); }
    get approvedTab(): Locator { return this.page.locator(newStoreReviewsSelectors.approvedTab).first(); }
    get pendingTab(): Locator { return this.page.locator(newStoreReviewsSelectors.pendingTab).first(); }
    get spamTab(): Locator { return this.page.locator(newStoreReviewsSelectors.spamTab).first(); }
    get trashTab(): Locator { return this.page.locator(newStoreReviewsSelectors.trashTab).first(); }
    get table(): Locator { return this.page.locator(newStoreReviewsSelectors.table).first(); }
    /** All body rows, including loading skeleton placeholder rows. */
    get rows(): Locator { return this.page.locator(newStoreReviewsSelectors.dataRow); }
    /** Body rows that have finished loading (carry no skeleton placeholder). */
    get settledRows(): Locator { return this.page.locator(newStoreReviewsSelectors.settledRow); }
    /** Loading skeleton placeholder bars (present only while a tab is fetching). */
    get skeletons(): Locator { return this.page.locator(newStoreReviewsSelectors.skeleton); }
    get emptyState(): Locator { return this.page.locator(newStoreReviewsSelectors.emptyState).first(); }

    /** A status tab by visible label ("Approved" | "Pending" | "Spam" | "Trash"). */
    tab(name: string): Locator { return this.page.locator(newStoreReviewsSelectors.tab(name)).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** React root visible AND (>=1 row OR empty-state text) present — poll up to 15s (§5). */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await dvWaitForRootReady(this.page, timeoutMs);
        await this.approvedTab.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
        await this.waitForSettle();
    }

    /**
     * Wait until the active tab has finished loading: the skeleton placeholder
     * rows are gone AND the list shows either real data rows or the empty state.
     * Skeleton rows (loading state) count as NOT settled, so we never return
     * while gray placeholder bars are still on screen.
     */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const skeletons = await this.skeletons.count();
            if (skeletons === 0) {
                const settled = await this.settledRows.count();
                if (settled > 0) return;
                if (await this.emptyState.isVisible().catch(() => false)) return;
                // No skeletons, no settled rows, no empty text yet: the list is
                // mid-transition (e.g. tab just switched). Give it a moment more.
            }
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- DataViews helpers ----
    /** Count of REAL data rows (excludes loading skeleton placeholder rows). */
    async getRowCount(): Promise<number> {
        await this.waitForSettle();
        return await this.settledRows.count();
    }

    /**
     * True when the list is empty. Robust against the DataViews skeleton/loading
     * state and against the empty block NOT rendering "No data found" text:
     *   1. Wait for the list to settle (skeleton placeholder rows gone).
     *   2. Count REAL data rows — body rows with no skeleton placeholder.
     *   3. Empty == zero settled data rows (the explicit "No data found" block is
     *      treated as a sufficient, but not necessary, signal).
     * On a fresh seed the Approved tab has 1 settled row; Spam/Trash have 0.
     */
    async isEmpty(): Promise<boolean> {
        await this.waitForSettle();
        // Belt-and-braces: ensure no skeletons remain before counting.
        await this.skeletons.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => undefined);
        const settled = await this.settledRows.count();
        if (settled > 0) return false;
        // Zero settled data rows => empty (with or without the "No data found" copy).
        return true;
    }

    /** Click a status tab and wait for the list to re-settle (rows or empty). */
    async openTab(name: string): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.click();
        // Wait until this tab is marked selected so the re-filter has begun.
        await tab.evaluate((el) => el.getAttribute('aria-selected') === 'true').catch(() => undefined);
        await this.page.locator(`${newStoreReviewsSelectors.tab(name)}[aria-selected="true"]`)
            .first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await this.waitForSettle(8000);
    }

    /** Read the count from a tab's text, e.g. "Approved (3)" -> 3. */
    async getTabCount(name: string): Promise<number> {
        return parseTabCount(await this.tab(name).textContent());
    }

    /** Is the given review text visible anywhere in the rendered list? */
    async hasReviewText(text: string): Promise<boolean> {
        return await this.page.locator(`text=${text}`).first().isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** Total count across the Approved + Pending tabs (where a fresh review lands). */
    async getActiveReviewCount(): Promise<number> {
        const approved = await this.getTabCount('Approved');
        const pending = await this.getTabCount('Pending');
        return approved + pending;
    }

    /**
     * Open whichever of Approved/Pending currently carries the seeded review and
     * return its row count there. Used to assert the seeded review surfaces.
     */
    async openTabWithReview(): Promise<number> {
        const approved = await this.getTabCount('Approved');
        if (approved > 0) {
            await this.openTab('Approved');
            return await this.getRowCount();
        }
        await this.openTab('Pending');
        return await this.getRowCount();
    }
}
