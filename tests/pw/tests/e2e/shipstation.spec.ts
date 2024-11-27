import { test, Page } from '@playwright/test';
import { ShipStationPage } from '@pages/shipPage';
import { data } from '@utils/testData';

test.describe('ShipStation test', () => {
    test.skip(true, 'remove after pr is merged');
    let vendor: ShipStationPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ShipStationPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    // vendor

    test('vendor can generate ShipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.generateShipStationCredentials();
    });

    test('vendor can revoke ShipStation credentials', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.revokeShipStationCredentials();
    });
});
