import { BasePage } from '@pages/basePage';

export default class EditProductPage extends BasePage {
    publishButton() {
        return this.page.locator('#publish');
    }

    async clickOnPublishButton() {
        await this.publishButton().click();
    }
}
