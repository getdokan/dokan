import { Page, expect, test } from '@utils/test';
import { ShipStationPage, ApiUtils, payloads } from './shipstationPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const { VENDOR_ID } = process.env;

test.describe('ShipStation test', () => {
    let admin: ShipStationPage;
    let vendor: ShipStationPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ShipStationPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ShipStationPage(vPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.shipStation, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
    });

    test('admin can enable ShipStation integration module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableShipStationModule(); });

    test('vendor can generate ShipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await apiUtils.deleteShipStationCredential(VENDOR_ID, payloads.vendorAuth);
        await vendor.generateShipStationCredentials();
    });

    test('vendor can revoke ShipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await apiUtils.createShipStationCredential(VENDOR_ID, payloads.vendorAuth);
        await vendor.revokeShipStationCredentials();
    });

    test('admin can disable ShipStation integration module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.shipStation, payloads.adminAuth);
        await admin.disableShipStationModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Shipstation (React) Tests @pro', () => {
    test('Test Case 1 - Vendor shipstation settings page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/shipstation/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin chrome loads', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/settings`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

