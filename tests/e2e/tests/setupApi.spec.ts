import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'
import { data } from '../utils/testData'

import { LoginPage } from '../pages/loginPage'
import { AdminPage } from '../pages/adminPage'
import { CustomerPage } from '../pages/customerPage'
import { VendorPage } from '../pages/vendorPage'


// test.beforeAll(async ({ }) => { });
// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });


test.describe('setup test api', () => {

    test('check active plugins ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let activePlugins = (await apiUtils.getAllPluginByStatus('active')).map((a: { plugin: any }) => a.plugin)
        expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins))
        // console.log(activePlugins)
    })

    test('set wp settings', async ({ page, request }) => {
        let apiUtils = new ApiUtils(request)
        let siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings)
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings))

    })

    test('set wc settings', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.general)  // todo: should currency be separated on not
        await apiUtils.updateBatchWcSettingsOptions('account', payloads.account)
    })

    test('set tax rate', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.general) //todo:  payload: only enable tax should be on payload
        let taxRate = await apiUtils.createTaxRate(payloads.createTaxRate)
        // expect(taxRate).toContain(expect.objectContaining(payloads.createTaxRate)) //todo: assertion
    })

    test('set shipping methods', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, zoneId] = await apiUtils.createShippingZone(payloads.createShippingZone)
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation)
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFlatRate)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFreeShipping)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodLocalPickup)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanTableRateShipping)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanDistanceRateShipping)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanVendorShipping)
    })


    test('set basic payments', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        await apiUtils.updatePaymentGateway('bacs', payloads.bcs)
        await apiUtils.updatePaymentGateway('cheque', payloads.cheque)
        await apiUtils.updatePaymentGateway('cod', payloads.cod)
    })

    test('add categories and attributes', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        await apiUtils.createCategory(payloads.createCategory)
        let [, attributeId] = await apiUtils.createAttribute({ name: 'size' })
        await request.post(endPoints.createAttributeTerm(attributeId), { data: { name: 's' } })
        await request.post(endPoints.createAttributeTerm(attributeId), { data: { name: 'l' } })
        await request.post(endPoints.createAttributeTerm(attributeId), { data: { name: 'm' } })

    })

    // Vendor Details 

    test('add test vendor', async ({ request }) => {
        let apiUtils = new ApiUtils(request)

        // create store
        let [storeResponseBody, storeResponseStatus] = await apiUtils.createStore(payloads.createStore1)
        storeResponseBody.code === 'existing_user_login' ? expect(storeResponseStatus).toBe(500) : expect(storeResponseStatus).toBe(200)

        // create store product    
        let product = { ...payloads.createProduct(), name: 'p1_v1' }
        let [, productId] = await apiUtils.createProduct(product, payloads.vendorAuth)

        // create store coupon
        let coupon = { ...payloads.createCoupon(), code: 'c1_v1' }
        let [couponResponseBody, couponResponseStatus] = await apiUtils.createCoupon(productId, coupon, payloads.vendorAuth)
        couponResponseBody.code === 'woocommerce_rest_coupon_code_already_exists' ? expect(couponResponseStatus).toBe(400) : expect(couponResponseStatus).toBe(200)
    })

    // test('add test vendor1 rma settings', async ({ page }) => {
    //     const loginPage = new LoginPage(page)
    //     const vendorPage = new VendorPage(page)
    //     await loginPage.login(data.vendor)
    //     await vendorPage.setRmaSettings(data.vendor.rma)
    // })

    test('admin add test vendor products ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let product = payloads.createProduct()
        await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false })
        await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true })
        await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true })
        await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true })
    })

    // Customer Details 

    test('add test customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [responseBody, status] = await apiUtils.createCustomer(payloads.createCustomer1)
        responseBody.code === 'registration-error-email-exists' ? expect(status).toBe(400) : expect(status).toBe(200)
    })

})



test.describe('setup test e2e', () => {

    test.use({ storageState: 'adminStorageState.json' })

    let loginPage: any
    let adminPage: any
    let page: any
    
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        loginPage = new LoginPage(page)
        adminPage = new AdminPage(page)
    });


    test('admin set WpSettings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setWpSettings(data.wpSettings)
    })

    // test.skip('admin add dokan subscription', async ({  }) => {
    //     await loginPage.adminLogin(data.admin)
    //     await adminPage.addDokanSubscription({ ...data.product.vendorSubscription, ...data.predefined.vendorSubscription.nonRecurring })
    // })

    test('admin set dokan general settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanGeneralSettings(data.dokanSettings.general)
    })

    test('admin set dokan selling settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanSellingSettings(data.dokanSettings.selling)
    })

    test('admin set dokan withdraw settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw)
    })

    test('admin set dokan page settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setPageSettings(data.dokanSettings.page)
    })

    test('admin set dokan appearance settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance)
    })

    test('admin set dokan privacy policy settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy)
    })

    test('admin set dokan store support settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport)
    })

    test('admin set dokan rma settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanRmaSettings(data.dokanSettings.rma)
    })

    test('admin set dokan wholesale settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale)
    })

    test('admin set dokan eu compliance settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance)
    })

    test.skip('admin set dokan delivery time settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime)
    })

    test('admin set dokan product advertising settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising)
    })

    test('admin set dokan geolocation settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation)
    })

    test('admin set dokan product report abuse settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse)
    })

    test('admin set dokan spmv settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv)
    })

    test.skip('admin set dokan vendor subscription settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription)
    })

})
