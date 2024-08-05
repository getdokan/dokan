import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const vendorDashboard = selector.vendor.vDashboard;
const vendorSubscription = selector.vendor.vSubscription;
const registrationVendor = selector.vendor.vRegistration;
const storeList = selector.customer.cStoreList;
const shopCustomer = selector.customer.cShop;
const customerDashboard = selector.customer.cDashboard;
const requestForQuotationCustomer = selector.customer.cRequestForQuote;

export class ShortcodePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // create page with shortcode
    async createPageWithShortcode(pageTitle: string, shortcode: string) {
        await this.goto(data.subUrls.backend.addNewPage, 'domcontentloaded');
        const isModalVisible = await this.isVisible(selector.admin.pages.closeModal);
        if (isModalVisible) {
            await this.click(selector.admin.pages.closeModal);
        }

        await this.clearAndType(selector.admin.pages.addTitle, pageTitle);
        await this.click(selector.admin.pages.contentPlaceholder);
        await this.clearAndType(selector.admin.pages.addContent, shortcode);

        await this.click(selector.admin.pages.publish);
        await this.clickAndWaitForResponse(data.subUrls.api.wp.pages, selector.admin.pages.publishFromPanel);
        await this.toBeVisible(selector.admin.pages.publishMessage);
    }

    // view dashboard
    async viewDashboard(link: string) {
        await this.goto(link);

        // at a glance elements are visible
        await this.multipleElementVisible(vendorDashboard.atAGlance);

        // graph elements are visible
        await this.multipleElementVisible(vendorDashboard.graph);

        // orders elements are visible
        await this.multipleElementVisible(vendorDashboard.orders);

        // products elements are visible
        await this.multipleElementVisible(vendorDashboard.products);

        if (DOKAN_PRO) {
            // profile progress elements are visible
            await this.multipleElementVisible(vendorDashboard.profileProgress);

            // reviews elements are visible
            await this.multipleElementVisible(vendorDashboard.reviews);

            // announcement elements are visible
            await this.multipleElementVisible(vendorDashboard.announcement);
        }
    }

    // view dokan subscription packs
    async viewDokanSubscriptionPacks(link: string) {
        await this.goto(link);

        const noSubscriptionPacks = await this.isVisible(vendorSubscription.noSubscriptionMessage);

        if (noSubscriptionPacks) {
            await this.toContainText(vendorSubscription.noSubscriptionMessage, 'No subscription pack has been found!');
            console.log('No subscription pack found!');
        } else {
            await this.toBeVisible(vendorSubscription.dokanSubscriptionDiv);
            await this.toBeVisible(vendorSubscription.dokanSubscriptionProductContainer);

            await this.notToHaveCount(vendorSubscription.dokanSubscriptionProduct, 0);
            await this.notToHaveCount(vendorSubscription.dokanSubscriptionProductPrice, 0);
            await this.notToHaveCount(vendorSubscription.dokanSubscriptionProductContent, 0);
            await this.notToHaveCount(vendorSubscription.dokanSubscriptionProductBuyButton, 0);
        }
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

    // view best selling products
    async viewBestSellingProducts(link: string) {
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

    // view top rated products
    async topRatedProducts(link: string) {
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
        await this.goto(link);

        // map elements are visible
        if (DOKAN_PRO) {
            const { storeOnMap, ...map } = storeList.map;
            await this.multipleElementVisible(map);
        }

        // store filter elements are visible
        const { filterDetails, ...filters } = storeList.filters;
        await this.multipleElementVisible(filters);

        // click filter button to view filter details
        await this.click(storeList.filters.filterButton);

        // store filter detail elements are visible
        if (!DOKAN_PRO) {
            await this.toBeVisible(storeList.filters.filterDetails.searchVendor);
            await this.toBeVisible(storeList.filters.filterDetails.apply);
        } else {
            const { rating, ...filterDetails } = storeList.filters.filterDetails;
            await this.multipleElementVisible(filterDetails);
        }

        // store card elements are visible
        await this.notToHaveCount(storeList.storeCard.storeCardDiv, 0);

        // card header
        await this.notToHaveCount(storeList.storeCard.storeCardHeader, 0);
        await this.notToHaveCount(storeList.storeCard.storeBanner, 0);

        // card content
        await this.notToHaveCount(storeList.storeCard.storeCardContent, 0);
        await this.notToHaveCount(storeList.storeCard.storeData, 0);

        // card footer
        await this.notToHaveCount(storeList.storeCard.storeCardFooter, 0);
        await this.notToHaveCount(storeList.storeCard.storeAvatar, 0);
        await this.notToHaveCount(storeList.storeCard.visitStore, 0);
        if (DOKAN_PRO) {
            await this.notToHaveCount(storeList.storeCard.followUnFollowButton, 0);
        }
    }

    // view my orders
    async viewMyOrders(link: string) {
        await this.goto(link);

        const noOrders = await this.isVisible(selector.customer.cMyOrders.noOrdersFound);

        if (noOrders) {
            await this.toContainText(selector.customer.cMyOrders.noOrdersFound, 'No orders found!');
            console.log('No orders found on my order page');
        } else {
            // recent orders text is visible
            await this.toBeVisible(selector.customer.cMyOrders.recentOrdersText);

            // my orders table elements are visible
            await this.multipleElementVisible(selector.customer.cMyOrders.table);
        }
    }

    // view request quote
    async viewRequestQuote(link: string) {
        await this.goto(link);

        const noQuote = await this.isVisible(requestForQuotationCustomer.requestForQuote.noQuotesFound);

        if (noQuote) {
            await this.toContainText(requestForQuotationCustomer.requestForQuote.noQuotesFound, 'Your quote is currently empty.');
            console.log('No quotes found on request for quote page');
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.returnToShop);
        } else {
            // quote item table details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteItemDetails.table);

            // quote total details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteTotals);

            // update quote is visible
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.updateQuote);
        }
    }
}
