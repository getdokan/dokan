import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { VendorSubscriptionsPage } from '@pages/vendorSubscriptionsPage';
import { VendorDashboardPage } from '@pages/vendorDashboardPage';
import { StoreListingPage } from '@pages/storeListingPage';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const registrationVendor = selector.vendor.vRegistration;
const shopCustomer = selector.customer.cShop;
const customerDashboard = selector.customer.cDashboard;

export class ShortcodePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    vendorDashboardPage = new VendorDashboardPage(this.page);
    vendorSubscriptionsPage = new VendorSubscriptionsPage(this.page);
    storeListingPage = new StoreListingPage(this.page);
    myOrdersPage = new MyOrdersPage(this.page);
    requestForQuotationsPage = new RequestForQuotationsPage(this.page);

    async closeBlockEditorModal() {
        try {
            await this.toBeVisible(selector.admin.pages.blockEditorModal, { timeout: 5000 });
            await this.click(selector.admin.pages.closeModal);
            console.log('Modal is visible');
        } catch (error) {
            /* empty */
        }
    }

    // create a page with shortcode
    async createPageWithShortcode(pageTitle: string, shortcode: string) {
        await this.goto(data.subUrls.backend.addNewPage);
        await this.closeBlockEditorModal();

        await this.click(selector.admin.pages.addTitle);
        await this.type(selector.admin.pages.addTitle, pageTitle);
        await this.click(selector.admin.pages.contentPlaceholder);
        await this.clearAndType(selector.admin.pages.addContent, shortcode);

        await this.click(selector.admin.pages.publish);
        await this.clickAndWaitForResponse(data.subUrls.api.wp.pages, selector.admin.pages.publishFromPanel);
        await this.toBeVisible(selector.admin.pages.publishMessage);
    }

    // view dashboard
    async viewDashboard(link: string) {
        await this.vendorDashboardPage.vendorDashboardRenderProperly(link);
    }

    async viewDokanSubscriptionPacks(link: string) {
        await this.vendorSubscriptionsPage.vendorSubscriptionsRenderProperly(link);
    }

    // view vendor registration
    async viewVendorRegistrationForm(link: string) {
        await this.goto(link);

        await this.toBeVisible(registrationVendor.firstName);
        await this.toBeVisible(registrationVendor.lastName);
        await this.toBeVisible(registrationVendor.regEmail);
        await this.toBeVisible(registrationVendor.phone);
        await this.toBeVisible(registrationVendor.regPassword);
        await this.toBeVisible(registrationVendor.shopName);
        await this.toBeVisible(registrationVendor.shopUrl);

        // eu compliance fields
        if (DOKAN_PRO) {
            await this.toBeVisible(registrationVendor.companyName);
            await this.toBeVisible(registrationVendor.companyId);
            await this.toBeVisible(registrationVendor.vatNumber);
            await this.toBeVisible(registrationVendor.bankName);
            await this.toBeVisible(registrationVendor.bankIban);
        }
        await this.toBeVisible(registrationVendor.registerDokanButton);
    }

    // view  best selling/ top rated products
    async viewProducts(link: string) {
        await this.goto(link);

        const productCount = await this.getElementCount(shopCustomer.productCard.card);
        if (productCount) {
            // product card elements are visible
            await this.notToHaveCount(shopCustomer.productCard.card, 0);
            await this.notToHaveCount(shopCustomer.productCard.productDetailsLink, 0);
            await this.notToHaveCount(shopCustomer.productCard.productTitle, 0);
            await this.notToHaveCount(shopCustomer.productCard.productPrice, 0);
            await this.notToHaveCount(shopCustomer.productCard.addToCart, 0);
        }
    }

    // view customer migration form
    async viewMigrationForm(link: string) {
        await this.goto(link);
        // vendor registration form
        await this.toBeVisible(customerDashboard.firstName);
        await this.toBeVisible(customerDashboard.lastName);
        await this.toBeVisible(customerDashboard.shopName);
        await this.toBeVisible(customerDashboard.shopUrl);
        await this.toBeVisible(customerDashboard.phone);

        if (DOKAN_PRO) {
            await this.toBeVisible(customerDashboard.companyName);
            await this.toBeVisible(customerDashboard.companyId);
            await this.toBeVisible(customerDashboard.vatNumber);
            await this.toBeVisible(customerDashboard.bankName);
            await this.toBeVisible(customerDashboard.bankIban);
            await this.toBeVisible(customerDashboard.becomeAVendor);
        }
    }

    // view geolocation filter form
    async viewGeolocationFilterForm(link: string) {
        await this.goto(link);

        const { radiusSlider, ...filters } = shopCustomer.filters;
        await this.multipleElementVisible(filters);
    }

    // view stores
    async viewStores(link: string) {
        await this.storeListingPage.storeListRenderProperly(link);
    }

    // view my orders
    async viewMyOrders(link: string) {
        await this.myOrdersPage.myOrdersRenderProperly(link);
    }

    // view request quote
    async viewRequestQuote(link: string) {
        await this.requestForQuotationsPage.requestForQuoteRenderProperly(link);
    }
}
