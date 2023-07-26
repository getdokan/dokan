import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { announcement } from 'utils/interfaces';


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

	}


	// add announcement
	async addAnnouncement(announcement: announcement['create']){
		await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

		await this.click(selector.admin.dokan.announcements.addNewAnnouncement);

		await this.clearAndType(selector.admin.dokan.announcements.addAnnouncement.title, announcement.title);
		await this.typeFrameSelector(selector.admin.dokan.announcements.addAnnouncement.contentIframe, selector.admin.dokan.announcements.addAnnouncement.contentHtmlBody, announcement.content);
		await this.selectByValue(selector.admin.dokan.announcements.addAnnouncement.sendAnnouncementTo, announcement.receiver);
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.addAnnouncement.publish);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.addAnnouncement.publish); //todo: test this
		//TODO: add wait for load then assert
		await this.toBeVisible(selector.admin.dokan.announcements.announcementCell(announcement.title));
	}


	// edit announcement
	async editAnnouncement(announcement: announcement['update']){
		await this.goto(data.subUrls.backend.dokan.announcements);
		// await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.navTabs.draft);
		await this.hover(selector.admin.dokan.announcements.announcementCell(announcement.title));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.announcementEdit(announcement.title));

		await this.clearAndType(selector.admin.dokan.announcements.addAnnouncement.title, announcement.title);
		await this.typeFrameSelector(selector.admin.dokan.announcements.addAnnouncement.contentIframe, selector.admin.dokan.announcements.addAnnouncement.contentHtmlBody, announcement.content);
		await this.selectByValue(selector.admin.dokan.announcements.addAnnouncement.sendAnnouncementTo, announcement.receiver);
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.addAnnouncement.publish);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, selector.admin.dokan.announcements.addAnnouncement.publish); //todo: test this
		//TODO: add wait for load then assert
		await this.toBeVisible(selector.admin.dokan.announcements.announcementCell(announcement.title));
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

}
