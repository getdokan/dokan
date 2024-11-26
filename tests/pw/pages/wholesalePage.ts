import { Page, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { customer } from '@utils/interfaces';

// selectors
const wholesaleAdmin = selector.admin.dokan.wholesaleCustomer;
const userInfo = selector.admin.users.userInfo;

export class WholesalePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    loginPage = new LoginPage(this.page);
    customerPage = new CustomerPage(this.page);

    // wholesale customers

    // wholesale customers render properly
    async adminWholesaleCustomersRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.wholeSaleCustomer);

        // wholesale customer text is visible
        await this.toBeVisible(wholesaleAdmin.wholesaleCustomerText);

        // nav tabs are visible
        await this.multipleElementVisible(wholesaleAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(wholesaleAdmin.bulkActions);

        // search wholesale customer input is visible
        await this.toBeVisible(wholesaleAdmin.search);

        // wholesale customer table elements are visible
        await this.multipleElementVisible(wholesaleAdmin.table);
    }

    // search wholesale customer
    async searchWholesaleCustomer(wholesaleCustomer: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.wholeSaleCustomer);
        await this.clearInputField(wholesaleAdmin.search);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.wholesaleCustomers, wholesaleAdmin.search, wholesaleCustomer);
        await this.toHaveCount(wholesaleAdmin.numberOfRows, 1);
        await this.toBeVisible(wholesaleAdmin.wholesaleCustomerCell(wholesaleCustomer));
    }

    // edit wholesale customer
    async editWholesaleCustomer(wholesaleCustomer: customer) {
        await this.searchWholesaleCustomer(wholesaleCustomer.username);
        await this.hover(wholesaleAdmin.wholesaleCustomerCell(wholesaleCustomer.username));
        await this.clickAndWaitForLoadState(wholesaleAdmin.wholesaleCustomerEdit(wholesaleCustomer.username));

        // basic info
        await this.selectByValue(userInfo.role, wholesaleCustomer.customerInfo.role);
        await this.clearAndType(userInfo.firstName, wholesaleCustomer.username);
        await this.clearAndType(userInfo.lastName, wholesaleCustomer.lastname);
        await this.clearAndType(userInfo.nickname, wholesaleCustomer.username);

        // contact info
        await this.clearAndType(userInfo.email, wholesaleCustomer.username + data.customer.customerInfo.emailDomain);

        // About the user
        await this.clearAndType(userInfo.biographicalInfo, wholesaleCustomer.customerInfo.biography);

        // customer address

        // billing
        await this.clearAndType(userInfo.billingAddress.firstName, wholesaleCustomer.username);
        await this.clearAndType(userInfo.billingAddress.lastName, wholesaleCustomer.lastname);
        await this.clearAndType(userInfo.billingAddress.company, wholesaleCustomer.customerInfo.companyName);
        await this.clearAndType(userInfo.billingAddress.address1, wholesaleCustomer.customerInfo.street1);
        await this.clearAndType(userInfo.billingAddress.address2, wholesaleCustomer.customerInfo.street2);
        await this.clearAndType(userInfo.billingAddress.city, wholesaleCustomer.customerInfo.city);
        await this.clearAndType(userInfo.billingAddress.postcode, wholesaleCustomer.customerInfo.zipCode);
        await this.click(userInfo.billingAddress.country);
        await this.clearAndType(userInfo.billingAddress.countryInput, wholesaleCustomer.customerInfo.country);
        await this.press(data.key.enter);
        await this.click(userInfo.billingAddress.state);
        await this.clearAndType(userInfo.billingAddress.stateInput, wholesaleCustomer.customerInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(userInfo.billingAddress.phone, wholesaleCustomer.customerInfo.phone);
        await this.clearAndType(userInfo.billingAddress.email, wholesaleCustomer.username + data.customer.customerInfo.emailDomain);

        // shipping
        await this.clearAndType(userInfo.shippingAddress.firstName, wholesaleCustomer.username);
        await this.clearAndType(userInfo.shippingAddress.lastName, wholesaleCustomer.lastname);
        await this.clearAndType(userInfo.shippingAddress.company, wholesaleCustomer.customerInfo.companyName);
        await this.clearAndType(userInfo.shippingAddress.address1, wholesaleCustomer.customerInfo.street1);
        await this.clearAndType(userInfo.shippingAddress.address2, wholesaleCustomer.customerInfo.street2);
        await this.clearAndType(userInfo.shippingAddress.city, wholesaleCustomer.customerInfo.city);
        await this.clearAndType(userInfo.shippingAddress.postcode, wholesaleCustomer.customerInfo.zipCode);
        await this.click(userInfo.shippingAddress.country);
        await this.clearAndType(userInfo.shippingAddress.countryInput, wholesaleCustomer.customerInfo.country);
        await this.press(data.key.enter);
        await this.click(userInfo.shippingAddress.state);
        await this.clearAndType(userInfo.shippingAddress.stateInput, wholesaleCustomer.customerInfo.state);
        await this.press(data.key.enter);
        await this.clearAndType(userInfo.shippingAddress.phone, wholesaleCustomer.customerInfo.phone);

        // update user
        await this.clickAndWaitForResponse(data.subUrls.backend.user, selector.admin.users.updateUser, 302);
        await this.toContainText(selector.admin.users.updateSuccessMessage, 'User updated.');
    }

    // view wholesale customer orders
    async viewWholesaleCustomerOrders(wholesaleCustomer: string) {
        await this.searchWholesaleCustomer(wholesaleCustomer);
        await this.hover(wholesaleAdmin.wholesaleCustomerCell(wholesaleCustomer));
        await this.clickAndWaitForLoadState(wholesaleAdmin.wholesaleCustomerOrders(wholesaleCustomer));
        await this.notToBeVisible(selector.admin.wooCommerce.orders.noRowsFound);
    }

    // update wholesale customer
    async updateWholesaleCustomer(wholesaleCustomer: string, action: string) {
        await this.searchWholesaleCustomer(wholesaleCustomer);

        switch (action) {
            case 'enable':
                await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.wholesaleCustomers, wholesaleAdmin.statusSlider(wholesaleCustomer));
                break;

            case 'disable':
                await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.wholesaleCustomers, wholesaleAdmin.statusSlider(wholesaleCustomer));
                break;

            case 'delete':
                await this.hover(wholesaleAdmin.wholesaleCustomerCell(wholesaleCustomer));
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.wholesaleCustomers, wholesaleAdmin.wholesaleCustomerRemove(wholesaleCustomer));
                break;

            default:
                break;
        }
    }

    //  wholesale customers bulk action
    async wholesaleCustomerBulkAction(action: string, wholesaleCustomer?: string) {
        if (wholesaleCustomer) {
            await this.searchWholesaleCustomer(wholesaleCustomer);
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.wholeSaleCustomer);
        }

        // ensure row exists
        await this.notToBeVisible(wholesaleAdmin.noRowsFound);

        await this.click(wholesaleAdmin.bulkActions.selectAll);
        await this.selectByValue(wholesaleAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.wholesaleCustomers, wholesaleAdmin.bulkActions.applyAction);
    }

    // customer request to become wholesale customer
    async customerRequestForBecomeWholesaleCustomer(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        await this.click(selector.customer.cDashboard.becomeWholesaleCustomer);
        await this.toContainText(selector.customer.cDashboard.wholesaleRequestReturnMessage, data.wholesale.wholesaleRequestSendMessage);
    }

    // customer become wholesale customer
    async customerBecomeWholesaleCustomer(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        const currentUser = await this.getCurrentUser();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.wholesaleRegister, selector.customer.cDashboard.becomeWholesaleCustomer);
        const neeApproval = await this.isVisible(selector.customer.cDashboard.wholesaleRequestReturnMessage);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        if (!neeApproval) {
            await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.wholesale.becomeWholesaleCustomerSuccessMessage);
        } else {
            await this.toContainText(selector.customer.cDashboard.wholesaleRequestReturnMessage, data.wholesale.wholesaleRequestSendMessage);
            await this.loginPage.switchUser(data.admin);
            await this.updateWholesaleCustomer(currentUser as string, 'enable');
        }
    }

    // view wholesale price
    async viewWholeSalePrice(productName: string, canView = true, productDetails = true) {
        await this.goto(data.subUrls.frontend.shop); // to ensure db changes are reflected
        await this.customerPage.searchProduct(productName);
        if (canView) {
            await this.toBeVisible(selector.customer.cWholesale.shop.wholesalePrice);
            await this.toBeVisible(selector.customer.cWholesale.shop.wholesaleAmount);
        } else {
            await this.notToBeVisible(selector.customer.cWholesale.shop.wholesalePrice);
            await this.notToBeVisible(selector.customer.cWholesale.shop.wholesaleAmount);
        }

        if (productDetails) {
            await this.customerPage.goToProductDetails(productName);
            if (canView) {
                await this.toBeVisible(selector.customer.cWholesale.singleProductDetails.wholesaleInfo);
            } else {
                await this.notToBeVisible(selector.customer.cWholesale.singleProductDetails.wholesaleInfo);
            }
        }
    }

    // assert wholesale price
    async assertWholesalePrice(wholesalePrice: string, minimumWholesaleQuantity: string) {
        const subtotal = Number(helpers.price((await this.getElementText(selector.customer.cCart.cartDetails.cartTotal)) as string));
        const calcSubTotal = helpers.roundToTwo(helpers.subtotal([Number(wholesalePrice)], [Number(minimumWholesaleQuantity)]));
        expect(subtotal).toEqual(calcSubTotal);
    }
}
