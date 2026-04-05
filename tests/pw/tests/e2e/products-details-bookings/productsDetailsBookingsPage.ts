import { Page } from '@playwright/test';

export class VendorBookingPage {
    constructor(readonly page: Page) {}
    async createVirtualBookingProduct(_d: any): Promise<void> {}
    async deleteBookingProduct(_n: string): Promise<void> {}
}
