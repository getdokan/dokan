import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { product } from '@utils/interfaces';

// selectors
const productEnquiryCustomer = selector.customer.cSingleProduct.productEnquiry;

export class ProductEnquiryPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // product enquiry

    // enable product enquiry module
    async enableProductEnquiryModule(productName: string) {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.click(selector.admin.dokan.settings.menus.sellingOptions);
        await this.toBeVisible(selector.admin.dokan.settings.selling.guestProductEnquiry);

        // single product page
        await this.goToProductDetails(productName);
        await this.toBeVisible(selector.customer.cSingleProduct.menus.productEnquiry);
    }

    // disable product enquiry module
    async disableProductEnquiryModule(productName: string) {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.click(selector.admin.dokan.settings.menus.sellingOptions);
        await this.notToBeVisible(selector.admin.dokan.settings.selling.guestProductEnquiry);

        // single product page
        await this.goToProductDetails(productName);
        await this.notToBeVisible(selector.customer.cSingleProduct.menus.productEnquiry);
    }

    //  enquire product
    async enquireProduct(productName: string, enquiry: product['enquiry']): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.productEnquiry);
        const isGuest = await this.isVisible(productEnquiryCustomer.guest.guestName);
        if (isGuest) {
            await this.clearAndType(productEnquiryCustomer.guest.guestName, enquiry.guestName());
            await this.clearAndType(productEnquiryCustomer.guest.guestEmail, enquiry.guestEmail());
        }
        await this.clearAndType(productEnquiryCustomer.enquiryMessage, enquiry.enquiryDetails);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productEnquiryCustomer.submitEnquiry);
        await this.toContainText(productEnquiryCustomer.submitEnquirySuccessMessage, enquiry.enquirySubmitSuccessMessage);
    }
}
