import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';


export class VerificationsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// verification requests

	// verification requests render properly
	async adminVerificationsRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		// tools text is visible
		await this.toBeVisible(selector.admin.dokan.verifications.verificationRequestsText);

		// navTab elements are visible
		await this.multipleElementVisible(selector.admin.dokan.verifications.navTabs);

		// verification table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.verifications.table);
	}


	// ID verification requests
	async idVerificationRequest(storeName: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		await this.hover(selector.admin.dokan.verifications.vendorRow(storeName));
		switch (action) {

		case 'approve' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.idRequest.approveRequest(storeName));
			break;

		case 'reject' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.idRequest.rejectRequest(storeName));
			break;

		default :
			break;
		}

	}


	// address verification requests
	async addressVerificationRequest(storeName: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		await this.hover(selector.admin.dokan.verifications.vendorRow(storeName));
		switch (action) {

		case 'approve' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.addressRequest.approveRequest(storeName));
			break;

		case 'reject' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.addressRequest.rejectRequest(storeName));
			break;

		default :
			break;
		}
	}


	// company verification requests
	async companyVerificationRequest(storeName: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		await this.hover(selector.admin.dokan.verifications.vendorRow(storeName));
		switch (action) {

		case 'approve' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.companyRequest.approveRequest(storeName));
			break;

		case 'reject' :
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.verifications.companyRequest.rejectRequest(storeName));
			break;

		default :
			break;
		}

	}

}
