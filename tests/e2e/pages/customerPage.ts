import {expect, type Page} from '@playwright/test'
import {BasePage} from "./basePage"
import {LoginPage} from './loginPage'
import {AdminPage} from "./adminPage"
import {selector} from './selectors'
import {data} from '../utils/testData'


export class CustomerPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    loginPage = new LoginPage(this.page);
    adminPage = new AdminPage(this.page);

    // navigation 

    async goToMyAccount(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount)
    }

    async goToCart(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.cart)
    }

    async goToCheckout(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.checkout)
    }

    async goToShop(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shop)
    }

    async goToStoreList(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeListing)
    }

    // customer details 

    // customer register
    async customerRegister(customerInfo: { lastName: () => string; country: string; zipCode: string; emailDomain: string; city: string; accountName: string; companyName: string; storename: () => string; bankIban: string; swiftCode: string; bankName: string; password: any; countrySelectValue: string; street1: string; password1: string; street2: string; state: string; email: string; addressChangeSuccessMessage: string; getSupport: { supportSubmitSuccessMessage: string; subject: string; message: string }; accountNumber: string; bankAddress: string; stateSelectValue: string; firstName: () => string; routingNumber: string; companyId: string; phone: string; iban: string; username: () => string; vatNumber: string }): Promise<void> {
        let username : string = customerInfo.firstName()
        await this.goToMyAccount()
        let loginIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail)
        if (!loginIsVisible) {
            await this.loginPage.logout()
        }
        await this.clearAndType(selector.customer.cRegistration.regEmail, username + data.customer.customerInfo.emailDomain)
        await this.clearAndType(selector.customer.cRegistration.regPassword, customerInfo.password)
        await this.click(selector.customer.cRegistration.regCustomer)
        await this.click(selector.customer.cRegistration.register)

        let registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError)
        if (registrationErrorIsVisible) {
            let errorMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceError)
            if (errorMessage.includes(data.customer.registrationErrorMessage)) {
                return
            }
        }
        let loggedInUser = await this.getCurrentUser()
        expect(username.toLowerCase()).toBe(loggedInUser)
    }

    // customer become vendor
    async customerBecomeVendor(customerInfo): Promise<void> {
        let firstName = customerInfo.firstName()
        await this.click(selector.customer.cDashboard.becomeVendor)
        // vendor registration form
        await this.type(selector.customer.cDashboard.firstName, firstName)
        await this.type(selector.customer.cDashboard.lastName, customerInfo.lastName())
        await this.type(selector.customer.cDashboard.shopName, customerInfo.storename())
        await this.click(selector.customer.cDashboard.shopUrl)
        await this.type(selector.customer.cDashboard.address, customerInfo.street1)
        await this.type(selector.customer.cDashboard.phone, customerInfo.phone)
        await this.type(selector.customer.cDashboard.companyName, customerInfo.companyName)
        await this.type(selector.customer.cDashboard.companyId, customerInfo.companyId)
        await this.type(selector.customer.cDashboard.vatNumber, customerInfo.vatNumber)
        await this.type(selector.customer.cDashboard.bankName, customerInfo.bankName)
        await this.type(selector.customer.cDashboard.bankIban, customerInfo.bankIban)
        await this.clickIfVisible(selector.customer.cDashboard.termsAndConditions)
        let subscriptionPackIsVisible = await this.isVisible(selector.customer.cDashboard.subscriptionPack)    //TODO: uncmment after fix css issue
        if (subscriptionPackIsVisible) {
            // await this.selectOptionByText(selector.vendor.vRegistration.subscriptionPack, selector.vendor.vRegistration.subscriptionPackOptions, data.predefined.vendorSubscription.nonRecurring.productName())
            await this.select(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring)
        }
        await this.click(selector.customer.cDashboard.becomeAVendor)

        if (subscriptionPackIsVisible) {
            await this.placeOrder('bank', false, false, true)

            // skip vendor setup wizard
            await this.click(selector.vendor.vSetup.notRightNow)

            let dashboardIsVisible = await this.isVisible(selector.vendor.vDashboard.dashboard)
            expect(dashboardIsVisible).toBe(true)
        }

    }

    // customer become wholesale customer
    async customerBecomeWholesaleCustomer(): Promise<void> {
        let currentUser = await this.getCurrentUser()
        await this.click(selector.customer.cDashboard.becomeWholesaleCustomer)
        let returnMessage = await this.getElementText(selector.customer.cDashboard.wholesaleRequestReturnMessage)
        if (returnMessage != data.wholesale.wholesaleRequestSendMessage) {
            let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
            expect(successMessage).toMatch(data.wholesale.becomeWholesaleCustomerSuccessMessage)
        } else {
            await this.loginPage.switchUser(data.admin)
            // await this.adminPage.adminApproveWholesaleRequest(currentUser)
        }
    }

    // customer add billing address
    async addBillingAddress(billingInfo): Promise<void> {
        await this.goToMyAccount()

        await this.click(selector.customer.cMyAccount.addresses)
        //billing address
        await this.click(selector.customer.cAddress.editBillingAddress)
        await this.clearAndType(selector.customer.cAddress.billingFirstName, billingInfo.firstName())
        await this.clearAndType(selector.customer.cAddress.billingLastName, billingInfo.lastName())
        await this.clearAndType(selector.customer.cAddress.billingCompanyName, billingInfo.companyName)
        await this.clearAndType(selector.customer.cAddress.billingCompanyID, billingInfo.companyId)
        await this.clearAndType(selector.customer.cAddress.billingVatOrTaxNumber, billingInfo.vatNumber)
        await this.clearAndType(selector.customer.cAddress.billingNameOfBank, billingInfo.bankName)
        await this.clearAndType(selector.customer.cAddress.billingBankIban, billingInfo.bankIban)
        await this.click(selector.customer.cAddress.billingCountryOrRegion)
        await this.type(selector.customer.cAddress.billingCountryOrRegionInput, billingInfo.country)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.billingStreetAddress, billingInfo.street1)
        await this.clearAndType(selector.customer.cAddress.billingStreetAddress2, billingInfo.street2)
        await this.clearAndType(selector.customer.cAddress.billingTownCity, billingInfo.city)
        await this.click(selector.customer.cAddress.billingState)
        await this.type(selector.customer.cAddress.billingStateInput, billingInfo.state)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.billingZipCode, billingInfo.zipCode)
        await this.clearAndType(selector.customer.cAddress.billingPhone, billingInfo.phone)
        await this.clearAndType(selector.customer.cAddress.billingEmailAddress, billingInfo.email)
        await this.click(selector.customer.cAddress.billingSaveAddress)

        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(data.customer.customerInfo.addressChangeSuccessMessage)
    }

    // customer add shipping address
    async addShippingAddress(shippingInfo): Promise<void> {
        await this.goToMyAccount()

        await this.click(selector.customer.cMyAccount.addresses)
        //shipping address
        await this.click(selector.customer.cAddress.editShippingAddress)
        await this.clearAndType(selector.customer.cAddress.shippingFirstName, shippingInfo.firstName())
        await this.clearAndType(selector.customer.cAddress.shippingLastName, shippingInfo.lastName())
        await this.clearAndType(selector.customer.cAddress.shippingCompanyName, shippingInfo.companyName)
        await this.click(selector.customer.cAddress.shippingCountryOrRegion)
        await this.type(selector.customer.cAddress.shippingCountryOrRegionInput, shippingInfo.country)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.shippingStreetAddress, shippingInfo.street1)
        await this.clearAndType(selector.customer.cAddress.shippingStreetAddress2, shippingInfo.street2)
        await this.clearAndType(selector.customer.cAddress.shippingTownCity, shippingInfo.city)
        await this.click(selector.customer.cAddress.shippingState)
        await this.type(selector.customer.cAddress.shippingStateInput, shippingInfo.state)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.shippingZipCode, shippingInfo.zipCode)
        await this.click(selector.customer.cAddress.shippingSaveAddress)

        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(data.customer.customerInfo.addressChangeSuccessMessage)
    }

    // customer Send Rma Request
    async sendRmaMessage(message: string): Promise<void> {
        await this.click(selector.customer.cMyAccount.rmaRequests)

        await this.type(selector.customer.cRma.message, message)
        await this.click(selector.customer.cRma.sendMessage)

        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(data.customer.rma.sendMessage)
    }

    // customer update password
    async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
        await this.clearAndType(selector.customer.cAccountDetails.currentPassword, currentPassword)
        await this.clearAndType(selector.customer.cAccountDetails.NewPassword, newPassword)
        await this.clearAndType(selector.customer.cAccountDetails.confirmNewPassword, newPassword)
        await this.click(selector.customer.cAccountDetails.saveChanges)

        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(data.customer.account.updateSuccessMessage)
    }

    // customer add customer details
    async addCustomerDetails(customerInfo): Promise<void> {
        await this.goToMyAccount()

        await this.click(selector.customer.cMyAccount.accountDetails)

        await this.clearAndType(selector.customer.cAccountDetails.firstName, customerInfo.firstName())
        await this.clearAndType(selector.customer.cAccountDetails.lastName, customerInfo.lastName())
        await this.clearAndType(selector.customer.cAccountDetails.displayName, customerInfo.firstName())
        // await this.clearAndType(selector.customer.cAccountDetails.email, customerInfo.email()) 
        await this.updatePassword(customerInfo.password, customerInfo.password1)

        // cleanup
        // await this.click(selector.customer.cMyAccount.accountDetails)
        // await this.updatePassword(newPassword, currentPassword)
    }

    // customer search vendor
    async searchVendor(vendorName: string): Promise<void> {
        await this.goToStoreList()

        await this.click(selector.customer.cStoreList.filter)
        await this.type(selector.customer.cStoreList.searchVendors, vendorName)
        await this.click(selector.customer.cStoreList.apply)

        await this.waitForSelector(selector.customer.cStoreList.visitStore(vendorName))
        let cartIsVisible = await this.isVisible(selector.customer.cStoreList.visitStore(vendorName))
        expect(cartIsVisible).toBe(true)

    }

    // customer follow vendor
    async followVendor(vendorName: string): Promise<void> {
        await this.searchVendor(vendorName)
        let currentStoreFollowStatus = await this.getElementText(selector.customer.cStoreList.currentStoreFollowStatus(vendorName))
        // unfollow if not already
        if (currentStoreFollowStatus == 'Following') {
            await this.click(selector.customer.cStoreList.followUnFollowStore(vendorName))
            await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cStoreList.followUnFollowStore(vendorName))
        }
        await this.click(selector.customer.cStoreList.followUnFollowStore(vendorName))
        let v = await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cStoreList.followUnFollowStore(vendorName))
        let storeFollowStatus = await this.getElementText(selector.customer.cStoreList.currentStoreFollowStatus(vendorName))
        expect(storeFollowStatus).toMatch('Following')
    }

    // customer review store
    async reviewStore(vendorName: string, store): Promise<void> {
        await this.searchVendor(vendorName)

        await this.click(selector.customer.cStoreList.visitStore(vendorName))

        let reviewMessage = store.reviewMessage()
        await this.clickAndWaitForNavigation(selector.customer.cSingleStore.reviews)

        let writeAReviewIsVisible = await this.isVisible(selector.customer.cSingleStore.writeAReview)
        if (writeAReviewIsVisible) {
            await this.click(selector.customer.cSingleStore.writeAReview)
        } else {
            await this.click(selector.customer.cSingleStore.editReview)
        }

        // await this.setElementAttributeValue(selector.customer.cSingleStore.rating, 'style', store.rating) //TODO
        await this.clearAndType(selector.customer.cSingleStore.reviewTitle, store.reviewTitle)
        await this.clearAndType(selector.customer.cSingleStore.reviewMessage, reviewMessage)
        await this.click(selector.customer.cSingleStore.submitReview)


        let submittedReviewMessage = await this.getElementText(selector.customer.cSingleStore.submittedReview(reviewMessage))
        expect(submittedReviewMessage).toMatch(reviewMessage)
    }

    // customer ask for get support
    async askForGetSupport(vendorName: string, getSupport): Promise<void> {
        await this.searchVendor(vendorName)

        await this.click(selector.customer.cStoreList.visitStore(vendorName))

        await this.click(selector.customer.cSingleStore.getSupport)

        await this.type(selector.customer.cSingleStore.subject, getSupport.subject)
        await this.type(selector.customer.cSingleStore.message, getSupport.message)
        await this.click(selector.customer.cSingleStore.submitGetSupport)


        let successMessage = await this.getElementText(selector.customer.cDokanSelector.dokanAlertSuccessMessage)
        expect(successMessage).toMatch(getSupport.supportSubmitSuccessMessage)

        // close popup
        await this.click(selector.customer.cDokanSelector.dokanAlertClose)
    }

    // customer add customer support ticket
    async addCustomerSupportTicket(message: string): Promise<void> {
        await this.click(selector.customer.cMyAccount.sellerSupportTickets)
        await this.click(selector.customer.cSupportTickets.openTickets)
        await this.click(selector.customer.cSupportTickets.firstOpenTicket)

        await this.clearAndType(selector.customer.cSupportTickets.addReply, message)
        await this.click(selector.customer.cSupportTickets.submitReply)

        let chatTextIsVisible = await this.isVisible(selector.customer.cSupportTickets.chatText(message))
        expect(chatTextIsVisible).toBe(true)
    }

    // customer rate & review product
    async reviewProduct(productName: string, review): Promise<void> {
        await this.goToProductDetails(productName)
        let reviewMessage: string
        reviewMessage = await this.rateProduct(review)
        let duplicateCommentAlertIsVisible = await this.isVisible(selector.customer.cSingleProduct.duplicateCommentAlert)
        if (duplicateCommentAlertIsVisible) {
            await this.click(selector.customer.cSingleProduct.backFromDuplicateCommentAlert)
            reviewMessage = await this.rateProduct(review)
        }

        let submittedReviewMessage = await this.getElementText(selector.customer.cSingleProduct.submittedReview(reviewMessage))
        expect(submittedReviewMessage).toMatch(reviewMessage)
    }

    // rate product
    async rateProduct(review): Promise<string> {
        let reviewMessage = review.reviewMessage()
        await this.click(selector.customer.cSingleProduct.reviews)

        await this.click(selector.customer.cSingleProduct.rating(review.rating))
        await this.clearAndType(selector.customer.cSingleProduct.reviewMessage, reviewMessage)
        await this.click(selector.customer.cSingleProduct.submitReview)
        return reviewMessage
    }

    // customer report product
    async reportProduct(productName: string, report): Promise<void> {
        await this.goToProductDetails(productName)

        await this.click(selector.customer.cSingleProduct.reportAbuse)
        await this.click(selector.customer.cSingleProduct.reportReasonByName(report.reportReason))
        await this.type(selector.customer.cSingleProduct.reportDescription, report.reportReasonDescription)
        await this.click(selector.customer.cSingleProduct.reportSubmit)

        let successMessage = await this.getElementText(selector.customer.cSingleProduct.reportSubmitSuccessMessage)
        expect(successMessage).toMatch(report.reportSubmitSuccessMessage)

        // close popup
        await this.click(selector.customer.cSingleProduct.confirmReportSubmit)

    }

    // customer enquire product
    async enquireProduct(productName: string, enquiry): Promise<void> {
        await this.goToProductDetails(productName)

        await this.click(selector.customer.cSingleProduct.productEnquiry)
        await this.type(selector.customer.cSingleProduct.enquiryMessage, enquiry.enquiryDetails)
        await this.click(selector.customer.cSingleProduct.submitEnquiry)


        let successMessage = await this.getElementText(selector.customer.cSingleProduct.submitEnquirySuccessMessage)
        expect(successMessage).toMatch(enquiry.enquirySubmitSuccessMessage)
    }

    async buyProduct(productName: string, couponCode: boolean = false, getOrderDetails: boolean = false, paymentMethod: string = 'bank', paymentDetails): Promise<void | object> {
        // clear cart before buying
        await this.clearCart()
        // buy product
        await this.searchProduct(productName)
        await this.addProductToCartFromShop(productName)
        await this.goToCartFromShop()
        if (couponCode) {
            await this.applyCoupon(couponCode)
        }
        await this.goToCheckoutFromCart()
        return await this.placeOrder(paymentMethod, getOrderDetails, paymentDetails)
    }

    // customer search product
    async searchProduct(productName): Promise<void> {
        await this.goToShop()

        await this.type(selector.customer.cShop.searchProduct, productName)
        await this.click(selector.customer.cShop.search)

        let searchedProductName = await this.getElementText(selector.customer.cShop.searchedProductName)
        expect(searchedProductName).toMatch(productName)
    }

    // customer go to product(single) details
    async goToProductDetails(productName): Promise<void> {
        await this.searchProduct(productName)

        await this.click(selector.customer.cShop.productDetailsViewLink)

        let productTitle = await this.getElementText(selector.customer.cSingleProduct.productTitle)
        expect(productTitle).toMatch(productName)
    }

    // customer add product to cart from shop page
    async addProductToCartFromShop(productName): Promise<void> {
        await this.goToShop()
        await this.searchProduct(productName)

        await this.click(selector.customer.cShop.addToCart)

        await this.waitForSelector(selector.customer.cShop.viewCart)
        let cartIsVisible = await this.isVisible(selector.customer.cShop.viewCart)
        expect(cartIsVisible).toBe(true)
    }

    // customer check whether product is on cart
    async productIsOnCart(productName): Promise<void> {
        let productIsVisible = await this.isVisible(selector.customer.cCart.cartItem(productName))
        expect(productIsVisible).toBe(true)
    }

    // customer add product to cart from product details page
    async addProductToCartFromSingleProductPage(productName): Promise<void> {
        await this.click(selector.customer.cSingleProduct.addToCart)

        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(`“${productName}” has been added to your cart.`)
    }

    // go to cart from shop page
    async goToCartFromShop(): Promise<void> {
        await this.click(selector.customer.cShop.viewCart)


        await this.waitForSelector(selector.customer.cCart.cartPageHeader)
        let cartIsVisible = await this.isVisible(selector.customer.cCart.cartPageHeader)
        expect(cartIsVisible).toBe(true)
    }

    // go to cart from product details page
    async goToCartFromSingleProductPage(): Promise<void> {
        await this.click(selector.customer.cSingleProduct.viewCart)


        await this.waitForSelector(selector.customer.cCart.cartPageHeader)
        let cartIsVisible = await this.isVisible(selector.customer.cCart.cartPageHeader)
        expect(cartIsVisible).toBe(true)
    }

    // got to checkout from cart
    async goToCheckoutFromCart(): Promise<void> {
        await this.click(selector.customer.cCart.proceedToCheckout)

        await this.waitForSelector(selector.customer.cCheckout.checkoutPageHeader)
        let checkoutIsVisible = await this.isVisible(selector.customer.cCheckout.checkoutPageHeader)
        expect(checkoutIsVisible).toBe(true)
    }

    // clear cart
    async clearCart(): Promise<void> {
        await this.goToCart()
        let cartProductIsVisible = await this.isVisible(selector.customer.cCart.productCrossIcon)
        if (cartProductIsVisible) {
            await this.click(selector.customer.cCart.productCrossIcon)
            let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
            expect(successMessage).toContain('removed. Undo?')
            await this.clearCart()
        } else {
            let successMessage = await this.getElementText(selector.customer.cCart.cartEmptyMessage)
            expect(successMessage).toMatch('Your cart is currently empty.')
        }
    }

    // Update product quantity from cart
    async updateProductQuantityOnCart(productName, quantity): Promise<void> {
        await this.clearAndType(selector.customer.cCart.quantity(productName), quantity)
        await this.click(selector.customer.cCart.updateCart)

        // let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        // expect(successMessage).toMatch("Cart updated.")
        let updateProductQuantity = await this.getElementValue(selector.customer.cCart.quantity(productName))
        expect(updateProductQuantity).toMatch(quantity)
    }

    // customer apply coupon
    async applyCoupon(coupon): Promise<void> {
        let couponIsApplied = await this.isVisible(selector.customer.cCart.removeCoupon(coupon.title))
        if (couponIsApplied) {
            await this.removeAppliedCoupon(coupon.title)
        }
        await this.type(selector.customer.cCart.couponCode, coupon.title)
        await this.click(selector.customer.cCart.applyCoupon)


        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch("Coupon code applied successfully.")
    }

    // customer remove applied coupon
    async removeAppliedCoupon(couponCode): Promise<void> {
        await this.click(selector.customer.cCart.removeCoupon(couponCode))


        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch('Coupon has been removed.')
    }

    // customer place order
    async placeOrder(paymentMethod: string = 'bank', getOrderDetails: boolean = false, billingDetails: boolean = false, shippingDetails: boolean = false): Promise<void | object> {
        if (billingDetails) await this.addBillingAddressInCheckout(data.customer.customerInfo)
        if (shippingDetails) await this.addShippingAddressInCheckout(data.customer.customerInfo)


        switch (paymentMethod) {
            case 'bank':
                await this.click(selector.customer.cCheckout.directBankTransfer)
                await this.click(selector.customer.cCheckout.placeOrder)
                break
            case 'check':
                await this.click(selector.customer.cCheckout.checkPayments)
                await this.click(selector.customer.cCheckout.placeOrder)
                break
            case 'cod':
                await this.click(selector.customer.cCheckout.cashOnDelivery)
                await this.click(selector.customer.cCheckout.placeOrder)
                break
            // case 'stripe':
            //     await this.payWithStripe(paymentDetails)
            //     break
            // case 'paypalMarketPlace':
            //     await this.payWithPaypalMarketPlace()
            //     break
            // case 'razorPay':
            //     await this.payWithRazorPay()
            //     break
            // case 'mangoPay':
            //     await this.payWithMangoPay()
            //     break
            // case 'stripeExpress':
            //     await this.payWithStripeExpress(paymentDetails)
            //     break
            default:
                break
        }

        await this.waitForSelector(selector.customer.cOrderReceived.orderReceivedPageHeader)
        let orderReceivedIsVisible = await this.isVisible(selector.customer.cOrderReceived.orderReceivedPageHeader)
        expect(orderReceivedIsVisible).toBe(true)

        // if (getOrderDetails) {
        //     return await this.getOrderDetailsAfterPlaceOrder()
        // }
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
    //     await this.click(selector.customer.cCheckout.placeOrder)

    // }

    // async payWithPaypalMarketPlace(): Promise<void> {
    // }

    // async payWithRazorPay(): Promise<void> {
    // }

    // async payWithMangoPay(): Promise<void> {
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
    //     await this.click(selector.customer.cCheckout.placeOrder)

    // }

    // // get order details after purchase
    // async getOrderDetailsAfterPlaceOrder(): Promise<object> {
    //     let cOrderDetails: { orderNumber: string | null, subtotal: number, shippingCost: number, shippingMethod: string | null, tax: number, paymentMethod: string | null, orderTotal: number } = {}
    //     cOrderDetails.orderNumber = await this.getElementText(selector.customer.cOrderReceived.orderNumber)
    //     cOrderDetails.subtotal = helpers.price(await this.getElementText(selector.customer.cOrderReceived.subTotal))

    //     // let onlyShippingIsVisible = await this.isVisible(selector.customer.cOrderReceived.shipping)//TODO:delete this line when shipping is fixed
    //     // if (onlyShippingIsVisible) cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrderReceived.shipping)//TODO:delete this line when shipping is fixed

    //     let shippingIsVisible = await this.isVisible(selector.customer.cOrderReceived.shippingCost)
    //     if (shippingIsVisible) {
    //         cOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.customer.cOrderReceived.shippingCost))
    //         cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrderReceived.shippingMethod)
    //     }
    //     let taxIsVisible = await this.isVisible(selector.customer.cOrderReceived.shipping)
    //     if (taxIsVisible) cOrderDetails.tax = helpers.price(await this.getElementText(selector.customer.cOrderReceived.tax))

    //     cOrderDetails.paymentMethod = await this.getElementText(selector.customer.cOrderReceived.orderPaymentMethod)
    //     cOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.customer.cOrderReceived.orderTotal))

    //     return cOrderDetails
    // }

    // // get order details
    // async getOrderDetails(orderNumber): Promise<void> {
    //     await this.goToMyAccount()

    //     await this.click(selector.customer.cMyAccount.orders)
    //     await this.click(selector.customer.cOrders.OrderDetailsLInk(orderNumber))

    //     let cOrderDetails = {}
    //     cOrderDetails.orderNumber = await this.getElementText(selector.customer.cOrders.orderNumber)
    //     cOrderDetails.orderDate = await this.getElementText(selector.customer.cOrders.orderDate)
    //     cOrderDetails.orderStatus = await this.getElementText(selector.customer.cOrders.orderStatus)
    //     cOrderDetails.subtotal = helpers.price(await this.getElementText(selector.customer.cOrders.subTotal))

    //     // let onlyShippingIsVisible = await this.isVisible(selector.customer.cOrders.shipping)//TODO:delete this line when shipping is fixed
    //     // if (onlyShippingIsVisible) cOrderDetails.shippingMethod = await this.getElementText(selector.customer.cOrders.shippingMethod)//TODO:delete this line when shipping is fixed

    //     let shippingIsVisible = await this.isVisible(selector.customer.cOrders.shippingCost)
    //     if (shippingIsVisible) {
    //         cOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.customer.cOrders.shippingCost))
    //         cOrderDetails.shippingMethod = (await this.getElementText(selector.customer.cOrders.shippingMethod)).replace('via ', '')
    //     }

    //     let taxIsVisible = await this.isVisible(selector.customer.cOrders.tax)
    //     if (taxIsVisible) cOrderDetails.tax = helpers.price(await this.getElementText(selector.customer.cOrders.tax))

    //     let orderDiscount = await this.isVisible(selector.customer.cOrders.orderDiscount)
    //     if (orderDiscount) cOrderDetails.orderDiscount = helpers.price(await this.getElementText(selector.customer.cOrders.orderDiscount))

    //     let quantityDiscount = await this.isVisible(selector.customer.cOrders.quantityDiscount)
    //     if (quantityDiscount) cOrderDetails.quantityDiscount = helpers.price(await this.getElementText(selector.customer.cOrders.quantityDiscount))

    //     let discount = await this.isVisible(selector.customer.cOrders.discount)
    //     if (discount) cOrderDetails.discount = helpers.price(await this.getElementText(selector.customer.cOrders.discount))

    //     cOrderDetails.paymentMethod = await this.getElementText(selector.customer.cOrders.paymentMethod)
    //     cOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.customer.cOrders.orderTotal))

    //     // console.log(cOrderDetails)
    //     return cOrderDetails
    // }

    // customer add billing address in checkout
    async addBillingAddressInCheckout(billingInfo): Promise<void> {

        // Billing Address
        await this.clearAndType(selector.customer.cAddress.billingFirstName, billingInfo.firstName())
        await this.clearAndType(selector.customer.cAddress.billingLastName, billingInfo.lastName())
        await this.clearAndType(selector.customer.cAddress.billingCompanyName, billingInfo.companyName)
        await this.clearAndType(selector.customer.cAddress.billingCompanyID, billingInfo.companyId)
        await this.clearAndType(selector.customer.cAddress.billingVatOrTaxNumber, billingInfo.vatNumber)
        await this.clearAndType(selector.customer.cAddress.billingNameOfBank, billingInfo.bankName)
        await this.clearAndType(selector.customer.cAddress.billingBankIban, billingInfo.bankIban)
        await this.click(selector.customer.cAddress.billingCountryOrRegion)
        await this.type(selector.customer.cAddress.billingCountryOrRegionInput, billingInfo.country)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.billingStreetAddress, billingInfo.street1)
        await this.clearAndType(selector.customer.cAddress.billingStreetAddress2, billingInfo.street2)
        await this.clearAndType(selector.customer.cAddress.billingTownCity, billingInfo.city)
        await this.click(selector.customer.cAddress.billingState)
        await this.type(selector.customer.cAddress.billingStateInput, billingInfo.state)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.billingZipCode, billingInfo.zipCode)
        await this.clearAndType(selector.customer.cAddress.billingPhone, billingInfo.phone)
        await this.clearAndType(selector.customer.cAddress.billingEmailAddress, billingInfo.email)
    }

    // customer add shipping address in checkout
    async addShippingAddressInCheckout(shippingInfo): Promise<void> {

        await this.click(selector.customer.cCheckout.shipToADifferentAddress)
        // shipping address
        await this.clearAndType(selector.customer.cAddress.shippingFirstName, shippingInfo.firstName())
        await this.clearAndType(selector.customer.cAddress.shippingLastName, shippingInfo.lastName())
        await this.clearAndType(selector.customer.cAddress.shippingCompanyName, shippingInfo.companyName)
        await this.click(selector.customer.cAddress.shippingCountryOrRegion)
        await this.type(selector.customer.cAddress.shippingCountryOrRegionInput, shippingInfo.country)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.shippingStreetAddress, shippingInfo.street1)
        await this.clearAndType(selector.customer.cAddress.shippingStreetAddress2, shippingInfo.street2)
        await this.clearAndType(selector.customer.cAddress.shippingTownCity, shippingInfo.city)
        await this.click(selector.customer.cAddress.shippingState)
        await this.type(selector.customer.cAddress.shippingStateInput, shippingInfo.state)
        await this.press(data.key.enter)
        await this.clearAndType(selector.customer.cAddress.shippingZipCode, shippingInfo.zipCode)

    }

    // customer ask for warranty
    async sendWarrantyRequest(orderNumber, productName, refund): Promise<void> {
        await this.goToMyAccount()

        await this.click(selector.customer.cMyAccount.orders)
        await this.click(selector.customer.cOrders.ordersWarrantyRequest(orderNumber))

        await this.click(selector.customer.cOrders.warrantyRequestItemCheckbox(productName))
        // await this.type(selector.customer.cOrders.warrantyRequestItemQuantity(productName), refund.itemQuantity)
        await this.select(selector.customer.cOrders.warrantyRequestType, refund.refundRequestType)
        // await this.select(selector.customer.cOrders.warrantyRequestReason, refund.refundRequestReasons)
        await this.type(selector.customer.cOrders.warrantyRequestDetails, refund.refundRequestDetails)
        await this.click(selector.customer.cOrders.warrantySubmitRequest)


        let successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage)
        expect(successMessage).toMatch(refund.refundSubmitSuccessMessage)
    }

}
