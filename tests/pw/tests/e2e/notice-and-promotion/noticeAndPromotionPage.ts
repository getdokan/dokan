import { Page } from '@playwright/test';

export class NoticeAndPromotionPage {
    constructor(readonly page: Page) {}
    async dokanNoticeRenderProperly(): Promise<void> {}
    async dokanPromotionRenderProperly(): Promise<void> {}
    async dokanProPromotionRenderProperly(): Promise<void> {}
}
