import { test, request, Page } from '@playwright/test';
import { EuCompliancePage } from '@pages/euCompliancePage';
import { StoresPage } from '@pages/storesPage';
import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { VendorPage } from '@pages/vendorPage';
import { ProductsPage } from '@pages/productsPage';
import { CustomerPage } from '@pages/customerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

test.describe('EU Compliance test', () => {
    let admin: EuCompliancePage;
    let vendor: VendorSettingsPage;
    let productsPage: ProductsPage;
    let customer: EuCompliancePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let euProductName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new EuCompliancePage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorSettingsPage(vPage);
        productsPage = new ProductsPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new EuCompliancePage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, , euProductName] = await apiUtils.createProduct(payloads.createProductEuCompliance(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    //admin

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
        const admin = new StoresPage(aPage);
        await admin.addVendor(data.vendor.vendorInfo);
    });

    test('admin can add EU compliance data on user profile (customer) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer(), payloads.adminAuth);
        await admin.addUserEuCompliance(customerId, data.euComplianceData());
    });

    test('admin can update EU compliance data on user profile (customer) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer({ ...payloads.createCustomer(), ...payloads.customerMeta }, payloads.adminAuth);
        await admin.addUserEuCompliance(customerId, data.euComplianceData());
    });

    test('admin can add EU compliance data on user profile (vendor) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.addUserEuCompliance(sellerId, data.euComplianceData());
    });

    test('admin can update EU compliance data on user profile (vendor) edit', { tag: ['@pro', '@admin'] }, async () => {
        const [, sellerId] = await apiUtils.createStore({ ...payloads.createStore(), ...payloads.vendorEuCompliance }, payloads.adminAuth);
        await admin.addUserEuCompliance(sellerId, data.euComplianceData());
    });

    test('admin can update update EU compliance data on vendor profile edit', { tag: ['@pro', '@admin'] }, async () => {
        const admin = new StoresPage(aPage);
        await admin.editVendor(VENDOR_ID, data.vendor);
    });

    test('admin can hide vendors EU compliance data from single store page', { tag: ['@pro', '@admin'] }, async () => {
        const [previousSettings] = await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, dbData.testData.dokan.hideVendorEuInfo);
        await admin.hideEuComplianceVendor(data.predefined.vendorStores.vendor1);
        // reset
        await dbUtils.setOptionValue(dbData.dokan.optionName.appearance, previousSettings);
    });

    // vendor

    test('vendor can add EU compliance data on store settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'euCompliance');
    });

    test('vendor can add EU compliance data on registration', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const vendor = new VendorPage(page);
        await vendor.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
    });

    test('vendor can update EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'company-info');
    });

    test.skip('vendor can add product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await productsPage.addProductEuCompliance(productName, data.product.productInfo.euCompliance);
    });

    test.skip('vendor can update product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await productsPage.addProductEuCompliance(euProductName, data.product.productInfo.euCompliance);
    });

    // customer

    test('customer can add EU Compliance data on billing address', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerAddEuComplianceData(data.euComplianceData());
    });

    test('customer can update EU compliance data', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerAddEuComplianceData(data.euComplianceData());
    });

    test('customer can add EU compliance data (vendor) while become a vendor', { tag: ['@pro', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.customerRegister(data.customer.customerInfo);
        await customer.customerBecomeVendor(data.customer.customerInfo);
    });

    test('customer can view vendor EU compliance data on single store page', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewVendorEuComplianceData(data.predefined.vendorStores.vendor1);
    });

    test.skip('customer can view product EU compliance data on single product page', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewProductEuComplianceData(euProductName);
    });

    // todo: has more tests with product eu compliance data
});
