import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { LoginPage } from '@pages/loginPage';
import { VendorPage } from '@pages/vendorPage';
import { OrdersPage } from '@pages/ordersPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

export class SettingPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    loginPage = new LoginPage(this.page);
    vendorPage = new VendorPage(this.page);
    ordersPage = new OrdersPage(this.page);

    // navigation

    async goToMyAccount(): Promise<void> {
        await this.goto(data.subUrls.frontend.myAccount);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goto(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // general settings

    async vendorStoreUrlSetting(storeName: string, storeUrl: string) {
        // previous url
        await this.goto(data.subUrls.frontend.vendorDetails(storeName));
        await this.toBeVisible(selector.frontend.pageNotFound);

        // new url
        await this.goto(`${storeUrl}/${storeName}`);
        await this.toBeVisible(selector.customer.cSingleStore.singleStoreDiv);
    }

    async vendorSetupWizardLogoAndMessageSetting(logoUrl: string, setupWizardMessage: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.setupWizard);
        await this.toHaveAttribute(selector.vendor.vSetup.setupLogoImage, 'src', logoUrl);
        await this.toContainText(selector.vendor.vSetup.setupWizardContent, setupWizardMessage);
    }

    async disableVendorSetupWizardSetting() {
        await this.vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, setupWizardEnabled: false, choice: false });
        await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
    }

    async setStoreTermsAndConditions(status: string) {
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        if (status == 'on') {
            await this.toBeVisible(selector.vendor.vStoreSettings.termsAndConditions);
            await this.toBeVisible(selector.vendor.vStoreSettings.termsAndConditionsIframe);
        } else {
            await this.notToBeVisible(selector.vendor.vStoreSettings.termsAndConditions);
            await this.notToBeVisible(selector.vendor.vStoreSettings.termsAndConditionsIframe);
        }
    }

    async setStoreProductsPerPage(storeName: string, count: number) {
        await this.goto(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.toHaveCount(selector.customer.cSingleStore.productCard.card, count);
    }

    async enableAddressFieldsOnRegistration(status: string) {
        await this.vendorPage.openVendorRegistrationForm();
        if (status == 'on') {
            await this.toBeVisible(selector.vendor.vRegistration.street1);
            await this.toBeVisible(selector.vendor.vRegistration.street2);
            await this.toBeVisible(selector.vendor.vRegistration.city);
            await this.toBeVisible(selector.vendor.vRegistration.zipCode);
            await this.toBeVisible(selector.vendor.vRegistration.country);
        } else {
            await this.notToBeVisible(selector.vendor.vRegistration.street1);
            await this.notToBeVisible(selector.vendor.vRegistration.street2);
            await this.notToBeVisible(selector.vendor.vRegistration.city);
            await this.notToBeVisible(selector.vendor.vRegistration.zipCode);
            await this.notToBeVisible(selector.vendor.vRegistration.country);
        }
    }

    async enableStoreTermsAndConditionsOnRegistration(status: string) {
        await this.vendorPage.openVendorRegistrationForm();
        status == 'on' ? await this.toBeVisible(selector.customer.cDashboard.termsAndConditions) : await this.notToBeVisible(selector.customer.cDashboard.termsAndConditions);
    }

    async setShowVendorInfo(productName: string, status: string) {
        await this.goToProductDetails(productName);
        if (status == 'on') {
            await this.toBeVisible(selector.customer.cSingleProduct.menus.vendorInfo);
            await this.click(selector.customer.cSingleProduct.menus.vendorInfo);
            await this.multipleElementVisible(selector.customer.cSingleProduct.vendorInfo);
        } else {
            await this.notToBeVisible(selector.customer.cSingleProduct.menus.vendorInfo);
        }
    }

    async enableMoreProductsTab(productName: string, status: string) {
        await this.goToProductDetails(productName);
        if (status == 'on') {
            await this.click(selector.customer.cSingleProduct.menus.moreProducts);
            const hasMoreProducts = await this.isVisible(selector.customer.cSingleProduct.moreProducts.moreProductsDiv);
            if (hasMoreProducts) {
                await this.toBeVisible(selector.customer.cSingleProduct.moreProducts.moreProductsDiv);
                await this.notToHaveCount(selector.customer.cSingleProduct.moreProducts.product, 0);
            } else {
                await this.toContainText(selector.customer.cSingleProduct.moreProducts.noProductsDiv, 'No product has been found!');
            }
        } else {
            await this.notToBeVisible(selector.customer.cSingleProduct.menus.moreProducts);
        }
    }

    // selling settings

    async enableVendorSelling(status: string) {
        await this.vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
        if (status == 'on') {
            await this.notToBeVisible(selector.vendor.vDashboard.dokanAlert);
        } else {
            await this.toBeVisible(selector.vendor.vDashboard.dokanAlert);
            await this.toContainText(selector.vendor.vDashboard.dokanAlert, 'Error! Your account is not enabled for selling, please contact the admin');
        }
    }

    async setOrderStatusChangeCapability(orderNumber: string, status: string): Promise<void> {
        await this.ordersPage.goToOrderDetails(orderNumber);
        if (status == 'on') {
            await this.toBeVisible(selector.vendor.orders.status.edit);
        } else {
            await this.notToBeVisible(selector.vendor.orders.status.edit);
        }
    }
}
