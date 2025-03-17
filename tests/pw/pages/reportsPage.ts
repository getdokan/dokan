import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const reportsAdmin = selector.admin.dokan.reports;

export class ReportsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // reports

    // reports render properly
    async adminReportsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.reports);

        // report Menus are visible
        await this.multipleElementVisible(reportsAdmin.menus);

        // filter Menus are visible
        await this.multipleElementVisible(reportsAdmin.reports.filterMenus);

        // calendar input is visible
        await this.toBeVisible(reportsAdmin.reports.calendar);

        // show button is visible
        await this.toBeVisible(reportsAdmin.reports.show);

        // at a glance elements are visible
        await this.multipleElementVisible(reportsAdmin.reports.atAGlance);

        // overview elements are visible
        await this.multipleElementVisible(reportsAdmin.reports.overview);
    }

    // all logs

    // all logs render properly
    async adminAllLogsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        // report Menus are visible
        await this.multipleElementVisible(reportsAdmin.menus);

        // filter elements are visible
        const { filterByStoreInput, filterByStatusInput, searchedResult, ...filters } = reportsAdmin.allLogs.filters;
        await this.multipleElementVisible(filters);

        // search is visible
        await this.toBeVisible(reportsAdmin.allLogs.search);

        // export log is visible
        await this.toBeVisible(reportsAdmin.allLogs.exportLogs);

        // all logs table elements are visible
        await this.multipleElementVisible(reportsAdmin.allLogs.table);
    }

    // search all logs
    async searchAllLogs(orderId: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.clearInputField(reportsAdmin.allLogs.search);
        await this.typeByPageAndWaitForResponse(data.subUrls.api.dokan.logs, reportsAdmin.allLogs.search, orderId);
        await this.toHaveCount(reportsAdmin.allLogs.numberOfRows, 1);
        await this.toBeVisible(reportsAdmin.allLogs.orderIdCell(orderId));
    }

    // export all logs
    async exportAllLogs(orderId?: string) {
        if (orderId) {
            await this.searchAllLogs(orderId);
        }
        await this.clickAndWaitForDownload(reportsAdmin.allLogs.exportLogs);
    }

    // filter all logs
    async filterAllLogs(input: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        switch (action) {
            case 'by-store':
                await this.click(reportsAdmin.allLogs.filters.filterByStore);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, reportsAdmin.allLogs.filters.filterByStoreInput, input);
                await this.press(data.key.arrowDown);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.logs, data.key.enter);
                break;

            case 'by-status':
                await this.click(reportsAdmin.allLogs.filters.filterByStatus); // todo:  add multiselect option
                await this.type(reportsAdmin.allLogs.filters.filterByStatusInput, input);
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.logs, reportsAdmin.allLogs.filters.searchedResult);
                break;

            default:
                break;
        }
        await this.notToHaveText(reportsAdmin.allLogs.numberOfRowsFound, '0 items');
        await this.notToBeVisible(reportsAdmin.allLogs.noRowsFound);
    }
}
