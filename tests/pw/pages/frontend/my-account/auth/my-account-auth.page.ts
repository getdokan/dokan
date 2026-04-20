import { BasePage } from '@pages/basePage';

export default class MyAccountAuthPage extends BasePage {
    async enterUsername(username: string) {
        await this.page.locator('#username').fill(username);
    }

    async enterPassword(password: string) {
        await this.page.locator('#password').fill(password);
    }

    async clickOnLoginButton() {
        await this.page.locator('//button[@name="login"]').click();
    }
}
