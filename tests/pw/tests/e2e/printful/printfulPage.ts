import { Page } from '@playwright/test';

export const payloads = {
    moduleIds: { printful: 'printful' },
    adminAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class PrintfulPage {
    constructor(readonly page: Page) {}
    async enablePrintfulModule(): Promise<void> {}
    async disablePrintfulModule(): Promise<void> {}
    async vendorPrintfulSettingsRenderProperly(): Promise<void> {}
    async connectPrintful(): Promise<void> {}
    async disconnectPrintful(): Promise<void> {}
    async enableShipping(_mode: string): Promise<void> {}
}
