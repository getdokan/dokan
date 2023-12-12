// import { test as setup, expect, Page } from '@playwright/test';
// import { LoginPage } from '@pages/loginPage';
// import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
// import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
// import { ApiUtils } from '@utils/apiUtils';
// import { payloads } from '@utils/payloads';
// import { data } from '@utils/testData';

// setup.describe('authenticate users & set permalink', () => {
//     setup('authenticate admin @lite', async ({ page }) => {
//         const loginPage = new LoginPage(page);
//         await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
//     });
// });

// setup.describe('setup dokan settings e2e', () => {
//     let productAdvertisingPage: ProductAdvertisingPage;
//     let reverseWithdrawsPage: ReverseWithdrawsPage;
//     let aPage: Page, vPage: Page;
//     let apiUtils: ApiUtils;

//     setup.beforeAll(async ({ browser, request }) => {
//         const adminContext = await browser.newContext(data.auth.adminAuth);
//         aPage = await adminContext.newPage();
//         productAdvertisingPage = new ProductAdvertisingPage(aPage);
//         reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);

//         apiUtils = new ApiUtils(request);
//     });

//     setup.afterAll(async () => {
//         await aPage.close();
//         await vPage.close();
//     });

//     setup('recreate reverse withdrawal payment product via settings save @lite', async () => {
//         await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave();
//     });

//     setup('reverse Withdraw payment product exists @lite', async () => {
//         const product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
//         expect(product).toBeTruthy();
//     });

//     setup('recreate product advertisement payment product via settings save @pro', async () => {
//         await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();
//     });

//     setup('product advertisement payment product exists @pro', async () => {
//         const product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
//         expect(product).toBeTruthy();
//     });
// });
