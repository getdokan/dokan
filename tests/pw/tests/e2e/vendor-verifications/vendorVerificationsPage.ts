import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    image: { avatar: '' },
    vendor: { verification: {} as any },
    dokanSettings: {
        vendorVerification: {
            verifiedIcons: { byIcon: { certificateSolid: '' } },
            customMethod: {} as any,
            updateMethod: {} as any,
        },
    },
    predefined: { vendorStores: { vendor1: '', vendor2: '' } },
};

export const payloads = {
    moduleIds: { vendorVerification: 'vendor-verification' },
    adminAuth: {} as Record<string, string>,
    mimeTypes: { png: 'image/png' },
    createVerificationMethod: () => ({} as any),
    createVerificationRequest: () => ({} as any),
};

export const dbUtils = {
    async setUserMeta(_id: any, _k: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createVerificationMethod(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async uploadMedia(_p: string, _m: string, _a: any): Promise<[any, string]> { return [null, '']; }
    async createVerificationRequest(_p: any, _a: any): Promise<[any, string]> { return [null, '']; }
    async getVerificationMethodId(_k: string, _a: any): Promise<[any, string]> { return [null, '']; }
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorVerificationsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableVendorVerificationModule(): Promise<void> {}
    async disableVendorVerificationModule(): Promise<void> {}
    async changeVerifiedIcon(_i: string, _s: string): Promise<void> {}
    async addVendorVerificationMethod(_m: any): Promise<void> {}
    async editVendorVerificationMethod(_n: string, _m: any): Promise<void> {}
    async deleteVendorVerificationMethod(_n: string): Promise<void> {}
    async updateVerificationMethodStatus(_n: string, _s: string): Promise<void> {}
    async adminVerificationsRenderProperly(): Promise<void> {}
    async filterVerificationRequests(_v: string, _t: string): Promise<void> {}
    async resetFilter(): Promise<void> {}
    async addNoteVerificationRequest(_id: string, _n: string): Promise<void> {}
    async viewVerificationRequestDocument(_id: string): Promise<void> {}
    async updateVerificationRequest(_id: string, _a: string): Promise<void> {}
    async verificationRequestBulkAction(_a: string): Promise<void> {}
    async vendorVerificationsSettingsRenderProperly(_n: string): Promise<void> {}
    async submitVerificationRequest(_d: any, _w?: boolean): Promise<void> {}
    async cancelVerificationRequest(_n: string, _w?: boolean): Promise<void> {}
    async vendorViewVerificationRequestDocument(_n: string, _w?: boolean): Promise<void> {}
    async viewVerificationRequestNote(_n: string, _note: string): Promise<void> {}
    async viewVerificationMethods(_r: string, _nr: string): Promise<void> {}
    async viewVerifiedBadge(_s: string): Promise<void> {}
}
