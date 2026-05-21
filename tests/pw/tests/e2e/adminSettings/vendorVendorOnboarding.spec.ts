import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: General',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")]',
        fields: [
            {
                selector: '//label[@for="dokan_general[enabled_address_on_reg]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_general[enable_tc_on_reg]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_general[disable_welcome_wizard]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//div[contains(@class,"setup_wizard_message")]//iframe[contains(@id,"dokan-tinymce") and contains(@id,"_ifr")]',
                type: 'textareaOld',
                value: 'Welcome to our marketplace!',
            },

        ],
    },
    {
        title: 'Admin Old Setting: Selling Options',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        fields: [
            {
                selector: '//select[@id="dokan_selling[new_seller_enable_selling]"]',
                type: 'select',
                value: 'automatically',
            },
        ]
    }
];

const newDataset = {
    title: 'Admin Setting: Vendor -> vendor_onboarding',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_vendor >> #dokan_settings_vendor_vendor_onboarding',
    //selector: '#dokan_settings_general >> #dokan_settings_general_marketplace',
    fields: [
        {
            selector: '#dokan_settings_vendor_vendor_onboarding_vendor_auto_enable_selling button[name="automatically"]',
            type: 'radio',
            value: 'true',
        },
        {
            selector: '#dokan_settings_vendor_vendor_onboarding_vendor_registration_address_fields button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_vendor_onboarding_terms_conditions button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_vendor_onboarding_vendor_welcome_wizard_enabled button[role="switch"]',
            type: 'switch',
            value: false, // Note: Inverted value compared to old setting
        },
        // { // This field should be test manually
        //     selector: '#dokan_settings_vendor_vendor_onboarding_vendor_setup_wizard_logo input[name="dokan-file-upload-url"]',
        //     type: 'text',
        //     value: '',
        // },
        {
            selector: '#dokan_settings_vendor_vendor_onboarding_vendor_setup_wizard_message .ql-editor',
            type: 'textarea',
            value: 'Welcome to our marketplace!',
        },
    ],
};

test.describe('Admin Setting: Vendor -> vendor_onboarding', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Onboarding Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check old settings' , async () => {
            for (const dataset of oldDataset) {
                await test.step( dataset.title , async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        }); 
    });

    test('Old to new Vendor Onboarding Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update '+ dataset.title , async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
