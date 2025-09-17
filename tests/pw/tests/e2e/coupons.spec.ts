import { test } from '@playwright/test';
import { CouponsPage } from '@pages/couponsPage';

// Clean up test coupons after ALL tests are completed
test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/adminStorageState.json' 
    });
    const page = await adminContext.newPage();
    const couponsPage = new CouponsPage(page);

    try {
        await couponsPage.cleanupTestCoupons();
    } catch (error) {
        console.log('Cleanup error (non-critical):', error instanceof Error ? error.message : String(error));
    } finally {
        await page.close();
        await adminContext.close();
    }
});

test.describe('Coupons Tests', () => {

    test.describe('Admin Coupon Management', () => {
        test.use({
            storageState: 'playwright/.auth/adminStorageState.json'
        });

        test('Admin Can Add Marketplace Coupon @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.createMarketplaceCoupon();
            await couponsPage.verifyMarketplaceCouponFormValues();
            await couponsPage.verifyMarketplaceCouponCreated();
        });

        test('Admin Can View Created Coupon @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.searchAndViewCoupon('test_pw_marketplace_coupon_1');
        });
    });

    test.describe('Vendor Coupon Management', () => {
        test.use({
            storageState: 'playwright/.auth/vendorStorageState.json'
        });

        test('Vendor Can View Marketplace Coupons @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.viewMarketplaceCoupons();
        });

        test('Vendor Can Add Coupon @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.createVendorCoupon();
        });
    });

    test.describe('Customer Coupon Usage', () => {
        test.use({
            storageState: 'playwright/.auth/customerStorageState.json'
        });

        test('Customer Can Buy Product with Marketplace Coupon @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.buyProductWithCoupon(couponsPage.testData.product.name, 'test_pw_marketplace_coupon_1');
        });

        test('Customer Can Buy Product with Vendor Coupon @lite', async ({ page }) => {
            const couponsPage = new CouponsPage(page);
            
            await couponsPage.buyProductWithCoupon(couponsPage.testData.product.name, 'test_pw_vendor_coupon_2');
        });
    });
});