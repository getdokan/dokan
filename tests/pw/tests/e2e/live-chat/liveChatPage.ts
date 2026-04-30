import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    optionName: { liveChat: 'dokan_live_chat' },
    liveChatSettings: {},
    predefined: {
        vendorInfo: { shopName: 'vendor1store' },
        simpleProduct: { product1: { name: 'p1_v1 (simple)' } },
        customerInfo: { username1: 'customer1' },
    },
    nanoIdRandom: () => Math.random().toString(36).slice(2, 10),
};

export const payloads = {
    moduleIds: { liveChat: 'live_chat' },
    adminAuth: {} as Record<string, string>,
};

export const db = {
    async updateUserMeta(_u: string, _k: string, _v: any): Promise<void> {},
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

export const helpers = {
    async exeCommandWpcli(_c: string): Promise<void> {},
};

export class LiveChatPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableLiveChatModule(): Promise<void> {}
    async disableLiveChatModule(): Promise<void> {}
    async viewLiveChatButtonOnStore(_name: string, _hidden?: boolean): Promise<void> {}
    async viewLiveChatButtonOnProduct(_name: string, _pos: string): Promise<void> {}
    async vendorInboxRenderProperly(): Promise<void> {}
    async sendMessageToVendor(_name: string, _msg: string): Promise<void> {}
    async sendMessageToCustomer(_name: string, _msg: string): Promise<void> {}
}
