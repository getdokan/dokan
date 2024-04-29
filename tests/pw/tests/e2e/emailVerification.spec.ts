import { test, Page } from '@playwright/test';
import { EmailVerificationsPage } from '@pages/emailVerificationsPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

test.describe.skip('Email verifications test', () => {
    let guest: EmailVerificationsPage;
    let gPage: Page;
    const user = { username: data.user.username() + data.user.userDetails.emailDomain, password: data.user.password };

    test.beforeAll(async ({ browser }) => {
        const guestContext = await browser.newContext(data.auth.noAuth);
        gPage = await guestContext.newPage();
        guest = new EmailVerificationsPage(gPage);

        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, { ...dbData.dokan.emailVerificationSettings, enabled: 'on' });
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
        await gPage.close();
    });

    test('user can see registration notice (2-step auth) while registering as customer', { tag: ['@pro', '@guest'] }, async () => {
        await guest.register(user);
    });

    test('user can see registration notice (2-step auth) while loggingIn', { tag: ['@pro', '@guest'] }, async () => {
        await guest.login(user);
    });
});
