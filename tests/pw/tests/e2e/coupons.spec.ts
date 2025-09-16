import { test, expect } from '@playwright/test';
import { CouponsPage } from '../../pages/couponsPage';
import { data } from '@utils/testData';

test.describe('Coupons Tests', () => {
    let couponsPage: CouponsPage;
    const marketplaceCouponCode = 'Test_PW_Marketplace_Coupon_1';
    const marketplaceCouponDescription = 'Test Marketplace Coupon 1';
    const vendorCouponCode = 'test_pw_vendor_coupon_2';
    const vendorCouponDescription = 'Test PW Vendor Coupon 2';
    const productName = 'p1_v1'; // Assuming this product exists

    test.beforeEach(async ({ page }) => {
        couponsPage = new CouponsPage(page);
    });

    test.describe('Admin Coupon Management', () => {
        test.use({
            storageState: 'playwright/.auth/adminStorageState.json'
        });

        test('Admin Can Add Marketplace Coupon @lite', async () => {
            await couponsPage.navigateToAddNewCoupon();
            await couponsPage.createMarketplaceCoupon(marketplaceCouponCode, marketplaceCouponDescription);
            await couponsPage.verifyCouponCreated(marketplaceCouponCode);
        });

        test('Admin Can View Created Coupon @lite', async () => {
            await couponsPage.navigateToCouponsList();
            await couponsPage.searchCoupon('test_pw_marketplace_coupon_1');
            await couponsPage.selectCoupon('test_pw_marketplace_coupon_1');
        });
    });

    test.describe('Vendor Coupon Management', () => {
        test.use({
            storageState: 'playwright/.auth/vendorStorageState.json'
        });

        test('Vendor Can View Marketplace Coupons @lite', async () => {
            const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
            await couponsPage.navigateToVendorCoupons(baseUrl);
            await couponsPage.viewMarketplaceCoupons();
            await couponsPage.clickMarketplaceCoupon('test_pw_marketplace_coupon_1');
        });

        test('Vendor Can Add Coupon @lite', async () => {
            const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
            await couponsPage.navigateToVendorCoupons(baseUrl);
            await couponsPage.createVendorCoupon(vendorCouponCode, vendorCouponDescription);
        });
    });

    test.describe('Customer Coupon Usage', () => {
        test.use({
            storageState: 'playwright/.auth/customerStorageState.json'
        });

        test('Customer Can Buy Product with Marketplace Coupon @lite', async () => {
            const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
            
            // Step 1: Search and add product to cart
            await couponsPage.page.goto(`${baseUrl}/shop/`);
            await couponsPage.page.getByRole('textbox', { name: 'Search Products' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Search Products' }).fill('p1_v1');
            await couponsPage.page.locator('#main').getByRole('button', { name: 'Search' }).click();
            await couponsPage.page.getByRole('link', { name: 'Placeholder p1_v1 (simple) $' }).click();
            await couponsPage.page.getByRole('button', { name: 'Add to cart', exact: true }).click();
            
            // Step 2: Go to cart and apply coupon
            await couponsPage.page.goto(`${baseUrl}/cart/`);
            await couponsPage.page.getByRole('button', { name: 'Add coupons' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Enter code' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Enter code' }).fill('test_pw_marketplace_coupon_1');
            await couponsPage.page.getByRole('button', { name: 'Apply' }).click();
            
            // Step 3: Proceed to checkout and complete order
            await couponsPage.page.getByRole('link', { name: 'Proceed to Checkout' }).click();
            
            // Wait for checkout page to load
            await couponsPage.page.waitForLoadState('networkidle');
            
            
            
            // Place order
            await couponsPage.page.getByRole('button', { name: 'Place Order' }).click();
        });

        test('Customer Can Buy Product with Vendor Coupon @lite', async () => {
            const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
            
            // Step 1: Search and add product to cart
            await couponsPage.page.goto(`${baseUrl}/shop/`);
            await couponsPage.page.getByRole('textbox', { name: 'Search Products' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Search Products' }).fill('p1_v1');
            await couponsPage.page.locator('#main').getByRole('button', { name: 'Search' }).click();
            await couponsPage.page.getByRole('link', { name: 'Placeholder p1_v1 (simple) $' }).click();
            await couponsPage.page.getByRole('button', { name: 'Add to cart', exact: true }).click();
            
            // Step 2: Go to cart and apply coupon
            await couponsPage.page.goto(`${baseUrl}/cart/`);
            await couponsPage.page.getByRole('button', { name: 'Add coupons' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Enter code' }).click();
            await couponsPage.page.getByRole('textbox', { name: 'Enter code' }).fill('test_pw_vendor_coupon_2');
            await couponsPage.page.getByRole('button', { name: 'Apply' }).click();
            
            // Step 3: Proceed to checkout and complete order
            await couponsPage.page.getByRole('link', { name: 'Proceed to Checkout' }).click();
            
            // Wait for checkout page to load
            await couponsPage.page.waitForLoadState('networkidle');
            // Place order
            await couponsPage.page.getByRole('button', { name: 'Place Order' }).click();
        });
    });
});