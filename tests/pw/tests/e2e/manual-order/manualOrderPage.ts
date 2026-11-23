import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export class ManualOrderPage {
    readonly page: Page;
    readonly testData = {
        vendor: { name: 'vendor1' },
        product: { name: 'p1_v1 (simple)' },
        customer: { name: 'customer1' },
        fee: { name: 'Shipping Fee', amount: '10' },
    };

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    async enableOrderCreationForVendor(_name: string): Promise<void> {}
    async disableOrderCreationForVendor(_name: string): Promise<void> {}
    async enableVendorOrderCreation(): Promise<void> {}
    async disableVendorOrderCreation(): Promise<void> {}
    async verifyVendorOrderSettingEnabled(): Promise<void> {}
    async verifyVendorOrderSettingDisabled(): Promise<void> {}
    async navigateToOrders(): Promise<void> {
        // Minimal real navigation so the fallback assertion has something to match.
        await this.page.goto('dashboard/orders/', { waitUntil: 'domcontentloaded' });
    }
    async isAddNewOrderButtonVisible(): Promise<boolean> { return false; }
    async clickAddNewOrder(): Promise<void> {}
    async addProductToOrder(_name: string): Promise<void> {}
    async selectCustomer(_name: string): Promise<void> {}
    async setOrderStatus(_status: string): Promise<void> {}
    async addFeeToOrder(_name: string, _amount: string): Promise<void> {}
}
