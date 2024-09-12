import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class DokanModulesPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    searchInputField() {
        return this.page.locator('//div[@class="search-box"]/input');
    }

    moduleTitle() {
        return this.page.locator(`//div[@class="module-details"]/h3/a`);
    }

    moduleToggleField(moduleName: string) {
        return this.page.locator(`//div[@class="module-details"]/h3/a[contains(text(), "${moduleName}")]/../../following-sibling::div/div[2]/label`);
    }

    activeModuleTab() {
        return this.page.locator(`//div[@class="module-filter-left"]/ul/li[2]/a`);
    }

    async searchFor(searchTerm: string) {
        await this.searchInputField().fill(searchTerm);
    }

    async clickOnModuleToggleButton(moduleName: string) {
        await this.moduleToggleField(moduleName).click();
    }

    async clickOnActiveModulesTab() {
        await this.activeModuleTab().click();
    }
}
