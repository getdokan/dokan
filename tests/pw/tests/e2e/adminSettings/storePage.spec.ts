import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';

// Old UI dataset (placeholder, update selectors if legacy UI exists)
const oldDataset = [
    {
        title: 'Admin Old Setting: Appearance',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Appearance")]',
        fields: [
        {
            // Captcha lives under Moderation -> Captcha in the new UI but still
            // bridges to dokan_appearance on the legacy Appearance page.
            selector: 'label[for="dokan_appearance[captcha_enable_status]"]',
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
            // Inverted bridge: new "Dokan font-awesome" on == legacy "disable" off.
            selector: 'label[for="dokan_appearance[disable_dokan_fontawesome]"] .switch',
            type: 'checkbox',
            value: false,
        },
        ]
    }
];

// New UI datasets. The legacy Appearance page still holds every option below
// (they all bridge to `dokan_appearance`), but the new settings app splits them:
// store presentation stays under Appearance → Store while the captcha options
// moved to Moderation → Captcha, so each needs its own nav.
const newSettingsUrl = 'wp-admin/admin.php?page=dokan-dashboard#/settings';

const newDatasets = [
    {
    title: 'Admin Setting: Appearance → Store',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-appearance"] >> [data-testid="settings-menu-store"]',
    fields: [
        {
            selector: '[data-testid="settings-field-store_products_per_page"] input[type="number"]',
            type: 'number',
            value: '12',
        },
        {
            selector: '[data-testid="settings-field-store_contact_form_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-store_opening_closing_time_widget"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-store_sidebar_from_theme"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-dokan_fontawesome_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
    ]
    },
    {
        title: 'Admin Setting: Moderation → Captcha',
        url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
        selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-captcha"]',
        fields: [
            {
                selector: '[data-testid="settings-field-captcha_enable_status"] [role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                selector: '[data-testid="settings-field-recaptcha_site_key"] input[type="password"]',
                type: 'text',
                value: 'SITE_KEY_123',
            },
            {
                selector: '[data-testid="settings-field-recaptcha_secret_key"] input[type="password"]',
                type: 'text',
                value: 'SECRET_KEY_123',
            },
        ],
    },
];

// 🧪 TESTS
test.describe('Admin Setting: Appearance → Store', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    // The captcha keys these tests type in are fake, so leaving the captcha
    // enabled makes Dokan print a reCAPTCHA v3 script with an invalid site key on
    // every login form. Its token never validates and each later spec — the auth
    // setup included — fails to log a customer or vendor in. Put it back.
    test.afterAll(async () => {
        const off = { captcha_enable_status: 'off', recaptcha_site_key: '', recaptcha_secret_key: '' };
        await dbUtils.updateOptionValue('dokan_appearance', off);
        await dbUtils.updateOptionValue('dokan_admin_settings', off);
    });

    // 🔄 NEW → OLD sync
    test('New to Old Store Appearance synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            for (const dataset of newDatasets) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Check old settings', async () => {
            for (const dataset of oldDataset) {
                await test.step(dataset.title, async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });

        await test.step('Reload new settings URL', async () => {
            await adminSettingsPage.reloadUrl(newSettingsUrl);
        });

        await test.step('Check new settings', async () => {
            for (const dataset of newDatasets) {
                await test.step('Check ' + dataset.title, async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });
    });

    // 🔄 OLD → NEW sync
    test('Old to New Store Appearance synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
            await adminSettingsPage.reloadUrl(newSettingsUrl);
        });

        await test.step('Check new settings', async () => {
            for (const dataset of newDatasets) {
                await test.step('Check ' + dataset.title, async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });
    });
});