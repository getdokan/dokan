import { test, Page } from '@playwright/test';
import { AnnouncementsPage } from '@pages/announcementsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Announcements test', () => {
    let admin: AnnouncementsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let announcementTitle: string;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AnnouncementsPage(aPage);

        apiUtils = new ApiUtils(request);
        [, , announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'draft' }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan announcements menu page is rendering properly @pro @explo', async () => {
        await admin.adminAnnouncementsRenderProperly();
    });

    test('admin can add announcement @pro', async () => {
        await admin.addAnnouncement({
            ...data.announcement,
            title: data.announcement.randomTitle(),
        });
    });

    test('admin can schedule announcement @pro', async () => {
        await admin.addAnnouncement({
            ...data.announcement,
            title: data.announcement.randomTitle(),
            publishType: 'schedule',
        });
    });

    test('admin can edit announcement @pro', async () => {
        await admin.editAnnouncement({
            ...data.announcement,
            title: announcementTitle,
        });
    });

    test('admin can trash announcement @pro', async () => {
        await admin.updateAnnouncement(announcementTitle, 'trash');
    });

    test('admin can restore announcement @pro', async () => {
        const [, , announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'trash' }, payloads.adminAuth);
        await admin.updateAnnouncement(announcementTitle, 'restore');
    });

    test('admin can permanently delete announcement @pro', async () => {
        const [, , announcementTitle] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), status: 'trash' }, payloads.adminAuth);
        await admin.updateAnnouncement(announcementTitle, 'permanently-delete');
    });

    test('admin can perform announcements bulk action @pro', async () => {
        // await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        await admin.announcementBulkAction('trash');
    });
});

test.describe('Announcements test vendor', () => {
    let vendor: AnnouncementsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const announcement = payloads.createAnnouncement();

    test.beforeAll(async ({ browser, request }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new AnnouncementsPage(vPage);

        apiUtils = new ApiUtils(request);
        await apiUtils.createAnnouncement(announcement, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    // vendor

    test('vendor announcement menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorAnnouncementsRenderProperly();
    });

    test('vendor can view announcement details @pro', async () => {
        await vendor.vendorViewAnnouncement(announcement);
    });

    test('vendor can delete announcement @pro', async () => {
        await vendor.vendorDeleteAnnouncement(announcement.title);
    });
});
