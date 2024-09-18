import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { LoginPage } from '@pages/loginPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { USER_PASSWORD } = process.env;

// selectors
const adminSubscriptions = selector.admin.dokan.subscriptions;
const vendorSubscriptions = selector.vendor.vSubscriptions;
const vendors = selector.admin.dokan.vendors;

export class VendorSubscriptionsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);
    loginPage = new LoginPage(this.page);

    // admin

    // subscriptions render properly
    async subscriptionsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.subscriptions);

        // subscribed vendor list is visible
        await this.toBeVisible(adminSubscriptions.subscribedVendorList);

        // bulk action elements are visible
        await this.multipleElementVisible(adminSubscriptions.bulkActions);

        // filter elements are visible
        const { filterByVendorsInput, filterBySubscriptionPackInput, filteredResult, ...filters } = adminSubscriptions.filters;
        await this.multipleElementVisible(filters);

        // subscription table elements are visible
        await this.multipleElementVisible(adminSubscriptions.table);

        const noSubscribedVendorsFound = await this.isVisible(adminSubscriptions.noRowsFound);
        if (noSubscribedVendorsFound) {
            return;
        }

        await this.notToHaveCount(adminSubscriptions.numberOfRowsFound, 0);
    }

    // filter subscribed vendors
    async filterSubscribedVendors(input: string, action: string) {
        await this.goto(data.subUrls.backend.dokan.subscriptions);
        await this.reload(); // todo: fix this

        switch (action) {
            case 'by-vendor':
                await this.click(adminSubscriptions.filters.filterByVendors);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.filters.filterByVendorsInput, input);
                break;

            case 'by-pack':
                await this.click(adminSubscriptions.filters.filterBySubscriptionPack);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.filters.filterBySubscriptionPackInput, input);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.filters.filteredResult(input));
        await this.notToHaveText(adminSubscriptions.numberOfRowsFound, '0 items');
        await this.notToBeVisible(adminSubscriptions.noRowsFound);
    }

    // cancel subscriptions
    async cancelSubscription(vendor: string, option: string) {
        await this.goto(data.subUrls.backend.dokan.subscriptions);
        await this.reload(); // todo: fix this

        await this.click(adminSubscriptions.vendorSubscriptionsActions(vendor));
        if (option === 'immediately') {
            await this.click(adminSubscriptions.subscriptionAction.cancelImmediately);
            await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.subscriptionAction.cancelSubscription, 200);
            await this.notToBeVisible(adminSubscriptions.vendorSubscriptionsRow(vendor));
        } else {
            await this.click(adminSubscriptions.subscriptionAction.cancelAfterEndOfCurrentPeriod);
            await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.subscriptionAction.cancelSubscription, 200);
            await this.toBeVisible(adminSubscriptions.vendorSubscriptionsRow(vendor));
        }
    }

    // subscriptions bulk action
    async subscriptionsBulkAction(action: string, storeName?: string) {
        if (storeName) {
            await this.filterSubscribedVendors(storeName, 'by-vendor');
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.subscriptions);
        }

        // ensure row exists
        await this.notToBeVisible(adminSubscriptions.noRowsFound);

        await this.click(adminSubscriptions.bulkActions.selectAll);
        await this.selectByValue(adminSubscriptions.bulkActions.selectAction, action);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.subscriptions, adminSubscriptions.bulkActions.applyAction);
    }

    // assign suscription pack to vendor
    async assignSubscriptionPack(sellerId: string, subscriptionPack: string) {
        await this.goto(data.subUrls.backend.dokan.vendorDetailsEdit(sellerId));
        await this.click(vendors.editVendor.assignSubscriptionPackDropdown);
        await this.click(vendors.editVendor.selectSubscriptionPack(subscriptionPack));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
        await this.click(vendors.editVendor.closeUpdateSuccessModal);
    }

    // vendor

    // vendor subscriptions render properly
    async vendorSubscriptionsRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        }

        // subscribed pack info
        const hasSubscription = await this.isVisible(vendorSubscriptions.sellerSubscriptionInfo.sellerSubscriptionInfo);
        if (!hasSubscription) {
            console.log('No subscribed pack found!');
        } else {
            await this.toBeVisible(vendorSubscriptions.sellerSubscriptionInfo.sellerSubscriptionInfo);
        }

        // subscription pack list
        const noSubscriptionPacks = await this.isVisible(vendorSubscriptions.noSubscriptionMessage);

        if (noSubscriptionPacks) {
            await this.toContainText(vendorSubscriptions.noSubscriptionMessage, 'No subscription pack has been found!');
            console.log('No subscription pack found!');
        } else {
            await this.toBeVisible(vendorSubscriptions.dokanSubscriptionDiv);
            await this.toBeVisible(vendorSubscriptions.productCardContainer);

            await this.notToHaveCount(vendorSubscriptions.productCard.item, 0);
            await this.notToHaveCount(vendorSubscriptions.productCard.price, 0);
            await this.notToHaveCount(vendorSubscriptions.productCard.content, 0);
            await this.notToHaveCount(vendorSubscriptions.productCard.buyButton, 0);
        }
    }

    // vendor buy dokan subscription
    async buySubscription(username: string, subscriptionPack: string, switchPack = false): Promise<string> {
        await this.loginPage.login({ username: username, password: USER_PASSWORD });

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);

        // cancel active subscription if switching
        if (switchPack) {
            await this.vendorCancelSubscription(username, false);
        }

        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.checkout, vendorSubscriptions.buySubscription(subscriptionPack));
        const orderNumber = await this.customerPage.placeOrder();
        return orderNumber as string;
    }

    // assert subscribed subscription
    async assertSubscription(subscriptionPack: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        await this.toBeVisible(vendorSubscriptions.sellerSubscriptionInfo.sellerSubscriptionInfo);
        await this.toBeVisible(vendorSubscriptions.sellerSubscriptionInfo.subscribedPack(subscriptionPack));
    }

    // vendor cancel dokan subscription
    async vendorCancelSubscription(username: string, login = true) {
        if (login) await this.loginPage.login({ username: username, password: USER_PASSWORD });

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        await this.click(vendorSubscriptions.sellerSubscriptionInfo.cancelSubscription);
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.subscriptions, vendorSubscriptions.sellerSubscriptionInfo.confirmCancelSubscription);
        await this.toContainText(vendorSubscriptions.sellerSubscriptionInfo.cancelSuccessMessage, 'Your subscription has been cancelled! ');
    }
}
