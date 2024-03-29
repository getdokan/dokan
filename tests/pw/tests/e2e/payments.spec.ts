import { test, request, Page } from '@playwright/test';
import { PaymentsPage } from '@pages/paymentsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Payments test', () => {
    let admin: PaymentsPage;
    let vendor: PaymentsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PaymentsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new PaymentsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    //admin

    test.skip('admin can add basic payment methods @lite @a', async () => {
        await admin.setupBasicPaymentMethods(data.payment);
    });

    test.skip('admin can add strip payment method @pro @a', async () => {
        await admin.setupStripeConnect(data.payment);
    });

    test.skip('admin can add paypal marketplace payment method @pro @a', async () => {
        await admin.setupPaypalMarketPlace(data.payment);
    });

    test.skip('admin can add mangopay payment method @pro @a', async () => {
        await admin.setupMangoPay(data.payment);
    });

    test.skip('admin can add razorpay payment method @pro @a', async () => {
        await admin.setupRazorpay(data.payment);
    });

    test.skip('admin can add strip express payment method @pro @a', async () => {
        await admin.setupStripeExpress(data.payment);
    });

    //vendor

    test('vendor payment menu is rendering properly @lite @exp @v', async () => {
        await vendor.vendorPaymentSettingsRenderProperly();
    });

    test('vendor can add paypal payment method @lite @v', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
    });

    test('vendor can add bank payment method @lite @v', async () => {
        await vendor.setBankTransfer(data.vendor.payment);
    });

    test('vendor can add skrill payment method @pro @v', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
    });

    test('vendor can add custom payment method @pro @v', async () => {
        await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
    });

    test('vendor can disconnect paypal payment method @lite @v', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
        //reset
        await apiUtils.setStoreSettings(payloads.defaultStoreSettings, payloads.vendorAuth);
    });

    test('vendor can disconnect bank payment method @lite @v', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'bank' });
        // reset
        await apiUtils.setStoreSettings(payloads.defaultStoreSettings, payloads.vendorAuth);
    });

    test('vendor can disconnect skrill payment method @pro @v', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
    });

    test('vendor can disconnect custom payment method @pro @v', async () => {
        await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
    });
});
