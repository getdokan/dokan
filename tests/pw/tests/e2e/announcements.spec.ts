import { test } from '@playwright/test';
import { AnnouncementsPage } from 'pages/announcementsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: AnnouncementsPage;
let vendor: AnnouncementsPage;
let apiUtils: ApiUtils;
let announcementTitle: string;
const announcement = payloads.createAnnouncement();

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new AnnouncementsPage(aPage);

	const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
	const vPage = await vendorContext.newPage();
	vendor = new AnnouncementsPage(vPage);


	apiUtils = new ApiUtils(request);
	[,, announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'draft' }, payloads.adminAuth);
	await apiUtils.createAnnouncement(announcement, payloads.adminAuth);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Announcements test', () => {


	test('dokan announcements menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminAnnouncementsRenderProperly();
	});

	test('admin can add announcement @pro', async ( ) => {
		await admin.addAnnouncement({ ...data.announcement, title: data.announcement.randomTitle() });
	});

	test('admin can edit announcement @pro', async ( ) => {
		await admin.editAnnouncement({ ...data.announcement, title: announcementTitle });
	});

	test('admin can trash announcement @pro', async ( ) => {
		await admin.updateAnnouncement(announcementTitle, 'trash');
	});

	test('admin can restore announcement @pro', async ( ) => {
		const [,, announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'trash', }, payloads.adminAuth);
		await admin.updateAnnouncement(announcementTitle, 'restore');
	});

	test('admin can permanently delete announcement @pro', async ( ) => {
		const [,, announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'trash', }, payloads.adminAuth);
		await admin.updateAnnouncement(announcementTitle, 'permanently-delete');
	});

	test('admin can perform announcements bulk action @pro', async ( ) => {
		// await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
		await admin.announcementBulkAction('trash');
	});


	test('vendor announcement menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAnnouncementsRenderProperly();
	});

	test('admin can view announcement details  @pro', async ( ) => {
		// await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
		await vendor.vendorViewAnnouncement({ ...announcement, content: 'This is announcement content' }); //TODO: fix this
	});

	test('vendor can delete announcement @pro', async ( ) => {
		// await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
		await vendor.vendorDeleteAnnouncement(announcement.title);
	});


});
