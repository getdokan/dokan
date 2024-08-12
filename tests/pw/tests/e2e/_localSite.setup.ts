import { test } from '@playwright/test';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { SITE_PATH } = process.env;

test.describe('setup local site', () => {
    test('download wordpress', async () => {
        test.slow();
        await helpers.exeCommand(data.commands.makePath(SITE_PATH));
        await helpers.exeCommandWpcli(data.commands.wpcli.downloadWp);
    });

    test('create config', async () => {
        // set wp-config (db info)
        await helpers.exeCommandWpcli(data.commands.wpcli.createConfig(data.installWp.dbInfo));

        // set wp-config (debug info)
        for (const [key, value] of Object.entries(data.installWp.debugInfo)) {
            await helpers.exeCommandWpcli(data.commands.wpcli.setDebugConfig(key, value));
        }
    });

    test('create database', async () => {
        // reset db command is used to create db
        await helpers.exeCommandWpcli(data.commands.wpcli.resetSite);
    });

    test('install wordpress', async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.installWp(data.installWp.siteInfo));
    });

    test('install theme', async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.installTheme(data.installWp.themes.storefront));
    });

    test('install plugin (woocommece)', { tag: ['@pro'] }, async () => {
        await helpers.exeCommandWpcli(data.commands.wpcli.installPlugin(data.installWp.plugins.woocommerce));
    });

    test('install plugin (dokan)', { tag: ['@pro'] }, async () => {
        test.slow();
        await helpers.exeCommand(data.commands.makePath(`${SITE_PATH}/plugins`));

        console.log('Start: Cloning dokan');
        await helpers.exeCommand(data.commands.cloneDokanLite(`${SITE_PATH}/wp-content/plugins`));
        console.log('Success: Cloning dokan done');

        console.log('building dokan...');
        await helpers.exeCommand(data.commands.buildPlugin(`${SITE_PATH}/wp-content/plugins/dokan`));
        console.log('Success: Building dokan done');

        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokan));
    });

    test('install plugin (dokan-pro)', { tag: ['@pro'] }, async () => {
        test.slow();
        await helpers.exeCommand(data.commands.makePath(`${SITE_PATH}/plugins`));

        console.log('Start: Cloning dokan pro');
        await helpers.exeCommand(data.commands.cloneDokanPro(`${SITE_PATH}/wp-content/plugins`));
        console.log('Success: Cloning dokan pro done');

        console.log('building dokan pro...');
        await helpers.exeCommand(data.commands.buildPlugin(`${SITE_PATH}/wp-content/plugins/dokan-pro`));
        console.log('Success: Building dokan pro done');

        // remove dokan pro plugin requirements (dokan-lite)
        await helpers.exeCommand(data.commands.removeLiteRequired);

        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.dokanPro));
    });

    test('install plugin (basic auth)', { tag: ['@pro'] }, async () => {
        test.slow();
        await helpers.exeCommand(data.commands.makePath(`${SITE_PATH}/plugins`));

        console.log('Start: Cloning basic auth');
        await helpers.exeCommand(data.commands.cloneBasicAuth(`${SITE_PATH}/wp-content/plugins`));
        console.log('Success: Cloning basic auth done');

        await helpers.exeCommandWpcli(data.commands.wpcli.activatePlugin(data.installWp.plugins.basicAuth));
    });

    test('install plugin (woocommerce product addons)', { tag: ['@pro'] }, async () => {
        const pluginPath = `${SITE_PATH}/wp-content/plugins/dokan-pro/tests/plugins/woocommerce-product-addons.zip`;
        await helpers.exeCommandWpcli(data.commands.wpcli.installPlugin(pluginPath));
    });

    test('install plugin (woocommerce subscriptions)', { tag: ['@pro'] }, async () => {
        const pluginPath = `${SITE_PATH}/wp-content/plugins/dokan-pro/tests/plugins/woocommerce-subscriptions.zip`;
        await helpers.exeCommandWpcli(data.commands.wpcli.installPlugin(pluginPath));
    });

    test('install plugin (woocommerce simple auctions)', { tag: ['@pro'] }, async () => {
        const pluginPath = `${SITE_PATH}/wp-content/plugins/dokan-pro/tests/plugins/woocommerce-simple-auctions.zip`;
        await helpers.exeCommandWpcli(data.commands.wpcli.installPlugin(pluginPath));
    });

    test('install plugin (woocommerce booking)', { tag: ['@pro'] }, async () => {
        const pluginPath = `${SITE_PATH}/wp-content/plugins/dokan-pro/tests/plugins/woocommerce-bookings.zip`;
        await helpers.exeCommandWpcli(data.commands.wpcli.installPlugin(pluginPath));
    });
});
