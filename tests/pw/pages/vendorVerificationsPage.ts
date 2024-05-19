import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';
import { dokanSettings } from '@utils/interfaces';

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const verificationsAdmin = selector.admin.dokan.verifications;
const verificationsVendor = selector.vendor.vVerificationSettings;
const singleStoreCustomer = selector.customer.cSingleStore;

export class VendorVerificationsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);

    // verification methods

    async changeVerifiedIcon(icon: string, storeName: string) {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.vendorVerification);

        await this.click(settingsAdmin.vendorVerification.verifiedIconByIcon(icon));
        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.vendorVerification.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.vendorVerification.saveSuccessMessage);

        // single store page
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.toBeVisible(singleStoreCustomer.storeProfile.verifiedIconByIcon(icon));
    }

    // updte verification method fields
    async updateVerificationMethod(verificationMethod: dokanSettings['vendorVerification']['verificationMethodDetails']) {
        await this.clearAndType(settingsAdmin.vendorVerification.addNewVerification.label, verificationMethod.title);
        await this.clearAndType(settingsAdmin.vendorVerification.addNewVerification.helpText, verificationMethod.help_text);
        verificationMethod.required && (await this.check(settingsAdmin.vendorVerification.addNewVerification.required));
    }

    // add Verificaton Method
    async addVendoVerificationMethod(verificationMethod: dokanSettings['vendorVerification']['verificationMethodDetails']) {
        await this.goToDokanSettings();
        await this.reload();
        await this.click(settingsAdmin.menus.vendorVerification);

        await this.click(settingsAdmin.vendorVerification.addNewVerification.addNewVerification);
        await this.updateVerificationMethod(verificationMethod);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.addNewVerification.create, 201);
        await this.toBeVisible(settingsAdmin.vendorVerification.methodCreateSuccessMessage);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.vendorVerification.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // edit Verificaton Method
    async editVendoVerificationMethod(methodName: string, verificationMethod: dokanSettings['vendorVerification']['verificationMethodDetails']) {
        await this.goToDokanSettings();
        await this.reload();
        await this.click(settingsAdmin.menus.vendorVerification);

        await this.hover(settingsAdmin.vendorVerification.verificationMethodRow(methodName));
        await this.click(settingsAdmin.vendorVerification.editVerificationMethod(methodName));
        await this.updateVerificationMethod(verificationMethod);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.addNewVerification.update);
        await this.toBeVisible(settingsAdmin.vendorVerification.methodUpdateSuccessMessage);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.vendorVerification.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // delete Verificaton Method
    async deleteVendoVerificationMethod(methodName: string) {
        await this.goToDokanSettings();
        await this.reload();
        await this.click(settingsAdmin.menus.vendorVerification);

        await this.hover(settingsAdmin.vendorVerification.verificationMethodRow(methodName));
        await this.click(settingsAdmin.vendorVerification.deleteVerificationMethod(methodName));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.confirmDelete, 204);
        await this.toBeVisible(settingsAdmin.vendorVerification.methodDeleteSuccessMessage);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.vendorVerification.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // verification requests

    // verification requests render properly
    async adminVerificationsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.wait(1); //TODO: added to goto else clause need to resolve this

        const noVerificationRequests = await this.isVisible(verificationsAdmin.noRowsFound);

        if (noVerificationRequests) {
            await this.toContainText(verificationsAdmin.noRowsFound, 'No requests found.');
            console.log('No verification request found');
        } else {
            // verification requests text is visible
            await this.toBeVisible(verificationsAdmin.verificationRequestsText);

            // navTab elements are visible
            const { tabByStatus, ...navTabs } = verificationsAdmin.navTabs;
            await this.multipleElementVisible(navTabs);

            // bulk action elements are visible
            await this.multipleElementVisible(verificationsAdmin.bulkActions);

            // filter elements are visible
            const { filterInput, resetFilterByVendors, resetFilterByMethods, reset, result, ...filters } = verificationsAdmin.filters;
            await this.multipleElementVisible(filters);

            // verification table elements are visible
            await this.multipleElementVisible(verificationsAdmin.table);
        }
    }

    // verification requests
    async filterVerificationRequests(input: string, action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        switch (action) {
            case 'by-status': {
                await this.click(verificationsAdmin.navTabs.tabByStatus(input));
                await this.clickAndWaitForLoadState(verificationsAdmin.navTabs.tabByStatus(input));
                await this.wait(1); // todo: need to resolve this
                const count = await this.getElementCount(verificationsAdmin.statusColumnValue(input.toLowerCase()));
                await this.toHaveCount(verificationsAdmin.currentNoOfRows, count);
                return;
            }

            case 'by-vendor':
                await this.click(verificationsAdmin.filters.filterByVendors);
                break;

            case 'by-verification-method':
                await this.click(verificationsAdmin.filters.filterByMethods);
                break;

            default:
                break;
        }
        await this.fill(verificationsAdmin.filters.filterInput, input);
        await this.toContainText(verificationsAdmin.filters.result, input);
        await this.pressAndWaitForResponse(data.subUrls.api.dokan.verifications, data.key.enter);
        // todo: need to wait for focus event
        //todo: need to update assertions
        const count = (await this.getElementText(verificationsAdmin.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // add note to verification request
    async addNoteVerificationRequest(requestId: string, note: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        await this.click(verificationsAdmin.verificationRequestAddNote(requestId));
        await this.clearAndType(verificationsAdmin.addNote, note);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.updateNote);
    }

    // view verification request document
    async viewVerificationRequestDocument(requestId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        // ensure link suppose to open on new tab
        await this.toHaveAttribute(verificationsAdmin.verificationRequestDocument(requestId), 'target', '_blank');
        // force link to open on the same tab
        await this.setAttributeValue(verificationsAdmin.verificationRequestDocument(requestId), 'target', '_self');
        const documentLink = (await this.getAttributeValue(verificationsAdmin.verificationRequestDocument(requestId), 'href')) as string;
        await this.clickAndWaitForUrl(documentLink, verificationsAdmin.verificationRequestDocument(requestId));
        await this.toHaveAttribute('body img', 'src', documentLink);
    }

    // update verification request
    async updateVerificationRequest(requestId: string, action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reload();
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.verificationRequestApprove(requestId));
                break;

            case 'reject':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.verificationRequestReject(requestId));
                break;

            default:
                break;
        }
    }

    // verification request bulk action
    async verificationRequestBulkAction(action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        // ensure row exists
        await this.notToBeVisible(verificationsAdmin.noRowsFound);

        await this.click(verificationsAdmin.bulkActions.selectAll);
        await this.selectByValue(verificationsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.bulkActions.applyAction);
    }

    // vendor

    // vendor verifications render properly
    async vendorVerificationsSettingsRenderProperly(methodName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        // verification text is visible
        await this.toBeVisible(verificationsVendor.verificationText);

        // visit store link is visible
        await this.toBeVisible(verificationsVendor.visitStore);

        // verification method
        await this.toBeVisible(verificationsVendor.verificationMethodDiv(methodName));
        await this.toBeVisible(verificationsVendor.startVerification(methodName));

        await this.click(verificationsVendor.startVerification(methodName));

        await this.toBeVisible(verificationsVendor.verificationMethodHelpText(methodName));
        await this.toBeVisible(verificationsVendor.uploadFiles(methodName));
        await this.toBeVisible(verificationsVendor.submit(methodName));
        await this.toBeVisible(verificationsVendor.cancelSubmit(methodName));
    }

    // vendor submit verification request
    async submitVerificationRequest(verification: vendor['verification']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
        await this.reload(); //todo: need to resolve this

        await this.click(verificationsVendor.startVerification(verification.method));
        await this.click(verificationsVendor.uploadFiles(verification.method));
        await this.uploadMedia(verification.file);
        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.submit(verification.method));

        await this.toBeVisible(verificationsVendor.requestCreateSuccessMessage);
        await this.toBeVisible(verificationsVendor.verificationStatus(verification.method, 'pending'));
    }

    // vendor cancel verification request
    async cancelVerificationRequest(verificationMethod: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
        await this.reload(); //todo: need to resolve this

        await this.click(verificationsVendor.cancelVerification(verificationMethod));
        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.confirmCancelRequest);
        await this.toBeVisible(verificationsVendor.requestCancelSuccessMessage);
    }

    // customer

    async viewVerifiedBadge(storeName: string) {
        // store listing page
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.customerPage.searchStore(storeName);
        await this.toBeVisible(singleStoreCustomer.storeProfile.verifiedIcon);

        // single store page
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.toBeVisible(singleStoreCustomer.storeProfile.verifiedIcon);
    }
}
