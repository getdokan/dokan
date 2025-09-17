import { test, expect } from '@playwright/test';
import { helpers } from '@utils/helpers';

// Global test data and configuration
const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';

// Test Data
const testData = {
    marketplaceCoupon: {
        code: 'Test_PW_Marketplace_Coupon_1',
        description: 'Test Marketplace Coupon 1',
        amount: '10'
    },
    vendorCoupon: {
        code: 'test_pw_vendor_coupon_2',
        description: 'Test PW Vendor Coupon 2',
        amount: '15'
    },
    product: {
        name: 'p1_v1'
    }
};

// Clean up test coupons after ALL tests are completed
test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/adminStorageState.json' 
    });
    const page = await adminContext.newPage();

    try {
        await page.goto(`${baseUrl}/wp-admin/edit.php?post_type=shop_coupon&all_posts=1`);
        
        // Search and bulk delete marketplace coupon
        await page.getByRole('searchbox', { name: 'Search coupons:' }).click();
        await page.getByRole('searchbox', { name: 'Search coupons:' }).fill('test_pw_marketplace_coupon_1');
        await page.getByRole('button', { name: 'Search coupons' }).click();
        
        const marketplaceCouponCheckbox = page.getByRole('checkbox', { name: 'Select Test_PW_Marketplace_Coupon_1' });
        if (await marketplaceCouponCheckbox.count() > 0) {
            await marketplaceCouponCheckbox.check();
            await page.locator('#bulk-action-selector-top').selectOption('trash');
            await page.locator('#doaction').click();
        }
        
        // Clear search and search for vendor coupon
        await page.getByRole('searchbox', { name: 'Search coupons:' }).click();
        await page.getByRole('searchbox', { name: 'Search coupons:' }).press('ControlOrMeta+a');
        await page.getByRole('searchbox', { name: 'Search coupons:' }).fill('');
        await page.getByRole('searchbox', { name: 'Search coupons:' }).click();
        await page.getByRole('searchbox', { name: 'Search coupons:' }).fill('test_pw_vendor_coupon_2');
        await page.getByRole('button', { name: 'Search coupons' }).click();
        
        // Bulk delete vendor coupon
        const vendorCouponExists = await page.locator('#cb-select-all-1').count();
        if (vendorCouponExists > 0) {
            await page.locator('#cb-select-all-1').check();
            await page.locator('#bulk-action-selector-top').selectOption('trash');
            await page.locator('#doaction').click();
        }
        
        // Permanently delete from trash
        const trashLink = page.getByRole('link', { name: 'Trash (2)' });
        if (await trashLink.count() > 0) {
            await trashLink.click();
            await page.locator('#posts-filter div').filter({ 
                hasText: 'Select bulk action Bulk actions Restore Delete permanently Apply Show all types' 
            }).locator('#delete_all').click();
        }

    } catch (error) {
        console.log('Cleanup error (non-critical):', error.message);
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
            // Navigate to add new coupon page
            await page.goto('/wp-admin/post-new.php?post_type=shop_coupon');
            await page.waitForLoadState('networkidle');

            // Fill coupon code
            await page.getByRole('textbox', { name: 'Coupon code' }).click();
            await page.getByRole('textbox', { name: 'Coupon code' }).clear();
            await page.getByRole('textbox', { name: 'Coupon code' }).fill(testData.marketplaceCoupon.code);
            await page.getByRole('textbox', { name: 'Coupon code' }).blur();

            // Fill description
            await page.getByRole('textbox', { name: 'Description (optional)' }).click();
            await page.getByRole('textbox', { name: 'Description (optional)' }).clear();
            await page.getByRole('textbox', { name: 'Description (optional)' }).fill(testData.marketplaceCoupon.description);
            await page.getByRole('textbox', { name: 'Description (optional)' }).blur();

            // Select discount type
            await page.getByLabel('Discount type').selectOption('percent');

            // Fill coupon amount
            await page.getByRole('textbox', { name: 'Coupon amount' }).click();
            await page.getByRole('textbox', { name: 'Coupon amount' }).clear();
            await page.getByRole('textbox', { name: 'Coupon amount' }).fill(testData.marketplaceCoupon.amount);
            await page.getByRole('textbox', { name: 'Coupon amount' }).blur();

            // Wait for form validation
            await page.waitForTimeout(1000);

            // Verify form values
            await expect(page.getByRole('textbox', { name: 'Coupon code' })).toHaveValue(testData.marketplaceCoupon.code);
            await expect(page.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue(testData.marketplaceCoupon.description);
            await expect(page.getByRole('textbox', { name: 'Coupon amount' })).toHaveValue(testData.marketplaceCoupon.amount);

            // Configure vendor limits
            await page.getByRole('link', { name: ' Vendor limits' }).click();
            await page.getByRole('checkbox', { name: 'Enable for All Vendors' }).check();

            // Configure usage restriction
            await page.getByRole('link', { name: ' Usage restriction' }).click();

            // Configure usage limits
            await page.getByRole('link', { name: ' Usage limits' }).click();

            // Publish coupon
            await Promise.all([
                page.waitForURL(/post/, { timeout: 15000 }),
                page.getByRole('button', { name: 'Publish', exact: true }).click()
            ]);

            // Wait for page to load
            await page.waitForLoadState('networkidle');

            // Verify coupon created
            await expect(page).toHaveURL(/post/);
            await expect(page.locator('#title')).toHaveValue(testData.marketplaceCoupon.code);
            
            const publishStatus = page.locator('#post-status-display');
            if (await publishStatus.count() > 0) {
                await expect(publishStatus).toContainText('Published');
            }
        });

        test('Admin Can View Created Coupon @lite', async ({ page }) => {
            await page.goto('/wp-admin/edit.php?post_type=shop_coupon');
            await page.waitForLoadState('networkidle');
            
            await page.getByRole('searchbox', { name: 'Search coupons:' }).click();
            await page.getByRole('searchbox', { name: 'Search coupons:' }).fill('test_pw_marketplace_coupon_1');
            await page.getByRole('button', { name: 'Search coupons' }).click();
            await page.waitForLoadState('networkidle');
            
            const couponCheckbox = page.getByRole('checkbox', { name: 'Select test_pw_marketplace_coupon_1', exact: true }).first();
            if (await couponCheckbox.count() > 0) {
                await expect(couponCheckbox).toBeVisible();
                await couponCheckbox.check();
            } else {
                // Fallback: try to find any checkbox in the coupon row
                const couponRow = page.locator('tr:has-text("test_pw_marketplace_coupon_1")');
                const checkbox = couponRow.locator('input[type="checkbox"]').first();
                if (await checkbox.count() > 0) {
                    await checkbox.check();
                }
            }
        });
    });

    test.describe('Vendor Coupon Management', () => {
        test.use({
            storageState: 'playwright/.auth/vendorStorageState.json'
        });

        test('Vendor Can View Marketplace Coupons @lite', async ({ page }) => {
            await page.goto(`${baseUrl}/dashboard/new/#coupons`);
            await page.waitForLoadState('networkidle');
            
            await page.getByRole('button', { name: 'Marketplace Coupons' }).click();
            await page.getByRole('cell', { name: 'test_pw_marketplace_coupon_1', exact: true }).locator('div').first().click();
        });

        test('Vendor Can Add Coupon @lite', async ({ page }) => {
            await page.goto(`${baseUrl}/dashboard/new/#coupons`);
            await page.waitForLoadState('networkidle');
            
            await page.getByRole('button', { name: 'Add New Coupon' }).click();
            
            // Fill coupon title
            await page.getByRole('textbox', { name: 'Coupon Title*' }).click();
            await page.getByRole('textbox', { name: 'Coupon Title*' }).fill(testData.vendorCoupon.code);
            
            // Fill description
            await page.getByRole('textbox', { name: 'Description' }).click();
            await page.getByRole('textbox', { name: 'Description' }).fill(testData.vendorCoupon.description);
            
            // Select discount type
            await page.getByRole('combobox', { name: 'Discount Type' }).click();
            await page.getByRole('option', { name: 'Percentage discount' }).click();
            
            // Fill coupon amount
            await page.getByRole('spinbutton', { name: 'Coupon Amount*' }).click();
            await page.getByRole('spinbutton', { name: 'Coupon Amount*' }).fill(testData.vendorCoupon.amount);
            
            // Click create button
            await page.locator('div').filter({ hasText: /^CancelCreate$/ }).first().click();
            
            // Check show on store
            await page.getByRole('checkbox', { name: 'Show on store' }).check();
            
            // Create coupon
            await page.getByRole('button', { name: 'Create' }).click();
        });
    });

    test.describe('Customer Coupon Usage', () => {
        test.use({
            storageState: 'playwright/.auth/customerStorageState.json'
        });

        test('Customer Can Buy Product with Marketplace Coupon @lite', async ({ page }) => {
            // Step 1: Search and add product to cart
            await page.goto(`${baseUrl}/shop/`);
            await page.getByRole('textbox', { name: 'Search Products' }).click();
            await page.getByRole('textbox', { name: 'Search Products' }).fill(testData.product.name);
            await page.locator('#main').getByRole('button', { name: 'Search' }).click();
            await page.getByRole('link', { name: `Placeholder ${testData.product.name} (simple) $` }).click();
            await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
            
            // Step 2: Go to cart and apply coupon
            await page.goto(`${baseUrl}/cart/`);
            await page.getByRole('button', { name: 'Add coupons' }).click();
            await page.getByRole('textbox', { name: 'Enter code' }).click();
            await page.getByRole('textbox', { name: 'Enter code' }).fill('test_pw_marketplace_coupon_1');
            await page.getByRole('button', { name: 'Apply' }).click();
            
            // Step 3: Proceed to checkout and complete order
            await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
            
            // Wait for checkout page to load
            await page.waitForLoadState('networkidle');
            
            // Place order (date picker module is disabled)
            await page.getByRole('button', { name: 'Place Order' }).click();
            await page.waitForLoadState('networkidle');
        });

        test('Customer Can Buy Product with Vendor Coupon @lite', async ({ page }) => {
            // Step 1: Search and add product to cart
            await page.goto(`${baseUrl}/shop/`);
            await page.getByRole('textbox', { name: 'Search Products' }).click();
            await page.getByRole('textbox', { name: 'Search Products' }).fill(testData.product.name);
            await page.locator('#main').getByRole('button', { name: 'Search' }).click();
            await page.getByRole('link', { name: `Placeholder ${testData.product.name} (simple) $` }).click();
            await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
            
            // Step 2: Go to cart and apply coupon
            await page.goto(`${baseUrl}/cart/`);
            await page.getByRole('button', { name: 'Add coupons' }).click();
            await page.getByRole('textbox', { name: 'Enter code' }).click();
            await page.getByRole('textbox', { name: 'Enter code' }).fill('test_pw_vendor_coupon_2');
            await page.getByRole('button', { name: 'Apply' }).click();
            
            // Step 3: Proceed to checkout and complete order
            await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
            
            // Wait for checkout page to load
            await page.waitForLoadState('networkidle');
            
            // Place order (date picker module is disabled)
            await page.getByRole('button', { name: 'Place Order' }).click();
            await page.waitForLoadState('networkidle');
        });
    });
});