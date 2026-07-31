import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: EU Compliance Settings',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"EU Compliance")]',
        fields: [
            // Vendor Extra Fields - Multi-checkbox
            // {
            //     selector: '//div[@class="vendor_fields dokan-settings-field-type-multicheck"]//input[@value="dokan_company_name"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="vendor_fields dokan-settings-field-type-multicheck"]//input[@value="dokan_company_id_number"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="vendor_fields dokan-settings-field-type-multicheck"]//input[@value="dokan_vat_number"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="vendor_fields dokan-settings-field-type-multicheck"]//input[@value="dokan_bank_name"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="vendor_fields dokan-settings-field-type-multicheck"]//input[@value="dokan_bank_iban"]',
            //     type: 'checkbox',
            //     value: true
            // },
            
            // Display in Vendor Registration Form
            {
                selector: '//label[@for="dokan_germanized[vendor_registration]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
            
            // Customer Extra Fields - Multi-checkbox
            // {
            //     selector: '//div[@class="customer_fields dokan-settings-field-type-multicheck"]//input[@value="billing_dokan_company_id_number"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="customer_fields dokan-settings-field-type-multicheck"]//input[@value="billing_dokan_vat_number"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="customer_fields dokan-settings-field-type-multicheck"]//input[@value="billing_dokan_bank_name"]',
            //     type: 'checkbox',
            //     value: true
            // },
            // {
            //     selector: '//div[@class="customer_fields dokan-settings-field-type-multicheck"]//input[@value="billing_dokan_bank_iban"]',
            //     type: 'checkbox',
            //     value: true
            // },
            
            // Enable Germanized Support For Vendors
            {
                selector: '//label[@for="dokan_germanized[enabled_germanized]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
            
            // Vendor's Can Override Invoice Number
            {
                selector: '//label[@for="dokan_germanized[override_invoice_number]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            }
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Compliance -> EU Compliance',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-compliance"] >> [data-testid="settings-menu-eu_compliance"]',
    fields: [
        // EU Compliance Settings Section
        
        // Display in Vendor Registration Form - Switch
        {
            selector: '[data-testid="settings-field-eu_vendor_registration_display"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        
        // Enable Germanized Support For Vendors - Switch
        {
            selector: '[data-testid="settings-field-germanized_support_vendors"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        
        // Vendor's Can Override Invoice Number - Switch
        {
            selector: '[data-testid="settings-field-vendor_invoice_number_override"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        
        // Vendor Extra Fields Section - Standard Checkboxes
        // Todo: Need proper mapping first
        // // Company Name
        // {
        //     selector: '#simple-checkbox-group-company_name',
        //     type: 'checkbox',
        //     value: true,
        // },
        
        // // VAT Number
        // {
        //     selector: '#simple-checkbox-group-vat_number',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Business Registration Number
        // {
        //     selector: '#simple-checkbox-group-business_registration_number',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Tax ID
        // {
        //     selector: '#simple-checkbox-group-tax_id',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // EU Business Address
        // {
        //     selector: '#simple-checkbox-group-eu_business_address',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // Customer Extra Fields Section - Standard Checkboxes
        
        // // EU Address
        // {
        //     selector: '#simple-checkbox-group-eu_address',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Customer VAT Number
        // {
        //     selector: '#simple-checkbox-group-customer_vat_number',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Customer Tax ID
        // {
        //     selector: '#simple-checkbox-group-customer_tax_id',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Bank IBAN
        // {
        //     selector: '#simple-checkbox-group-bank_iban',
        //     type: 'checkbox',
        //     value: true,
        // },
    ],
};

test.describe('Admin Setting: Compliance -> EU Compliance', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old EU Compliance Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New EU Compliance Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        // Need to reload again
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });
        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});