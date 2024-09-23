import { Page } from '@playwright/test';
import { CustomerPage } from './customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { storeContactData } from '@utils/interfaces';

// selectors
const singleStoreCustomer = selector.customer.cSingleStore;

export class PrivacyPolicyPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // contact vendor
    async contactVendor(storeName: string, storeContactData: storeContactData) {
        await this.gotoSingleStore(storeName);
        await this.clearAndType(singleStoreCustomer.storeContactForm.name, storeContactData.name);
        await this.clearAndType(singleStoreCustomer.storeContactForm.email, storeContactData.email);
        await this.clearAndType(singleStoreCustomer.storeContactForm.message, storeContactData.message);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, singleStoreCustomer.storeContactForm.sendMessage);
        await this.toContainText(singleStoreCustomer.storeContactForm.successMessage, 'Email sent successfully!');
    }

    // go to privacy policy
    async goToPrivacyPolicy(storeName: string) {
        await this.gotoSingleStore(storeName);
        // ensure link suppose to open on new tab
        await this.toHaveAttribute(singleStoreCustomer.storeContactForm.privacyPolicyLink, 'target', '_blank');
        // force link to open on the same tab
        await this.setAttributeValue(singleStoreCustomer.storeContactForm.privacyPolicyLink, 'target', '_self');
        await this.clickAndWaitForUrl(helpers.stringToRegex('privacy-policy'), singleStoreCustomer.storeContactForm.privacyPolicyLink);
    }

    async disablePrivacyPolicy(storeName: string) {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(singleStoreCustomer.storeContactForm.privacyPolicy);
    }

    async disableStoreContactForm(storeName: string) {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(singleStoreCustomer.storeContactForm.storeContactForm);
    }
}
