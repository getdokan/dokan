import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { simpleProduct: { product1: { name: '' } } },
};

export class ShopPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async shopRenderProperly(): Promise<void> {}
    async sortProducts(_s: string): Promise<void> {}
    async searchProduct(_n: string): Promise<void> {}
    async filterProducts(_t: string, _v: string): Promise<void> {}
    async productOnMap(): Promise<void> {}
    async goToProductDetailsFromShop(_n: string): Promise<void> {}
}
