import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    admin: {} as any,
    installWp: { siteInfo: { url: '' } },
};

export class LoginPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminLogin(_a: any): Promise<void> {}
}

export class AdminDashboardPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminDashboardRenderProperly(): Promise<void> {}
}
