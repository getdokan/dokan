import { test, Page } from '@playwright/test';
import { PluginPage, ApiUtils, data, payloads } from './pluginPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

const { DOKAN_PRO } = process.env;

test.describe('Plugin functionality test', () => {
    let admin: PluginPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const originalPluginStates: { dokanLite?: string; dokanPro?: string } = {};

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new PluginPage(aPage);

        apiUtils = new ApiUtils(null);

        const [, , dokanLiteStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        originalPluginStates.dokanLite = dokanLiteStatus;

        if (DOKAN_PRO) {
            const [, , dokanProStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
            originalPluginStates.dokanPro = dokanProStatus;
        }

        await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
        if (DOKAN_PRO) {
            await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
        }
    });

    test.afterAll(async () => {
        const shouldActivateLite = originalPluginStates.dokanLite === 'active';
        const shouldActivatePro = !!DOKAN_PRO && originalPluginStates.dokanPro === 'active';

        if (shouldActivateLite && shouldActivatePro) {
            if (originalPluginStates.dokanLite !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
            }
            if (originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
            }
        } else if (!shouldActivateLite && !shouldActivatePro) {
            if (DOKAN_PRO && originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'inactive' }, payloads.adminAuth);
            }
            if (originalPluginStates.dokanLite !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'inactive' }, payloads.adminAuth);
            }
        }

        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can activate Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        if (currentStatus === 'inactive') {
            await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
            await admin.activatePlugin(data.plugin.pluginName.dokanPro);
        }
    });

    test('admin can deactivate Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        if (currentStatus === 'active') {
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
        }
    });

    test('admin can deactivate Dokan pro plugin with deactivate reason', { tag: ['@pro', '@admin'] }, async () => {
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        if (currentStatus === 'active') {
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, true);
        }
    });

    test('admin can activate Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        if (currentStatus === 'inactive') {
            await admin.activatePlugin(data.plugin.pluginName.dokanLite);
        }
    });

    test.skip('admin can deactivate Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {});
    test.skip('admin can deactivate Dokan plugin with deactivate reason', { tag: ['@lite', '@admin'] }, async () => {});
    test.skip('admin can delete Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {});
    test.skip('admin can delete Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {});
});
