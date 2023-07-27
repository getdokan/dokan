import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { reverseWithdraw } from 'utils/interfaces';


export class ReverseWithdrawsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// reverse withdraw

	// regenerate reverse withdrawal payment product
	async reCreateReverseWithdrawalPaymentViaSettingsSave(){
		await this.goToDokanSettings();
		await this.click(selector.admin.dokan.settings.menus.reverseWithdrawal);
		// await this.clickAndWaitForNavigation(selector.admin.dokan.settings.reverseWithdraw.reverseWithdrawSaveChanges);
		await this.clickAndWaitForLoadState(selector.admin.dokan.settings.reverseWithdraw.reverseWithdrawSaveChanges);
	}


	// reverse withdraw render properly
	async adminReverseWithdrawRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

		// reverse withdraw text is visible
		await this.toBeVisible(selector.admin.dokan.reverseWithdraw.reverseWithdrawText);

		// add new reverse withdrawal is visible
		await this.toBeVisible(selector.admin.dokan.reverseWithdraw.addNewReverseWithdrawal);

		// fact cards elements are visible
		await this.multipleElementVisible(selector.admin.dokan.reverseWithdraw.reverseWithdrawFactCards);

		// filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterInput, clearFilter, filteredResult,  ...filters } = selector.admin.dokan.reverseWithdraw.filters;
		await this.multipleElementVisible(filters);

		// reverse withdraw table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.reverseWithdraw.table);
	}


	// filter reverse withdraws
	async filterReverseWithdraws(vendorName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

		await this.clickIfVisible(selector.admin.dokan.reverseWithdraw.filters.clearFilter);

		await this.click(selector.admin.dokan.reverseWithdraw.filters.filterByStore);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.filters.filterInput, vendorName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.filters.filteredResult(vendorName)); //TODO: test this
		//TODO: wait for load then assert
		await this.toBeVisible(selector.admin.dokan.reverseWithdraw.revereWithdrawCell(vendorName));
	}


	// add new reverse withdrawal
	async addReverseWithdrawal(reverseWithdrawal: reverseWithdraw){
		await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

		await this.click(selector.admin.dokan.reverseWithdraw.addNewReverseWithdrawal);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectVendorDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectVendorInput, reverseWithdrawal.store);
		await this.press(data.key.arrowDown);
		await this.press(data.key.enter);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.transactionType(reverseWithdrawal.transactionType));

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectProductDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectProductInput, reverseWithdrawal.product);
		await this.press(data.key.enter);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.withdrawalBalanceType(reverseWithdrawal.withdrawalBalanceType));

		await this.clearAndType(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.reverseWithdrawalAmount, reverseWithdrawal.amount);
		await this.clearAndType(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.note, reverseWithdrawal.note);

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.save);
	}

}
