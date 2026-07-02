import { Page } from '@playwright/test';


import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    PHP_FATAL,
    actionMenuItem as dvActionMenuItem,
    waitForRootReady as dvWaitForRootReady,
    waitForListReady as dvWaitForListReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    rawRowCount,
    openRowActionMenu,
    clickActionMenuItem as dvClickActionMenuItem,
    fillDataViewsSearch,
    clearDataViewsSearch,
} from '@utils/dataViews';

/**
 * Page object for the new vendor React order list (Dokan 5.0.0+) at
 * `/dashboard/new/#/orders`. Implementation:
 * `dokan-lite/src/dashboard/orders/OrderList.tsx` (DataViews).
 *
 * Prerequisite: enable the new vendor dashboard via Admin → Dokan →
 * Settings → Appearance → Vendor Dashboard Style: New UI
 * (`dokan_appearance.vendor_layout_style = 'latest'`).
 *
 * Self-contained per NEW_UI_HOUSE_STYLE.md §1 — shared DataViews primitives
 * come from @utils/dataViews. NOTE: richer, REST-gated orders coverage lives
 * in tests/e2e/new-orders/ (the canonical home per house-style D1); this page
 * object backs the in-folder legacy "(React)" smoke block only.
 */
export class NewOrderListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    readonly url = toPath(`dashboard/new/#/orders`);

    selectors = {
        reactRoot: REACT_ROOT,
        orderListWrapper: '.dokan-orders-wrapper, .dokan-react-orders',
        dataViewsTable: 'table',
        dataRow: 'table tbody tr',
        // Search input — DataViews header
        searchInput: SEARCH_INPUT,
        // 3-dot row actions menu (in tbody only — toolbar Actions has same aria-label)
        rowActionsBtn: ROW_ACTIONS_BTN,
        // Action menu items rendered by DataViews
        actionMenuItem: dvActionMenuItem,
        // The View action redirects to a single-order page, so detection is
        // by URL navigation rather than dialog.
        // PHP fatal markers
        phpFatal: PHP_FATAL,
    };

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForReactReady(timeoutMs = 30000): Promise<void> {
        await dvWaitForRootReady(this.page, timeoutMs);
        // Wait for either rows OR an empty banner.
        await dvWaitForListReady(this.page, {
            rowSelector: this.selectors.dataRow,
            emptyState: 'text=/no orders|no items|nothing to show|create your first/i',
        });
    }

    async getRowCount(): Promise<number> {
        return await rawRowCount(this.page, this.selectors.dataRow);
    }

    async fillSearch(query: string): Promise<void> {
        await fillDataViewsSearch(this.page, query, { selector: this.selectors.searchInput, debounceMs: 800 });
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: this.selectors.searchInput, debounceMs: 500 });
    }

    async openRowActionMenuByIndex(index: number): Promise<void> {
        // Wait for any of the order menu items to render (View is always present).
        await openRowActionMenu(this.page, index, 'View');
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await dvClickActionMenuItem(this.page, label);
    }

    async hasNoServerError(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }
}
