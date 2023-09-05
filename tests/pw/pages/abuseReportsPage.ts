import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { product } from 'utils/interfaces';

export class AbuseReportsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// abuse reports

	// abuse report render properly
	async adminAbuseReportRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

		// abuse reports text is visible
		await this.toBeVisible(selector.admin.dokan.abuseReports.abuseReportsText);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.abuseReports.bulkActions);

		// filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterInput, ...filters } = selector.admin.dokan.abuseReports.filters;
		await this.multipleElementVisible(filters);

		// abuse report table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.abuseReports.table);

	}


	// abuse report details
	async abuseReportDetails(){
		await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);
		await this.click(selector.admin.dokan.abuseReports.abuseReportFirstCell);

		// abuse report modal elements are visible
		await this.multipleElementVisible(selector.admin.dokan.abuseReports.abuseReportModal);
		await this.click(selector.admin.dokan.abuseReports.abuseReportModal.closeModal);
	}


	// filter abuse reports
	async filterAbuseReports(input: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

		switch(action){

		case 'by-reason' :
			await this.selectByLabelAndWaitForResponse(data.subUrls.api.dokan.abuseReports, selector.admin.dokan.abuseReports.filters.filterByAbuseReason, input);
			break;

		case 'by-product' :
			await this.click(selector.admin.dokan.abuseReports.filters.filterByProduct);
			await this.typeAndWaitForResponse(data.subUrls.api.wc.wcProducts, selector.admin.dokan.abuseReports.filters.filterInput, input);
			await this.pressAndWaitForResponse(data.subUrls.api.dokan.abuseReports, data.key.enter);
			break;

		case 'by-vendor' :
			await this.click(selector.admin.dokan.abuseReports.filters.filterByVendors);
			await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.abuseReports.filters.filterInput, input);
			await this.pressAndWaitForResponse(data.subUrls.api.dokan.abuseReports, data.key.enter);
			break;

		default :
			break;

		}

		const count = (await this.getElementText(selector.admin.dokan.abuseReports.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).toBeGreaterThan(0);

	}


	// abuse report bulk action
	async abuseReportBulkAction(action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.abuseReports);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.abuseReports.noRowsFound);

		await this.click(selector.admin.dokan.abuseReports.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.abuseReports.bulkActions.selectAction, action);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.abuseReports, selector.admin.dokan.abuseReports.bulkActions.applyAction);
	}


	// customer report product
	async reportProduct(productName: string, report: product['report']): Promise<void> {
		// await this.goToProductDetails(productName);
		await this.goto(data.subUrls.frontend.productDetails(helpers.slugify(productName))); // for non logged user scenario, to load db changes
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleProduct.reportAbuse.reportAbuse);
		// non logged user
		const isNonLoggedUser = await this.isVisible(selector.customer.cSingleProduct.reportAbuse.nonLoggedUser.userName);
		if(isNonLoggedUser){
			await this.clearAndType(selector.customer.cSingleProduct.reportAbuse.nonLoggedUser.userName, report.username);
			await this.clearAndType(selector.customer.cSingleProduct.reportAbuse.nonLoggedUser.userPassword, report.password);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleProduct.reportAbuse.nonLoggedUser.login);
		}

		await this.click(selector.customer.cSingleProduct.reportAbuse.reportReasonByName(report.reportReason));
		await this.clearAndType(selector.customer.cSingleProduct.reportAbuse.reportDescription, report.reportReasonDescription);
		// is guest
		const isGuest = await this.isVisible(selector.customer.cSingleProduct.reportAbuse.guestName);
		if(isGuest){
			await this.clearAndType(selector.customer.cSingleProduct.reportAbuse.guestName, report.guestName());
			await this.clearAndType(selector.customer.cSingleProduct.reportAbuse.guestEmail, report.guestEmail());
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleProduct.reportAbuse.reportSubmit);
		await this.toContainText(selector.customer.cSingleProduct.reportAbuse.reportSubmitSuccessMessage, report.reportSubmitSuccessMessage);
		// close popup
		await this.click(selector.customer.cSingleProduct.reportAbuse.confirmReportSubmit);
	}


}
