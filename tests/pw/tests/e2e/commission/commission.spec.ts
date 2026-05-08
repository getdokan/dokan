import { test } from '@playwright/test';
import { CommissionPage } from './commissionPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Commission Tests @lite', () => {
    test('Test Case 1 - Admin Configures Fixed Commission Settings', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);

        await commissionPage.goToSettingsPage();
        await commissionPage.openSellingOptionsTab();

        await commissionPage.selectCommissionType(commissionPage.testData.commission.commissionType);

        await commissionPage.setPercentageValue(commissionPage.testData.commission.percentageValue);
        await commissionPage.setFixedValue(commissionPage.testData.commission.fixedValue);
        await commissionPage.clickSubmitButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 2 - Admin Configures Category Based Commission Settings', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);

        await commissionPage.goToSettingsPage();
        await commissionPage.openSellingOptionsTab();

        await commissionPage.selectCommissionType(commissionPage.testData.commission.categoryBasedType);

        await commissionPage.setCategoryBasedPercentageValue(commissionPage.testData.commission.categoryBasedValue);
        await commissionPage.setCategoryBasedFixedValue(commissionPage.testData.commission.categoryBasedValue);
        await commissionPage.clickSubmitButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 3 - Admin Creates Product with Commission Specific Settings', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);
        const data = commissionPage.testData.product;

        await commissionPage.goToNewProductPage();
        await commissionPage.setProductTitle(data.title);

        await commissionPage.clickGeneralProductData();
        await commissionPage.setRegularPrice(data.regularPrice);
        await commissionPage.setSalePrice(data.salePrice);

        await commissionPage.clickAdvancedProductData();
        await commissionPage.setAdminCommission(data.adminCommission);
        await commissionPage.setPerProductAdminFee(data.perProductAdminFee);

        await commissionPage.clickPublishButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });
});
