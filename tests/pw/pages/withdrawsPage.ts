import { Page, test } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { vendor } from 'utils/interfaces';


const { DOKAN_PRO } = process.env;

export class WithdrawsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// withdraws


	// withdraws render properly
	async adminWithdrawsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		// withdraw  text is visible
		await this.toBeVisible(selector.admin.dokan.withdraw.withdrawText);

		// nav tabs elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.bulkActions);

		// filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterInput, clearFilter, result, ...filters } = selector.admin.dokan.withdraw.filters;
		await this.multipleElementVisible(filters);

		// withdraw table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.table);

	}


	// filter withdraws
	async filterWithdraws(vendorName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		await this.clickAndWaitForResponseIfVisible(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.filters.clearFilter); //todo: replace click if visible with clickAndWaitForResponse

		await this.click(selector.admin.dokan.withdraw.filters.filterByVendor);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.withdraw.filters.filterInput, vendorName);
		await this.toContainText(selector.admin.dokan.withdraw.filters.result, vendorName); //todo:  apply this for every dropdown search
		//todo: need to wait for focus event
		await this.pressAndWaitForResponse(data.subUrls.api.dokan.withdraws, data.key.enter);
		await this.toBeVisible(selector.admin.dokan.withdraw.withdrawCell(vendorName));

	}


	// add note to withdraw request
	async addNoteWithdrawRequest(vendorName: string, note: string): Promise<void> {
		await this.filterWithdraws(vendorName);

		await this.click(selector.admin.dokan.withdraw.withdrawAddNote(vendorName));
		await this.clearAndType(selector.admin.dokan.withdraw.addNote, note);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.updateNote);

	}


	// add note to withdraw request
	async updateWithdrawRequest(vendorName: string, action: string): Promise<void> {
		await this.filterWithdraws(vendorName);

		switch (action) {

		case 'approve' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.withdrawApprove(vendorName));
			break;

		case 'cancel' :
			await this.hover(selector.admin.dokan.withdraw.withdrawCell(vendorName));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.withdrawCancel);
			break;

		case 'delete' :
			await this.hover(selector.admin.dokan.withdraw.withdrawCell(vendorName));
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.withdrawDelete);
			break;

		default :
			break;
		}
	}


	// withdraw bulk action
	async withdrawBulkAction(action: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.withdraw.noRowsFound);

		await this.click(selector.admin.dokan.withdraw.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.withdraw.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.bulkActions.applyAction);
	}


	// withdraw


	// withdraw render properly
	async vendorWithdrawRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);

		// withdraw text is visible
		await this.toBeVisible(selector.vendor.vWithdraw.withdrawText);

		// balance elements are visible
		await this.multipleElementVisible(selector.vendor.vWithdraw.balance);

		// request withdraw is visible
		await this.toBeVisible(selector.vendor.vWithdraw.manualWithdrawRequest.requestWithdraw);

		// payment details manual elements are visible
		await this.multipleElementVisible(selector.vendor.vWithdraw.paymentDetails.manual);

		// view payments is visible
		await this.toBeVisible(selector.vendor.vWithdraw.viewPayments.viewPayments);

		if (DOKAN_PRO){
			// payment details schedule elements are visible
			await this.multipleElementVisible(selector.vendor.vWithdraw.paymentDetails.schedule);

			// enable & edit schedule is visible
			await this.toBeVisible(selector.vendor.vWithdraw.autoWithdrawDisbursement.enableSchedule);
			await this.toBeVisible(selector.vendor.vWithdraw.autoWithdrawDisbursement.editSchedule);
		}

		//todo:  pending request can be added

		// withdraw payment methods div elements are visible
		await this.toBeVisible(selector.vendor.vWithdraw.withdrawPaymentMethods.paymentMethodsDiv);

		await this.notToHaveCount(selector.vendor.vWithdraw.withdrawPaymentMethods.paymentMethods, 0);

		//todo: add request & disbursement modal

	}


	// withdraw requests render properly
	async vendorWithdrawRequestsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdrawRequests);

		// withdraw requests menus are visible
		await this.multipleElementVisible(selector.vendor.vWithdraw.viewPayments.menus);

		// request withdraw button is visible
		await this.toBeVisible(selector.vendor.vWithdraw.viewPayments.requestWithdraw);

		// withdraw dashboard button is visible
		await this.toBeVisible(selector.vendor.vWithdraw.viewPayments.withdrawDashboard);

		// withdraw requests table elements are visible
		await this.multipleElementVisible(selector.vendor.vWithdraw.viewPayments.table);

	}


	// vendor request withdraw
	async requestWithdraw(withdraw: vendor['withdraw']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);

		if (helpers.price(withdraw.currentBalance) > helpers.price(withdraw.minimumWithdrawAmount)) { //todo:
			await this.click(selector.vendor.vWithdraw.manualWithdrawRequest.requestWithdraw);
			await this.clearAndType(selector.vendor.vWithdraw.manualWithdrawRequest.withdrawAmount, String(withdraw.minimumWithdrawAmount));
			await this.selectByValue(selector.vendor.vWithdraw.manualWithdrawRequest.withdrawMethod, withdraw.withdrawMethod.default);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.manualWithdrawRequest.submitRequest);
			// await expect(this.page.getByText(selector.vendor.vWithdraw.manualWithdrawRequest.withdrawRequestSaveSuccessMessage)).toBeVisible(); //todo
		} else {
			test.skip();
			// throw new Error('Vendor balance is less than minimum withdraw amount'); //todo: skip or fail test
		}
	}


	// vendor can't request withdraw when pending request exists
	async cantRequestWithdraw(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		await this.click(selector.vendor.vWithdraw.manualWithdrawRequest.requestWithdraw);
		await this.toContainText(selector.vendor.vWithdraw.manualWithdrawRequest.pendingRequestAlert, selector.vendor.vWithdraw.manualWithdrawRequest.pendingRequestAlertMessage );
	}


	// vendor cancel withdraw request
	async cancelWithdrawRequest(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.withdrawRequests, selector.vendor.vWithdraw.manualWithdrawRequest.cancelRequest, 302);
		await this.toContainText(selector.vendor.vWithdraw.manualWithdrawRequest.cancelWithdrawRequestSuccess, selector.vendor.vWithdraw.manualWithdrawRequest.cancelWithdrawRequestSaveSuccessMessage);
	}


	// vendor add auto withdraw disbursement schedule
	async addAutoWithdrawDisbursementSchedule(withdraw: vendor['withdraw']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		await this.enableSwitcherDisbursement(selector.vendor.vWithdraw.autoWithdrawDisbursement.enableSchedule);
		await this.click(selector.vendor.vWithdraw.autoWithdrawDisbursement.editSchedule);
		await this.selectByValue(selector.vendor.vWithdraw.autoWithdrawDisbursement.preferredPaymentMethod, withdraw.preferredPaymentMethod);
		await this.click(selector.vendor.vWithdraw.autoWithdrawDisbursement.preferredSchedule(withdraw.preferredSchedule));
		await this.selectByValue(selector.vendor.vWithdraw.autoWithdrawDisbursement.onlyWhenBalanceIs, withdraw.minimumWithdrawAmount);
		await this.selectByValue(selector.vendor.vWithdraw.autoWithdrawDisbursement.maintainAReserveBalance, withdraw.reservedBalance);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.autoWithdrawDisbursement.changeSchedule);
		await this.notToContainText(selector.vendor.vWithdraw.autoWithdrawDisbursement.scheduleMessage, data.vendor.withdraw.scheduleMessageInitial);

	}


	// vendor add default withdraw payment methods
	async addDefaultWithdrawPaymentMethods(preferredSchedule: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		const methodIsDefault = await this.isVisible(selector.vendor.vWithdraw.withdrawPaymentMethods.defaultMethod(preferredSchedule));
		if (!methodIsDefault) {
			await this.clickAndWaitForLoadState(selector.vendor.vWithdraw.withdrawPaymentMethods.makeMethodDefault(preferredSchedule));
			await this.toBeVisible(selector.vendor.vWithdraw.withdrawPaymentMethods.defaultMethod(preferredSchedule));
		}
	}

}
