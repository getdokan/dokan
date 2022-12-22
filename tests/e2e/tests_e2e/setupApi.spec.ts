import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'
import { data } from '../utils/testData'

import { LoginPage } from '../pages/loginPage'
import { AdminPage } from '../pages/adminPage'
import { CustomerPage } from '../pages/customerPage'
import { VendorPage } from '../pages/vendorPage'


// test.beforeAll(async ({ page }) => { });
// test.afterAll(async ({ page }) => { });
// test.beforeEach(async ({ page }) => { });
// test.afterEach(async ({ page }) => { });


test.describe('setup test', () => {


    test('check active plugins ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let activePlugins = (await apiUtils.getAllPluginByStatus('active')).map(a => a.plugin)
        expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins))
        // console.log(activePlugins)
    })

    test('set wp settings', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings)  //todo: permalink set
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings))
        console.log(siteSettings)
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
        await apiUtils.addShippingZoneLoation(zoneId, payloads.addShippingZoneLocation)
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFlatRate)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFreeShipping)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodLocalPickup)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanTableRateShipping)
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanistanceRateShipping)
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

    //     test('admin add dokan subscription', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.addDokanSubscription({ ...data.product.vendorSubscription, ...data.predefined.vendorSubscription.nonRecurring })
    //     })

    //     test('admin set dokan general settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanGeneralSettings(data.dokanSettings.general)
    //     })

    //     test('admin set dokan selling settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanSellingSettings(data.dokanSettings.selling)
    //     })

    //     test('admin set dokan withdraw settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw)
    //     })


    //     test('admin set dokan page settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setPageSettings(data.dokanSettings.page)
    //     })

    //     test('admin set dokan appearance settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanAppearanceSettings(data.dokanSettings.appreance)
    //     })

    //     test('admin set dokan privacy policy settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy)
    //     })

    //     test('admin set dokan store support settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport)
    //     })

    //     test('admin set dokan rma settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanRmaSettings(data.dokanSettings.rma)
    //     })

    //     test('admin set dokan wholesale settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale)
    //     })

    //     test('admin set dokan eu compliance settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance)
    //     })

    //     test('admin set dokan delivery time settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime)
    //     })

    //     test('admin set dokan product advertising settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising)
    //     })

    //     test('admin set dokan geolocation settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation)
    //     })

    //     test('admin set dokan product report abuse settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse)
    //     })

    //     test('admin set dokan spmv settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv)
    //     })

    //     test('admin set dokan vendor subscription settings', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const adminPage = new AdminPage(page)
    //         await loginPage.adminLogin(data.admin)
    //         await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription)
    //     })

    //     // Vendor Details 

    //     test('add test vendor1', async ({ page }) => {
    //         const loginPage = new LoginPage(page)
    //         const vendorPage = new VendorPage(page)
    //         // Add Vendor1
    //         await vendorPage.vendorRegister({ ...data.vendor.vendorInfo, ...data.predefined.vendorInfo }, data.vendorSetupWizard)
    //     })

    test('add test vendor', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        // create store
        await apiUtils.createStore(payloads.createStore1) //TODO: need to send admin credential for create store
        // create vendor product & coupon   //TODO: need to send vendor credential for product and coupon
        let product = payloads.createProduct()
        product.name = 'p1_v1'
        let [, productId] = await apiUtils.createProduct(product)
        let payloadCoupon = payloads.createCoupon()
        payloadCoupon.product_ids = [productId]
        payloadCoupon.code = 'c1_v1'
        let response = await request.post(endPoints.createCoupon, { data: payloadCoupon })
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
        let customer = await apiUtils.createCustomer(payloads.createCustomer) //todo: handle user already created scenario
        // expect(payloads.createCustomer).toEqual(expect.objectContaining(customer)) //todo
        console.log(customer)
    })

})