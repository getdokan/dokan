import { test, request, Page } from '@playwright/test';
import { AnnouncementsPage } from '@pages/announcementsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Announcements test (admin)', () => {
    let admin: AnnouncementsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let announcementTitle: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AnnouncementsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'draft' }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can view announcements menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminAnnouncementsRenderProperly();
    });

    test('admin can send announcement', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addAnnouncement({ ...data.announcement, title: data.announcement.randomTitle() });
    });

    test('admin can schedule announcement', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addAnnouncement({ ...data.announcement, title: data.announcement.randomTitle(), publishType: 'schedule' });
    });

    test('admin can edit announcement', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editAnnouncement({ ...data.announcement, title: announcementTitle });
    });

    test('admin can trash announcement', { tag: ['@pro', '@admin'] }, async () => {
        const [, , announcementTitle] = await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        await admin.updateAnnouncement(announcementTitle, 'trash');
    });

    test('admin can restore announcement', { tag: ['@pro', '@admin'] }, async () => {
        const [, announcementId, announcementTitle] = await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        await apiUtils.deleteAnnouncement(announcementId, payloads.adminAuth);
        await admin.updateAnnouncement(announcementTitle, 'restore');
    });

    test('admin can permanently delete announcement', { tag: ['@pro', '@admin'] }, async () => {
        const [, announcementId, announcementTitle] = await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        await apiUtils.deleteAnnouncement(announcementId, payloads.adminAuth);
        await admin.updateAnnouncement(announcementTitle, 'permanently-delete');
    });

    test.skip('admin can perform bulk action on announcements', { tag: ['@pro', '@admin'] }, async () => {
        // todo: might cause other tests to fail in parallel
        await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        await admin.announcementBulkAction('trash');
    });
});

test.describe('Announcements test (vendor)', () => {
    let vendor: AnnouncementsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const announcement = payloads.createAnnouncement();

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new AnnouncementsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createAnnouncement(announcement, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    test('vendor can view announcements menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorAnnouncementsRenderProperly();
    });

    test('vendor can view announcement details', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorViewAnnouncement(announcement);
    });

    test('vendor can delete announcement', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorDeleteAnnouncement(announcement.title);
    });
});
