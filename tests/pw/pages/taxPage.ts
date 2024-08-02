import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { tax } from '@utils/interfaces';

// selectors
const woocommerceSettings = selector.admin.wooCommerce.settings;
const generalSettings = selector.admin.wooCommerce.settings.general;
const taxSettings = selector.admin.wooCommerce.settings.tax;

export class TaxPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    async goToTaxSettings() {
        await this.goIfNotThere(data.subUrls.backend.wc.taxSettings);
    }

    // admin enable disable tax
    async enableTax(enable = true) {
        await this.goToWooCommerceSettings();
        enable ? await this.check(generalSettings.enableTaxes) : await this.uncheck(woocommerceSettings.general.enableTaxes);
        await this.click(generalSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, data.tax.saveSuccessMessage);
    }

    // admin add standard tax rate
    async addStandardTaxRate(tax: tax) {
        await this.goToTaxSettings();

        // set tax rate
        await this.click(taxSettings.standardRates);
        await this.click(taxSettings.insertRow);

        const rowCount = await this.getElementCount(taxSettings.taxTableRow);
        await this.clearAndType(taxSettings.taxRate(rowCount), tax.taxRate);
        await this.clearAndType(taxSettings.priority(rowCount), tax.priority);
        await this.click(taxSettings.taxTable);

        await this.click(taxSettings.taxRateSaveChanges);
        const taxRate = await this.getElementValue(taxSettings.taxRate(rowCount));
        this.toBeEqual(Number(taxRate), Number(tax.taxRate));
    }
}
