import { Page, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { LoginPage } from '@pages/loginPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { customer, paymentDetails } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const customerRegistration = selector.customer.cRegistration;
const customerDashboard = selector.customer.cDashboard;
const customerAccountDetails = selector.customer.cAccountDetails;
const customerAddress = selector.customer.cAddress;
const customerCart = selector.customer.cCart;
const customerCheckout = selector.customer.cCheckout;

export class CustomerPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    loginPage = new LoginPage(this.page);

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

    async gotoSingleStore(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), 'networkidle');
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderNumber));
    }

    // go to cart from shop page
    async goToCartFromShop(): Promise<void> {
        await this.clickAndWaitForUrl(helpers.stringToRegex(data.subUrls.frontend.cart), selector.customer.cShop.productCard.viewCart);
    }

    // go to cart from product details page
    async goToCartFromSingleProductPage(): Promise<void> {
        await this.clickAndWaitForUrl(helpers.stringToRegex(data.subUrls.frontend.cart), selector.customer.cSingleProduct.productDetails.viewCart);
    }

    // got to checkout from cart
    async goToCheckoutFromCart(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.checkout, customerCart.proceedToCheckout);
    }

    // customer details

    // customer register
    async customerRegister(customerInfo: customer['customerInfo']): Promise<void> {
        const username = (customerInfo.firstName() + customerInfo.lastName()).replace("'", '');
        await this.goToMyAccount();
        const regIsVisible = await this.isVisible(customerRegistration.regEmail);
        if (!regIsVisible) await this.loginPage.logout();
        await this.clearAndType(customerRegistration.regEmail, username + data.customer.customerInfo.emailDomain);
        await this.clearAndType(customerRegistration.regPassword, customerInfo.password);
        await this.click(customerRegistration.regAsCustomer);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, customerRegistration.register, 302);
        const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);
        if (registrationErrorIsVisible) {
            const hasError = await this.hasText(selector.customer.cWooSelector.wooCommerceError, data.customer.registration.registrationErrorMessage);
            if (hasError) {
                console.log('User already exists!!');
                return;
            }
        }
        const loggedInUser = await this.getCurrentUser();
        expect(loggedInUser).toBe(username.toLowerCase());
    }

    // customer become vendor
    async customerBecomeVendor(customerInfo: customer['customerInfo']): Promise<void> {
        const firstName = customerInfo.firstName();

        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.accountMigration, customerDashboard.becomeVendor);
        // vendor registration form
        await this.clearAndType(customerDashboard.firstName, firstName);
        await this.clearAndType(customerDashboard.lastName, customerInfo.lastName());
        await this.clearAndType(customerDashboard.shopName, customerInfo.shopName());
        await this.click(customerDashboard.shopUrl);
        await this.clearAndType(customerDashboard.phone, customerInfo.phone);

        if (DOKAN_PRO) {
            await this.clearAndType(customerDashboard.companyName, customerInfo.companyName);
            await this.clearAndType(customerDashboard.companyId, customerInfo.companyId);
            await this.clearAndType(customerDashboard.vatNumber, customerInfo.vatNumber);
            await this.clearAndType(customerDashboard.bankName, customerInfo.bankName);
            await this.clearAndType(customerDashboard.bankIban, customerInfo.bankIban);
        }

        await this.clickIfVisible(customerDashboard.termsAndConditions);
        const subscriptionPackIsVisible = await this.isVisible(customerDashboard.subscriptionPack);
        if (subscriptionPackIsVisible) await this.selectByLabel(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.becomeVendor, customerDashboard.becomeAVendor, 302);
        if (subscriptionPackIsVisible) await this.placeOrder('bank', false, true, false);

        // skip vendor setup wizard
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.notRightNow);
        await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
    }

    // customer add customer details
    async addCustomerDetails(customer: customer): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.editAccountCustomer);
        await this.clearAndType(customerAccountDetails.firstName, customer.username);
        await this.clearAndType(customerAccountDetails.lastName, customer.lastname);
        await this.clearAndType(customerAccountDetails.displayName, customer.username);
        await this.clearAndType(customerAccountDetails.email, customer.username + customer.customerInfo.emailDomain);
        // await this.updatePassword(customer.customerInfo.password, customer.customerInfo.password1);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAccountCustomer, customerAccountDetails.saveChanges, 302);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);

        // cleanup: reset password
        // await this.updatePassword(customer.customerInfo.password1, customer.customerInfo.password, true);
    }

    // customer update password
    async updatePassword(currentPassword: string, newPassword: string, saveChanges = false): Promise<void> {
        await this.clearAndType(customerAccountDetails.currentPassword, currentPassword);
        await this.clearAndType(customerAccountDetails.NewPassword, newPassword);
        await this.clearAndType(customerAccountDetails.confirmNewPassword, newPassword);
        if (saveChanges) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAccountCustomer, customerAccountDetails.saveChanges);
            await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
            await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);
        }
    }

    // update billing fields
    async updateBillingFields(billingInfo: customer['customerInfo']['billing']) {
        await this.clearAndType(customerAddress.billing.firstName, billingInfo.firstName);
        await this.clearAndType(customerAddress.billing.lastName, billingInfo.lastName);
        await this.clearAndType(customerAddress.billing.companyName, billingInfo.companyName);
        if (DOKAN_PRO) {
            await this.clearAndType(customerAddress.billing.companyID, billingInfo.companyId);
            await this.clearAndType(customerAddress.billing.vatOrTaxNumber, billingInfo.vatNumber);
            await this.clearAndType(customerAddress.billing.nameOfBank, billingInfo.bankName);
            await this.clearAndType(customerAddress.billing.bankIban, billingInfo.bankIban);
        }
        await this.click(customerAddress.billing.countryOrRegion);
        await this.clearAndType(customerAddress.billing.countryOrRegionInput, billingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(customerAddress.billing.streetAddress, billingInfo.street1);
        await this.clearAndType(customerAddress.billing.streetAddress2, billingInfo.street2);
        await this.clearAndType(customerAddress.billing.city, billingInfo.city);
        await this.focus(customerAddress.billing.zipCode);
        await this.click(customerAddress.billing.state);
        await this.clearAndType(customerAddress.billing.stateInput, billingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(customerAddress.billing.zipCode, billingInfo.zipCode);
        await this.clearAndType(customerAddress.billing.phone, billingInfo.phone);
        await this.clearAndType(customerAddress.billing.email, billingInfo.email);
    }

    // update shipping fields
    async updateShippingFields(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.clearAndType(customerAddress.shipping.firstName, shippingInfo.firstName);
        await this.clearAndType(customerAddress.shipping.lastName, shippingInfo.lastName);
        await this.clearAndType(customerAddress.shipping.companyName, shippingInfo.companyName);
        await this.click(customerAddress.shipping.countryOrRegion);
        await this.clearAndType(customerAddress.shipping.countryOrRegionInput, shippingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(customerAddress.shipping.streetAddress, shippingInfo.street1);
        await this.clearAndType(customerAddress.shipping.streetAddress2, shippingInfo.street2);
        await this.clearAndType(customerAddress.shipping.city, shippingInfo.city);
        await this.focus(customerAddress.shipping.zipCode);
        await this.click(customerAddress.shipping.state);
        await this.clearAndType(customerAddress.shipping.stateInput, shippingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(customerAddress.shipping.zipCode, shippingInfo.zipCode);
    }

    // customer add billing address
    async addBillingAddress(billingInfo: customer['customerInfo']['billing']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.billingAddress);
        await this.updateBillingFields(billingInfo);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAddress, customerAddress.billing.saveAddress);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.address.addressChangeSuccessMessage);
    }

    // customer add shipping address
    async addShippingAddress(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shippingAddress);
        await this.updateShippingFields(shippingInfo);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAddress, customerAddress.shipping.saveAddress);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.address.addressChangeSuccessMessage);
    }

    // customer functionality

    // add product to cart from shop page
    async addProductToCartFromShop(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.addToCart, selector.customer.cShop.productCard.addToCart);
        await this.toBeVisible(selector.customer.cShop.productCard.viewCart);
    }

    // add product to cart from product details page
    async addProductToCartFromSingleProductPage(productName: string, quantity?: string): Promise<void> {
        await this.goToProductDetails(productName);
        const addonIsVisible = await this.isVisible(selector.customer.cSingleProduct.productAddon.addOnSelect);
        if (addonIsVisible) await this.selectByNumber(selector.customer.cSingleProduct.productAddon.addOnSelect, 1);
        if (quantity) await this.clearAndType(selector.customer.cSingleProduct.productDetails.quantity, String(quantity));
        await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, selector.customer.cSingleProduct.productDetails.addToCart);
        if (!quantity) {
            await this.toBeVisible(selector.customer.cSingleProduct.productDetails.productAddedSuccessMessage(productName));
        } else {
            await this.toBeVisible(selector.customer.cSingleProduct.productDetails.productWithQuantityAddedSuccessMessage(productName, quantity));
        }
    }

    // add product to cart
    async addProductToCart(productName: string, from: string, clearCart = true, quantity?: string) {
        // clear cart
        if (clearCart) await this.clearCart();
        switch (from) {
            case 'shop':
                await this.addProductToCartFromShop(productName);
                break;
            case 'single-product':
                await this.addProductToCartFromSingleProductPage(productName, quantity);
                break;
            default:
                break;
        }
    }

    // check whether product is on cart
    async productIsOnCart(productName: string): Promise<void> {
        await this.goToCart();
        await this.toBeVisible(customerCart.cartItem(productName));
    }

    // clear cart
    async clearCart(): Promise<void> {
        await this.goToCart();
        const emptyCart = await this.isVisible(customerCart.cartEmptyMessage);
        if (!emptyCart) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.wc.store, customerCart.removeFirstItem, 207);
            await this.clearCart();
        }
    }

    // Update product quantity from cart
    async updateProductQuantityOnCart(productName: string, quantity: string): Promise<void> {
        await this.goToCart();
        await this.typeAndWaitForResponse(data.subUrls.api.wc.store, customerCart.quantity(productName), quantity, 207);
        await this.toHaveValue(customerCart.quantity(productName), quantity);
    }

    // apply coupon
    async applyCoupon(couponCode: string): Promise<void> {
        await this.goToCart();
        const couponIsApplied = await this.isVisible(customerCart.removeCoupon(couponCode));
        if (couponIsApplied) {
            await this.clickAndWaitForResponse(data.subUrls.api.wc.store, customerCart.removeCoupon(couponCode), 207);
            await this.toContainText(selector.customer.cWooSelector.wooCommerceNoticeBannerContent, `Coupon code "${couponCode}" has been removed from your cart.`);
        }
        await this.click(customerCart.addCoupon);
        await this.clearAndType(customerCart.couponCode, couponCode);
        await this.clickAndWaitForResponse(data.subUrls.api.wc.store, customerCart.applyCoupon, 207);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceNoticeBannerContent, `Coupon code "${couponCode}" has been applied to your cart.`);
    }

    // add billing address in checkout
    async addBillingAddressInCheckout(billingInfo: customer['customerInfo']['billing']): Promise<void> {
        await this.clearAndType(customerCheckout.billing.email, billingInfo.email);
        await this.click(customerCheckout.billing.country);
        await this.clearAndType(customerCheckout.billing.country, billingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(customerCheckout.billing.firstName, billingInfo.firstName);
        await this.clearAndType(customerCheckout.billing.lastName, billingInfo.lastName);
        await this.clearAndType(customerCheckout.billing.address, billingInfo.street1);
        await this.clickIfVisible(customerCheckout.billing.address2toggle);
        await this.clearAndType(customerCheckout.billing.address2, billingInfo.street2);
        await this.clearAndType(customerCheckout.billing.city, billingInfo.city);
        await this.click(customerCheckout.billing.stateInput);
        await this.clearAndType(customerCheckout.billing.stateInput, billingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(customerCheckout.billing.zipCode, billingInfo.zipCode);
        // await this.clearAndType(customerCheckout.billing.phone, billingInfo.phone);
        await this.typeAndWaitForResponse(data.subUrls.api.wc.store, customerCheckout.billing.phone, billingInfo.phone, 207);
    }

    // add shipping address in checkout
    async addShippingAddressInCheckout(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.clearAndType(customerCheckout.shipping.email, shippingInfo.email);
        await this.click(customerCheckout.shipping.country);
        await this.clearAndType(customerCheckout.shipping.country, shippingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(customerCheckout.shipping.firstName, shippingInfo.firstName);
        await this.clearAndType(customerCheckout.shipping.lastName, shippingInfo.lastName);
        await this.clearAndType(customerCheckout.shipping.address, shippingInfo.street1);
        await this.clickIfVisible(customerCheckout.shipping.address2toggle);
        await this.clearAndType(customerCheckout.shipping.address2, shippingInfo.street2);
        await this.clearAndType(customerCheckout.shipping.city, shippingInfo.city);
        await this.click(customerCheckout.shipping.stateInput);
        await this.clearAndType(customerCheckout.shipping.stateInput, shippingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(customerCheckout.shipping.zipCode, shippingInfo.zipCode);
        // await this.clearAndType(customerCheckout.shipping.phone, shippingInfo.phone);
        await this.typeAndWaitForResponse(data.subUrls.api.wc.store, customerCheckout.shipping.phone, shippingInfo.phone, 207);
    }

    // place order
    async placeOrder(paymentMethod = 'bank', getOrderDetails = false, billingAddress = false, shippingAddress = false): Promise<string | object> {
        await this.goToCheckout();
        if (billingAddress) await this.addBillingAddressInCheckout(data.customer.customerInfo.billing);
        if (shippingAddress) await this.addShippingAddressInCheckout(data.customer.customerInfo.shipping);

        switch (paymentMethod) {
            case 'bank':
                await this.click(customerCheckout.directBankTransfer);
                break;

            case 'check':
                await this.click(customerCheckout.checkPayments);
                break;

            case 'cod':
                await this.click(customerCheckout.cashOnDelivery);
                break;

            case 'stripe':
                await this.payWithStripe(data.paymentDetails.strip);
                break;

            case 'stripeExpress':
                await this.payWithStripeExpress(data.paymentDetails.stripExpress);
                break;

            default:
                break;
        }

        await this.focusOnLocator(customerCheckout.placeOrder);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, customerCheckout.placeOrder);
        await this.toBeVisible(selector.customer.cOrderReceived.orderReceivedSuccessMessage);

        const ifMultiVendorOrder = await this.isVisible(selector.customer.cOrderReceived.orderDetails.subOrders.subOrders);
        if (ifMultiVendorOrder) {
            await this.multipleElementVisible(selector.customer.cOrderReceived.orderDetails.subOrders);
        }

        if (getOrderDetails) {
            return await this.getOrderDetailsAfterPlaceOrder();
        }

        return (await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderNumber)) as string; // remove after solving api issue in -> return request before all
    }

    // place order
    async paymentOrder(paymentMethod = 'bank'): Promise<string> {
        // todo: refactor like place order after vendor subscription tests are merged
        switch (paymentMethod) {
            case 'bank':
                await this.click(customerCheckout.directBankTransfer);
                break;

            case 'check':
                await this.click(customerCheckout.checkPayments);
                break;

            case 'cod':
                await this.click(customerCheckout.cashOnDelivery);
                break;

            case 'stripe':
                await this.payWithStripe(data.paymentDetails.strip);
                break;

            case 'stripeExpress':
                await this.payWithStripeExpress(data.paymentDetails.stripExpress);
                break;

            default:
                break;
        }

        await this.focusOnLocator(customerCheckout.placeOrder);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, customerCheckout.placeOrder);
        await this.toBeVisible(selector.customer.cOrderReceived.orderReceivedSuccessMessage);
        return (await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderNumber)) as string; // remove after solving api issue in -> return request before all
    }

    // buy product
    async buyProduct(productName: string, couponCode: string, applyCoupon = false, getOrderDetails = false, paymentMethod = 'bank'): Promise<string | object> {
        await this.addProductToCart(productName, 'single-product');
        if (applyCoupon) await this.applyCoupon(couponCode);
        return await this.placeOrder(paymentMethod, getOrderDetails);
    }

    // pay with stripe connect
    async payWithStripe(cardInfo: paymentDetails['strip']): Promise<void> {
        await this.click(customerCheckout.stripeConnect);
        const savedTestCardIsVisible = await this.isVisible(selector.customer.cPayWithStripe.savedTestCard4242);
        if (!savedTestCardIsVisible) {
            await this.typeFrameSelector(selector.customer.cPayWithStripe.stripeConnectIframe, selector.customer.cPayWithStripe.cardNumber, cardInfo.cardNumber);
            await this.typeFrameSelector(selector.customer.cPayWithStripe.stripeConnectIframe, selector.customer.cPayWithStripe.expDate, cardInfo.expiryDate);
            await this.typeFrameSelector(selector.customer.cPayWithStripe.stripeConnectIframe, selector.customer.cPayWithStripe.cvc, cardInfo.cvc);
            await this.click(selector.customer.cPayWithStripe.savePaymentInformation);
        } else {
            await this.click(selector.customer.cPayWithStripe.savedTestCard4242);
        }
    }

    // pay with stripe express
    async payWithStripeExpress(paymentDetails: paymentDetails['stripExpress']): Promise<void> {
        const paymentMethod = paymentDetails.paymentMethod;
        const cardInfo = paymentDetails.cardInfo;
        await this.click(customerCheckout.stripeExpress);
        const savedTestCardIsVisible = await this.isVisible(selector.customer.cPayWithStripeExpress.savedTestCard4242);
        if (!savedTestCardIsVisible) {
            switch (paymentMethod) {
                case 'card':
                    await this.clickFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.creditCard);
                    await this.typeFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.cardNumber, cardInfo.cardNumber);
                    await this.typeFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.expDate, cardInfo.expiryDate);
                    await this.typeFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.cvc, cardInfo.cvc);
                    await this.click(selector.customer.cPayWithStripeExpress.savePaymentInformation);
                    break;

                case 'gPay':
                    await this.clickFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.gPay);
                    return;

                case 'iDeal':
                    await this.clickFrameSelector(selector.customer.cPayWithStripeExpress.stripeExpressIframe, selector.customer.cPayWithStripeExpress.iDeal);
                    break;

                default:
                    break;
            }
        } else {
            await this.click(selector.customer.cPayWithStripeExpress.savedTestCard4242);
        }
    }

    // get order details after purchase
    async getOrderDetailsAfterPlaceOrder(): Promise<object> {
        const orderDetails = {
            orderNumber: '',
            subtotal: 0,
            shippingCost: 0,
            shippingMethod: '',
            tax: 0,
            paymentMethod: '',
            orderTotal: 0,
        };

        orderDetails.orderNumber = (await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderNumber)) as string;
        orderDetails.subtotal = helpers.price((await this.getElementText(selector.customer.cOrderReceived.orderDetails.subTotal)) as string);

        const shippingIsVisible = await this.isVisible(selector.customer.cOrderReceived.orderDetails.shippingCost);
        if (shippingIsVisible) {
            orderDetails.shippingMethod = ((await this.getElementText(selector.customer.cOrderReceived.orderDetails.shippingMethod)) as string).replace('via ', '');
            orderDetails.shippingCost = helpers.price((await this.getElementText(selector.customer.cOrderReceived.orderDetails.shippingCost)) as string);
        }
        const taxIsVisible = await this.isVisible(selector.customer.cOrderReceived.orderDetails.tax);
        if (taxIsVisible) {
            orderDetails.tax = helpers.price((await this.getElementText(selector.customer.cOrderReceived.orderDetails.tax)) as string);
        }

        orderDetails.paymentMethod = (await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderPaymentMethod)) as string;
        orderDetails.orderTotal = helpers.price((await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderTotal)) as string);

        return orderDetails;
    }

    // get order details
    async getOrderDetails(orderNumber: string): Promise<object> {
        await this.goToOrderDetails(orderNumber);

        const orderDetails = {
            orderNumber: '',
            orderDate: '',
            orderStatus: '',
            subtotal: 0,
            shippingCost: 0,
            shippingMethod: '',
            tax: 0,
            orderDiscount: 0,
            quantityDiscount: 0,
            discount: 0,
            paymentMethod: '',
            orderTotal: 0,
        };

        orderDetails.orderNumber = (await this.getElementText(selector.customer.cOrders.orderDetails.orderNumber)) as string;
        orderDetails.orderDate = (await this.getElementText(selector.customer.cOrders.orderDetails.orderDate)) as string;
        orderDetails.orderStatus = (await this.getElementText(selector.customer.cOrders.orderDetails.orderStatus)) as string;
        orderDetails.subtotal = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.subTotal)) as string);

        const shippingIsVisible = await this.isVisible(selector.customer.cOrders.orderDetails.shippingCost);
        if (shippingIsVisible) {
            orderDetails.shippingCost = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.shippingCost)) as string);
            orderDetails.shippingMethod = ((await this.getElementText(selector.customer.cOrders.orderDetails.shippingMethod)) as string).replace('via ', '');
        }

        const taxIsVisible = await this.isVisible(selector.customer.cOrders.orderDetails.tax);
        if (taxIsVisible) {
            orderDetails.tax = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.tax)) as string);
        }

        const orderDiscount = await this.isVisible(selector.customer.cOrders.orderDetails.orderDiscount);
        if (orderDiscount) {
            orderDetails.orderDiscount = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.orderDiscount)) as string);
        }

        const quantityDiscount = await this.isVisible(selector.customer.cOrders.orderDetails.quantityDiscount);
        if (quantityDiscount) {
            orderDetails.quantityDiscount = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.quantityDiscount)) as string);
        }

        const discount = await this.isVisible(selector.customer.cOrders.orderDetails.discount);
        if (discount) {
            orderDetails.discount = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.discount)) as string);
        }

        orderDetails.paymentMethod = (await this.getElementText(selector.customer.cOrders.orderDetails.paymentMethod)) as string;
        orderDetails.orderTotal = helpers.price((await this.getElementText(selector.customer.cOrders.orderDetails.orderTotal)) as string);

        // console.log(orderDetails);
        return orderDetails;
    }

    // search product
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shop);
        if (!DOKAN_PRO) {
            // search on lite
            await this.clearAndType(selector.customer.cShop.searchProductLite, productName);
            await this.pressAndWaitForLoadState(data.key.enter);
            await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName);
        } else {
            await this.clearAndType(selector.customer.cShop.filters.searchProduct, productName);
            await this.clickAndWaitForLoadState(selector.customer.cShop.filters.search);
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
