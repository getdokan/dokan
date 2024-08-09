import { test, request, Page } from '@playwright/test';
import { CommissionPage } from '@pages/commissionPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

const { DOKAN_PRO, VENDOR_ID, CATEGORY_ID } = process.env;

test.describe('Commission test', () => {
    let admin: CommissionPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let subscriptionProductId: string;
    let sellerId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new CommissionPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());

        if (DOKAN_PRO) {
            // enable dokan subscription
            await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, { ...dbData.dokan.vendorSubscriptionSettings, enable_pricing: 'on', enable_subscription_pack_in_reg: 'on' });
            await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, enable_min_max_quantity: 'off', enable_min_max_amount: 'off' }); //todo: after dokan issue fixed, remove this line
            // [subscriptionProductId] = await createDokanSubscriptionProduct();
        }
        [, sellerId] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        if (DOKAN_PRO) await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, enable_min_max_quantity: 'on', enable_min_max_amount: 'on' }); //todo: after dokan issue fixed, remove this line
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can set commission on Dokan setup wizard (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard(data.commission.fixed);
    });

    test('admin can set commission on Dokan setup wizard (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard(data.commission.allCategory);
    });

    test('admin can set commission on Dokan setup wizard (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSetupWizard(data.commission.specficCategory);
    });

    test('admin can set commission on Dokan selling settings (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings(data.commission.fixed);
    });

    test('admin can set commission on Dokan selling settings (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings(data.commission.allCategory);
    });

    test('admin can set commission on Dokan selling settings (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionOnDokanSellingSettings(data.commission.specficCategory);
    });

    test('admin can set commission for vendor (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(sellerId, data.commission.fixed);
    });

    test('admin can set commission for vendor (category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(sellerId, data.commission.allCategory);
    });

    test('admin can set commission for vendor (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setCommissionForVendor(sellerId, data.commission.specficCategory);
    });

    test('admin can set commission for a product (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await admin.setCommissionForProduct(productId, data.commission.fixed);
    });

    test('admin can set commission to Dokan subscription product (fixed)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Need to implement createDokanSubscriptionProduct function');
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, data.commission.fixed);
    });

    test('admin can set commission to Dokan subscription product (category based)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Need to implement createDokanSubscriptionProduct function');
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, data.commission.allCategory);
    });

    test('admin can set commission to Dokan subscription product (specific category based)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Need to implement createDokanSubscriptionProduct function');
        await admin.setCommissionToDokanSubscriptionProduct(subscriptionProductId, data.commission.specficCategory);
    });
});
