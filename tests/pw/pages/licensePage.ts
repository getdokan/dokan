import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const licenseAdmin = selector.admin.dokan.license;

export class LicensePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // license

    // license render properly
    async adminLicenseRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);

        // license settings text is visible
        await this.toBeVisible(licenseAdmin.licenseText);

        // license section elements are visible
        const { activateLicense, ...activateSection } = licenseAdmin.activateSection;
        await this.multipleElementVisible(activateSection);

        // deactivate license is visible
        await this.toBeVisible(licenseAdmin.deactivateLicense);

        // refresh license is visible
        await this.toBeVisible(licenseAdmin.refreshLicense);

        // activated license info elements are visible
        await this.toBeVisible(licenseAdmin.activateLicenseInfo);
    }

    // activate license
    async activateLicense(key: string, type = 'correct') {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        const alreadyActivated = await this.isVisible(licenseAdmin.deactivateLicense);
        if (!alreadyActivated) {
            await this.clearAndType(licenseAdmin.activateSection.licenseKeyInput, key);
            await this.clickAndWaitForResponse(data.subUrls.backend.dokan.license, licenseAdmin.activateSection.activateLicense);
            if (type === 'correct') {
                await this.toContainText(licenseAdmin.successNotice, 'License activated successfully.');
                await this.toBeVisible(licenseAdmin.activateLicenseInfo);
                await this.toBeVisible(licenseAdmin.refreshLicense);
            } else {
                await this.toContainText(licenseAdmin.errorNotice, 'Invalid License Key');
            }
        } else {
            console.log('License already activated!!');
        }
    }

    // refresh license
    async refresehLicense() {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        await this.clickAndWaitForResponse(data.subUrls.backend.dokan.license, licenseAdmin.refreshLicense);
        await this.toContainText(licenseAdmin.successNotice, 'License refreshed successfully.');
    }
    // deactivate license
    async deactivateLicense() {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        await this.clickAndWaitForResponse(data.subUrls.backend.dokan.license, licenseAdmin.deactivateLicense);
        await this.toContainText(licenseAdmin.successNotice, 'License deactivated successfully.');
        await this.notToBeVisible(licenseAdmin.refreshLicense);
    }
}
