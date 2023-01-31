import { test, expect, type Page } from '@playwright/test';
import { data } from '../utils/testData';
import { helpers } from '../utils/helpers';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { CustomerPage } from '../pages/customerPage';
import { VendorPage } from '../pages/vendorPage';

// test.beforeAll(async ({ }) => { });
// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });

test.describe( 'Calculation functionality test', () => {
	// test('refund through rma test', async ({ page }) => {
	//     let loginPage = new LoginPage(page)
	//     let adminPage = new AdminPage(page)
	//     let vendorPage = new VendorPage(page)
	//     let customerPage = new CustomerPage(page)

	//     // let productName = data.product.name.simple
	//     let productName = 'product1'

	//     //create product
	//     // await loginPage.login(data.vendor)
	//     // await vendorPage.addSimpleProduct(data.product.name.simple, data.product.price, data.product.category)

	//     // buy product
	//     // await loginPage.switchUser(data.customer)
	//     await loginPage.login(data.customer)
	//     let cOrderDetails = await customerPage.buyProduct(productName, false, true)

	//     //update order status
	//     await loginPage.switchUser(data.vendor)
	//     await vendorPage.changeOrderStatus(cOrderDetails.orderNumber, data.orderStatus[1])

	//     //send refund request
	//     await loginPage.switchUser(data.customer)
	//     await customerPage.sendWarrantyRequest(cOrderDetails.orderNumber, productName, data.order.refundRequestType, data.order.refundRequestReasons, data.order.refundRequestDetails)

	//     //vendor approve rma request
	//     await loginPage.switchUser(data.vendor)
	//     await vendorPage.approveReturnRequest(cOrderDetails.orderNumber, productName)
	//     // await vendorPage.deleteReturnRequest(orderId)

	//     //admin approve refund request
	//     await loginPage.switchUser(data.admin)
	//     await adminPage.approveRefundRequest(cOrderDetails.orderNumber, true)
	// })

	// test('vendor refund test', async ({ page }) => {
	//     let loginPage = new LoginPage(page)
	//     let adminPage = new AdminPage(page)
	//     let vendorPage = new VendorPage(page)
	//     let customerPage = new CustomerPage(page)

	//     // let productName = data.product.name.simple
	//     let productName = 'product1'

	//     //create product
	//     // await loginPage.login(data.vendor)
	//     // await vendorPage.addSimpleProduct(productName, data.product.price, data.product.category)

	//     // buy product
	//     // await loginPage.switchUser(data.customer)
	//     await loginPage.login(data.customer)
	//     let cOrderDetails = await customerPage.buyProduct(productName, false, true)

	//     //refund order
	//     await loginPage.switchUser(data.vendor)
	//     await vendorPage.changeOrderStatus(cOrderDetails.orderNumber, data.orderStatus[1])
	//     await vendorPage.refundOrder(cOrderDetails.orderNumber, productName, true)

	//     // approve refund request
	//     await loginPage.switchUser(data.admin)
	//     await adminPage.approveRefundRequest(cOrderDetails.orderNumber, true)
	// })

	test( 'calculation test', async ( { browser } ) => {
		const adminContext = await browser.newContext( { storageState: 'adminStorageState.json' } );
		const adminPage = await adminContext.newPage();
		const vendorContext = await browser.newContext( { storageState: 'vendorStorageState.json' } );
		const vendorPage = await vendorContext.newPage();
		const customerContext = await browser.newContext( { storageState: 'customerStorageState.json' } );
		const customerPage = await customerContext.newPage();

		const productName = data.predefined.simpleProduct.product1.name;

		const cOrderDetails0 = await customerPage.buyProduct( productName, false, true, 'bank' );
		const cOrderDetails = await customerPage.getOrderDetails( cOrderDetails0.orderNumber );

		//vendor order details
		const aOrderDetails = await adminPage.getOrderDetails( cOrderDetails.orderNumber );

		//admin order details
		const vOrderDetails = await vendorPage.getOrderDetails( cOrderDetails.orderNumber );

		console.log( 'cOrderDetails: ', cOrderDetails, 'aOrderDetails: ', aOrderDetails, 'vOrderDetails: ', vOrderDetails );

		const subtotal = cOrderDetails.subtotal;
		const taxRate = Number( process.env.TAX_RATE );
		const commissionRate = Number( process.env.COMMISSION_RATE );
		const shipping = 0;
		const gatewayFee = 0;
		const calculatedTax = helpers.tax( taxRate, subtotal, shipping );
		const calculatedOrderTotal = helpers.orderTotal( subtotal, calculatedTax, shipping );
		const calculatedAdminCommission = helpers.adminCommission( subtotal, commissionRate, calculatedTax, shipping, gatewayFee );
		const calculatedVendorEarning = helpers.vendorEarning( subtotal, calculatedAdminCommission, calculatedTax, shipping, gatewayFee );
		console.log( calculatedTax, calculatedOrderTotal, calculatedAdminCommission, calculatedVendorEarning );

		console.log( `orderNumber :  c:${ cOrderDetails.orderNumber }, a:${ aOrderDetails.orderNumber }, v:${ vOrderDetails.orderNumber }` );
		console.log( `orderStatus :  c:${ cOrderDetails.orderStatus }, a:${ aOrderDetails.orderStatus }, v:${ vOrderDetails.orderStatus }` );
		console.log( `orderStatus :  c:${ cOrderDetails.orderDate }, a:${ aOrderDetails.orderDate }, v:${ vOrderDetails.orderDate }` );
		console.log( `subtotal :  c:${ cOrderDetails.subtotal }` );
		console.log( `shipping :  c:${ cOrderDetails.shippingMethod }, v:${ vOrderDetails.shippingMethod }` );
		console.log( `shipping :  c:${ cOrderDetails.shippingCost }, a:${ aOrderDetails.shippingCost }, v:${ vOrderDetails.shippingCost }` );
		console.log( `tax : cal:${ calculatedTax }, c:${ cOrderDetails.tax }, a:${ aOrderDetails.tax }, v:${ vOrderDetails.tax }` );
		console.log( `orderTotal : cal:${ calculatedOrderTotal }, a:${ aOrderDetails.orderTotal },` );
		console.log( `commission : cal:${ calculatedAdminCommission }, a:${ aOrderDetails.commission }` );
		console.log( `vendorEarning : cal:${ calculatedVendorEarning }, a:${ aOrderDetails.vendorEarning }, v:${ vOrderDetails.vendorEarning }` );

		expect( cOrderDetails.orderNumber == aOrderDetails.orderNumber == vOrderDetails.orderNumber ).toBeTruthy();
		expect( cOrderDetails.orderStatus == aOrderDetails.orderStatus == vOrderDetails.orderStatus ).toBeTruthy();
		expect( cOrderDetails.orderDate == aOrderDetails.orderDate == vOrderDetails.orderDate ).toBeTruthy();
		expect( calculatedTax == cOrderDetails.tax == aOrderDetails.tax == vOrderDetails.tax ).toBeTruthy();
		expect( cOrderDetails.shippingMethod == vOrderDetails.shippingMethod ).toBeTruthy();
		expect( cOrderDetails.shippingCost == aOrderDetails.shippingCost == vOrderDetails.shippingCost ).toBeTruthy();
		expect( calculatedOrderTotal == cOrderDetails.orderTotal == aOrderDetails.orderTotal == vOrderDetails.orderTotal ).toBeTruthy();
		expect( calculatedAdminCommission == aOrderDetails.commission ).toBeTruthy();
		expect( calculatedVendorEarning == aOrderDetails.vendorEarning == vOrderDetails.vendorEarning ).toBeTruthy();
	} );
} );
