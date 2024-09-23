import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const withdrawsAdmin = selector.admin.dokan.withdraw;
const withdrawsVendor = selector.vendor.vWithdraw;

export class WithdrawsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // withdraws

    // withdraws render properly
    async adminWithdrawsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

        // withdraw text is visible
        await this.toBeVisible(withdrawsAdmin.withdrawText);

        // navTab elements are visible
        const { tabByStatus, ...navTabs } = withdrawsAdmin.navTabs;
        await this.multipleElementVisible(navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(withdrawsAdmin.bulkActions);

        // filter elements are visible
        const { filterInput, clearFilter, result, filteredResult, ...filters } = withdrawsAdmin.filters;
        await this.multipleElementVisible(filters);

        // withdraw table elements are visible
        await this.multipleElementVisible(withdrawsAdmin.table);
    }

    // filter withdraws
    async filterWithdraws(input: string, action: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.withdraw);

        switch (action) {
            case 'by-status': {
                await this.clickAndWaitForLoadState(withdrawsAdmin.navTabs.tabByStatus(input));
                return;
            }

            case 'by-vendor':
                await this.click(withdrawsAdmin.filters.filterByVendor);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, withdrawsAdmin.filters.filterInput, input);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.filters.filteredResult(input));
                break;

            case 'by-payment-method':
                // add toPass to remove flakyness
                await this.toPass(async () => {
                    await this.reload(); // todo: need to resolve this
                    await this.click(withdrawsAdmin.filters.filterByPaymentMethods);
                    await this.clearAndType(withdrawsAdmin.filters.filterInput, input);
                    await this.toContainText(withdrawsAdmin.filters.result, input);
                });
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.withdraws, data.key.enter);
                break;

            default:
                break;
        }
        await this.notToHaveText(withdrawsAdmin.numberOfRowsFound, '0 items'); // todo: add assertions to all filter tests like
        await this.notToBeVisible(withdrawsAdmin.noRowsFound);

        // clear filter
        await this.click(withdrawsAdmin.filters.clearFilter); // todo: add clear filter in bottom of every filter tests
    }

    // export withdraws
    async exportWithdraws() {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);
        await this.clickAndWaitForDownload(withdrawsAdmin.exportWithdraws);
    }

    // add note to withdraw request
    async addNoteWithdrawRequest(vendorName: string, note: string): Promise<void> {
        await this.filterWithdraws(vendorName, 'by-vendor');

        await this.click(withdrawsAdmin.withdrawAddNote(vendorName));
        await this.clearAndType(withdrawsAdmin.addNote, note);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.updateNote);
    }

    // update withdraw request
    async updateWithdrawRequest(vendorName: string, action: string): Promise<void> {
        await this.filterWithdraws(vendorName, 'by-vendor');

        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawApprove(vendorName));
                break;

            case 'cancel':
                await this.hover(withdrawsAdmin.withdrawCell(vendorName));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawCancel(vendorName));
                break;

            case 'delete':
                await this.hover(withdrawsAdmin.withdrawCell(vendorName));
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawDelete(vendorName));
                break;

            default:
                break;
        }
    }

    // withdraw bulk action
    async withdrawBulkAction(action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

        // ensure row exists
        await this.notToBeVisible(withdrawsAdmin.noRowsFound);

        await this.click(withdrawsAdmin.bulkActions.selectAll);
        await this.selectByValue(withdrawsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.bulkActions.applyAction);
    }

    // withdraw

    // withdraw render properly
    async vendorWithdrawRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);

        // withdraw text is visible
        await this.toBeVisible(withdrawsVendor.withdrawText);

        // balance elements are visible
        const { balanceLite, balancePro, ...balance } = withdrawsVendor.balance;
        await this.multipleElementVisible(balance);
        if (DOKAN_PRO) {
            await this.toBeVisible(balancePro);
        } else {
            await this.toBeVisible(balanceLite);
        }

        // request withdraw is visible
        await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.requestWithdraw);

        // payment details manual elements are visible
        await this.multipleElementVisible(withdrawsVendor.paymentDetails.manual);

        // view payments is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.viewPayments);

        if (DOKAN_PRO) {
            // payment details schedule elements are visible
            await this.multipleElementVisible(withdrawsVendor.paymentDetails.schedule);

            // enable & edit schedule is visible
            await this.toBeVisible(withdrawsVendor.autoWithdrawDisbursement.enableSchedule);
            await this.toBeVisible(withdrawsVendor.autoWithdrawDisbursement.editSchedule);
        }

        // todo:  pending request can be added

        // withdraw payment methods div elements are visible
        await this.toBeVisible(withdrawsVendor.withdrawPaymentMethods.paymentMethodsDiv);

        await this.notToHaveCount(withdrawsVendor.withdrawPaymentMethods.paymentMethods, 0);

        // todo: add request & disbursement modal
    }

    // withdraw requests render properly
    async vendorWithdrawRequestsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdrawRequests);

        // withdraw requests menus are visible
        await this.multipleElementVisible(withdrawsVendor.viewPayments.menus);

        // request withdraw button is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.requestWithdraw);

        // withdraw dashboard button is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.withdrawDashboard);

        // withdraw requests table elements are visible
        await this.multipleElementVisible(withdrawsVendor.viewPayments.table);
    }

    // vendor request withdraw
    async requestWithdraw(withdraw: vendor['withdraw']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        if (helpers.price(withdraw.currentBalance) > helpers.price(withdraw.minimumWithdrawAmount)) {
            await this.click(withdrawsVendor.manualWithdrawRequest.requestWithdraw);
            await this.clearAndType(withdrawsVendor.manualWithdrawRequest.withdrawAmount, String(withdraw.minimumWithdrawAmount));
            await this.selectByValue(withdrawsVendor.manualWithdrawRequest.withdrawMethod, withdraw.withdrawMethod.default);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, withdrawsVendor.manualWithdrawRequest.submitRequest);
            await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.withdrawRequestSaveSuccessMessage);
            await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.pendingRequestDiv);
        } else {
            throw new Error('Current balance is less than minimum withdraw amount');
        }
    }

    // vendor can't request withdraw when pending request exists
    async cantRequestWithdraw(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.click(withdrawsVendor.manualWithdrawRequest.requestWithdraw);
        await this.toContainText(withdrawsVendor.manualWithdrawRequest.pendingRequestAlert, withdrawsVendor.manualWithdrawRequest.pendingRequestAlertMessage);
        await this.click(withdrawsVendor.manualWithdrawRequest.closeModal);
    }

    // vendor cancel withdraw request
    async cancelWithdrawRequest(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.withdrawRequests, withdrawsVendor.manualWithdrawRequest.cancelRequest, 302);
        await this.toContainText(withdrawsVendor.manualWithdrawRequest.cancelWithdrawRequestSuccess, withdrawsVendor.manualWithdrawRequest.cancelWithdrawRequestSaveSuccessMessage);
    }

    // vendor add auto withdraw disbursement schedule
    async addAutoWithdrawDisbursementSchedule(withdraw: vendor['withdraw']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.enableSwitcherDisbursement(withdrawsVendor.autoWithdrawDisbursement.enableSchedule);
        await this.click(withdrawsVendor.autoWithdrawDisbursement.editSchedule);
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.preferredPaymentMethod, withdraw.preferredPaymentMethod);
        await this.click(withdrawsVendor.autoWithdrawDisbursement.preferredSchedule(withdraw.preferredSchedule));
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.onlyWhenBalanceIs, withdraw.minimumWithdrawAmount);
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.maintainAReserveBalance, withdraw.reservedBalance);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, withdrawsVendor.autoWithdrawDisbursement.changeSchedule);
        await this.notToContainText(withdrawsVendor.autoWithdrawDisbursement.scheduleMessage, data.vendor.withdraw.scheduleMessageInitial);
    }

    // vendor add default withdraw payment methods
    async addDefaultWithdrawPaymentMethods(preferredSchedule: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        const methodIsDefault = await this.isVisible(withdrawsVendor.withdrawPaymentMethods.defaultMethod(preferredSchedule));
        if (!methodIsDefault) {
            await this.clickAndWaitForLoadState(withdrawsVendor.withdrawPaymentMethods.makeMethodDefault(preferredSchedule));
            await this.toBeVisible(withdrawsVendor.withdrawPaymentMethods.defaultMethod(preferredSchedule));
        }
    }
}
