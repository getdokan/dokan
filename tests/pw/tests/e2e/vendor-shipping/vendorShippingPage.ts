import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    vendor: {
        shipping: {
            shippingPolicy: {} as any,
            shippingMethods: {
                flatRate: {} as any,
                freeShipping: {} as any,
                localPickup: {} as any,
                tableRateShipping: {} as any,
                distanceRateShipping: {} as any,
            },
        },
    },
};

export class VendorShippingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async vendorShippingSettingsRenderProperly(): Promise<void> {}
    async setShippingPolicies(_p: any): Promise<void> {}
    async addShippingMethod(_m: any, _a?: boolean, _b?: boolean): Promise<void> {}
    async deleteShippingMethod(_m: any): Promise<void> {}
}
