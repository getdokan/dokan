import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    optionName: { liveSearch: 'dokan_live_search' },
    liveSearchSettings: {},
    widgetName: 'widget_dokan-live-search-widget',
    widgetValue: {},
    sidebarWidgets: {},
    widgetKey: 'dokan-live-search-widget',
    predefined: {
        simpleProduct: { product1: { name: 'p1_v1 (simple)' } },
        categories: { uncategorized: 'Uncategorized' },
    },
};

export const payloads = {
    moduleIds: { liveSearch: 'live_search' },
    adminAuth: {} as Record<string, string>,
};

export const db = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
    async dispose(): Promise<void> {},
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async activateModules(_m: any, _a: any): Promise<void> {},
    async deactivateModules(_m: any, _a: any): Promise<void> {},
};

export class LiveSearch {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableLiveSearchModule(): Promise<void> {}
    async disableLiveSearchModule(): Promise<void> {}
    async searchByLiveSearch(_name: string, _autoload?: boolean, _category?: string): Promise<void> {}
}
