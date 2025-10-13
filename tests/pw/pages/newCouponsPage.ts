import { Page, Locator, expect } from '@playwright/test';

export class newCouponsPage {
    readonly page: Page;
    
    // Test Data
    readonly testData = {
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

    // Admin Coupon Creation Locators
    readonly couponCodeInput: Locator;
    readonly couponDescriptionInput: Locator;
    readonly discountTypeSelect: Locator;
    readonly couponAmountInput: Locator;
    readonly vendorLimitsTab: Locator;
    readonly enableAllVendorsCheckbox: Locator;
    readonly usageRestrictionTab: Locator;
    readonly usageLimitsTab: Locator;
    readonly publishButton: Locator;
    readonly titleField: Locator;
    readonly postStatusDisplay: Locator;

    // Admin Coupon Management Locators
    readonly searchCouponsInput: Locator;
    readonly searchCouponsButton: Locator;
    readonly bulkActionSelector: Locator;
    readonly bulkActionApply: Locator;
    readonly selectAllCheckbox: Locator;
    readonly trashLink: Locator;

    // Vendor Dashboard Locators
    readonly marketplaceCouponsButton: Locator;
    readonly addNewCouponButton: Locator;
    readonly vendorCouponTitleInput: Locator;
    readonly vendorCouponDescriptionInput: Locator;
    readonly vendorDiscountTypeCombobox: Locator;
    readonly percentageDiscountOption: Locator;
    readonly vendorCouponAmountInput: Locator;
    readonly showOnStoreCheckbox: Locator;
    readonly createCouponButton: Locator;

    // Customer Shop Locators
    readonly searchProductsInput: Locator;
    readonly searchButton: Locator;
    readonly addToCartButton: Locator;
    readonly addCouponsButton: Locator;
    readonly enterCouponCodeInput: Locator;
    readonly applyCouponButton: Locator;
    readonly proceedToCheckoutLink: Locator;
    readonly placeOrderButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Admin Coupon Creation Locators
        this.couponCodeInput = page.getByRole('textbox', { name: 'Coupon code' });
        this.couponDescriptionInput = page.getByRole('textbox', { name: 'Description (optional)' });
        this.discountTypeSelect = page.getByLabel('Discount type');
        this.couponAmountInput = page.getByRole('textbox', { name: 'Coupon amount' });
        this.vendorLimitsTab = page.getByRole('link', { name: ' Vendor limits' });
        this.enableAllVendorsCheckbox = page.getByRole('checkbox', { name: 'Enable for All Vendors' });
        this.usageRestrictionTab = page.getByRole('link', { name: ' Usage restriction' });
        this.usageLimitsTab = page.getByRole('link', { name: ' Usage limits' });
        this.publishButton = page.getByRole('button', { name: 'Publish', exact: true });
        this.titleField = page.locator('#title');
        this.postStatusDisplay = page.locator('#post-status-display');

        // Admin Coupon Management Locators
        this.searchCouponsInput = page.getByRole('searchbox', { name: 'Search coupons:' });
        this.searchCouponsButton = page.getByRole('button', { name: 'Search coupons' });
        this.bulkActionSelector = page.locator('#bulk-action-selector-top');
        this.bulkActionApply = page.locator('#doaction');
        this.selectAllCheckbox = page.locator('#cb-select-all-1');
        this.trashLink = page.getByRole('link', { name: 'Trash (2)' });

        // Vendor Dashboard Locators
        this.marketplaceCouponsButton = page.getByRole('button', { name: 'Marketplace Coupons' });
        this.addNewCouponButton = page.getByRole('button', { name: 'Add New Coupon' });
        this.vendorCouponTitleInput = page.getByRole('textbox', { name: 'Coupon Title*' });
        this.vendorCouponDescriptionInput = page.getByRole('textbox', { name: 'Description' });
        this.vendorDiscountTypeCombobox = page.getByRole('combobox', { name: 'Discount Type' });
        this.percentageDiscountOption = page.getByRole('option', { name: 'Percentage discount' });
        this.vendorCouponAmountInput = page.getByRole('spinbutton', { name: 'Coupon Amount*' });
        this.showOnStoreCheckbox = page.getByRole('checkbox', { name: 'Show on store' });
        this.createCouponButton = page.getByRole('button', { name: 'Create' });

        // Customer Shop Locators
        this.searchProductsInput = page.getByRole('textbox', { name: 'Search Products' });
        this.searchButton = page.locator('#main').getByRole('button', { name: 'Search' });
        this.addToCartButton = page.getByRole('button', { name: 'Add to cart', exact: true });
        this.addCouponsButton = page.getByRole('button', { name: 'Add coupons' });
        this.enterCouponCodeInput = page.getByRole('textbox', { name: 'Enter code' });
        this.applyCouponButton = page.getByRole('button', { name: 'Apply' });
        this.proceedToCheckoutLink = page.getByRole('link', { name: 'Proceed to Checkout' });
        this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    }

    // Navigation Methods
    async goToAddNewCouponPage() {
        await this.page.goto('/wp-admin/post-new.php?post_type=shop_coupon');
        await this.page.waitForLoadState('networkidle');
    }

    async goToCouponsListPage() {
        await this.page.goto('/wp-admin/edit.php?post_type=shop_coupon');
        await this.page.waitForLoadState('networkidle');
    }

    async goToCouponsListPageWithAllPosts() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/wp-admin/edit.php?post_type=shop_coupon&all_posts=1`);
    }

    async goToVendorCouponsPage() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/dashboard/new/#coupons`);
        await this.page.waitForLoadState('networkidle');
    }

    async goToShopPage() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/shop/`);
    }

    async goToCartPage() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/cart/`);
    }

    // Admin Coupon Creation Methods
    async createMarketplaceCoupon() {
        await this.goToAddNewCouponPage();

        // Fill coupon code
        await this.couponCodeInput.click();
        await this.couponCodeInput.clear();
        await this.couponCodeInput.fill(this.testData.marketplaceCoupon.code);
        await this.couponCodeInput.blur();

        // Fill description
        await this.couponDescriptionInput.click();
        await this.couponDescriptionInput.clear();
        await this.couponDescriptionInput.fill(this.testData.marketplaceCoupon.description);
        await this.couponDescriptionInput.blur();

        // Select discount type
        await this.discountTypeSelect.selectOption('percent');

        // Fill coupon amount
        await this.couponAmountInput.click();
        await this.couponAmountInput.clear();
        await this.couponAmountInput.fill(this.testData.marketplaceCoupon.amount);
        await this.couponAmountInput.blur();

        // Wait for form validation
        await this.page.waitForTimeout(1000);

        // Configure vendor limits
        await this.vendorLimitsTab.click();
        await this.enableAllVendorsCheckbox.check();

        // Configure usage restriction
        await this.usageRestrictionTab.click();

        // Configure usage limits
        await this.usageLimitsTab.click();

        // Publish coupon
        await Promise.all([
            this.page.waitForURL(/post/, { timeout: 15000 }),
            this.publishButton.click()
        ]);

        // Wait for page to load
        await this.page.waitForLoadState('networkidle');
    }

    async verifyMarketplaceCouponCreated() {
        await expect(this.page).toHaveURL(/post/);
        await expect(this.titleField).toHaveValue(this.testData.marketplaceCoupon.code);
        
        if (await this.postStatusDisplay.count() > 0) {
            await expect(this.postStatusDisplay).toContainText('Published');
        }
    }

    async verifyMarketplaceCouponFormValues() {
        await expect(this.couponCodeInput).toHaveValue(this.testData.marketplaceCoupon.code);
        await expect(this.couponDescriptionInput).toHaveValue(this.testData.marketplaceCoupon.description);
        await expect(this.couponAmountInput).toHaveValue(this.testData.marketplaceCoupon.amount);
    }

    // Admin Coupon Management Methods
    async searchAndViewCoupon(couponCode: string) {
        await this.goToCouponsListPage();
        
        await this.searchCouponsInput.click();
        await this.searchCouponsInput.fill(couponCode.toLowerCase());
        await this.searchCouponsButton.click();
        await this.page.waitForLoadState('networkidle');
        
        const couponCheckbox = this.page.getByRole('checkbox', { name: `Select ${couponCode.toLowerCase()}`, exact: true }).first();
        if (await couponCheckbox.count() > 0) {
            await expect(couponCheckbox).toBeVisible();
            await couponCheckbox.check();
        } else {
            // Fallback: try to find any checkbox in the coupon row
            const couponRow = this.page.locator(`tr:has-text("${couponCode.toLowerCase()}")`);
            const checkbox = couponRow.locator('input[type="checkbox"]').first();
            if (await checkbox.count() > 0) {
                await checkbox.check();
            }
        }
    }

    async cleanupTestCoupons() {
        await this.goToCouponsListPageWithAllPosts();
        
        // Search and bulk delete marketplace coupon
        await this.searchCouponsInput.click();
        await this.searchCouponsInput.fill('test_pw_marketplace_coupon_1');
        await this.searchCouponsButton.click();
        
        const marketplaceCouponCheckbox = this.page.getByRole('checkbox', { name: 'Select Test_PW_Marketplace_Coupon_1' });
        if (await marketplaceCouponCheckbox.count() > 0) {
            await marketplaceCouponCheckbox.check();
            await this.bulkActionSelector.selectOption('trash');
            await this.bulkActionApply.click();
        }
        
        // Clear search and search for vendor coupon
        await this.searchCouponsInput.click();
        await this.searchCouponsInput.press('ControlOrMeta+a');
        await this.searchCouponsInput.fill('');
        await this.searchCouponsInput.click();
        await this.searchCouponsInput.fill('test_pw_vendor_coupon_2');
        await this.searchCouponsButton.click();
        
        // Bulk delete vendor coupon
        const vendorCouponExists = await this.selectAllCheckbox.count();
        if (vendorCouponExists > 0) {
            await this.selectAllCheckbox.check();
            await this.bulkActionSelector.selectOption('trash');
            await this.bulkActionApply.click();
        }
        
        // Permanently delete from trash
        if (await this.trashLink.count() > 0) {
            await this.trashLink.click();
            await this.page.locator('#posts-filter div').filter({ 
                hasText: 'Select bulk action Bulk actions Restore Delete permanently Apply Show all types' 
            }).locator('#delete_all').click();
        }
    }

    // Vendor Coupon Management Methods
    async viewMarketplaceCoupons() {
        await this.goToVendorCouponsPage();
        await this.marketplaceCouponsButton.click();
        await this.page.getByRole('cell', { name: 'test_pw_marketplace_coupon_1', exact: true }).locator('div').first().click();
    }

    async createVendorCoupon() {
        await this.goToVendorCouponsPage();
        await this.addNewCouponButton.click();
        
        // Fill coupon title
        await this.vendorCouponTitleInput.click();
        await this.vendorCouponTitleInput.fill(this.testData.vendorCoupon.code);
        
        // Fill description
        await this.vendorCouponDescriptionInput.click();
        await this.vendorCouponDescriptionInput.fill(this.testData.vendorCoupon.description);
        
        // Select discount type
        await this.vendorDiscountTypeCombobox.click();
        await this.percentageDiscountOption.click();
        
        // Fill coupon amount
        await this.vendorCouponAmountInput.click();
        await this.vendorCouponAmountInput.fill(this.testData.vendorCoupon.amount);
        
        // Click create button
        await this.page.locator('div').filter({ hasText: /^CancelCreate$/ }).first().click();
        
        // Check show on store
        await this.showOnStoreCheckbox.check();
        
        // Create coupon
        await this.createCouponButton.click();
    }

    // Customer Shopping Methods
    async searchAndAddProductToCart(productName: string) {
        await this.goToShopPage();
        await this.searchProductsInput.click();
        await this.searchProductsInput.fill(productName);
        await this.searchButton.click();
        await this.page.getByRole('link', { name: `Placeholder ${productName} (simple) $` }).click();
        await this.addToCartButton.click();
    }

    async applyCouponInCart(couponCode: string) {
        await this.goToCartPage();
        await this.addCouponsButton.click();
        await this.enterCouponCodeInput.click();
        await this.enterCouponCodeInput.fill(couponCode);
        await this.applyCouponButton.click();
    }

    async proceedToCheckoutAndPlaceOrder() {
        await this.proceedToCheckoutLink.click();
        
        // Wait for checkout page to load
        await this.page.waitForLoadState('networkidle');
        
        // Place order (date picker module is disabled)
        await this.placeOrderButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async buyProductWithCoupon(productName: string, couponCode: string) {
        await this.searchAndAddProductToCart(productName);
        await this.applyCouponInCart(couponCode);
        await this.proceedToCheckoutAndPlaceOrder();
    }
}
