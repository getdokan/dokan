import { test } from '@playwright/test';
import { data } from '@utils/testData';
import { LoginPage } from '@pages/loginPage';
import { LocalSetupPage } from '@pages/localSetupPage';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

const { CI } = process.env;

test.describe('setup local site', () => {
    test.skip(CI, 'skip site setup on CI');

    test('download wordpress to desired folder', async () => {});
    // todo: implement below steps
    /*
	  1. create everything using bash script if needed
	  2. get desired folder path
	  3. download wordpress zip and unzip it
	  4. clone desired plugins to wp-plugins
	  5. clone theme to theme folder
	*/

    test.skip('clone dokan pro and build', { tag: ['@pro'] }, async () => {
        await helpers.createFolder('plugins');
        console.log('cloning dokan pro...');
        await helpers.exeCommand(data.commands.cloneDokanPro, 'plugins');
        console.log('cloning dokan pro done');
        console.log('building dokan pro...');
        await helpers.exeCommand(data.commands.buildPlugin, 'plugins/dokan-pro');
        console.log('building dokan pro done');
    });

    test('reset site', async () => {
        await helpers.exeCommand(data.commands.resetSite);
    });

    test('install wordpress', async () => {
        // set wp-config (db info)
        await helpers.exeCommand(data.commands.createConfig(data.installWp.dbInfo));

        // set wp-config (debug info)
        for (const [key, value] of Object.entries(data.installWp.debugInfo)) {
            await helpers.exeCommand(data.commands.setDebugConfig(key, value));
        }

        // install wordpress
        await helpers.exeCommand(data.commands.installWp(data.installWp.siteInfo));
    });

    test('install and activate theme', async () => {
        await helpers.exeCommand(data.commands.installTheme(data.installWp.themes.storefront));
    });

    test('activate basic auth plugin', async () => {
        await helpers.exeCommand(data.commands.activatePlugin(data.installWp.plugins.basicAuth));
        // await dbUtils.updateOptionValue(dbData.optionName.activePlugins, dbData.plugins, true);
    });

    test('remove dokan pro plugin requirements (dokan-lite)', async () => {
        await helpers.exeCommand(data.commands.removeLiteRequired);
    });

    test('activate dokan pro modules', async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.dokanActiveModules, dbData.dokan.modules, true);
    });

    test.skip('admin setup wordpress', async ({ page }) => {
        const localSetupPage = new LocalSetupPage(page);
        const loginPage = new LoginPage(page);

        await localSetupPage.setupWp(data.installWp);
        await loginPage.adminLogin(data.admin);
        await localSetupPage.setPermalinkSettings(data.wpSettings.permalink);
    });
});
