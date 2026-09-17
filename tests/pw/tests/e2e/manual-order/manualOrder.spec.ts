import { test, expect } from '@utils/test';
import { ManualOrderPage } from './manualOrderPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.beforeAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: a1 });
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

test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: a1 });
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

// RETIRED 2026-08-14. `manualOrderPage.ts` is an all-stub page object: every
// method is an empty no-op and `isAddNewOrderButtonVisible()` returns a hard
// `false`. So the two admin cases asserted NOTHING and still reported green,
// and the vendor case always took its `else` branch to a bare "Orders" text
// check. Superseded in full by `manual-order/newManualOrder.spec.ts`, which
// drives the React `#/orders/new` route and covers the same three behaviours
// for real: "admin can enable vendor order creation, making the React route
// reachable", "admin can disable vendor order creation, hiding the React
// route", and "vendor can create a manual order by adding a product line"
// (+8 more). Do not un-skip without writing a real page object.

test.describe.skip('Manual Order Tests', () => {
    test.describe('Admin Configuration', () => {
        test.use({ storageState: a1 });

        test('Admin Can Enable Vendor Order Creation in Global Settings @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            await manualOrderPage.enableVendorOrderCreation();
            await manualOrderPage.verifyVendorOrderSettingEnabled();
        });
    });

    test.describe('Vendor Manual Order Creation', () => {
        test.use({ storageState: v1 });

        test('Vendor Can Create Manual Order @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            await manualOrderPage.navigateToOrders();
            const canCreateOrders = await manualOrderPage.isAddNewOrderButtonVisible();
            console.log('Can create manual orders:', canCreateOrders);

            if (canCreateOrders) {
                await manualOrderPage.clickAddNewOrder();
                await manualOrderPage.addProductToOrder(manualOrderPage.testData.product.name);
                const customerName = process.env.CUSTOMER || manualOrderPage.testData.customer.name;
                await manualOrderPage.selectCustomer(customerName);
                await manualOrderPage.setOrderStatus('completed');
                await manualOrderPage.addFeeToOrder(
                    manualOrderPage.testData.fee.name,
                    manualOrderPage.testData.fee.amount
                );
            } else {
                // The ManualOrderPage methods are stubs; fall through to a non-strict
                // assertion that the vendor dashboard rendered (any "Orders" heading).
                await expect(page.locator('text=Orders').first()).toBeVisible();
            }
        });
    });

    test.describe('Admin Configuration Cleanup', () => {
        test.use({ storageState: a1 });

        test('Admin Can Disable Vendor Order Creation in Global Settings @pro', async ({ page }) => {
            const manualOrderPage = new ManualOrderPage(page);
            await manualOrderPage.disableVendorOrderCreation();
            await manualOrderPage.verifyVendorOrderSettingDisabled();
        });
    });
});
