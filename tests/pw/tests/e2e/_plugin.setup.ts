import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { CI, LOCAL, DOKAN_PRO, BASE_URL } = process.env;

setup.describe('authenticate users & set permalink', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set permalinks (post_name)', { tag: ['@lite'] }, async () => {
        LOCAL ? await helpers.exeCommand(data.commands.permalinkLocal) : await helpers.exeCommand(data.commands.permalinkWpEnv);
    });

    setup('activate theme (storefront)', { tag: ['@lite'] }, async () => {
        LOCAL ? await helpers.exeCommand(data.commands.activateTheme(data.installWp.themes.storefront)) : await helpers.exeCommand(data.commands.activateThemeWpEnv);
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
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.basicAuth, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
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
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
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
});
