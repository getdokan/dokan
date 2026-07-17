import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewAnnouncementsPage, newAnnouncementsSelectors } from './newAnnouncementsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the ONE genuine gap on the React vendor "Announcements"
// surface (/dashboard/new/#/announcement): the vendor bulk-DELETE flow. The list /
// search / tabs / card-detail / reload parity already lives in
// tests/e2e/announcements/announcementsNewUI.spec.ts, so this file only ports the
// legacy "Vendor Deletes" motive (announcements.spec.ts TC11, which drove the
// legacy SweetAlert). Announcements is core Pro (no module toggle). Admin +
// customer cases STAY (D3); the legacy TC11 vendor case is skipped once this
// passes 3×.
//
// The React delete is bulk-selection driven (checkbox → "Delete" → DokanModal
// "Delete Announcement" → "Yes, Delete") firing DELETE /dokan/v1/announcement/
// notice/{id}. Seed the announcement via admin REST (createAnnouncement); the
// behavioral oracle is the DELETE firing + the card leaving the vendor list. The
// DELETE only removes the vendor's NOTICE, so assert on the VENDOR list, and use a
// unique title so parallel announcement churn can't interfere (§7).
// ============================================

let apiUtils: ApiUtils;

const uniqueTitle = (label: string): string => `nu_del_${label}_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;

/**
 * Seed a published announcement to all sellers via admin REST, then poll the
 * vendor's notice list until it surfaces — removes the seed→list propagation race
 * (a fresh notice isn't queryable by the vendor for a beat after the admin POST).
 */
async function seedAnnouncement(title: string): Promise<void> {
    await apiUtils.createAnnouncement({ ...payloads.createAnnouncement(), title }, payloads.adminAuth);
    for (let i = 0; i < 20; i++) {
        const [, body] = await apiUtils.get(endPoints.getAllAnnouncements, { headers: payloads.vendorAuth }, false);
        const arr = Array.isArray(body) ? body : (body?.data ?? []);
        if (arr.some((a: { title?: string }) => String(a.title ?? '').includes(title))) return;
        await new Promise(r => setTimeout(r, 500));
    }
}

test.describe('Announcements delete (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let announcements: NewAnnouncementsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            announcements = new NewAnnouncementsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('selecting a card + bulk Delete opens the "Delete Announcement" DokanModal (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const title = uniqueTitle('modal');
            await seedAnnouncement(title);
            await announcements.goto();
            expect(await announcements.findCard(title), 'the seeded announcement card is listed').toBe(true);
            await announcements.selectCard(title);
            await announcements.openDeleteModal();
            const buttons = await announcements.deleteModalButtons();
            expect(buttons.confirm, 'the "Yes, Delete" confirm button renders').toBe(true);
            expect(buttons.cancel, 'the "Cancel" button renders').toBe(true);
        });

        test('confirming delete removes the announcement from the vendor list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const title = uniqueTitle('confirm');
            await seedAnnouncement(title);
            await announcements.goto();
            expect(await announcements.findCard(title), 'seeded card present before delete').toBe(true);
            await announcements.selectCard(title);
            await announcements.openDeleteModal();
            await announcements.confirmDelete();
            // Oracle: the card is gone from the vendor list after the DELETE + refetch.
            await expect(page.locator(newAnnouncementsSelectors.articleRow).filter({ hasText: title }), 'the announcement card is removed').toHaveCount(0, { timeout: 15000 });
        });

        test('Cancel on the delete modal keeps the announcement (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const title = uniqueTitle('cancel');
            await seedAnnouncement(title);
            await announcements.goto();
            expect(await announcements.findCard(title), 'seeded card present').toBe(true);
            await announcements.selectCard(title);
            await announcements.openDeleteModal();
            // No DELETE must fire when we Cancel.
            const deleteFired = page
                .waitForResponse(r => newAnnouncementsSelectors.deleteNoticeRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 3000 })
                .then(() => true)
                .catch(() => false);
            await announcements.cancelDelete();
            expect(await deleteFired, 'no DELETE fired on Cancel').toBe(false);
            expect(await announcements.cardVisible(title), 'the announcement card is still present after Cancel').toBe(true);
        });
    });
});
