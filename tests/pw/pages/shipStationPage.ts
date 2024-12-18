import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsShipStation = selector.vendor.vShipStationSettings;

export class ShipStationPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // enable ShipStation module
    async enableShipStationModule() {
        // vendor dashboard settings menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.toBeVisible(selector.vendor.vDashboard.menus.subMenus.shipStation);
    }

    // disable ShipStation module
    async disableShipStationModule() {
        // vendor dashboard settings menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.notToBeVisible(selector.vendor.vDashboard.menus.subMenus.shipStation);

        // vendor dashboard settings menu page
        await this.goto(data.subUrls.frontend.vDashboard.settingsShipStation);
        await this.notToBeVisible(settingsShipStation.shipStationSettingsDiv);
    }

    // generate shipStation credentials
    async generateShipStationCredentials() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipStation);
        await this.click(settingsShipStation.generateCredentials);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.settingsShipStation, settingsShipStation.confirmGeneration);
        // await this.toBeVisible(settingsShipStation.generateSuccessMessage); //todo: success message is removed

        await this.toBeVisible(settingsShipStation.revokeCredentials);
        await this.multipleElementVisible(settingsShipStation.credentials);
        await this.toBeVisible(settingsShipStation.secretKeyHideWarning);
    }

    // revoke shipStation credentials
    async revokeShipStationCredentials() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipStation);

        await this.click(settingsShipStation.revokeCredentials);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.shipStation, settingsShipStation.confirmRevoke);
        await this.toBeVisible(settingsShipStation.revokeSuccessMessage);

        await this.toBeVisible(settingsShipStation.generateCredentials);
        await this.multipleElementNotVisible(settingsShipStation.credentials);
    }
}
