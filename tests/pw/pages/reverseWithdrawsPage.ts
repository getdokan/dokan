import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';


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
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.filters.filteredResult(vendorName));
		//TODO: wait for load then assert
		// await this.toBeVisible(selector.admin.dokan.reverseWithdraw.revereWithdrawCell(vendorName));

	}

}
