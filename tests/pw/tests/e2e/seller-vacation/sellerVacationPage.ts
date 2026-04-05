import { Page } from '@playwright/test';

export const payloads = {
    moduleIds: { sellerVacation: 'seller_vacation' },
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class SellerVacationPage {
    constructor(readonly page: Page) {}
    async enableSellerVacationModule(): Promise<void> {}
    async disableSellerVacationModule(): Promise<void> {}
}
