import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { vendor } from 'utils/interfaces';


export class vendorVerificationsPage extends AdminPage {

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


	// approve verification requests
	async approveVerificationRequest(storeName: string, verificationType: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		const verificationRequestIsExists = await this.isVisible(selector.admin.dokan.verifications.vendorRow(storeName));

		if(!verificationRequestIsExists){
			console.log('No pending verification request found!!');
			return;
		}

		await this.hover(selector.admin.dokan.verifications.vendorRow(storeName));

		switch (verificationType) {

		case 'id' :
			if (action === 'approve'){
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.idRequest.approveRequest(storeName));
			} else {
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.idRequest.rejectRequest(storeName));
			}
			break;

		case 'address' :
			if (action === 'approve'){
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.addressRequest.approveRequest(storeName));
			} else {
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.addressRequest.rejectRequest(storeName));
			}

			break;

		case 'company' :
			if (action === 'approve'){
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.companyRequest.approveRequest(storeName));
			} else {
				await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.companyRequest.rejectRequest(storeName));
			}

			break;

		default :
			break;
		}
	}


	// disapprove verification requests
	async disapproveVerificationRequest(storeName: string, verificationType: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

		await this.clickAndWaitForLoadState(selector.admin.dokan.verifications.navTabs.approved);

		const verificationRequestIsExists = await this.isVisible(selector.admin.dokan.verifications.vendorRow(storeName));
		if(!verificationRequestIsExists){
			console.log('No approved verification request found!!');
			return;
		}

		await this.hover(selector.admin.dokan.verifications.vendorRow(storeName));

		switch (verificationType) {

		case 'id' :
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.idRequest.disapproveRequest(storeName));
			break;

		case 'address' :
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.addressRequest.disapproveRequest(storeName));
			break;

		case 'company' :
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.verifications.companyRequest.disapproveRequest(storeName));
			break;

		default :
			break;
		}
	}


	// vendor

	// vendor verifications render properly
	async vendorVerificationsSettingsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		// verification text is visible
		await this.toBeVisible(selector.vendor.vVerificationSettings.verificationText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vVerificationSettings.visitStore);


		// verification div and heading text

		// id
		await this.toBeVisible(selector.vendor.vVerificationSettings.id.idVerificationDiv);
		await this.toBeVisible(selector.vendor.vVerificationSettings.id.idVerificationText);

		// address
		await this.toBeVisible(selector.vendor.vVerificationSettings.address.addressVerificationDiv);
		await this.toBeVisible(selector.vendor.vVerificationSettings.address.addressVerificationText);

		// company
		await this.toBeVisible(selector.vendor.vVerificationSettings.company.companyVerificationDiv);
		await this.toBeVisible(selector.vendor.vVerificationSettings.company.companyVerificationText);


		// verification request is pending


		// id
		const idRequestIsPending = await this.isVisible(selector.vendor.vVerificationSettings.id.idPendingFeedback);
		if (idRequestIsPending){
			await this.toContainText(selector.vendor.vVerificationSettings.id.idPendingFeedback, 'Your ID verification request is pending');
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.cancelIdVerificationRequest);
		}

		// address
		const addressRequestIsPending = await this.isVisible(selector.vendor.vVerificationSettings.address.addressPendingFeedback);
		if (addressRequestIsPending){
			await this.toContainText(selector.vendor.vVerificationSettings.address.addressPendingFeedback, 'Your Address verification request is pending');
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.cancelAddressVerificationRequest);
		}

		// company
		const companyRequestIsPending = await this.isVisible(selector.vendor.vVerificationSettings.company.companyPendingFeedback);
		if (companyRequestIsPending){
			await this.toContainText(selector.vendor.vVerificationSettings.company.companyPendingFeedback, 'Your company verification request is pending');
			await this.toBeVisible(selector.vendor.vVerificationSettings.company.cancelCompanyVerificationRequest);
		}


		// verification request is approved


		// id
		const idRequestIsApproved = await this.isVisible(selector.vendor.vVerificationSettings.id.idApproveFeedback);
		if (idRequestIsApproved){
			await this.toContainText(selector.vendor.vVerificationSettings.id.idApproveFeedback, 'Your ID verification request is approved');
		}

		// address
		const addressRequestIsApproved = await this.isVisible(selector.vendor.vVerificationSettings.address.addressApproveFeedback);
		if (addressRequestIsApproved){
			await this.toContainText(selector.vendor.vVerificationSettings.address.addressApproveFeedback, 'Your Address verification request is approved');
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.startAddressVerification);
		}

		// company
		const companyRequestIsApproved = await this.isVisible(selector.vendor.vVerificationSettings.company.companyApproveFeedback);
		if (companyRequestIsApproved){
			await this.toContainText(selector.vendor.vVerificationSettings.company.companyApproveFeedback, 'Your company verification request is approved');
			await this.toBeVisible(selector.vendor.vVerificationSettings.company.startCompanyVerification);
		}


		// no verification request is submitted

		// id
		if (!idRequestIsPending && !idRequestIsApproved ){
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.startIdVerification);

			await this.click(selector.vendor.vVerificationSettings.id.startIdVerification);

			await this.toBeVisible(selector.vendor.vVerificationSettings.id.passport);
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.nationalIdCard);
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.drivingLicense);
			const  previousUploadedPhotoIsVisible =  await this.isVisible(selector.vendor.vVerificationSettings.id.previousUploadedPhoto);
			previousUploadedPhotoIsVisible && await this.toBeVisible(selector.vendor.vVerificationSettings.id.uploadPhoto);
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.submitId);
			await this.toBeVisible(selector.vendor.vVerificationSettings.id.cancelSubmitId);
		}

		// address
		if (!addressRequestIsPending && !addressRequestIsApproved){
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.startAddressVerification);

			await this.click(selector.vendor.vVerificationSettings.address.startAddressVerification);

			await this.toBeVisible(selector.vendor.vVerificationSettings.address.street);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.street2);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.city);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.postOrZipCode);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.country);
			const  previousUploadedResidenceProofIsVisible =  await this.isVisible(selector.vendor.vVerificationSettings.address.previousUploadedResidenceProof);
			!previousUploadedResidenceProofIsVisible  && await this.toBeVisible(selector.vendor.vVerificationSettings.address.uploadResidenceProof);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.submitAddress);
			await this.toBeVisible(selector.vendor.vVerificationSettings.address.cancelSubmitAddress);
		}

		// company
		if (!companyRequestIsPending && !companyRequestIsApproved){
			await this.toBeVisible(selector.vendor.vVerificationSettings.company.startCompanyVerification);

			await this.click(selector.vendor.vVerificationSettings.company.startCompanyVerification);

			await this.toBeVisible(selector.vendor.vVerificationSettings.company.uploadFiles);
			await this.toBeVisible(selector.vendor.vVerificationSettings.company.submitCompanyInfo);
			await this.toBeVisible(selector.vendor.vVerificationSettings.company.cancelSubmitCompanyInfo);
		}

	}


	// vendor send id verification request
	async sendIdVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		const idRequestIsApproved = await this.isVisible(selector.vendor.vVerificationSettings.id.idApproveFeedback);
		if(idRequestIsApproved){
			return;
		}

		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.id.cancelIdVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.id.cancelIdVerificationRequest);
			await this.toContainText(selector.vendor.vVerificationSettings.id.idUpdateSuccessMessage, verification.idRequestSubmitCancel);
		}

		// id verification
		await this.click(selector.vendor.vVerificationSettings.id.startIdVerification);
		await this.wait(0.5); //todo: resolve this

		// remove previously uploaded image
		const uploadPhotoBtnIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.id.uploadPhoto);
		if (!uploadPhotoBtnIsVisible) {
			// await this.hover(selector.vendor.vVerificationSettings.id.previousUploadedPhoto); //todo:  not working: playwright issue
			// await this.click(selector.vendor.vVerificationSettings.id.removePreviousUploadedPhoto);

			await this.setAttributeValue('.gravatar-wrap', 'class', 'gravatar-wrap dokan-hide');
			await this.setAttributeValue('.gravatar-button-area.dokan-hide', 'class', 'gravatar-button-area');
		}

		await this.click(selector.vendor.vVerificationSettings.id.uploadPhoto);
		await this.uploadMedia(verification.file);

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.id.submitId);
		await this.toContainText(selector.vendor.vVerificationSettings.id.idUpdateSuccessMessage, verification.idRequestSubmitSuccessMessage);
	}


	// vendor send address verification request
	async sendAddressVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.address.cancelAddressVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.address.cancelAddressVerificationRequest);
			await this.toContainText(selector.vendor.vVerificationSettings.address.addressUpdateSuccessMessage, verification.addressRequestSubmitCancel);
		}

		// address verification
		await this.click(selector.vendor.vVerificationSettings.address.startAddressVerification);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.street, verification.street1);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.street2, verification.street2);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.city, verification.city);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.postOrZipCode, verification.zipCode);
		await this.selectByValue(selector.vendor.vVerificationSettings.address.country, verification.country);
		await this.selectByValue(selector.vendor.vVerificationSettings.address.state, verification.state);

		// remove previously uploaded image
		const uploadProofBtnIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.address.uploadResidenceProof);
		if (!uploadProofBtnIsVisible) {
			await this.removeAttribute('div.proof-button-area', 'style');
			await this.setAttributeValue('div.vendor_img_container', 'style', 'display: none;');
		}

		await this.click(selector.vendor.vVerificationSettings.address.uploadResidenceProof);
		await this.uploadMedia(verification.file);

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.address.submitAddress);
		await this.toContainText(selector.vendor.vVerificationSettings.address.addressUpdateSuccessMessage, verification.addressRequestSubmitSuccessMessage);
	}


	// vendor send company verification request
	async sendCompanyVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.company.cancelCompanyVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.company.cancelCompanyVerificationRequest);
			await this.toContainText(selector.vendor.vVerificationSettings.company.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitCancel);
		}

		// company verification
		await this.click(selector.vendor.vVerificationSettings.company.startCompanyVerification);
		await this.wait(1);

		// remove previously uploaded company file
		const UploadedCompanyFileIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.company.uploadedFileFirst);
		if (UploadedCompanyFileIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.company.uploadedFileFirst);
		}

		await this.click(selector.vendor.vVerificationSettings.company.uploadFiles);
		await this.uploadMedia(verification.file);

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.company.submitCompanyInfo);
		await this.toContainText(selector.vendor.vVerificationSettings.company.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitSuccessMessage);
	}


	// upload media //todo: move to base-page and merge with wpUploadFile
	async uploadMedia(file: string) {
		await this.wait(0.5);
		const uploadedMediaIsVisible = await this.isVisible(selector.wpMedia.uploadedMediaFirst);
		if (uploadedMediaIsVisible) {
			await this.click(selector.wpMedia.uploadedMediaFirst);
		} else {
			await this.uploadFile(selector.wpMedia.selectFilesInput, file);
			const isSelectDisabled = await this.isDisabled(selector.wpMedia.select);
			isSelectDisabled && await this.click(selector.wpMedia.selectUploadedMedia);
			await this.click(selector.wpMedia.select);
		}
	}


}
