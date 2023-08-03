import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { announcement } from 'utils/interfaces';
import { helpers } from 'utils/helpers';


export class AnnouncementsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// announcements

	// announcements render properly
	async adminAnnouncementsRenderProperly(){

		await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

		// announcement text is visible
		await this.toBeVisible(selector.admin.dokan.announcements.announcementText);

		// and announcement is visible
		await this.toBeVisible(selector.admin.dokan.announcements.addNewAnnouncement);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.announcements.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.announcements.bulkActions);

		// announcement table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.announcements.table);

		// add announcement fields are visible
		await this.click(selector.admin.dokan.announcements.addNewAnnouncement);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { contentHtmlBody, ...addAnnouncement } = selector.admin.dokan.announcements.addAnnouncement;
		await this.multipleElementVisible(addAnnouncement);
		await this.goBack();

	}


	// update announcement fields
	async updateAnnouncementFields(announcement: announcement){
		await this.clearAndType(selector.admin.dokan.announcements.addAnnouncement.title, announcement.title);
		await this.typeFrameSelector(selector.admin.dokan.announcements.addAnnouncement.contentIframe, selector.admin.dokan.announcements.addAnnouncement.contentHtmlBody, announcement.content);
		await this.selectByValue(selector.admin.dokan.announcements.addAnnouncement.sendAnnouncementTo, announcement.receiver);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.addAnnouncement.publish);
		await this.toBeVisible(selector.admin.dokan.announcements.announcementCellPublished(announcement.title));
	}


	// add announcement
	async addAnnouncement(announcement: announcement){
		await this.goIfNotThere(data.subUrls.backend.dokan.announcements);
		await this.click(selector.admin.dokan.announcements.addNewAnnouncement);
		await this.updateAnnouncementFields(announcement);
	}


	// edit announcement
	async editAnnouncement(announcement: announcement){
		await this.goto(data.subUrls.backend.dokan.announcements);
		await this.hover(selector.admin.dokan.announcements.announcementCell(announcement.title));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.announcementEdit(announcement.title));

		await this.updateAnnouncementFields(announcement);
	}


	// update announcement
	async updateAnnouncement(announcementTitle: string, action: string){
		await this.goto(data.subUrls.backend.dokan.announcements);
		// await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

		switch (action) {

		case 'trash' :
			await this.hover(selector.admin.dokan.announcements.announcementCellPublished(announcementTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.announcementDelete(announcementTitle));
			break;

		case 'restore' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.navTabs.trash);
			await this.hover(selector.admin.dokan.announcements.announcementCell(announcementTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.announcementRestore(announcementTitle));
			break;

		case 'permanently-delete' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.navTabs.trash);
			await this.hover(selector.admin.dokan.announcements.announcementCell(announcementTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.announcementPermanentlyDelete(announcementTitle));
			break;

		default :
			break;
		}

	}


	// announcement bulk action
	async announcementBulkAction(action: string){
		await this.goto(data.subUrls.backend.dokan.announcements);
		// await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.announcements.noRowsFound);

		await this.click(selector.admin.dokan.announcements.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.announcements.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.bulkActions.applyAction);
	}


	// vendor

	// vendor announcements render properly
	async vendorAnnouncementsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
		await this.notToHaveCount(selector.vendor.vAnnouncement.announcementDiv, 0);
		await this.notToHaveCount(selector.vendor.vAnnouncement.announcementDate, 0);
		await this.notToHaveCount(selector.vendor.vAnnouncement.announcementHeading, 0);
		await this.notToHaveCount(selector.vendor.vAnnouncement.announcementContent, 0);
		await this.notToHaveCount(selector.vendor.vAnnouncement.removeAnnouncement, 0);
	}


	// vendor view announcement
	async vendorViewAnnouncement(announcement: { title: string; content: string; }){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
		await this.clickAndWaitForLoadState(selector.vendor.vAnnouncement.announcementLink(announcement.title));
		await this.toContainText(selector.vendor.vAnnouncement.announcement.title, announcement.title);
		await this.toContainText(selector.vendor.vAnnouncement.announcement.content, helpers.stringBetweenTags(announcement.content));
		await this.toBeVisible(selector.vendor.vAnnouncement.announcement.date);
		await this.toBeVisible(selector.vendor.vAnnouncement.announcement.backToAllNotice);
	}


	// vendor delete announcement
	async vendorDeleteAnnouncement(title: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
		await this.click(selector.vendor.vAnnouncement.deleteAnnouncement(title));
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vAnnouncement.confirmDeleteAnnouncement);
	}


}
