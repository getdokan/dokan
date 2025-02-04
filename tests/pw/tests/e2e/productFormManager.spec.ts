import { test, request, Page } from '@playwright/test';
import { ProductFormManager } from '@pages/productFormManagerPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

test.describe('Product functionality test', () => {
    test.skip(true, 'feature not merged yet');
    let admin: ProductFormManager;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductFormManager(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.productFormManager, dbData.dokan.productFormManager);
        await apiUtils.activateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can enable product form manager module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductFormManagerModule();
    });

    test('admin can add custom block', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
    });

    test('admin can edit custom block', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        await admin.addCustomBlock({ ...data.dokanSettings.productFormManager.updateBlock, currentLabel: blockLabel }, true);
    });

    test('admin can delete custom block', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        await admin.deleteCustomBlock(blockLabel);
    });

    test('admin can add custom field to custom block', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        await admin.addCustomField({ ...data.dokanSettings.productFormManager.customField(), block: blockLabel });
    });

    test('admin can edit custom field of custom block', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        const fieldLabel = await admin.addCustomField({ ...data.dokanSettings.productFormManager.customField(), block: blockLabel });
        await admin.addCustomField({ ...data.dokanSettings.productFormManager.customField(), block: blockLabel, currentLabel: fieldLabel }, true);
    });

    test('admin can delete custom field from custom block', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        const fieldLabel = await admin.addCustomField({ ...data.dokanSettings.productFormManager.customField(), block: blockLabel });
        await admin.deleteCustomField({ block: blockLabel, label: fieldLabel });
    });

    test.skip('admin can reset product form manager settings', { tag: ['@pro', '@admin'] }, async () => {
        // todo: update test for reseting predefined blocks, custom blocks wont reset
        // await dbUtils.updateOptionValue(dbData.dokan.optionName.productFormManager, dbData.testData.dokan.customBlock);
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        await admin.resetProductFormManagerSettings(blockLabel);
    });

    test('admin can disable product form manager module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await admin.disableProductFormManagerModule();
    });
});
