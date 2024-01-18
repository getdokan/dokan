import { test, Page } from '@playwright/test';
import { PluginPage } from '@pages/pluginPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe.skip('Plugin functionality test', () => {
    let pluginPage: PluginPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        pluginPage = new PluginPage(aPage);

        apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    //todo: install plugin

    test('Activate dokan lite plugin @lite', async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'inactive' }, payloads.adminAuth);
        await pluginPage.activatePlugin(data.plugin.pluginName.dokanlite);
    });

    test('Deactivate dokan lite plugin @lite', async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await pluginPage.deactivateDokanPlugin(data.plugin.pluginName.dokanlite, false);
    });

    test('Deactivate dokan lite plugin with deactivate reason @lite', async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await pluginPage.deactivateDokanPlugin(data.plugin.pluginName.dokanlite, true);
    });

    test('Activate dokan pro plugin @pro', async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'inactive' }, payloads.adminAuth);
        await pluginPage.activatePlugin(data.plugin.pluginName.dokanPro);
    });

    test('Deactivate dokan pro plugin @pro', async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await pluginPage.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
    });

    test('Deactivate dokan pro plugin with deactivate reason @pro', async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await pluginPage.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, true);
    });

    // test('Delete dokan lite plugin @lite', async ( ) => {
    // 	await pluginPage.activatePlugin(data.plugin.dokanLite);
    // });

    // test('Delete dokan pro plugin @pro', async ( ) => {
    // 	await pluginPage.activatePlugin(data.plugin.dokanLite);
    // });
});
