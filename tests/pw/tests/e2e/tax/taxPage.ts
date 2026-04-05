import { Page } from '@playwright/test';

export const data = { tax: {} as any };

export class TaxPage {
    constructor(readonly page: Page) {}
    async enableTax(): Promise<void> {}
    async addStandardTaxRate(_t: any): Promise<void> {}
}
