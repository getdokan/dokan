import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Report Abuse',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Report Abuse")]',
        fields: [
            {
                selector: '//label[@for="dokan_report_abuse[reported_by_logged_in_users_only]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
            // {
            //     selector: '//textarea[@id="dokan_report_abuse[abuse_reasons]"]',
            //     type: 'textarea',
            //     value: 'Spam\nInappropriate',
            // },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Moderation -> report_abuse',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-report_abuse"]',
    fields: [
        {
            selector: '[data-testid="settings-field-report_abuse_reported_by"]',
            type: 'radio-capsule',
            value: 'All Users',
        },
        // { //Todo
        //     selector: '[data-testid="settings-field-report_abuse_reasons"] textarea',
        //     type: 'textarea',
        //     value: 'Spam\nInappropriate',
        // },
    ],
};

test.describe('Admin Setting: Moderation -> report_abuse', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Report Abuse Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });

        await test.step('Check old settings', async () => {
            for (const dataset of oldDataset) {
                await test.step(dataset.title, async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    test('Old to New Report Abuse Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });
        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
