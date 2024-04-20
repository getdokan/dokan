import { test, request, Page } from '@playwright/test';
import { PluginPage } from '@pages/pluginPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe.skip('Plugin functionality test', () => {
    let admin: PluginPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PluginPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    //todo: install plugin

    test('activate dokan lite plugin', { tag: ['@lite', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'inactive' }, payloads.adminAuth);
        await admin.activatePlugin(data.plugin.pluginName.dokanLite);
    });

    test('deactivate dokan lite plugin', { tag: ['@lite', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, false);
    });

    test('deactivate dokan lite plugin with deactivate reason', { tag: ['@lite', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, true);
    });

    test('activate dokan pro plugin', { tag: ['@pro', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'inactive' }, payloads.adminAuth);
        await admin.activatePlugin(data.plugin.pluginName.dokanPro);
    });

    test('deactivate dokan pro plugin', { tag: ['@pro', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
    });

    test('deactivate dokan pro plugin with deactivate reason', { tag: ['@pro', '@a'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, true);
    });

    test('delete dokan lite plugin', { tag: ['@lite', '@a'] }, async () => {
        await admin.activatePlugin(data.plugin.pluginName.dokanLite);
    });

    test('delete dokan pro plugin', { tag: ['@pro', '@a'] }, async () => {
        await admin.activatePlugin(data.plugin.pluginName.dokanLite);
    });
});
