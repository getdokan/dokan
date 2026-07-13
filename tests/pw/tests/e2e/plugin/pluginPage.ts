import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    plugin: {
        pluginList: { dokanLite: 'dokan-lite', dokanPro: 'dokan-pro' },
        pluginName: { dokanLite: 'Dokan', dokanPro: 'Dokan Pro' },
    },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async getSinglePlugin(_slug: string, _a: any): Promise<[any, any, string]> { return [null, null, 'active']; }
    async updatePlugin(_slug: string, _b: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class PluginPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async activatePlugin(_name: string): Promise<void> {}
    async deactivateDokanPlugin(_name: string, _withReason: boolean): Promise<void> {}
    async deletePlugin(_name: string): Promise<void> {}
}
