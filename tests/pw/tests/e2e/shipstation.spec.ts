import { test, Page, request } from '@playwright/test';
import { ShipStationPage } from '@pages/shipStationPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

test.describe('ShipStation test', () => {
    test.skip(true, 'remove after pr is merged');
    let admin: ShipStationPage;
    let vendor: ShipStationPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ShipStationPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ShipStationPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.shipStation, payloads.adminAuth);
        await vPage.close();
    });

    // admin

    test('admin can enable ShipStation integration module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableShipStationModule();
    });

    // vendor

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
