import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminAnnouncementsPage, adminAnnouncementsData } from './adminAnnouncementsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN ANNOUNCEMENTS — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/announcement (AdminDataViews).
//
// ADMIN-ONLY spec. Admins author/send announcements TO vendors; this is the
// admin authoring surface, so every precondition (a recipient vendor, the
// read-only listed/delete fixtures) is seeded via the REST API
// (apiUtils.createStore + apiUtils.createAnnouncement, admin auth). This spec
// never drives the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Announcements).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

// Seed a vendor store (idempotent + re-runnable) and force it active. Look up
// the store first so we never take createStore's "already exists -> updateStore"
// path, which 400s on the non-boolean `show_email: 'yes'` field in
// payloads.createStore() (the v1 stores PUT validates show_email as boolean; the
// POST is lenient).
async function seedVendor(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    let sellerId = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!sellerId) {
        const [, id] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        sellerId = id;
    }
    if (sellerId) {
        await apiUtils.updateStoreStatus(sellerId, { status: 'active' }, payloads.adminAuth);
    }
    return sellerId;
}

// Seed a published announcement via REST so the admin list is deterministic.
// announcement_type defaults to all_seller (which needs >=1 vendor — seeded in
// beforeAll). Returns the new announcement id.
async function seedAnnouncement(title: string): Promise<string> {
    const [, id] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), title, status: 'publish', announcement_type: 'all_seller' }, payloads.adminAuth);
    return id;
}

test.describe('Admin Announcements functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // Recipient vendor for all_seller announcements.
        await seedVendor(adminAnnouncementsData.vendor);
        // Read-only published fixture used by list/search/overview tests.
        await seedAnnouncement(adminAnnouncementsData.listed.title);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let announcements: AdminAnnouncementsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            announcements = new AdminAnnouncementsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Announcement list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await announcements.goto();
            await expect(announcements.reactRoot).toBeVisible();
            await expect(announcements.heading).toBeVisible();
            await expect(announcements.columnHeader('Title')).toBeVisible();
            await expect(announcements.columnHeader('Vendor Info')).toBeVisible();
            await expect(announcements.columnHeader('Date')).toBeVisible();
            await expect(announcements.columnHeader('Status')).toBeVisible();
            expect(await announcements.getRowCount(), 'seeded announcement rows render').toBeGreaterThan(0);
            expect(await announcements.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('Add Announcement button navigates to the create form', { tag: ['@pro', '@admin'] }, async () => {
            await announcements.goto();
            await announcements.clickAddAnnouncement();
            await expect(page).toHaveURL(/#\/announcement\/create/);
            await expect(announcements.titleInput).toBeVisible();
        });

        // QUARANTINED @exploratory: the admin Announcement DataViews list renders NO
        // free-text search input (AnnouncementList.tsx adds no <SearchInput> and
        // fetchAnnouncements sends no `search` param — see adminAnnouncementsPage.search).
        // Only the Vendors page has search, so search-driven title filtering cannot be
        // exercised here. Documented product gap — re-enable when admin search lands.
        test('searching by title filters the list to the matching announcement', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await announcements.goto();
            await announcements.search(adminAnnouncementsData.listed.title);
            await expect(announcements.rowByTitle(adminAnnouncementsData.listed.title)).toBeVisible();
        });

        test('admin can create an announcement and it appears in the Published list', { tag: ['@pro', '@admin'] }, async () => {
            // Unique per run so reruns never collide on the same title.
            const title = `${adminAnnouncementsData.createTarget.title} ${Date.now()}`;
            await announcements.goto();
            await announcements.clickAddAnnouncement();
            await announcements.createAnnouncement(title);
            // Back on the list — find the freshly created (published) row.
            await announcements.clickTab(/Published/);
            await announcements.search(title);
            await expect(announcements.rowByTitle(title)).toBeVisible();
            expect(await announcements.statusOfRow(title)).toBe('Published');
            // Cleanup: trash + permanently delete so the suite stays idempotent.
            const id = await apiUtils.getAllAnnouncements(payloads.adminAuth).then((all: any[]) => all.find(a => a.title === title)?.id);
            if (id) {
                await apiUtils.deleteAnnouncement(String(id), payloads.adminAuth);
            }
        });

        test('Edit row action navigates to the announcement detail route', { tag: ['@pro', '@admin'] }, async () => {
            // Seed a draft (Edit is ineligible for published announcements).
            const title = `AANN Edit Target ${Date.now()}`;
            const [, draftId] = await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), title, status: 'draft', announcement_type: 'all_seller' }, payloads.adminAuth);
            await announcements.goto();
            await announcements.clickTab(/Draft/);
            await announcements.search(title);
            await announcements.editAnnouncement(title);
            await expect(page).toHaveURL(/#\/announcement\/\d+/);
            await apiUtils.deleteAnnouncement(draftId, payloads.adminAuth);
        });

        test('admin can trash then permanently delete an announcement (removed from the list)', { tag: ['@pro', '@admin'] }, async () => {
            const title = `${adminAnnouncementsData.deleteTarget.title} ${Date.now()}`;
            await seedAnnouncement(title);
            await announcements.goto();

            // 1) Move to Trash from the All/Published tab.
            await announcements.search(title);
            await expect(announcements.rowByTitle(title)).toBeVisible();
            await announcements.trashAnnouncement(title);

            // 2) The row now lives under the Trash tab.
            await announcements.clickTab(/Trash/);
            await announcements.search(title);
            await expect(announcements.rowByTitle(title)).toBeVisible();
            expect(await announcements.statusOfRow(title)).toBe('Trash');

            // 3) Delete permanently — row disappears from the Trash tab.
            await announcements.deletePermanently(title);
            await announcements.search(title);
            await expect.poll(async () => announcements.hasRowWithTitle(title), { timeout: 10000 }).toBe(false);
        });

        test('clicking a row opens the read-only Announcement Overview modal', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await announcements.goto();
            await announcements.search(adminAnnouncementsData.listed.title);
            const dialog = await announcements.openOverview(adminAnnouncementsData.listed.title);
            await expect(dialog).toBeVisible();
            await expect(dialog.getByText(adminAnnouncementsData.listed.title).first()).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let announcements: AdminAnnouncementsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            announcements = new AdminAnnouncementsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('an empty status tab shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            // The admin Announcement list renders no search input (see
            // adminAnnouncementsPage.search), so an "unmatched search" empty state
            // is unreachable via the UI. The Scheduled (future) tab is genuinely
            // empty in the seeded fixture, so it exercises the same DataViews
            // empty-state render path deterministically.
            await announcements.goto();
            await announcements.clickTab(/Scheduled/);
            const empty = (await announcements.isEmptyStateVisible()) || (await announcements.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an empty status tab').toBe(true);
        });

        test('creating an announcement with an empty title is blocked with an inline error', { tag: ['@pro', '@admin'] }, async () => {
            await announcements.gotoCreate();
            const error = await announcements.submitEmptyTitle();
            await expect(error).toBeVisible();
            // Stayed on the create route — no announcement was saved.
            await expect(page).toHaveURL(/#\/announcement\/create/);
        });

        test('reloading on #/announcement preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await announcements.goto();
            await announcements.reload();
            await expect(page).toHaveURL(/#\/announcement/);
            await expect(announcements.reactRoot).toBeVisible();
            await expect(announcements.heading).toBeVisible();
        });

        test('reloading on #/announcement/create keeps the create form, not the list', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await announcements.gotoCreate();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await expect(page).toHaveURL(/#\/announcement\/create/);
            await expect(announcements.titleInput).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Announcement page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const announcements = new AdminAnnouncementsPage(page);
            await page.goto(announcements.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await announcements.isAccessDenied(), 'a vendor must not see the admin Announcement UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Announcement page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const announcements = new AdminAnnouncementsPage(page);
            await page.goto(announcements.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await announcements.isAccessDenied(), 'a customer must not see the admin Announcement UI').toBe(true);
            await ctx.close();
        });
    });
});
