import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// Old UI dataset (placeholder, update selectors if legacy UI exists)
const oldDataset = [
    {
        title: 'Admin Old Setting: Verification SMS Gateways',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Verification SMS Gateways")]',
        fields: [
            {
                selector: 'input#dokan_verification_sms_gateways\\[sender_name\\]',
                type: 'text',
                value: 'Market Team',
            },
            {
                selector: 'textarea#dokan_verification_sms_gateways\\[sms_text\\]',
                type: 'text',
                value: 'Your verification code is: %CODE%',
            },
            {
                selector: 'textarea#dokan_verification_sms_gateways\\[sms_sent_msg\\]',
                type: 'text',
                value: 'SMS sent. Please enter your verification code',
            },
            {
                selector: 'textarea#dokan_verification_sms_gateways\\[sms_sent_error\\]',
                type: 'text',
                value: 'Unable to send sms. Contact admin',
            },
            {
                selector: 'label[for="1-twilio-active_gateway"]',
                type: 'buttonOld',
                value: 'twilio',
            },
            // {
            //     selector: '//input[@id="from_number"]',
            //     type: 'field',
            //     value: '+1234567890',
            // },
            // {
            //     selector: '//input[@id="account_sid"]',
            //     type: 'field',
            //     value: 'ACxxxxxxxxxxxxxxxxxxxxx',
            // },
            // {
            //     selector: '//input[@id="auth_token"]',
            //     type: 'field',
            //     value: 'auth_token_123',
            // },
            // {
            //     selector: '//select[@id="sms_code_type"]',
            //     type: 'dropdown',
            //     value: 'Numeric',
            // },
            {
                selector: '//h3[contains(text(),"Connect to Twilio")]/ancestor::fieldset//label[contains(@class,"switch")]/span[@class="slider round"]',
                type: 'checkbox-switch',
                value: true,
            },
        ],
    },
];

// ✅ New UI dataset (from your HTML)
const newDataset = {
    title: 'Admin Setting: Vendor → Verification SMS Gateways',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-verification"] >> [data-testid="settings-menu-sms-gateways-page"]',
    fields: [
        {
            selector: '[data-testid="settings-field-sms_provider"]',
            type: 'radio-capsule',
            value: 'Twilio',
        },
        {
            selector: '[data-testid="settings-field-connect_to_twilio"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-from_number"] input[type="password"]',
            type: 'text',
            value: '+1234567890',
        },
        {
            selector: '[data-testid="settings-field-account_sid"] input[type="password"]',
            type: 'text',
            value: 'ACxxxxxxxxxxxxxxxxxxxxx',
        },
        {
            selector: '[data-testid="settings-field-auth_token"] input[type="password"]',
            type: 'text',
            value: 'auth_token_123',
        },
        {
            selector: '[data-testid="settings-field-sms_code_type"]',
            type: 'radio-capsule',
            value: 'Numeric',
        },
        {
            selector: '[data-testid="settings-field-sender_name"] input',
            type: 'text',
            value: 'Market Team',
        },
        {
            selector: '[data-testid="settings-field-sms_text"] textarea',
            type: 'text',
            value: 'Your verification code is: %CODE%',
        },
        {
            selector: '[data-testid="settings-field-sms_sent_success"] textarea',
            type: 'text',
            value: 'SMS sent. Please enter your verification code',
        },
        {
            selector: '[data-testid="settings-field-sms_sent_error"] textarea',
            type: 'text',
            value: 'Unable to send sms. Contact admin',
        },
    ],
};

// 🧪 TESTS
test.describe('Admin Setting: Vendor → Verification SMS Gateways', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    // 🔄 NEW → OLD sync
    test('New to Old Verification SMS Gateways synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        await test.step('Reload new settings URL', async () => {
            await adminSettingsPage.reloadUrl(newDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    // 🔄 OLD → NEW sync
    test('Old to New Verification SMS Gateways synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload URLs', async () => {
            for (const dataset of oldDataset) {
                await adminSettingsPage.reloadUrl(dataset.url);
            }
            await adminSettingsPage.reloadUrl(newDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});