import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    dokanSetupWizard: {} as any,
    tools: { distanceMatrixApi: {} as any },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    dummyData: {} as any,
};

export const dbUtils = {
    async setOptionValue(_n: string, _v: any, _s?: boolean): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async clearDummyData(_a: any): Promise<void> {}
    async importDummyData(_p: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ToolsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminToolsRenderProperly(): Promise<void> {}
    async dokanPageInstallation(): Promise<void> {}
    async regenerateOrderCommission(): Promise<void> {}
    async checkForDuplicateOrders(): Promise<void> {}
    async setDokanSetupWizard(_d: any): Promise<void> {}
    async regenerateVariableProductVariationsAuthorIds(): Promise<void> {}
    async importDummyData(): Promise<void> {}
    async clearDummyData(): Promise<void> {}
    async testDistanceMatrixApi(_d: any): Promise<void> {}
}
