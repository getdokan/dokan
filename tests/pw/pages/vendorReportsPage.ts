import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const vendorReports = selector.vendor.vReports;

export class VendorReportsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor reports

    // vendor reports render properly
    async vendorReportsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reports);

        // reports text is visible
        await this.toBeVisible(vendorReports.reportsText);

        // reports menu elements are visible
        await this.multipleElementVisible(vendorReports.menus);

        // chart elements are visible
        await this.multipleElementVisible(vendorReports.chart);

        await this.clickAndWaitForLoadState(vendorReports.menus.salesByDay);

        // chart elements are visible
        await this.multipleElementVisible(vendorReports.chart);

        await this.clickAndWaitForLoadState(vendorReports.menus.topSelling);

        // date picker elements are visible
        const { dateRangePickerInput, show } = selector.vendor.vAnalytics.datePicker;
        await this.multipleElementVisible({ dateRangePickerInput, show });

        // top selling table elements are visible
        await this.multipleElementVisible(vendorReports.topSelling.table);

        await this.clickAndWaitForLoadState(vendorReports.menus.topEarning);

        // date picker elements are visible
        await this.multipleElementVisible({ dateRangePickerInput, show });

        // top earning table elements are visible
        await this.multipleElementVisible(vendorReports.topEarning.table);

        await this.clickAndWaitForLoadState(vendorReports.menus.statement);

        // date picker elements are visible
        await this.multipleElementVisible({ dateRangePickerInput, show });

        // statement table elements are visible
        await this.multipleElementVisible(vendorReports.statement.table);

        // export statements button is visible
        await this.toBeVisible(vendorReports.statement.exportStatements);
    }

    // vendor export statement
    async exportStatement(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.statement);
        const isDisabled = await this.hasAttribute(vendorReports.statement.exportStatements, 'disabled');
        !isDisabled && (await this.clickAndWaitForDownload(vendorReports.statement.exportStatements));
    }
}
