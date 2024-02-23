import { Page, expect } from '@playwright/test';
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
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);

        switch (action) {
            case 'activate':
                await this.enableSwitcher(settingsAdmin.menuManager.menuSwithcher(menu));
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
                await this.toHaveBackgroundColor(settingsAdmin.menuManager.menuSwithcher(menu) + '//span', 'rgb(0, 144, 255)');
                //assertion
                await this.goto(data.subUrls.frontend.vDashboard.dashboard);
                await this.toBeVisible((selector.vendor.vDashboard.menus as any)[menuLink]);
                await this.goto((data.subUrls.frontend.vDashboard as any)[menuLink]);
                await this.notToBeVisible(settingsAdmin.menuManager.noPermissionNotice);
                break;

            case 'deactivate':
                await this.disableSwitcher(settingsAdmin.menuManager.menuSwithcher(menu));
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
                await this.toHaveBackgroundColor(settingsAdmin.menuManager.menuSwithcher(menu) + '//span', 'rgb(215, 218, 221)');
                //assertion
                await this.goto(data.subUrls.frontend.vDashboard.dashboard);
                await this.notToBeVisible((selector.vendor.vDashboard.menus as any)[menuLink]);
                await this.goto((data.subUrls.frontend.vDashboard as any)[menuLink]);
                await this.toBeVisible(settingsAdmin.menuManager.noPermissionNotice);
                break;

            default:
                break;
        }
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

    async cantRenameMenuBeyondLimit(currentMenu: string, newMenu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);

        //rename
        await this.click(settingsAdmin.menuManager.menuEdit(currentMenu));
        await this.clearAndType(settingsAdmin.menuManager.menuNameInput, newMenu);
        await this.toHaveAttribute(settingsAdmin.menuManager.menuNameInput, 'maxlength', '45');
        await this.click(settingsAdmin.menuManager.menuNameConfirm);
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);
        await this.toBeVisible(settingsAdmin.menuManager.menuEdit(newMenu.substring(0, 45)));
        await this.notToBeVisible(settingsAdmin.menuManager.menuEdit(newMenu));
    }

    async cantRenameMenu(menu: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        await this.disableSwitcher(settingsAdmin.menuManager.menuSwithcher(menu));
        await this.notToBeVisible(settingsAdmin.menuManager.menuEdit(menu));
    }

    // dashboard cant be alterd
    async cantAlterMenu(menu: string, isSubmenu?: boolean) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        isSubmenu && (await this.click(settingsAdmin.menuManager.settingsSubMenu));

        await this.hasClass(settingsAdmin.menuManager.menuGrabber(menu), 'not-sortable');
        await this.notToBeVisible(settingsAdmin.menuManager.menuSwithcher(menu));
    }

    // reorderMenu
    async reorderMenu(source: string, target: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
        const initialSourceIndex = await this.getLocatorIndex(settingsAdmin.menuManager.menuParent, settingsAdmin.menuManager.menuGrabber(source));
        const initialTargetIndex = await this.getLocatorIndex(settingsAdmin.menuManager.menuParent, settingsAdmin.menuManager.menuGrabber(target));

        await this.dragToTargetLocator(settingsAdmin.menuManager.menuGrabber(source), settingsAdmin.menuManager.menuGrabber(target));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.menuManager.menuManagerSaveChanges);

        const newSourceIndex = await this.getLocatorIndex(settingsAdmin.menuManager.menuParent, settingsAdmin.menuManager.menuGrabber(source));
        const newTargetIndex = await this.getLocatorIndex(settingsAdmin.menuManager.menuParent, settingsAdmin.menuManager.menuGrabber(target));

        expect(newSourceIndex).toEqual(initialTargetIndex);
        expect(newTargetIndex).toEqual(initialSourceIndex);

        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        const sourceIndexDashboard = await this.getLocatorIndex(selector.vendor.vDashboard.menuParent, selector.vendor.vDashboard.menus.menuByText(source) + '/..');
        const targetIndexDashboard = await this.getLocatorIndex(selector.vendor.vDashboard.menuParent, selector.vendor.vDashboard.menus.menuByText(target) + '/..');

        expect(sourceIndexDashboard).toEqual(newSourceIndex);
        expect(targetIndexDashboard).toEqual(newTargetIndex);
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
