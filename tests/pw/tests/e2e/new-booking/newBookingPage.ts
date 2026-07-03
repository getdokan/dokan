import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, SEARCH_INPUT, PHP_FATAL, DATA_ROW_ANY, DATA_ROW_SETTLED, SKELETON_ANY, statusTab as dvStatusTab, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal, parseTabCount, dataViewsConfirm, fillDataViewsSearch, clearDataViewsSearch } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Booking" SPA (Dokan Pro, module booking). A
// 4-tab HashRouter shell:
//   /dashboard/new/#/booking            → Products DataViews list (ProductsTab.tsx)
//   /dashboard/new/#/booking/my-bookings→ Bookings DataViews list (BookingsTab.tsx)
//   /dashboard/new/#/booking/calendar   → FullCalendar (BookingCalendarPage.tsx)
//   /dashboard/new/#/booking/resources  → Resources DataViews + Add-Resource
//                                         DokanModal (ResourcesTab.tsx)
// Products: status tabs All/Published/Draft/Pending Review/Rejected, search, row
// actions Edit (→ LEGACY editor), Delete Permanently (destructive → alertdialog),
// Duplicate (conditional), View. The add/edit product + manual add-booking +
// resource-edit forms are LEGACY (window.location.href) → scoped out. Resources:
// "Add New Resource" DokanModal (text input + "OK") POST /dokan/v1/booking/resources,
// and a "Remove" row action DELETE /dokan/v1/booking/resources/{id}. Calendar is a
// FullCalendar render smoke. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newBookingSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    tabAll: dvStatusTab('All'),
    tabPublished: dvStatusTab('Published'),
    searchInput: SEARCH_INPUT,
    emptyState: 'text=/no data found/i',

    // Booking dashboard tab strip (BookingTabs.tsx) — the surface-level tabs.
    tabAllBookingProducts: 'a:has-text("All Booking Product"), button:has-text("All Booking Product")',
    tabManageResources: 'a:has-text("Manage Resources"), button:has-text("Manage Resources")',

    // Resources modal.
    addResourceButton: 'button:has-text("Add New Resource")',
    resourceNameInput: 'input.dokan-form-control, input[placeholder="Resource name"]',
    resourceModalConfirm: 'button:has-text("OK")',

    // Calendar.
    calendarRoot: '.fc, .dokan-booking-dashboard-calendar, .fc-view-harness',

    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    productsRest: /dokan\/v[0-9]+\/booking\/products(\?|$|&)/i,
    productDeleteRest: /dokan\/v[0-9]+\/products\/\d+\b/i,
    resourcesRest: /dokan\/v[0-9]+\/booking\/resources(\?|$|&)/i,
    resourceItemRest: /dokan\/v[0-9]+\/booking\/resources\/\d+\b/i,
    calendarEventsRest: /dokan\/v[0-9]+\/booking\/calendar-events\b/i,
} as const;

export type BookingTab = 'all' | 'publish';

// ============================================
// PAGE OBJECT — new React vendor "Booking" (Dokan Pro).
// ============================================
export class NewBookingPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/booking');
    readonly myBookingsUrl = toPath('dashboard/new/#/booking/my-bookings');
    readonly calendarUrl = toPath('dashboard/new/#/booking/calendar');
    readonly resourcesUrl = toPath('dashboard/new/#/booking/resources');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newBookingSelectors.tabAll).first();
    }
    get publishedTab(): Locator {
        return this.page.locator(newBookingSelectors.tabPublished).first();
    }
    get columnHeaders(): Locator {
        return this.page.locator(newBookingSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newBookingSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newBookingSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newBookingSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async gotoProducts(): Promise<void> {
        await this.goto(this.listUrl);
    }
    async gotoResources(): Promise<void> {
        await this.goto(this.resourcesUrl);
    }
    async gotoMyBookings(): Promise<void> {
        await this.goto(this.myBookingsUrl);
    }
    async gotoCalendar(): Promise<void> {
        await this.page.goto(this.calendarUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page.waitForTimeout(1200);
    }

    private async goto(url: string): Promise<void> {
        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR column headers). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .locator(newBookingSelectors.emptyState)
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
    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.publishedTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }
    async getAllTabCount(): Promise<number> {
        return parseTabCount(await this.allTab.textContent().catch(() => ''));
    }
    async rowVisible(text: string): Promise<boolean> {
        return await this.rowsWithText(text)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }
    async calendarVisible(): Promise<boolean> {
        return await this.page
            .locator(newBookingSelectors.calendarRoot)
            .first()
            .isVisible({ timeout: 12000 })
            .catch(() => false);
    }

    // ---- Products search ----
    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newBookingSelectors.productsRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newBookingSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }
    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newBookingSelectors.searchInput, debounceMs: 600 });
        await this.waitForSettle();
    }

    // ---- Products row actions ----
    private async openRowMenu(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        await this.page.waitForTimeout(400);
    }

    /** Delete a booking product via row action + destructive alertdialog confirm. */
    async deleteProduct(text: string): Promise<void> {
        await this.openRowMenu(text);
        const item = this.page.getByRole('menuitem', { name: /Delete Permanently|Delete/i }).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await item.click();
        const dialog = dataViewsConfirm(this.page);
        await dialog.waitFor({ state: 'visible', timeout: 8000 });
        const confirm = dialog
            .getByRole('button')
            .filter({ hasNotText: /^Cancel$/ })
            .last();
        await Promise.all([this.page.waitForResponse(r => newBookingSelectors.productDeleteRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
    }

    // ---- Resources ----
    /**
     * Add a resource via the "Add New Resource" DokanModal (text input + OK).
     * Returns the created resource id read from the POST response (the definitive
     * create oracle + cleanup handle), or '' if the response wasn't captured.
     */
    async addResource(name: string): Promise<string> {
        const add = this.page.locator(newBookingSelectors.addResourceButton).first();
        await add.waitFor({ state: 'visible', timeout: 15000 });
        await add.click();
        // Scope to the resource DokanModal (role=dialog) — a bare has-text("OK")
        // matches the "All Bo(ok)ing Product" tab via substring.
        const dialog = this.page
            .getByRole('dialog')
            .filter({ hasText: /Resource/i })
            .first();
        const input = dialog.locator(newBookingSelectors.resourceNameInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(name);
        const ok = dialog.getByRole('button', { name: 'OK', exact: true }).first();
        await ok.waitFor({ state: 'visible', timeout: 8000 });
        const [resp] = await Promise.all([this.page.waitForResponse(r => newBookingSelectors.resourcesRest.test(r.url()) && r.request().method() === 'POST', { timeout: 15000 }).catch(() => undefined), ok.click()]);
        let createdId = '';
        if (resp) {
            const body = await resp.json().catch(() => ({}));
            createdId = String(body?.id ?? body?.resource_id ?? '');
        }
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
        return createdId;
    }

    /** Remove a resource via its row action + destructive alertdialog confirm. */
    async removeResource(text: string): Promise<void> {
        await this.openRowMenu(text);
        const item = this.page.getByRole('menuitem', { name: /Remove|Delete/i }).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await item.click();
        const dialog = dataViewsConfirm(this.page);
        const shown = await dialog.isVisible({ timeout: 4000 }).catch(() => false);
        if (shown) {
            const confirm = dialog
                .getByRole('button')
                .filter({ hasNotText: /^Cancel$/ })
                .last();
            await Promise.all([this.page.waitForResponse(r => newBookingSelectors.resourceItemRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        }
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
    }
}
