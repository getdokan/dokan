import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export class VendorBookingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async createVirtualBookingProduct(_d: any): Promise<void> {}
    async deleteBookingProduct(_n: string): Promise<void> {}
}
