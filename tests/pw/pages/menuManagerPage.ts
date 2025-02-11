import { Page, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const menuManager = selector.admin.dokan.settings.menuManager;
const vendorDashboard = selector.vendor.vDashboard;

export class MenuManagerPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // navigation
    async goToMenuManagerSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.menuManager);
    }



    // update menu status
    async updateMenuStatus(menu: string, action: string, menuLink: string) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.settings, { waitUntil: 'networkidle' }, true);
        await this.click(settingsAdmin.menus.menuManager);

        switch (action) {
            case 'activate':
                await this.enableSwitcher(menuManager.menuSwitcher(menu));
                await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(data.subUrls.ajax, settingsAdmin.saveChanges);
                await this.toHaveBackgroundColor(menuManager.menuSwitcher(menu) + '//span', 'rgb(0, 144, 255)');
                //assertion
                await this.goto(data.subUrls.frontend.vDashboard.dashboard);
                await this.toBeVisible((vendorDashboard.menus.primary as any)[menuLink]);
                await this.goto((data.subUrls.frontend.vDashboard as any)[menuLink]);
                await this.notToBeVisible(menuManager.noPermissionNotice);
                break;

            case 'deactivate':
                await this.disableSwitcher(menuManager.menuSwitcher(menu));
                await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(data.subUrls.ajax, settingsAdmin.saveChanges);
                await this.toHaveBackgroundColor(menuManager.menuSwitcher(menu) + '//span', 'rgb(215, 218, 221)');
                //assertion
                await this.goto(data.subUrls.frontend.vDashboard.dashboard);
                await this.notToBeVisible((vendorDashboard.menus.primary as any)[menuLink]);
                await this.goto((data.subUrls.frontend.vDashboard as any)[menuLink]);
                await this.toBeVisible(menuManager.noPermissionNotice);
                break;

            default:
                break;
        }
    }

    // rename menu
    async renameMenu(currentMenu: string, newMenu: string) {
        await this.goToMenuManagerSettings();

        //rename
        await this.click(menuManager.menuEdit(currentMenu));
        await this.clearAndType(menuManager.menuNameInput, newMenu);
        await this.click(menuManager.menuNameConfirm);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await this.toBeVisible(menuManager.menuEdit(newMenu));

        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.toBeVisible(vendorDashboard.menus.menuByText(newMenu));
    }

    async cantRenameMenuBeyondLimit(currentMenu: string, newMenu: string) {
        await this.goToMenuManagerSettings();

        //rename
        await this.click(menuManager.menuEdit(currentMenu));
        await this.clearAndType(menuManager.menuNameInput, newMenu);
        await this.toHaveAttribute(menuManager.menuNameInput, 'maxlength', '45');
        await this.click(menuManager.menuNameConfirm);
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, menuManager.menuManagerSaveChanges);
        await this.toBeVisible(menuManager.menuEdit(newMenu.substring(0, 45)));
        await this.notToBeVisible(menuManager.menuEdit(newMenu));
    }

    async cantRenameMenu(menu: string) {
        await this.goToMenuManagerSettings();
        await this.disableSwitcher(menuManager.menuSwitcher(menu));
        await this.notToBeVisible(menuManager.menuEdit(menu));
    }

    // dashboard cant be altered
    async cantAlterMenu(menu: string, isSubmenu?: boolean) {
        await this.goToMenuManagerSettings();
        if (isSubmenu) await this.click(menuManager.settingsSubMenu);

        await this.hasClass(menuManager.menuGrabber(menu), 'not-sortable');
        await this.notToBeVisible(menuManager.menuSwitcher(menu));
    }

    // reorderMenu
    async reorderMenu(source: string, target: string) {
        await this.goToMenuManagerSettings();
        const initialSourceIndex = await this.getLocatorIndex(menuManager.menuParent, menuManager.menuGrabber(source));
        const initialTargetIndex = await this.getLocatorIndex(menuManager.menuParent, menuManager.menuGrabber(target));

        await this.dragToTargetLocator(menuManager.menuGrabber(source), menuManager.menuGrabber(target));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);

        const newSourceIndex = await this.getLocatorIndex(menuManager.menuParent, menuManager.menuGrabber(source));
        const newTargetIndex = await this.getLocatorIndex(menuManager.menuParent, menuManager.menuGrabber(target));

        expect(newSourceIndex).toEqual(initialTargetIndex);
        expect(newTargetIndex).toEqual(initialSourceIndex);

        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        const sourceIndexDashboard = await this.getLocatorIndex(vendorDashboard.menuParent, vendorDashboard.menus.menuByText(source) + '/..');
        const targetIndexDashboard = await this.getLocatorIndex(vendorDashboard.menuParent, vendorDashboard.menus.menuByText(target) + '/..');

        expect(sourceIndexDashboard).toEqual(newSourceIndex);
        expect(targetIndexDashboard).toEqual(newTargetIndex);
    }

    // reset menu manager settings
    async resetMenuManagerSettings(menu: string) {
        await this.goToMenuManagerSettings();

        // reset
        await this.click(menuManager.resetAll);
        await this.click(menuManager.confirmReset);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);

        await this.toHaveBackgroundColor(menuManager.menuSwitcher(menu) + '//span', 'rgb(0, 144, 255)');
    }
}
