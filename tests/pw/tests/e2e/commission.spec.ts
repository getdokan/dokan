import { test, request, Page } from '@playwright/test';
import { CommissionPage } from '@pages/commissionPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID, CATEGORY_ID } = process.env;

test.describe('Commission test', () => {
    let admin: CommissionPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const subscriptionProductId: string = '19';

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new CommissionPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        //todo: create a vendor and dokan subscription product
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can set commission on Dokan setup wizard (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard(data.commission);
    });

    test('admin can set commission on Dokan setup wizard (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard({ ...data.commission, commissionType: 'category_based' });
    });

    test('admin can set commission on Dokan setup wizard (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard({ ...data.commission, commissionType: 'category_based', commissionCategory: { allCategory: false, category: CATEGORY_ID } });
    });

    test('admin can set commission on Dokan selling settings (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings(data.commission);
    });

    test('admin can set commission on Dokan selling settings (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings({ ...data.commission, commissionType: 'category_based' });
    });

    test('admin can set commission on Dokan selling settings (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings({ ...data.commission, commissionType: 'category_based', commissionCategory: { allCategory: false, category: CATEGORY_ID } });
    });

    test('admin can set commission for vendor (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(VENDOR_ID, data.commission);
    });

    test('admin can set commission for vendor (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(VENDOR_ID, { ...data.commission, commissionType: 'category_based' });
    });

    test('admin can set commission for vendor (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(VENDOR_ID, { ...data.commission, commissionType: 'category_based', commissionCategory: { allCategory: false, category: CATEGORY_ID } });
    });

    test('admin can set commission for a product (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await admin.setCommissionForProduct(productId, data.commission);
    });

    test('admin can set commission to Dokan subscription product (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, data.commission);
    });

    test('admin can set commission to Dokan subscription product (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, { ...data.commission, commissionType: 'category_based' });
    });

    test('admin can set commission to Dokan subscription product (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, { ...data.commission, commissionType: 'category_based', commissionCategory: { allCategory: false, category: CATEGORY_ID } });
    });
});
