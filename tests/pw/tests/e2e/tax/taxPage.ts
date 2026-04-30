import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = { tax: {} as any };

export class TaxPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableTax(): Promise<void> {}
    async addStandardTaxRate(_t: any): Promise<void> {}
}
