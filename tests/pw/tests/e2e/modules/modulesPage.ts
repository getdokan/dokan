import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    moduleStats: {},
    modulesName: { auctionIntegration: 'Auction Integration' },
    moduleCategory: { productManagement: 'Product Management' },
    layout: { list: 'list' },
};

export const payloads = {
    moduleIds: { auction: 'auction' },
    adminAuth: {} as Record<string, string>,
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async deactivateModules(_m: any, _a: any): Promise<void> {},
};

export class ModulesPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminModulesRenderProperly(_stats: any): Promise<void> {}
    async searchModule(_name: string): Promise<void> {}
    async filterModules(_cat: string): Promise<void> {}
    async activateDeactivateModule(_name: string): Promise<void> {}
    async moduleBulkAction(_action: string): Promise<void> {}
    async moduleViewLayout(_layout: string): Promise<void> {}
}
