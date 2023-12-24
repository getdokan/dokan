import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { storeContactData } from '@utils/interfaces';

export class PrivacyPolicy extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // contact vendor
    async contactVendor(storeName: string, storeContactData: storeContactData) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.clearAndType(selector.customer.cSingleStore.storeContactForm.name, storeContactData.name);
        await this.clearAndType(selector.customer.cSingleStore.storeContactForm.email, storeContactData.email);
        await this.clearAndType(selector.customer.cSingleStore.storeContactForm.message, storeContactData.message);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.storeContactForm.sendMessage);
        await this.toContainText(selector.customer.cSingleStore.storeContactForm.successMessage, 'Email sent successfully!');
    }

    // go to privacy policy
    async goToPrivacyPolicy(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        // ensure page suppose to open on new tab
        await this.toHaveAttribute(selector.customer.cSingleStore.storeContactForm.privacyPolicyLink, 'target', '_blank');
        // force page to open on same tab
        await this.setAttributeValue(selector.customer.cSingleStore.storeContactForm.privacyPolicyLink, 'target', '_self');
        await this.clickAndWaitForUrl(helpers.stringToRegex('privacy-policy'), selector.customer.cSingleStore.storeContactForm.privacyPolicyLink);
    }

    async disabledPrivacyPolicy(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(selector.customer.cSingleStore.storeContactForm.privacyPolicy);
    }

    async disabledStoreContactForm(storeName: string) {
        await this.goto(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(selector.customer.cSingleStore.storeContactForm.storeContactForm);
    }
}
