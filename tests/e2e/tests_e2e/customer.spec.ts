import {test, expect, type Page} from '@playwright/test'
import {data} from '../utils/testData'
import {LoginPage} from '../pages/loginPage'
import {AdminPage} from '../pages/adminPage'
import {CustomerPage} from '../pages/customerPage'
import {VendorPage} from '../pages/vendorPage'

// test.beforeAll(async ({ page }) => { });
// test.afterAll(async ({ page }) => { });
// test.beforeEach(async ({ page }) => { });
// test.afterEach(async ({ page }) => { });


test.describe('Customer functionality test', () => {


    test.only('customer register', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await customerPage.customerRegister(data.customer.customerInfo)
        await loginPage.logout()
    })

    test('customer login', async ({page}) => {
        const loginPage = new LoginPage(page)
        await loginPage.login(data.customer)
    })

    test('customer logout', async ({page}) => {
        const loginPage = new LoginPage(page)
        await loginPage.login(data.customer)
        await loginPage.logout()
    })

    test('customer become a vendor', async ({page}) => {
        const customerPage = new CustomerPage(page)
        await customerPage.customerRegister(data.customer.customerInfo)
        await customerPage.customerBecomeVendor(data.customer.customerInfo)
    })

    test('customer become a wholesale customer', async ({page}) => {
        const customerPage = new CustomerPage(page)
        await customerPage.customerRegister(data.customer.customerInfo)
        await customerPage.customerBecomeWholesaleCustomer()
    })

    test('customer add customer details', async ({page}) => {
        const customerPage = new CustomerPage(page)
        await customerPage.customerRegister(data.customer.customerInfo)
        await customerPage.addCustomerDetails(data.customer.customerInfo)
    })

    test('customer add billing details', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.addBillingAddress(data.customer.customerInfo)
    })

    test('customer add shipping details', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.addShippingAddress(data.customer.customerInfo)
    })

    test('customer search vendor', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.searchVendor(data.predefined.vendorStores.vendor1)
    })

   
    test('customer search product   @product', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.searchProduct(data.predefined.simpleProduct.product1.name)
    })

    test.only('customer buy product', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.clearCart()
        await customerPage.addProductToCartFromShop(data.predefined.simpleProduct.product1.name)
        await customerPage.goToCartFromShop()
        await customerPage.goToCheckoutFromCart()
        await customerPage.placeOrder()
    })

    test('customer can review product', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review)
    })

    test('customer can report product', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report)
    })

    test('customer can enquire product', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry)
    })

    test('customer can add product to cart', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.clearCart()
        await customerPage.addProductToCartFromShop(data.predefined.simpleProduct.product1.name)
        await customerPage.goToCartFromShop()
        await customerPage.productIsOnCart(data.predefined.simpleProduct.product1.name)
    })

    test('customer can apply coupon', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.clearCart()
        await customerPage.addProductToCartFromShop(data.predefined.simpleProduct.product1.name)
        await customerPage.goToCartFromShop()
        await customerPage.applyCoupon(data.predefined.coupon.coupon1)
    })

    test('customer can follow vendor', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.followVendor(data.predefined.vendorStores.vendor1)
    })

    test('customer can review store', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.reviewStore(data.predefined.vendorStores.vendor1, data.store)
    })

    test('customer can ask for get support ', async ({page}) => {
        const loginPage = new LoginPage(page)
        const customerPage = new CustomerPage(page)
        await loginPage.login(data.customer)
        await customerPage.askForGetSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport)
    })

})
