import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// Old UI dataset (placeholder, update selectors if legacy UI exists)
const oldDataset = [
    {
        title: 'Admin Old Setting: Verification SMS Gateways',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Appearance")]',
        fields: [
         {
            selector: '.recaptcha_validation_label .social-switch-wraper .switch',
            type: 'checkbox',
            value: true,
        },
        {
            selector: 'label[for="dokan_appearance[contact_seller]"] .switch',
            type: 'checkbox',
            value: true,
        },
        {
            selector: 'label[for="dokan_appearance[store_open_close]"] .switch',
            type: 'checkbox',
            value: true,
        },
        {
            selector: 'label[for="dokan_appearance[enable_theme_store_sidebar]"] .switch',
            type: 'checkbox',
            value: true,
        },
        {
            selector: 'label[for="dokan_appearance[disable_dokan_fontawesome]"] .switch',
            type: 'checkbox',
            value: true,
        },
        ]
    }
];

//  New UI dataset
const newDataset = {
    title: 'Admin Setting: Vendor → Verification SMS Gateways',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_appearance >> #dokan_settings_appearance_store',
    fields: [
        {
            selector: '#dokan_settings_appearance_store_products_page_store_products_per_page input[placeholder="Products Per Page"]',
            type: 'number',
            value: '12',
        },
        {
            selector: '#dokan_settings_appearance_store_google_recaptcha_google_recaptcha_settings_google_recaptcha_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_store_google_recaptcha_google_recaptcha_settings_google_recaptcha_site_key input[placeholder="Site Key"]',
            type: 'text',
            value: 'SITE_KEY_123',
        },
        {
            selector: '#dokan_settings_appearance_store_google_recaptcha_google_recaptcha_settings_google_recaptcha_secret_key input[placeholder="Secret Key"]',
            type: 'text',
            value: 'SECRET_KEY_123',
        },
        {
            selector: '#dokan_settings_appearance_store_store_contact_form_section_store_contact_form_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_store_store_time_widget_section_store_opening_closing_time_widget button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_store_store_sidebar_section_store_sidebar_from_theme button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_store_dokan_font_section_dokan_fontawesome_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },    
    ]
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