import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsVendor = selector.vendor.vStoreSettings;

export class SellerVacationPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // seller vacation

    // enable seller vacation module
    async enableSellerVacationModule() {
        // vendor dashboard settings 
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await this.toBeVisible(settingsVendor.vacation.vacationDiv);
    }

    // disable seller vacation module
    async disableSellerVacationModule() {
        // vendor dashboard settings
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await this.notToBeVisible(settingsVendor.vacation.vacationDiv);
    }
}
