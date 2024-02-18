import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';


// selectors
const pluginsAdmin = selector.admin.plugins;

export class PluginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // navigation

    async goToPlugins() {
        await this.goIfNotThere(data.subUrls.backend.plugins);
    }

    // activate plugin
    async activatePlugin(plugin: string) {
        await this.goToPlugins();
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.activatePlugin, pluginsAdmin.activatePlugin(plugin), 302);
        await this.toBeVisible(pluginsAdmin.deactivatePlugin(plugin));
    }

    // deactivate plugin [only work for plugins which doesn't have deactivation popup]
    async deactivatePlugin(plugin: string) {
        await this.goToPlugins();
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.deactivatePlugin, pluginsAdmin.deactivatePlugin(plugin), 302);
        await this.toBeVisible(pluginsAdmin.activatePlugin(plugin));
    }

    // deactivate dokan plugin
    async deactivateDokanPlugin(plugin: string, submitReason: boolean) {
        await this.goToPlugins();
        await this.click(pluginsAdmin.deactivatePlugin(plugin));
        const isDeactivateModalVisible = await this.isVisible(pluginsAdmin.deactivateReason.deactivateReasonModal(plugin));
        console.log(isDeactivateModalVisible);

        if (isDeactivateModalVisible) {
            if (submitReason) {
                await this.click(pluginsAdmin.deactivateReason.reason(helpers.getRandomNumber(1, 7)));
                await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.deactivatePlugin, pluginsAdmin.deactivateReason.submitAndDeactivate, 302);
            } else {
                await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.deactivatePlugin, pluginsAdmin.deactivateReason.skipAndDeactivate, 302);
            }
            await this.toBeVisible(pluginsAdmin.activatePlugin(plugin));
        }
    }
}
