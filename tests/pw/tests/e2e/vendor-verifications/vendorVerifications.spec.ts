import { Page, expect, test } from '@utils/test';
import { VendorVerificationsPage, ApiUtils, dbUtils, data, payloads } from './vendorVerificationsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const { VENDOR_ID, VENDOR2_ID } = process.env;

test.describe('Verifications test', () => {
    let admin: VendorVerificationsPage;
    let vendor: VendorVerificationsPage;
    let customer: VendorVerificationsPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let methodId: string;
    let methodName: string;
    let requestId: string;
    let mediaId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorVerificationsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorVerificationsPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new VendorVerificationsPage(cPage);
        apiUtils = new ApiUtils(null);
        // Clean slate: the admin settings "Vendor Verification" tab only loads the
        // first page of methods (per_page=100, ascending by id). Methods accumulate
        // across runs, so a freshly-created method eventually falls onto page 2 and
        // its settings-list row can no longer be found (edit/delete/status tests).
        // Reset the method list each run so every created method stays on page 1.
        await apiUtils.deleteAllVerificationMethods(payloads.adminAuth);
        [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        [, mediaId] = await apiUtils.uploadMedia(data.image.avatar, payloads.mimeTypes.png, payloads.adminAuth);
        [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorVerification, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable vendor verification module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableVendorVerificationModule(); });

    test('admin can change verified icon', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.setUserMeta(VENDOR2_ID, 'dokan_verification_status', 'approved');
        await admin.changeVerifiedIcon(data.dokanSettings.vendorVerification.verifiedIcons.byIcon.certificateSolid, data.predefined.vendorStores.vendor2);
    });
    test('admin can add vendor verification method', { tag: ['@pro', '@admin'] }, async () => { await admin.addVendorVerificationMethod(data.dokanSettings.vendorVerification.customMethod); });
    test('admin can edit vendor verification method', { tag: ['@pro', '@admin'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await admin.editVendorVerificationMethod(methodName, data.dokanSettings.vendorVerification.updateMethod);
    });
    test('admin can delete vendor verification method', { tag: ['@pro', '@admin'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await admin.deleteVendorVerificationMethod(methodName);
    });
    test('admin can update verification method status', { tag: ['@pro', '@admin'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await admin.updateVerificationMethodStatus(methodName, 'disable');
    });
    test('admin can view verifications menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminVerificationsRenderProperly(); });
    test('admin can filter verification requests by pending status', { tag: ['@pro', '@admin'] }, async () => { await admin.filterVerificationRequests('Pending', 'by-status'); });
    test('admin can filter verification requests by approved status', { tag: ['@pro', '@admin'] }, async () => {
        const [, methodId] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'approved' }, payloads.adminAuth);
        await admin.filterVerificationRequests('Approved', 'by-status');
    });
    test('admin can filter verification requests by rejected status', { tag: ['@pro', '@admin'] }, async () => {
        const [, methodId] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'rejected' }, payloads.adminAuth);
        await admin.filterVerificationRequests('Rejected', 'by-status');
    });
    test('admin can filter verification requests by cancelled status', { tag: ['@pro', '@admin'] }, async () => {
        const [, methodId] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'cancelled' }, payloads.adminAuth);
        await admin.filterVerificationRequests('Cancelled', 'by-status');
    });
    test('admin can filter verification requests by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.filterVerificationRequests(data.predefined.vendorStores.vendor1, 'by-vendor'); });
    test('admin can filter verification requests by verification methods', { tag: ['@pro', '@admin'] }, async () => { await admin.filterVerificationRequests(methodName, 'by-verification-method'); });
    test('admin can reset filter', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterVerificationRequests(data.predefined.vendorStores.vendor1, 'by-vendor');
        await admin.resetFilter();
    });
    test('admin can add note to verification request', { tag: ['@pro', '@admin'] }, async () => { await admin.addNoteVerificationRequest(requestId, 'test verification note'); });
    test('admin can view verification request documents', { tag: ['@pro', '@admin'] }, async () => { await admin.viewVerificationRequestDocument(requestId); });
    test('admin can approve verification request', { tag: ['@pro', '@admin'] }, async () => {
        const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await admin.updateVerificationRequest(requestId, 'approve');
    });
    test('admin can reject verification request', { tag: ['@pro', '@admin'] }, async () => {
        const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await admin.updateVerificationRequest(requestId, 'reject');
    });
    test('admin can perform bulk action on verification requests', { tag: ['@pro', '@admin'] }, async () => { await admin.verificationRequestBulkAction('approved'); });

    test('vendor can view verifications settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await vendor.vendorVerificationsSettingsRenderProperly(methodName);
    });
    test('vendor can submit verification request', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await vendor.submitVerificationRequest({ ...data.vendor.verification, method: methodName });
    });
    test('vendor can re-submit verification request', { tag: ['@pro', '@vendor'] }, async () => {
        const [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'rejected' }, payloads.adminAuth);
        await vendor.submitVerificationRequest({ ...data.vendor.verification, method: methodName });
    });
    test('vendor can cancel verification request', { tag: ['@pro', '@vendor'] }, async () => {
        const [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await vendor.cancelVerificationRequest(methodName);
    });
    test('vendor can view verification request documents', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorViewVerificationRequestDocument(methodName); });
    test('vendor can view verification request notes', { tag: ['@pro', '@vendor'] }, async () => {
        const note = 'test verification note';
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], note: note }, payloads.adminAuth);
        await vendor.viewVerificationRequestNote(methodName, note);
    });
    test('vendor can view verification methods on setup wizard', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , nonRequiredMethodName] = await apiUtils.createVerificationMethod({ ...payloads.createVerificationMethod(), required: false }, payloads.adminAuth);
        await vendor.viewVerificationMethods(methodName, nonRequiredMethodName);
    });
    test('vendor can submit verification request on setup wizard', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await vendor.submitVerificationRequest({ ...data.vendor.verification, method: methodName }, true);
    });
    test('vendor can re-submit verification request on setup wizard', { tag: ['@pro', '@vendor'] }, async () => {
        const [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'rejected' }, payloads.adminAuth);
        await vendor.submitVerificationRequest({ ...data.vendor.verification, method: methodName }, true);
    });
    test('vendor can cancel verification request on setup wizard', { tag: ['@pro', '@vendor'] }, async () => {
        const [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await vendor.cancelVerificationRequest(methodName, true);
    });
    test('vendor can view verification request documents on setup wizard', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorViewVerificationRequestDocument(methodName, true); });

    test('customer can view verified badge', { tag: ['@pro', '@customer'] }, async () => {
        await dbUtils.setUserMeta(VENDOR2_ID, 'dokan_verification_status', 'approved');
        await customer.viewVerifiedBadge(data.predefined.vendorStores.vendor2);
    });

    test.skip('vendor need all required method to be verified to get verification badge', { tag: ['@pro', '@vendor'] }, async () => {});
    test.skip('vendor need to be verified only one method when no required method is exists', { tag: ['@pro', '@vendor'] }, async () => {});
    test.skip('vendor address verification gets reset when he update address', { tag: ['@pro', '@vendor'] }, async () => {
        const [, methodId] = await apiUtils.getVerificationMethodId('address', payloads.adminAuth);
        await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId], status: 'approved' }, payloads.adminAuth);
    });

    test('admin can disable vendor verification module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorVerification, payloads.adminAuth);
        await admin.disableVendorVerificationModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Verifications (React) Tests @pro', () => {
    test('Test Case 1 - Verification page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/verification/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Verification form renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/verification/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Vendor Verifications (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/verifications`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/verifications`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

