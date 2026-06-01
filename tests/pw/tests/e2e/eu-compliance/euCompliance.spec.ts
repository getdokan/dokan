import { test, Page } from '@utils/test';
import path from 'path';
import {
    EuCompliancePage,
    StoresPage,
    VendorSettingsPage,
    VendorPage,
    ProductsPage,
    CustomerPage,
    api,
    db,
    data,
    dbData,
    payloads,
} from './euCompliancePage';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { VENDOR_ID } = process.env;

test.describe('EU Compliance test', () => {
    let admin: EuCompliancePage;
    let vendor: VendorSettingsPage;
    let productsPage: ProductsPage;
    let customer: EuCompliancePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let productName: string;
    let euProductName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new EuCompliancePage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorSettingsPage(vPage);
        productsPage = new ProductsPage(vPage);

        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new EuCompliancePage(cPage);

        await api.init();
        [, , productName] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, , euProductName] = await api.createProduct(payloads.createProductEuCompliance(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await api.activateModules(payloads.moduleIds.euCompliance, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await api.dispose();
        await db.dispose();
    });

    // admin

    test('admin can enable EU compliance fields module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableEuComplianceFieldsModule();
    });

    test('admin can enable EU compliance fields for vendors', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings('euVendor');
    });

    test('admin can enable EU compliance fields on vendor registration', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings('euVendorReg');
    });

    test('admin can enable EU compliance fields for customers', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings('euCustomer');
    });

    test('admin can enable germanized support for vendors', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings('germanizedSupport');
    });

    test('admin can enable override invoice number permission for vendors', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings('overrideInvoice');
    });

    test('admin can add EU compliance data while adding a vendor', { tag: ['@pro', '@admin'] }, async () => {
        const adminStores = new StoresPage(aPage);
        await adminStores.addVendor(data.vendor.vendorInfo);
    });

    test('admin can add EU compliance data on user profile (customer) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, customerId] = await api.createCustomer(payloads.createCustomer(), payloads.adminAuth);
        await admin.addUserEuCompliance(customerId, data.euComplianceData());
    });

    test('admin can update EU compliance data on user profile (customer) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, customerId] = await api.createCustomer({ ...payloads.createCustomer(), ...payloads.customerMeta }, payloads.adminAuth);
        await admin.addUserEuCompliance(customerId, data.euComplianceData());
    });

    test('admin can add EU compliance data on user profile (vendor) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, sellerId] = await api.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.addUserEuCompliance(sellerId, data.euComplianceData());
    });

    test('admin can update EU compliance data on user profile (vendor) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, sellerId] = await api.createStore({ ...payloads.createStore(), ...payloads.vendorEuCompliance }, payloads.adminAuth);
        await admin.addUserEuCompliance(sellerId, data.euComplianceData());
    });

    test('admin can update update EU compliance data on vendor profile edit', { tag: ['@pro', '@admin'] }, async () => {
        const adminStores = new StoresPage(aPage);
        await adminStores.editVendor(VENDOR_ID, data.vendor);
    });

    test('admin can hide vendors EU compliance data from single store page', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(dbData.dokan.optionName.appearance, { hide_vendor_info: dbData.testData.dokan.hideVendorEuInfo });
        await admin.hideEuComplianceVendor(data.predefined.vendorStores.vendor1);

        // reset
        await db.updateOptionValue(dbData.dokan.optionName.appearance, { hide_vendor_info: dbData.testData.dokan.unhideVendorEuInfo });
    });

    // vendor

    test('vendor can add EU compliance data on store settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'euCompliance');
    });

    test('vendor can add EU compliance data on registration', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const vendorLocal = new VendorPage(page);
        await vendorLocal.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
    });

    test('vendor can update EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'company-info');
    });

    // KEEP skipped: ProductsPage.addProductEuCompliance is an unimplemented stub (no real UI flow).
    test.skip('vendor can add product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await productsPage.addProductEuCompliance(productName, data.product.productInfo.euCompliance);
    });

    // KEEP skipped: ProductsPage.addProductEuCompliance is an unimplemented stub (no real UI flow).
    test.skip('vendor can update product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await productsPage.addProductEuCompliance(euProductName, data.product.productInfo.euCompliance);
    });

    // KEEP skipped: ProductsPage.addProductEuCompliance is an unimplemented stub (no real UI flow).
    test.skip('vendor can remove product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await productsPage.addProductEuCompliance(productName, { ...data.product.productInfo.euCompliance, productUnits: '', basePriceUnits: '', freeShipping: false, regularUnitPrice: '', saleUnitPrice: '', optionalMiniDescription: '' });
    });

    // customer

    test('customer can add EU Compliance data on billing address', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerAddEuComplianceData(data.euComplianceData());
    });

    test('customer can update EU compliance data', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerAddEuComplianceData(data.euComplianceData());
    });

    test('customer can add EU compliance data (vendor) while become a vendor', { tag: ['@pro', '@customer'] }, async ({ page }) => {
        const customerLocal = new CustomerPage(page);
        await customerLocal.customerRegister(data.customer.customerInfo);
        await customerLocal.customerBecomeVendor(data.customer.customerInfo);
    });

    test('customer can view vendor EU compliance data on single store page', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewVendorEuComplianceData(data.predefined.vendorStores.vendor1);
    });

    // KEEP skipped: viewProductEuComplianceData only navigates and no-ops; depends on the unimplemented product EU compliance flow.
    test.skip('customer can view product EU compliance data on single product page', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewProductEuComplianceData(euProductName);
    });

    // todo: has more tests with product eu compliance data

    // admin

    test('admin can disable EU compliance fields module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.euCompliance, payloads.adminAuth);
        await admin.disableEuComplianceFieldsModule();
    });
});
