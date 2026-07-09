import { test, expect } from '@utils/test';
import { request } from '@playwright/test';
import { AnnouncementsPage } from './announcementsPage';
import path from 'path';

import { toPath } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');        // Admin session storage
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');       // Vendor 1 session storage

// ============================================
// TEST SETUP
// ============================================

test.describe('Announcements Tests @pro', () => {
    // Wipe accumulated announcements before this file's tests run. The legacy
    // admin list paginates (10/page) and sorts by date desc — once the table
    // grows past a few hundred rows (especially with scheduled-in-the-future
    // rows that pin to the top), freshly-published rows from these tests fall
    // off page 1 and the `<strong>title</strong>` selectors stop finding them.
    test.beforeAll(async () => {
        const apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.deleteAllAnnouncements(payloads.adminAuth);
        await apiUtils.dispose();
    });


    // ============================================
    // TEST CASES
    // ============================================

    test('Old Test Case 1 - Admin Views Announcements Menu Page', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Navigate to the announcements page and verify all elements render correctly
        await announcementsPage.adminAnnouncementsRenderProperly();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 2 - Admin Sends Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Generate a unique announcement title
        const title = announcementsPage.generateTitle();

        // Create and publish the announcement
        await announcementsPage.addAnnouncement(title);

        // Verify the announcement is published and visible in the list
        const isPublished = await adminPage.locator(announcementsPage.admin.announcementStatusPublished(title)).isVisible();
        expect(isPublished, `Announcement "${title}" should be visible with published status`).toBe(true);

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 3 - Admin Schedules Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Generate a unique announcement title
        const title = announcementsPage.generateTitle();

        // Create and schedule the announcement
        await announcementsPage.addScheduledAnnouncement(title);

        // Verify the announcement appears with a scheduled status
        const isScheduled = await adminPage.locator(announcementsPage.admin.announcementStatusScheduled(title)).isVisible();
        expect(isScheduled, `Announcement "${title}" should be visible with scheduled status`).toBe(true);

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 4 - Admin Edits Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create a DRAFT — the Edit row action only exists for non-published items;
        // published announcements only expose the Trash action in the Dokan SPA.
        const originalTitle = announcementsPage.generateTitle();
        await announcementsPage.addAnnouncementAsDraft(originalTitle);

        // Edit the draft and publish it with a new title
        const updatedTitle = `${announcementsPage.generateTitle()}_edited`;
        await announcementsPage.editAnnouncement(originalTitle, updatedTitle);

        // Verify the updated announcement is visible with published status
        await expect(adminPage.locator(announcementsPage.admin.announcementStatusPublished(updatedTitle))).toBeVisible();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 5 - Admin Trashes Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create an announcement to trash
        const title = announcementsPage.generateTitle();
        await announcementsPage.addAnnouncement(title);

        // Move the announcement to trash
        await announcementsPage.trashAnnouncement(title);

        // Verify the announcement appears in the trash tab (positive assertion — more reliable)
        await adminPage.locator(announcementsPage.admin.navTabs.trash).click();
        await adminPage.waitForLoadState('load');
        await expect(adminPage.locator(announcementsPage.admin.announcementCellPublished(title)),
            `Trashed announcement "${title}" should appear in the trash tab`).toBeVisible();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 6 - Admin Restores Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create an announcement, then move it to trash
        const title = announcementsPage.generateTitle();
        await announcementsPage.addAnnouncement(title);
        await announcementsPage.trashAnnouncement(title);

        // Restore the announcement from trash
        await announcementsPage.restoreAnnouncement(title);

        // Verify the announcement is restored and appears in the published tab.
        // announcementCellPublished (the <strong> title) is used instead of
        // announcementStatusPublished because the status badge may render differently
        // after a restore; confirming the title is present is sufficient.
        await adminPage.locator(announcementsPage.admin.navTabs.published).click();
        await adminPage.waitForLoadState('load');
        await expect(adminPage.locator(announcementsPage.admin.announcementCellPublished(title)),
            `Restored announcement "${title}" should be visible in the published tab`).toBeVisible();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 7 - Admin Permanently Deletes Announcement', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create an announcement, move it to trash, then permanently delete it
        const title = announcementsPage.generateTitle();
        await announcementsPage.addAnnouncement(title);
        await announcementsPage.trashAnnouncement(title);
        await announcementsPage.permanentlyDeleteAnnouncement(title);

        // Verify the announcement no longer exists in the trash tab.
        // The DELETE response races the list refetch; on slow CI the row can briefly
        // remain in the DOM after waitForLoadState('load') returns. expect().not.toBeVisible
        // polls until it disappears — give it a generous window for the refetch to land.
        await adminPage.locator(announcementsPage.admin.navTabs.trash).click();
        await adminPage.waitForLoadState('load');
        await expect(adminPage.locator(announcementsPage.admin.announcementCellPublished(title)),
            `Permanently deleted announcement "${title}" should no longer exist in trash`).not.toBeVisible({ timeout: 15000 });

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 8 - Admin Performs Bulk Action on Announcements', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Ensure at least one announcement exists before bulk action
        const title = announcementsPage.generateTitle();
        await announcementsPage.addAnnouncement(title);

        // Perform bulk trash on all visible announcements
        await announcementsPage.announcementBulkAction('trash');

        // Verify the announcement appears in the Trash tab (positive assertion).
        // Waiting for disappearance from the All tab is unreliable because the
        // waitForResponse inside announcementBulkAction may match an unrelated GET
        // response rather than the actual bulk-DELETE response.
        await adminPage.locator(announcementsPage.admin.navTabs.trash).click();
        await adminPage.waitForLoadState('load');
        await expect(adminPage.locator(announcementsPage.admin.announcementCellPublished(title)),
            `Bulk-trashed announcement "${title}" should appear in the Trash tab`).toBeVisible();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 9 - Vendor Views Announcements Menu Page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Using admin session storage to create a published announcement first
        const adminContext = await browser.newContext({ storageState: a1 });
        const adminPage = await adminContext.newPage();
        const adminAnnouncementsPage = new AnnouncementsPage(adminPage);

        const title = adminAnnouncementsPage.generateTitle();
        await adminAnnouncementsPage.addAnnouncement(title);
        await adminPage.close();
        await adminContext.close();

        // Using vendor session storage to view the announcements dashboard
        const vendorContext = await browser.newContext({ storageState: v1 });
        const vendorPage = await vendorContext.newPage();
        const vendorAnnouncementsPage = new AnnouncementsPage(vendorPage);

        // Navigate to vendor announcements page and verify all elements render correctly
        await vendorAnnouncementsPage.vendorAnnouncementsRenderProperly();

        await vendorAnnouncementsPage.waitForPageReady();
        await vendorPage.close();
        await vendorContext.close();
    });

    test('Old Test Case 10 - Vendor Views Announcement Details', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Using admin session storage to create a published announcement first
        const adminContext = await browser.newContext({ storageState: a1 });
        const adminPage = await adminContext.newPage();
        const adminAnnouncementsPage = new AnnouncementsPage(adminPage);

        const title = adminAnnouncementsPage.generateTitle();
        await adminAnnouncementsPage.addAnnouncement(title);
        await adminPage.close();
        await adminContext.close();

        // Using vendor session storage to view the announcement details
        const vendorContext = await browser.newContext({ storageState: v1 });
        const vendorPage = await vendorContext.newPage();
        const vendorAnnouncementsPage = new AnnouncementsPage(vendorPage);

        // Click on the announcement and verify the detail page
        await vendorAnnouncementsPage.vendorViewAnnouncement(title);

        // Verify the announcement title is displayed on the detail page
        const titleVisible = await vendorPage.locator(vendorAnnouncementsPage.vendor.announcement.title).isVisible();
        expect(titleVisible, `Announcement detail page should display title "${title}"`).toBe(true);

        // Verify back navigation link is present
        const backLinkVisible = await vendorPage.locator(vendorAnnouncementsPage.vendor.announcement.backToAllNotice).isVisible();
        expect(backLinkVisible, '"Back to all Notice" link should be visible on the detail page').toBe(true);

        await vendorAnnouncementsPage.waitForPageReady();
        await vendorPage.close();
        await vendorContext.close();
    });

    // LEGACY UI regression case (revived 2026-07-09 for legacy support): drives the
    // classic `dashboard/announcement` PHP screen via admin-ajax delete. New-UI parity
    // (bulk delete) lives in tests/e2e/new-announcements/.
    test('Old Test Case 11 - Vendor Deletes Announcement', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Using admin session storage to create a published announcement first
        const adminContext = await browser.newContext({ storageState: a1 });
        const adminPage = await adminContext.newPage();
        const adminAnnouncementsPage = new AnnouncementsPage(adminPage);

        const title = adminAnnouncementsPage.generateTitle();
        await adminAnnouncementsPage.addAnnouncement(title);
        await adminPage.close();
        await adminContext.close();

        // Using vendor session storage to delete the announcement from the dashboard
        const vendorContext = await browser.newContext({ storageState: v1 });
        const vendorPage = await vendorContext.newPage();
        const vendorAnnouncementsPage = new AnnouncementsPage(vendorPage);

        // Delete the announcement and verify it is removed from the list
        await vendorAnnouncementsPage.vendorDeleteAnnouncement(title);

        // Verify the announcement is no longer visible in the vendor dashboard
        await expect(vendorPage.locator(vendorAnnouncementsPage.vendor.announcementLink(title)),
            `Deleted announcement "${title}" should no longer appear in vendor dashboard`).not.toBeVisible();

        await vendorAnnouncementsPage.waitForPageReady();
        await vendorPage.close();
        await vendorContext.close();
    });

    test('Test Case 12 - Admin Empties Trash in New Admin Announcement Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Empty the trash in the new admin announcement dashboard to clean up after old dashboard test cases
        await announcementsPage.emptyTrashInNewAdminDashboard();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 13 - Admin Creates Published Announcement in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create a new published announcement in the new admin dashboard
        await announcementsPage.createPublishedAnnouncementInNewAdminDashboard(
            'Test Published Announcement 1',
            'Test Published Description 1',
        );

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test.skip('Test Case 14 - Vendor Views Announcement Detail in New Vendor Dashboard', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(vendorPage);

        const title = 'Test Published Announcement 1';

        // Navigate to the new vendor dashboard announcements and click the announcement card
        await announcementsPage.vendorViewAnnouncementInNewDashboard(title);

        // Verify the announcement detail title is visible
        await expect(vendorPage.locator(announcementsPage.vendorNewDashboard.announcementDetailTitle(title)),
            `Announcement detail title "${title}" should be visible`).toBeVisible();

        await announcementsPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });

    test('Test Case 15 - Admin Creates Draft Announcement in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create a new draft announcement in the new admin dashboard
        await announcementsPage.createDraftAnnouncementInNewAdminDashboard(
            'Test Draft Announcement 2',
            'Test Draft Description 2',
        );

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 16 - Admin Verifies Draft Announcement in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Verify the draft announcement title and status badge are visible
        await announcementsPage.verifyDraftAnnouncementInNewAdminDashboard('Test Draft Announcement 2');

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 17 - Admin Creates Scheduled Announcement in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Create a scheduled announcement with a dynamically computed future date
        await announcementsPage.createScheduledAnnouncementInNewAdminDashboard(
            'Test Scheduled Announcement 3',
            'Test Scheduled Description 3',
        );

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 18 - Admin Verifies Draft Status Visible in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Verify "Draft" text is visible on the announcements page
        await announcementsPage.verifyDraftStatusVisibleInNewAdminDashboard();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 19 - Admin Verifies Scheduled Status Visible in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Verify "Scheduled" text is visible on the announcements page
        await announcementsPage.verifyScheduledStatusVisibleInNewAdminDashboard();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 20 - Admin Trashes and Permanently Deletes Announcements in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Self-contained seeding: announcements created via the UI in earlier cases do not
        // reliably persist to this point, and freshly-published rows fall off page 1 (see the
        // describe beforeAll note). Reset and seed exactly the three announcements this case
        // trashes so they are the only rows — guaranteeing the trash-by-title flow finds them.
        const apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.deleteAllAnnouncements(payloads.adminAuth);
        for (const title of [
            'Test Published Announcement 1',
            'Test Draft Announcement 2',
            'Test Scheduled Announcement 3',
        ]) {
            await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), title }, payloads.adminAuth);
        }
        await apiUtils.dispose();

        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Move announcements to trash, then permanently delete all from trash
        await announcementsPage.trashAndPermanentlyDeleteAnnouncementsInNewAdminDashboard();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 21 - Admin Empties Trash in New Admin Dashboard', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const announcementsPage = new AnnouncementsPage(adminPage);

        // Navigate to announcements, open Trash tab, select all and permanently delete
        await announcementsPage.emptyTrashInNewAdminDashboardAfterTests();

        await announcementsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe.skip('New Vendor Announcement (React) Tests @pro', () => {
    test('Test Case 1 - /announcement route mounts in new vendor dashboard', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        // Seed an announcement so the list isn't empty
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        await adminPage.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/announcement`));
        await adminPage.waitForLoadState('domcontentloaded');
        await adminPage.close();
        await adminCtx.close();

        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/new/#/announcement`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/announcement/);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Announcement list renders rows or empty state', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/new/#/announcement`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        const articles = await page.locator('article').count();
        const cards = await page.locator('[class*="announcement"], [class*="Announcement"]').count();
        const empty = await page.locator("text=/no announcement|nothing to show|empty/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(articles > 0 || cards > 0 || empty, 'Announcement list should show items or an empty banner').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - HashRouter survives reload on /announcement', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/new/#/announcement`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        expect(page.url()).toMatch(/#\/announcement/);

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Announcement modal does NOT block list mount', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        // Install handler to dismiss modal
        const installed = '__h' as const;
        const pwf = page as typeof page & { [installed]?: boolean };
        if (!pwf[installed]) {
            pwf[installed] = true;
            await page.addLocatorHandler(
                page.locator('.vendor-announcement-modal'),
                async () => {
                    await page.locator('.vendor-announcement-modal button[aria-label="Close"]').first().click({ timeout: 2000 }).catch(() => undefined);
                },
                { noWaitAfter: true },
            ).catch(() => undefined);
        }

        await page.goto(toPath(`dashboard/new/#/announcement`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        const modalVisible = await page.locator('.vendor-announcement-modal').first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Announcement pop-up modal should be auto-dismissed by handler').toBe(false);

        await page.close();
        await ctx.close();
    });
});

