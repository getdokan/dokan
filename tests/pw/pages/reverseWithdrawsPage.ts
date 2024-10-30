import { Page, expect } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { reverseWithdraw, date } from '@utils/interfaces';

// selectors
const reverseWithdrawAdmin = selector.admin.dokan.reverseWithdraw;
const reverseWithdrawVendor = selector.vendor.vReverseWithdrawal;
const vendorDashboard = selector.vendor.vDashboard;

export class ReverseWithdrawsPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // reverse withdraw

    // regenerate reverse withdrawal payment product
    async reCreateReverseWithdrawalPaymentViaSettingsSave() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);

        await this.click(selector.admin.dokan.settings.menus.reverseWithdrawal);
        await this.clickAndWaitForLoadState(selector.admin.dokan.settings.reverseWithdraw.reverseWithdrawSaveChanges);
    }

    // reverse withdraw render properly
    async adminReverseWithdrawRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

        // reverse withdraw text is visible
        await this.toBeVisible(reverseWithdrawAdmin.reverseWithdrawText);

        // add new reverse withdrawal is visible
        await this.toBeVisible(reverseWithdrawAdmin.addNewReverseWithdrawal);

        // fact cards elements are visible
        await this.multipleElementVisible(reverseWithdrawAdmin.reverseWithdrawFactCards);

        // filter elements are visible
        const { filterInput, clearFilterCrossButton, filteredResult, ...filters } = reverseWithdrawAdmin.filters;
        await this.multipleElementVisible(filters);

        // reverse withdraw table elements are visible
        await this.multipleElementVisible(reverseWithdrawAdmin.table);
    }

    // filter reverse withdraws
    async filterReverseWithdraws(vendorName: string) {
        await this.goto(data.subUrls.backend.dokan.reverseWithdraws);

        //await this.clickAndWaitForResponse(data.subUrls.api.dokan.reverseWithdraws, reverseWithdrawAdmin.filters.clearFilter);

        await this.click(reverseWithdrawAdmin.filters.filterByStore);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.reverseWithdraws, reverseWithdrawAdmin.filters.filterInput, vendorName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, reverseWithdrawAdmin.filters.filteredResult(vendorName));
        await this.toBeVisible(reverseWithdrawAdmin.reverseWithdrawCell(vendorName));
    }

    // clear filter reverse withdraws
    async clearFilterReverseWithdraws(vendorName: string) {
        await this.filterReverseWithdraws(vendorName);
        await this.toBeVisible(reverseWithdrawAdmin.filters.clearFilterCrossButton);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.reverseWithdraws, reverseWithdrawAdmin.filters.clearFilter);
        await this.notToBeVisible(reverseWithdrawAdmin.filters.clearFilterCrossButton);
    }

    // add new reverse withdrawal
    async addReverseWithdrawal(reverseWithdrawal: reverseWithdraw) {
        await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);

        await this.click(reverseWithdrawAdmin.addNewReverseWithdrawal);

        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.selectVendorDropdown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, reverseWithdrawAdmin.addReverseWithdrawal.selectVendorInput, reverseWithdrawal.store);
        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.selectOption(reverseWithdrawal.store));

        // await this.toContainText(reverseWithdrawAdmin.addReverseWithdrawal.searchedResult, reverseWithdrawal.store);
        // await this.press(data.key.arrowDown);
        // await this.press(data.key.enter);

        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.transactionType(reverseWithdrawal.transactionType));

        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.selectProductDropdown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, reverseWithdrawAdmin.addReverseWithdrawal.selectProductInput, reverseWithdrawal.product);
        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.selectOption(reverseWithdrawal.product));
        // await this.toContainText(reverseWithdrawAdmin.addReverseWithdrawal.searchedResult, reverseWithdrawal.product);
        // await this.press(data.key.enter);

        await this.click(reverseWithdrawAdmin.addReverseWithdrawal.withdrawalBalanceType(reverseWithdrawal.withdrawalBalanceType));

        await this.clearAndType(reverseWithdrawAdmin.addReverseWithdrawal.reverseWithdrawalAmount, reverseWithdrawal.amount);
        await this.clearAndType(reverseWithdrawAdmin.addReverseWithdrawal.note, reverseWithdrawal.note);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.reverseWithdraws, reverseWithdrawAdmin.addReverseWithdrawal.save);
    }

    // vendor

    // reverse withdrawal render properly
    async vendorReverseWithdrawalRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

        // reverse withdrawal text is visible
        await this.toBeVisible(reverseWithdrawVendor.reverseWithdrawalText);

        // reverse balance section elements are visible
        await this.multipleElementVisible(reverseWithdrawVendor.reverseBalanceSection);

        // filter elements are visible
        await this.toBeVisible(reverseWithdrawVendor.filters.dateRangeInput);
        await this.toBeVisible(reverseWithdrawVendor.filters.filter);

        // reverse withdrawal table elements are visible
        await this.multipleElementVisible(reverseWithdrawVendor.table);

        // opening balance row is visible
        await this.toBeVisible(reverseWithdrawVendor.openingBalanceRow);
    }

    // reverse withdraw notice render properly
    async vendorViewReverseWithdrawalNotice(gracePeriod?: string) {
        await this.goto(data.subUrls.frontend.vDashboard.reverseWithdrawal);

        await this.notToHaveCount(reverseWithdrawVendor.reverseWithdrawalNotice.noticeText, 0);

        if (gracePeriod == 'grace-period') {
            const noticeText = await this.getElementText(reverseWithdrawVendor.reverseWithdrawalNotice.noticeTextGracePeriod);
            // while in grace period
            expect(noticeText).toContain('Your products add to cart will be hidden. Hence users will not be able to purchase any of your products.');
            expect(noticeText).toContain('Withdraw menu will be hidden. Hence you will not be able to make any withdraw request from your account.');
            expect(noticeText).toContain('Your account will be disabled for selling. Hence you will no longer be able to sell any products.');
        } else {
            const noticeText = await this.getElementText(reverseWithdrawVendor.reverseWithdrawalNotice.noticeTextAfterGracePeriod);
            // after grace period
            expect(noticeText).toContain('Your products add to cart button has been temporarily hidden. Hence users are not able to purchase any of your products');
            expect(noticeText).toContain('Withdraw menu has been temporarily hidden. Hence you are not able to make any withdrawal requests from your account.');
            expect(noticeText).toContain('Kindly pay your due to start selling again.');
        }
    }

    // view reverse withdraw announcement
    async vendorViewReverseWithdrawalAnnouncement() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
        await this.clickAndWaitForLoadState(selector.vendor.vAnnouncement.firstAnnouncementLink('You have a reverse withdrawal balance of'));
        await this.toContainText(selector.vendor.vAnnouncement.announcement.title, 'You have a reverse withdrawal balance of');
    }

    // filter reverse withdraws
    async vendorFilterReverseWithdrawals(inputValue: date['dateRange']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

        await this.setAttributeValue(reverseWithdrawVendor.filters.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
        await this.setAttributeValue(reverseWithdrawVendor.filters.startDateInput, 'value', inputValue.startDate);
        await this.setAttributeValue(reverseWithdrawVendor.filters.endDateInput, 'value', inputValue.endDate);
        await this.clickAndWaitForLoadState(reverseWithdrawVendor.filters.filter);
        await this.notToHaveCount(reverseWithdrawVendor.numberOfRowsFound, 3);
    }

    // vendor can't withdraw when reverse withdrawal rule applied
    async vendorCantWithdraw() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
        await this.notToBeVisible(vendorDashboard.menus.primary.withdraw);
    }

    // vendor status is inactive when reverse withdrawal rule applied
    async vendorStatusInactive() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
        await this.toContainText(vendorDashboard.dokanNotice, 'Error! Your account is not enabled for selling, please contact the admin');
    }

    // vendor product in catalog mode when reverse withdrawal rule applied
    async vendorProductsInCatalogMode(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToHaveCount(selector.customer.cSingleStore.productCard.readMore, 0);
    }

    // pay reverse pay balance
    async vendorPayReversePayBalance() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reverseWithdrawal);

        await this.clickAndWaitForResponse(data.subUrls.ajax, reverseWithdrawVendor.payNow);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.checkout, reverseWithdrawVendor.confirmAction);
        const orderId = await this.paymentOrder();
        return orderId;
    }
}
