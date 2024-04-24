import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const vendorAnalytics = selector.vendor.vAnalytics;

export class VendorAnalyticsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor analytics

    // vendor analytics render properly
    async vendorAnalyticsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.analytics);

        // analytics text is visible
        await this.toBeVisible(vendorAnalytics.analyticsText);

        // analytics menu elements are visible
        await this.multipleElementVisible(vendorAnalytics.menus);

        // date-picker elements are visible
        const { dateRangePickerInput, show } = vendorAnalytics.datePicker;
        await this.multipleElementVisible({ dateRangePickerInput, show });

        await this.clickAndWaitForLoadState(vendorAnalytics.menus.topPages);
        await this.toBeVisible(vendorAnalytics.noAnalyticsFound);

        await this.clickAndWaitForLoadState(vendorAnalytics.menus.location);
        await this.toBeVisible(vendorAnalytics.noAnalyticsFound);

        await this.clickAndWaitForLoadState(vendorAnalytics.menus.system);
        await this.toBeVisible(vendorAnalytics.noAnalyticsFound);

        await this.clickAndWaitForLoadState(vendorAnalytics.menus.promotions);
        await this.toBeVisible(vendorAnalytics.noAnalyticsFound);

        await this.clickAndWaitForLoadState(vendorAnalytics.menus.keyword);
        await this.toBeVisible(vendorAnalytics.noAnalyticsFound);
    }
}
