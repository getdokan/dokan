import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

import { toPath } from '@utils/helpers';

export const data = {
    vendor: { vendorInfo: {} as any },
    vendorSetupWizard: {} as any,
    order: { orderStatus: { completed: 'completed' } },
};

export const payloads = {
    moduleIds: { vendorSubscription: 'vendor-subscription' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createDokanSubscriptionProduct: () => ({} as any),
    saveVendorSubscriptionProductCommission: {} as any,
    createStore: () => ({} as any),
};

export const dbData = {
    dokan: {
        optionName: { vendorSubscription: '' },
        vendorSubscriptionSettings: {} as any,
    },
};

export const dbUtils = {
    async setOptionValue(_k: string, _v: any): Promise<void> {},
    async updateProductType(_id: string): Promise<void> {},
    async setUserMeta(_id: string, _k: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async saveCommissionToSubscriptionProduct(_id: string, _p: any, _a: any): Promise<void> {}
    async assignSubscriptionToVendor(_id: string): Promise<[string, string, string, string]> { return ['', '', '', '']; }
    async createStore(_p: any, _a: any, _b?: boolean): Promise<[any, string, string, string]> { return [null, '', '', '']; }
    async updateOrderStatus(_id: string, _s: string, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }

    /**
     * Register a vendor through `/vendor-onboarding/` (Dokan 5.0.0+) and
     * pick a subscription pack via the inline `#dokan-subscription-pack`
     * select rendered on the same page.
     */
    async vendorRegister(vendorInfo: any, _setupWizard: any): Promise<void> {
        const resolve = <T,>(v: T | (() => T)): T => (typeof v === 'function' ? (v as () => T)() : v);

        const firstName = String(resolve(vendorInfo?.firstName) ?? 'vendor');
        const lastName = String(resolve(vendorInfo?.lastName) ?? 'test');
        const base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
        const email = String(resolve(vendorInfo?.email) ?? `${base}@test.com`);
        const password = String(vendorInfo?.password ?? '01dokan01');
        const shopName = String(resolve(vendorInfo?.shopName) ?? `${base}store`);
        const phone = String(vendorInfo?.phone ?? '0123456789');

        await this.page.goto(toPath(`vendor-onboarding/`), { waitUntil: 'domcontentloaded' });

        await this.page.locator('#first-name').fill(firstName);
        await this.page.locator('#last-name').fill(lastName);
        await this.page.locator('#reg_email').fill(email);
        await this.page.locator('#shop-phone').fill(phone);

        const passwordField = this.page.locator('#reg_password');
        if (await passwordField.isVisible().catch(() => false)) {
            await passwordField.fill(password);
        }

        // Tab out of #company-name so the JS auto-populates #seller-url and
        // the AJAX availability check runs — submit stays disabled until the
        // slug indicator flips to text-success.
        await this.page.locator('#company-name').fill(shopName);
        await this.page.locator('#company-name').press('Tab');
        await this.page.locator('#url-alart-mgs.text-success').waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

        if (vendorInfo?.vendorSubscriptionPack) {
            const pack = this.page.locator('#dokan-subscription-pack');
            if (await pack.isVisible().catch(() => false)) {
                await pack.selectOption({ label: String(vendorInfo.vendorSubscriptionPack) }).catch(async () => {
                    await pack.selectOption(String(vendorInfo.vendorSubscriptionPack));
                });
            }
        }

        const terms = this.page.locator('#tc_agree');
        if (await terms.isVisible().catch(() => false)) {
            await terms.check();
        }

        await this.page.locator('input[name="register"]').first().click();
        await this.page.waitForLoadState('load');
    }
}

export class VendorSubscriptionsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableVendorSubscriptionModule(): Promise<void> {}
    async disableVendorSubscriptionModule(): Promise<void> {}
    async subscriptionsRenderProperly(): Promise<void> {}
    async filterSubscribedVendors(_n: string, _t: string): Promise<void> {}
    async cancelSubscription(_n: string, _t: string): Promise<void> {}
    async subscriptionsBulkAction(_a: string, _n: string): Promise<void> {}
    async assignSubscriptionPack(_id: string, _p: string): Promise<void> {}
    async vendorSubscriptionsRenderProperly(): Promise<void> {}
    async buySubscription(_v: string, _p: string, _s?: boolean): Promise<string> { return ''; }
    async assertSubscription(_p: string): Promise<void> {}
    async vendorCancelSubscription(_n: string): Promise<void> {}
}
