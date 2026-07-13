import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    order: { orderStatus: { completed: 'completed' } },
};

export const payloads = {
    vendorAuth: {} as Record<string, string>,
    createOrder: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, any, string]> { return [null, null, '']; }
    async dispose(): Promise<void> {}
}

export class ReportsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminReportsRenderProperly(): Promise<void> {}
    async adminAllLogsRenderProperly(): Promise<void> {}
    async searchAllLogs(_o: string): Promise<void> {}
    async exportAllLogs(): Promise<void> {}
    async filterAllLogs(_v: string, _t: string): Promise<void> {}
}

export class VendorReportsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async vendorReportsRenderProperly(): Promise<void> {}
    async exportStatement(): Promise<void> {}
}
