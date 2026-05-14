import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    optionName: { menuManager: 'dokan_menu_manager' },
    menuManagerSettings: {
        dashboard_menu_manager: { left_menus: {} as Record<string, { is_switched_on: string }> },
    },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
};

export const db = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
    async dispose(): Promise<void> {},
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async getAllPlugins(_f: any, _a: any): Promise<any[]> { return []; },
};

export class MenuManagerPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async updateMenuStatus(_m: string, _s: string, _k: string, _v: MenuManagerPage): Promise<void> {}
    async renameMenu(_m: string, _n: string, _v: MenuManagerPage): Promise<void> {}
    async cantRenameMenuBeyondLimit(_m: string, _n: string): Promise<void> {}
    async cantRenameMenu(_m: string): Promise<void> {}
    async reorderMenu(_a: string, _b: string): Promise<void> {}
    async cantAlterMenu(_m: string, _store?: boolean): Promise<void> {}
    async resetMenuManagerSettings(_m: string): Promise<void> {}
}
