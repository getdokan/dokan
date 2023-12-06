import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class VisualPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // reverse withdrawal modal
    async addReverseWithdrawal() {
        await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);
        await this.click(selector.admin.dokan.reverseWithdraw.addNewReverseWithdrawal);
        await this.toHaveScreenshot(this.page); //todo: fullscreen modal
    }

    // admin add new vendors
    async addVendor() {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.click(selector.admin.dokan.vendors.addNewVendor);
        await this.toHaveScreenshot(this.page);

        await this.click(selector.admin.dokan.vendors.newVendor.addNewVendorCloseModal);
    }

    // store categories render properly
    async adminStoreCategoryRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.click(selector.admin.dokan.vendors.storeCategories);
        const notice = this.getLocator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot(this.page, [notice]);
    }

    // create seller badge
    async createSellerBadge() {
        await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadgeEvent, selector.admin.dokan.sellerBadge.createBadge);
        await this.toHaveScreenshot(this.page);
    }

    // add quote
    async addQuote() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.click(selector.admin.dokan.requestForQuotation.quotesList.newQuote);
        await this.toHaveScreenshot(this.page);
    }

    // add quote
    async addQuoteRule() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
            this.page.locator(selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule).click(),
        ]);
        await this.toHaveScreenshot(this.page);
    }

    async addAnnouncement() {
        await this.goIfNotThere(data.subUrls.backend.dokan.announcements);
        await this.click(selector.admin.dokan.announcements.addNewAnnouncement);
        const notice = this.getLocator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot(this.page, [notice]);
    }

    // modules plan render properly
    async adminModulesPlanRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.click(selector.admin.dokan.modules.pro.modulePlan.upgradePlan);
        await this.toHaveScreenshot(this.page);
    }

    // add new product advertisement
    async addNewProductAdvertisement() {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);
        await this.click(selector.admin.dokan.productAdvertising.addNewProductAdvertising);
        await this.toHaveScreenshot(this.page);
    }

    // dokan menu
    async dokanMenu(locator: string) {
        await this.goIfNotThere(locator);
        const notice = this.getLocator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot(this.page, [notice]);
    }

    // dokan setting menus
    async dokanSettingsMenu(locator: string) {
        await this.goToDokanSettings();
        await this.wait(1);
        const notice = this.getLocator(selector.admin.dokan.notice.noticeDiv);
        await this.click(locator);
        await this.wait(1.5);
        await this.toHaveScreenshot(this.page, [notice]);
    }
}
