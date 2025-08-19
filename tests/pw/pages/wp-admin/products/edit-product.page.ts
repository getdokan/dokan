import { BasePage } from '@pages/basePage';

export default class EditProductPage extends BasePage {
    async clickOnPublishButton() {
        await this.page.locator('#publish').click();
    }
}
