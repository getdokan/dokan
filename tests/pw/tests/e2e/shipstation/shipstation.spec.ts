import { test, Page } from '@playwright/test';
import { ShipStationPage, ApiUtils, payloads } from './shipstationPage';
import path from 'path';

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
