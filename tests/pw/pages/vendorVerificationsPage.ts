import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';


// selectors
const verificationsAdmin = selector.admin.dokan.verifications;
const verificationsVendor = selector.vendor.vVerificationSettings;

export class vendorVerificationsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // verification requests

    // verification requests render properly
    async adminVerificationsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

        // tools text is visible
        await this.toBeVisible(verificationsAdmin.verificationRequestsText);

        // navTab elements are visible
        await this.multipleElementVisible(verificationsAdmin.navTabs);

        // verification table elements are visible
        await this.multipleElementVisible(verificationsAdmin.table);
    }

    // approve verification requests
    async approveVerificationRequest(storeName: string, verificationType: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

        const verificationRequestIsExists = await this.isVisible(verificationsAdmin.vendorRow(storeName));

        if (!verificationRequestIsExists) {
            console.log('No pending verification request found!!');
            return;
        }

        await this.hover(verificationsAdmin.vendorRow(storeName));

        switch (verificationType) {
            case 'id':
                if (action === 'approve') {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.idRequest.approveRequest(storeName));
                } else {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.idRequest.rejectRequest(storeName));
                }
                break;

            case 'address':
                if (action === 'approve') {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.addressRequest.approveRequest(storeName));
                } else {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.addressRequest.rejectRequest(storeName));
                }

                break;

            case 'company':
                if (action === 'approve') {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.companyRequest.approveRequest(storeName));
                } else {
                    await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.companyRequest.rejectRequest(storeName));
                }

                break;

            default:
                break;
        }
    }

    // disapprove verification requests
    async disapproveVerificationRequest(storeName: string, verificationType: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);

        await this.clickAndWaitForLoadState(verificationsAdmin.navTabs.approved);

        const verificationRequestIsExists = await this.isVisible(verificationsAdmin.vendorRow(storeName));
        if (!verificationRequestIsExists) {
            console.log('No approved verification request found!!');
            return;
        }

        await this.hover(verificationsAdmin.vendorRow(storeName));

        switch (verificationType) {
            case 'id':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.idRequest.disapproveRequest(storeName));
                break;

            case 'address':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.addressRequest.disapproveRequest(storeName));
                break;

            case 'company':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, verificationsAdmin.companyRequest.disapproveRequest(storeName));
                break;

            default:
                break;
        }
    }

    // vendor

    // vendor verifications render properly
    async vendorVerificationsSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        // verification text is visible
        await this.toBeVisible(verificationsVendor.verificationText);

        // visit store link is visible
        await this.toBeVisible(verificationsVendor.visitStore);

        // verification div and heading text

        // id
        await this.toBeVisible(verificationsVendor.id.idVerificationDiv);
        await this.toBeVisible(verificationsVendor.id.idVerificationText);

        // address
        await this.toBeVisible(verificationsVendor.address.addressVerificationDiv);
        await this.toBeVisible(verificationsVendor.address.addressVerificationText);

        // company
        await this.toBeVisible(verificationsVendor.company.companyVerificationDiv);
        await this.toBeVisible(verificationsVendor.company.companyVerificationText);

        // verification request is pending

        // id
        const idRequestIsPending = await this.isVisible(verificationsVendor.id.idPendingFeedback);
        if (idRequestIsPending) {
            await this.toContainText(verificationsVendor.id.idPendingFeedback, 'Your ID verification request is pending');
            await this.toBeVisible(verificationsVendor.id.cancelIdVerificationRequest);
        }

        // address
        const addressRequestIsPending = await this.isVisible(verificationsVendor.address.addressPendingFeedback);
        if (addressRequestIsPending) {
            await this.toContainText(verificationsVendor.address.addressPendingFeedback, 'Your Address verification request is pending');
            await this.toBeVisible(verificationsVendor.address.cancelAddressVerificationRequest);
        }

        // company
        const companyRequestIsPending = await this.isVisible(verificationsVendor.company.companyPendingFeedback);
        if (companyRequestIsPending) {
            await this.toContainText(verificationsVendor.company.companyPendingFeedback, 'Your company verification request is pending');
            await this.toBeVisible(verificationsVendor.company.cancelCompanyVerificationRequest);
        }

        // verification request is approved

        // id
        const idRequestIsApproved = await this.isVisible(verificationsVendor.id.idApproveFeedback);
        if (idRequestIsApproved) {
            await this.toContainText(verificationsVendor.id.idApproveFeedback, 'Your ID verification request is approved');
        }

        // address
        const addressRequestIsApproved = await this.isVisible(verificationsVendor.address.addressApproveFeedback);
        if (addressRequestIsApproved) {
            await this.toContainText(verificationsVendor.address.addressApproveFeedback, 'Your Address verification request is approved');
            await this.toBeVisible(verificationsVendor.address.startAddressVerification);
        }

        // company
        const companyRequestIsApproved = await this.isVisible(verificationsVendor.company.companyApproveFeedback);
        if (companyRequestIsApproved) {
            await this.toContainText(verificationsVendor.company.companyApproveFeedback, 'Your company verification request is approved');
            await this.toBeVisible(verificationsVendor.company.startCompanyVerification);
        }

        // no verification request is submitted

        // id
        if (!idRequestIsPending && !idRequestIsApproved) {
            await this.toBeVisible(verificationsVendor.id.startIdVerification);

            await this.click(verificationsVendor.id.startIdVerification);

            await this.toBeVisible(verificationsVendor.id.passport);
            await this.toBeVisible(verificationsVendor.id.nationalIdCard);
            await this.toBeVisible(verificationsVendor.id.drivingLicense);
            const previousUploadedPhotoIsVisible = await this.isVisible(verificationsVendor.id.previousUploadedPhoto);
            previousUploadedPhotoIsVisible && (await this.toBeVisible(verificationsVendor.id.uploadPhoto));
            await this.toBeVisible(verificationsVendor.id.submitId);
            await this.toBeVisible(verificationsVendor.id.cancelSubmitId);
        }

        // address
        if (!addressRequestIsPending && !addressRequestIsApproved) {
            await this.toBeVisible(verificationsVendor.address.startAddressVerification);

            await this.click(verificationsVendor.address.startAddressVerification);

            await this.toBeVisible(verificationsVendor.address.street);
            await this.toBeVisible(verificationsVendor.address.street2);
            await this.toBeVisible(verificationsVendor.address.city);
            await this.toBeVisible(verificationsVendor.address.postOrZipCode);
            await this.toBeVisible(verificationsVendor.address.country);
            const previousUploadedResidenceProofIsVisible = await this.isVisible(verificationsVendor.address.previousUploadedResidenceProof);
            !previousUploadedResidenceProofIsVisible && (await this.toBeVisible(verificationsVendor.address.uploadResidenceProof));
            await this.toBeVisible(verificationsVendor.address.submitAddress);
            await this.toBeVisible(verificationsVendor.address.cancelSubmitAddress);
        }

        // company
        if (!companyRequestIsPending && !companyRequestIsApproved) {
            await this.toBeVisible(verificationsVendor.company.startCompanyVerification);

            await this.click(verificationsVendor.company.startCompanyVerification);

            await this.toBeVisible(verificationsVendor.company.uploadFiles);
            await this.toBeVisible(verificationsVendor.company.submitCompanyInfo);
            await this.toBeVisible(verificationsVendor.company.cancelSubmitCompanyInfo);
        }
    }

    // vendor send id verification request
    async sendIdVerificationRequest(verification: vendor['verification']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        const idRequestIsApproved = await this.isVisible(verificationsVendor.id.idApproveFeedback);
        if (idRequestIsApproved) {
            return;
        }

        // cancel previous verification request if any
        const cancelRequestIsVisible = await this.isVisible(verificationsVendor.id.cancelIdVerificationRequest);
        if (cancelRequestIsVisible) {
            await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.id.cancelIdVerificationRequest);
            await this.toContainText(verificationsVendor.id.idUpdateSuccessMessage, verification.idRequestSubmitCancel);
        }

        // id verification
        await this.click(verificationsVendor.id.startIdVerification);
        // await this.wait(0.5); // todo: resolve this
        await this.waitForVisibleLocator(verificationsVendor.id.submitId);

        // remove previously uploaded image
        const uploadPhotoBtnIsVisible = await this.isVisible(verificationsVendor.id.uploadPhoto);
        if (!uploadPhotoBtnIsVisible) {
            // await this.hover(verificationsVendor.id.previousUploadedPhoto); // todo:  not working: playwright issue
            // await this.click(verificationsVendor.id.removePreviousUploadedPhoto);

            await this.setAttributeValue('.gravatar-wrap', 'class', 'gravatar-wrap dokan-hide');
            await this.setAttributeValue('.gravatar-button-area.dokan-hide', 'class', 'gravatar-button-area');
        }

        await this.click(verificationsVendor.id.uploadPhoto);
        await this.uploadMedia(verification.file);

        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.id.submitId);
        await this.toContainText(verificationsVendor.id.idUpdateSuccessMessage, verification.idRequestSubmitSuccessMessage);
    }

    // vendor send address verification request
    async sendAddressVerificationRequest(verification: vendor['verification']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        // cancel previous verification request if any
        const cancelRequestIsVisible = await this.isVisible(verificationsVendor.address.cancelAddressVerificationRequest);
        if (cancelRequestIsVisible) {
            await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.address.cancelAddressVerificationRequest);
            await this.toContainText(verificationsVendor.address.addressUpdateSuccessMessage, verification.addressRequestSubmitCancel);
        }

        // address verification
        await this.click(verificationsVendor.address.startAddressVerification);
        await this.clearAndType(verificationsVendor.address.street, verification.street1);
        await this.clearAndType(verificationsVendor.address.street2, verification.street2);
        await this.clearAndType(verificationsVendor.address.city, verification.city);
        await this.clearAndType(verificationsVendor.address.postOrZipCode, verification.zipCode);
        await this.selectByValue(verificationsVendor.address.country, verification.country);
        await this.selectByValue(verificationsVendor.address.state, verification.state);

        // remove previously uploaded image
        const uploadProofBtnIsVisible = await this.isVisible(verificationsVendor.address.uploadResidenceProof);
        if (!uploadProofBtnIsVisible) {
            await this.removeAttribute('div.proof-button-area', 'style');
            await this.setAttributeValue('div.vendor_img_container', 'style', 'display: none;');
        }

        await this.click(verificationsVendor.address.uploadResidenceProof);
        await this.uploadMedia(verification.file);

        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.address.submitAddress);
        await this.toContainText(verificationsVendor.address.addressUpdateSuccessMessage, verification.addressRequestSubmitSuccessMessage);
    }

    // vendor send company verification request
    async sendCompanyVerificationRequest(verification: vendor['verification']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        // cancel previous verification request if any
        const cancelRequestIsVisible = await this.isVisible(verificationsVendor.company.cancelCompanyVerificationRequest);
        if (cancelRequestIsVisible) {
            await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.company.cancelCompanyVerificationRequest);
            await this.toContainText(verificationsVendor.company.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitCancel);
        }

        // company verification
        await this.click(verificationsVendor.company.startCompanyVerification);
        // await this.wait(1); // todo: need to resolve this
        await this.waitForVisibleLocator(verificationsVendor.company.submitCompanyInfo);

        // remove previously uploaded company file
        const UploadedCompanyFileIsVisible = await this.isVisible(verificationsVendor.company.uploadedFileFirst);
        if (UploadedCompanyFileIsVisible) {
            await this.click(verificationsVendor.company.uploadedFileFirst);
        }

        await this.click(verificationsVendor.company.uploadFiles);
        await this.uploadMedia(verification.file);

        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.company.submitCompanyInfo);
        await this.toContainText(verificationsVendor.company.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitSuccessMessage);
    }
}
