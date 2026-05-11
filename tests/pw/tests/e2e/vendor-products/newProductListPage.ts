import { Page } from '@playwright/test';


import { toPath } from '@utils/helpers';

/**
 * Page object for the new vendor React product list (Dokan 5.0.0+) at
 * `/dashboard/new/#/products`. The list is implemented by
 * `dokan-lite/src/dashboard/products/ProductList.tsx` using `@dokan/components`
 * `DataViews`, mounted inside the new dashboard React shell rooted at
 * `#dokan-vendor-dashboard-root` (template `templates/dashboard/new-dashboard.php`).
 *
 * This page object is self-contained per CONVENTIONS.md §4 (no shared utils).
 */
export class NewProductListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void this.installAnnouncementModalHandler();
    }

    private async installAnnouncementModalHandler(): Promise<void> {
        const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
        const pwf = this.page as Page & { [installed]?: boolean };
        if (pwf[installed]) return;
        pwf[installed] = true;
        const modal = this.page.locator('.vendor-announcement-modal');
        await this.page.addLocatorHandler(modal, async () => {
            const btn = modal.locator('button[aria-label="Close"]').first();
            if (await btn.isVisible().catch(() => false)) await btn.click({ timeout: 2000 }).catch(() => undefined);
            else await this.page.keyboard.press('Escape').catch(() => undefined);
        }, { noWaitAfter: true }).catch(() => undefined);
    }

    // The new vendor dashboard mounts at /dashboard/new/. The React app
    // uses HashRouter, so feature routes hang off the URL fragment.
    readonly url = toPath(`dashboard/new/#/products`);
    readonly addProductUrl = toPath(`dashboard/new/#/products/create`);

    selectors = {
        // The React shell mounts on this root id (see new-dashboard.php).
        reactRoot: '#dokan-vendor-dashboard-root',
        // Product list page-specific markers (rendered by ProductList.tsx).
        productListWrapper: '.dokan-react-products, .dokan-products-wrapper',
        // DataViews surface (the inner table)
        dataViewsTable: 'table',
        dataRow: 'table tbody tr',
        // Search input — DataViews header
        searchInput: 'input[type="search"], input[placeholder*="Search"]',
        // "Add new product" affordance — heading right side
        addProductCta: "a[href*='products/create'], button[aria-label*='Add'], //a[contains(., 'Add new product')] | //button[contains(., 'Add Product')]",
        // 3-dot row actions menu — scope strictly to in-tbody rows so the
        // toolbar's "Actions" button (when bulk-selection exists) doesn't
        // clash with per-row buttons.
        rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
        // Action menu items
        actionMenuItem: (label: string) =>
            `//*[@role='menuitem'][normalize-space()='${label}']`,
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
        // is replaced by real content once the app boots).
        await this.page.locator(this.selectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        // Then wait for either rows or an empty state inside it.
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(this.selectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator("text=/no products|no items|nothing to show|create your first/i").count();
            if (empty > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async getRowCount(): Promise<number> {
        return await this.page.locator(this.selectors.dataRow).count();
    }

    async fillSearch(query: string): Promise<void> {
        const input = this.page.locator(this.selectors.searchInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        // DataViews search debounces ~300ms
        await this.page.waitForTimeout(800);
    }

    async clearSearch(): Promise<void> {
        const input = this.page.locator(this.selectors.searchInput).first();
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(500);
        }
    }

    async openRowActionMenuByIndex(index: number): Promise<void> {
        const buttons = this.page.locator(this.selectors.rowActionsBtn);
        await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
        await buttons.nth(index).click();
        // Wait for at least one menu item to render
        await this.page.locator(this.selectors.actionMenuItem('Quick view')).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await this.page.locator(this.selectors.actionMenuItem(label)).first().click();
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
