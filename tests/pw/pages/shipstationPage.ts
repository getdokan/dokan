import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsShipStation = selector.vendor.vShipStationSettings;

export class ShipstationPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // generate shipStation credentials
    async generateShipStationCredentials() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.shipstation, settingsShipStation.generateCredentials, 201);
        await this.toBeVisible(settingsShipStation.generateSuccessMessage);

        await this.toBeVisible(settingsShipStation.revokeCredentials);
        await this.multipleElementVisible(settingsShipStation.credentials);
    }

    // revoke shipStation credentials
    async revokeShipStationCredentials() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

        await this.click(settingsShipStation.revokeCredentials);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.shipstation, settingsShipStation.confirmRevoke);
        await this.toBeVisible(settingsShipStation.revokeSuccessMessage);

        await this.toBeVisible(settingsShipStation.generateCredentials);
        await this.multipleElementNotVisible(settingsShipStation.credentials);
    }
}
