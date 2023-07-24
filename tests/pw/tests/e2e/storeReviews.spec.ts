import { test, Page } from '@playwright/test';
import { StoreReviewsPage } from 'pages/storeReviewsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


const { VENDOR_ID } = process.env;


let storeReviewsAdmin: StoreReviewsPage;
let storeReviewsCustomer: StoreReviewsPage;
let aPage: Page, cPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	storeReviewsAdmin = new StoreReviewsPage(aPage);

	const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
	cPage = await customerContext.newPage();
	storeReviewsCustomer = new StoreReviewsPage(cPage);

	apiUtils = new ApiUtils(request);
	await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
	const [, reviewId] = await apiUtils.createStoreReview(VENDOR_ID, { ...payloads.createStoreReview, title: 'trashed test review' }, payloads.customerAuth);
	await apiUtils.deleteStoreReview(reviewId, payloads.adminAuth);
});

test.afterAll(async ( ) => {
	await aPage.close(); //TODO: close all pages at once instead of one by one
	await cPage.close(); //TODO: close all pages at once instead of one by one
});

test.describe('Store Reviews test', () => {


	test('dokan store reviews menu page is rendering properly @pro @explo', async ( ) => {
		await storeReviewsAdmin.adminStoreReviewsRenderProperly();
	});

	test('admin can edit store review @pro', async ( ) => {
		await storeReviewsAdmin.editStoreReview(data.storeReview);
	});

	test('admin can filter store reviews by vendor @pro', async ( ) => {
		await storeReviewsAdmin.filterStoreReviews(data.storeReview.filter.byVendor);
	});

	test('admin can delete store review @pro', async ( ) => {
		await storeReviewsAdmin.deleteStoreReview();
	});

	test('admin can restore deleted store review @pro', async ( ) => {
		await storeReviewsAdmin.restoreStoreReview();
	});

	test('admin can permanently delete store review @pro', async ( ) => {
		await storeReviewsAdmin.permanentlyDeleteStoreReview();
	});

	test('admin can perform store reviews bulk action @pro', async ( ) => {
		await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
		await storeReviewsAdmin.storeReviewsBulkAction('trash');
	});

	test('customer can review store @pro', async ( ) => {
		await storeReviewsCustomer.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	});

	test('customer can edit store review @pro', async ( ) => {
		//TODO: need separate method or update locator, ensure previous review exits
		await storeReviewsCustomer.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	});


});
