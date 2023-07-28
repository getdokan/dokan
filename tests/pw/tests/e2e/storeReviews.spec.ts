import { test, Page } from '@playwright/test';
import { StoreReviewsPage } from 'pages/storeReviewsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Store Reviews test', () => {

	const { VENDOR_ID } = process.env;


	let admin: StoreReviewsPage;
	let customer: StoreReviewsPage;
	let aPage: Page, cPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new StoreReviewsPage(aPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new StoreReviewsPage(cPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
		const [, reviewId] = await apiUtils.createStoreReview(VENDOR_ID, { ...payloads.createStoreReview, title: 'trashed test review' }, payloads.customerAuth);
		await apiUtils.deleteStoreReview(reviewId, payloads.adminAuth);
	});


	test.afterAll(async () => {
		await aPage.close();
		await cPage.close();
	});


	test('dokan store reviews menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminStoreReviewsRenderProperly();
	});

	test('admin can edit store review @pro', async ( ) => {
		await admin.editStoreReview(data.storeReview);
	});

	test('admin can filter store reviews by vendor @pro', async ( ) => {
		await admin.filterStoreReviews(data.storeReview.filter.byVendor);
	});

	test('admin can delete store review @pro', async ( ) => {
		await admin.deleteStoreReview();
	});

	test('admin can restore deleted store review @pro', async ( ) => {
		await admin.restoreStoreReview();
	});

	test('admin can permanently delete store review @pro', async ( ) => {
		await admin.permanentlyDeleteStoreReview();
	});

	test('admin can perform store reviews bulk action @pro', async ( ) => {
		await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
		await admin.storeReviewsBulkAction('trash');
	});

	test('customer can review store @pro', async ( ) => {
		await customer.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	});

	test('customer can edit store review @pro', async ( ) => {
		await customer.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	});


});
