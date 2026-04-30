import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { simpleProduct: { product1: { name: '' } } },
    rma: { requestWarranty: {} as any },
};

export const payloads = {
    moduleIds: { rma: 'rma' },
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class CustomerPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async addProductToCartFromSingleProductPage(_n: string): Promise<void> {}
    async goToCheckout(): Promise<void> {}
    async paymentOrder(): Promise<string> { return ''; }
}

export class OrdersPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async updateOrderStatusOnTable(_id: string, _s: string): Promise<void> {}
}

export class VendorReturnRequestPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableRmaModule(): Promise<void> {}
    async disableRmaModule(): Promise<void> {}
    async vendorReturnRequestRenderProperly(): Promise<void> {}
    async vendorRmaSettingsRenderProperly(): Promise<void> {}
    async vendorViewRmaDetails(_id: string): Promise<void> {}
    async customerSendRmaMessage(_id: string, _m: string): Promise<void> {}
    async vendorSendRmaMessage(_id: string, _m: string): Promise<void> {}
    async vendorUpdateRmaStatus(_id: string, _s: string): Promise<void> {}
    async vendorRmaRefund(_id: string, _n: string, _s: string): Promise<void> {}
    async vendorDeleteRmaRequest(_id: string): Promise<void> {}
    async customerReturnRequestRenderProperly(): Promise<void> {}
    async customerRequestWarranty(_id: string, _n: string, _w: any): Promise<void> {}
}
