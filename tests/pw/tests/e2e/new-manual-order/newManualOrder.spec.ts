import { test, expect, Page, BrowserContext } from '@utils/test';
import { NewManualOrderPage, newManualOrderData } from './newManualOrderPage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Manual Order
// creation flow. Surface: /dashboard/new/#/orders/new  (form, Pro).
//
// Gating (verified live): the React route `orders/new` is registered with
// `capabilities: ['dokan_manage_manual_order']`, and the "Add New Order" nav
// entry requires the same permission. Both are driven by the admin setting
// *Selling → Allow Vendors to Create Orders*
// (`dokan_selling['allow_vendor_create_manual_order']`): saving it 'on' grants
// `dokan_manage_manual_order` to the seller/administrator/shop_manager roles
// (via `dokan_after_saving_settings`). We toggle that state through wp-cli in
// the page object so the gate is deterministic in both directions.
//
// Ported titles from the legacy `manual-order` spec ("Admin Can Enable Vendor
// Order Creation…", "Vendor Can Create Manual Order", "Admin Can Disable…"),
// driving the React UI, plus the cross-role business flow.
// ============================================

test.describe('Manual Order (React) functionality', () => {
    // Enable the gate before the suite; disable after. Done once so the
    // functional vendor cases run against the reachable route.
    test.beforeAll(async () => {
        await NewManualOrderPage.enableVendorOrderCreation();
    });

    test.afterAll(async () => {
        await NewManualOrderPage.disableVendorOrderCreation();
    });

    test.describe('admin', () => {
        test('admin can enable vendor order creation, making the React route reachable (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Setting was enabled in beforeAll — assert the effect on the React
            // surface: vendor1 can reach the Add New Order form.
            await NewManualOrderPage.enableVendorOrderCreation();
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const mo = new NewManualOrderPage(page);
            await mo.goto();
            await mo.waitForFormReady();
            await expect(mo.heading, 'Add New Order form renders when enabled').toBeVisible();
            expect(await mo.isNotFound(), 'route is not the not-found page when enabled').toBe(false);
            await page.close();
            await ctx.close();
        });

        test('admin can disable vendor order creation, hiding the React route (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Disable, assert the route + nav entry are gated, then re-enable so
            // the remaining vendor cases in this suite still have the gate open.
            try {
                await NewManualOrderPage.disableVendorOrderCreation();
                const ctx = await browser.newContext({ storageState: v1 });
                const page = await ctx.newPage();
                const mo = new NewManualOrderPage(page);
                await mo.goto();
                expect(await mo.isNotFound(), 'route shows not-found when disabled').toBe(true);

                await mo.gotoOrdersList();
                await expect(mo.navAddNewOrder, '"Add New Order" nav entry hidden when disabled').toHaveCount(0);
                await page.close();
                await ctx.close();
            } finally {
                await NewManualOrderPage.enableVendorOrderCreation();
            }
        });
    });

    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let mo: NewManualOrderPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            mo = new NewManualOrderPage(page);
            await mo.goto();
            await mo.waitForFormReady();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the Add New Order form (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(mo.heading).toBeVisible();
            await expect(mo.statusControl).toBeVisible();
            expect(await mo.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the default order status as Pending payment (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            expect(await mo.getOrderStatus()).toMatch(/pending payment/i);
        });

        test('vendor sees all WooCommerce order statuses in the status dropdown (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const options = await mo.getOrderStatusOptions();
            for (const expected of ['Pending payment', 'Processing', 'On hold', 'Completed', 'Cancelled', 'Refunded', 'Failed']) {
                expect(options, `status option "${expected}" present`).toContain(expected);
            }
        });

        test('vendor can create a manual order by adding a product line (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await mo.addProductLine(newManualOrderData.product.search, newManualOrderData.product.name);
            expect(await mo.lineItemCount(newManualOrderData.product.name), 'product line is added to the order').toBeGreaterThan(0);
        });

        test('vendor can set the order status while creating a manual order (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await mo.addProductLine(newManualOrderData.product.search, newManualOrderData.product.name);
            await mo.setOrderStatus(newManualOrderData.status);
            await mo.save();
            expect(await mo.getOrderStatus()).toMatch(new RegExp(newManualOrderData.status, 'i'));
        });

        test('vendor can add an order note while creating a manual order (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await mo.addProductLine(newManualOrderData.product.search, newManualOrderData.product.name);
            await mo.addOrderNote(newManualOrderData.note);
            // The note text persists in the notes panel.
            await expect(page.locator(`text=/${newManualOrderData.note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`).first()).toBeVisible({ timeout: 10000 });
        });

        // Negative / edge: searching the product picker for a non-existent term
        // must yield no selectable option (no fake match).
        test('vendor product search returns no option for a non-existent product (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await mo.searchProductInModal('zzz-nonexistent-product-zzz');
            expect(await mo.productOptionCount(), 'no product option for a bogus search').toBe(0);
        });

        // Edge: the customer field is an async react-select sourced from
        // /dokan/v1/customers. In environments with no eligible customers it
        // returns an empty list; assert the field behaves (no crash) regardless.
        test('vendor customer field handles an empty search result without error (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const labels = await mo.searchCustomer('zzz-no-such-customer');
            expect(Array.isArray(labels)).toBe(true);
            expect(await mo.hasNoPhpFatal(), 'no PHP fatal after empty customer search').toBe(true);
        });
    });

    test.describe('business flow', () => {
        test('admin enables order creation, vendor creates and saves a manual order, then admin disables it (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // 1. Admin enables the setting (grants the manual-order capability).
            await NewManualOrderPage.enableVendorOrderCreation();

            // 2. Vendor reaches the React form, adds a product line, sets a
            //    status and saves — a real manual order is persisted.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const mo = new NewManualOrderPage(vPage);
            await mo.goto();
            await mo.waitForFormReady();
            await expect(mo.heading).toBeVisible();
            await mo.addProductLine(newManualOrderData.product.search, newManualOrderData.product.name);
            expect(await mo.lineItemCount(newManualOrderData.product.name), 'product line added').toBeGreaterThan(0);
            await mo.setOrderStatus(newManualOrderData.status);
            await mo.save();
            expect(await mo.getOrderStatus(), 'status saved').toMatch(new RegExp(newManualOrderData.status, 'i'));
            await vPage.close();
            await vCtx.close();

            // 3. Admin disables the setting again — vendor can no longer reach
            //    the form (route gated to not-found).
            await NewManualOrderPage.disableVendorOrderCreation();
            const v2Ctx = await browser.newContext({ storageState: v1 });
            const v2Page = await v2Ctx.newPage();
            const mo2 = new NewManualOrderPage(v2Page);
            await mo2.goto();
            expect(await mo2.isNotFound(), 'route gated after disable').toBe(true);
            await v2Page.close();
            await v2Ctx.close();

            // Restore the enabled state for any later use within the file.
            await NewManualOrderPage.enableVendorOrderCreation();
        });
    });
});
