import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class VendorReportsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor reports

    // vendor reports render properly
    async vendorReportsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reports);

        // reports text is visible
        await this.toBeVisible(selector.vendor.vReports.reportsText);

        // reports menu elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.menus);

        // chart elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.chart);

        await this.clickAndWaitForLoadState(selector.vendor.vReports.menus.salesByDay);

        // chart elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.chart);

        await this.clickAndWaitForLoadState(selector.vendor.vReports.menus.topSelling);

        // date picker elements are visible
        const {dateRangePickerinput, show} = selector.vendor.vAnalytics.datePicker
        await this.multipleElementVisible({ dateRangePickerinput, show });

        // top selling table elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.topSelling.table);

        await this.clickAndWaitForLoadState(selector.vendor.vReports.menus.topEarning);

        // date picker elements are visible
        await this.multipleElementVisible({ dateRangePickerinput, show });

        // top earning table elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.topEarning.table);

        await this.clickAndWaitForLoadState(selector.vendor.vReports.menus.statement);

        // date picker elements are visible
        await this.multipleElementVisible({ dateRangePickerinput, show });

        // statement table elements are visible
        await this.multipleElementVisible(selector.vendor.vReports.statement.table);

        // export statements button is visible
        await this.toBeVisible(selector.vendor.vReports.statement.exportStatements);
    }

    // vendor export statement
    async exportStatement(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.statement);
        const isDisabled = await this.hasAttribute(selector.vendor.vReports.statement.exportStatements, 'disabled');
        !isDisabled && (await this.clickAndWaitForDownload(selector.vendor.vReports.statement.exportStatements));
    }
}
