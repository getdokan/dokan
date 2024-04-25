import { Page, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { LoginPage } from '@pages/loginPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { customer, paymentDetails } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

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
        await this.clickAndWaitForUrl(helpers.stringToRegex(data.subUrls.frontend.checkout), selector.customer.cCart.proceedToCheckout);
    }

    // customer details

    // customer register
    async customerRegister(customerInfo: customer['customerInfo']): Promise<void> {
        const username = (customerInfo.firstName() + customerInfo.lastName()).replace("'", '');
        await this.goToMyAccount();
        const regIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
        !regIsVisible && (await this.loginPage.logout());
        await this.clearAndType(selector.customer.cRegistration.regEmail, username + data.customer.customerInfo.emailDomain);
        await this.clearAndType(selector.customer.cRegistration.regPassword, customerInfo.password);
        await this.click(selector.customer.cRegistration.regAsCustomer);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, selector.customer.cRegistration.register, 302);
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
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.accountMigration, selector.customer.cDashboard.becomeVendor);
        // vendor registration form
        await this.clearAndType(selector.customer.cDashboard.firstName, firstName);
        await this.clearAndType(selector.customer.cDashboard.lastName, customerInfo.lastName());
        await this.clearAndType(selector.customer.cDashboard.shopName, customerInfo.shopName());
        await this.click(selector.customer.cDashboard.shopUrl);
        await this.clearAndType(selector.customer.cDashboard.phone, customerInfo.phone);

        if (DOKAN_PRO) {
            await this.clearAndType(selector.customer.cDashboard.companyName, customerInfo.companyName);
            await this.clearAndType(selector.customer.cDashboard.companyId, customerInfo.companyId);
            await this.clearAndType(selector.customer.cDashboard.vatNumber, customerInfo.vatNumber);
            await this.clearAndType(selector.customer.cDashboard.bankName, customerInfo.bankName);
            await this.clearAndType(selector.customer.cDashboard.bankIban, customerInfo.bankIban);
        }

        await this.clickIfVisible(selector.customer.cDashboard.termsAndConditions);
        const subscriptionPackIsVisible = await this.isVisible(selector.customer.cDashboard.subscriptionPack);
        subscriptionPackIsVisible && (await this.selectByLabel(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.becomeVendor, selector.customer.cDashboard.becomeAVendor, 302);
        subscriptionPackIsVisible && (await this.placeOrder('bank', false, true, false));

        // skip vendor setup wizard
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.notRightNow);
        await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
    }

    // customer add customer details
    async addCustomerDetails(customer: customer): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.editAccountCustomer);
        await this.clearAndType(selector.customer.cAccountDetails.firstName, customer.username);
        await this.clearAndType(selector.customer.cAccountDetails.lastName, customer.lastname);
        await this.clearAndType(selector.customer.cAccountDetails.displayName, customer.username);
        await this.clearAndType(selector.customer.cAccountDetails.email, customer.username + customer.customerInfo.emailDomain);
        // await this.updatePassword(customer.customerInfo.password, customer.customerInfo.password1);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAccountCustomer, selector.customer.cAccountDetails.saveChanges, 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);

        // cleanup: reset password
        // await this.updatePassword(customer.customerInfo.password1, customer.customerInfo.password, true);
    }

    // customer update password
    async updatePassword(currentPassword: string, newPassword: string, saveChanges = false): Promise<void> {
        await this.clearAndType(selector.customer.cAccountDetails.currentPassword, currentPassword);
        await this.clearAndType(selector.customer.cAccountDetails.NewPassword, newPassword);
        await this.clearAndType(selector.customer.cAccountDetails.confirmNewPassword, newPassword);
        if (saveChanges) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.editAccountCustomer, selector.customer.cAccountDetails.saveChanges);
            await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.account.updateSuccessMessage);
        }
    }

    // update billing fields
    async updateBillingFields(billingInfo: customer['customerInfo']['billing']) {
        await this.clearAndType(selector.customer.cAddress.billing.billingFirstName, billingInfo.firstName);
        await this.clearAndType(selector.customer.cAddress.billing.billingLastName, billingInfo.lastName);
        await this.clearAndType(selector.customer.cAddress.billing.billingCompanyName, billingInfo.companyName);
        if (DOKAN_PRO) {
            await this.clearAndType(selector.customer.cAddress.billing.billingCompanyID, billingInfo.companyId);
            await this.clearAndType(selector.customer.cAddress.billing.billingVatOrTaxNumber, billingInfo.vatNumber);
            await this.clearAndType(selector.customer.cAddress.billing.billingNameOfBank, billingInfo.bankName);
            await this.clearAndType(selector.customer.cAddress.billing.billingBankIban, billingInfo.bankIban);
        }
        await this.click(selector.customer.cAddress.billing.billingCountryOrRegion);
        await this.clearAndType(selector.customer.cAddress.billing.billingCountryOrRegionInput, billingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(selector.customer.cAddress.billing.billingStreetAddress, billingInfo.street1);
        await this.clearAndType(selector.customer.cAddress.billing.billingStreetAddress2, billingInfo.street2);
        await this.clearAndType(selector.customer.cAddress.billing.billingTownCity, billingInfo.city);
        await this.focus(selector.customer.cAddress.billing.billingZipCode);
        await this.click(selector.customer.cAddress.billing.billingState);
        await this.clearAndType(selector.customer.cAddress.billing.billingStateInput, billingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(selector.customer.cAddress.billing.billingZipCode, billingInfo.zipCode);
        await this.clearAndType(selector.customer.cAddress.billing.billingPhone, billingInfo.phone);
        await this.clearAndType(selector.customer.cAddress.billing.billingEmailAddress, billingInfo.email);
    }

    // update shipping fields
    async updateShippingFields(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.clearAndType(selector.customer.cAddress.shipping.shippingFirstName, shippingInfo.firstName);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingLastName, shippingInfo.lastName);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingCompanyName, shippingInfo.companyName);
        await this.click(selector.customer.cAddress.shipping.shippingCountryOrRegion);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingCountryOrRegionInput, shippingInfo.country);
        await this.press(data.key.enter);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingStreetAddress, shippingInfo.street1);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingStreetAddress2, shippingInfo.street2);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingTownCity, shippingInfo.city);
        await this.focus(selector.customer.cAddress.shipping.shippingZipCode);
        await this.click(selector.customer.cAddress.shipping.shippingState);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingStateInput, shippingInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(selector.customer.cAddress.shipping.shippingZipCode, shippingInfo.zipCode);
    }

    // customer add billing address
    async addBillingAddress(billingInfo: customer['customerInfo']['billing']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.billingAddress);
        await this.updateBillingFields(billingInfo);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.billingAddress, selector.customer.cAddress.billing.billingSaveAddress, 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.address.addressChangeSuccessMessage);
    }

    // customer add shipping address
    async addShippingAddress(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shippingAddress);
        await this.updateShippingFields(shippingInfo);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.shippingAddress, selector.customer.cAddress.shipping.shippingSaveAddress, 302);
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
        addonIsVisible && this.selectByNumber(selector.customer.cSingleProduct.productAddon.addOnSelect, 1);
        quantity && (await this.clearAndType(selector.customer.cSingleProduct.productDetails.quantity, String(quantity)));
        await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, selector.customer.cSingleProduct.productDetails.addToCart);
        if (!quantity) {
            await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, `“${productName}” has been added to your cart.`);
        } else {
            await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, `${quantity} × “${productName}” have been added to your cart.`);
        }
    }

    // add product to cart
    async addProductToCart(productName: string, from: string, clearCart = true, quantity?: string) {
        // clear cart
        clearCart && (await this.clearCart());
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
        await this.toBeVisible(selector.customer.cCart.cartItem(productName));
    }

    // clear cart
    async clearCart(): Promise<void> {
        await this.goToCart();
        const emptyCart = await this.isVisible(selector.customer.cCart.cartEmptyMessage);
        if (!emptyCart) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.wc.store, selector.customer.cCart.removeFirstItem, 207);
            await this.clearCart();
        }
    }

    // Update product quantity from cart
    async updateProductQuantityOnCart(productName: string, quantity: string): Promise<void> {
        await this.goToCart();
        await this.typeAndWaitForResponse(data.subUrls.api.wc.store, selector.customer.cCart.quantity(productName), quantity, 207);
        await this.toHaveValue(selector.customer.cCart.quantity(productName), quantity);
    }

    // apply coupon
    async applyCoupon(couponCode: string): Promise<void> {
        await this.goToCart();
        const couponIsApplied = await this.isVisible(selector.customer.cCart.removeCoupon(couponCode));
        if (couponIsApplied) {
            await this.clickAndWaitForResponse(data.subUrls.api.wc.store, selector.customer.cCart.removeCoupon(couponCode), 207);
            await this.toContainText(selector.customer.cWooSelector.wooCommerceNoticeBannerContent, `Coupon code "${couponCode}" has been removed from your cart.`);
        }
        await this.click(selector.customer.cCart.addCoupon);
        await this.clearAndType(selector.customer.cCart.couponCode, couponCode);
        await this.clickAndWaitForResponse(data.subUrls.api.wc.store, selector.customer.cCart.applyCoupon, 207);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceNoticeBannerContent, `Coupon code "${couponCode}" has been applied to your cart.`);
    }

    // add billing address in checkout
    async addBillingAddressInCheckout(billingInfo: customer['customerInfo']['billing']): Promise<void> {
        await this.updateBillingFields(billingInfo);
    }

    // add shipping address in checkout
    async addShippingAddressInCheckout(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.clickAndWaitForResponse(data.subUrls.frontend.shippingAddressCheckout, selector.customer.cCheckout.shippingAddress.shipToADifferentAddress);
        await this.updateShippingFields(shippingInfo);
    }

    // place order
    async placeOrder(paymentMethod = 'bank', getOrderDetails = false, billingAddress = false, shippingAddress = false): Promise<string | object> {
        await this.goToCheckout();
        billingAddress && (await this.addBillingAddressInCheckout(data.customer.customerInfo.billing));
        shippingAddress && (await this.addShippingAddressInCheckout(data.customer.customerInfo.shipping));

        switch (paymentMethod) {
            case 'bank':
                await this.click(selector.customer.cCheckout.directBankTransfer);
                break;

            case 'check':
                await this.click(selector.customer.cCheckout.checkPayments);
                break;

            case 'cod':
                await this.click(selector.customer.cCheckout.cashOnDelivery);
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
        await this.focusOnLocator(selector.customer.cCheckout.placeOrder);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, selector.customer.cCheckout.placeOrder);
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
        switch (paymentMethod) {
            case 'bank':
                await this.click(selector.customer.cCheckout.directBankTransfer);
                break;

            case 'check':
                await this.click(selector.customer.cCheckout.checkPayments);
                break;

            case 'cod':
                await this.click(selector.customer.cCheckout.cashOnDelivery);
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

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, selector.customer.cCheckout.placeOrder);
        await this.toBeVisible(selector.customer.cOrderReceived.orderReceivedSuccessMessage);
        return (await this.getElementText(selector.customer.cOrderReceived.orderDetails.orderNumber)) as string; // remove after solving api issue in -> return request before all
    }

    // buy product
    async buyProduct(productName: string, couponCode: string, applyCoupon = false, getOrderDetails = false, paymentMethod = 'bank'): Promise<string | object> {
        await this.addProductToCart(productName, 'single-product');
        applyCoupon && (await this.applyCoupon(couponCode));
        return await this.placeOrder(paymentMethod, getOrderDetails);
    }

    // pay with stripe connect
    async payWithStripe(cardInfo: paymentDetails['strip']): Promise<void> {
        await this.click(selector.customer.cCheckout.stripeConnect);
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
        await this.click(selector.customer.cCheckout.stripeExpress);
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

        console.log(orderDetails);
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
