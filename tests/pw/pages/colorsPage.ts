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
            const fieldNames = {
                buttonText: 'Button Text',
                buttonBackground: 'Button Background',
                buttonBorder: 'Button Border',
                buttonHoverText: 'Button Hover Text',
                buttonHoverBackground: 'Button Hover Background',
                buttonHoverBorder: 'Button Hover Border',
                dashboardSidebarMenuText: 'Dashboard Sidebar Menu Text',
                dashboardSidebarBackground: 'Dashboard Sidebar Background',
                dashboardSidebarActiveMenuText: 'Dashboard Sidebar Active/Hover Menu Text',
                dashboardSidebarActiveMenuBackground: 'Dashboard Sidebar Active Menu Background',
            };

            await this.click(settingsAdmin.colors.customColorPalette);

            for (const key of Object.keys(paletteValues)) {
                await this.click(settingsAdmin.colors.openColorPicker(fieldNames[key as keyof paletteValues]));
                await this.clearAndType(settingsAdmin.colors.colorInput, paletteValues[key as keyof paletteValues]);
                await this.click(settingsAdmin.colors.saveColor);
            }
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.colors.saveSuccessMessage);

        // convert hex to rgb
        Object.keys(paletteValues).forEach(key => {
            paletteValues[key as keyof paletteValues] = helpers.hexToRgb(paletteValues[key as keyof paletteValues]);
        });

        // assertions
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore, 'networkidle');

        // assertions

        // button color
        const beforeHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // hovered button color
        await this.addAttributeValue(settingsVendor.updateSettingsTop, 'class', 'active');
        const afterHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // sidebar color
        const dashboardSidebarMenuText = await this.getElementColor(dashboardVendor.menus.primary.dashboard);
        const dashboardSidebarBackground = await this.getElementBackgroundColor(dashboardVendor.menus.menus);
        const dashboardSidebarActiveMenuBackground = await this.getElementBackgroundColor(dashboardVendor.menus.activeMenu);
        const dashboardSidebarActiveHoverMenuText = await this.getElementColor(dashboardVendor.menus.primary.settings);

        expect(beforeHover.color).toEqual(paletteValues.buttonText);
        expect(beforeHover.backgroundColor).toEqual(paletteValues.buttonBackground);
        expect(beforeHover.borderColor).toEqual(paletteValues.buttonBorder);
        expect(afterHover.color).toEqual(paletteValues.buttonHoverText);
        expect(afterHover.backgroundColor).toEqual(paletteValues.buttonHoverBackground);
        expect(afterHover.borderColor).toEqual(paletteValues.buttonHoverBorder);
        expect(dashboardSidebarMenuText).toEqual(paletteValues.dashboardSidebarMenuText);
        expect(dashboardSidebarBackground).toEqual(paletteValues.dashboardSidebarBackground);
        expect(dashboardSidebarActiveHoverMenuText).toEqual(paletteValues.dashboardSidebarActiveMenuText);
        expect(dashboardSidebarActiveMenuBackground).toEqual(paletteValues.dashboardSidebarActiveMenuBackground);
    }
}
