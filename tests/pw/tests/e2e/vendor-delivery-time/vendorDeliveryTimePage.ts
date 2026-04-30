import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    vendor: { deliveryTime: {} as any },
    predefined: { simpleProduct: { product1: { name: '' } } },
    deliveryTime: {} as any,
};

export const payloads = {
    moduleIds: { deliveryTime: 'delivery-time' },
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorDeliveryTimePage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableDeliveryTimeModule(): Promise<void> {}
    async disableDeliveryTimeModule(): Promise<void> {}
    async vendorDeliveryTimeRenderProperly(): Promise<void> {}
    async vendorDeliveryTimeSettingsRenderProperly(): Promise<void> {}
    async setDeliveryTimeSettings(_d: any): Promise<void> {}
    async filterDeliveryTime(_t: string): Promise<void> {}
    async updateCalendarView(_v: string): Promise<void> {}
    async addProductToCart(_n: string, _t: string): Promise<void> {}
    async placeOrderWithDeliverTimeStorePickup(_t: string, _d: any): Promise<void> {}
}
