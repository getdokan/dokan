import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { user, adminDashboard } from '@utils/interfaces';

// selectors
const dashboardAdmin = selector.admin.dokan.dashboard;

export class AdminDashboardPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // admin dashboard

    // admin dashboard render properly
    async adminDashboardRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

        // dashboard text is visible
        await this.toBeVisible(dashboardAdmin.dashboardText);

        // header elements are visible
        await this.multipleElementVisible(dashboardAdmin.header);

        // at a glance elements are visible
        await this.multipleElementVisible(dashboardAdmin.atAGlance);

        // overview elements are visible
        await this.multipleElementVisible(dashboardAdmin.overview);

        // dokan new update elements are visible
        await this.multipleElementVisible(dashboardAdmin.dokanNewUpdates);

        // Subscribe box elements are visible
        const { thankYouMessage, ...subscribeBox } = dashboardAdmin.subscribeBox;
        await this.multipleElementVisible(subscribeBox);
    }

    // at a glance value
    async dokanAtAGlanceValueAccuracy(atAGlanceValues: adminDashboard['summary']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);
        const netSales = (await this.getElementText(dashboardAdmin.atAGlance.netSalesThisMonth)) as string;
        const commissionEarned = (await this.getElementText(dashboardAdmin.atAGlance.commissionEarned)) as string;

        expect(helpers.roundToTwo(helpers.price(netSales))).toBe(helpers.roundToTwo(atAGlanceValues.sales.this_month));
        expect(helpers.roundToTwo(helpers.price(commissionEarned))).toBe(helpers.roundToTwo(atAGlanceValues.earning.this_month));
        await this.toContainText(dashboardAdmin.atAGlance.signupThisMonth, atAGlanceValues.vendors.this_month + ' Vendor');
        await this.toContainText(dashboardAdmin.atAGlance.vendorAwaitingApproval, atAGlanceValues.vendors.inactive + ' Vendor');
        await this.toContainText(dashboardAdmin.atAGlance.productCreatedThisMonth, atAGlanceValues.products.this_month + ' Products');
        await this.toContainText(dashboardAdmin.atAGlance.withdrawAwaitingApproval, atAGlanceValues.withdraw.pending + ' Withdrawals');
    }

    // add dokan news subscriber
    async addDokanNewsSubscriber(user: user['userDetails']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

        await this.clearAndType(dashboardAdmin.subscribeBox.subscriberName, user.name());
        await this.clearAndType(dashboardAdmin.subscribeBox.subscriberEmail, user.email());
        await this.clickAndWaitForResponse(data.subUrls.backend.dokan.subscribe, dashboardAdmin.subscribeBox.subscribeButton, 302);
        await this.toContainText(dashboardAdmin.subscribeBox.thankYouMessage, 'Thank you for subscribing!');
    }
}
