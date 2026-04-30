import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    storeList: { sort: '', layout: { list: '' } },
};

export class StoreListingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async storeListRenderProperly(): Promise<void> {}
    async sortStores(_s: string): Promise<void> {}
    async storeViewLayout(_l: string): Promise<void> {}
    async searchStore(_s: string): Promise<void> {}
    async filterStores(_t: string, _v?: string): Promise<void> {}
    async storeOnMap(): Promise<void> {}
    async goToSingleStoreFromStoreListing(_v: string): Promise<void> {}
}
