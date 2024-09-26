import { Page, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { LoginPage } from '@pages/loginPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor, vendorSetupWizard } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const registrationVendor = selector.vendor.vRegistration;
const setupWizardVendor = selector.vendor.vSetup;
const productsVendor = selector.vendor.product;
const ordersVendor = selector.vendor.orders;
const verificationsVendor = selector.vendor.vVerificationSettings;
const vendorDashboard = selector.vendor.vDashboard;

export class VendorPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    loginPage = new LoginPage(this.page);
    customer = new CustomerPage(this.page);

    // navigation

    async goToMyAccount(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
    }

    async goToVendorDashboard(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // go to order details
    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));
        await this.toContainText(ordersVendor.orderDetails.orderNumber, orderNumber);
    }

    // go to product edit
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.edit.title, productName);
    }

    // open vendor registration form
    async openVendorRegistrationForm() {
        await this.goto(data.subUrls.frontend.myAccount);
        const regIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
        if (!regIsVisible) {
            await this.loginPage.logout();
        }
        await this.focusAndClick(registrationVendor.regVendor);
        await this.waitForVisibleLocator(registrationVendor.firstName);
    }

    // vendor registration
    async vendorRegister(vendorInfo: vendor['vendorInfo'], setupWizardData: vendorSetupWizard): Promise<void> {
        const username = vendorInfo.firstName() + vendorInfo.lastName().replace("'", '');

        await this.goToMyAccount();
        const regIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
        if (!regIsVisible) {
            await this.loginPage.logout();
        }
        await this.clearAndType(registrationVendor.regEmail, username + data.vendor.vendorInfo.emailDomain);
        await this.clearAndType(registrationVendor.regPassword, vendorInfo.password);
        await this.focusAndClick(registrationVendor.regVendor);
        await this.waitForVisibleLocator(registrationVendor.firstName);
        await this.clearAndType(registrationVendor.firstName, username);
        await this.clearAndType(registrationVendor.lastName, vendorInfo.lastName());
        await this.clearAndType(registrationVendor.shopName, vendorInfo.shopName());
        await this.click(registrationVendor.shopUrl);

        // fill address if enabled on registration
        if (vendorInfo.addressFieldsEnabled) {
            await this.clearAndType(registrationVendor.street1, vendorInfo.street1);
            await this.clearAndType(registrationVendor.street2, vendorInfo.street2);
            await this.clearAndType(registrationVendor.city, vendorInfo.city);
            await this.clearAndType(registrationVendor.zipCode, vendorInfo.zipCode);
            await this.selectByValue(registrationVendor.country, vendorInfo.countrySelectValue);
            await this.selectByValue(registrationVendor.state, vendorInfo.stateSelectValue);
        }
        // eu compliance fields
        if (DOKAN_PRO) {
            await this.clearAndType(registrationVendor.companyName, vendorInfo.companyName);
            await this.clearAndType(registrationVendor.companyId, vendorInfo.companyId);
            await this.clearAndType(registrationVendor.vatNumber, vendorInfo.vatNumber);
            await this.clearAndType(registrationVendor.bankName, vendorInfo.bankName);
            await this.clearAndType(registrationVendor.bankIban, vendorInfo.bankIban);
        }
        await this.clearAndType(registrationVendor.phone, vendorInfo.phoneNumber);
        await this.checkIfVisible(selector.customer.cDashboard.termsAndConditions);

        // add subscription pack if enabled
        const subscriptionPackIsVisible = await this.isVisible(registrationVendor.subscriptionPack);
        if (subscriptionPackIsVisible) {
            await this.selectByLabel(registrationVendor.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
        }

        // complete setup wizard if enabled
        if (setupWizardData.setupWizardEnabled) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.setupWizard, registrationVendor.register);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, registrationVendor.register);
        }

        const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);

        if (registrationErrorIsVisible) {
            const hasError = await this.hasText(selector.customer.cWooSelector.wooCommerceError, data.customer.registration.registrationErrorMessage);
            if (hasError) {
                console.log('User already exists!!');
                return;
            }
        }
        if (subscriptionPackIsVisible) await this.customer.placeOrder('bank', false, true, false);
        if (setupWizardData.setupWizardEnabled) await this.vendorSetupWizard(setupWizardData);
    }

    // vendor setup wizard
    async vendorSetupWizard(setupWizardData: vendorSetupWizard): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.setupWizard);

        if (setupWizardData.choice) {
            await this.click(setupWizardVendor.letsGo);
            await this.clearAndType(setupWizardVendor.street1, setupWizardData.street1);
            await this.clearAndType(setupWizardVendor.street2, setupWizardData.street2);
            await this.clearAndType(setupWizardVendor.city, setupWizardData.city);
            await this.clearAndType(setupWizardVendor.zipCode, setupWizardData.zipCode);
            await this.click(setupWizardVendor.country);
            await this.type(setupWizardVendor.countryInput, setupWizardData.country);
            await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.country);
            await this.press(data.key.enter);
            await this.click(setupWizardVendor.state);
            await this.type(setupWizardVendor.stateInput, setupWizardData.state);
            await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.state);
            await this.press(data.key.enter);

            // store categories
            const storeCategoriesEnabled = await this.isVisible(setupWizardVendor.storeCategories);
            if (storeCategoriesEnabled) {
                const allStoreCategories = await this.getMultipleElementTexts(setupWizardVendor.selectedStoreCategories);
                const categoryIsSelected = allStoreCategories.includes('×' + setupWizardData.storeCategory);
                if (!categoryIsSelected) {
                    await this.click(setupWizardVendor.storeCategories);
                    await this.type(setupWizardVendor.storeCategoriesInput, setupWizardData.storeCategory);
                    await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.storeCategory);
                    await this.click(setupWizardVendor.highlightedResult);
                }
            }

            // map
            const geoLocationEnabled = await this.isVisible(setupWizardVendor.map);
            if (geoLocationEnabled) {
                await this.typeAndWaitForResponse(data.subUrls.gmap, setupWizardVendor.map, setupWizardData.mapLocation);
                // await this.press(data.key.arrowDown);
                // await this.press(data.key.enter);
                await this.click(setupWizardVendor.mapResultFirst);
            }

            await this.check(setupWizardVendor.email);
            await this.clickAndWaitForLoadState(setupWizardVendor.continueStoreSetup);

            // payment

            // paypal
            await this.clearAndType(setupWizardVendor.paypal, setupWizardData.paypal());
            // bank transfer
            await this.clearAndType(setupWizardVendor.bankAccountName, setupWizardData.bankAccountName);
            await this.selectByValue(setupWizardVendor.bankAccountType, setupWizardData.bankAccountType);
            await this.clearAndType(setupWizardVendor.bankAccountNumber, setupWizardData.bankAccountNumber);
            await this.clearAndType(setupWizardVendor.bankRoutingNumber, setupWizardData.bankRoutingNumber);
            await this.clearAndType(setupWizardVendor.bankName, setupWizardData.bankName);
            await this.clearAndType(setupWizardVendor.bankAddress, setupWizardData.bankAddress);
            await this.clearAndType(setupWizardVendor.bankIban, setupWizardData.bankIban);
            await this.clearAndType(setupWizardVendor.bankSwiftCode, setupWizardData.bankSwiftCode);
            await this.check(setupWizardVendor.declaration);
            // custom method
            await this.typeIfVisible(setupWizardVendor.customPayment, setupWizardData.customPayment);
            // skrill
            await this.typeIfVisible(setupWizardVendor.skrill, setupWizardData.skrill);
            await this.clickAndWaitForLoadState(setupWizardVendor.continuePaymentSetup);

            // verifications
            if (DOKAN_PRO) {
                const method = await this.getElementText(verificationsVendor.firstVerificationMethod);
                if (method) {
                    await this.click(verificationsVendor.startVerification(method));
                    await this.click(verificationsVendor.uploadFiles(method));
                    await this.uploadMedia(setupWizardData.file);
                    await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.submit(method));
                    await this.toBeVisible(verificationsVendor.requestCreateSuccessMessage);
                    await this.toBeVisible(verificationsVendor.verificationStatus(method, 'pending'));
                }
                await this.click(setupWizardVendor.skipTheStepVerifications);
            }
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, setupWizardVendor.goToStoreDashboard);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, setupWizardVendor.notRightNow);
        }
        await this.toBeVisible(vendorDashboard.menus.primary.dashboard);
    }

    // vendor account details render properly
    async vendorAccountDetailsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);

        const { saveSuccessMessage, ...accountDetails } = selector.vendor.vAccountDetails;
        await this.multipleElementVisible(accountDetails);
    }

    // vendor add vendor details
    async addVendorDetails(vendor: vendor): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);
        await this.clearAndType(selector.vendor.vAccountDetails.firstName, vendor.username);
        await this.clearAndType(selector.vendor.vAccountDetails.lastName, vendor.lastname);
        await this.clearAndType(selector.vendor.vAccountDetails.email, vendor.username + vendor.vendorInfo.emailDomain);
        // await this.updatePassword(vendor.vendorInfo.password, vendor.vendorInfo.password1);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.vendor.vendorInfo.account.updateSuccessMessage);
    }

    // vendor update password
    async updatePassword(currentPassword: string, newPassword: string, saveChanges = false): Promise<void> {
        await this.clearAndType(selector.vendor.vAccountDetails.currentPassword, currentPassword);
        await this.clearAndType(selector.vendor.vAccountDetails.newPassword, newPassword);
        await this.clearAndType(selector.vendor.vAccountDetails.confirmNewPassword, newPassword);
        if (saveChanges) {
            await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
            await expect(this.page.getByText(selector.vendor.vAccountDetails.saveSuccessMessage)).toBeVisible();
        }
    }

    // get total vendor earnings
    async getTotalVendorEarning(): Promise<number> {
        await this.goToVendorDashboard();
        return helpers.price((await this.getElementText(vendorDashboard.atAGlance.earningValue)) as string);
    }

    // get order details vendor
    async getOrderDetails(orderNumber: string): Promise<object> {
        await this.searchOrder(orderNumber);

        const orderDetails = {
            vendorEarning: 0,
            orderNumber: '',
            orderTotalBeforeRefund: 0,
            orderTotal: 0,
            orderStatus: '',
            orderDate: '',
            discount: 0,
            shippingMethod: '',
            shippingCost: 0,
            tax: 0,
            refunded: 0,
        };

        orderDetails.vendorEarning = helpers.price((await this.getElementText(ordersVendor.vendorEarningTable(orderNumber))) as string);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));

        orderDetails.orderNumber = ((await this.getElementText(ordersVendor.orderDetails.orderNumber)) as string).split('#')[1] as string;

        const refundedOrderTotalIsVisible = await this.isVisible(ordersVendor.orderDetails.orderTotalAfterRefund);
        if (refundedOrderTotalIsVisible) {
            orderDetails.orderTotalBeforeRefund = helpers.price((await this.getElementText(ordersVendor.orderDetails.orderTotalBeforeRefund)) as string);
            orderDetails.orderTotal = helpers.price((await this.getElementText(ordersVendor.orderDetails.orderTotalAfterRefund)) as string);
        } else {
            orderDetails.orderTotal = helpers.price((await this.getElementText(ordersVendor.orderDetails.orderTotal)) as string);
        }

        orderDetails.orderStatus = ((await this.getElementText(ordersVendor.status.currentOrderStatus)) as string).replace('-', ' ');

        const orderDate = ((await this.getElementText(ordersVendor.orderDetails.orderDate)) as string)?.split(':')[1]?.trim() as string;
        orderDetails.orderDate = orderDate?.substring(0, orderDate.indexOf(',', orderDate.indexOf(',') + 1));

        const discountIsVisible = await this.isVisible(ordersVendor.orderDetails.discount);
        if (discountIsVisible) {
            orderDetails.discount = helpers.price((await this.getElementText(ordersVendor.orderDetails.discount)) as string);
        }

        const shippingMethodIsVisible = await this.isVisible(ordersVendor.orderDetails.shippingMethod);
        if (shippingMethodIsVisible) {
            orderDetails.shippingCost = helpers.price((await this.getElementText(ordersVendor.orderDetails.shippingCost)) as string);
        }

        const taxIsVisible = await this.isVisible(ordersVendor.orderDetails.tax);
        if (taxIsVisible) {
            orderDetails.tax = helpers.price((await this.getElementText(ordersVendor.orderDetails.tax)) as string);
        }

        const refundIsVisible = await this.isVisible(ordersVendor.orderDetails.refunded);
        if (refundIsVisible) {
            orderDetails.refunded = helpers.price((await this.getElementText(ordersVendor.orderDetails.refunded)) as string);
        }

        // console.log(orderDetails);
        return orderDetails;
    }

    // visit store
    async visitStore(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
        // ensure link suppose to open on new tab
        await this.toHaveAttribute(vendorDashboard.menus.primary.visitStore, 'target', '_blank');
        // force link to open on the same tab
        await this.setAttributeValue(vendorDashboard.menus.primary.visitStore, 'target', '_self');
        await this.click(vendorDashboard.menus.primary.visitStore);
        await expect(this.page).toHaveURL(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)) + '/');
    }

    // search product vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.productLink(productName));
    }

    // search order
    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        await this.clearAndType(ordersVendor.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.search.searchBtn);
        await this.toBeVisible(ordersVendor.orderLink(orderNumber));
        await this.toHaveCount(ordersVendor.numberOfRowsFound, 1);
    }

    // buy product advertisement
    async buyProductAdvertising(productName: string, productType: string, testPage?: any) {
        if (!testPage) {
            await this.searchProduct(productName);
        } else {
            const page = new testPage(this.page);
            if (productType === 'booking') {
                await page.searchBookingProduct(productName);
            } else {
                await page.searchAuctionProduct(productName);
            }
        }
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.buyAdvertisement(productName));
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.confirmAction);
        await this.click(productsVendor.successMessage);
        const orderId = await this.customer.paymentOrder();
        return orderId;
    }

    // assert product advertisement is bought
    async assertProductAdvertisementIsBought(productName: string, productType: string, testPage?: any) {
        let page;
        if (!testPage) {
            await this.searchProduct(productName);
        } else {
            page = new testPage(this.page);
            if (productType === 'booking') {
                await page.searchBookingProduct(productName);
            } else {
                await page.searchAuctionProduct(productName);
            }
        }
        await this.toHaveColor(productsVendor.advertisementStatus(productName), 'rgb(240, 80, 37)'); //todo: grab it from test data, it could be any color
        if (!testPage) {
            await this.goToProductEdit(productName);
        } else {
            page = new testPage(this.page);
            if (productType === 'booking') {
                await page.goToBookingProductEdit(productName);
            } else {
                await page.goToAuctionProductEdit(productName);
            }
        }
        await this.toBeChecked(productsVendor.advertisement.advertiseThisProduct);
        await this.toBeVisible(productsVendor.advertisement.advertisementIsBought);
    }
}
