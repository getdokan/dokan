import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const vendorPrintful = selector.vendor.vPrintfulSettings;

export class PrintfulPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // enable printful module
    async enablePrintfulModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.toBeVisible(selector.admin.dokan.settings.menus.printful);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.toBeVisible(selector.vendor.vDashboard.menus.subMenus.printful);
    }

    // disable printful module
    async disablePrintfulModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.notToBeVisible(selector.admin.dokan.settings.menus.printful);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.notToBeVisible(selector.vendor.vDashboard.menus.subMenus.printful);

        // vendor dashboard settings menu
        await this.goto(data.subUrls.frontend.vDashboard.settingsPrintful);
        await this.notToBeVisible(vendorPrintful.printfulSettingsDiv);
    }

    // printful render properly
    async vendorPrintfulSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPrintful);
        // await this.toBeVisible(vendorPrintful.connectToPrintful); //todo: connect or disconnect
        await this.toBeVisible(vendorPrintful.printfulShipping);
        await this.toBeVisible(vendorPrintful.marketplaceShipping);
    }

    // connect to printful
    async connectPrintful(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPrintful);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.printful, vendorPrintful.connectToPrintful);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsPrintful, vendorPrintful.authorize);
        await this.toBeVisible(vendorPrintful.disconnectToPrintful);
    }

    // disconnect from printful
    async disconnectPrintful(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPrintful);
        await this.click(vendorPrintful.disconnectToPrintful);
        await this.clickAndWaitForResponse(data.subUrls.ajax, vendorPrintful.confirmDisconnect);
        await this.toBeVisible(vendorPrintful.disconnectSuccessMessage);
    }

    // enable shipping
    async enableShipping(shipping: 'printful' | 'marketplace' | 'both'): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPrintful);

        switch (shipping) {
            case 'printful':
                await this.enableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', 'rgb(33, 150, 243)');
                break;

            case 'marketplace':
                await this.disableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', 'rgb(204, 204, 204)');
                await this.enableSwitcherVendorDashboard(vendorPrintful.marketplaceShipping);
                await this.toHaveBackgroundColor(vendorPrintful.marketplaceShipping + '//span', 'rgb(33, 150, 243)');
                break;

            case 'both':
                await this.enableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.enableSwitcherVendorDashboard(vendorPrintful.marketplaceShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', 'rgb(33, 150, 243)');
                await this.toHaveBackgroundColor(vendorPrintful.marketplaceShipping + '//span', 'rgb(33, 150, 243)');
                break;

            default:
                break;
        }
    }
}
