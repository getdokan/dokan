import { Page, } from '@playwright/test';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { reverseWithdraw, date } from 'utils/interfaces';


export class ReverseWithdrawsPage extends CustomerPage {

	constructor(page: Page) {
		super(page);
	}


	// reverse withdraw

	// regenerate reverse withdrawal payment product
	async reCreateReverseWithdrawalPaymentViaSettingsSave(){
		await this.goIfNotThere(data.subUrls.backend.dokan.settings);

		await this.click(selector.admin.dokan.settings.menus.reverseWithdrawal);
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
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.filters.filteredResult(vendorName));
		await this.toBeVisible(selector.admin.dokan.reverseWithdraw.reverseWithdrawCell(vendorName));
	}


	// add new reverse withdrawal
	async addReverseWithdrawal(reverseWithdrawal: reverseWithdraw){
		await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

		await this.click(selector.admin.dokan.reverseWithdraw.addNewReverseWithdrawal);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectVendorDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectVendorInput, reverseWithdrawal.store);
		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectOption(reverseWithdrawal.store));

		// await this.toContainText(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.searchedResult, reverseWithdrawal.store);
		// await this.press(data.key.arrowDown);
		// await this.press(data.key.enter);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.transactionType(reverseWithdrawal.transactionType));

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectProductDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectProductInput, reverseWithdrawal.product);
		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.selectOption(reverseWithdrawal.product));
		// await this.toContainText(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.searchedResult, reverseWithdrawal.product);
		// await this.press(data.key.enter);

		await this.click(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.withdrawalBalanceType(reverseWithdrawal.withdrawalBalanceType));

		await this.clearAndType(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.reverseWithdrawalAmount, reverseWithdrawal.amount);
		await this.clearAndType(selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.note, reverseWithdrawal.note);

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, selector.admin.dokan.reverseWithdraw.addReverseWithdrawal.save);
	}


	// vendor


	// reverse withdrawal render properly
	async vendorReverseWithdrawalRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

		// reverse withdrawal text is visible
		await this.toBeVisible(selector.vendor.vReverseWithdrawal.reverseWithdrawalText);

		// reverse balance section elements are visible
		await this.multipleElementVisible(selector.vendor.vReverseWithdrawal.reverseBalanceSection);

		// filter elements are visible
		await this.toBeVisible(selector.vendor.vReverseWithdrawal.filters.dateRangeInput);
		await this.toBeVisible(selector.vendor.vReverseWithdrawal.filters.filter);

		// reverse withdrawal table elements are visible
		await this.multipleElementVisible(selector.vendor.vReverseWithdrawal.table);

		// opening balance row is visible
		await this.toBeVisible(selector.vendor.vReverseWithdrawal.openingBalanceRow);

	}

	// reverse withdraw notice render properly
	async vendorViewReverseWithdrawalNotice(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

		await this.toBeVisible(selector.vendor.vReverseWithdrawal.reverseWithdrawalNotice.noticeText);
		// const noticeText = await this.getElementText(selector.vendor.vReverseWithdrawal.reverseWithdrawalNotice.noticeText);

		// expect(noticeText).toContain('Your products add to cart will be hidden. Hence users will not be able to purchase any of your products.');
		// expect(noticeText).toContain('Withdraw menu will be hidden. Hence you will not be able to make any withdraw request from your account.');
		// expect(noticeText).toContain('Your account will be disabled for selling. Hence you will no longer be able to sell any products.');

		// expect(noticeText).toContain('Your products add to cart button has been temporarily hidden. Hence users are not able to purchase any of your products');
		// expect(noticeText).toContain('Withdraw menu has been temporarily hidden. Hence you are not able to make any withdrawal requests from your account.');
		// expect(noticeText).toContain('Kindly pay your due to start selling again.');
	}

	// view reverse withdraw announcement
	async vendorViewReverseWithdrawalAnnouncement(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
		await this.clickAndWaitForLoadState(selector.vendor.vAnnouncement.firstAnnouncementLink('You have a reverse withdrawal balance of'));
		await this.toContainText(selector.vendor.vAnnouncement.announcement.title, 'You have a reverse withdrawal balance of');
	}

	// filter reverse withdraws
	async vendorFilterReverseWithdrawals(inputValue: date['dateRange']){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

		await this.setAttributeValue(selector.vendor.vReverseWithdrawal.filters.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
		await this.setAttributeValue(selector.vendor.vReverseWithdrawal.filters.startDateInput, 'value', inputValue.startDate);
		await this.setAttributeValue(selector.vendor.vReverseWithdrawal.filters.endDateInput, 'value', inputValue.endDate);
		await this.clickAndWaitForLoadState(selector.vendor.vReverseWithdrawal.filters.filter);
		await this.notToHaveCount(selector.vendor.vReverseWithdrawal.numberOfRowsFound, 3);

	}

	// pay reverse pay balance
	async vendorPayReversePayBalance(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReverseWithdrawal.payNow);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.checkout, selector.vendor.vReverseWithdrawal.confirmAction);
		const orderId = await this.paymentOrder();
		return orderId;
	}

}
