import { test, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { VendorPage } from '@pages/vendorPage';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

test.describe('Vendor functionality test', () => {
    let vendor: VendorPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor can register', { tag: ['@lite', '@v'] }, async ({ page }) => {
        const vendorPage = new VendorPage(page);
        await vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
    });

    test('vendor can register (address fields are enabled)', { tag: ['@lite', '@v'] }, async ({ page }) => {
        const vendorPage = new VendorPage(page);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_address_on_reg: 'on' });
        await vendorPage.vendorRegister({ ...data.vendor.vendorInfo, addressFieldsEnabled: true }, { ...data.vendorSetupWizard, choice: false });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_address_on_reg: 'off' });
    });

    test('vendor can login', { tag: ['@lite', '@v'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor);
    });

    test('vendor can logout', { tag: ['@lite', '@v'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor);
        await loginPage.logout();
    });

    test('vendor can setup setup-wizard', { tag: ['@lite', '@v'] }, async () => {
        await vendor.vendorSetupWizard(data.vendorSetupWizard);
    });

    test('vendor account details menu page is rendering properly', { tag: ['@lite', '@exp', '@v'] }, async () => {
        await vendor.vendorAccountDetailsRenderProperly();
    });

    test('vendor update account details', { tag: ['@lite', '@v'] }, async () => {
        await vendor.addVendorDetails(data.vendor);
    });

    test('vendor can visit own Store', { tag: ['@lite', '@v'] }, async () => {
        await vendor.visitStore(data.predefined.vendorStores.vendor1);
    });
});
