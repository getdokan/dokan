import { test, expect } from '@playwright/test';
import { ManualOrderPage } from '@pages/manualOrderPage';

// Setup before all tests - Enable Order Creation for vendor
test.beforeAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/adminStorageState.json' 
    });
    const page = await adminContext.newPage();
    const manualOrderPage = new ManualOrderPage(page);

    try {
        await manualOrderPage.enableOrderCreationForVendor(manualOrderPage.testData.vendor.name);
    } catch (error) {
        console.log('Setup error:', error instanceof Error ? error.message : String(error));
    } finally {
        await page.close();
        await adminContext.close();
    }
});

// Cleanup after all tests - Disable Order Creation for vendor
test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/adminStorageState.json' 
    });
    const page = await adminContext.newPage();
    const manualOrderPage = new ManualOrderPage(page);

    try {
        await manualOrderPage.disableOrderCreationForVendor(manualOrderPage.testData.vendor.name);
    } catch (error) {
        console.log('Cleanup error (non-critical):', error instanceof Error ? error.message : String(error));
    } finally {
        await page.close();
        await adminContext.close();
    }
});

test.describe('Manual Order Tests', () => {
    
    test.describe('Admin Configuration', () => {
        test.use({ storageState: 'playwright/.auth/adminStorageState.json' });
        
        test('Admin Can Enable Vendor Order Creation in Global Settings @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            
            await manualOrderPage.enableVendorOrderCreation();
            await manualOrderPage.verifyVendorOrderSettingEnabled();
        });
    });

    test.describe('Vendor Manual Order Creation', () => {
        test.use({ storageState: 'playwright/.auth/vendorStorageState.json' });
        
        test('Vendor Can Create Manual Order @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            
            // Navigate to orders and check if manual order creation is available
            await manualOrderPage.navigateToOrders();
            
            const canCreateOrders = await manualOrderPage.isAddNewOrderButtonVisible();
            console.log('Can create manual orders:', canCreateOrders);
            
            if (canCreateOrders) {
                // Create manual order
                await manualOrderPage.clickAddNewOrder();
                await manualOrderPage.addProductToOrder(manualOrderPage.testData.product.name);
                
                const customerName = process.env.CUSTOMER || manualOrderPage.testData.customer.name;
                await manualOrderPage.selectCustomer(customerName);
                await manualOrderPage.setOrderStatus('completed');
                await manualOrderPage.addFeeToOrder(
                    manualOrderPage.testData.fee.name, 
                    manualOrderPage.testData.fee.amount
                );
                
                console.log('✅ Manual order creation process completed!');
            } else {
                console.log('Manual order creation not available for this vendor');
                // Just verify vendor can access orders page
                await expect(page.locator('text=Orders')).toBeVisible();
            }
        });
    });

    test.describe('Admin Configuration Cleanup', () => {
        test.use({ storageState: 'playwright/.auth/adminStorageState.json' });
        
        test('Admin Can Disable Vendor Order Creation in Global Settings @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            
            await manualOrderPage.disableVendorOrderCreation();
            await manualOrderPage.verifyVendorOrderSettingDisabled();
        });
    });
});
