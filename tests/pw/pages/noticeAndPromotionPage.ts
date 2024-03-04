import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

export class NoticeAndPromotionPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // dokan notice & promotion

    // dokan notice
    async dokanNoticeRenderProperly() {
        await this.goto(data.subUrls.backend.dokan.dokan);

        // dokan notice elements are visible
        const isPromotionVisible = await this.isVisible(selector.admin.dokan.promotion.promotion);
        isPromotionVisible ? await this.notToHaveCount(selector.admin.dokan.notice.noticeDiv1, 0) : await this.notToHaveCount(selector.admin.dokan.notice.noticeDiv, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.slider, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.sliderPrev, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.sliderNext, 0);
    }

    // dokan promotion
    async dokanPromotionRenderProperly() {
        await this.goto(data.subUrls.backend.dokan.dokan);
        // dokan promotion elements are visible
        const isPromotionVisible = await this.isVisible(selector.admin.dokan.promotion.promotion);
        if (isPromotionVisible) {
            await this.multipleElementVisible(selector.admin.dokan.promotion);
        } else {
            console.log('No promotion is ongoing');
        }
    }

    // dokan pro promotion
    async dokanProPromotionRenderProperly() {
        // dokan promo banner
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

        const isProPromotionVisible = await this.isVisible(selector.admin.dokan.promoBanner.promoBanner);
        if (isProPromotionVisible) {
            // promo banner elements are visible
            await this.multipleElementVisible(selector.admin.dokan.promoBanner);
        } else {
            console.log('No Pro promotion exists');
        }

        // dokan lite modules
        await this.goIfNotThere(data.subUrls.backend.dokan.liteModules);

        // pro upgrade popup elements are visible
        await this.multipleElementVisible(selector.admin.dokan.modules.lite.popup);

        // module cards are visible
        await this.click(selector.admin.dokan.modules.lite.popup.closeDokanUpgradePopup);
        await this.toBeVisible(selector.admin.dokan.modules.lite.moduleText);
        await this.toHaveCount(selector.admin.dokan.modules.lite.moduleCard, 27);

        // dokan pro features menu
        await this.goIfNotThere(data.subUrls.backend.dokan.proFeatures);

        // dokan pro feature sections are visible
        await this.multipleElementVisible(selector.admin.dokan.proFeatures);

        // dokan settings pro advertisement
        await this.goToDokanSettings();

        // settings pro advertisement banner elements are visible
        await this.multipleElementVisible(selector.admin.dokan.settings.proAdvertisementBanner);
    }
}
