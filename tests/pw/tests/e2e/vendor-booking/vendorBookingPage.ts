import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    product: {
        booking: {
            productName: () => '',
            resource: { resourceName: () => '' } as any,
        } as any,
    },
    bookings: {} as any,
    customer: { username: '' },
};

export const payloads = {
    moduleIds: { booking: 'booking' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createBookableProduct: () => ({} as any),
};

export const dbData = {
    testData: { dokan: { rmaSettings: {} as any } },
};

export const dbUtils = {
    async setUserMeta(_v: any, _k: string, _v2: any, _b: boolean): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createBookableProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class BookingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableBookingModule(): Promise<void> {}
    async disableBookingModule(): Promise<void> {}
    async adminAddBookingProduct(_p: any): Promise<void> {}
    async vendorBookingRenderProperly(): Promise<void> {}
    async vendorManageBookingRenderProperly(): Promise<void> {}
    async vendorBookingCalendarRenderProperly(): Promise<void> {}
    async vendorManageResourcesRenderProperly(): Promise<void> {}
    async addBookingProduct(_p: any): Promise<void> {}
    async editBookingProduct(_p: any): Promise<void> {}
    async viewBookingProduct(_n: string): Promise<void> {}
    async cantBuyOwnBookingProduct(_n: string): Promise<void> {}
    async searchBookingProduct(_n: string): Promise<void> {}
    async duplicateBookingProduct(_n: string): Promise<void> {}
    async filterBookingProducts(_t: string, _v: string): Promise<void> {}
    async deleteBookingProduct(_n: string): Promise<void> {}
    async addBookingResource(_n: string): Promise<void> {}
    async editBookingResource(_r: any): Promise<void> {}
    async deleteBookingResource(_n: string): Promise<void> {}
    async addBooking(_n: string, _b: any, _u?: string): Promise<void> {}
    async buyBookableProduct(_n: string, _b: any): Promise<void> {}
}
