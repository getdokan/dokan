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

    // generate shipStation credentials
    async generateShipStationCredentials() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipStation);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.shipStation, settingsShipStation.generateCredentials, 201);
        await this.toBeVisible(settingsShipStation.generateSuccessMessage);

        await this.toBeVisible(settingsShipStation.revokeCredentials);
        await this.multipleElementVisible(settingsShipStation.credentials);
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