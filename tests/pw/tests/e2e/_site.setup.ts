import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

const { LOCAL, DOKAN_PRO, BASE_URL } = process.env;

setup.describe('site setup', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set permalink (post_name)', { tag: ['@lite'] }, async () => {
        const command = LOCAL ? data.commands.permalinkLocal : data.commands.permalinkWpEnv;
        await helpers.exeCommand(command);
    });

    setup('activate theme (storefront)', { tag: ['@lite'] }, async () => {
        const theme = data.installWp.themes.storefront;
        const command = LOCAL ? data.commands.activateTheme(theme) : data.commands.activateThemeWpEnv(theme);
        await helpers.exeCommand(command);
    });

    setup('get server url', { tag: ['@lite'] }, async () => {
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('activate basic auth', { tag: ['@lite'] }, async () => {
        const plugin = data.installWp.plugins.basicAuth;
        const command = LOCAL ? data.commands.activatePlugin(plugin) : data.commands.activatePluginWpEnv(plugin);
        await helpers.exeCommand(command);
    });

    setup('activate Woocommerce', { tag: ['@lite'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerce, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Dokan Lite', { tag: ['@lite'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.dokanLite, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Dokan Pro', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        // remove dokan pro plugin requirements (dokan-lite)
        if (LOCAL) await helpers.exeCommand(data.commands.removeLiteRequired);

        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('set dokan license', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
    });

    setup('activate all dokan modules', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [response] = await apiUtils.activateModules(dbData.dokan.modules);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce booking', { tag: ['@lite'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceBookings, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce product addons', { tag: ['@lite'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceProductAddons, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce simple auctions', { tag: ['@lite'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceSimpleAuctions, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce subscriptions', { tag: ['@lite'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceSubscriptions, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('check active plugins', { tag: ['@lite'] }, async () => {
        //todo: might not needed
        setup.skip(LOCAL, 'skip plugin check on local');
        const activePlugins = (await apiUtils.getAllPlugins({ status: 'active' }, payloads.adminAuth)).map((a: { plugin: string }) => a.plugin.split('/')[1]);
        const plugins = DOKAN_PRO ? data.plugin.plugins : data.plugin.pluginsLite;
        expect(activePlugins).toEqual(expect.arrayContaining(plugins));
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
