import { Page, expect, test } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { StoresPage } from 'pages/storesPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { sellerBadge } from 'utils/interfaces';


export class SellerBadgesPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}

	storesPage = new StoresPage(this.page);


	// seller badge

	// seller badge render properly
	async adminSellerBadgeRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);

		// seller badge text is visible
		await this.toBeVisible(selector.admin.dokan.sellerBadge.sellerBadgeText);

		// create badge is visible
		await this.toBeVisible(selector.admin.dokan.sellerBadge.createBadge);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.sellerBadge.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.sellerBadge.bulkActions);

		// search seller badge is visible
		await this.toBeVisible(selector.admin.dokan.sellerBadge.search);

		//  seller badge table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.sellerBadge.table);

	}


	// search seller badge
	async searchSellerBadge(badgeName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);

		await this.clearInputField(selector.admin.dokan.sellerBadge.search);
		await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.search, badgeName);
		await this.toBeVisible(selector.admin.dokan.sellerBadge.sellerBadgeCell(badgeName));
	}


	// view seller badge
	async viewSellerBadge(badgeName: string){
		await this.searchSellerBadge(badgeName);

		await this.hover(selector.admin.dokan.sellerBadge.sellerBadgeRow(badgeName));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.sellerBadgeEdit(badgeName));

		// badge condition box is visible
		await this.toBeVisible(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.badgeConditionBox);

		// badge event elements are visible
		const { badgeEvent, badgePublishedStatus, ...badgeEvents } = selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents;
		await this.multipleElementVisible(badgeEvents);

		// badge photo elements are visible
		await this.multipleElementVisible(selector.admin.dokan.sellerBadge.badgeDetails.badgePhoto);

		// badge status elements are visible
		const { create, ...badgeStatus } = selector.admin.dokan.sellerBadge.badgeDetails.badgeStatus;
		await this.multipleElementVisible(badgeStatus);

	}


	// create seller badge
	async createSellerBadge(badge: sellerBadge){
		await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadgeEvent, selector.admin.dokan.sellerBadge.createBadge);
		await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents.badgeEventDropdown);
		const isPublished = await this.isVisible(selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents.badgePublishedStatus(badge.badgeName));
		if (isPublished){
			console.log('Badge is already published');
			test.skip();
			// throw new Error('Badge is already published');
		}
		await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents.badgeEvent(badge.badgeName));
		await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents.badgeName, badge.badgeName);

		const isLevelExists = await this.isVisible(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.startingLevelValue);
		if (isLevelExists){
			await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.startingLevelValue, badge.startingLevelValue);
			for (let i = 1; i < badge.maxLevel; i++){
				await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.addBadgeLevel);
			}
		} else {
			if (badge.badgeName === 'Trending Product'){
				await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.trendingProductPeriod, badge.trendingProductPeriod);
				await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct, badge.trendingProductTopBestSellingProduct);
			}
			if (badge.badgeName === 'Verified Seller'){
				// await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.verifiedSellerMethod, badge.verificationMethod);
				const methods: string[] = Object.values(badge.verifiedSellerMethod);
				for (let i = 1; i <= methods.length; i++){
					await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.verifiedSellerMethod1(i), methods[i - 1] as string );
					if ( i === methods.length ) { continue; }
					await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.addBadgeLevel);
				}
			}
		}

		await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeStatus.badgeStatus, badge.badgeStatus );
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.badgeDetails.badgeStatus.create);
		await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeAddedSuccessfully);

	}


	// edit seller badge
	async editSellerBadge(badge: sellerBadge){
		await this.searchSellerBadge(badge.badgeName);

		await this.hover(selector.admin.dokan.sellerBadge.sellerBadgeRow(badge.badgeName));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.sellerBadgeEdit(badge.badgeName));

		await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeEvents.badgeName, badge.badgeName);

		const isLevelExists = await this.isVisible(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.startingLevelValue);
		if (isLevelExists){
			// remove previous badge level
			const maxLevel = await this.countLocator(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.badgeLevel);
			for (let i = 1; i < maxLevel; i++){
				await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.removeBadgeLevel);
			}
			// add badge level
			await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.startingLevelValue, badge.startingLevelValue);
			for (let i = 1; i < badge.maxLevel; i++){
				await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.addBadgeLevel);
			}
		} else {

			if (badge.badgeName === 'Trending Product'){
				await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.trendingProductPeriod, badge.trendingProductPeriod);
				await this.clearAndType(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct, badge.trendingProductTopBestSellingProduct);
			}
			if (badge.badgeName === 'Verified Seller'){
				// await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.verifiedSellerMethod, badge.verificationMethod);
				// remove previous badge level
				await this.waitForSelector(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.badgeLevel);
				const maxLevel = await this.countLocator(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.badgeLevel);
				for (let i = 1; i < maxLevel; i++){
					await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.removeBadgeLevel);
				}

				// add badge level
				const methods: string[] = Object.values(badge.verifiedSellerMethod);
				for (let i = 1; i <= methods.length; i++){
					await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.verifiedSellerMethod1(i), methods[i - 1] as string);
					if ( i === methods.length ) { continue; }
					await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeCondition.addBadgeLevel);
				}
			}
		}

		await this.selectByValue(selector.admin.dokan.sellerBadge.badgeDetails.badgeStatus.badgeStatus, badge.badgeStatus );
		await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeStatus.update);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.badgeDetails.confirmBadgeUpdate);
		await this.click(selector.admin.dokan.sellerBadge.badgeDetails.badgeAddedSuccessfully);

	}


	// preview seller badge
	async previewSellerBadge(badgeName: string){
		await this.searchSellerBadge(badgeName);

		const badgeLevel = await this.getElementText(selector.admin.dokan.sellerBadge.sellerBadgeLevel(badgeName));

		await this.hover(selector.admin.dokan.sellerBadge.sellerBadgeRow(badgeName));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.sellerBadgePreview(badgeName));

		// badge preview modal is visible
		await this.toBeVisible(selector.admin.dokan.sellerBadge.previewBadgeDetails.modal);

		// badge preview header elements are visible
		await this.multipleElementVisible(selector.admin.dokan.sellerBadge.previewBadgeDetails.modalHeader);

		await this.toHaveCount(selector.admin.dokan.sellerBadge.previewBadgeDetails.levelBox, Number(badgeLevel) );

		await this.click(selector.admin.dokan.sellerBadge.previewBadgeDetails.modalHeader.modalClose);
	}


	// filter vendors by badge
	async filterVendorsByBadge(badgeName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		await this.clickIfVisible(selector.admin.dokan.vendors.filters.clearFilter);
		await this.selectByLabel( selector.admin.dokan.vendors.filters.filterByBadges, badgeName);

		const count = (await this.getElementText(selector.admin.dokan.vendors.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).toBeGreaterThan(0);
	}


	// seller badge vendors
	async sellerBadgeVendors(badgeName: string){
		await this.searchSellerBadge(badgeName);

		await this.hover(selector.admin.dokan.sellerBadge.sellerBadgeRow(badgeName));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.sellerBadgeVendors(badgeName));
		// await this.toBeVisible(selector.admin.dokan.vendors.vendorCell(badgeName));
		const count = (await this.getElementText(selector.admin.dokan.vendors.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).toBeGreaterThan(0);
	}


	// badges acquired by vendor
	async sellerBadgeAcquiredByVendor(vendorName: string){
		await this.storesPage.searchVendor(vendorName);

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.vendors.vendorViewDetails(vendorName));
		await this.toBeVisible(selector.admin.dokan.vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
		// todo: add assertions for achieved badges
	}


	// update seller badge
	async updateSellerBadge(badgeName: string, status: string){
		await this.searchSellerBadge(badgeName);

		await this.hover(selector.admin.dokan.sellerBadge.sellerBadgeRow(badgeName));

		switch (status) {

		case 'publish' :
			await this.click(selector.admin.dokan.sellerBadge.sellerBadgePublish(badgeName));
			break;

		case 'draft' :
			await this.click(selector.admin.dokan.sellerBadge.sellerBadgeDraft(badgeName));
			break;

		case 'delete' :
			await this.click(selector.admin.dokan.sellerBadge.sellerBadgeDelete(badgeName));
			break;

		default :
			break;
		}

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.confirmAction);
		await this.click(selector.admin.dokan.sellerBadge.successMessage);
	}


	// seller badge bulk action
	async sellerBadgeBulkAction(action: string, badgeName?: string){
		badgeName ? await this.searchSellerBadge(badgeName) : await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.sellerBadge.noRowsFound);

		await this.click(selector.admin.dokan.sellerBadge.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.sellerBadge.bulkActions.selectAction, action);
		await this.click( selector.admin.dokan.sellerBadge.bulkActions.applyAction);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, selector.admin.dokan.sellerBadge.confirmAction);
		await this.click(selector.admin.dokan.sellerBadge.successMessage);
	}


	// vendor seller badge render properly
	async vendorSellerBadgeRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);

		// badges text is visible
		await this.toBeVisible(selector.vendor.vBadges.badgesText);

		// badge description text is visible
		await this.toBeVisible(selector.vendor.vBadges.description);

		// badge search is visible
		await this.toBeVisible(selector.vendor.vBadges.search);

		// badge filter  is visible
		await this.toBeVisible(selector.vendor.vBadges.filterBadges);

		//  seller badge table elements are visible
		await this.multipleElementVisible(selector.vendor.vBadges.table);

	}


	// vendor achieved badges congrats popup
	async sellerBadgeCongratsPopup(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);

		const congratsModalIsVisible = await this.isVisible(selector.vendor.vBadges.congratsModal.sellerBadgeModal);
		if (congratsModalIsVisible){
			//  seller badge congrats modal elements are visible
			await this.multipleElementVisible(selector.vendor.vBadges.congratsModal);

			await this.clickIfVisible(selector.vendor.vBadges.congratsModal.closeModal);
		} else {
			console.log('No Congrats message appeared');

		}

	}


	// vendor search seller badge
	async vendorSearchSellerBadge(badgeName: string){
		await this.clickIfVisible(selector.vendor.vBadges.congratsModal.closeModal);
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);
		await this.clearAndType( selector.vendor.vBadges.search, badgeName);
		await this.toBeVisible(selector.vendor.vBadges.sellerBadgeCell(badgeName));
	}


	// vendor filter seller badge
	async filterSellerBadges(option: string){
		await this.clickIfVisible(selector.vendor.vBadges.congratsModal.closeModal);

		await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);
		await this.selectByValue( selector.vendor.vBadges.filterBadges, option);
		const count = (await this.getElementText(selector.vendor.vBadges.numberOfBadgesFound))?.split(' ')[0];
		expect(Number(count)).toBeGreaterThan(0);
	}

}
