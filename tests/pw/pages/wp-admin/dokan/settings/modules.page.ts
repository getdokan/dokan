import { BasePage } from '@pages/basePage';

export default class DokanModulesPage extends BasePage {
    moduleTitle() {
        return this.page.locator(`//div[@class="module-details"]/h3/a`);
    }

    async searchFor(searchTerm: string) {
        await this.page.locator('//div[@class="search-box"]/input').fill(searchTerm);
    }

    async clickOnModuleToggleButton(moduleName: string) {
        await this.page.locator(`//div[@class="module-details"]/h3/a[contains(text(), "${moduleName}")]/../../following-sibling::div/div[2]/label`).click();
    }

    async clickOnActiveModulesTab() {
        await this.page.locator(`//div[@class="module-filter-left"]/ul/li[2]/a`).click();
    }
}
