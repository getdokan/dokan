import { Page, expect, test } from '@utils/test';
import {
    FollowStorePage,
    api,
    db,
    payloads,
    predefinedStores,
} from './followStorePage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { CUSTOMER_ID, VENDOR_ID, VENDOR2_ID } = process.env;

// This test suite covers the functionality of the Follow Store module in Dokan...
// It includes tests for both customer and vendor roles, as well as admin actions to enable/disable the module.
// The tests ensure that the follow/unfollow functionality works correctly across different pages and scenarios.
// The suite also verifies that the UI elements render properly and that the expected data is displayed.
test.describe('Follow stores modules functionality test', () => {
    let admin: FollowStorePage;
    let vendor: FollowStorePage;
    let customer: FollowStorePage;
    let aPage: Page, vPage: Page, cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new FollowStorePage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new FollowStorePage(vPage);

        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new FollowStorePage(cPage);

        await api.init();
    });

    test.afterAll(async () => {
        await api.activateModules(payloads.moduleIds.followStore, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await api.dispose();
        await db.dispose();
    });

    // admin
    test('admin can enable follow store module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Admin enables Follow Store module and verifies it appears in My Account menu', async () => {
            await admin.enableFollowStoreModule();
        });
    });

    // customer
    test('customer can view followed vendors via menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await test.step('Customer navigates to Following Stores page and verifies it loads correctly', async () => {
            await customer.customerFollowedVendorsRenderProperly();
        });
    });

    test('customer can follow store on store list page', { tag: ['@pro', '@customer'] }, async () => {
        await api.unfollowStore(VENDOR_ID || '', payloads.customerAuth);
        await test.step('Customer follows a vendor directly from the Store Listing page and sees updated status', async () => {
            await customer.followUnfollowStore(
                predefinedStores.vendor1,
                'Following',
                predefinedStores.followFromStoreListing
            );
        });
    });

    test('customer can follow store on single store', { tag: ['@pro', '@customer'] }, async () => {
        await api.unfollowStore(VENDOR2_ID || '', payloads.customerAuth);
        await test.step('Customer follows a vendor from the Single Store page and sees updated status', async () => {
            await customer.followUnfollowStore(
                predefinedStores.vendor2,
                'Following',
                predefinedStores.followFromSingleStore
            );
        });
    });

    test('customer can view followed vendors', { tag: ['@pro', '@customer'] }, async () => {
        await db.followVendor(CUSTOMER_ID || '', VENDOR_ID || '');
        await test.step('Customer verifies that a specific followed vendor is displayed on Following Stores page', async () => {
            await customer.customerViewFollowedVendors(predefinedStores.vendor1);
        });
    });

    test('customer can unfollow store on store list page', { tag: ['@pro', '@customer'] }, async () => {
        await api.followStore(VENDOR_ID || '', payloads.customerAuth);
        await test.step('Customer unfollows a vendor directly from the Store Listing page and sees updated status', async () => {
            await customer.followUnfollowStore(
                predefinedStores.vendor1,
                'Follow',
                predefinedStores.followFromStoreListing
            );
        });
    });

    test('customer can unfollow store on single store', { tag: ['@pro', '@customer'] }, async () => {
        await api.followStore(VENDOR2_ID || '', payloads.customerAuth);
        await test.step('Customer unfollows a vendor from the Single Store page and sees updated status', async () => {
            await customer.followUnfollowStore(
                predefinedStores.vendor2,
                'Follow',
                predefinedStores.followFromSingleStore
            );
        });
    });

    // vendor
    test('vendor can view followers menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await test.step('Vendor navigates to Followers page and verifies page elements render properly', async () => {
            await vendor.vendorFollowersRenderProperly();
        });
    });

    test('vendor can view followers', { tag: ['@pro', '@vendor'] }, async () => {
        await api.followStore(VENDOR_ID || '', payloads.customerAuth);
        await test.step('Vendor verifies that followers list is not empty', async () => {
            await vendor.vendorViewFollowers();
        });
    });

    // admin
    test('admin can disable follow store module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.followStore, payloads.adminAuth);
        await test.step('Admin disables Follow Store module and verifies it is removed from My Account menu', async () => {
            await admin.disableFollowStoreModule();
        });
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Follow Store Vendor (React) Tests @pro', () => {
    test('Test Case 1 - Vendor followers page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/followers/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Followers page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/followers/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

