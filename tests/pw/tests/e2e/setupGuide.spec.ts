import { expect, test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { data } from '@utils/testData';
import { AdminDashboardPage } from '@pages/adminDashboardPage';

test('should redirect all the header items from the help menu', async ({page, context}) => {
    let loginPage;
    let adminDashboardPage;

    // Login before each test in this describe block
    loginPage = new LoginPage(page);
    adminDashboardPage = new AdminDashboardPage(page);

    await loginPage.adminLogin(data.admin);
    await adminDashboardPage.adminDashboardRenderProperly();

    // Load the setup guide page.
    const setupGuideBtn = page.locator('[data-test-id="admin-setup-guide-button"] button');
    if (await setupGuideBtn.isVisible()) {
        await setupGuideBtn.click();
    }

    const menuItems = [
        {
            name: 'What\'s New',
            url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/changelog'
        },
        {
            name: 'Get Support',
            url: 'https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite'
        },
        {
            name: 'Community',
            url: 'https://www.facebook.com/groups/dokanMultivendor'
        },
        {
            name: 'Documentation',
            url: 'https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
            redirectTo: 'https://dokan.co/docs/wordpress/getting-started/?utm_campaign=dokan-lite&utm_medium=wp-admin&utm_source=plugin'
        },
        {
            name: 'FAQ',
            url: 'https://dokan.co/wordpress/faq/'
        },
        {
            name: 'Basic & Fundamental',
            url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/help'
        },
        {
            name: 'Request a Feature',
            url: 'https://wedevs.com/account/dokan-feature-requests/'
        },
        {
            name: 'Import dummy data',
            url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/dummy-data'
        }
    ];

    await page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"] button').hover();
    for (const item of menuItems) {
        const helpMenuItem = page
            .locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
            .getByRole('link', {name: item.name});

        await expect(helpMenuItem).toBeVisible();
    }

    for (const item of menuItems) {
        const menuItem = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
            .getByRole('link', {name: item.name});

        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            await menuItem.click({button: 'middle'})
        ]);
        await expect(newPage).toHaveURL(item.redirectTo ?? item.url, {timeout: 90000});
    }
});


test.describe('Setup guide functionality test', () => {
    let loginPage;
    // let setupGuidePage;
    let adminDashboardPage;

    test.beforeEach(async ({ page }) => {
        // Login before each test in this describe block
        loginPage = new LoginPage(page);
        // setupGuidePage = new SetupGuidePage(page);
        adminDashboardPage = new AdminDashboardPage(page);

        await loginPage.adminLogin(data.admin);
        await adminDashboardPage.adminDashboardRenderProperly();

        // Load the setup guide page.
        const setupGuideBtn = page.locator('[data-test-id="admin-setup-guide-button"] button');
        if ( await setupGuideBtn.isVisible() ) {
            await setupGuideBtn.click();
        }
    });

    test('should redirect all the header items from the help menu', async ({page, context}) => {
        let loginPage;
        let adminDashboardPage;

        // Login before each test in this describe block
        loginPage = new LoginPage(page);
        adminDashboardPage = new AdminDashboardPage(page);

        await loginPage.adminLogin(data.admin);
        await adminDashboardPage.adminDashboardRenderProperly();

        // Load the setup guide page.
        const setupGuideBtn = page.locator('[data-test-id="admin-setup-guide-button"] button');
        if (await setupGuideBtn.isVisible()) {
            await setupGuideBtn.click();
        }

        const menuItems = [
            {
                name: 'What\'s New',
                url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/changelog'
            },
            {
                name: 'Get Support',
                url: 'https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite'
            },
            {
                name: 'Community',
                url: 'https://www.facebook.com/groups/dokanMultivendor'
            },
            {
                name: 'Documentation',
                url: 'https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
                redirectTo: 'https://dokan.co/docs/wordpress/getting-started/?utm_campaign=dokan-lite&utm_medium=wp-admin&utm_source=plugin'
            },
            {
                name: 'FAQ',
                url: 'https://dokan.co/wordpress/faq/'
            },
            {
                name: 'Basic & Fundamental',
                url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/help'
            },
            {
                name: 'Request a Feature',
                url: 'https://wedevs.com/account/dokan-feature-requests/'
            },
            {
                name: 'Run Setup Wizard',
                url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan-setup'
            },
            {
                name: 'Import dummy data',
                url: data.installWp.siteInfo.url + '/wp-admin/admin.php?page=dokan#/dummy-data'
            }
        ];

        await page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"] button').hover();
        for (const item of menuItems) {
            const helpMenuItem = page
                .locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
                .getByRole('link', {name: item.name});

            await expect(helpMenuItem).toBeVisible();
        }

        for (const item of menuItems) {
            const menuItem = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
                .getByRole('link', {name: item.name});

            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                await menuItem.click({button: 'middle'})
            ]);
            await expect(newPage).toHaveURL(item.redirectTo ?? item.url, {timeout: 90000});
        }
    });
});
