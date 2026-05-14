import { test, Page } from '@utils/test';
import { EmailVerificationsPage, db, dbOptionName, emailVerificationSettings, userData } from './emailVerificationPage';

// ============================================
// NO-AUTH GUEST CONTEXT (empty storage)
// ============================================
const noAuth = { storageState: { cookies: [], origins: [] } };

test.describe('Email verifications test', () => {
    let guest: EmailVerificationsPage;
    let gPage: Page;
    const user: { username: string; password: string } = {
        username: userData.username() + userData.emailDomain,
        password: userData.password,
    };

    test.beforeAll(async ({ browser }) => {
        const guestContext = await browser.newContext(noAuth);
        gPage = await guestContext.newPage();
        guest = new EmailVerificationsPage(gPage);

        await db.setOptionValue(dbOptionName, { ...emailVerificationSettings, enabled: 'on' });
    });

    test.afterAll(async () => {
        await db.setOptionValue(dbOptionName, emailVerificationSettings);
        await gPage?.close();
        await db.dispose();
    });

    test('user can see registration notice (2-step auth) while registering as customer', { tag: ['@pro', '@guest'] }, async () => {
        await test.step('Navigate to My Account page', async () => {
            await guest.navigateToMyAccount();
        });

        await test.step('Fill registration form', async () => {
            await guest.fillRegistrationEmail(user.username);
            await guest.fillRegistrationPassword(user.password);
            await guest.selectRegisterAsCustomer();
        });

        await test.step('Submit registration', async () => {
            await guest.clickRegisterButton();
        });

        await test.step('Verify email verification notice is displayed', async () => {
            await guest.verifyRegistrationEmailVerificationNotice();
        });
    });

    test('user can see registration notice (2-step auth) while loggingIn', { tag: ['@pro', '@guest'] }, async () => {
        const loginUser = {
            username: userData.username() + userData.emailDomain,
            password: userData.password,
        };

        await test.step('Register user first (prerequisite)', async () => {
            await guest.registerWithoutVerification(loginUser);
        });

        await test.step('Navigate to My Account page', async () => {
            await guest.navigateToMyAccount();
        });

        await test.step('Fill login form', async () => {
            await guest.fillLoginUsername(loginUser.username);
            await guest.fillLoginPassword(loginUser.password);
        });

        await test.step('Submit login', async () => {
            await guest.clickLoginButton();
        });

        await test.step('Verify email verification notice is displayed', async () => {
            await guest.verifyLoginEmailVerificationNotice();
        });
    });

    test('user registration process with field validation', { tag: ['@pro', '@guest'] }, async () => {
        const testUser = {
            username: userData.username() + userData.emailDomain,
            password: userData.password,
        };

        await test.step('Navigate to My Account page', async () => {
            await guest.navigateToMyAccount();
        });

        await test.step('Fill and validate email field', async () => {
            await guest.fillRegistrationEmail(testUser.username);
            await guest.validateRegistrationEmailField(testUser.username);
        });

        await test.step('Fill and validate password field', async () => {
            await guest.fillRegistrationPassword(testUser.password);
            await guest.validateRegistrationPasswordField(testUser.password);
        });

        await test.step('Select and validate customer registration option', async () => {
            await guest.selectRegisterAsCustomer();
            await guest.validateRegisterAsCustomerSelected();
        });

        await test.step('Submit registration', async () => {
            await guest.clickRegisterButton();
        });

        await test.step('Verify email verification notice is displayed', async () => {
            await guest.verifyRegistrationEmailVerificationNotice();
        });
    });

    test('user login process with field validation', { tag: ['@pro', '@guest'] }, async () => {
        const testUser = {
            username: userData.username() + userData.emailDomain,
            password: userData.password,
        };

        await test.step('Register user first (prerequisite)', async () => {
            await guest.registerWithoutVerification(testUser);
        });

        await test.step('Navigate to My Account page', async () => {
            await guest.navigateToMyAccount();
        });

        await test.step('Fill and validate username field', async () => {
            await guest.fillLoginUsername(testUser.username);
            await guest.validateLoginUsernameField(testUser.username);
        });

        await test.step('Fill and validate password field', async () => {
            await guest.fillLoginPassword(testUser.password);
            await guest.validateLoginPasswordField(testUser.password);
        });

        await test.step('Submit login', async () => {
            await guest.clickLoginButton();
        });

        await test.step('Verify email verification notice is displayed', async () => {
            await guest.verifyLoginEmailVerificationNotice();
        });
    });
});
