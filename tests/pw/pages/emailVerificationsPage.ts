import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class EmailVerificationsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async register(user: { username: string; password: string }): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);

        await this.clearAndType(selector.customer.cRegistration.regEmail, user.username);
        await this.clearAndType(selector.customer.cRegistration.regPassword, user.password);
        await this.click(selector.customer.cRegistration.regAsCustomer);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, selector.customer.cRegistration.register, 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.dokanSettings.emailVerification.loginNotice);
    }

    async login(user: { username: string; password: string }): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);

        await this.clearAndType(selector.frontend.username, user.username);
        await this.clearAndType(selector.frontend.userPassword, user.password);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, selector.frontend.logIn, 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.dokanSettings.emailVerification.loginNotice);
    }
}
