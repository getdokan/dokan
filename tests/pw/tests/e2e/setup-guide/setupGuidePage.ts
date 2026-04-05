import { Page } from '@playwright/test';

export const data = {
    admin: {} as any,
    installWp: { siteInfo: { url: '' } },
};

export class LoginPage {
    constructor(readonly page: Page) {}
    async adminLogin(_a: any): Promise<void> {}
}

export class AdminDashboardPage {
    constructor(readonly page: Page) {}
    async adminDashboardRenderProperly(): Promise<void> {}
}
