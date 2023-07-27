import { test } from '@playwright/test';
import { CouponsPage } from 'pages/couponsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { PRODUCT_ID } = process.env;


test.describe('Coupons test', () => {


	let admin: CouponsPage;
	let vendor: CouponsPage;
	let customer: CouponsPage;
	let apiUtils: ApiUtils;
	let marketplaceCouponCode: string;
	let couponCode: string;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		const aPage = await adminContext.newPage();
		admin = new CouponsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		const vPage = await vendorContext.newPage();
		vendor = new CouponsPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		const cPage = await customerContext.newPage();
		customer = new CouponsPage(cPage);

		apiUtils = new ApiUtils(request);
		[,, marketplaceCouponCode] = await apiUtils.createMarketPlaceCoupon( payloads.createMarketPlaceCoupon(), payloads.adminAuth);
		[,, couponCode] = await apiUtils.createCoupon([PRODUCT_ID], payloads.createCoupon(), payloads.vendorAuth);
	});


	test.afterAll(async ({ browser }) => {
		await browser.close();
	});


	test('admin can add marketplace coupon @pro', async ( ) => {
		await admin.addMarketplaceCoupon(data.coupon);
	});

	test('vendor coupon menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorCouponsRenderProperly();
	});

	test('vendor can view marketPlace coupon @pro', async ( ) => {
		await vendor.viewMarketPlaceCoupon(marketplaceCouponCode);
	});

	test('vendor can add coupon @pro', async ( ) => {
		await vendor.addCoupon(data.coupon);
	});

	test('vendor can edit coupon @pro', async ( ) => {
		await vendor.editCoupon({ ...data.coupon, editCoupon: couponCode });
	});

	test('vendor can delete coupon @pro', async ( ) => {
		await vendor.deleteCoupon(couponCode);
	});

	test('customer can view coupon on single store @pro', async ( ) => {
		await customer.storeCoupon(data.predefined.vendorStores.vendor1, 'c1_v1');
	});

	//todo: add more customer tests


});
