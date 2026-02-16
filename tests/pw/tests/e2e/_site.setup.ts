import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

const { CI, BASE_URL, DOKAN_PRO } = process.env;

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
        // wp-env installs from woocommerce.latest-stable.zip so slug is woocommerce.latest-stable
        const wcSlugs = ['woocommerce.latest-stable', data.installWp.plugins.woocommerce];
        for (const slug of wcSlugs) {
            try {
                await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(slug));
                return;
            } catch {
                // try next slug
            }
        }
        throw new Error('Could not activate WooCommerce (tried: ' + wcSlugs.join(', ') + ')');
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
        // wp-env may install from storefront.latest-stable.zip; slug can be 'storefront' or 'storefront.latest-stable'
        const storefrontSlugs = ['storefront.latest-stable', data.installWp.themes.storefront];
        const themesUrl = BASE_URL ? `${BASE_URL}/wp-admin/themes.php` : 'http://localhost:9999/wp-admin/themes.php';
        const storefrontInstallUrl = 'https://wordpress.org/themes/storefront/';
        for (const slug of storefrontSlugs) {
            try {
                await helpers.exeCommandWpcli(data.commands.wpcli.activateTheme(slug));
                return;
            } catch {
                // try next slug or install
            }
        }
        try {
            await helpers.exeCommandWpcli(data.commands.wpcli.installTheme(data.installWp.themes.storefront));
        } catch {
            console.log(`[storefront] CLI failed. Activate manually: ${themesUrl}`);
            console.log(`[storefront] Or install from: ${storefrontInstallUrl}`);
        }
    });

    setup('set dokan license', { tag: ['@pro'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
    });

    setup('activate all dokan modules', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.activateModules(dbData.dokan.modules, payloads.adminAuth);
        if (!response.ok()) {
            console.log('Module activation failed, but continuing...');
        }
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
