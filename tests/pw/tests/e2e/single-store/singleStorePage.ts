import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' }, simpleProduct: { product1: { name: '' } } },
    vendor: { toc: '' },
    storeShare: { facebook: '' },
};

export class SingleStorePage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async singleStoreRenderProperly(_v: string): Promise<void> {}
    async storeOpenCloseTime(_v: string): Promise<void> {}
    async singleStoreSearchProduct(_v: string, _p: string): Promise<void> {}
    async singleStoreSortProducts(_v: string, _s: string): Promise<void> {}
    async storeTermsAndCondition(_v: string, _t: string): Promise<void> {}
    async storeShare(_v: string, _p: string): Promise<void> {}
}
