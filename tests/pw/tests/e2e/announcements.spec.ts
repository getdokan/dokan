import { test, Page } from '@playwright/test';
import { AnnouncementsPage } from 'pages/announcementsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let announcementsPage: AnnouncementsPage;
let aPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	announcementsPage = new AnnouncementsPage(aPage);
	apiUtils = new ApiUtils(request);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('Announcements test', () => {

	// test.use({ storageState: data.auth.adminAuthFile });

	test('dokan announcements menu page is rendering properly @pro @explo', async ( ) => {
		await announcementsPage.adminAnnouncementsRenderProperly();
	});

	test('admin can add announcement @pro', async ( ) => {
		await announcementsPage.addAnnouncement({ ...data.announcement.create, receiver: data.announcement.receiver.allVendors });
	});

	test('admin can edit announcement @pro', async ( ) => {
		const announcementTitle = data.announcement.create.randomTitle();
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: announcementTitle, status: 'draft' }, payloads.adminAuth);
		await announcementsPage.editAnnouncement({ ...data.announcement.create, title: announcementTitle, receiver: data.announcement.receiver.allVendors });
	});

	test('admin can trash announcement @pro', async ( ) => {
		await announcementsPage.updateAnnouncement(data.announcement.create.title, 'trash');
	});

	test('admin can restore announcement @pro', async ( ) => {
		await announcementsPage.updateAnnouncement(data.announcement.create.title, 'restore');
	});

	test('admin can permanently delete announcement @pro', async ( ) => {
		const announcementTitle = data.announcement.create.randomTitle();
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: announcementTitle, status: 'trash', }, payloads.adminAuth);
		await announcementsPage.updateAnnouncement(announcementTitle, 'permanently-delete');
	});

	test('admin can perform announcements bulk action @pro', async ( ) => {
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: data.announcement.create.randomTitle() }, payloads.adminAuth);
		await announcementsPage.announcementBulkAction('trash');
	});

	//TODO: separate tc for announcement receiver, needed or not
	//TODO: add vendor tests


});
