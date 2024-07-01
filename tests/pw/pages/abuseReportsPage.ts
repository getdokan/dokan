import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { product } from '@utils/interfaces';

// selectors
const abuseReportAdmin = selector.admin.dokan.abuseReports;
const abuseReportCustomer = selector.customer.cSingleProduct.reportAbuse;

export class AbuseReportsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // abuse reports

    // abuse report render properly
    async adminAbuseReportRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

        // abuse reports text is visible
        await this.toBeVisible(abuseReportAdmin.abuseReportsText);

        // bulk action elements are visible
        await this.multipleElementVisible(abuseReportAdmin.bulkActions);

        // filter elements are visible
        const { filterInput, ...filters } = abuseReportAdmin.filters;
        await this.multipleElementVisible(filters);

        // abuse report table elements are visible
        await this.multipleElementVisible(abuseReportAdmin.table);
    }

    // abuse report details
    async abuseReportDetails() {
        await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);
        await this.click(abuseReportAdmin.abuseReportFirstCell);

        // abuse report modal elements are visible
        await this.multipleElementVisible(abuseReportAdmin.abuseReportModal);
        await this.click(abuseReportAdmin.abuseReportModal.closeModal);
    }

    // filter abuse reports
    async filterAbuseReports(input: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

        switch (action) {
            case 'by-reason':
                await this.selectByLabelAndWaitForResponse(data.subUrls.api.dokan.abuseReports, abuseReportAdmin.filters.filterByAbuseReason, input);
                break;

            case 'by-product':
                await this.click(abuseReportAdmin.filters.filterByProduct);
                await this.typeAndWaitForResponse(data.subUrls.api.wc.wcProducts, abuseReportAdmin.filters.filterInput, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.abuseReports, data.key.enter);
                break;

            case 'by-vendor':
                await this.click(abuseReportAdmin.filters.filterByVendors);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, abuseReportAdmin.filters.filterInput, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.abuseReports, data.key.enter);
                break;

            default:
                break;
        }

        const count = (await this.getElementText(abuseReportAdmin.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // abuse report bulk action
    async abuseReportBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

        // ensure row exists
        await this.notToBeVisible(abuseReportAdmin.noRowsFound);

        await this.click(abuseReportAdmin.bulkActions.selectAll);
        await this.selectByValue(abuseReportAdmin.bulkActions.selectAction, action);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.abuseReports, abuseReportAdmin.bulkActions.applyAction);
    }

    // customer report product
    async reportProduct(productName: string, report: product['report'], needLogin = false): Promise<void> {
        await this.goto(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.clickAndWaitForResponse(data.subUrls.ajax, abuseReportCustomer.reportAbuse);
        // non logged user
        if (needLogin) {
            await this.clearAndType(abuseReportCustomer.nonLoggedUser.userName, report.username);
            await this.clearAndType(abuseReportCustomer.nonLoggedUser.userPassword, report.password);
            await this.clickAndWaitForResponse(data.subUrls.ajax, abuseReportCustomer.nonLoggedUser.login);
        }

        await this.click(abuseReportCustomer.reportReasonByName(report.reportReason));
        await this.clearAndType(abuseReportCustomer.reportDescription, report.reportReasonDescription);
        // is guest
        const isGuest = await this.isVisible(abuseReportCustomer.guestName);
        if (isGuest) {
            await this.clearAndType(abuseReportCustomer.guestName, report.guestName());
            await this.clearAndType(abuseReportCustomer.guestEmail, report.guestEmail());
        }
        await this.clickAndWaitForResponse(data.subUrls.ajax, abuseReportCustomer.reportSubmit);
        await this.toContainText(abuseReportCustomer.reportSubmitSuccessMessage, report.reportSubmitSuccessMessage);
        // close popup
        await this.click(abuseReportCustomer.confirmReportSubmit);
    }
}
