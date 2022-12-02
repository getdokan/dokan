import { test, expect, type Page } from '@playwright/test'
import { data } from '../utils/testData'
import { LoginPage } from '../pages/loginPage'
import { AdminPage } from '../pages/adminPage'
import { CustomerPage } from '../pages/customerPage'
import { VendorPage } from '../pages/vendorPage'

// test.beforeAll(async ({ page }) => { });
// test.afterAll(async ({ page }) => { });
// test.beforeEach(async ({ page }) => { });
// test.afterEach(async ({ page }) => { });


test.describe('Admin functionality test', () => {

    test.only('admin can login', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const adminPage = new AdminPage(page)
        const consoleLogs = [];
        page.on("console", msg => {
            // if (msg.type() == "error") {
                console.log(msg.text());
                // consoleLogs.push(msg.text());
            // }
        })
        await loginPage.adminLogin(data.admin)
    })
    

    test('admin can logout', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const adminPage = new AdminPage(page)
        await loginPage.adminLogin(data.admin)
        await loginPage.adminLogout()
        expect('1').toBe('2')
    })

    test('admin can logout1', async ({ page }) => {
        expect('1').toBe('1')
    })
    test('admin can logout2', async ({ page }) => {
        expect('1').toBe('1')
    })
    test('admin can logout3', async ({ page }) => {
        expect('1').toBe('3')
    })

    // test('admin can set dokan setup wizard',async ({page}) => { . //todo
    //     const loginPage = new LoginPage(page)
    //     const adminPage = new AdminPage(page)
    //     await loginPage.adminLogin(data.admin)
    //     await adminPage.setDokanSetupWizard(data.dokanSetupWizard)
    // })

    // test('admin can add vendor',async ({page}) => { . //todo
    //     const loginPage = new LoginPage(page)
    //     const adminPage = new AdminPage(page)
    //     await loginPage.adminLogin(data.admin)
    //     await adminPage.addVendor(data.vendor.vendorInfo)

    // })

    // test('admin can add simple product', async ({ page }) => {
    //     const loginPage = new LoginPage(page)
    //     const adminPage = new AdminPage(page)
    //     await loginPage.adminLogin(data.admin)
    //     await adminPage.addSimpleProduct(data.product.simple)
    // })

    //    test.skip('admin can add variable product',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addVariableProduct(data.product.variable)
    //     })

    //     test('admin can add simple subscription ',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addSimpleSubscription(data.product.simpleSubscription)
    //     })

    //    test.skip('admin can add variable subscription ',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addVariableSubscription(data.product.variableSubscription)
    //     })

    //     test('admin can add external product',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addExternalProduct(data.product.external)
    //     })

    //     test('admin can add vendor subscription ',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addDokanSubscription(data.product.vendorSubscription)
    //     })

    //     test('admin can add auction product',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addAuctionProduct(data.product.auction)
    //     })

    //     test('admin can add booking product',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addBookingProduct(data.product.booking)
    //     })

    //     test('admin can add categories',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addCategory(data.product.category.clothings)
    //     })

    //     test('admin can add attributes',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addAttributes(data.product.attribute.size)
    //     })


    //     // settings

    //     // tax settings
    //     test('admin can set standard tax rate',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         // await loginPage.adminLogin(data.admin)
    //         await adminPage.addStandardTaxRate(data.tax)
    //     })

    //     // shipping settings
    //     test('admin can set flat rate shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.flatRate)
    //     })

    //     test('admin can set free shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.freeShipping)
    //     })

    //     test('admin can set local pickup shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.localPickup)
    //     })

    //     test('admin can set table rate shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
    //     })

    //     test('admin can set distance rate shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
    //     })

    //     test('admin can set vendor shipping',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
    //     })

    //     // payment

    //     test('admin can add basic payment methods',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupBasicPaymentMethods(data.payment)
    //     })

    //     test('admin can add strip payment method',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupStripeConnect(data.payment)
    //     })

    //     test('admin can add paypal marketplace payment method',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupPaypalMarketPlace(data.payment)
    //     })

    //     test('admin can add mangopay payment method',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupMangoPay(data.payment)
    //     })

    //     test('admin can add razorpay payment method',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupRazorpay(data.payment)
    //     })

    //     test('admin can add strip express payment method',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setupStripeExpress(data.payment)
    //     })

    //     // dokan settings

    //     test('admin can set dokan general settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanGeneralSettings(data.dokanSettings.general)
    //     })

    //     test('admin can set dokan selling settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanSellingSettings(data.dokanSettings.selling)
    //     })

    //     test('admin can set dokan withdraw settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw)
    //     })


    //     test('admin can set dokan page settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setPageSettings(data.dokanSettings.page)
    //     })

    //     test('admin can set dokan appearance settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanAppearanceSettings(data.dokanSettings.appreance)
    //     })

    //     test('admin can set dokan privacy policy settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy)
    //     })

    //     test('admin can set dokan store support settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport)
    //     })

    //     test('admin can set dokan rma settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanRmaSettings(data.dokanSettings.rma)
    //     })

    //     test('admin can set dokan wholesale settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale)
    //     })

    //     test('admin can set dokan eu compliance settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanEuComplianceSettings()
    //     })

    //     test('admin can set dokan delivery time settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime)
    //     })

    //     test('admin can set dokan product advertising settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising)
    //     })

    //     test('admin can set dokan geolocation settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation)
    //     })

    //     test('admin can set dokan product report abuse settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse)
    //     })

    //     test('admin can set dokan spmv settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv)
    //     })

    //     test('admin can set dokan vendor subscription settings',async ({page}) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription)
    //     })


})