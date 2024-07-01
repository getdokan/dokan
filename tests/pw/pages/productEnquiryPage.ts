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
