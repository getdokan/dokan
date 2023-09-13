import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

export class FollowStorePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
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
        await this.notToHaveCount(
            selector.vendor.vFollowers.numberOfRowsFound,
            0,
        );
    }

    // customer

    async customerFollowedVendorsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vendors);

        const noVendorsFound = await this.isVisible(
            selector.customer.cVendors.noVendorFound,
        );
        if (noVendorsFound) {
            await this.toContainText(
                selector.customer.cVendors.noVendorFound,
                'No vendor found!',
            );
            return;
        }

        await this.notToHaveCount(
            selector.customer.cVendors.storeCard.storeCardDiv,
            0,
        );
    }

    // follow vendor
    async followStore(
        storeName: string,
        followLocation: string,
    ): Promise<void> {
        let currentFollowStatus: boolean;

        switch (followLocation) {
            // store listing page
            case 'storeListing':
                await this.searchStore(storeName);
                currentFollowStatus = await this.hasText(
                    selector.customer.cStoreList.currentFollowStatus(storeName),
                    'Following',
                );
                // unfollow if not already
                if (currentFollowStatus) {
                    await this.clickAndWaitForResponse(
                        data.subUrls.ajax,
                        selector.customer.cStoreList.followUnFollowStore(
                            storeName,
                        ),
                    );
                    await this.toContainText(
                        selector.customer.cStoreList.currentFollowStatus(
                            storeName,
                        ),
                        'Follow',
                    );
                }
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cStoreList.followUnFollowStore(storeName),
                );
                await this.toContainText(
                    selector.customer.cStoreList.currentFollowStatus(storeName),
                    'Following',
                );
                break;

            // single store page
            case 'singleStore':
                await this.goIfNotThere(
                    data.subUrls.frontend.vendorDetails(
                        helpers.slugify(storeName),
                    ),
                );
                currentFollowStatus = await this.hasText(
                    selector.customer.cStoreList.currentFollowStatusSingleStore,
                    'Following',
                );

                // unfollow if not already
                if (currentFollowStatus) {
                    await this.clickAndWaitForResponse(
                        data.subUrls.ajax,
                        selector.customer.cStoreList
                            .followUnFollowStoreSingleStore,
                    );
                    await this.toContainText(
                        selector.customer.cStoreList
                            .currentFollowStatusSingleStore,
                        'Follow',
                    );
                }
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cStoreList.followUnFollowStoreSingleStore,
                );
                await this.toContainText(
                    selector.customer.cStoreList.currentFollowStatusSingleStore,
                    'Following',
                );
                break;

            default:
                break;
        }
    }
}
