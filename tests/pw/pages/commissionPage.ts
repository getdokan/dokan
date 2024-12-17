import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { commission } from '@utils/interfaces';

// selectors
const setupWizardAdmin = selector.admin.dokan.setupWizard;
const settingsAdmin = selector.admin.dokan.settings;
const vendors = selector.admin.dokan.vendors;
const productsAdmin = selector.admin.products;

const productsVendor = selector.vendor.product;
const ordersVendor = selector.vendor.orders;

export class CommissionPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // add commission
    async addCommission(commission: commission) {
        await this.selectByValue(setupWizardAdmin.commissionType, commission.commissionType);
        if (commission.commissionType === 'fixed') {
            // await this.selectByValue(setupWizardAdmin.commissionType, commission.commissionType);

            await this.clearAndType(setupWizardAdmin.percentage, commission.commissionPercentage);
            await this.wait(1); //todo: need to resolve
            await this.clearAndType(setupWizardAdmin.fixed, commission.commissionFixed);
            await this.wait(1);
        } else {
            // await this.selectByValueAndWaitForResponse(data.subUrls.api.dokan.multistepCategories, setupWizardAdmin.commissionType, commission.commissionType);

            if (commission.commissionCategory.allCategory) {
                await this.clearAndType(setupWizardAdmin.categoryPercentage(commission.commissionCategory.category), commission.commissionPercentage);
                await this.wait(1);
                await this.clearAndType(setupWizardAdmin.categoryFixed(commission.commissionCategory.category), commission.commissionFixed);
                await this.wait(1);
            } else {
                const categoryExpanded = await this.isVisible(setupWizardAdmin.expandedCategories);
                if (!categoryExpanded) {
                    await this.click(setupWizardAdmin.expandCategories);
                }
                await this.clearAndType(setupWizardAdmin.categoryPercentageById(commission.commissionCategory.category), commission.commissionPercentage);
                await this.wait(1);
                await this.clearAndType(setupWizardAdmin.categoryFixedById(commission.commissionCategory.category), commission.commissionFixed);
                await this.wait(1);
            }
        }
    }

    // assert commission values
    async assertCommission(commission: commission) {
        if (commission.commissionType === 'fixed') {
            await this.toHaveValue(settingsAdmin.selling.percentage, commission.commissionPercentage);
            await this.toHaveValue(settingsAdmin.selling.fixed, commission.commissionFixed);
        } else {
            if (commission.commissionCategory.allCategory) {
                await this.toHaveValue(settingsAdmin.selling.categoryPercentage(commission.commissionCategory.category), commission.commissionPercentage);
                await this.toHaveValue(settingsAdmin.selling.categoryFixed(commission.commissionCategory.category), commission.commissionFixed);
            } else {
                await this.wait(0.5);
                const categoryExpanded = await this.isVisible(setupWizardAdmin.expandedCategories);
                if (!categoryExpanded) {
                    await this.click(setupWizardAdmin.expandCategories);
                }
                await this.toHaveValue(settingsAdmin.selling.categoryPercentageById(commission.commissionCategory.category), commission.commissionPercentage);
                await this.toHaveValue(settingsAdmin.selling.categoryFixedById(commission.commissionCategory.category), commission.commissionFixed);
            }
        }
    }

    // set commission on dokan setup wizard
    async setCommissionOnDokanSetupWizard(commission: commission) {
        await this.goIfNotThere(data.subUrls.backend.dokan.setupWizard);
        await this.click(setupWizardAdmin.letsGo);
        // skip store setup
        await this.click(setupWizardAdmin.skipThisStep);
        // skip selling setup
        await this.click(setupWizardAdmin.skipThisStep);

        // add commission
        await this.addCommission(commission);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.dokan.setupWizardCommission, setupWizardAdmin.continue, 302);

        // skip withdraw setup
        await this.click(setupWizardAdmin.skipThisStep);

        // recommended
        await this.disableSwitcherSetupWizard(setupWizardAdmin.wooCommerceConversionTracking);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.weMail);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.texty);
        await this.click(setupWizardAdmin.continueRecommended);

        // ready!
        await this.click(setupWizardAdmin.ReturnToTheWordPressDashboard);

        // assert values
        await this.goToDokanSettings();

        if (commission.commissionType === 'fixed') {
            await this.click(settingsAdmin.menus.sellingOptions);
        } else {
            await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.multistepCategories, settingsAdmin.menus.sellingOptions);
        }

        await this.assertCommission(commission);
    }

    // set commission on dokan selling settings
    async setCommissionOnDokanSellingSettings(commission: commission) {
        await this.goToDokanSettings();
        await this.clickAndWaitForLoadState(settingsAdmin.menus.sellingOptions);

        await this.selectByValue(settingsAdmin.selling.commissionType, commission.commissionType);

        // add commission settings
        await this.addCommission(commission);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);

        // assert values
        await this.assertCommission(commission);
    }

    // set commission for vendor
    async setCommissionForVendor(sellerId: string, commission: commission) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.vendorDetailsEdit(sellerId));
        await this.selectByValue(vendors.editVendor.commissionType, commission.commissionType);

        // add commission
        await this.addCommission(commission);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
        await this.click(vendors.editVendor.closeUpdateSuccessModal);

        // assert values
        await this.click(vendors.editVendor.editVendorIcon);
        await this.assertCommission(commission);
    }

    // set commission to product
    async setCommissionForProduct(productId: string, commission: commission) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.wc.productDetails(productId));

        // add commission
        await this.click(productsAdmin.product.subMenus.advanced);
        await this.clearAndType(productsAdmin.product.advanced.commissionPercentage, commission.commissionPercentage);
        await this.wait(1);
        await this.clearAndType(productsAdmin.product.advanced.commissionFixed, commission.commissionFixed);
        await this.wait(1);

        // update product
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, productsAdmin.product.publish);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.updateSuccessMessage);

        // assert values
        await this.click(productsAdmin.product.subMenus.advanced);
        await this.toHaveValue(productsAdmin.product.advanced.commissionPercentage, commission.commissionPercentage);
        await this.toHaveValue(productsAdmin.product.advanced.commissionFixed, commission.commissionFixed);
    }

    // set commission to dokan subscription product
    async setCommissionToDokanSubscriptionProduct(productId: string, commission: commission) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.wc.productDetails(productId));
        await this.click(productsAdmin.product.subMenus.commission);

        // add commission
        await this.addCommission(commission);

        // update product
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, productsAdmin.product.publish);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.updateSuccessMessage);

        // assert values
        await this.click(productsAdmin.product.subMenus.commission);
        await this.assertCommission(commission);
    }

    // view commission metabox
    async viewCommissionMetaBox(orderId: string) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.orderDetails(orderId));

        // metabox elements are visible
        await this.multipleElementVisible(selector.admin.wooCommerce.orders.commissionMetaBox);
    }

    // view suborders metabox
    async viewSubOrdersMetaBox(orderId: string) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.orderDetails(orderId));

        // metabox elements are visible
        await this.multipleElementVisible(selector.admin.wooCommerce.orders.subOrdersMetaBox);
    }

    // view related orders metabox
    async viewRelatedOrdersMetaBox(orderId: string) {
        await this.gotoUntilNetworkidle(data.subUrls.backend.orderDetails(orderId));

        // metabox elements are visible
        await this.multipleElementVisible(selector.admin.wooCommerce.orders.relatedOrdersMetaBox);
    }

    // view commission on product list
    async viewCommissionOnProductList() {
        await this.gotoUntilNetworkidle(data.subUrls.backend.wc.products);
        // commission column & value is visible
        await this.toBeVisible(selector.admin.products.commissionColumn);
        await this.toBeVisible(selector.admin.products.firstRowProductCommission);
    }

    // view commission on order list
    async viewCommissionOnOrderList() {
        await this.gotoUntilNetworkidle(data.subUrls.backend.wc.orders);
        // commission column & value is visible
        await this.toBeVisible(selector.admin.wooCommerce.orders.commissionColumn);
        await this.toBeVisible(selector.admin.wooCommerce.orders.firstRowOrderCommission);
    }

    // vendor view earning on product list
    async vendorViewEarningOnProductList() {
        await this.goto(data.subUrls.frontend.vDashboard.products);

        // earning column & value is visible
        await this.toBeVisible(selector.vendor.product.table.earningColumn);
        await this.toBeVisible(selector.vendor.product.firstRowProductEarning);
    }

    // vendor view earning on add product details
    async vendorViewEarningOnAddProductDetails() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(selector.vendor.product.addNewProduct);
        await this.toBeVisible(selector.vendor.product.earning);
    }

    // vendor view earning on edit product details
    async vendorViewEarningOnEditProductDetails(productName: string) {
        await this.goToProductEdit(productName);
        await this.toBeVisible(selector.vendor.product.earning);
    }

    // vendor view earning on order list
    async vendorViewEarningOnOrderList() {
        await this.goto(data.subUrls.frontend.vDashboard.orders);

        // earning column & value is visible
        await this.toBeVisible(selector.vendor.orders.table.earningColumn);
        await this.toBeVisible(selector.vendor.orders.firstRowOrderEarning);
    }

    // vendor view earning on order list
    async vendorViewEarningOnOrderDetails(orderNumber: string) {
        await this.goToOrderDetails(orderNumber);
        // earning column & value is visible
        await this.toBeVisible(selector.vendor.orders.generalDetails.earningAmount);
    }

    // todo : remove below functions and call from the original class

    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));
        await this.toContainText(ordersVendor.orderDetails.orderNumber, orderNumber);
    }

    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        await this.clearAndType(ordersVendor.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.search.searchBtn);
        await this.toHaveCount(ordersVendor.numberOfRowsFound, 1);
        await this.toBeVisible(ordersVendor.orderLink(orderNumber));
    }

    // go to product edit
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(data.subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.title, productName);
    }

    // search product vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.productLink(productName));
    }
}
