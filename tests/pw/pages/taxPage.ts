import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { tax } from '@utils/interfaces';

// selectors
const woocommerceSettings = selector.admin.wooCommerce.settings;

export class TaxPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Tax methods

    // Admin Enable-Disable Tax
    async enableTax(enable = true) {
        await this.goToWooCommerceSettings();
        enable ? await this.check(woocommerceSettings.enableTaxes) : await this.uncheck(woocommerceSettings.enableTaxes);
        await this.click(woocommerceSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, data.tax.saveSuccessMessage);
    }

    // Admin Add Standard Tax Rate
    async addStandardTaxRate(tax: tax) {
        await this.goToWooCommerceSettings();

        // Enable Tax
        await this.enableTax();

        // Set Tax Rate
        await this.click(woocommerceSettings.tax);
        await this.click(woocommerceSettings.standardRates);
        await this.click(woocommerceSettings.insertRow);

        const rowCount = await this.getElementCount(woocommerceSettings.taxTableRow);
        await this.clearAndType(woocommerceSettings.taxRate(rowCount), tax.taxRate);
        await this.clearAndType(woocommerceSettings.priority(rowCount), tax.priority);
        await this.click(woocommerceSettings.taxTable);

        await this.click(woocommerceSettings.taxRateSaveChanges);
        const taxRate = await this.getElementValue(woocommerceSettings.taxRate(rowCount));
        this.toBeEqual(Number(taxRate), Number(tax.taxRate));
    }
}
