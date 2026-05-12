import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const payloads = {
    moduleIds: { minMaxQuantities: 'order_min_max' },
    adminAuth: {} as Record<string, string>,
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async activateModules(_m: any, _a: any): Promise<void> {},
    async deactivateModules(_m: any, _a: any): Promise<void> {},
};

export class MinMaxQuantitiesPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableMinMaxQuantitiesModule(): Promise<void> {}
    async disableMinMaxQuantitiesModule(): Promise<void> {}
}
