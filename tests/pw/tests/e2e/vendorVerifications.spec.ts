import { test, request, Page } from '@playwright/test';
import { VendorVerificationsPage } from '@pages/vendorVerificationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

const { VENDOR_ID, VENDOR2_ID } = process.env;

test.describe('Verifications test', () => {
    test.skip(true, 'feature not merged yet');
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
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorVerificationsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorVerificationsPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorVerificationsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, methodId, methodName] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        [, mediaId] = await apiUtils.uploadMedia(data.image.avatar, payloads.mimeTypes.png, payloads.adminAuth);
        [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
    });

    //admin

    // verification methods

    test('admin can add vendor verification method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addVendoVerificationMethod(data.dokanSettings.vendorVerification.customMethod);
    });

    test('admin can edit vendor verification method', { tag: ['@pro', '@admin'] }, async () => {
        const [, , methodTitle] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await admin.editVendoVerificationMethod(methodTitle, data.dokanSettings.vendorVerification.updateMethod);
    });

    test('admin can delete vendor verification method', { tag: ['@pro', '@admin'] }, async () => {
        const [, , methodTitle] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod(), payloads.adminAuth);
        await admin.deleteVendoVerificationMethod(methodTitle);
    });

    // verification requests

    test('admin can view verifications menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminVerificationsRenderProperly();
    });

    test('admin can filter verification requests by pending status', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterVerificationRequests('Pending', 'by-status');
    });

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

    test('admin can filter verification requests by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterVerificationRequests(data.predefined.vendorStores.vendor1, 'by-vendor');
    });

    test('admin can filter verification requests by verification methods', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'has issue');
        await admin.filterVerificationRequests(methodName, 'by-verification-method');
    });

    test('admin can add note to verification request', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addNoteVerificationRequest(requestId, 'test verification note');
    });

    test('admin can view verification request documents', { tag: ['@pro', '@admin'] }, async () => {
        await admin.viewVerificationRequestDocument(requestId);
    });

    test('admin can approve verification request', { tag: ['@pro', '@admin'] }, async () => {
        const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await admin.updateVerificationRequest(requestId, 'approve');
    });

    test('admin can reject verification request', { tag: ['@pro', '@admin'] }, async () => {
        const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        //todo: need to force goto or reload page, page is not reloading because of previous test are on the same page, and created data via api is not loading
        await admin.updateVerificationRequest(requestId, 'reject');
    });

    test('admin can perform bulk action on verification requests', { tag: ['@pro', '@admin'] }, async () => {
        await admin.verificationRequestBulkAction('approved');
    });

    // vendor

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
        [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] }, payloads.adminAuth);
        await vendor.cancelVerificationRequest(methodName);
    });

    // customer

    test('customer can view verified badge', { tag: ['@pro', '@customer'] }, async () => {
        //TODO: need verified vendor
        await customer.viewVerifiedBadge(data.predefined.vendorStores.vendor1);
    });

    test('admin can change verified icon', { tag: ['@pro', '@customer'] }, async () => {
        //TODO: need verified vendor
        await admin.changeVerifiedIcon(data.dokanSettings.vendorVerification.verifiedIcons.byIcon.certificateSolid, data.predefined.vendorStores.vendor1);
    });
});
