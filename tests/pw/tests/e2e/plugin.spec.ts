import { test, request, Page } from '@playwright/test';
import { PluginPage } from '@pages/pluginPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { DOKAN_PRO } = process.env;

test.describe.skip('Plugin functionality test', () => {
    let admin: PluginPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PluginPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        if (DOKAN_PRO) {
            await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'inactive' }, payloads.adminAuth);
        }
    });

    test.afterAll(async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        if (DOKAN_PRO) {
            await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        }
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can activate Dokan pro plugin', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'inactive' }, payloads.adminAuth);
        await admin.activatePlugin(data.plugin.pluginName.dokanPro);
    });

    test('admin can deactivate Dokan pro plugin', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
    });

    test('admin can deactivate Dokan pro plugin with deactivate reason', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, true);
    });

    test('admin can activate Dokan plugin', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'inactive' }, payloads.adminAuth);
        await admin.activatePlugin(data.plugin.pluginName.dokanLite);
    });

    test('admin can deactivate Dokan plugin', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, false);
    });

    test('admin can deactivate Dokan plugin with deactivate reason', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
        await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, true);
    });

    test.skip('admin can delete Dokan pro plugin', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        // await admin.deletePlugin(data.plugin.pluginName.dokanLite);
    });

    test.skip('admin can delete Dokan plugin', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        // await admin.deletePlugin(data.plugin.pluginName.dokanLite);
    });

    //todo: replace (one zip with another) plugin test

    //todo: add plugin install test
});
