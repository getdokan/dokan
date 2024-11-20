import { test, Page } from '@playwright/test';
import { ShipstationPage } from '@pages/shipstationPage';
import { data } from '@utils/testData';

test.describe('Shipstation test', () => {
    test.skip(true, 'remove after pr is merged');
    let vendor: ShipstationPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ShipstationPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    // vendor

    test('vendor can generate shipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.generateShipStationCredentials();
    });

    test('vendor can revoke shipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.revokeShipStationCredentials();
    });
});
