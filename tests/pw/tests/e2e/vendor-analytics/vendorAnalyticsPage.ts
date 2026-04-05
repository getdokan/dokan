import { Page } from '@playwright/test';

export const payloads = {
    moduleIds: { vendorAnalytics: 'vendor_analytics' },
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorAnalyticsPage {
    constructor(readonly page: Page) {}
    async enableVendorAnalyticsModule(): Promise<void> {}
    async disableVendorAnalyticsModule(): Promise<void> {}
    async vendorAnalyticsRenderProperly(): Promise<void> {}
}
