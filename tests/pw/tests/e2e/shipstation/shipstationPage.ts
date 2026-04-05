import { Page } from '@playwright/test';

export const payloads = {
    moduleIds: { shipStation: 'shipstation' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async deleteShipStationCredential(_v: any, _a: any): Promise<void> {}
    async createShipStationCredential(_v: any, _a: any): Promise<void> {}
}

export class ShipStationPage {
    constructor(readonly page: Page) {}
    async enableShipStationModule(): Promise<void> {}
    async disableShipStationModule(): Promise<void> {}
    async generateShipStationCredentials(): Promise<void> {}
    async revokeShipStationCredentials(): Promise<void> {}
}
