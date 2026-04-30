import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export class NoticeAndPromotionPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async dokanNoticeRenderProperly(): Promise<void> {}
    async dokanPromotionRenderProperly(): Promise<void> {}
    async dokanProPromotionRenderProperly(): Promise<void> {}
}
