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
        await this.multipleElementVisible(
            selector.admin.dokan.license.activateSection,
        );
    }

    // activate license
    async activateLicense(key: string, type = 'correct') {
        await this.goIfNotThere(data.subUrls.backend.dokan.license);
        await this.clearAndType(
            selector.admin.dokan.license.activateSection.licenseKeyInput,
            key,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.backend.dokan.license,
            selector.admin.dokan.license.activateSection.activateLicense,
        );
        if (type === 'correct') {
            // todo: add valid key scenario
        } else {
            await this.toContainText(
                selector.admin.dokan.license.errorNotice,
                'Invalid License Key',
            );
        }
    }
}
