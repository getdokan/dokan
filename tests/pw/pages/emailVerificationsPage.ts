import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class EmailVerificationsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // ===========================================
    // NAVIGATION METHODS
    // ===========================================
    
    /**
     * Navigate to My Account page if not already there
     */
    async navigateToMyAccount(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
    }

    // ===========================================
    // REGISTRATION FORM ACTIONS
    // ===========================================
    
    /**
     * Fill registration email field
     */
    async fillRegistrationEmail(email: string): Promise<void> {
        await this.clearAndType(selector.customer.cRegistration.regEmail, email);
    }

    /**
     * Fill registration password field
     */
    async fillRegistrationPassword(password: string): Promise<void> {
        await this.clearAndType(selector.customer.cRegistration.regPassword, password);
    }

    /**
     * Select "Register as Customer" option
     */
    async selectRegisterAsCustomer(): Promise<void> {
        await this.click(selector.customer.cRegistration.regAsCustomer);
    }

    /**
     * Click Register button and wait for response
     */
    async clickRegisterButton(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(
            data.subUrls.frontend.myAccount, 
            selector.customer.cRegistration.register, 
            302
        );
    }

    /**
     * Click Register button without waiting for redirect (for error scenarios)
     */
    async clickRegisterButtonWithoutWaiting(): Promise<void> {
        await this.click(selector.customer.cRegistration.register);
        // Wait a moment for any validation to process
        await this.page.waitForTimeout(1000);
    }

    // ===========================================
    // REGISTRATION FORM VALIDATIONS
    // ===========================================
    
    /**
     * Validate that registration email field contains expected value
     */
    async validateRegistrationEmailField(expectedEmail: string): Promise<void> {
        await this.toHaveValue(selector.customer.cRegistration.regEmail, expectedEmail);
    }

    /**
     * Validate that registration password field contains expected value
     */
    async validateRegistrationPasswordField(expectedPassword: string): Promise<void> {
        await this.toHaveValue(selector.customer.cRegistration.regPassword, expectedPassword);
    }

    /**
     * Validate that "Register as Customer" option is selected
     */
    async validateRegisterAsCustomerSelected(): Promise<void> {
        await this.toBeChecked(selector.customer.cRegistration.regAsCustomer);
    }

    // ===========================================
    // LOGIN FORM ACTIONS
    // ===========================================
    
    /**
     * Fill login username/email field
     */
    async fillLoginUsername(username: string): Promise<void> {
        await this.clearAndType(selector.frontend.username, username);
    }

    /**
     * Fill login password field
     */
    async fillLoginPassword(password: string): Promise<void> {
        await this.clearAndType(selector.frontend.userPassword, password);
    }

    /**
     * Click Login button and wait for response
     */
    async clickLoginButton(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(
            data.subUrls.frontend.myAccount, 
            selector.frontend.logIn, 
            302
        );
    }

    // ===========================================
    // LOGIN FORM VALIDATIONS
    // ===========================================
    
    /**
     * Validate that login username field contains expected value
     */
    async validateLoginUsernameField(expectedUsername: string): Promise<void> {
        await this.toHaveValue(selector.frontend.username, expectedUsername);
    }

    /**
     * Validate that login password field contains expected value
     */
    async validateLoginPasswordField(expectedPassword: string): Promise<void> {
        await this.toHaveValue(selector.frontend.userPassword, expectedPassword);
    }

    // ===========================================
    // VERIFICATION AND ASSERTIONS
    // ===========================================
    
    /**
     * Verify email verification notice appears after registration
     */
    async verifyRegistrationEmailVerificationNotice(): Promise<void> {
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(
            selector.customer.cWooSelector.wooCommerceSuccessMessage, 
            data.dokanSettings.emailVerification.loginNotice
        );
    }

    /**
     * Verify email verification notice appears after login
     */
    async verifyLoginEmailVerificationNotice(): Promise<void> {
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(
            selector.customer.cWooSelector.wooCommerceSuccessMessage, 
            data.dokanSettings.emailVerification.loginNotice
        );
    }

    /**
     * Verify that no success message appears (for error scenarios)
     */
    async verifyNoSuccessMessage(): Promise<void> {
        await this.notToBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
    }

    // ===========================================
    // COMPOSITE METHODS (Legacy Support)
    // ===========================================
    
    /**
     * Complete registration flow with email verification
     * @deprecated Use test.step() approach for better reporting
     */
    async register(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillRegistrationEmail(user.username);
        await this.fillRegistrationPassword(user.password);
        await this.selectRegisterAsCustomer();
        await this.clickRegisterButton();
        await this.verifyRegistrationEmailVerificationNotice();
    }

    /**
     * Complete login flow with email verification
     * @deprecated Use test.step() approach for better reporting
     */
    async login(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillLoginUsername(user.username);
        await this.fillLoginPassword(user.password);
        await this.clickLoginButton();
        await this.verifyLoginEmailVerificationNotice();
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================
    
    /**
     * Complete registration without verification check
     * Useful for setup in login tests
     */
    async registerWithoutVerification(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillRegistrationEmail(user.username);
        await this.fillRegistrationPassword(user.password);
        await this.selectRegisterAsCustomer();
        await this.clickRegisterButton();
    }

    /**
     * Fill complete registration form without submitting
     * Useful for form validation tests
     */
    async fillRegistrationForm(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillRegistrationEmail(user.username);
        await this.fillRegistrationPassword(user.password);
        await this.selectRegisterAsCustomer();
    }

    /**
     * Fill complete login form without submitting
     * Useful for form validation tests
     */
    async fillLoginForm(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillLoginUsername(user.username);
        await this.fillLoginPassword(user.password);
    }
}
