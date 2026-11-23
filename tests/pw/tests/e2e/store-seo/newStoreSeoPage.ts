import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Stable, recognisable values so the storefront assertion can match the exact
// strings the vendor saved (avoids matching pre-existing/default meta).
export const newStoreSeoData = {
    handle: 'pwseo',
    seo: () => ({
        metaTitle: 'PW SEO Meta Title pwseo',
        metaDesc: 'PW SEO meta description pwseo for automated parity testing.',
        metaKeywords: 'pwseo, dokan, marketplace',
        ogTitle: 'PW Facebook Title pwseo',
        ogDesc: 'PW Facebook description pwseo for automated parity testing.',
        twitterTitle: 'PW X Title pwseo',
        twitterDesc: 'PW X description pwseo for automated parity testing.',
    }),
} as const;

export type StoreSeoValues = ReturnType<typeof newStoreSeoData.seo>;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/settings/seo render
// (cheat-sheet tmp-explore/store-seo.json + StoreSeoForm.tsx). All inputs carry
// stable ids `#dokan_seo_*`; the form POSTs to /dokan/v2/settings/store_seo and
// shows a react-hot-toast on success.
// ============================================
export const newStoreSeoSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    heading: 'text=/Store SEO/i',
    metaTitle: '#dokan_seo_meta_title',
    metaDesc: '#dokan_seo_meta_desc',
    metaKeywords: '#dokan_seo_meta_keywords',
    ogTitle: '#dokan_seo_og_title',
    ogDesc: '#dokan_seo_og_desc',
    twitterTitle: '#dokan_seo_twitter_title',
    twitterDesc: '#dokan_seo_twitter_desc',
    uploadButton: 'button:has-text("Upload")',
    saveButton: 'button:has-text("Save Changes")',
    successNotice: 'div[role="status"]',
    errorNotice: 'div[role="alert"]',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// Maps the friendly value-object keys to their input selectors so fill/verify
// helpers can iterate generically.
const FIELD_MAP: Record<keyof StoreSeoValues, string> = {
    metaTitle: newStoreSeoSelectors.metaTitle,
    metaDesc: newStoreSeoSelectors.metaDesc,
    metaKeywords: newStoreSeoSelectors.metaKeywords,
    ogTitle: newStoreSeoSelectors.ogTitle,
    ogDesc: newStoreSeoSelectors.ogDesc,
    twitterTitle: newStoreSeoSelectors.twitterTitle,
    twitterDesc: newStoreSeoSelectors.twitterDesc,
};

// ============================================
// PAGE OBJECT — new React Store SEO settings (Dokan 5.0.0+)
// Surface: /dashboard/new/#/settings/seo (form). Pro feature.
// Self-contained per house-style §1.
// ============================================
export class NewStoreSeoPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/seo');
    readonly storeUrl = toPath('store/vendor1store/');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newStoreSeoSelectors.heading).first(); }
    get metaTitle(): Locator { return this.page.locator(newStoreSeoSelectors.metaTitle).first(); }
    get metaDesc(): Locator { return this.page.locator(newStoreSeoSelectors.metaDesc).first(); }
    get metaKeywords(): Locator { return this.page.locator(newStoreSeoSelectors.metaKeywords).first(); }
    get ogTitle(): Locator { return this.page.locator(newStoreSeoSelectors.ogTitle).first(); }
    get ogDesc(): Locator { return this.page.locator(newStoreSeoSelectors.ogDesc).first(); }
    get twitterTitle(): Locator { return this.page.locator(newStoreSeoSelectors.twitterTitle).first(); }
    get twitterDesc(): Locator { return this.page.locator(newStoreSeoSelectors.twitterDesc).first(); }
    get uploadButton(): Locator { return this.page.locator(newStoreSeoSelectors.uploadButton).first(); }
    get saveButton(): Locator { return this.page.locator(newStoreSeoSelectors.saveButton).first(); }
    get successNotice(): Locator { return this.page.locator(newStoreSeoSelectors.successNotice).first(); }

    fieldLocator(field: keyof StoreSeoValues): Locator {
        return this.page.locator(FIELD_MAP[field]).first();
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /**
     * The form renders a loading skeleton while it fetches the saved SEO data
     * from /dokan/v2/settings/store_seo. Wait for the react root AND the first
     * real input (skeleton gone) before interacting.
     */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newStoreSeoSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        await this.metaTitle.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newStoreSeoSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Actions ----
    async fillSeo(data: Partial<StoreSeoValues>): Promise<void> {
        for (const key of Object.keys(data) as (keyof StoreSeoValues)[]) {
            const value = data[key];
            if (value !== undefined) await this.fieldLocator(key).fill(value);
        }
    }

    async save(): Promise<void> {
        const btn = this.saveButton;
        await btn.waitFor({ state: 'visible' });
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        // The submit handler POSTs to /dokan/v2/settings/store_seo then shows a
        // react-hot-toast. Wait for the POST so the save is committed before we
        // navigate away / reload to assert persistence.
        await Promise.all([
            this.page.waitForResponse(
                r => /dokan\/v[0-9]\/settings\/store_seo/i.test(r.url()) && r.request().method() === 'POST',
                { timeout: 15000 },
            ).catch(() => undefined),
            btn.click(),
        ]);
        await this.successNotice.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
    }

    /** Fill + save + verify the values survive a reload (the strong assertion). */
    async saveAndVerifyPersisted(data: Partial<StoreSeoValues>): Promise<void> {
        await this.fillSeo(data);
        await this.save();
        await this.goto();
        for (const key of Object.keys(data) as (keyof StoreSeoValues)[]) {
            const value = data[key];
            if (value !== undefined) await expect(this.fieldLocator(key)).toHaveValue(value);
        }
    }

    // ---- Storefront (guest/customer) ----
    /** Visit the vendor store and read the rendered <head> SEO signals. */
    async getStorefrontSeo(): Promise<{
        title: string;
        metaDescription: string;
        metaKeywords: string;
        ogTitle: string;
        ogDescription: string;
        twitterTitle: string;
        twitterDescription: string;
    }> {
        await this.page.goto(this.storeUrl);
        await this.page.waitForLoadState('domcontentloaded');
        const content = async (sel: string): Promise<string> =>
            (await this.page.locator(sel).first().getAttribute('content').catch(() => null)) ?? '';
        return {
            title: await this.page.title(),
            metaDescription: await content('head meta[name="description"]'),
            metaKeywords: await content('head meta[name="keywords"]'),
            ogTitle: await content('head meta[property="og:title"]'),
            ogDescription: await content('head meta[property="og:description"]'),
            twitterTitle: await content('head meta[name="twitter:title"]'),
            twitterDescription: await content('head meta[name="twitter:description"]'),
        };
    }
}
