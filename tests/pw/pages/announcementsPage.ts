import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { announcement } from '@utils/interfaces';
import { helpers } from '@utils/helpers';

// selectors
const announcementsAdmin = selector.admin.dokan.announcements;
const announcementsVendor = selector.vendor.vAnnouncement;

export class AnnouncementsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // announcements

    // announcements render properly
    async adminAnnouncementsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

        // announcement text is visible
        await this.toBeVisible(announcementsAdmin.announcementText);

        // and announcement is visible
        await this.toBeVisible(announcementsAdmin.addNewAnnouncement);

        // nav tabs are visible
        await this.multipleElementVisible(announcementsAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(announcementsAdmin.bulkActions);

        // announcement table elements are visible
        await this.multipleElementVisible(announcementsAdmin.table);

        // add announcement fields are visible
        await this.click(announcementsAdmin.addNewAnnouncement);
        const { contentHtmlBody, schedule, ...addAnnouncement } = announcementsAdmin.addAnnouncement;
        await this.multipleElementVisible(addAnnouncement);
        await this.goBack();
    }

    // update announcement fields
    async updateAnnouncementFields(announcement: announcement) {
        await this.clearAndType(announcementsAdmin.addAnnouncement.title, announcement.title);
        await this.typeFrameSelector(announcementsAdmin.addAnnouncement.contentIframe, announcementsAdmin.addAnnouncement.contentHtmlBody, announcement.content);
        await this.selectByValue(announcementsAdmin.addAnnouncement.sendAnnouncementTo, announcement.receiver);
        if (announcement.publishType === 'immediately') {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, announcementsAdmin.addAnnouncement.publish);
            await this.toBeVisible(announcementsAdmin.announcementStatusPublished(announcement.title));
        } else {
            await this.click(announcementsAdmin.addAnnouncement.schedule.addSchedule);
            await this.selectByNumber(announcementsAdmin.addAnnouncement.schedule.month, announcement.scheduleDate.getMonth());
            await this.clearAndType(announcementsAdmin.addAnnouncement.schedule.day, String(announcement.scheduleDate.getDate()));
            await this.clearAndType(announcementsAdmin.addAnnouncement.schedule.year, String(announcement.scheduleDate.getFullYear()));
            await this.clearAndType(announcementsAdmin.addAnnouncement.schedule.hour, String(announcement.scheduleDate.getHours()));
            await this.clearAndType(announcementsAdmin.addAnnouncement.schedule.minute, String(announcement.scheduleDate.getMinutes()));
            await this.click(announcementsAdmin.addAnnouncement.schedule.ok);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, announcementsAdmin.addAnnouncement.publish);
            await this.toBeVisible(announcementsAdmin.announcementStatusScheduled(announcement.title));
        }
    }

    // add announcement
    async addAnnouncement(announcement: announcement) {
        await this.goIfNotThere(data.subUrls.backend.dokan.announcements);
        await this.click(announcementsAdmin.addNewAnnouncement);
        await this.updateAnnouncementFields(announcement);
    }

    // edit announcement
    async editAnnouncement(announcement: announcement) {
        await this.goto(data.subUrls.backend.dokan.announcements);
        await this.toBeVisible(announcementsAdmin.announcementCell(announcement.title));
        await this.hover(announcementsAdmin.announcementCell(announcement.title));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.announcements, announcementsAdmin.announcementEdit(announcement.title));
        await this.updateAnnouncementFields(announcement);
    }

    // update announcement
    async updateAnnouncement(announcementTitle: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.navTabs.published);
                await this.hover(announcementsAdmin.announcementCellPublished(announcementTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.announcementDelete(announcementTitle));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.navTabs.trash);
                await this.hover(announcementsAdmin.announcementCellPublished(announcementTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.announcementRestore(announcementTitle));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.navTabs.trash);
                await this.hover(announcementsAdmin.announcementCellPublished(announcementTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.announcementPermanentlyDelete(announcementTitle));
                break;

            default:
                break;
        }
    }

    // announcement bulk action
    async announcementBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.announcements);
        // await this.goIfNotThere(data.subUrls.backend.dokan.announcements);

        // ensure row exists
        await this.notToBeVisible(announcementsAdmin.noRowsFound);

        await this.click(announcementsAdmin.bulkActions.selectAll);
        await this.selectByValue(announcementsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.announcements, announcementsAdmin.bulkActions.applyAction);
    }

    // vendor

    // vendor announcements render properly
    async vendorAnnouncementsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
        await this.notToHaveCount(announcementsVendor.announcementDiv, 0);
        await this.notToHaveCount(announcementsVendor.announcementDate, 0);
        await this.notToHaveCount(announcementsVendor.announcementHeading, 0);
        await this.notToHaveCount(announcementsVendor.announcementContent, 0);
        await this.notToHaveCount(announcementsVendor.removeAnnouncement, 0);
    }

    // vendor view announcement
    async vendorViewAnnouncement(announcement: { title: string; content: string }) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
        await this.clickAndWaitForLoadState(announcementsVendor.announcementLink(announcement.title));
        await this.toContainText(announcementsVendor.announcement.title, announcement.title);
        await this.toContainText(announcementsVendor.announcement.content, helpers.stringBetweenTags(announcement.content));
        await this.toBeVisible(announcementsVendor.announcement.date);
        await this.toBeVisible(announcementsVendor.announcement.backToAllNotice);
    }

    // vendor delete announcement
    async vendorDeleteAnnouncement(title: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.announcements);
        await this.click(announcementsVendor.deleteAnnouncement(title));
        await this.clickAndWaitForResponse(data.subUrls.ajax, announcementsVendor.confirmDeleteAnnouncement);
    }
}
