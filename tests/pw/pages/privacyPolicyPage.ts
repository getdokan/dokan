import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
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
        await this.toPass(async () => {
            await this.gotoUntilNetworkidle(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
            await this.toBeVisible(singleStoreCustomer.storeContactForm.storeContactForm);
        });
        await this.clearAndType(singleStoreCustomer.storeContactForm.name, storeContactData.name);
        await this.clearAndType(singleStoreCustomer.storeContactForm.email, storeContactData.email);
        await this.clearAndType(singleStoreCustomer.storeContactForm.message, storeContactData.message);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, singleStoreCustomer.storeContactForm.sendMessage);
        await this.toContainText(singleStoreCustomer.storeContactForm.successMessage, 'Email sent successfully!');
    }

    // go to privacy policy
    async goToPrivacyPolicy(storeName: string) {
        await this.gotoSingleStore(storeName);
        await this.forceLinkToSameTab(singleStoreCustomer.storeContactForm.privacyPolicyLink);
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
