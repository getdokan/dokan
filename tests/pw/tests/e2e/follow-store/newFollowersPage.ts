import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, SEARCH_INPUT, PHP_FATAL, DATA_ROW_ANY, DATA_ROW_SETTLED, SKELETON_ANY, DATAVIEWS_EMPTY, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal, fillDataViewsSearch, clearDataViewsSearch } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Followers" surface (Dokan Pro, module
// follow_store). Surface: /dashboard/new/#/followers.
//   dokan-pro/modules/follow-store/src/frontend/dashboard/FollowerList.tsx
// A plain DataViews list — the SIMPLEST vendor surface: NO status tabs, NO row
// actions, NO filter. Two columns: "Name" (avatar img + full_name) and
// "Followed At" (DateTimeHtml). Header search input. Read-only — the only
// mutations (follow / unfollow) happen from the storefront as a customer, so
// behavioral oracles here seed via REST (apiUtils.followStore/unfollowStore as
// the customer) and assert the follower row appears / disappears after reload.
// The list fetches GET /dokan/v1/follow-store/followers with per_page,page,search
// and reads the X-WP-Total header. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newFollowersSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    searchInput: SEARCH_INPUT,
    emptyState: DATAVIEWS_EMPTY,
    phpFatal: PHP_FATAL,

    // REST endpoint (version-agnostic) used to gate refetches.
    listRest: /dokan\/v[0-9]+\/follow-store\/followers\b/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "Followers" (Dokan Pro).
// ============================================
export class NewFollowersPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/followers');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get columnHeaders(): Locator {
        return this.page.locator(newFollowersSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newFollowersSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newFollowersSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newFollowersSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR the column headers). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .getByText(newFollowersSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if ((await this.columnHeaders.count()) > 0) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async hasColumn(name: RegExp): Promise<boolean> {
        return (await this.columnHeaderTexts()).some(t => name.test(t));
    }

    async rowVisible(text: string): Promise<boolean> {
        return await this.rowsWithText(text)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    async settledRowCount(): Promise<number> {
        return await this.settledRows.count();
    }

    async emptyStateVisible(): Promise<boolean> {
        return await this.page
            .getByText(newFollowersSelectors.emptyState)
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    // ---- Search (server-side; gate on the list refetch carrying search=) ----
    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newFollowersSelectors.listRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newFollowersSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newFollowersSelectors.searchInput, debounceMs: 600 });
        await this.waitForSettle();
    }
}
