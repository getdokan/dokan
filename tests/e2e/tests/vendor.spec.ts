import { test, expect, type Page } from '@playwright/test'
import { data } from '../utils/testData'
import { LoginPage } from '../pages/loginPage'
import { AdminPage } from '../pages/adminPage'
import { CustomerPage } from '../pages/customerPage'
import { VendorPage } from '../pages/vendorPage'

// test.beforeAll(async ({ }) => { });
// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });


test.describe('Vendor functionality test', () => {

    test.use({ storageState: 'adminStorageState.json' })

    let loginPage: any
    let adminPage: any
    let page: any

    test.skip('vendor can register', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await vendorPage.vendorRegister(data.vendor.vendorInfo, data.vendorSetupWizard)
        await loginPage.logout()
    })

    test('vendor can login', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
    })

    test('vendor can logout', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await loginPage.logout()
    })

    test('vendor can add simple product @product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addSimpleProduct(data.product.simple)
    })

    test.skip('vendor can add variable product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addVariableProduct(data.product.variable)
    })

    test.skip('vendor can add simple subscription product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addSimpleSubscription(data.product.simpleSubscription)
    })

    test.skip('vendor can add variable subscription product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addVariableSubscription(data.product.variableSubscription)
    })

    test('vendor can add external product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addExternalProduct(data.product.external)
    })

    test.skip('vendor can add auction product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addAuctionProduct(data.product.auction)
    })

    test('vendor can add booking product', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addBookingProduct(data.product.booking)
    })

    test.skip('vendor can add coupon', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addCoupon(data.coupon)
    })

    test.skip('vendor can request withdraw', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.requestWithdraw(data.vendor.withdraw)
    })

    test.skip('vendor can cancel request withdraw', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.requestWithdraw(data.vendor.withdraw)
        await vendorPage.cancelRequestWithdraw()
    })

    test.skip('vendor can add auto withdraw disbursement schedule', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addAutoWithdrawDisbursementSchedule(data.vendor.withdraw)
    })

    test.skip('vendor can add default withdraw payment methods ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.skrill)
        // Cleanup
        await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.paypal)
    })

    // vendor settings

    test.skip('vendor can set store settings ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setStoreSettings(data.vendor.vendorInfo)
    })

    test.skip('vendor can add addons', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.addAddon(data.vendor.addon)
    })

    test.skip('vendor can edit addon', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        let addonName = await vendorPage.addAddon(data.vendor.addon)
        await vendorPage.editAddon(data.vendor.addon, addonName)
    })

    test.skip('vendor can send id verification request ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.sendIdVerificationRequest(data.vendor.verification)
    })

    test.skip('vendor can send address verification request ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.sendAddressVerificationRequest(data.vendor.verification)
    })

    test.skip('vendor can send company verification request ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.sendCompanyVerificationRequest(data.vendor.verification)
    })

    test.skip('vendor can set delivery time settings ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setDeliveryTimeSettings(data.vendor.deliveryTime)
    })

    test.skip('vendor can set shipping policy', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingPolicies(data.vendor.shipping.shippingPolicy)
    })

    test.skip('vendor can set flat rate shipping ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate)
    })

    test.skip('vendor can set free shipping ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping)
    })

    test.skip('vendor can set local pickup shipping ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup)
    })

    test.skip('vendor can set table rate shipping shipping ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping)
    })

    test.skip('vendor can set dokan distance rate shipping ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping)
    })

    test.skip('vendor can set social profile settings ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setSocialProfile(data.urls)
    })

    test.skip('vendor can set rma settings ', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setRmaSettings(data.vendor.rma)
    })


})
