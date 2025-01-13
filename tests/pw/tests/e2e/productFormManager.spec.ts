import { test, request, Page } from '@playwright/test';
import { ProductFormManager } from '@pages/productFormManagerPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

const { PRODUCT_ID } = process.env;

test.describe.only('Product functionality test', () => {
    let admin: ProductFormManager;
    let vendor: ProductFormManager;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    // let productName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductFormManager(aPage);

        // const vendorContext = await browser.newContext(data.auth.vendorAuth);
        // vPage = await vendorContext.newPage();
        // vendor = new ProductFormManager(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        // [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await aPage.close();
        // await vPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can enable product form manager module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductFormManagerModule();
    });

    test('admin can add custom block', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock);
    });

    test('admin can reset product form manager settings', { tag: ['@pro', '@admin'] }, async () => {
        // await dbUtils.updateOptionValue(dbData.dokan.optionName.productFormManager, dbData.testData.dokan.customBlock);
        await admin.resetProductFormManagerSettings();
    });

    test('admin can disable product form manager module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await admin.disableProductFormManagerModule();
    });
});
