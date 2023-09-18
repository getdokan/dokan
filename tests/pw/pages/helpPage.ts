import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class HelpPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // help

    // help render properly
    async adminHelpRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.help);

        // help text is visible
        await this.toBeVisible(selector.admin.dokan.help.helpText);

        // basics elements are visible
        await this.multipleElementVisible(selector.admin.dokan.help.basics);

        // payment And Shipping elements are visible
        await this.multipleElementVisible(selector.admin.dokan.help.paymentAndShipping);

        // vendor related questions elements are visible
        await this.multipleElementVisible(selector.admin.dokan.help.vendorRelatedQuestions);

        // miscellaneous elements are visible
        await this.multipleElementVisible(selector.admin.dokan.help.miscellaneous);
    }

    // get help
    async adminGetHelpDropdownRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.help);

        await this.hover(selector.admin.dokan.dashboard.header.getHelpMenu);

        // get help drop down list elements are visible
        await this.multipleElementVisible(selector.admin.dokan.dashboard.getHelp);
    }
}
