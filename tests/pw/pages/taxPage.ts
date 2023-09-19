import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { tax } from '@utils/interfaces';

export class TaxPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Tax methods

    // Admin Enable-Disable Tax
    async enableTax(enable = true) {
        await this.goToWooCommerceSettings();
        enable ? await this.check(selector.admin.wooCommerce.settings.enableTaxes) : await this.uncheck(selector.admin.wooCommerce.settings.enableTaxes);
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges);
        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, data.tax.saveSuccessMessage);
    }

    // Admin Add Standard Tax Rate
    async addStandardTaxRate(tax: tax) {
        await this.goToWooCommerceSettings();

        // Enable Tax
        await this.enableTax();

        // Set Tax Rate
        await this.click(selector.admin.wooCommerce.settings.tax);
        await this.click(selector.admin.wooCommerce.settings.standardRates);
        const taxIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.taxRate);
        if (!taxIsVisible) {
            await this.click(selector.admin.wooCommerce.settings.insertRow);
        }
        await this.clearAndType(selector.admin.wooCommerce.settings.taxRate, tax.taxRate);
        await this.click(selector.admin.wooCommerce.settings.taxTable);

        await this.click(selector.admin.wooCommerce.settings.taxRateSaveChanges);

        const newTaxRate = await this.getElementValue(selector.admin.wooCommerce.settings.taxRate);
        // expect(newTaxRate).toBe(String(Number(tax.taxRate).toPrecision(5)))
        expect(newTaxRate).toBe(tax.taxRate);
    }
}
