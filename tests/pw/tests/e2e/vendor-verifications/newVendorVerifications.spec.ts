import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewVendorVerificationsPage, newVendorVerificationsSelectors } from './newVendorVerificationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { data } from '@utils/testData';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the React vendor Verification settings (Pro module
// vendor_verification) at /dashboard/new/#/settings/verification — a CARD list.
// Ported from the legacy `vendor-verifications` spec (100% no-op stub, incl. its
// own stub ApiUtils — vacuous green). Seeding is REST-first via the REAL @utils;
// admin acts via REST for approve/reject; the vendor drives submit/cancel/resubmit
// on the React cards. The page fetches once and never refetches, so mid-test REST
// writes are asserted after a fresh goto/reload.
// ============================================

const { VENDOR_ID } = process.env;

let apiUtils: ApiUtils;
let mediaId: string;
const methodIds: string[] = [];

/** Seed an enabled verification method; returns [methodId, title]. */
async function seedMethod(): Promise<{ id: string; title: string }> {
    const [, id, title] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
    methodIds.push(id);
    return { id, title };
}

/** Seed a verification request (admin can set any status) with the shared document. */
async function seedRequest(methodId: string, status: string, note?: string): Promise<string> {
    const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: Number(VENDOR_ID), method_id: Number(methodId), documents: [Number(mediaId)], status, ...(note ? { note } : {}) }, payloads.adminAuth);
    return requestId;
}

async function requestCount(methodId: string, status: string): Promise<number> {
    const rows = await apiUtils.getAllVerificationRequests({ vendor_id: VENDOR_ID, method_id: methodId, status }, payloads.adminAuth);
    return Array.isArray(rows) ? rows.length : 0;
}

test.describe('Vendor Verifications (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The SPA route + REST only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.vendorVerification, payloads.adminAuth);
        // One shared document — reused by every seeded request AND it guarantees the
        // wp.media Library tab is non-empty for the upload test.
        [, mediaId] = await apiUtils.uploadMedia(data.image.avatar, payloads.mimeTypes.png, payloads.adminAuth);
    });

    test.afterAll(async () => {
        for (const id of methodIds) {
            await apiUtils.delete(endPoints.deleteVerificationMethod(id), { headers: payloads.adminAuth }).catch(() => undefined);
        }
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let vv: NewVendorVerificationsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            vv = new NewVendorVerificationsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the verification settings page with a seeded method (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await vv.goto();
            expect(page.url(), 'on the /settings/verification route').toMatch(/#\/settings\/verification/);
            expect(await vv.cardVisible(method.title), 'the seeded method card renders').toBe(true);
            expect(await vv.cardHasButton(method.title, /Start Verification/i), 'an idle method offers Start Verification').toBe(true);
            expect(await vv.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can submit a verification request with an uploaded document (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await vv.goto();
            await vv.startVerification(method.title);
            await vv.uploadFromMediaLibrary(method.title);
            await vv.submit(method.title);
            // Behavioral oracle: a pending request now exists for this method (REST).
            expect(await requestCount(method.id, 'pending'), 'a pending request was created (REST)').toBeGreaterThanOrEqual(1);
        });

        test("vendor can't submit a verification request without a document (React)", { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await vv.goto();
            await vv.startVerification(method.title);
            const noPost = await vv.submitExpectingNoPost(method.title);
            expect(noPost, 'no request POST fired when submitting without a document').toBe(true);
            expect(await requestCount(method.id, 'pending'), 'no pending request was created (REST)').toBe(0);
        });

        test('vendor can re-submit a rejected verification request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await seedRequest(method.id, 'rejected');
            await vv.goto();
            expect(await vv.cardHasButton(method.title, /Resubmit/i), 'a rejected request offers Resubmit').toBe(true);
            await vv.resubmit(method.title);
            // Resubmit pre-loads the previous documents, so no media modal is needed.
            await vv.submit(method.title);
            expect(await requestCount(method.id, 'pending'), 'resubmit created a new pending request (REST)').toBeGreaterThanOrEqual(1);
        });

        test('vendor can cancel a pending verification request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await seedRequest(method.id, 'pending');
            await vv.goto();
            await vv.cancelRequest(method.title);
            expect(await requestCount(method.id, 'cancelled'), 'the request was cancelled (REST)').toBeGreaterThanOrEqual(1);
            expect(await requestCount(method.id, 'pending'), 'no pending request remains (REST)').toBe(0);
        });

        test('vendor can view the verification request documents (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await seedRequest(method.id, 'pending');
            await vv.goto();
            expect(await vv.cardHasText(method.title, /^Files:/), 'the Files: label renders on the card').toBe(true);
        });

        test('vendor can view the verification request note (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            const note = `PW note ${Date.now()}`;
            await seedRequest(method.id, 'pending', note);
            await vv.goto();
            expect(await vv.cardHasText(method.title, note), 'the seeded note text renders on the card').toBe(true);
        });

        test('an approved verification request offers no vendor actions (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await seedRequest(method.id, 'approved');
            await vv.goto();
            expect((await vv.cardBadgeText(method.title)).toLowerCase(), 'the card shows the Approved badge').toContain('approv');
            expect(await vv.cardHasButton(method.title, /^Cancel$/), 'no Cancel on an approved request').toBe(false);
            expect(await vv.cardHasButton(method.title, /Resubmit/i), 'no Resubmit on an approved request').toBe(false);
            expect(await vv.cardHasButton(method.title, /Start Verification/i), 'no Start Verification on an approved request').toBe(false);
        });

        test('HashRouter survives a reload on /settings/verification (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const method = await seedMethod();
            await vv.goto();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newVendorVerificationsSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            await vv.waitForReady();
            expect(page.url(), 'reload keeps the #/settings/verification route').toMatch(/#\/settings\/verification/);
            expect(await vv.cardVisible(method.title), 'the seeded card re-renders after reload').toBe(true);
            expect(await vv.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        test('an admin-approved request is reflected on the vendor verification card (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            const method = await seedMethod();
            const requestId = await seedRequest(method.id, 'pending');
            // Admin approves via REST.
            await apiUtils.updateVerificationRequest(requestId, { ...payloads.updateVerificationRequest(), vendor_id: Number(VENDOR_ID), method_id: Number(method.id), documents: [Number(mediaId)], status: 'approved' }, payloads.adminAuth);
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const vv = new NewVendorVerificationsPage(page);
            try {
                await vv.goto();
                expect((await vv.cardBadgeText(method.title)).toLowerCase(), 'the vendor card reflects the admin approval').toContain('approv');
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
