import { test, Page } from '@playwright/test';
import { ProductEnquiryPage } from 'pages/productEnquiryPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { dbData } from 'utils/dbData';
import { payloads } from 'utils/payloads';


const { VENDOR_ID, CUSTOMER_ID } = process.env;

let productEnquiryAdmin: ProductEnquiryPage;   //TODO: make admin, customer, vendor instead of productEnquiry
let productEnquiryCustomer: ProductEnquiryPage;
let guestUser: ProductEnquiryPage;
let aPage: Page, cPage: Page, uPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	productEnquiryAdmin = new ProductEnquiryPage(aPage);

	const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
	cPage = await customerContext.newPage();
	productEnquiryCustomer = new ProductEnquiryPage(cPage);

	const guestContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
	uPage = await guestContext.newPage();
	guestUser =  new ProductEnquiryPage(uPage);

	apiUtils = new ApiUtils(request);
	const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
	await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
});

test.afterAll(async ( ) => {
	await aPage.close(); //TODO: close all pages at once instead of one by one
	await cPage.close();
	await uPage.close();
});

test.describe('Abuse report test', () => {


	test('customer can enquire product @pro', async ( ) => {
		await productEnquiryCustomer.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
	});

	test('guest customer can enquire product @pro', async ( ) => {
		await guestUser.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
	});

});
