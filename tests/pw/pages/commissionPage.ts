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

export class CommissionPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // add commission
    async addCommission(commission: commission) {
        await this.selectByValue(setupWizardAdmin.commissionType, commission.commissionType);
        if (commission.commissionType === 'fixed') {
            await this.clearAndType(setupWizardAdmin.percentage, commission.commissionPercentage);
            await this.clearAndType(setupWizardAdmin.fixed, commission.commissionFixed);
        } else {
            if (commission.commissionCategory.allCategory) {
                await this.clearAndType(setupWizardAdmin.categoryPercentage(commission.commissionCategory.category), commission.commissionPercentage);
                await this.clearAndType(setupWizardAdmin.categoryFixed(commission.commissionCategory.category), commission.commissionFixed);
            } else {
                const categoryExpanded = await this.isVisible(setupWizardAdmin.expandedCategories);
                if (!categoryExpanded) await this.clickIfVisible(setupWizardAdmin.expandCategories);
                await this.clearAndType(setupWizardAdmin.categoryPercentageById(commission.commissionCategory.category), commission.commissionPercentage);
                await this.clearAndType(setupWizardAdmin.categoryFixedById(commission.commissionCategory.category), commission.commissionFixed);
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
                const categoryExpanded = await this.isVisible(setupWizardAdmin.expandedCategories);
                if (!categoryExpanded) await this.clickIfVisible(setupWizardAdmin.expandCategories);
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

        await this.click(setupWizardAdmin.continue);

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
        await this.click(settingsAdmin.menus.sellingOptions);
        await this.assertCommission(commission);
    }

    // set commission on dokan selling settings
    async setCommissionOnDokanSellingSettings(commission: commission) {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.sellingOptions);

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
        await this.goto(data.subUrls.backend.dokan.vendorDetailsEdit(sellerId));
        // await this.click(vendors.editVendor.editVendorIcon);

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
        await this.goto(data.subUrls.backend.wc.productDetails(productId));

        // add commission
        await this.click(productsAdmin.product.subMenus.advanced);
        await this.clearAndType(productsAdmin.product.advanced.commissionPercentage, commission.commissionPercentage);
        await this.clearAndType(productsAdmin.product.advanced.commissionFixed, commission.commissionFixed);

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
        await this.goto(data.subUrls.backend.wc.productDetails(productId));

        // add commission
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
}
