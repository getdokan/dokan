import { test, Page } from '@utils/test';
import { ProductFormManager, ApiUtils, data, dbData, dbUtils, payloads } from './productFormManagerPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Product functionality test', () => {
    test.skip(true, 'feature not merged yet');
    let admin: ProductFormManager;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductFormManager(aPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.productFormManager, dbData.dokan.productFormManager);
        await apiUtils.activateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await aPage?.close();
        await apiUtils.dispose();
    });

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

    // KEEP skipped: feature not merged yet and page-object method resetProductFormManagerSettings is an empty stub
    test.skip('admin can reset product form manager settings', { tag: ['@pro', '@admin'] }, async () => {
        const blockLabel = await admin.addCustomBlock(data.dokanSettings.productFormManager.customBlock());
        await admin.resetProductFormManagerSettings(blockLabel);
    });

    test('admin can disable product form manager module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productFormManager, payloads.adminAuth);
        await admin.disableProductFormManagerModule();
    });
});
