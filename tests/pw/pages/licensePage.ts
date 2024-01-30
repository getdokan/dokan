import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class LicensePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // license

    // license render properly
    async adminLicenseRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);

        // license settings text is visible
        await this.toBeVisible(selector.admin.dokan.license.licenseText);

        // license section elements are visible
        await this.multipleElementVisible(selector.admin.dokan.license.activateSection);
    }

    // activate license
    async activateLicense(key: string, type = 'correct') {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        const alreadyActivated = await this.isVisible(selector.admin.dokan.license.deactivateLicense);
        if (!alreadyActivated) {
            await this.clearAndType(selector.admin.dokan.license.activateSection.licenseKeyInput, key);
            await this.clickAndWaitForResponse(data.subUrls.backend.dokan.license, selector.admin.dokan.license.activateSection.activateLicense);
            if (type === 'correct') {
                await this.toContainText(selector.admin.dokan.license.successNotice, 'License activated successfully.');
                await this.toBeVisible(selector.admin.dokan.license.activateLicenseInfo);
                await this.toBeVisible(selector.admin.dokan.license.refreshLicense);
            } else {
                await this.toContainText(selector.admin.dokan.license.errorNotice, 'Invalid License Key');
            }
        } else {
            console.log('License already activated!!');
        }
    }

    // deactivate license
    async deactivateLicense() {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        await this.clickAndWaitForResponse(data.subUrls.backend.dokan.license, selector.admin.dokan.license.deactivateLicense);
        await this.toContainText(selector.admin.dokan.license.successNotice, 'License deactivated successfully.');
        await this.notToBeVisible(selector.admin.dokan.license.refreshLicense);
    }
}
