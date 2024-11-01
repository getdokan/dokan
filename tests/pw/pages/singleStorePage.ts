import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const singleStoreCustomer = selector.customer.cSingleStore;

export class SingleStorePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // single store

    // single store render properly
    async singleStoreRenderProperly(storeName: string) {
        // todo: update for other layouts
        await this.gotoSingleStore(storeName);

        // store profile elements are visible
        const { verifiedIcon, verifiedIconByIcon, euComplianceData, ...storeProfile } = singleStoreCustomer.storeProfile;
        await this.multipleElementVisible(storeProfile);

        // store tab elements are visible
        if (!DOKAN_PRO) {
            await this.toBeVisible(singleStoreCustomer.storeTabs.products);
            // await this.toBeVisible(singleStoreCustomer.storeTabs.toc); // todo: need vendor toc
        } else {
            const { toc, chatNow, ...storeTabs } = singleStoreCustomer.storeTabs;
            await this.multipleElementVisible(storeTabs);

            // eu compliance data is visible
            await this.multipleElementVisible(singleStoreCustomer.storeProfile.euComplianceData);
        }

        // search elements are visible
        await this.multipleElementVisible(singleStoreCustomer.search);

        // sortby element is visible
        await this.toBeVisible(singleStoreCustomer.sortBy);

        // store products are visible
        await this.toBeVisible(singleStoreCustomer.storeProducts);

        // product card elements are visible
        await this.notToHaveCount(singleStoreCustomer.productCard.card, 0);
        await this.notToHaveCount(singleStoreCustomer.productCard.productDetailsLink, 0);
        await this.notToHaveCount(singleStoreCustomer.productCard.productTitle, 0);
        await this.notToHaveCount(singleStoreCustomer.productCard.productPrice, 0);
        await this.notToHaveCount(singleStoreCustomer.productCard.addToCart, 0);

        // store social icons are visible
        await this.multipleElementVisible(singleStoreCustomer.storeSocialIcons);
    }

    // sort products on single store
    async singleStoreSortProducts(storeName: string, sortBy: string) {
        await this.gotoSingleStore(storeName);
        await this.selectByValueAndWaitForResponseAndLoadState(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), singleStoreCustomer.sortBy, sortBy);
        await this.notToHaveCount(singleStoreCustomer.productCard.card, 0);
    }

    // search product on single store
    async singleStoreSearchProduct(storeName: string, productName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.clearAndType(singleStoreCustomer.search.input, productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), singleStoreCustomer.search.button);
        await this.toContainText(singleStoreCustomer.productCard.productTitle, productName);
    }

    // store open close
    async storeOpenCloseTime(storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.hover(singleStoreCustomer.storeTime.storeTimeDropDown);

        await this.toBeVisible(singleStoreCustomer.storeTime.storeTimeDiv);
        await this.toBeVisible(singleStoreCustomer.storeTime.storeTimeHeading);

        await this.toHaveCount(singleStoreCustomer.storeTime.storeDays, 7);
        await this.toHaveCount(singleStoreCustomer.storeTime.storeTimes, 7);
    }

    // store terms and condition
    async storeTermsAndCondition(storeName: string, toc: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), singleStoreCustomer.storeTabs.toc);
        await this.toContainText(singleStoreCustomer.toc.tocContent, toc);
    }

    // store share
    async storeShare(storeName: string, site: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.click(singleStoreCustomer.storeTabs.share);
        await this.forceLinkToSameTab(singleStoreCustomer.sharePlatForms[site as keyof typeof singleStoreCustomer.sharePlatForms]);
        await this.clickAndWaitForUrl(new RegExp('.*' + site + '.*'), singleStoreCustomer.sharePlatForms[site as keyof typeof singleStoreCustomer.sharePlatForms]);
    }
}
