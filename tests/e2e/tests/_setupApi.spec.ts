import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'
import { data } from '../utils/testData'

import { LoginPage } from '../pages/loginPage'
import { AdminPage } from '../pages/adminPage'
import { CustomerPage } from '../pages/customerPage'
import { VendorPage } from '../pages/vendorPage'
import { helpers } from '../utils/helpers'


// test.beforeAll(async ({ }) => { });
// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });

//TODO: add more assertion, and move api assertion to function level

test.describe('setup test api', () => {

    test('check active plugins ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let activePlugins = (await apiUtils.getAllPluginByStatus('active')).map((a: { plugin: any }) => a.plugin)
        expect(activePlugins).toEqual(data.plugin.plugins)
        // console.log(activePlugins)
    })

    test('set wp settings', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings)
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings))

    })

    test('set wc settings', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [generalSettingsResponse,] = await apiUtils.updateBatchWcSettingsOptions('general', payloads.general)
        expect(generalSettingsResponse.ok()).toBeTruthy()
        let [accountSettingsResponse,] = await apiUtils.updateBatchWcSettingsOptions('account', payloads.account)
        expect(accountSettingsResponse.ok()).toBeTruthy()
    })

    test('set tax rate', async ({ request }) => {
        let apiUtils = new ApiUtils(request)

        // enable tax rate 
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.enableTaxRate)

        // delete previous tax rates
        let allTaxRateIds = (await apiUtils.getAllTaxRates()).map((a: { id: any }) => a.id)
        if (allTaxRateIds.length) {
            await apiUtils.updateBatchTaxRates('delete', allTaxRateIds)
        }

        // create tax rate
        let taxRateResponse = await apiUtils.createTaxRate(payloads.createTaxRate)
        expect(parseInt(taxRateResponse.rate)).toBe(parseInt(payloads.createTaxRate.rate))
    })

    test('set shipping methods', async ({ request }) => {
        let apiUtils = new ApiUtils(request)

        // delete previous shipping zones
        let allShippingZoneIds = (await apiUtils.getAllShippingZones()).map((a: { id: any }) => a.id)
        // allShippingZoneIds = helpers.removeItem(allShippingZoneIds, 0) // remove default zone id
        if (allShippingZoneIds.length) {
            for (let shippingZoneId of allShippingZoneIds) {
                await apiUtils.deleteShippingZone(shippingZoneId)
            }
        }

        // create shipping zone, location and method
        let [, zoneId] = await apiUtils.createShippingZone(payloads.createShippingZone)
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation)
        let flatRateResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFlatRate)
        expect(flatRateResponseBody.enabled).toBe(true)
        let freeShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFreeShipping)
        expect(freeShippingResponseBody.enabled).toBe(true)
        let localPickupResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodLocalPickup)
        expect(localPickupResponseBody.enabled).toBe(true)
        let tableRateShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanTableRateShipping)
        expect(tableRateShippingResponseBody.enabled).toBe(true)
        let distanceRateShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanDistanceRateShipping)
        expect(distanceRateShippingResponseBody.enabled).toBe(true)
        let dokanVendorShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanVendorShipping)
        expect(dokanVendorShippingResponseBody.enabled).toBe(true)
    })

    test('set basic payments', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [bacsResponse,] = await apiUtils.updatePaymentGateway('bacs', payloads.bcs)
        expect(bacsResponse.ok()).toBeTruthy()
        let [chequeResponse,] = await apiUtils.updatePaymentGateway('cheque', payloads.cheque)
        expect(chequeResponse.ok()).toBeTruthy()
        let [codResponse,] = await apiUtils.updatePaymentGateway('cod', payloads.cod)
        expect(codResponse.ok()).toBeTruthy()
    })

    test('add categories and attributes', async ({ request }) => {
        let apiUtils = new ApiUtils(request)

        // delete previous categories
        let allCategoryIds = (await apiUtils.getAllCategories()).map((a: { id: any }) => a.id)
        await apiUtils.updateBatchCategories('delete', allCategoryIds)

        // delete previous attributes
        let allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: any }) => a.id)
        await apiUtils.updateBatchAttributes('delete', allAttributeIds)

        // create category
        await apiUtils.createCategory(payloads.createCategory)

        // create attribute, attribute term
        let [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' })
        let [responseS, responseBodyS,] = await apiUtils.createAttributeTerm(attributeId, { name: 's' })
        expect(responseS.ok()).toBeTruthy()
        let [responseL, responseBodyL,] = await apiUtils.createAttributeTerm(attributeId, { name: 'l' })
        expect(responseL.ok()).toBeTruthy()
        let [responseM, responseBodyM,] = await apiUtils.createAttributeTerm(attributeId, { name: 'm' })
        expect(responseM.ok()).toBeTruthy()

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

    test.fixme('add test vendor1 rma settings', async ({ page }) => {
        const loginPage = new LoginPage(page)
        const vendorPage = new VendorPage(page)
        await loginPage.login(data.vendor)
        await vendorPage.setRmaSettings(data.vendor.rma)
    })

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

    test.fixme('admin set dokan vendor subscription settings', async ({ }) => {
        // await loginPage.adminLogin(data.admin)
        await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription)
    })

    test.skip('admin add dokan subscription', async ({ }) => {
        await loginPage.adminLogin(data.admin)
        await adminPage.addDokanSubscription({ ...data.product.vendorSubscription, productName: data.predefined.vendorSubscription.nonRecurring })
    })
})
