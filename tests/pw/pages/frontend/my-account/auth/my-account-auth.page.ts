import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class MyAccountAuthPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    usernameInputField() {
        return this.page.locator('#username');
    }

    passwordInputField() {
        return this.page.locator('#password');
    }

    loginButton() {
        return this.page.locator('//button[@name="login"]');
    }

    async enterUsername(username: string) {
        await this.usernameInputField().fill(username);
    }

    async enterPassword(password: string) {
        await this.passwordInputField().fill(password);
    }

    async clickOnLoginButton() {
        await this.loginButton().click();
    }
}
