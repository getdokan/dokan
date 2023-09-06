import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { user, adminDashboard } from 'utils/interfaces';

export class AdminDashboardPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// admin dashboard

	// admin dashboard render properly
	async adminDashboardRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

		// dashboard text is visible
		await this.toBeVisible(selector.admin.dokan.dashboard.dashboardText);

		// header elements are visible
		await this.multipleElementVisible(selector.admin.dokan.dashboard.header);

		// at a glance elements are visible
		await this.multipleElementVisible(selector.admin.dokan.dashboard.atAGlance);

		// overview elements are visible
		await this.multipleElementVisible(selector.admin.dokan.dashboard.overview);

		// dokan new update elements are visible
		await this.multipleElementVisible(selector.admin.dokan.dashboard.dokanNewUpdates);

		// Subscribe box elements are visible
		
		const { thankYouMessage, ...subscribeBox } = selector.admin.dokan.dashboard.subscribeBox;
		await this.multipleElementVisible(subscribeBox);
	}


	// at a glance value
	async dokanAtAGlanceValueAccuracy(atAGlanceValues: adminDashboard['summary'] ){
		await this.goIfNotThere(data.subUrls.backend.dokan.dokan);
		const netSales = await this.getElementText(selector.admin.dokan.dashboard.atAGlance.netSalesThisMonth) as string;
		const commissionEarned = await this.getElementText(selector.admin.dokan.dashboard.atAGlance.commissionEarned) as string;

		expect(helpers.roundToTwo(helpers.price(netSales))).toBe(helpers.roundToTwo(atAGlanceValues.sales.this_month));
		expect(helpers.roundToTwo(helpers.price(commissionEarned))).toBe(helpers.roundToTwo(atAGlanceValues.earning.this_month));
		await this.toContainText(selector.admin.dokan.dashboard.atAGlance.signupThisMonth, atAGlanceValues.vendors.this_month + ' Vendor');
		await this.toContainText(selector.admin.dokan.dashboard.atAGlance.vendorAwaitingApproval, atAGlanceValues.vendors.inactive + ' Vendor');
		await this.toContainText(selector.admin.dokan.dashboard.atAGlance.productCreatedThisMonth, atAGlanceValues.products.this_month + ' Products');
		await this.toContainText(selector.admin.dokan.dashboard.atAGlance.withdrawAwaitingApproval, atAGlanceValues.withdraw.pending + ' Withdrawals');
	}


	// add dokan news subscriber
	async addDokanNewsSubscriber(user: user['userDetails']){
		await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

		await this.clearAndType(selector.admin.dokan.dashboard.subscribeBox.subscriberName, user.name());
		await this.clearAndType(selector.admin.dokan.dashboard.subscribeBox.subscriberEmail, user.email());
		await this.clickAndWaitForResponse(data.subUrls.backend.dokan.subscribe, selector.admin.dokan.dashboard.subscribeBox.subscribeButton, 302);
		await this.toContainText(selector.admin.dokan.dashboard.subscribeBox.thankYouMessage, 'Thank you for subscribing!' );

	}

}
