import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    staff: () => ({ firstName: '', lastName: '' }),
    vendorStaff: { basicMenu: [] as string[], basicMenuNames: [] as string[] },
};

export const payloads = {
    moduleIds: { vendorStaff: 'vendor-staff' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createStaff: () => ({} as any),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createVendorStaff(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async updateStaffCapabilities(_id: string, _p: any, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorStaffPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableVendorStaffModule(): Promise<void> {}
    async disableVendorStaffModule(): Promise<void> {}
    async vendorStaffRenderProperly(): Promise<void> {}
    async addStaff(_s: any): Promise<void> {}
    async editStaff(_s: any): Promise<void> {}
    async manageStaffPermission(_n: string): Promise<void> {}
    async deleteStaff(_n: string): Promise<void> {}
    async viewPermittedMenus(_m: string[]): Promise<void> {}
}
