import { test } from '@playwright/test';
import { AnnouncementsPage } from 'pages/announcementsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: AnnouncementsPage;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new AnnouncementsPage(aPage);
	apiUtils = new ApiUtils(request);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Announcements test', () => {


	test('dokan announcements menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminAnnouncementsRenderProperly();
	});

	test('admin can add announcement @pro', async ( ) => {
		await admin.addAnnouncement({ ...data.announcement.create, receiver: data.announcement.receiver.allVendors });
	});

	test('admin can edit announcement @pro', async ( ) => {
		const announcementTitle = data.announcement.create.randomTitle();
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: announcementTitle, status: 'draft' }, payloads.adminAuth);
		await admin.editAnnouncement({ ...data.announcement.create, title: announcementTitle, receiver: data.announcement.receiver.allVendors });
	});

	test('admin can trash announcement @pro', async ( ) => {
		await admin.updateAnnouncement(data.announcement.create.title, 'trash');
	});

	test('admin can restore announcement @pro', async ( ) => {
		await admin.updateAnnouncement(data.announcement.create.title, 'restore');
	});

	test('admin can permanently delete announcement @pro', async ( ) => {
		const announcementTitle = data.announcement.create.randomTitle();
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: announcementTitle, status: 'trash', }, payloads.adminAuth);
		await admin.updateAnnouncement(announcementTitle, 'permanently-delete');
	});

	test('admin can perform announcements bulk action @pro', async ( ) => {
		await apiUtils.createAnnouncement({ ...payloads.createAnnouncement, title: data.announcement.create.randomTitle() }, payloads.adminAuth);
		await admin.announcementBulkAction('trash');
	});

	//TODO: separate tests for announcement receiver, needed or not
	//TODO: add vendor tests


});
