import { Page, Locator, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { data } from '@utils/testData';

// Re-exported real utils so the spec's import contract
// `import { VendorAnalyticsPage, ApiUtils, payloads } from './vendorAnalyticsPage'`
// resolves to the genuine ApiUtils (module activate/deactivate) and payloads
// (moduleIds.vendorAnalytics === 'vendor_analytics', adminAuth) rather than local stubs.
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

export { ApiUtils, payloads };

// Co-located selectors ported from the pre-refactor `selector` tree
// (admin.dokan.settings.menus.vendorAnalytics, vendor.vDashboard.menus.primary.analytics,
// vendor.vDashboard.dashboardDiv, vendor.vAnalytics.*).
export const vendorAnalyticsSelectors = {
    // admin: dokan settings module nav-title (legacy modules settings surface)
    adminSettingsModule: '//div[@class="nav-title" and contains(text(),"Vendor Analytics")]',
    // vendor dashboard: primary menu entry
    vDashboardMenu: 'ul.dokan-dashboard-menu li.analytics a',
    // vendor dashboard: wrapper div (present only when the analytics page renders)
    dashboardDiv: 'div.dokan-dashboard-wrap',

    // analytics page (Dokan 5.0.0 renamed the dashboard heading "Analytics" -> "Store Stats")
    analyticsText: '//h1[normalize-space()="Store Stats"]',

    // analytics tab menus
    menus: {
        general: '//a[normalize-space()="General"]',
        topPages: '//a[normalize-space()="Top pages"]',
        location: '//a[normalize-space()="Location"]',
        system: '//a[normalize-space()="System"]',
        promotions: '//a[normalize-space()="Promotions"]',
        keyword: '//a[normalize-space()="Keyword"]',
    },

    // date-range picker
    datePicker: {
        dateRangePickerInput: 'input.dokan-daterangepicker',
        show: 'input[value="Show"]',
    },

    // empty-state text rendered per tab when no Google Analytics data is connected.
    // Dokan 5.0.0 changed the copy to "No Data Found!" and the text now lives alongside
    // the date-range form inside the active tab-pane, so scope by the pane + hasText.
    noAnalyticsFound: '#dokan_tabs_container .tab-pane.active:has-text("No Data Found!")',
} as const;

export class VendorAnalyticsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get analyticsHeading(): Locator {
        return this.page.locator(vendorAnalyticsSelectors.analyticsText);
    }

    get noAnalyticsFound(): Locator {
        return this.page.locator(vendorAnalyticsSelectors.noAnalyticsFound);
    }

    // ---- Helpers ----

    // ported from basePage.multipleElementVisible: assert every string selector value is visible,
    // recursing into nested objects and skipping function-valued entries.
    private async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const key of Object.keys(selectors)) {
            const value = selectors[key];
            if (typeof value === 'function') {
                continue;
            }
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else if (typeof value === 'string') {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // ported from basePage.clickAndWaitForLoadState
    private async clickAndWaitForLoadState(selector: string): Promise<void> {
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selector).click()]);
    }

    // ---- Actions / assertions ----

    // enable vendor analytics module
    async enableVendorAnalyticsModule(): Promise<void> {
        // dokan settings: module visible in admin settings
        await this.page.goto(toPath(data.subUrls.backend.dokan.settings), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(vendorAnalyticsSelectors.adminSettingsModule)).toBeVisible();

        // vendor dashboard menu: analytics entry visible
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.dashboard), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(vendorAnalyticsSelectors.vDashboardMenu)).toBeVisible();
    }

    // disable vendor analytics module
    async disableVendorAnalyticsModule(): Promise<void> {
        // dokan settings: module gone from admin settings
        await this.page.goto(toPath(data.subUrls.backend.dokan.settings), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(vendorAnalyticsSelectors.adminSettingsModule)).toBeHidden();

        // vendor dashboard menu: analytics entry gone
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.dashboard), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(vendorAnalyticsSelectors.vDashboardMenu)).toBeHidden();

        // vendor dashboard analytics page: no longer renders the dashboard wrapper
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.analytics), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(vendorAnalyticsSelectors.dashboardDiv)).toBeHidden();
    }

    // vendor analytics render properly
    async vendorAnalyticsRenderProperly(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.analytics), { waitUntil: 'domcontentloaded' });

        // analytics text is visible
        await expect(this.analyticsHeading).toBeVisible();

        // analytics menu elements are visible
        await this.multipleElementVisible(vendorAnalyticsSelectors.menus);

        // date-picker elements are visible
        const { dateRangePickerInput, show } = vendorAnalyticsSelectors.datePicker;
        await this.multipleElementVisible({ dateRangePickerInput, show });

        // each analytics tab shows the empty "no analytics found" state
        await this.clickAndWaitForLoadState(vendorAnalyticsSelectors.menus.topPages);
        await expect(this.noAnalyticsFound).toBeVisible();

        await this.clickAndWaitForLoadState(vendorAnalyticsSelectors.menus.location);
        await expect(this.noAnalyticsFound).toBeVisible();

        await this.clickAndWaitForLoadState(vendorAnalyticsSelectors.menus.system);
        await expect(this.noAnalyticsFound).toBeVisible();

        await this.clickAndWaitForLoadState(vendorAnalyticsSelectors.menus.promotions);
        await expect(this.noAnalyticsFound).toBeVisible();

        await this.clickAndWaitForLoadState(vendorAnalyticsSelectors.menus.keyword);
        await expect(this.noAnalyticsFound).toBeVisible();
    }
}
