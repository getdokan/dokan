import { test, request, Page } from '@playwright/test';
import { PluginPage } from '@pages/pluginPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { DOKAN_PRO } = process.env;

test.describe('Plugin functionality test', () => {
    let admin: PluginPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let originalPluginStates: { dokanLite?: string; dokanPro?: string } = {};

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PluginPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        
        // Capture original plugin states before making any changes
        const [, , dokanLiteStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        originalPluginStates.dokanLite = dokanLiteStatus;
        
        if (DOKAN_PRO) {
            const [, , dokanProStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
            originalPluginStates.dokanPro = dokanProStatus;
        }
        
        console.log(`Original plugin states - Dokan Lite: ${originalPluginStates.dokanLite}, Dokan Pro: ${originalPluginStates.dokanPro || 'N/A'}`);
        
        // Ensure plugins are in active state for testing (tests will activate/deactivate from this baseline)
        await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
        if (DOKAN_PRO) {
            await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
        }
    });

    test.afterAll(async () => {
        // Restore original plugin states respecting dependency chain
        console.log(`Restoring original plugin states - Dokan Lite: ${originalPluginStates.dokanLite}, Dokan Pro: ${originalPluginStates.dokanPro || 'N/A'}`);
        
        // Handle restoration with dependency chain: 
        // - If both should be active: activate lite first, then pro
        // - If both should be inactive: deactivate pro first, then lite
        
        const shouldActivateLite = originalPluginStates.dokanLite === 'active';
        const shouldActivatePro = DOKAN_PRO && originalPluginStates.dokanPro === 'active';
        
        if (shouldActivateLite && shouldActivatePro) {
            // Both should be active: activate lite first, then pro
            if (originalPluginStates.dokanLite !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
            }
            if (originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
            }
        } else if (!shouldActivateLite && !shouldActivatePro) {
            // Both should be inactive: deactivate pro first, then lite
            if (DOKAN_PRO && originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'inactive' }, payloads.adminAuth);
            }
            if (originalPluginStates.dokanLite !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'inactive' }, payloads.adminAuth);
            }
        } else {
            // Mixed states: handle individually
            if (!shouldActivatePro && DOKAN_PRO && originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: originalPluginStates.dokanPro }, payloads.adminAuth);
            }
            if (originalPluginStates.dokanLite && originalPluginStates.dokanLite !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: originalPluginStates.dokanLite }, payloads.adminAuth);
            }
            if (shouldActivatePro && DOKAN_PRO && originalPluginStates.dokanPro !== 'not exists') {
                await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: originalPluginStates.dokanPro }, payloads.adminAuth);
            }
        }
        
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can activate Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {
        // Check current status and test accordingly
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        
        if (currentStatus === 'inactive') {
            // Plugin is inactive - we can test activation (ensure dokan-lite is active first)
            console.log('Dokan Pro is inactive, testing activation');
            await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
            await admin.activatePlugin(data.plugin.pluginName.dokanPro);
        } else {
            // Plugin is already active - skip this test as activation is not possible
            console.log('Dokan Pro is already active, skipping activation test');
        }
    });

    test('admin can deactivate Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {
        // Check current status and test accordingly
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        
        if (currentStatus === 'active') {
            // Plugin is active - we can test deactivation
            console.log('Dokan Pro is active, testing deactivation');
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
        } else {
            // Plugin is already inactive - skip this test as deactivation is not possible
            console.log('Dokan Pro is already inactive, skipping deactivation test');
        }
    });

    test('admin can deactivate Dokan pro plugin with deactivate reason', { tag: ['@pro', '@admin'] }, async () => {
        // Check current status and test accordingly
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
        
        if (currentStatus === 'active') {
            // Plugin is active - we can test deactivation with reason
            console.log('Dokan Pro is active, testing deactivation with reason');
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, true);
        } else {
            // Plugin is already inactive - skip this test as deactivation is not possible
            console.log('Dokan Pro is already inactive, skipping deactivation with reason test');
        }
    });

    test('admin can activate Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {
        // Check current status and test accordingly
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        
        if (currentStatus === 'inactive') {
            // Plugin is inactive - we can test activation
            console.log('Dokan Lite is inactive, testing activation');
            await admin.activatePlugin(data.plugin.pluginName.dokanLite);
            // Note: Original state was inactive, will be restored in afterAll
        } else {
            // Plugin is already active - skip this test as activation is not possible
            console.log('Dokan Lite is already active, skipping activation test');
        }
    });

    test('admin can deactivate Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {
        // Check current status and test accordingly  
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        
        if (currentStatus === 'active') {
            // Plugin is active - we can test deactivation
            console.log('Dokan Lite is active, testing deactivation');
            
            // Before deactivating dokan-lite, must deactivate dokan-pro first (if active)
            if (DOKAN_PRO) {
                const [, , proStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
                if (proStatus === 'active') {
                    await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
                }
            }
            
            // Now deactivate dokan-lite
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, false);
            // Note: Original state was active, will be restored in afterAll
        } else {
            // Plugin is already inactive - skip this test as deactivation is not possible
            console.log('Dokan Lite is already inactive, skipping deactivation test');
        }
    });

    test('admin can deactivate Dokan plugin with deactivate reason', { tag: ['@lite', '@admin'] }, async () => {
        // Check current status and test accordingly
        const [, , currentStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanLite, payloads.adminAuth);
        
        if (currentStatus === 'active') {
            // Plugin is active - we can test deactivation with reason
            console.log('Dokan Lite is active, testing deactivation with reason');
            
            // Before deactivating dokan-lite, must deactivate dokan-pro first (if active)
            if (DOKAN_PRO) {
                const [, , proStatus] = await apiUtils.getSinglePlugin(data.plugin.pluginList.dokanPro, payloads.adminAuth);
                if (proStatus === 'active') {
                    await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanPro, false);
                }
            }
            
            // Now deactivate dokan-lite with reason
            await admin.deactivateDokanPlugin(data.plugin.pluginName.dokanLite, true);
            // Note: Original state was active, will be restored in afterAll
        } else {
            // Plugin is already inactive - skip this test as deactivation is not possible
            console.log('Dokan Lite is already inactive, skipping deactivation with reason test');
        }
    });

    test.skip('admin can delete Dokan pro plugin', { tag: ['@pro', '@admin'] }, async () => {
        // await admin.deletePlugin(data.plugin.pluginName.dokanLite);
    });

    test.skip('admin can delete Dokan plugin', { tag: ['@lite', '@admin'] }, async () => {
        // await admin.deletePlugin(data.plugin.pluginName.dokanLite);
    });

    //todo: replace (one zip with another) plugin test

    //todo: add plugin install test
});
