import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const vendors = selector.admin.dokan.vendors;
const userInfo = selector.admin.users.userInfo;

export class StoresPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // vendors

    // vendors render properly
    async adminVendorsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        // vendor text is visible
        await this.toBeVisible(vendors.vendorsText);

        // and new vendor  is visible
        await this.toBeVisible(vendors.addNewVendor);

        // nav tabs are visible
        await this.multipleElementVisible(vendors.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(vendors.bulkActions);

        // search vendor input is visible
        await this.toBeVisible(vendors.search);

        // vendor table elements are visible
        const { categoryColumn, ...table } = vendors.table;
        await this.multipleElementVisible(table);
    }

    // view vendor details
    async viewVendorDetails(storeName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendorDetails(storeName));

        // profile info elements are visible
        const { featuredVendor, storeRating, storeCategory, ...profileInfo } = vendors.vendorDetails.profileInfo;
        await this.multipleElementVisible(profileInfo);

        // profile banner elements are visible
        await this.multipleElementVisible(vendors.vendorDetails.profileBanner);

        // badges acquired elements are visible
        const badgesAcquired = await this.isVisible(vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
        if (badgesAcquired) {
            await this.toBeVisible(vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
        }

        // product & revenue elements are visible
        await this.toBeVisible(vendors.vendorDetails.vendorSummary.productRevenue.productRevenueSection);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.products);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.revenue);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.others);

        // vendor info elements are visible
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.vendorInfo);
    }

    // email vendor
    async emailVendor(storeName: string, email: vendor['vendorInfo']['sendEmail']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendorDetails(storeName));

        await this.click(vendors.vendorDetails.profileInfo.sendEmail);

        await this.clearAndType(vendors.vendorDetails.sendEmail.subject, email.subject);
        await this.clearAndType(vendors.vendorDetails.sendEmail.message, email.message);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.vendorDetails.sendEmail.sendEmail);
    }

    // admin add new vendors
    async addVendor(vendorInfo: vendor['vendorInfo']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        const firstName = vendorInfo.firstName();
        const email = vendorInfo.email();
        const shopName = vendorInfo.shopName();
        const username = firstName + vendorInfo.nanoid;

        // add new vendor
        await this.click(vendors.addNewVendor);

        // account info
        await this.clearAndType(vendors.newVendor.firstName, firstName);
        await this.clearAndType(vendors.newVendor.lastName, vendorInfo.lastName());
        await this.clearAndType(vendors.newVendor.storeName, shopName);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.storeUrl, shopName);
        await this.clearAndType(vendors.newVendor.phoneNumber, vendorInfo.phoneNumber);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.email, email);
        await this.click(vendors.newVendor.generatePassword);
        await this.clearAndType(vendors.newVendor.password, vendorInfo.password);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.username, username);

        // eu compliance data
        if (DOKAN_PRO) {
            await this.clearAndType(vendors.newVendor.companyName, vendorInfo.companyName);
            await this.clearAndType(vendors.newVendor.companyIdEuidNumber, vendorInfo.companyId);
            await this.clearAndType(vendors.newVendor.vatOrTaxNumber, vendorInfo.vatNumber);
            await this.clearAndType(vendors.newVendor.nameOfBank, vendorInfo.bankName);
            await this.clearAndType(vendors.newVendor.bankIban, vendorInfo.bankIban);
        }

        await this.click(vendors.newVendor.next);
        await this.click(vendors.newVendor.address); // added to avoid flakiness

        // address
        await this.waitForVisibleLocator(vendors.newVendor.street1);
        await this.clearAndType(vendors.newVendor.street1, vendorInfo.street1);
        await this.clearAndType(vendors.newVendor.street2, vendorInfo.street2);
        await this.clearAndType(vendors.newVendor.city, vendorInfo.city);
        await this.clearAndType(vendors.newVendor.zip, vendorInfo.zipCode);
        await this.click(vendors.newVendor.country);
        await this.type(vendors.newVendor.countryInput, vendorInfo.country);
        await this.press(data.key.enter);
        await this.click(vendors.newVendor.state);
        await this.type(vendors.newVendor.stateInput, vendorInfo.state);
        await this.press(data.key.enter);

        await this.click(vendors.newVendor.next);
        await this.click(vendors.newVendor.paymentOptions); // added to avoid flakiness

        // payment options
        await this.clearAndType(vendors.newVendor.accountName, vendorInfo.accountName);
        await this.clearAndType(vendors.newVendor.accountNumber, vendorInfo.accountNumber);
        await this.selectByValue(vendors.newVendor.accountType, vendorInfo.accountType);
        await this.clearAndType(vendors.newVendor.bankName, vendorInfo.bankName);
        await this.clearAndType(vendors.newVendor.bankAddress, vendorInfo.bankAddress);
        await this.clearAndType(vendors.newVendor.routingNumber, vendorInfo.routingNumber);
        await this.clearAndType(vendors.newVendor.iban, vendorInfo.iban);
        await this.clearAndType(vendors.newVendor.swift, vendorInfo.swiftCode);
        await this.clearAndType(vendors.newVendor.payPalEmail, vendorInfo.email());

        await this.check(vendors.newVendor.enableSelling);
        await this.check(vendors.newVendor.publishProductDirectly);
        await this.check(vendors.newVendor.makeVendorFeature);

        // create vendor
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.createVendor);
        await this.toContainText(vendors.sweetAlertTitle, 'Vendor Created');
        await this.click(vendors.closeSweetAlert);
    }

    // edit vendor
    async editVendor(vendor: vendor) {
        await this.searchVendor(vendor.storeName);

        await this.hover(vendors.vendorRow(vendor.storeName));
        await this.clickAndWaitForLoadState(vendors.vendorEdit(vendor.storeName));

        if (!DOKAN_PRO) {
            // basic info
            await this.selectByValue(userInfo.role, vendor.vendorInfo.role);
            await this.clearAndType(userInfo.firstName, vendor.username);
            await this.clearAndType(userInfo.lastName, vendor.lastname);
            await this.clearAndType(userInfo.nickname, vendor.username);

            // contact info
            await this.clearAndType(userInfo.email, vendor.username + data.vendor.vendorInfo.emailDomain);

            // About the user
            await this.clearAndType(userInfo.biographicalInfo, vendor.vendorInfo.biography);

            // vendor address

            // billing
            await this.clearAndType(userInfo.billingAddress.firstName, vendor.username);
            await this.clearAndType(userInfo.billingAddress.lastName, vendor.lastname);
            await this.clearAndType(userInfo.billingAddress.company, vendor.vendorInfo.companyName);
            await this.clearAndType(userInfo.billingAddress.address1, vendor.vendorInfo.street1);
            await this.clearAndType(userInfo.billingAddress.address2, vendor.vendorInfo.street2);
            await this.clearAndType(userInfo.billingAddress.city, vendor.vendorInfo.city);
            await this.clearAndType(userInfo.billingAddress.postcode, vendor.vendorInfo.zipCode);
            await this.click(userInfo.billingAddress.country);
            await this.clearAndType(userInfo.billingAddress.countryInput, vendor.vendorInfo.country);
            await this.press(data.key.enter);
            await this.click(userInfo.billingAddress.state);
            await this.clearAndType(userInfo.billingAddress.stateInput, vendor.vendorInfo.state);
            await this.press(data.key.enter);
            await this.clearAndType(userInfo.billingAddress.phone, vendor.vendorInfo.phoneNumber);
            await this.clearAndType(userInfo.billingAddress.email, vendor.username + data.vendor.vendorInfo.emailDomain);

            // pro edit user
            // await this.clearAndType(userInfo.billingAddress.companyIdOrEuidNumber, vendor.vendorInfo.companyId);
            // await this.clearAndType(userInfo.billingAddress.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
            // await this.clearAndType(userInfo.billingAddress.bank, vendor.vendorInfo.bankName);
            // await this.clearAndType(userInfo.billingAddress.bankIban, vendor.vendorInfo.bankIban);

            // shipping
            await this.clearAndType(userInfo.shippingAddress.firstName, vendor.username);
            await this.clearAndType(userInfo.shippingAddress.lastName, vendor.lastname);
            await this.clearAndType(userInfo.shippingAddress.company, vendor.vendorInfo.companyName);
            await this.clearAndType(userInfo.shippingAddress.address1, vendor.vendorInfo.street1);
            await this.clearAndType(userInfo.shippingAddress.address2, vendor.vendorInfo.street2);
            await this.clearAndType(userInfo.shippingAddress.city, vendor.vendorInfo.city);
            await this.clearAndType(userInfo.shippingAddress.postcode, vendor.vendorInfo.zipCode);
            await this.click(userInfo.shippingAddress.country);
            await this.clearAndType(userInfo.shippingAddress.countryInput, vendor.vendorInfo.country);
            await this.press(data.key.enter);
            await this.click(userInfo.shippingAddress.state);
            await this.clearAndType(userInfo.shippingAddress.stateInput, vendor.vendorInfo.state);
            await this.press(data.key.enter);
            await this.clearAndType(userInfo.shippingAddress.phone, vendor.vendorInfo.phoneNumber);

            // dokan options
            await this.clearAndType(userInfo.dokanOptions.storeName, vendor.vendorInfo.storeName);
            await this.clearAndType(userInfo.dokanOptions.storeUrl, vendor.vendorInfo.storeName);
            // store address
            await this.clearAndType(userInfo.dokanOptions.address1, vendor.vendorInfo.street1);
            await this.clearAndType(userInfo.dokanOptions.address2, vendor.vendorInfo.street2);
            await this.clearAndType(userInfo.dokanOptions.city, vendor.vendorInfo.city);
            await this.clearAndType(userInfo.dokanOptions.postcode, vendor.vendorInfo.zipCode);
            await this.click(userInfo.dokanOptions.country);
            await this.clearAndType(userInfo.dokanOptions.countryInput, vendor.vendorInfo.country);
            await this.press(data.key.enter);
            await this.click(userInfo.dokanOptions.state);
            await this.clearAndType(userInfo.dokanOptions.stateInput, vendor.vendorInfo.state);
            await this.press(data.key.enter);
            await this.clearAndType(userInfo.dokanOptions.phone, vendor.vendorInfo.phoneNumber);

            // pro edit user
            // await this.clearAndType(userInfo.dokanOptions.companyName, vendor.vendorInfo.companyName);
            // await this.clearAndType(userInfo.dokanOptions.companyIdOrEuidNumber, vendor.vendorInfo.companyId);
            // await this.clearAndType(userInfo.dokanOptions.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
            // await this.clearAndType(userInfo.dokanOptions.bank, vendor.vendorInfo.bankName);
            // await this.clearAndType(userInfo.dokanOptions.bankIban, vendor.vendorInfo.bankIban);

            // social profiles
            await this.clearAndType(userInfo.dokanOptions.facebook, vendor.vendorInfo.socialProfileUrls.facebook);
            await this.clearAndType(userInfo.dokanOptions.twitter, vendor.vendorInfo.socialProfileUrls.twitter);
            await this.clearAndType(userInfo.dokanOptions.pinterest, vendor.vendorInfo.socialProfileUrls.pinterest);
            await this.clearAndType(userInfo.dokanOptions.linkedin, vendor.vendorInfo.socialProfileUrls.linkedin);
            await this.clearAndType(userInfo.dokanOptions.youtube, vendor.vendorInfo.socialProfileUrls.youtube);
            await this.clearAndType(userInfo.dokanOptions.instagram, vendor.vendorInfo.socialProfileUrls.instagram);
            await this.clearAndType(userInfo.dokanOptions.flickr, vendor.vendorInfo.socialProfileUrls.flickr);

            // other settings
            await this.check(userInfo.dokanOptions.selling);
            await this.check(userInfo.dokanOptions.publishing);
            await this.check(userInfo.dokanOptions.featuredVendor);

            // update user
            await this.clickAndWaitForResponse(data.subUrls.backend.user, selector.admin.users.updateUser, 302);
            await this.toContainText(selector.admin.users.updateSuccessMessage, 'User updated.');
        } else {
            // basic
            await this.clearAndType(vendors.editVendor.firstName, vendor.username);
            await this.clearAndType(vendors.editVendor.lastName, vendor.lastname);
            await this.clearAndType(vendors.editVendor.storeName, vendor.vendorInfo.storeName);
            await this.clearAndType(vendors.editVendor.phoneNumber, vendor.vendorInfo.phone);
            await this.clearAndType(vendors.editVendor.email, vendor.username + data.vendor.vendorInfo.emailDomain);
            if (DOKAN_PRO) {
                await this.clearAndType(vendors.editVendor.companyName, vendor.vendorInfo.companyName);
                await this.clearAndType(vendors.editVendor.companyIdEuidNumber, vendor.vendorInfo.companyId);
                await this.clearAndType(vendors.editVendor.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
                await this.clearAndType(vendors.editVendor.nameOfBank, vendor.vendorInfo.bankName);
                await this.clearAndType(vendors.editVendor.bankIban, vendor.vendorInfo.bankIban);
            }

            // address
            await this.clearAndType(vendors.editVendor.street1, vendor.vendorInfo.street1);
            await this.clearAndType(vendors.editVendor.street2, vendor.vendorInfo.street2);
            await this.clearAndType(vendors.editVendor.city, vendor.vendorInfo.city);
            await this.clearAndType(vendors.editVendor.zipCode, vendor.vendorInfo.zipCode);
            await this.click(vendors.editVendor.country);
            await this.clearAndType(vendors.editVendor.countryInput, vendor.vendorInfo.country);
            await this.press(data.key.enter);
            await this.click(vendors.editVendor.state);
            await this.clearAndType(vendors.editVendor.stateInput, vendor.vendorInfo.state);
            await this.press(data.key.enter);

            // social options
            await this.clearAndType(vendors.editVendor.facebook, vendor.vendorInfo.socialProfileUrls.facebook);
            await this.clearAndType(vendors.editVendor.flickr, vendor.vendorInfo.socialProfileUrls.flickr);
            await this.clearAndType(vendors.editVendor.twitter, vendor.vendorInfo.socialProfileUrls.twitter);
            await this.clearAndType(vendors.editVendor.youtube, vendor.vendorInfo.socialProfileUrls.youtube);
            await this.clearAndType(vendors.editVendor.linkedin, vendor.vendorInfo.socialProfileUrls.linkedin);
            await this.clearAndType(vendors.editVendor.pinterest, vendor.vendorInfo.socialProfileUrls.pinterest);
            await this.clearAndType(vendors.editVendor.instagram, vendor.vendorInfo.socialProfileUrls.instagram);

            // payment options
            // bank
            await this.clearAndType(vendors.editVendor.accountName, vendor.vendorInfo.payment.bankAccountName);
            await this.clearAndType(vendors.editVendor.accountNumber, vendor.vendorInfo.payment.bankAccountNumber);
            await this.selectByValue(vendors.editVendor.accountType, vendor.vendorInfo.payment.bankAccountType);
            await this.clearAndType(vendors.editVendor.bankName, vendor.vendorInfo.payment.bankName);
            await this.clearAndType(vendors.editVendor.bankAddress, vendor.vendorInfo.payment.bankAddress);
            await this.clearAndType(vendors.editVendor.routingNumber, vendor.vendorInfo.payment.bankRoutingNumber);
            await this.clearAndType(vendors.editVendor.iban, vendor.vendorInfo.payment.bankIban);
            await this.clearAndType(vendors.editVendor.swift, vendor.vendorInfo.payment.bankSwiftCode);

            // paypal
            await this.clearAndType(vendors.editVendor.payPalEmail, vendor.vendorInfo.payment.email());

            // other settings
            await this.enableSwitcher(vendors.editVendor.enableSelling);
            await this.enableSwitcher(vendors.editVendor.publishProductDirectly);
            await this.enableSwitcher(vendors.editVendor.makeVendorFeature);

            await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
            await this.click(vendors.editVendor.closeUpdateSuccessModal);
        }
    }

    // search vendor
    async searchVendor(vendorName: string, neg: boolean = false) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.clearInputField(vendors.search);
        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.stores, vendors.search, vendorName);
        await this.toHaveCount(vendors.numberOfRows, 1);
        await this.toBeVisible(vendors.vendorCell(vendorName));

        // negative scenario
        if (neg) {
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.search, vendorName + 'abcdefgh');
            await this.toBeVisible(vendors.noRowsFound);
        }
    }

    // update vendor
    async updateVendor(vendorName: string, action: string) {
        await this.searchVendor(vendorName);

        switch (action) {
            case 'enable':
                await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.statusSlider(vendorName));
                break;

            case 'disable':
                await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.statusSlider(vendorName));
                break;

            default:
                break;
        }
    }

    // view vendor orders, products
    async viewVendor(vendorName: string, action: string) {
        await this.searchVendor(vendorName);

        await this.removeAttribute(vendors.vendorRowActions(vendorName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(vendors.vendorRow(vendorName));

        switch (action) {
            case 'products':
                await this.clickAndWaitForLoadState(vendors.vendorProducts(vendorName));
                await this.notToHaveText(selector.admin.products.numberOfRowsFound, '0 items');
                await this.notToBeVisible(selector.admin.products.noRowsFound);
                break;

            case 'orders':
                await this.clickAndWaitForLoadState(vendors.vendorOrders(vendorName));
                await this.notToHaveText(selector.admin.wooCommerce.orders.numberOfRowsFound, '0 items');
                await this.notToBeVisible(selector.admin.wooCommerce.orders.noRowsFound);
                break;

            default:
                break;
        }
    }

    // vendor bulk action
    async vendorBulkAction(action: string, vendorName?: string) {
        if (vendorName) {
            await this.searchVendor(vendorName);
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        }

        // ensure row exists
        await this.notToBeVisible(vendors.noRowsFound);

        await this.click(vendors.bulkActions.selectAll);
        await this.selectByValue(vendors.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.bulkActions.applyAction);
    }
}
