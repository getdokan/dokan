import { BasePage } from '@pages/basePage';

export default class MyAccountAuthPage extends BasePage {
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
