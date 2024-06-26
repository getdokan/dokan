import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { StoresPage } from '@pages/storesPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor, eUComplianceData } from '@utils/interfaces';

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const userInfo = selector.admin.users.userInfo;
const vendors = selector.admin.dokan.vendors;
const customerAddress = selector.customer.cAddress;
const singleStoreCustomer = selector.customer.cSingleStore;
const singleProductCustomer = selector.customer.cSingleProduct;

export class EuCompliancePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    storePage = new StoresPage(this.page);

    // admin

    async setDokanEuComplianceSettings(option: string) {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.euComplianceFields);

        // Eu Compliance Settings
        switch (option) {
            case 'euVendor':
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorExtraFieldsCompanyName);
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorExtraFieldsCompanyIdOrEuidNumber);
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorExtraFieldsVatOrTaxNumber);
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorExtraFieldsNameOfBank);
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorExtraFieldsBankIban);
                break;
            case 'euVendorReg':
                await this.enableSwitcher(settingsAdmin.euCompliance.displayInVendorRegistrationForm);
                break;
            case 'euCustomer':
                await this.enableSwitcher(settingsAdmin.euCompliance.customerExtraFieldsCompanyIdOrEuidNumber);
                await this.enableSwitcher(settingsAdmin.euCompliance.customerExtraFieldsVatOrTaxNumber);
                await this.enableSwitcher(settingsAdmin.euCompliance.customerExtraFieldsNameOfBank);
                await this.enableSwitcher(settingsAdmin.euCompliance.customerExtraFieldsBankIban);
                break;
            case 'germanizedSupport':
                await this.enableSwitcher(settingsAdmin.euCompliance.enableGermanizedSupportForVendors);
                break;
            case 'overrideInvoice':
                await this.enableSwitcher(settingsAdmin.euCompliance.vendorsWillBeAbleToOverrideInvoiceNumber);
                break;
            default:
                break;
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.euCompliance.euComplianceFieldsSaveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, data.dokanSettings.euCompliance.saveSuccessMessage);

        switch (option) {
            case 'euVendor':
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorExtraFieldsCompanyName, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorExtraFieldsCompanyIdOrEuidNumber, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorExtraFieldsVatOrTaxNumber, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorExtraFieldsNameOfBank, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorExtraFieldsBankIban, data.colorCode.blue);
                // todo: add more assertions
                break;
            case 'euVendorReg':
                await this.switcherHasColor(settingsAdmin.euCompliance.displayInVendorRegistrationForm, data.colorCode.blue);
                // todo: add more assertions
                break;
            case 'euCustomer':
                await this.switcherHasColor(settingsAdmin.euCompliance.customerExtraFieldsCompanyIdOrEuidNumber, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.customerExtraFieldsVatOrTaxNumber, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.customerExtraFieldsNameOfBank, data.colorCode.blue);
                await this.switcherHasColor(settingsAdmin.euCompliance.customerExtraFieldsBankIban, data.colorCode.blue);
                // todo: add more assertions
                break;
            case 'germanizedSupport':
                await this.switcherHasColor(settingsAdmin.euCompliance.enableGermanizedSupportForVendors, data.colorCode.blue);
                // todo: add more assertions
                break;
            case 'overrideInvoice':
                await this.switcherHasColor(settingsAdmin.euCompliance.vendorsWillBeAbleToOverrideInvoiceNumber, data.colorCode.blue);
                // todo: add more assertions
                break;
            default:
                break;
        }
    }

    // add user EU compliance data
    async addUserEuCompliance(userId: string, euData: eUComplianceData) {
        await this.goIfNotThere(data.subUrls.backend.editUser(userId));
        await this.clearAndType(userInfo.billingAddress.company, euData.companyName!);
        await this.clearAndType(userInfo.billingAddress.companyIdOrEuidNumber, euData.companyId);
        await this.clearAndType(userInfo.billingAddress.vatOrTaxNumber, euData.vatNumber);
        await this.clearAndType(userInfo.billingAddress.bank, euData.bankName);
        await this.clearAndType(userInfo.billingAddress.bankIban, euData.bankIban);

        // update user
        await this.clickAndWaitForResponse(data.subUrls.backend.user, selector.admin.users.updateUser, 302);
        await this.toContainText(selector.admin.users.updateSuccessMessage, 'User updated.');

        await this.toHaveValue(userInfo.billingAddress.company, euData.companyName!);
        await this.toHaveValue(userInfo.billingAddress.companyIdOrEuidNumber, euData.companyId);
        await this.toHaveValue(userInfo.billingAddress.vatOrTaxNumber, euData.vatNumber);
        await this.toHaveValue(userInfo.billingAddress.bank, euData.bankName);
        await this.toHaveValue(userInfo.billingAddress.bankIban, euData.bankIban);
    }

    // edit vendor
    async editVendor(vendor: vendor) {
        await this.storePage.searchVendor(vendor.storeName);

        await this.hover(vendors.vendorRow(vendor.storeName));
        await this.clickAndWaitForLoadState(vendors.vendorEdit(vendor.storeName));

        await this.clearAndType(vendors.editVendor.companyName, vendor.vendorInfo.companyName);
        await this.clearAndType(vendors.editVendor.companyIdEuidNumber, vendor.vendorInfo.companyId);
        await this.clearAndType(vendors.editVendor.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
        await this.clearAndType(vendors.editVendor.nameOfBank, vendor.vendorInfo.bankName);
        await this.clearAndType(vendors.editVendor.bankIban, vendor.vendorInfo.bankIban);

        // update vendor
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
        await this.click(vendors.editVendor.confirmSaveChanges);

        await this.toHaveValue(vendors.editVendor.companyName, vendor.vendorInfo.companyName);
        await this.toHaveValue(vendors.editVendor.companyIdEuidNumber, vendor.vendorInfo.companyId);
        await this.toHaveValue(vendors.editVendor.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
        await this.toHaveValue(vendors.editVendor.nameOfBank, vendor.vendorInfo.bankName);
        await this.toHaveValue(vendors.editVendor.bankIban, vendor.vendorInfo.bankIban);
    }

    // hide vendor EU compliance data
    async hideEuComplianceVendor(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.multipleElementnotVisible(singleStoreCustomer.storeProfile.euComplianceData);
    }

    // customer

    // add or update EU compliance data
    async customerAddEuComplicancedata(euData: eUComplianceData): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.billingAddress);
        await this.clearAndType(customerAddress.billing.billingCompanyID, euData.companyId);
        await this.clearAndType(customerAddress.billing.billingVatOrTaxNumber, euData.vatNumber);
        await this.clearAndType(customerAddress.billing.billingNameOfBank, euData.bankName);
        await this.clearAndType(customerAddress.billing.billingBankIban, euData.bankIban);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.billingAddress, customerAddress.billing.billingSaveAddress, 302);

        await this.goIfNotThere(data.subUrls.frontend.billingAddress);
        await this.toHaveValue(customerAddress.billing.billingCompanyID, euData.companyId);
        await this.toHaveValue(customerAddress.billing.billingVatOrTaxNumber, euData.vatNumber);
        await this.toHaveValue(customerAddress.billing.billingNameOfBank, euData.bankName);
        await this.toHaveValue(customerAddress.billing.billingBankIban, euData.bankIban);
    }

    // view vendor EU compliance data
    async viewVendorEuComplianceData(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.multipleElementVisible(singleStoreCustomer.storeProfile.euComplianceData);
    }

    // view product EU compliance data
    async viewProductEuComplianceData(productName: string) {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        const { deliveryTime, ...euComplianceData } = singleProductCustomer.productDetails.euComplianceData; //todo: skip delivery time for data is not saved via api
        await this.multipleElementVisible(euComplianceData);
    }
}
