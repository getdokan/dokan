import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

export class FollowStorePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    async enableFollowStoreModule() {
        await this.goto(data.subUrls.frontend.myAccount);
        await this.toBeVisible(selector.customer.cMyAccount.menus.vendors);
    }

    async disableFollowStoreModule() {
        await this.goto(data.subUrls.frontend.myAccount);
        await this.notToBeVisible(selector.customer.cMyAccount.menus.vendors);

        await this.goto(data.subUrls.frontend.followingStores);
        await this.toBeVisible(selector.frontend.pageNotFound);
    }

    async vendorFollowersRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.followers);
        await this.toBeVisible(selector.vendor.vFollowers.storeFollowersText);
        await this.multipleElementVisible(selector.vendor.vFollowers.table);
    }

    async vendorViewFollowers() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.followers);
        await this.notToHaveCount(selector.vendor.vFollowers.numberOfRowsFound, 0);
    }

    async customerFollowedVendorsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.followingStores);

        const noVendorsFound = await this.isVisible(selector.customer.cVendors.noVendorFound);
        if (noVendorsFound) {
            await this.toContainText(selector.customer.cVendors.noVendorFound, 'No vendor found!');
            console.log('No vendor followed');
            return;
        }

        await this.notToHaveCount(selector.customer.cVendors.storeCard.storeCardDiv, 0);
    }

    async customerViewFollowedVendors(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.followingStores);
        await this.toBeVisible(selector.customer.cVendors.followedStore(storeName));
    }

    async followUnfollowStore(storeName: string, status: string, location: string): Promise<void> {
        switch (location) {
            case 'storeListing':
                await this.searchStore(storeName);
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cStoreList.followUnFollowStore(storeName)
                );
                await this.toContainText(
                    selector.customer.cStoreList.currentFollowStatus(storeName),
                    status
                );
                break;

            case 'singleStore':
                await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cStoreList.followUnFollowStoreSingleStore
                );
                await this.toContainText(
                    selector.customer.cStoreList.currentFollowStatusSingleStore,
                    status
                );
                break;

            default:
                throw new Error(`Unknown location: ${location}`);
        }
    }
}
