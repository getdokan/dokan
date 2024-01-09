import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

export class StoreAppearance extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async disableMapOnStoreSidebar(storeName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(selector.customer.cSingleStore.storeMap);
    }

    async disableStoreOpenCloseTimeOnStoreSidebar(storeName: string) {
        await this.goto(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(selector.customer.cSingleStore.storeOpenCloseTime);
    }
    
    async disableVendorInfoOnSingleStorePage(storeName: string) {
        await this.goto(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.notToBeVisible(selector.customer.cSingleStore.storeOpenCloseTime);
    }
}
