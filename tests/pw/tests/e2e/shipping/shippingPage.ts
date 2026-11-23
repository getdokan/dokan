import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    shipping: {
        zone: () => ({} as any),
        methods: { flatRate: {} as any, freeShipping: {} as any, tableRateShipping: {} as any, distanceRateShipping: {} as any, vendorShipping: {} as any },
    },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    createRandomShippingZone: () => ({} as any),
    addShippingZoneLocation: {} as any,
    addShippingMethodFlatRate: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createShippingZone(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async addShippingZoneLocation(_z: string, _p: any, _a: any): Promise<void> {}
    async deleteShippingZone(_z: string, _a: any): Promise<void> {}
    async shippingMethodExistOrNot(_z: string, _m: string, _a: any): Promise<boolean> { return false; }
    async addShippingZoneMethod(_z: string, _p: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ShippingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableShipping(): Promise<void> {}
    async addShippingZone(_z: any): Promise<void> {}
    async deleteShippingZone(_n: string): Promise<void> {}
    async addShippingMethod(_z: string, _m: any, _edit?: boolean): Promise<void> {}
    async deleteShippingMethod(_z: string, _m: string): Promise<void> {}
}
