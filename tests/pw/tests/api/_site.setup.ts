import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { helpers, BASE_URL, toPath, parseBoolean } from '@utils/helpers';

const { CI } = process.env;
const isCi = parseBoolean(CI);

setup.describe('site setup', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set wp debug config', { tag: ['@lite'] }, async () => {
        for (const [key, value] of Object.entries(data.installWp.debugInfo)) {
            await helpers.exeCommandWpcli(data.commands.wpcli.setDebugConfig(key, value));
        }
    });

    setup('set permalink (post_name)', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.rewritePermalink);
    });

    setup('get server url', { tag: ['@lite'] }, async () => {
        setup.skip(!isCi, 'skip on local');
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? toPath('?rest_route=') : toPath('wp-json');
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('activate basic auth', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.basicAuth));
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
        // remove dokan pro plugin requirements (dokan-lite)
        if (!isCi) await helpers.exeCommand(data.commands.removeLiteRequired);

        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.dokanPro, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate theme (storefront)', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activateTheme(data.installWp.themes.storefront));
    });

    setup('set dokan license', { tag: ['@pro'] }, async () => {
        setup.skip(!process.env.LICENSE_KEY, 'LICENSE_KEY env var not set – skipping license setup (fork PR or unconfigured secret)');
        try {
            await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
        } catch (error) {
            console.log('License setup failed, but continuing...', error);
        }
    });

    setup('activate all dokan modules', { tag: ['@pro'] }, async () => {
        // 'auction' requires woocommerce-simple-auctions; activating it in the same batch causes the
        // entire request to be rejected with 400 when that plugin is absent. Activate the rest as a
        // batch first, then attempt auction separately so a missing plugin never blocks other modules.
        const coreModules = dbData.dokan.modules.filter((m: string) => m !== 'auction');
        const [response] = await apiUtils.activateModules(coreModules, payloads.adminAuth);
        if (!response.ok()) {
            console.log('Core module activation failed, but continuing...');
        }
        try {
            const [auctionResponse] = await apiUtils.activateModules(['auction'], payloads.adminAuth);
            if (!auctionResponse.ok()) {
                console.log('Auction module not available (woocommerce-simple-auctions may be missing), continuing...');
            }
        } catch (error) {
            console.log('Auction module activation skipped:', error);
        }
    });

    setup('activate Woocommerce booking', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceBookings, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce product addons', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceProductAddons, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce simple auctions', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceSimpleAuctions, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    setup('activate Woocommerce subscriptions', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.updatePlugin(data.plugin.pluginList.woocommerceSubscriptions, { status: 'active' }, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
    });

    // Rank Math SEO is a wordpress.org dependency of the Dokan "Rank Math SEO"
    // product-editor integration. The e2e site setup activates + marks it configured
    // (tests/e2e/_site.setup.ts) but the api setup did NOT — so `api/rankMath.spec.ts`
    // (whose editor-data endpoint instantiates Rank Math's `Screen`, which
    // `implements RankMath\Admin\Metabox\IScreen`) fatal-500'd in CI where the plugin
    // was never activated (it only passed locally because the shared wp-env already
    // had it active from e2e runs). Activate + short-circuit registration here too,
    // mirroring the e2e setup. Non-fatal: the module/tests tolerate the plugin being
    // absent (DependencyNotice).
    setup('activate Rank Math SEO', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.rankMath));
            await helpers.exeCommandWpcli(data.commands.wpcli.setDebugConfig('RANK_MATH_REGISTRATION_SKIP', true));
            await helpers.exeCommandWpcli(data.commands.wpcli.updateOption('rank_math_registration_skip', '1'));
            await helpers.exeCommandWpcli(data.commands.wpcli.updateOption('rank_math_is_configured', '1'));
        } catch {
            // Plugin absent — the rank-math suite tolerates this (DependencyNotice).
        }
    });

    setup('set site general settings', { tag: ['@lite'] }, async () => {
        const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings, payloads.adminAuth);
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
