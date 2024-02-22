import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsAdmin = selector.admin.dokan.settings;

export class MenuManagerPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // seave settings
    async saveSettings() {
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, 'Setting has been saved successfully.');
    }

    // update menu status
    async updateMenuStatus(menu: string, action: string, menuLink: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        action === 'activate' ? await this.enableSwitcher(settingsAdmin.menuManager.menuSwithcher(menu)) : await this.disableSwitcher(settingsAdmin.menuManager.menuSwithcher(menu));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
        const backgroundColor = action === 'activate' ? 'rgb(0, 144, 255)' : 'rgb(215, 218, 221)';
        await this.toHaveBackgroundColor(settingsAdmin.menuManager.menuSwithcher(menu) + '//span', backgroundColor);

        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        action === 'activate'
            ? await this.toBeVisible(selector.vendor.vDashboard.menus[menuLink as keyof typeof selector.vendor.vDashboard.menus])
            : await this.notToBeVisible(selector.vendor.vDashboard.menus[menuLink as keyof typeof selector.vendor.vDashboard.menus]);
        await this.goto(data.subUrls.frontend.vDashboard[menuLink as keyof typeof data.subUrls.frontend.vDashboard]);
        action === 'activate' ? await this.notToBeVisible(settingsAdmin.menuManager.noPermissionNotice) : await this.toBeVisible(settingsAdmin.menuManager.noPermissionNotice);
    }

    // rename menu
    async renameMenu(currentMenu: string, newMenu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);

        //rename
        await this.click(settingsAdmin.menuManager.menuEdit(currentMenu));
        await this.clearAndType(settingsAdmin.menuManager.menuNameInput, newMenu);
        await this.click(settingsAdmin.menuManager.menuNameConfirm);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
        await this.toBeVisible(settingsAdmin.menuManager.menuEdit(newMenu));

        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.toBeVisible(selector.vendor.vDashboard.menus.menuByText(newMenu));
    }

    async cantRenameMenu(menu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);

        await this.notToBeVisible(settingsAdmin.menuManager.menuEdit(menu));
    }

    // dashboard cant be alterd
    async cantAlterMenu(menu: string, isSubmenu?: boolean) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        isSubmenu && (await this.click(settingsAdmin.menuManager.settingsSubMenu));

        await this.notToBeVisible(settingsAdmin.menuManager.menuGrabber(menu));
        await this.notToBeVisible(settingsAdmin.menuManager.menuSwithcher(menu));
    }

    // reorderMenu
    async reorderMenu(menu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
    }

    // reset menu manager settings
    async resetMenuManagerSettings(menu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);

        // reset
        await this.click(settingsAdmin.menuManager.resetAll);
        await this.click(settingsAdmin.menuManager.confirmReset);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);

        await this.toHaveBackgroundColor(settingsAdmin.menuManager.menuSwithcher(menu) + '//span', 'rgb(0, 144, 255)');
    }
}
