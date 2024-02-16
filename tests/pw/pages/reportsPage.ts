import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class ReportsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // reports

    // reports render properly
    async adminReportsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.reports);

        // report Menus are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.menus);

        // filter Menus are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.reports.filterMenus);

        // calendar input is visible
        await this.toBeVisible(selector.admin.dokan.reports.reports.calendar);

        // show button is visible
        await this.toBeVisible(selector.admin.dokan.reports.reports.show);

        // at a glance elements are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.reports.atAGlance);

        // overview elements are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.reports.overview);
    }

    // all logs

    // all logs render properly
    async adminAllLogsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        // report Menus are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.menus);

        // filter elements are visible
        const { filterByStoreInput, filterByStatusInput, searchedResult, ...filters } = selector.admin.dokan.reports.allLogs.filters;
        await this.multipleElementVisible(filters);

        // search is visible
        await this.toBeVisible(selector.admin.dokan.reports.allLogs.search);

        // export log is visible
        await this.toBeVisible(selector.admin.dokan.reports.allLogs.exportLogs);

        // all logs table elements are visible
        await this.multipleElementVisible(selector.admin.dokan.reports.allLogs.table);
    }

    // search all logs
    async searchAllLogs(orderId: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.clearInputField(selector.admin.dokan.reports.allLogs.search);
        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.search, orderId);
        await this.notToBeVisible(selector.admin.dokan.loader);
        await this.toBeVisible(selector.admin.dokan.reports.allLogs.orderIdCell(orderId));
        const count = (await this.getElementText(selector.admin.dokan.reports.allLogs.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBe(1);
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear);
    }

    // export all logs
    async exportAllLogs(orderId?: string) {
        orderId && (await this.searchAllLogs(orderId));
        await this.clickAndWaitForDownload(selector.admin.dokan.reports.allLogs.exportLogs);
    }

    // filter all logs by store
    async filterAllLogsByStore(storeName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.click(selector.admin.dokan.reports.allLogs.filters.filterByStore);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.reports.allLogs.filters.filterByStoreInput, storeName);
        await this.press(data.key.arrowDown);
        // await this.toContainText(selector.admin.dokan.reports.allLogs.filters.searchedResult, (storeName));
        await this.pressAndWaitForResponse(data.subUrls.api.dokan.logs, data.key.enter);

        const count = (await this.getElementText(selector.admin.dokan.reports.allLogs.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear);
    }

    // filter all logs by status
    async filterAllLogsByStatus(orderStatus: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.click(selector.admin.dokan.reports.allLogs.filters.filterByStatus); // todo:  add multiselect option
        await this.type(selector.admin.dokan.reports.allLogs.filters.filterByStatusInput, orderStatus);
        // await this.toContainText(selector.admin.dokan.reports.allLogs.filters.searchedResult, (orderStatus));
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.searchedResult);
        const count = (await this.getElementText(selector.admin.dokan.reports.allLogs.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear);
    }
}
