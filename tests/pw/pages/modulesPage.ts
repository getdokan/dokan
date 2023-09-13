import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class ModulesPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // modules

    // modules render properly
    async adminModulesRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);

        // modules text is visible
        await this.toBeVisible(selector.admin.dokan.modules.pro.moduleText);

        // module plan elements are visible
        await this.multipleElementVisible(
            selector.admin.dokan.modules.pro.modulePlan,
        );

        // navTab elements are visible
        await this.multipleElementVisible(
            selector.admin.dokan.modules.pro.navTabs,
        );

        // module filter  is visible
        await this.toBeVisible(selector.admin.dokan.modules.pro.moduleFilter);

        // modules search is visible
        await this.toBeVisible(selector.admin.dokan.modules.pro.searchBox);

        // modules view mode switcher is visible
        await this.toBeVisible(selector.admin.dokan.modules.pro.moduleViewMode);

        // module cards and card details are visible
        await this.toHaveCount(selector.admin.dokan.modules.pro.moduleCard, 39);
        await this.toHaveCount(selector.admin.dokan.modules.pro.moduleIcon, 39);
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCheckbox,
            39,
        );
        await this.toHaveCount(selector.admin.dokan.modules.pro.moduleName, 39);
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleDescription,
            39,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleActivationSwitch,
            39,
        );
        await this.toHaveCount(selector.admin.dokan.modules.pro.moduleDocs, 38);
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleVideos,
            17,
        );

        // module category tags are visible
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes
                .productManagement,
            13,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes.integration,
            6,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes.uiUx,
            2,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes.shipping,
            3,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes
                .storeManagement,
            10,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes.payment,
            7,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes
                .orderManagement,
            2,
        );
        await this.toHaveCount(
            selector.admin.dokan.modules.pro.moduleCategoryTypes
                .vendorManagement,
            1,
        );
    }

    // search module
    async searchModule(moduleName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.clickIfVisible(selector.admin.dokan.modules.pro.clearFilter);
        await this.clearAndType(
            selector.admin.dokan.modules.pro.searchBox,
            moduleName,
        );
        await this.toBeVisible(
            selector.admin.dokan.modules.pro.moduleCardByName(moduleName),
        );
    }

    // filter modules
    async filterModules(category: string) {
        await this.goto(data.subUrls.backend.dokan.modules);

        await this.hover(selector.admin.dokan.modules.pro.moduleFilter);
        await this.click(
            selector.admin.dokan.modules.pro.moduleFilterCheckBox(category),
        );
        const numOfModules = await this.countLocator(
            selector.admin.dokan.modules.pro.moduleCard,
        );
        const numOfCategoryTag = await this.countLocator(
            selector.admin.dokan.modules.pro.moduleCategoryTag(category),
        );
        expect(numOfModules).toBe(numOfCategoryTag);
    }

    // activate deactivate module
    async activateDeactivateModule(moduleName: string) {
        await this.searchModule(moduleName);
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.modules,
            selector.admin.dokan.modules.pro.moduleActivationSwitch,
        );
    }

    // modules bulk action
    async moduleBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);

        await this.click(selector.admin.dokan.modules.pro.firstModuleCheckbox);
        await this.click(selector.admin.dokan.modules.pro.selectAllBulkAction);
        switch (action) {
            case 'activate':
                await this.clickAndWaitForResponse(
                    data.subUrls.api.dokan.modules,
                    selector.admin.dokan.modules.pro.activeAll,
                );
                break;

            case 'deactivate':
                await this.clickAndWaitForResponse(
                    data.subUrls.api.dokan.modules,
                    selector.admin.dokan.modules.pro.deActivateAll,
                );
                break;

            default:
                break;
        }
    }

    // module view layout
    async moduleViewLayout(style: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        const currentStyle = await this.getClassValue(
            selector.admin.dokan.modules.pro.currentLayout,
        );
        if (!currentStyle?.includes(style)) {
            await this.click(selector.admin.dokan.modules.pro.moduleViewMode);
            await this.toHaveClass(
                selector.admin.dokan.modules.pro.currentLayout,
                style,
            );
        }
    }

    // inactive module exists
    async inActiveModuleExists() {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.click(selector.admin.dokan.modules.pro.navTabs.inActive);
        const noModulesMessage = await this.isVisible(
            selector.admin.dokan.modules.pro.noModulesFound,
        );
        if (noModulesMessage) {
            await this.toContainText(
                selector.admin.dokan.modules.pro.noModulesFound,
                data.modules.noModuleMessage,
            );
        } else {
            const inActiveModuleNames = await this.getMultipleElementTexts(
                selector.admin.dokan.modules.pro.moduleName,
            );
            throw new Error('Inactive modules: ' + inActiveModuleNames);
        }
    }
}
