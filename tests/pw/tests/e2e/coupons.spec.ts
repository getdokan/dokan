import { test, request, Page } from '@playwright/test';
import { CouponsPage } from '@pages/couponsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = process.env;

test.describe('Coupons test', () => {
    let admin: CouponsPage;
    let vendor: CouponsPage;
    let customer: CouponsPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let marketplaceCouponCode: string;
    let couponCode: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new CouponsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new CouponsPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new CouponsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , marketplaceCouponCode] = await apiUtils.createMarketPlaceCoupon(payloads.createMarketPlaceCoupon(), payloads.adminAuth);
        [, , couponCode] = await apiUtils.createCoupon([PRODUCT_ID], payloads.createCoupon(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    test.skip('admin can add marketplace coupon', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addMarketplaceCoupon({ ...data.coupon, title: data.coupon.couponTitle() });
    });

    //vendor

    test('vendor can view coupons menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorCouponsRenderProperly();
    });

    test('vendor can view marketPlace coupons', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.viewMarketPlaceCoupons(marketplaceCouponCode);
    });

    test('vendor can add coupon', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addCoupon({ ...data.coupon, title: data.coupon.couponTitle() });
    });

    test('vendor can edit coupon', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editCoupon({ ...data.coupon, title: couponCode });
    });

    test('vendor can delete coupon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , couponCode] = await apiUtils.createCoupon([PRODUCT_ID], payloads.createCoupon(), payloads.vendorAuth);
        await vendor.deleteCoupon(couponCode);
    });

    //customer

    test('customer can view coupon on single store', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewStoreCoupon(data.predefined.vendorStores.vendor1, couponCode);
    });

    test('customer can apply coupon', { tag: ['@pro', '@customer'] }, async () => {
        await customer.applyCoupon(data.predefined.simpleProduct.product1.name, data.predefined.coupon.couponCode);
    });

    test('customer can buy product with coupon', { tag: ['@pro', '@customer'] }, async () => {
        await customer.buyProductWithCoupon(data.predefined.simpleProduct.product1.name, data.predefined.coupon.couponCode);
    });
});
