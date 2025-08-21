import test, { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

export class FollowStorePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // enable follow store module
    async enableFollowStoreModule() {
        // vendor dashboard menu
        test.step('ADMIN: Go to vendor dashboard to enable follow store module', async () => {
            await this.goto(data.subUrls.frontend.vDashboard.dashboard);
            await this.toBeVisible(selector.vendor.vDashboard.menus.primary.followers);
        });
        // my account menu
        test.step('CUSTOMER: Validate that the module is enabled and added to my account menu', async () => {
            await this.goto(data.subUrls.frontend.myAccount);
            await this.toBeVisible(selector.customer.cMyAccount.menus.vendors);
        });

    }

    // disable follow store module
    async disableFollowStoreModule() {
        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.notToBeVisible(selector.vendor.vDashboard.menus.primary.followers);

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.followers);
        await this.toBeVisible(selector.frontend.pageNotFound);

        // my account menu
        await this.goto(data.subUrls.frontend.myAccount);
        await this.notToBeVisible(selector.customer.cMyAccount.menus.vendors);

        // my account menu page
        await this.goto(data.subUrls.frontend.followingStores);
        await this.toBeVisible(selector.frontend.pageNotFound);
    }

    // vendor Followers

    // vendor followers render properly
    async vendorFollowersRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.followers);

        // Store followers text is visible
        await this.toBeVisible(selector.vendor.vFollowers.storeFollowersText);

        // vendor followers table elements are visible
        await this.multipleElementVisible(selector.vendor.vFollowers.table);
    }

    // vendor followers render properly
    async vendorViewFollowers() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.followers);
        await this.notToHaveCount(selector.vendor.vFollowers.numberOfRowsFound, 0);
    }

    // customer
    async customerFollowedVendorsRenderProperly() {
        const url = data.subUrls.frontend.followingStores;
        await this.goIfNotThere(url, 'domcontentloaded', true);
        await this.notToHaveCount(selector.customer.cVendors.storeCard.storeCardDiv, 0);
        const noVendorsFound = await this.isVisible(selector.customer.cVendors.noVendorFound);
        console.log('noVendorsFound: ', noVendorsFound);
        if (noVendorsFound) {
            await this.toContainText(selector.customer.cVendors.noVendorFound, 'No vendor found!');
            console.log('No vendor followed');
            return;
        }
    }
    

    // customer view followed vendors
    async customerViewFollowedVendors(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.followingStores, 'domcontentloaded', true);
        await this.toBeVisible(selector.customer.cVendors.followedStore(storeName));
    }

    // follow vendor
    async followUnfollowStore(storeName: string, status: string, location: string): Promise<void> {
        switch (location) {
            // store listing page
            case 'storeListing':
                await this.searchStore(storeName);
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cStoreList.followUnFollowStore(storeName));
                await this.toContainText(selector.customer.cStoreList.currentFollowStatus(storeName), status);
                break;

            // single store page
            case 'singleStore':
                await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cStoreList.followUnFollowStoreSingleStore);
                await this.toContainText(selector.customer.cStoreList.currentFollowStatusSingleStore, status);
                break;

            default:
                break;
        }
    }
}
