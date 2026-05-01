import { test, expect } from '@playwright/test';
import { newCouponsPage } from './newCouponsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const BASE = process.env.BASE_URL || 'http://localhost:9999';

test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: a1 });
    const page = await adminContext.newPage();
    const couponsPage = new newCouponsPage(page);
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
        test.use({ storageState: a1 });

        test('Admin Can Add Marketplace Coupon @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.createMarketplaceCoupon();
            await p.verifyMarketplaceCouponFormValues();
            await p.verifyMarketplaceCouponCreated();
        });

        test('Admin Can View Created Coupon @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.searchAndViewCoupon('test_pw_marketplace_coupon_1');
        });
    });

    test.describe('Vendor Coupon Management', () => {
        test.use({ storageState: v1 });

        test.skip('Vendor Can View Marketplace Coupons @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.viewMarketplaceCoupons();
        });

        test.skip('Vendor Can Add Coupon @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.createVendorCoupon();
        });
    });

    test.describe('Customer Coupon Usage', () => {
        test.use({ storageState: c1 });

        test.skip('Customer Can Buy Product with Marketplace Coupon @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.buyProductWithCoupon(p.testData.product.name, 'test_pw_marketplace_coupon_1');
        });

        test.skip('Customer Can Buy Product with Vendor Coupon @lite', async ({ page }) => {
            const p = new newCouponsPage(page);
            await p.buyProductWithCoupon(p.testData.product.name, 'test_pw_vendor_coupon_2');
        });
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Coupons (React) Tests @pro', () => {
    test('Test Case 1 - Vendor coupons page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/coupons/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Coupons page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/coupons/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

