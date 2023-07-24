import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';


export class WithdrawsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// withdraws

	// withdraws render properly
	async adminWithdrawsRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		// withdraw  text is visible
		await this.toBeVisible(selector.admin.dokan.withdraw.withdrawText);

		// nav tabs elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.bulkActions);

		// filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterInput, clearFilter, ...filters } = selector.admin.dokan.withdraw.filters;
		await this.multipleElementVisible(filters);

		// withdraw table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.withdraw.table);

	}


	// withdraw bulk action
	async withdrawBulkAction(action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.withdraw.noRowsFound);

		await this.click(selector.admin.dokan.withdraw.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.withdraw.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.bulkActions.applyAction);
	}


	// filter withdraws
	async filterWithdraws(vendorName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

		await this.clickIfVisible(selector.admin.dokan.withdraw.filters.clearFilter); //TODO: add wait for response also add to all

		await this.click(selector.admin.dokan.withdraw.filters.filterByVendor);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.withdraw.filters.filterInput, vendorName);
		await this.pressAndWaitForResponse(data.subUrls.api.dokan.withdraws, data.key.enter);
		await this.toBeVisible(selector.admin.dokan.withdraw.withdrawCell(vendorName));

	}


	// add note to withdraw request
	async addNoteWithdrawRequest(vendorName: string, note: string){
		await this.filterWithdraws(vendorName);

		await this.click(selector.admin.dokan.withdraw.withdrawAddNote(vendorName));
		await this.clearAndType(selector.admin.dokan.withdraw.addNote, note);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, selector.admin.dokan.withdraw.updateNote);

	}


	// add note to withdraw request
	async updateWithdrawRequest(vendorName: string, action: string){
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

}
