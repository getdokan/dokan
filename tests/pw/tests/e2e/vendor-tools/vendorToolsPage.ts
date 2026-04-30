import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const payloads = {
    moduleIds: { vendorImportExport: 'vendor-import-export' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async deleteAllProducts(_k: string, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorToolsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductImporterExporterModule(): Promise<void> {}
    async disableProductImporterExporterModule(): Promise<void> {}
    async vendorToolsRenderProperly(): Promise<void> {}
    async exportProduct(_f: string): Promise<void> {}
    async importProduct(_f: string, _p: string): Promise<void> {}
}
