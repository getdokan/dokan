import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class EditProductPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    publishButton() {
        return this.page.locator('#publish');
    }

    async clickOnPublishButton() {
        await this.publishButton().click();
    }
}
