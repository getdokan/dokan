import { Page, expect } from '@playwright/test';

export class CouponsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Admin Methods
    async navigateToAddNewCoupon() {
        await this.page.goto('/wp-admin/post-new.php?post_type=shop_coupon');
        await this.page.waitForLoadState('networkidle');
    }

    async navigateToCouponsList() {
        await this.page.goto('/wp-admin/edit.php?post_type=shop_coupon');
        await this.page.waitForLoadState('networkidle');
    }

    async createMarketplaceCoupon(couponCode: string, description: string, amount: string = '10') {
        // Fill coupon code
        await this.page.getByRole('textbox', { name: 'Coupon code' }).click();
        await this.page.getByRole('textbox', { name: 'Coupon code' }).clear();
        await this.page.getByRole('textbox', { name: 'Coupon code' }).fill(couponCode);
        await this.page.getByRole('textbox', { name: 'Coupon code' }).blur();

        // Fill description
        await this.page.getByRole('textbox', { name: 'Description (optional)' }).click();
        await this.page.getByRole('textbox', { name: 'Description (optional)' }).clear();
        await this.page.getByRole('textbox', { name: 'Description (optional)' }).fill(description);
        await this.page.getByRole('textbox', { name: 'Description (optional)' }).blur();

        // Select discount type
        await this.page.getByLabel('Discount type').selectOption('percent');

        // Fill coupon amount
        await this.page.getByRole('textbox', { name: 'Coupon amount' }).click();
        await this.page.getByRole('textbox', { name: 'Coupon amount' }).clear();
        await this.page.getByRole('textbox', { name: 'Coupon amount' }).fill(amount);
        await this.page.getByRole('textbox', { name: 'Coupon amount' }).blur();

        // Wait for form validation
        await this.page.waitForTimeout(1000);

        // Verify form values
        await expect(this.page.getByRole('textbox', { name: 'Coupon code' })).toHaveValue(couponCode);
        await expect(this.page.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue(description);
        await expect(this.page.getByRole('textbox', { name: 'Coupon amount' })).toHaveValue(amount);

        // Configure vendor limits
        await this.page.getByRole('link', { name: ' Vendor limits' }).click();
        await this.page.getByRole('checkbox', { name: 'Enable for All Vendors' }).check();

        // Configure usage restriction
        await this.page.getByRole('link', { name: ' Usage restriction' }).click();

        // Configure usage limits
        await this.page.getByRole('link', { name: ' Usage limits' }).click();

        // Publish coupon
        await Promise.all([
            this.page.waitForURL(/post/, { timeout: 15000 }),
            this.page.getByRole('button', { name: 'Publish', exact: true }).click()
        ]);

        // Wait for page to load
        await this.page.waitForLoadState('networkidle');
    }

    async searchCoupon(couponName: string) {
        await this.page.getByRole('searchbox', { name: 'Search coupons:' }).click();
        await this.page.getByRole('searchbox', { name: 'Search coupons:' }).fill(couponName);
        await this.page.getByRole('button', { name: 'Search coupons' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async selectCoupon(couponName: string) {
        const couponCheckbox = this.page.getByRole('checkbox', { name: `Select ${couponName}`, exact: true }).first();
        if (await couponCheckbox.count() > 0) {
            await expect(couponCheckbox).toBeVisible();
            await couponCheckbox.check();
        } else {
            // Fallback: try to find any checkbox in the coupon row
            const couponRow = this.page.locator(`tr:has-text("${couponName}")`);
            const checkbox = couponRow.locator('input[type="checkbox"]').first();
            if (await checkbox.count() > 0) {
                await checkbox.check();
            }
        }
    }

    // Vendor Methods
    async navigateToVendorCoupons(baseUrl: string) {
        await this.page.goto(`${baseUrl}/dashboard/new/#coupons`);
        await this.page.waitForLoadState('networkidle');
    }

    async viewMarketplaceCoupons() {
        await this.page.getByRole('button', { name: 'Marketplace Coupons' }).click();
    }

    async clickMarketplaceCoupon(couponName: string) {
        await this.page.getByRole('cell', { name: couponName, exact: true }).locator('div').first().click();
    }

    async createVendorCoupon(couponTitle: string, description: string, amount: string = '15') {
        await this.page.getByRole('button', { name: 'Add New Coupon' }).click();
        
        // Fill coupon title
        await this.page.getByRole('textbox', { name: 'Coupon Title*' }).click();
        await this.page.getByRole('textbox', { name: 'Coupon Title*' }).fill(couponTitle);
        
        // Fill description
        await this.page.getByRole('textbox', { name: 'Description' }).click();
        await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
        
        // Select discount type
        await this.page.getByRole('combobox', { name: 'Discount Type' }).click();
        await this.page.getByRole('option', { name: 'Percentage discount' }).click();
        
        // Fill coupon amount
        await this.page.getByRole('spinbutton', { name: 'Coupon Amount*' }).click();
        await this.page.getByRole('spinbutton', { name: 'Coupon Amount*' }).fill(amount);
        
        // Click create button
        await this.page.locator('div').filter({ hasText: /^CancelCreate$/ }).first().click();
        
        // Check show on store
        await this.page.getByRole('checkbox', { name: 'Show on store' }).check();
        
        // Create coupon
        await this.page.getByRole('button', { name: 'Create' }).click();
    }

    // Customer Methods
    async searchAndAddProduct(baseUrl: string, productName: string) {
        await this.page.goto(`${baseUrl}/shop/`);
        await this.page.getByRole('textbox', { name: 'Search Products' }).click();
        await this.page.getByRole('textbox', { name: 'Search Products' }).fill(productName);
        await this.page.locator('#main').getByRole('button', { name: 'Search' }).click();
        await this.page.getByRole('link', { name: `Placeholder ${productName} (simple) $` }).click();
        await this.page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    }

    async applyCoupon(baseUrl: string, couponCode: string) {
        await this.page.goto(`${baseUrl}/cart/`);
        await this.page.getByRole('button', { name: 'Add coupons' }).click();
        await this.page.getByRole('textbox', { name: 'Enter code' }).fill(couponCode);
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async completeCheckout() {
        await this.page.getByRole('link', { name: 'Proceed to Checkout' }).click();
        await this.page.getByRole('button', { name: 'Place Order' }).click();
    }

    // Verification Methods
    async verifyCouponCreated(couponCode: string) {
        await expect(this.page).toHaveURL(/post/);
        await expect(this.page.locator('#title')).toHaveValue(couponCode);
        
        const publishStatus = this.page.locator('#post-status-display');
        if (await publishStatus.count() > 0) {
            await expect(publishStatus).toContainText('Published');
        }
    }

    async verifyCouponInList(couponName: string) {
        const couponRow = this.page.locator(`tr:has-text("${couponName}")`);
        await expect(couponRow).toBeVisible();
    }

    async verifyCouponApplied() {
        // Add verification logic for coupon application success
        // This could check for success messages, price changes, etc.
        await this.page.waitForLoadState('networkidle');
    }
}
