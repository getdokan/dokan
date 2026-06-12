import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    product: { auction: { productName: () => '' } as any },
    date: { dateRange: {} as any },
    customer: { username: '' },
};

export const payloads = {
    moduleIds: { auction: 'auction' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createAuctionProduct: () => ({} as any),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class AuctionsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableAuctionIntegrationModule(): Promise<void> {}
    async disableAuctionIntegrationModule(): Promise<void> {}
    async adminAddAuctionProduct(_p: any): Promise<void> {}
    async vendorAuctionRenderProperly(): Promise<void> {}
    async addAuctionProduct(_p: any): Promise<void> {}
    async editAuctionProduct(_p: any): Promise<void> {}
    async viewAuctionProduct(_n: string): Promise<void> {}
    async cantBidOwnProduct(_n: string): Promise<void> {}
    async searchAuctionProduct(_n: string): Promise<void> {}
    async duplicateAuctionProduct(_n: string): Promise<void> {}
    async deleteAuctionProduct(_n: string): Promise<void> {}
    async vendorAuctionActivityRenderProperly(): Promise<void> {}
    async filterAuctionActivity(_d: any): Promise<void> {}
    async searchAuctionActivity(_u: string): Promise<void> {}
    async bidAuctionProduct(_n: string): Promise<void> {}
    async buyAuctionProduct(_n: string): Promise<void> {}
}
