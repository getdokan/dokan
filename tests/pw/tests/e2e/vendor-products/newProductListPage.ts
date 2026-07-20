import { Page } from '@playwright/test';


import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    actionMenuItem as dvActionMenuItem,
    waitForRootReady as dvWaitForRootReady,
    waitForListReady as dvWaitForListReady,
    rawRowCount,
    openRowActionMenu,
    clickActionMenuItem as dvClickActionMenuItem,
    fillDataViewsSearch,
    clearDataViewsSearch,
} from '@utils/dataViews';

/**
 * Page object for the new vendor React product list (Dokan 5.0.0+) at
 * `/dashboard/new/#/products`. The list is implemented by
 * `dokan-lite/src/dashboard/products/ProductList.tsx` using `@dokan/components`
 * `DataViews`, mounted inside the new dashboard React shell rooted at
 * `#dokan-vendor-dashboard-root` (template `templates/dashboard/new-dashboard.php`).
 *
 * Self-contained per NEW_UI_HOUSE_STYLE.md §1 — shared DataViews primitives
 * come from @utils/dataViews. NOTE: the canonical products-list coverage lives
 * in tests/e2e/products/ (house-style D1); this backs the in-folder legacy
 * "(React)" blocks pending their migration.
 */
export class NewProductListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // The new vendor dashboard mounts at /dashboard/new/. The React app
    // uses HashRouter, so feature routes hang off the URL fragment.
    readonly url = toPath(`dashboard/new/#/products`);
    readonly addProductUrl = toPath(`dashboard/new/#/products/create`);

    selectors = {
        // The React shell mounts on this root id (see new-dashboard.php).
        reactRoot: REACT_ROOT,
        // Product list page-specific markers (rendered by ProductList.tsx).
        productListWrapper: '.dokan-react-products, .dokan-products-wrapper',
        // DataViews surface (the inner table)
        dataViewsTable: 'table',
        dataRow: 'table tbody tr',
        // Search input — DataViews header
        searchInput: SEARCH_INPUT,
        // "Add new product" affordance — heading right side
        addProductCta: "a[href*='products/create'], button[aria-label*='Add'], //a[contains(., 'Add new product')] | //button[contains(., 'Add Product')]",
        // 3-dot row actions menu — scope strictly to in-tbody rows so the
        // toolbar's "Actions" button (when bulk-selection exists) doesn't
        // clash with per-row buttons.
        rowActionsBtn: ROW_ACTIONS_BTN,
        // Action menu items
        actionMenuItem: dvActionMenuItem,
        // QuickViewModal (rendered by QuickViewModal.tsx). The modal renders
        // the product title as its heading rather than the literal "Quick
        // View" text, so we accept any dialog containing common product-info
        // markers ("Product info" header, "SKU:" label, or a Type/Stock/Status row).
        quickViewModal: "//*[@role='dialog'][.//*[contains(., 'Product info') or contains(., 'SKU:') or contains(., 'Type') and contains(., 'Stock')]]",
        quickViewClose: "//*[@role='dialog']//button[@aria-label='Close' or normalize-space()='Close']",
        // Delete confirmation modal — DataViews uses Base UI which renders
        // a destructive action confirmation as role="alertdialog" (not "dialog").
        deleteConfirmBtn: "//*[@role='alertdialog' or @role='dialog']//button[normalize-space()='Delete' or normalize-space()='Delete Permanently' or contains(., 'Confirm')]",
        deleteCancelBtn: "//*[@role='alertdialog' or @role='dialog']//button[normalize-space()='Cancel']",
        deleteDialog: "[role='alertdialog'], [role='dialog']",
        // Bulk action toolbar
        rowCheckbox: "tbody tr input[type='checkbox']",
        bulkActionToolbar: "[class*='bulk'], [data-section='bulk-actions']",
        // Toast / notice
        toast: "[role='status'], [class*='toast']",
    };

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForReactReady(timeoutMs = 30000): Promise<void> {
        // Wait for the React root to mount (the loading spinner inside it
        // is replaced by real content once the app boots), then for either
        // rows or an empty state inside it.
        await dvWaitForRootReady(this.page, timeoutMs);
        await dvWaitForListReady(this.page, {
            rowSelector: this.selectors.dataRow,
            emptyState: 'text=/no products|no items|nothing to show|create your first/i',
        });
    }

    async getRowCount(): Promise<number> {
        return await rawRowCount(this.page, this.selectors.dataRow);
    }

    async fillSearch(query: string): Promise<void> {
        // DataViews search debounces ~300ms
        await fillDataViewsSearch(this.page, query, { selector: this.selectors.searchInput, debounceMs: 800 });
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: this.selectors.searchInput, debounceMs: 500 });
    }

    async openRowActionMenuByIndex(index: number): Promise<void> {
        // Wait for at least one menu item to render (Quick view is always present).
        await openRowActionMenu(this.page, index, 'Quick view');
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await dvClickActionMenuItem(this.page, label);
    }

    async isQuickViewOpen(): Promise<boolean> {
        return await this.page.locator(this.selectors.quickViewModal).first().isVisible({ timeout: 3000 }).catch(() => false);
    }

    async closeQuickView(): Promise<void> {
        await this.page.locator(this.selectors.quickViewClose).first().click().catch(() => undefined);
    }

    async confirmDelete(): Promise<void> {
        const btn = this.page.locator(this.selectors.deleteConfirmBtn).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await Promise.all([
            this.page.waitForResponse(
                (res) => res.url().includes('/wp-json/') && (res.url().includes('products') || res.url().includes('product')) && (res.request().method() === 'DELETE' || res.request().method() === 'POST'),
                { timeout: 30000 },
            ).catch(() => null),
            btn.click(),
        ]);
        await btn.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
    }

    async cancelDelete(): Promise<void> {
        await this.page.locator(this.selectors.deleteCancelBtn).first().click();
    }
}
