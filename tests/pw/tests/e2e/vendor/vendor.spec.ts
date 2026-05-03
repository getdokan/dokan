import { test, Page } from '@playwright/test';
import { LoginPage, VendorPage, dbData, dbUtils, data } from './vendorPage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Vendor functionality test', () => {
    let vendor: VendorPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorPage(vPage);
    });

    test.afterAll(async () => { await vPage?.close(); });

    test('vendor can register', { tag: ['@lite', '@vendor'] }, async ({ page }) => {
        const v = new VendorPage(page);
        await v.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
    });

    test.skip('vendor can register (address fields are enabled)', { tag: ['@lite', '@vendor'] }, async ({ page }) => {
        const v = new VendorPage(page);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_address_on_reg: 'on' });
        await v.vendorRegister({ ...data.vendor.vendorInfo, addressFieldsEnabled: true }, { ...data.vendorSetupWizard, choice: false });
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_address_on_reg: 'off' });
    });

    test('vendor can login', { tag: ['@lite', '@vendor'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor);
    });

    test('vendor can logout', { tag: ['@lite', '@vendor'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor);
        await loginPage.logout();
    });

    test.skip('vendor can setup setup-wizard', { tag: ['@lite', '@vendor'] }, async () => { await vendor.vendorSetupWizard(data.vendorSetupWizard); });
    test('vendor can view account details menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorAccountDetailsRenderProperly(); });
    test('vendor update account details', { tag: ['@lite', '@vendor'] }, async () => { await vendor.addVendorDetails(data.vendor); });
    test.skip('vendor can visit own Store', { tag: ['@lite', '@vendor'] }, async () => { await vendor.visitStore(data.predefined.vendorStores.vendor1); });
});
