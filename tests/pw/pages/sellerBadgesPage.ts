import { Page, expect, test } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { StoresPage } from '@pages/storesPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { sellerBadge } from '@utils/interfaces';

// selectors
const sellerBadgeAdmin = selector.admin.dokan.sellerBadge;
const sellerBadgeVendor = selector.vendor.vBadges;

export class SellerBadgesPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    storesPage = new StoresPage(this.page);

    // seller badge

    // seller badge render properly
    async adminSellerBadgeRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);

        // seller badge text is visible
        await this.toBeVisible(sellerBadgeAdmin.sellerBadgeText);

        // create badge is visible
        await this.toBeVisible(sellerBadgeAdmin.createBadge);

        // nav tabs are visible
        await this.multipleElementVisible(sellerBadgeAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.bulkActions);

        // search seller badge is visible
        await this.toBeVisible(sellerBadgeAdmin.search);

        //  seller badge table elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.table);
    }

    // search seller badge
    async searchSellerBadge(badgeName: string) {
        await this.goto(data.subUrls.backend.dokan.sellerBadge);

        await this.clearInputField(sellerBadgeAdmin.search);
        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.search, badgeName);
        await this.toBeVisible(sellerBadgeAdmin.sellerBadgeCell(badgeName));
        await this.toHaveCount(sellerBadgeAdmin.numberOfRows, 1);
    }

    // view seller badge
    async viewSellerBadge(badgeName: string) {
        await this.searchSellerBadge(badgeName);

        await this.hover(sellerBadgeAdmin.sellerBadgeRow(badgeName));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeEdit(badgeName));

        // badge condition box is visible
        await this.toBeVisible(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeConditionBox);

        // badge event elements are visible
        const { badgeEvent, badgePublishedStatus, ...badgeEvents } = sellerBadgeAdmin.badgeDetails.badgeEvents;
        await this.multipleElementVisible(badgeEvents);

        // badge photo elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.badgeDetails.badgePhoto);

        // badge status elements are visible
        const { create, ...badgeStatus } = sellerBadgeAdmin.badgeDetails.badgeStatus;
        await this.multipleElementVisible(badgeStatus);
    }

    // create seller badge
    async createSellerBadge(badge: sellerBadge) {
        await this.goto(data.subUrls.backend.dokan.sellerBadge);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadgeEvent, sellerBadgeAdmin.createBadge);
        await this.click(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeEventDropdown);
        await this.click(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeEvent(badge.badgeName));
        await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeName, badge.badgeName);

        const isLevelExists = await this.isVisible(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue);
        if (isLevelExists) {
            await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue, badge.startingLevelValue);
            for (let i = 1; i < badge.maxLevel; i++) {
                await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel);
            }
        } else {
            if (badge.badgeName === 'Trending Product') {
                await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductPeriod, badge.trendingProductPeriod);
                await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct, badge.trendingProductTopBestSellingProduct);
            }
            if (badge.badgeName === 'Verified Seller') {
                // await this.selectByValue(sellerBadgeAdmin.badgeDetails.verifiedSellerMethod, badge.verificationMethod);
                const methods: string[] = Object.values(badge.verifiedSellerMethod);
                for (let i = 1; i <= methods.length; i++) {
                    await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeCondition.verifiedSellerMethod1(i), methods[i - 1] as string);
                    if (i === methods.length) {
                        continue;
                    }
                    await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel);
                }
            }
        }

        await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeStatus.badgeStatus, badge.badgeStatus);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.badgeDetails.badgeStatus.create);
        await this.click(sellerBadgeAdmin.badgeDetails.badgeAddedSuccessfully);
    }

    // edit seller badge
    async editSellerBadge(badge: sellerBadge) {
        await this.searchSellerBadge(badge.badgeName);

        await this.hover(sellerBadgeAdmin.sellerBadgeRow(badge.badgeName));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeEdit(badge.badgeName));

        await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeName, badge.badgeName);

        const isLevelExists = await this.isVisible(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue);
        if (isLevelExists) {
            // remove previous badge level
            const maxLevel = await this.countLocator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel);
            for (let i = 1; i < maxLevel; i++) {
                await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.removeBadgeLevel);
            }
            // add badge level
            await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue, badge.startingLevelValue);
            for (let i = 1; i < badge.maxLevel; i++) {
                await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel);
            }
        } else {
            if (badge.badgeName === 'Trending Product') {
                await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductPeriod, badge.trendingProductPeriod);
                await this.clearAndType(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct, badge.trendingProductTopBestSellingProduct);
            }
            if (badge.badgeName === 'Verified Seller') {
                // await this.selectByValue(sellerBadgeAdmin.badgeDetails.verifiedSellerMethod, badge.verificationMethod);
                // remove previous badge level
                await this.waitForSelector(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel);
                const maxLevel = await this.countLocator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel);
                for (let i = 1; i < maxLevel; i++) {
                    await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.removeBadgeLevel);
                }

                // add badge level
                const methods: string[] = Object.values(badge.verifiedSellerMethod);
                for (let i = 1; i <= methods.length; i++) {
                    await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeCondition.verifiedSellerMethod1(i), methods[i - 1] as string);
                    if (i === methods.length) {
                        continue;
                    }
                    await this.click(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel);
                }
            }
        }

        await this.selectByValue(sellerBadgeAdmin.badgeDetails.badgeStatus.badgeStatus, badge.badgeStatus);
        await this.click(sellerBadgeAdmin.badgeDetails.badgeStatus.update);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.badgeDetails.confirmBadgeUpdate);
        await this.click(sellerBadgeAdmin.badgeDetails.badgeAddedSuccessfully);
    }

    // preview seller badge
    async previewSellerBadge(badgeName: string) {
        await this.searchSellerBadge(badgeName);

        const badgeLevel = await this.getElementText(sellerBadgeAdmin.sellerBadgeLevel(badgeName));

        await this.hover(sellerBadgeAdmin.sellerBadgeRow(badgeName));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgePreview(badgeName));

        // badge preview modal is visible
        await this.toBeVisible(sellerBadgeAdmin.previewBadgeDetails.modal);

        // badge preview header elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.previewBadgeDetails.modalHeader);

        await this.toHaveCount(sellerBadgeAdmin.previewBadgeDetails.levelBox, Number(badgeLevel));

        await this.click(sellerBadgeAdmin.previewBadgeDetails.modalHeader.modalClose);
    }

    // filter vendors by badge
    async filterVendorsByBadge(badgeName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        await this.clickIfVisible(selector.admin.dokan.vendors.filters.clearFilter);
        await this.selectByLabel(selector.admin.dokan.vendors.filters.filterByBadges, badgeName);

        const count = (await this.getElementText(selector.admin.dokan.vendors.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // seller badge vendors
    async sellerBadgeVendors(badgeName: string) {
        await this.searchSellerBadge(badgeName);

        await this.hover(sellerBadgeAdmin.sellerBadgeRow(badgeName));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeVendors(badgeName));
        // await this.toBeVisible(selector.admin.dokan.vendors.vendorCell(badgeName));
        const count = (await this.getElementText(selector.admin.dokan.vendors.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // badges acquired by vendor
    async sellerBadgeAcquiredByVendor(vendorName: string) {
        await this.storesPage.searchVendor(vendorName);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.vendors.vendorViewDetails(vendorName));
        await this.toBeVisible(selector.admin.dokan.vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
    }

    // update seller badge
    async updateSellerBadge(badgeName: string, status: string) {
        await this.searchSellerBadge(badgeName);

        await this.hover(sellerBadgeAdmin.sellerBadgeRow(badgeName));

        switch (status) {
            case 'publish':
                await this.click(sellerBadgeAdmin.sellerBadgePublish(badgeName));
                break;

            case 'draft':
                await this.click(sellerBadgeAdmin.sellerBadgeDraft(badgeName));
                break;

            case 'delete':
                await this.click(sellerBadgeAdmin.sellerBadgeDelete(badgeName));
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.confirmAction);
        await this.click(sellerBadgeAdmin.successMessage);
    }

    // seller badge bulk action
    async sellerBadgeBulkAction(action: string, badgeName?: string) {
        if (badgeName) {
            await this.searchSellerBadge(badgeName);
        } else {
            await this.goto(data.subUrls.backend.dokan.sellerBadge);
        }

        // ensure row exists
        await this.notToBeVisible(sellerBadgeAdmin.noRowsFound);

        await this.click(sellerBadgeAdmin.bulkActions.selectAll);
        await this.selectByValue(sellerBadgeAdmin.bulkActions.selectAction, action);
        await this.click(sellerBadgeAdmin.bulkActions.applyAction);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.confirmAction);
        await this.click(sellerBadgeAdmin.successMessage);
    }

    // vendor seller badge render properly
    async vendorSellerBadgeRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);

        // badges text is visible
        await this.toBeVisible(sellerBadgeVendor.badgesText);

        // badge description text is visible
        await this.toBeVisible(sellerBadgeVendor.description);

        // badge search is visible
        await this.toBeVisible(sellerBadgeVendor.search);

        // badge filter  is visible
        await this.toBeVisible(sellerBadgeVendor.filterBadges);

        //  seller badge table elements are visible
        await this.multipleElementVisible(sellerBadgeVendor.table);
    }

    // vendor achieved badges congrats popup
    async sellerBadgeCongratsPopup() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);

        const congratsModalIsVisible = await this.isVisible(sellerBadgeVendor.congratsModal.sellerBadgeModal);
        if (congratsModalIsVisible) {
            //  seller badge congrats modal elements are visible
            await this.multipleElementVisible(sellerBadgeVendor.congratsModal);

            await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);
        } else {
            console.log('No Congrats message appeared');
        }
    }

    // vendor search seller badge
    async vendorSearchSellerBadge(badgeName: string) {
        await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);
        await this.clearAndType(sellerBadgeVendor.search, badgeName);
        await this.toBeVisible(sellerBadgeVendor.sellerBadgeCell(badgeName));
    }

    // vendor filter seller badge
    async filterSellerBadges(option: string) {
        await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);

        await this.goto(data.subUrls.frontend.vDashboard.badges);
        await this.selectByValue(sellerBadgeVendor.filterBadges, option);
        await this.notToBeVisible(sellerBadgeVendor.noRowsFound);
        const count = (await this.getElementText(sellerBadgeVendor.numberOfBadgesFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }
}
