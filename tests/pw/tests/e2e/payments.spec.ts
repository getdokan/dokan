import { test, Page } from '@playwright/test';
import { PaymentsPage } from 'pages/paymentsPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';

test.describe('Payments test', () => {
    // let admin: PaymentsPage;
    let vendor: PaymentsPage;
    // let aPage: Page, vPage: Page;
    let vPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        // const adminContext = await browser.newContext(data.auth.adminAuth);
        // aPage = await adminContext.newPage();
        // admin = new PaymentsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new PaymentsPage(vPage);

        // apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        // await aPage.close();
        await vPage.close();
    });

    // test('admin can add basic payment methods', async ( ) => {
    //     await adminPage.setupBasicPaymentMethods(data.payment)
    // })

    // test('admin can add strip payment method', async ( ) => {
    //     await adminPage.setupStripeConnect(data.payment)
    // })

    // test('admin can add paypal marketplace payment method', async ( ) => {
    //     await adminPage.setupPaypalMarketPlace(data.payment)
    // })

    // test('admin can add mangopay payment method', async ( ) => {
    //     await adminPage.setupMangoPay(data.payment)
    // })

    // test('admin can add razorpay payment method', async ( ) => {
    //     await adminPage.setupRazorpay(data.payment)
    // })

    // test('admin can add strip express payment method', async ( ) => {
    //     await adminPage.setupStripeExpress(data.payment)
    // })

    test('vendor payment menu is rendering properly @lite @explo', async () => {
        await vendor.vendorPaymentSettingsRenderProperly();
    });

    test('vendor can add paypal payment method @lite', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
    });

    test('vendor can add bank payment method @lite', async () => {
        await vendor.setBankTransfer(data.vendor.payment);
    });

    test('vendor can add skrill payment method @pro', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
    });

    test('vendor can add custom payment method @pro', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
    });

    test('vendor can disconnect paypal payment method @lite', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
    });

    test('vendor can disconnect bank payment method @lite', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'bank' });
    });

    test('vendor can disconnect skrill payment method @pro', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
    });

    test('vendor can disconnect custom payment method @pro', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
    });
});
