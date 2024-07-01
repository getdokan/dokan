import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { modules } from '@utils/interfaces';

// selectors
const modulesAdmin = selector.admin.dokan.modules;

export class ModulesPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // modules

    // modules render properly
    async adminModulesRenderProperly(moduleStats: modules['moduleStats']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);

        // modules text is visible
        await this.toBeVisible(modulesAdmin.pro.moduleText);

        // module plan elements are visible
        await this.multipleElementVisible(modulesAdmin.pro.modulePlan);

        // navTab elements are visible
        await this.multipleElementVisible(modulesAdmin.pro.navTabs);

        // module filter  is visible
        await this.toBeVisible(modulesAdmin.pro.moduleFilter);

        // modules search is visible
        await this.toBeVisible(modulesAdmin.pro.searchBox);

        // modules view mode switcher is visible
        await this.toBeVisible(modulesAdmin.pro.moduleViewMode);

        // module cards and card details are visible
        await this.toHaveCount(modulesAdmin.pro.moduleCard, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleIcon, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleCheckbox, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleName, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleDescription, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleActivationSwitch, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleDocs, moduleStats.totalModules);
        await this.toHaveCount(modulesAdmin.pro.moduleVideos, moduleStats.modulesVideoLink);

        // module category tags are visible
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.productManagement, moduleStats.productManagement);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.integration, moduleStats.integration);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.uiUx, moduleStats.uiUx);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.shipping, moduleStats.shipping);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.storeManagement, moduleStats.storeManagement);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.payment, moduleStats.payment);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.orderManagement, moduleStats.orderManagement);
        await this.toHaveCount(modulesAdmin.pro.moduleCategoryTypes.vendorManagement, moduleStats.vendorManagement);
    }

    // search module
    async searchModule(moduleName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.clickIfVisible(modulesAdmin.pro.clearFilter);
        await this.clearAndType(modulesAdmin.pro.searchBox, moduleName);
        await this.toBeVisible(modulesAdmin.pro.moduleCardByName(moduleName));
    }

    // filter modules
    async filterModules(category: string) {
        await this.goto(data.subUrls.backend.dokan.modules);

        await this.hover(modulesAdmin.pro.moduleFilter);
        await this.click(modulesAdmin.pro.moduleFilterCheckBox(category));
        const numOfModules = await this.countLocator(modulesAdmin.pro.moduleCard);
        const numOfCategoryTag = await this.countLocator(modulesAdmin.pro.moduleCategoryTag(category));
        expect(numOfModules).toBe(numOfCategoryTag);
    }

    // activate deactivate module
    async activateDeactivateModule(moduleName: string) {
        await this.searchModule(moduleName);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.modules, modulesAdmin.pro.moduleActivationSwitch);
    }

    // modules bulk action
    async moduleBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);

        await this.click(modulesAdmin.pro.firstModuleCheckbox);
        await this.click(modulesAdmin.pro.selectAllBulkAction);
        switch (action) {
            case 'activate':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.modules, modulesAdmin.pro.activeAll);
                break;

            case 'deactivate':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.modules, modulesAdmin.pro.deActivateAll);
                break;

            default:
                break;
        }
    }

    // module view layout
    async moduleViewLayout(style: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        const currentStyle = await this.getClassValue(modulesAdmin.pro.currentLayout);
        if (!currentStyle?.includes(style)) {
            await this.click(modulesAdmin.pro.moduleViewMode);
            await this.toHaveClass(modulesAdmin.pro.currentLayout, style);
        }
    }

    // inactive module exists
    async inActiveModuleExists() {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.click(modulesAdmin.pro.navTabs.inActive);
        const noModulesMessage = await this.isVisible(modulesAdmin.pro.noModulesFound);
        if (noModulesMessage) {
            await this.toContainText(modulesAdmin.pro.noModulesFound, data.modules.noModuleMessage);
        } else {
            const inActiveModuleNames = await this.getMultipleElementTexts(modulesAdmin.pro.moduleName);
            throw new Error('Inactive modules: ' + inActiveModuleNames);
        }
    }
}
