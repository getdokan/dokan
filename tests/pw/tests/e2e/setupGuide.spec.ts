import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { data } from '@utils/testData';
import { AdminDashboardPage } from '@pages/adminDashboardPage';

test('admin can login', { tag: ['@lite', '@admin'] }, async ({ page }) => {
    const loginPage = new LoginPage( page );
    await loginPage.adminLogin( data.admin );
    // Add verification that login was successful.
    await expect( page ).toHaveURL( /wp-admin/ );
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

    test('should redirect all the header items from the help menu', async ({ page, context }) => {
        const menuItems = [
            {
                name: 'What\'s New',
                url: 'http://dokans.test/wp-admin/admin.php?page=dokan#/changelog'
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
                url: 'http://dokans.test/wp-admin/admin.php?page=dokan#/help'
            },
            {
                name: 'Request a Feature',
                url: 'https://wedevs.com/account/dokan-feature-requests/'
            },
            {
                name: 'Run Setup Wizard',
                url: 'http://dokans.test/wp-admin/admin.php?page=dokan-setup'
            },
            {
                name: 'Import dummy data',
                url: 'http://dokans.test/wp-admin/admin.php?page=dokan#/dummy-data'
            }
        ];

        await page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"] button').hover();
        for (const item of menuItems) {
            const helpMenuItem = page
                .locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
                .getByRole('link', { name: item.name });

            await expect(helpMenuItem).toBeVisible();
        }

        for (const item of menuItems) {
            const menuItem = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')
                .getByRole('link', { name: item.name });

            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                await menuItem.click({ button: 'middle' })
            ]);
            await expect(newPage).toHaveURL(item.redirectTo ?? item.url);
        }
    });

    test('should complete the entire setup guide process', async ({ page, context }) => {
        await page.locator('#setup-guide-banner-root').getByRole('button', { name: 'Start Setup' }).click();
        await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_shipping_fee_recipient_div').getByRole('button', { name: 'Admin' }).click();
        await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_tax_fee_recipient_div').getByRole('button', { name: 'Admin' }).click();
        await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_shipping_tax_fee_recipient_div').getByRole('button', { name: 'Admin' }).click();
        await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_order_status_change_div').getByRole('button').click();
        await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_new_seller_enable_selling_div').getByRole('button').click();
    });

    // await page.goto('http://dokans.test/wp-login.php?redirect_to=http%3A%2F%2Fdokans.test%2Fwp-admin%2F&reauth=1');
    // await page.getByRole('textbox', { name: 'Username or Email Address' }).click();
    // await page.getByRole('textbox', { name: 'Username or Email Address' }).press('CapsLock');
    // await page.getByRole('textbox', { name: 'Username or Email Address' }).fill('Nadim');
    // await page.getByRole('textbox', { name: 'Username or Email Address' }).press('Tab');
    // await page.getByRole('textbox', { name: 'Password' }).fill('beautiful sea ai');
    // await page.getByRole('button', { name: 'Log In' }).click();
    // await page.locator('#toplevel_page_dokan').getByRole('link', { name: 'Dashboard' }).click();
    // await page.getByRole('button', { name: 'Start Setup' }).click();
    // await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_shipping_fee_recipient_div').getByRole('button', { name: 'Admin' }).click();
    // await page.locator('#dokan_admin_onboarding_setup_step_basic_basic_shipping_tax_fee_recipient_div').getByRole('button', { name: 'Admin' }).click();
    // await page.locator('[id="headlessui-switch-\\:r0\\:"]').click();
    // await page.locator('[id="headlessui-switch-\\:r1\\:"]').click();
    // await page.getByRole('link', { name: 'Get Support' }).click({
    //     modifiers: ['ControlOrMeta']
    // });
    // await page.getByRole('link', { name: 'What\'s New' }).click({
    //     modifiers: ['ControlOrMeta']
    // });
    // await page2.goto('http://dokans.test/wp-admin/admin.php?page=dokan#/changelog');
    // await page.getByRole('link', { name: 'Community' }).click({
    //     modifiers: ['ControlOrMeta']
    // });
    // await page3.goto('https://www.facebook.com/groups/dokanMultivendor');
    // await page.getByRole('button', { name: 'Next' }).click();
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').click();
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').press('ArrowLeft');
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').press('ArrowLeft');
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').press('ArrowLeft');
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').fill('15.0000');
    // await page.getByRole('textbox').nth(1).click();
    // await page.getByRole('textbox').nth(1).press('ArrowLeft');
    // await page.getByRole('textbox').nth(1).press('ArrowLeft');
    // await page.getByRole('textbox').nth(1).press('ArrowLeft');
    // await page.getByRole('textbox').nth(1).press('ArrowLeft');
    // await page.getByRole('textbox').nth(1).fill('20.0000');
    // await page.locator('[id="headlessui-switch-\\:r6\\:"]').click();
    // await page.locator('[id="headlessui-switch-\\:r6\\:"]').click();
    // await page.getByRole('button', { name: 'Next' }).click();
    // await page.getByRole('button', { name: 'Back' }).click();
    // await page.getByRole('button', { name: 'Back' }).click();
    // await page.locator('[id="headlessui-switch-\\:rm\\:"]').click();
    // await page.getByRole('button', { name: 'Next' }).click();
    // await page.locator('div').filter({ hasText: /^%$/ }).getByRole('textbox').click();
    // await page.getByRole('textbox').nth(1).click();
    // await page.getByRole('button', { name: 'Skip' }).click();
    // await page.locator('[id="headlessui-switch-\\:r12\\:"]').click();
    // await page.locator('[id="headlessui-switch-\\:r10\\:"]').click();
    // await page.locator('[id="headlessui-switch-\\:r11\\:"]').click();
    // await page.locator('#withdraw_limit').click();
    // await page.locator('#withdraw_limit').press('ArrowLeft');
    // await page.locator('#withdraw_limit').fill('60');
    // await page.getByRole('checkbox', { name: 'On Hold' }).check();
    // await page.getByRole('button', { name: 'Next' }).click();
    // await page.getByRole('button', { name: 'Show' }).first().click();
    // await page.getByRole('button', { name: 'Hide' }).nth(1).click();
    // await page.getByRole('button', { name: 'Show' }).nth(2).click();
    // await page.getByRole('button', { name: 'Show' }).nth(3).click();
    // await page.getByRole('button', { name: 'Show' }).nth(4).click();
    // await page.getByRole('button', { name: 'Next' }).click();
    // await page.getByText('of 4 tasks completed').click();
    // await page.getByRole('link', { name: 'Visit Dokan Dashboard' }).click();
    // await page.locator('#toplevel_page_dokan').getByRole('link', { name: 'Settings' }).click();
    // await page.locator('div').filter({ hasText: /^Selling Options$/ }).click();
    // await page.locator('div').filter({ hasText: /^Withdraw Options$/ }).click();
});
