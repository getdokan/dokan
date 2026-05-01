import { Page, expect, request, APIRequestContext } from '@playwright/test';
import mysql from 'mysql2/promise';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

// closeAnnouncementModal is inlined per CONVENTIONS.md §4 to keep this folder
// self-contained.
async function closeAnnouncementModal(page: import('@playwright/test').Page): Promise<void> {
    const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
    type WithFlag = import('@playwright/test').Page & { [installed]?: boolean };
    const pwf = page as WithFlag;
    if (!pwf[installed]) {
        pwf[installed] = true;
        const modal = page.locator('.vendor-announcement-modal');
        await page.addLocatorHandler(modal, async () => {
            const btn = modal.locator('button[aria-label="Close"]').first();
            if (await btn.isVisible().catch(() => false)) await btn.click({ timeout: 2000 }).catch(() => undefined);
            else await page.keyboard.press('Escape').catch(() => undefined);
        }, { noWaitAfter: true }).catch(() => undefined);
    }
    try {
        const modal = page.locator('.vendor-announcement-modal').first();
        if (!(await modal.isVisible({ timeout: 500 }).catch(() => false))) return;
        const btn = modal.locator('button[aria-label="Close"]').first();
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => undefined);
        else await page.keyboard.press('Escape').catch(() => undefined);
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    } catch { /* selector shape may change */ }
}

const {
    BASE_URL,
    SERVER_URL: SERVER_URL_ENV,
    ADMIN,
    ADMIN_PASSWORD,
    CUSTOMER,
    USER_PASSWORD,
    VENDOR,
    VENDOR2,
    DB_HOST_NAME,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DATABASE,
    DB_PORT,
    DB_PREFIX,
} = process.env;

const SERVER_URL = SERVER_URL_ENV || BASE_URL + '/wp-json';
const dbPrefix = DB_PREFIX;

// ============================================
// HELPERS
// ============================================
export function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

export const helpers = {
    slugify(str: string): string {
        return str
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/-$/g, '');
    },
    currentDateTimeFullFormat(): string {
        return new Date()
            .toLocaleString('en-CA', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hourCycle: 'h23',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            })
            .replace(',', '');
    },
};

// ============================================
// URLS / DATA
// ============================================
export const subUrls = {
    myAccount: 'my-account',
    followingStores: 'my-account/following',
    vendorFollowers: 'dashboard/followers',
    ajax: '/admin-ajax.php',
    vendorDetails: (storeName: string) => `store/${storeName}`,
};

export const predefinedStores = {
    vendor1: `${VENDOR}store`,
    vendor2: `${VENDOR2}store`,
    followFromStoreListing: 'storeListing',
    followFromSingleStore: 'singleStore',
};

// ============================================
// PAYLOADS
// ============================================
export const payloads = {
    moduleIds: { followStore: 'follow_store' },
    adminAuth: { Authorization: basicAuth(ADMIN || '', ADMIN_PASSWORD || '') },
    customerAuth: { Authorization: basicAuth(CUSTOMER || '', USER_PASSWORD || '') },
};

// ============================================
// SELECTORS
// ============================================
const selectors = {
    myAccountMenuVendors: '.woocommerce-MyAccount-navigation-link--following a',
    // Match both straight (') and curly (’) apostrophes — storefront theme renders &rsquo;
    pageNotFound: '//h1[contains(@class, "page-title") and contains(., "Oops!") and contains(., "page can")]',
    vendorFollowers: {
        storeFollowersText: '//h1[normalize-space()="Store Followers"]',
        table: {
            followersTable:
                '.dokan-table.dokan-table-striped.product-listing-table.dokan-inline-editable-table',
            nameColumn: '//th[normalize-space()="Name"]',
            followedAtColumn: '//th[normalize-space()="Followed At"]',
        },
        numberOfRowsFound: 'table.dokan-table tbody tr',
    },
    customerVendors: {
        noVendorFound: '.dokan-error',
        storeCardDiv: 'div.store-wrapper',
        followedStore: (vendorName: string) =>
            `//div[@class="store-data "]//a[normalize-space()="${vendorName}"]`,
    },
    storeList: {
        followUnFollowStore: (storeName: string) =>
            `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]`,
        currentFollowStatus: (storeName: string) =>
            `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]//span[@class='dokan-follow-store-button-label-current']`,
        followUnFollowStoreSingleStore: 'button.dokan-follow-store-button',
        currentFollowStatusSingleStore: 'span.dokan-follow-store-button-label-current',
    },
    // Fallback search input on shop/store listing page (simple default; page may not exist in lite)
    searchStoreInput: 'input[name="dokan_seller_search"]',
};

// ============================================
// DB UTILITIES
// ============================================
const pool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: DB_PORT ? Number(DB_PORT) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = {
    async dbQuery(query: string, params?: any[]): Promise<any> {
        let connection: mysql.PoolConnection | undefined;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(query, params);
            return result;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    },

    async followVendor(followerId: string, vendorId: string): Promise<any> {
        const currentTime = helpers.currentDateTimeFullFormat();
        const query = `INSERT INTO ${dbPrefix}_dokan_follow_store_followers (vendor_id, follower_id, followed_at)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (  SELECT 1 FROM ${dbPrefix}_dokan_follow_store_followers WHERE vendor_id = ? AND follower_id = ? );`;
        return await db.dbQuery(query, [vendorId, followerId, currentTime, vendorId, followerId]);
    },

    async dispose(): Promise<void> {
        await pool.end();
    },
};

// ============================================
// API UTILITIES
// ============================================
const endPoints = {
    followUnfollowStore: `${SERVER_URL}/dokan/v1/follow-store`,
    activateModule: `${SERVER_URL}/dokan/v1/admin/modules/activate`,
    deactivateModule: `${SERVER_URL}/dokan/v1/admin/modules/deactivate`,
};

export const api = {
    ctx: null as APIRequestContext | null,

    async init(): Promise<void> {
        api.ctx = await request.newContext();
    },

    async dispose(): Promise<void> {
        if (api.ctx) {
            await api.ctx.dispose();
            api.ctx = null;
        }
    },

    async activateModules(moduleIds: string | string[], auth: Record<string, string>): Promise<void> {
        if (!api.ctx) throw new Error('api not initialized');
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const res = await api.ctx.put(endPoints.activateModule, {
            data: { module: modules },
            headers: auth,
        });
        if (!res.ok()) console.error(`Activate failed: ${res.status()}`, await res.text());
    },

    async deactivateModules(
        moduleIds: string | string[],
        auth: Record<string, string>
    ): Promise<void> {
        if (!api.ctx) throw new Error('api not initialized');
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const res = await api.ctx.put(endPoints.deactivateModule, {
            data: { module: modules },
            headers: auth,
        });
        if (!res.ok()) console.error(`Deactivate failed: ${res.status()}`, await res.text());
    },

    async followStore(sellerId: string, auth: Record<string, string>): Promise<any> {
        if (!api.ctx) throw new Error('api not initialized');
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            const res = await api.ctx.post(endPoints.followUnfollowStore, {
                data: { vendor_id: Number(sellerId) },
                headers: auth,
            });
            const body = await res.json().catch(() => ({}));
            if (body.status === 'unfollowed') continue;
            return body;
        }
        return null;
    },

    async unfollowStore(sellerId: string, auth: Record<string, string>): Promise<any> {
        if (!api.ctx) throw new Error('api not initialized');
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            const res = await api.ctx.post(endPoints.followUnfollowStore, {
                data: { vendor_id: Number(sellerId) },
                headers: auth,
            });
            const body = await res.json().catch(() => ({}));
            if (body.status === 'following') continue;
            return body;
        }
        return null;
    },
};

// ============================================
// FOLLOW STORE PAGE
// ============================================
export class FollowStorePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // Navigation helpers

    private createUrl(subPath: string): string {
        return BASE_URL + '/' + subPath;
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        const url = this.createUrl(subPath);
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                const currentUrl = this.getCurrentUrl();
                expect(currentUrl).toMatch(subPath);
            }).toPass();
        }
    }

    // Assertion helpers

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, string>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // Best-effort search store (shop listing search). Method may be absent in lite.
    private async searchStore(storeName: string): Promise<void> {
        // Navigate to store listing page — Dokan default is /store-list/
        const storeListUrl = 'store-listing';
        await this.goto(storeListUrl).catch(() => {});
        const searchInput = this.page.locator(selectors.searchStoreInput);
        if (await searchInput.count()) {
            // The seller search input sits inside a filter form whose parent is
            // display:none until a geolocation filter is engaged. Force it visible
            // so we can submit a search regardless of geolocation state.
            await this.page.evaluate(() => {
                const form = document.querySelector('#dokan-store-listing-filter-form-wrap') as HTMLElement | null;
                if (form) form.style.display = 'block';
                const row = document.querySelector('.dokan-geolocation-location-filters') as HTMLElement | null;
                if (row) row.style.display = 'block';
            });
            await searchInput.fill(storeName);
            await Promise.all([
                this.page.waitForLoadState('domcontentloaded'),
                this.page.keyboard.press('Enter'),
            ]);
        }
    }

    // ===========================================
    // PAGE METHODS
    // ===========================================

    async enableFollowStoreModule(): Promise<void> {
        await this.goto(subUrls.myAccount);
        await this.toBeVisible(selectors.myAccountMenuVendors);
    }

    async disableFollowStoreModule(): Promise<void> {
        await this.goto(subUrls.myAccount);
        await this.notToBeVisible(selectors.myAccountMenuVendors);

        await this.goto(subUrls.followingStores);
        await this.toBeVisible(selectors.pageNotFound);
    }

    async vendorFollowersRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.vendorFollowers);
        await this.toBeVisible(selectors.vendorFollowers.storeFollowersText);
        await this.multipleElementVisible(selectors.vendorFollowers.table);
    }

    async vendorViewFollowers(): Promise<void> {
        await this.goIfNotThere(subUrls.vendorFollowers);
        await this.notToHaveCount(selectors.vendorFollowers.numberOfRowsFound, 0);
    }

    async customerFollowedVendorsRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.followingStores);

        const noVendorsFound = await this.isVisible(selectors.customerVendors.noVendorFound);
        if (noVendorsFound) {
            await this.toContainText(selectors.customerVendors.noVendorFound, 'No vendor found!');
            console.log('No vendor followed');
            return;
        }

        await this.notToHaveCount(selectors.customerVendors.storeCardDiv, 0);
    }

    async customerViewFollowedVendors(storeName: string): Promise<void> {
        // This test inserts a follow row via SQL right before asserting, so we must
        // force a fresh page load — goIfNotThere would skip the nav and render stale
        // "No vendor found!" state from the previous test's cached view.
        await this.goto(subUrls.followingStores);
        await this.toBeVisible(selectors.customerVendors.followedStore(storeName));
    }

    async followUnfollowStore(storeName: string, status: string, location: string): Promise<void> {
        switch (location) {
            case 'storeListing':
                await this.searchStore(storeName);
                await this.clickAndWaitForResponse(
                    subUrls.ajax,
                    selectors.storeList.followUnFollowStore(storeName)
                );
                await this.toContainText(
                    selectors.storeList.currentFollowStatus(storeName),
                    status
                );
                break;

            case 'singleStore':
                await this.goIfNotThere(subUrls.vendorDetails(helpers.slugify(storeName)));
                await this.clickAndWaitForResponse(
                    subUrls.ajax,
                    selectors.storeList.followUnFollowStoreSingleStore
                );
                await this.toContainText(
                    selectors.storeList.currentFollowStatusSingleStore,
                    status
                );
                break;

            default:
                throw new Error(`Unknown location: ${location}`);
        }
    }
}
