import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

const { CI, BASE_URL } = process.env;

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
        setup.skip(!CI, 'skip on local');
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('activate basic auth', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.basicAuth));
    });

    setup('activate Woocommerce', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerce));
    });

    setup('activate Dokan Lite', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanLite));
    });

    setup('activate Dokan Pro', { tag: ['@pro'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanPro));
    });

    setup('flush rewrite rules after plugin activation', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.flushRewrite);
    });

    setup('activate theme (storefront)', { tag: ['@lite'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.activateTheme(data.installWp.themes.storefront));
    });



    setup('activate Woocommerce booking', { tag: ['@pro'] }, async () => {
        try {
            // Increase memory limit before activation
            await helpers.exeCommandWpcli('wp config set WP_MEMORY_LIMIT 1024M');
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceBookings));
        } catch (error) {
            console.log('WooCommerce Bookings activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce product addons', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceProductAddons));
        } catch (error) {
            console.log('WooCommerce Product Addons activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce simple auctions', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceSimpleAuctions));
        } catch (error) {
            console.log('WooCommerce Simple Auctions activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce subscriptions', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommerceSubscriptions));
        } catch (error) {
            console.log('WooCommerce Subscriptions activation had issues, but continuing...');
        }
    });

    setup('activate Woocommerce PDF invoices & packing slips', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.woocommercePdfInvoices));
        } catch (error) {
            console.log('WooCommerce PDF Invoices activation had issues, but continuing...');
        }
    });

    setup('activate Dokan Invoice', { tag: ['@pro'] }, async () => {
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanInvoice));
        } catch (error) {
            console.log('Dokan Invoice activation had issues, but continuing...');
        }
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
        // 'auction' requires woocommerce-simple-auctions. Even though that plugin is activated above,
        // it may fail silently (try-catch). Including 'auction' in the batch causes the entire request
        // to be rejected with 400 when the plugin is absent, leaving all other modules unactivated.
        // Activate the core batch first, then attempt 'auction' separately as a non-fatal step.
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

    setup('set site general settings', { tag: ['@lite'] }, async () => {
        const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings, payloads.adminAuth);
        if (siteSettings) {
            expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
        } else {
            console.log('Failed to set site settings, but continuing...');
        }
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        try {
            const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
            if (systemInfo) {
                helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
            }
        } catch (error) {
            console.log('Failed to get system info, but continuing...');
        }
    });
});
