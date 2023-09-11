import { Page } from '@playwright/test';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { product } from 'utils/interfaces';


export class ProductEnquiryPage extends CustomerPage {

	constructor(page: Page) {
		super(page);
	}


	// product enquiry


	//  enquire product
	async enquireProduct(productName: string, enquiry: product['enquiry']): Promise<void> {
		await this.goToProductDetails(productName);
		await this.click(selector.customer.cSingleProduct.menus.productEnquiry);
		const isGuest = await this.isVisible(selector.customer.cSingleProduct.productEnquiry.guest.guestName);
		if (isGuest){
			await this.clearAndType(selector.customer.cSingleProduct.productEnquiry.guest.guestName, enquiry.guestName());
			await this.clearAndType(selector.customer.cSingleProduct.productEnquiry.guest.guestEmail, enquiry.guestEmail());
		}
		await this.clearAndType(selector.customer.cSingleProduct.productEnquiry.enquiryMessage, enquiry.enquiryDetails);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleProduct.productEnquiry.submitEnquiry);
		await this.toContainText(selector.customer.cSingleProduct.productEnquiry.submitEnquirySuccessMessage, enquiry.enquirySubmitSuccessMessage);
	}


}
