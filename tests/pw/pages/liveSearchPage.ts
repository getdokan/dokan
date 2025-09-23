import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const liveSearchCustomer = selector.customer.cLiveSearch;

export class LiveSearch extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // enable live search module
    async enableLiveSearchModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.toBeVisible(selector.admin.dokan.settings.menus.liveSearch);

        // my account
        await this.goto(data.subUrls.frontend.myAccount);
        await this.toBeVisible(liveSearchCustomer.liveSearchDiv);
    }

    // disable live search module
    async disableLiveSearchModule() {
        // dokan settings
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.settings, { waitUntil: 'domcontentloaded' }, true);
        await this.notToBeVisible(selector.admin.dokan.settings.menus.liveSearch);

        // my account
        await this.goto(data.subUrls.frontend.myAccount);
        await this.notToBeVisible(liveSearchCustomer.liveSearchDiv);
    }

    async searchByLiveSearch(productName: string, autoload = false, categoryName?: string) {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.myAccount);

        if (!autoload) {
            if (categoryName) await this.selectByValueAndWaitForResponse(data.subUrls.ajax, liveSearchCustomer.liveSearchCategory, categoryName.toLowerCase());
            await this.fill(liveSearchCustomer.liveSearchInput, productName); // to reduce type time
            await this.typeByPageAndWaitForResponse(data.subUrls.ajax, liveSearchCustomer.liveSearchInput, ' ', 200, false);
            await this.toBeVisible(liveSearchCustomer.searchedResult(productName));
            if (categoryName) await this.toBeVisible(liveSearchCustomer.searchResultWithCategory(productName, categoryName));
        } else {
            if (categoryName) await this.selectByValueAndWaitForLoadState(liveSearchCustomer.liveSearchCategory, categoryName.toLowerCase());
            await this.fill(liveSearchCustomer.liveSearchInput, productName); // to reduce type time
            await this.typeByPageAndWaitForLoadState(liveSearchCustomer.liveSearchInput, ' ', false);
            await this.toBeVisible(selector.customer.cShop.productTitleByName(productName));
        }
    }
}
