import { Page, expect } from '@playwright/test';
import { BasePage } from 'pages/basePage';
import { LoginPage } from 'pages/loginPage';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { customer, paymentDetails, order } from 'utils/interfaces';

const { DOKAN_PRO } = process.env;

export class CustomerPage extends BasePage {

	constructor(page: Page) {
		super(page);
	}

	loginPage = new LoginPage(this.page);
	adminPage = new AdminPage(this.page);

	// navigation

	async goToMyAccount(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.myAccount);
	}

	async goToCart(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.cart);
	}

	async goToCheckout(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.checkout);
	}

	async goToShop(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.shop);
	}

	async goToStoreList(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.storeListing);
	}

	// customer details

	// customer register
	async customerRegister(customerInfo: customer['customerInfo']): Promise<void> {
		const username: string = (customerInfo.firstName() + customerInfo.lastName()).replace('\'', '');
		await this.goToMyAccount();
		const regIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
		if (!regIsVisible) {
			await this.loginPage.logout();
		}
		await this.clearAndType(selector.customer.cRegistration.regEmail, username + data.customer.customerInfo.emailDomain);
		await this.clearAndType(selector.customer.cRegistration.regPassword, customerInfo.password);
		await this.click(selector.customer.cRegistration.regCustomer);
		await this.clickAndWaitForResponse(data.subUrls.frontend.myAccount, selector.customer.cRegistration.register, 302);
		const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);
		if (registrationErrorIsVisible) {
			const hasError = await this.hasText(selector.customer.cWooSelector.wooCommerceError, data.customer.registrationErrorMessage);
			if (hasError) {
				return; // TODO: throw error or handle already created user
			}
		}
		const loggedInUser = await this.getCurrentUser();
		expect(loggedInUser).toBe(username.toLowerCase());
	}

	// customer become vendor
	async customerBecomeVendor(customerInfo: customer['customerInfo']): Promise<void> {
		const firstName = customerInfo.firstName();
		await this.click(selector.customer.cDashboard.becomeVendor);
		// vendor registration form
		await this.clearAndType(selector.customer.cDashboard.firstName, firstName);
		await this.clearAndType(selector.customer.cDashboard.lastName, customerInfo.lastName());
		await this.clearAndType(selector.customer.cDashboard.shopName, customerInfo.storename());
		await this.click(selector.customer.cDashboard.shopUrl);
		await this.clearAndType(selector.customer.cDashboard.phone, customerInfo.phone);
		await this.clearAndType(selector.customer.cDashboard.companyName, customerInfo.companyName);
		await this.clearAndType(selector.customer.cDashboard.companyId, customerInfo.companyId);
		await this.clearAndType(selector.customer.cDashboard.vatNumber, customerInfo.vatNumber);
		await this.clearAndType(selector.customer.cDashboard.bankName, customerInfo.bankName);
		await this.clearAndType(selector.customer.cDashboard.bankIban, customerInfo.bankIban);
		await this.clickIfVisible(selector.customer.cDashboard.termsAndConditions);
		const subscriptionPackIsVisible = await this.isVisible(selector.customer.cDashboard.subscriptionPack);
		if (subscriptionPackIsVisible) {
			await this.selectByLabel(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.becomeVendor, selector.customer.cDashboard.becomeAVendor, 302);
		if (subscriptionPackIsVisible) {
			await this.placeOrder('bank', false, true, false);
		}
		// skip vendor setup wizard
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.notRightNow);
		await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
	}

	// customer add billing address
	async addBillingAddress(billingInfo: customer['customerInfo']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.billingAddress);
		//billing address
		await this.clearAndType(selector.customer.cAddress.billingFirstName, billingInfo.firstName());
		await this.clearAndType(selector.customer.cAddress.billingLastName, billingInfo.lastName());
		await this.clearAndType(selector.customer.cAddress.billingCompanyName, billingInfo.companyName);
		await this.clearAndType(selector.customer.cAddress.billingCompanyID, billingInfo.companyId);
		await this.clearAndType(selector.customer.cAddress.billingVatOrTaxNumber, billingInfo.vatNumber);
		await this.clearAndType(selector.customer.cAddress.billingNameOfBank, billingInfo.bankName);
		await this.clearAndType(selector.customer.cAddress.billingBankIban, billingInfo.bankIban);
		await this.click(selector.customer.cAddress.billingCountryOrRegion);
		await this.clearAndType(selector.customer.cAddress.billingCountryOrRegionInput, billingInfo.country);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.billingStreetAddress, billingInfo.street1);
		await this.clearAndType(selector.customer.cAddress.billingStreetAddress2, billingInfo.street2);
		await this.clearAndType(selector.customer.cAddress.billingTownCity, billingInfo.city);
		await this.focus(selector.customer.cAddress.billingZipCode); //todo:  remove if found alternative soln.
		await this.click(selector.customer.cAddress.billingState);
		await this.clearAndType(selector.customer.cAddress.billingStateInput, billingInfo.state);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.billingZipCode, billingInfo.zipCode);
		await this.clearAndType(selector.customer.cAddress.billingPhone, billingInfo.phone);
		await this.clearAndType(selector.customer.cAddress.billingEmailAddress, billingInfo.email());
		await this.clickAndWaitForResponse(data.subUrls.frontend.billingAddress, selector.customer.cAddress.billingSaveAddress, 302);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.customerInfo.addressChangeSuccessMessage);
	}

	// customer add shipping address
	async addShippingAddress(shippingInfo: customer['customerInfo']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.shippingAddress);
		//shipping address
		await this.clearAndType(selector.customer.cAddress.shippingFirstName, shippingInfo.firstName());
		await this.clearAndType(selector.customer.cAddress.shippingLastName, shippingInfo.lastName());
		await this.clearAndType(selector.customer.cAddress.shippingCompanyName, shippingInfo.companyName);
		await this.click(selector.customer.cAddress.shippingCountryOrRegion);
		await this.clearAndType(selector.customer.cAddress.shippingCountryOrRegionInput, shippingInfo.country);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.shippingStreetAddress, shippingInfo.street1);
		await this.clearAndType(selector.customer.cAddress.shippingStreetAddress2, shippingInfo.street2);
		await this.clearAndType(selector.customer.cAddress.shippingTownCity, shippingInfo.city);
		await this.focus(selector.customer.cAddress.shippingZipCode);
		await this.click(selector.customer.cAddress.shippingState);
		await this.clearAndType(selector.customer.cAddress.shippingStateInput, shippingInfo.state);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.shippingZipCode, shippingInfo.zipCode);
		await this.clickAndWaitForResponse(data.subUrls.frontend.shippingAddress, selector.customer.cAddress.shippingSaveAddress, 302);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.customerInfo.addressChangeSuccessMessage );
	}

	// customer Send Rma Request
	async sendRmaMessage(message: string): Promise<void> {
		await this.click(selector.customer.cMyAccount.rmaRequests);
		await this.clearAndType(selector.customer.cRma.message, message);
		await this.click(selector.customer.cRma.sendMessage); //todo:  add ajax is exists soln. below line
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cRma.sendMessage); //todo:  add ajax is exists
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.rma.sendMessage);
	}


	// customer add customer details
	async addCustomerDetails(customer: customer): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.editAccountCustomer);
		await this.clearAndType(selector.customer.cAccountDetails.firstName, customer.username);
		await this.clearAndType(selector.customer.cAccountDetails.lastName, customer.lastname);
		await this.clearAndType(selector.customer.cAccountDetails.displayName, customer.username);
		await this.clearAndType(selector.customer.cAccountDetails.email, customer.username + customer.customerInfo.emailDomain);
		// await this.updatePassword(customerInfo.password, customerInfo.password1);
		await this.clickAndWaitForResponse(data.subUrls.frontend.editAccountCustomer, selector.customer.cAccountDetails.saveChanges);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);
		// cleanup
		// await this.updatePassword(customerInfo.password1, customerInfo.password, true); //todo: do it via api

	}

	// customer update password
	async updatePassword(currentPassword: string, newPassword: string, saveChanges = false): Promise<void> {
		await this.clearAndType(selector.customer.cAccountDetails.currentPassword, currentPassword);
		await this.clearAndType(selector.customer.cAccountDetails.NewPassword, newPassword);
		await this.clearAndType(selector.customer.cAccountDetails.confirmNewPassword, newPassword);
		if (saveChanges){
			await this.clickAndWaitForResponse(data.subUrls.frontend.editAccountCustomer, selector.customer.cAccountDetails.saveChanges);
			await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);
		}
	}


	// customer add product to cart from shop page
	async addProductToCartFromShop(productName: string): Promise<void> {
		await this.goToShop();
		await this.searchProduct(productName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.addToCart, selector.customer.cShop.productCard.addToCart);
		await this.toBeVisible(selector.customer.cShop.productCard.viewCart);
	}


	// customer add product to cart from product details page
	async addProductToCartFromSingleProductPage(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		const addonIsVisible = await this.isVisible(selector.customer.cSingleProduct.productAddon.addOnSelect);
		if (addonIsVisible){
			await this.selectByNumber(selector.customer.cSingleProduct.productAddon.addOnSelect, 1);
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, selector.customer.cSingleProduct.productDetails.addToCart);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, `“${productName}” has been added to your cart.`);
	}


	// customer check whether product is on cart
	async productIsOnCart(productName: string): Promise<void> {
		await this.toBeVisible(selector.customer.cCart.cartItem(productName));
	}


	// go to cart from shop page
	async goToCartFromShop(): Promise<void> {
		await this.clickAndWaitForLoadState(selector.customer.cShop.productCard.viewCart);
		const cartUrl = this.isCurrentUrl('cart');
		expect(cartUrl).toBeTruthy();
	}


	// go to cart from product details page
	async goToCartFromSingleProductPage(): Promise<void> {
		await this.clickAndWaitForLoadState(selector.customer.cSingleProduct.productDetails.viewCart);
		const cartUrl =  this.isCurrentUrl('cart');
		expect(cartUrl).toBeTruthy();
	}


	// got to checkout from cart
	async goToCheckoutFromCart(): Promise<void> {
		await this.clickAndWaitForLoadState(selector.customer.cCart.proceedToCheckout);
		const cartUrl = this.isCurrentUrl('checkout');
		expect(cartUrl).toBeTruthy();
	}


	// clear cart
	async clearCart(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.cart);
		const cartProductIsVisible = await this.isVisible(selector.customer.cCart.firstProductCrossIcon);
		if (cartProductIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.frontend.cart, selector.customer.cCart.firstProductCrossIcon);
			await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'removed. Undo?');
			await this.clearCart(); //Todo: avoid recursion
		}
		else {
			await this.toContainText(selector.customer.cCart.cartEmptyMessage, 'Your cart is currently empty.');
		}
	}


	// Update product quantity from cart
	async updateProductQuantityOnCart(productName: string, quantity: string): Promise<void> {
		await this.clearAndType(selector.customer.cCart.quantity(productName), quantity);
		await this.clickAndWaitForResponse(data.subUrls.frontend.cart, selector.customer.cCart.updateCart);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'Cart updated.');
		await this.toHaveValue(selector.customer.cCart.quantity(productName), quantity );
	}


	// customer apply coupon
	async applyCoupon(couponTitle: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.cart);
		const couponIsApplied = await this.isVisible(selector.customer.cCart.removeCoupon(couponTitle));
		if (couponIsApplied) {
			await this.click(selector.customer.cCart.removeCoupon(couponTitle));
			await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'Coupon has been removed.');
		}
		await this.clearAndType(selector.customer.cCart.couponCode, couponTitle);
		await this.clickAndWaitForResponse(data.subUrls.frontend.applyCoupon, selector.customer.cCart.applyCoupon);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'Coupon code applied successfully.' );
	}


	async buyProduct(productName: string, couponCode: string, applyCoupon = false, getOrderDetails = false, paymentMethod = 'bank', paymentDetails: paymentDetails): Promise<void | object> {
		// clear cart before buying
		await this.clearCart();
		// buy product
		await this.addProductToCartFromSingleProductPage(productName);
		applyCoupon && await this.applyCoupon(couponCode);
		return await this.placeOrder(paymentMethod, getOrderDetails);
	}


	// customer place order
	async placeOrder(paymentMethod = 'bank', getOrderDetails = false, billingDetails = false, shippingDetails = false): Promise<void | object> {
		await this.goIfNotThere(data.subUrls.frontend.checkout);
		//todo: move shipping from here, make separate function for payment
		if (billingDetails) {
			await this.addBillingAddressInCheckout(data.customer.customerInfo); //todo:  fill if empty
		}
		if (shippingDetails) {
			await this.addShippingAddressInCheckout(data.customer.customerInfo);
		}

		switch (paymentMethod) {
		case 'bank' :
			await this.click(selector.customer.cCheckout.directBankTransfer);
			break;
		case 'check' :
			await this.click(selector.customer.cCheckout.checkPayments);
			break;
		case 'cod' :
			await this.click(selector.customer.cCheckout.cashOnDelivery);
			break;
			// case 'stripe':
			//     await this.payWithStripe(paymentDetails)
			//     break;
			// case 'stripeExpress':
			//     await this.payWithStripeExpress(paymentDetails)
			//     break;
		default :
			break;
		}

		await this.clickAndWaitForResponse(data.subUrls.frontend.orderReceived, selector.customer.cCheckout.placeOrder); //todo:  remove from other places
		await this.toBeVisible(selector.customer.cOrderReceived.orderReceivedSuccessMessage);

		// if (getOrderDetails) {
		//     return await this.getOrderDetailsAfterPlaceOrder()
		// }
	}


	// customer place order
	async paymentOrder(paymentMethod = 'bank'): Promise<void > {

		switch (paymentMethod) {
		case 'bank' :
			await this.click(selector.customer.cCheckout.directBankTransfer);
			break;
		case 'check' :
			await this.click(selector.customer.cCheckout.checkPayments);
			break;
		case 'cod' :
			await this.click(selector.customer.cCheckout.cashOnDelivery);
			break;
			// case 'stripe':
			//     await this.payWithStripe(paymentDetails)
			//     break;
			// case 'stripeExpress':
			//     await this.payWithStripeExpress(paymentDetails)
			//     break;
		default :
			break;
		}

		await this.clickAndWaitForResponse(data.subUrls.frontend.orderReceived, selector.customer.cCheckout.placeOrder);
		await this.toBeVisible(selector.customer.cOrderReceived.orderReceivedSuccessMessage);

	}

	// // pay with stripe connect
	// async payWithStripe(paymentDetails): Promise<void> {
	//     let cardInfo = paymentDetails.cardInfo
	//     await this.click(selector.customer.cCheckout.stripeConnect)
	//     let savedTestCardIsVisible = await this.isVisible(selector.customer.cPayWithStripe.savedTestCard4242)
	//     if (!savedTestCardIsVisible) {
	//         let stripeConnectIframe = await this.switchToIframe(selector.customer.cPayWithStripe.stripeConnectIframe)
	//         await this.iframeClearAndType(stripeConnectIframe, selector.customer.cPayWithStripe.cardNumber, cardInfo.cardNumber)
	//         await this.iframeClearAndType(stripeConnectIframe, selector.customer.cPayWithStripe.expDate, cardInfo.cardExpiryDate)
	//         await this.iframeClearAndType(stripeConnectIframe, selector.customer.cPayWithStripe.cvc, cardInfo.cardCvc)
	//         await this.click(selector.customer.cPayWithStripe.savePaymentInformation)
	//     } else {
	//         await this.click(selector.customer.cPayWithStripe.savedTestCard4242)
	//     }
	// }

	// // pay with stripe express
	// async payWithStripeExpress(paymentDetails): Promise<void> {
	//     let paymentMethod = paymentDetails.paymentMethod
	//     let cardInfo = paymentDetails.cardInfo

	//     await this.click(selector.customer.cCheckout.stripeExpress)

	//     let savedTestCardIsVisible = await this.isVisible(selector.customer.cPayWithStripeExpress.savedTestCard4242)
	//     if (!savedTestCardIsVisible) {
	//         let stripeExpressCardIframe = await this.switchToIframe(selector.customer.cPayWithStripeExpress.stripeExpressIframe)
	//         switch (paymentMethod) {
	//             case 'card':
	//                 await this.iframeClick(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.creditCard)
	//                 await this.iframeClearAndType(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.cardNumber, cardInfo.cardNumber)
	//                 await this.iframeClearAndType(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.expDate, cardInfo.cardExpiryDate)
	//                 await this.iframeClearAndType(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.cvc, cardInfo.cardCvc)
	//                 await this.click(selector.customer.cPayWithStripeExpress.savePaymentInformation)
	//                 break
	//             case 'gPay':
	//                 await this.iframeClick(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.gPay)
	//                 return
	//             case 'applePay':
	//                 await this.iframeClick(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.gPay)
	//                 return
	//             case 'iDeal':
	//                 await this.iframeClick(stripeExpressCardIframe, selector.customer.cPayWithStripeExpress.iDeal)
	//                 break
	//             default:
	//                 break
	//         }
	//     } else {
	//         await this.click(selector.customer.cPayWithStripeExpress.savedTestCard4242)
	//     }
	// }

	// // get order details after purchase
	// async getOrderDetailsAfterPlaceOrder(): Promise<object> {
	// 	const cOrderDetails: { orderNumber: string, subtotal: number, shippingCost: number, shippingMethod: string, tax: number, paymentMethod: string, orderTotal: number } = { orderNumber: '',
	// 		subtotal: 0,
	// 		shippingCost: 0,
	// 		shippingMethod: '',
	// 		tax: 0,
	// 		paymentMethod: '',
	// 		orderTotal: 0, };
	// 	cOrderDetails.orderNumber = await this.getElementText(selector.customer.cOrderReceived.orderNumber);
	// 	cOrderDetails.subtotal = helpers.price(await this.getElementText(selector.customer.cOrderReceived.subTotal));

	// 	// let onlyShippingIsVisible = await this.isVisible(selector.customer.cOrderReceived.shipping)//todo: delete this line when shipping is fixed
	// 	// if (onlyShippingIsVisible) cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrderReceived.shipping)//todo: delete this line when shipping is fixed

	// 	const shippingIsVisible = await this.isVisible(selector.customer.cOrderReceived.shippingCost);
	// 	if (shippingIsVisible) {
	// 		cOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.customer.cOrderReceived.shippingCost));
	// 		cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrderReceived.shippingMethod);
	// 	}
	// 	const taxIsVisible = await this.isVisible(selector.customer.cOrderReceived.shipping);
	// 	if (taxIsVisible) {
	// 		cOrderDetails.tax = helpers.price(await this.getElementText(selector.customer.cOrderReceived.tax));
	// 	}

	// 	cOrderDetails.paymentMethod = await this.getElementText(selector.customer.cOrderReceived.orderPaymentMethod);
	// 	cOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.customer.cOrderReceived.orderTotal));

	// 	return cOrderDetails;
	// }

	// // get order details
	// async getOrderDetails(orderNumber: any): Promise<object> {
	// 	await this.goToMyAccount();

	// 	await this.click(selector.customer.cMyAccount.orders);
	// 	await this.click(selector.customer.cOrders.OrderDetailsLInk(orderNumber));

	// 	const cOrderDetails = { orderNumber: '',
	// 		orderDate: '',
	// 		orderStatus: '',
	// 		subtotal: 0,
	// 		shippingCost: 0,
	// 		shippingMethod: '',
	// 		tax: 0,
	// 		orderDiscount: 0,
	// 		quantityDiscount: 0,
	// 		discount: 0,
	// 		paymentMethod: '',
	// 		orderTotal: 0, };

	// 	cOrderDetails.orderNumber = await this.getElementText(selector.customer.cOrders.orderNumber);
	// 	cOrderDetails.orderDate = await this.getElementText(selector.customer.cOrders.orderDate);
	// 	cOrderDetails.orderStatus = await this.getElementText(selector.customer.cOrders.orderStatus);
	// 	cOrderDetails.subtotal = helpers.price(await this.getElementText(selector.customer.cOrders.subTotal));

	// 	// let onlyShippingIsVisible = await this.isVisible(selector.customer.cOrders.shipping)//todo: delete this line when shipping is fixed
	// 	// if (onlyShippingIsVisible) cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrders.shippingMethod)//todo: delete this line when shipping is fixed

	// 	const shippingIsVisible = await this.isVisible(selector.customer.cOrders.shippingCost);
	// 	if (shippingIsVisible) {
	// 		cOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.customer.cOrders.shippingCost));
	// 		cOrderDetails.shippingMethod = (await this.getElementText(selector.customer.cOrders.shippingMethod)).replace('via ', '');
	// 	}

	// 	const taxIsVisible = await this.isVisible(selector.customer.cOrders.tax);
	// 	if (taxIsVisible) {
	// 		cOrderDetails.tax = helpers.price(await this.getElementText(selector.customer.cOrders.tax));
	// 	}

	// 	const orderDiscount = await this.isVisible(selector.customer.cOrders.orderDiscount);
	// 	if (orderDiscount) {
	// 		cOrderDetails.orderDiscount = helpers.price(await this.getElementText(selector.customer.cOrders.orderDiscount));
	// 	}

	// 	const quantityDiscount = await this.isVisible(selector.customer.cOrders.quantityDiscount);
	// 	if (quantityDiscount) {
	// 		cOrderDetails.quantityDiscount = helpers.price(await this.getElementText(selector.customer.cOrders.quantityDiscount));
	// 	}

	// 	const discount = await this.isVisible(selector.customer.cOrders.discount);
	// 	if (discount) {
	// 		cOrderDetails.discount = helpers.price(await this.getElementText(selector.customer.cOrders.discount));
	// 	}

	// 	cOrderDetails.paymentMethod = await this.getElementText(selector.customer.cOrders.paymentMethod);
	// 	cOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.customer.cOrders.orderTotal));
	// 	return cOrderDetails;
	// }

	// customer add billing address in checkout
	async addBillingAddressInCheckout(billingInfo: customer['customerInfo']): Promise<void> {
		// Billing Address
		await this.clearAndType(selector.customer.cAddress.billingFirstName, billingInfo.firstName());
		await this.clearAndType(selector.customer.cAddress.billingLastName, billingInfo.lastName());
		await this.clearAndType(selector.customer.cAddress.billingCompanyName, billingInfo.companyName);
		await this.clearAndType(selector.customer.cAddress.billingCompanyID, billingInfo.companyId);
		await this.clearAndType(selector.customer.cAddress.billingVatOrTaxNumber, billingInfo.vatNumber);
		await this.clearAndType(selector.customer.cAddress.billingNameOfBank, billingInfo.bankName);
		await this.clearAndType(selector.customer.cAddress.billingBankIban, billingInfo.bankIban);
		await this.click(selector.customer.cAddress.billingCountryOrRegion);
		await this.clearAndType(selector.customer.cAddress.billingCountryOrRegionInput, billingInfo.country);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.billingStreetAddress, billingInfo.street1);
		await this.clearAndType(selector.customer.cAddress.billingStreetAddress2, billingInfo.street2);
		await this.clearAndType(selector.customer.cAddress.billingTownCity, billingInfo.city);
		await this.focus(selector.customer.cAddress.billingZipCode); //todo:  remove if found alternative soln.
		await this.click(selector.customer.cAddress.billingState);
		await this.clearAndType(selector.customer.cAddress.billingStateInput, billingInfo.state);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.billingZipCode, billingInfo.zipCode);
		await this.clearAndType(selector.customer.cAddress.billingPhone, billingInfo.phone);
		await this.clearAndType(selector.customer.cAddress.billingEmailAddress, billingInfo.email());
	}

	// customer add shipping address in checkout
	async addShippingAddressInCheckout(shippingInfo: customer['customerInfo']): Promise<void> {
		await this.clickAndWaitForResponse(data.subUrls.frontend.shippingAddressCheckout, selector.customer.cCheckout.shipToADifferentAddress);
		// shipping address
		await this.clearAndType(selector.customer.cAddress.shippingFirstName, shippingInfo.firstName());
		await this.clearAndType(selector.customer.cAddress.shippingLastName, shippingInfo.lastName());
		await this.clearAndType(selector.customer.cAddress.shippingCompanyName, shippingInfo.companyName);
		await this.click(selector.customer.cAddress.shippingCountryOrRegion);
		await this.clearAndType(selector.customer.cAddress.shippingCountryOrRegionInput, shippingInfo.country);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.shippingStreetAddress, shippingInfo.street1);
		await this.clearAndType(selector.customer.cAddress.shippingStreetAddress2, shippingInfo.street2);
		await this.clearAndType(selector.customer.cAddress.shippingTownCity, shippingInfo.city);
		await this.focus(selector.customer.cAddress.shippingZipCode); //todo:  remove if found alternative soln.
		await this.click(selector.customer.cAddress.shippingState);
		await this.clearAndType(selector.customer.cAddress.shippingStateInput, shippingInfo.state);
		await this.press(data.key.enter);
		await this.clearAndType(selector.customer.cAddress.shippingZipCode, shippingInfo.zipCode);
	}

	// customer ask for warranty
	async sendWarrantyRequest(orderNumber: string, productName: string, refund: order['refund']): Promise<void> {
		// await this.goToMyAccount();
		// await this.click(selector.customer.cMyAccount.orders);
		await this.goIfNotThere(data.subUrls.frontend.ordersCustomerPage);
		await this.click(selector.customer.cOrders.ordersWarrantyRequest(orderNumber));
		await this.click(selector.customer.cOrders.warrantyRequestItemCheckbox(productName));
		// await this.clearAndType(selector.customer.cOrders.warrantyRequestItemQuantity(productName), refund.itemQuantity)
		await this.selectByLabel(selector.customer.cOrders.warrantyRequestType, refund.refundRequestType);
		// await this.select(selector.customer.cOrders.warrantyRequestReason, refund.refundRequestReasons)
		await this.clearAndType(selector.customer.cOrders.warrantyRequestDetails, refund.refundRequestDetails);
		await this.click(selector.customer.cOrders.warrantySubmitRequest);
		// const successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage);
		// expect(successMessage).toMatch(refund.refundSubmitSuccessMessage);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, refund.refundSubmitSuccessMessage);
	}


	// search product
	async searchProduct(productName: string): Promise<void> {
		if(!DOKAN_PRO){
			await this.clearAndType(selector.customer.cShop.searchProductLite, productName);
			await this.pressAndWaitForNavigation(data.key.enter);
			await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName );
		} else {
			await this.clearAndType(selector.customer.cShop.filters.searchProduct, productName);
			await this.click(selector.customer.cShop.filters.search);
			await this.toContainText(selector.customer.cShop.productCard.productTitle, productName);
		}
	}


	// search store
	async searchStore(storeName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.storeListing);
		await this.click(selector.customer.cStoreList.filters.filterButton);
		await this.clearAndType(selector.customer.cStoreList.filters.filterDetails.searchVendor, storeName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.storeListing, selector.customer.cStoreList.filters.filterDetails.apply);
		await this.toBeVisible(selector.customer.cStoreList.visitStore(storeName));
	}

}
