import { test, Page } from '@playwright/test';
import { SettingsPage } from '@pages/settingsPage';
import { data } from '@utils/testData';
import {selector} from "@pages/selectors";

// selectors
const settingsAdmin = selector.admin.dokan.settings;

test.describe('Manual Order Configuration', () => {
    let admin: SettingsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);

        aPage = await adminContext.newPage();
        admin = new SettingsPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can enable manual order creation in global settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.goToDokanSettings();

        await admin.goToSingleDokanSettings(settingsAdmin.menus.sellingOptions, data.dokanSettings.selling.settingTitle);

        // Enable manual order creation option
        const manualOrderOption = admin.page.getByRole('group').filter({
            hasText: 'Allow Vendors to Create Orders Enable vendors to create orders manually from'
        });
        const toggleSwitch = manualOrderOption.locator('span').nth(1);
        await toggleSwitch.click();

        // Save settings
        await admin.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);

        // Verify setting is saved correctly
        // await admin.reload();
        // await admin.toBeChecked(manualOrderOption.locator('span').nth(1));
    });

    test('admin can enable manual order creation for specific vendor', { tag: ['@pro', '@admin'] }, async () => {
        // Navigate to vendors page
        await admin.goto(data.subUrls.backend.dokan.vendors);

        // Select an active vendor
        const activeVendorRow = admin.page.locator('.wp-list-table tr:has(.enabled [type="checkbox"]:checked)');
        const vendorNameCell = activeVendorRow.locator('td.store_name').nth(1);
        await vendorNameCell.click();

        // Navigate to vendor edit page
        const editLink = vendorNameCell.getByRole('link').nth(1);
        await editLink.click();

        // Enable manual order option for this vendor
        const manualOrderCheckbox = admin.page.locator('.payment-info.edit-mode .checkbox-left:has(input[type="checkbox"][value="enableManualOrder"])');
        const manualOrderToggle = manualOrderCheckbox.locator('.switch > .slider');
        await manualOrderToggle.click();

        // Save vendor profile changes
        const saveButton = admin.page.locator('.profile-banner.edit-mode .action-links.edit-mode .button.button-primary');
        await saveButton.click();

        // Confirm update dialog
        const updateDialog = admin.page.getByRole('dialog', { name: 'Vendor Updated' });
        await admin.toBeVisible(updateDialog);
        await admin.page.getByRole('button', { name: 'OK' }).click();

        // Verify settings by going to edit mode again
        const editButton = admin.page.locator('.profile-banner .action-links .button.router-link-active');
        await editButton.click();

        // Assertions to verify enabling was successful
        await admin.toBeVisible(manualOrderCheckbox);
        const checkboxInput = admin.page.locator('.payment-info.edit-mode .checkbox-left input[type="checkbox"][value="enableManualOrder"]');
        await admin.toBeChecked(checkboxInput);
    });
});
