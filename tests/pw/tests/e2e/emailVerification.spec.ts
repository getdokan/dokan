import { test, Page } from '@playwright/test';
import { EmailVerificationsPage } from '@pages/emailVerificationsPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

test.describe('Email verifications test', () => {
    let guest: EmailVerificationsPage;
    let uPage: Page;
    const user = {
        username: data.user.username() + data.user.userDetails.emailDomain,
        password: data.user.password,
    };

    test.beforeAll(async ({ browser }) => {
        const guestContext = await browser.newContext(data.auth.noAuth);
        uPage = await guestContext.newPage();
        guest = new EmailVerificationsPage(uPage);

        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, {
            ...dbData.dokan.emailVerificationSettings,
            enabled: 'on',
        });
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
        await uPage.close();
    });

    test('user can see registration notice (2-step authentication) while registering as customer @pro ', async () => {
        await guest.register(user);
    });

    test('user can see registration notice (2-step authentication) while loggingIn @pro ', async () => {
        await guest.login(user);
    });
});
