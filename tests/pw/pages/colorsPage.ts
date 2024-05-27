import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { paletteValues } from '@utils/interfaces';

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const settingsVendor = selector.vendor.vStoreSettings;
const dashboardVendor = selector.vendor.vDashboard;

export class ColorsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // add color palette
    async addColorPalette(paletteName: string, paletteValues: paletteValues, paletteChoice: string = 'predefined') {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.colors);

        // Colors Settings
        if (paletteChoice === 'predefined') {
            await this.click(settingsAdmin.colors.predefineColorPalette);
            await this.click(settingsAdmin.colors.predefinedPalette(paletteName));
        } else {
            // todo: add custom color palette
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.colors.colorsSaveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.colors.saveSuccessMessage);

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        // asertions

        // convert hex to rgb
        Object.keys(paletteValues).forEach(key => {
            paletteValues[key as keyof paletteValues] = helpers.hexToRgb(paletteValues[key as keyof paletteValues]);
        });

        // button color
        const beforHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // hovered button color
        await this.hover(settingsVendor.updateSettingsTop);
        const afterHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // sidebar color
        const dashboardSidebarMenuText = await this.getElementColor(dashboardVendor.menus.dashboard);
        const dashboardSidebarBackground = await this.getElementBackgroundColor(dashboardVendor.menus.menus);
        const dashboardSidebarActiveMenuBackground = await this.getElementBackgroundColor(dashboardVendor.menus.activeMenu);
        const dashboardSidebarActiveHoverMenuText = await this.getElementColor(dashboardVendor.menus.settings);

        expect(beforHover.color).toEqual(paletteValues.buttonText);
        expect(beforHover.backgroundColor).toEqual(paletteValues.buttonBackground);
        expect(beforHover.borderColor).toEqual(paletteValues.buttonBorder);
        expect(afterHover.color).toEqual(paletteValues.buttonHoverText);
        expect(afterHover.backgroundColor).toEqual(paletteValues.buttonHoverBackground);
        expect(afterHover.borderColor).toEqual(paletteValues.buttonHoverBorder);
        expect(dashboardSidebarMenuText).toEqual(paletteValues.dashboardSidebarMenuText);
        expect(dashboardSidebarBackground).toEqual(paletteValues.dashboardSidebarBackground);
        expect(dashboardSidebarActiveHoverMenuText).toEqual(paletteValues.dashboardSidebarActiveMenuText);
        expect(dashboardSidebarActiveMenuBackground).toEqual(paletteValues.dashboardSidebarActiveMenuBackground);
    }

    // add custom color palette
    async addCustomColorPalette() {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.colors);

        // Colors Settings

        // if (colors.paletteChoice === 'pre-defined') {
        await this.click(settingsAdmin.colors.customColorPalette);
        await this.click(settingsAdmin.colors.openColorPicker('Button Text'));
        const root = this.getElement(settingsAdmin.colors.colorInput);
        // await this.fillLocator(settingsAdmin.colors.colorInput, '#88FF00');
        // await this.click(settingsAdmin.colors.saveColor);
        // }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.colors.colorsSaveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.colors.saveSuccessMessage);
    }
}
