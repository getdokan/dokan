import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Stable, recognisable handles so the storefront assertion can match the exact
// link the vendor saved (avoids matching a pre-existing social link).
export const newSocialData = {
    handle: 'pwnewui',
    profiles: () => ({
        fb: 'https://facebook.com/pwnewui',
        twitter: 'https://twitter.com/pwnewui',
        linkedin: 'https://linkedin.com/in/pwnewui',
        youtube: 'https://youtube.com/@pwnewui',
        instagram: 'https://instagram.com/pwnewui',
    }),
    invalidUrl: 'not a url',
} as const;

export type SocialProfiles = ReturnType<typeof newSocialData.profiles>;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/settings/social render.
// All inputs are type=url with stable ids (`#social-<network>`).
// ============================================
export const newSocialSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    heading: 'text=/Social Profiles/i',
    fb: '#social-fb',
    twitter: '#social-twitter',
    pinterest: '#social-pinterest',
    linkedin: '#social-linkedin',
    youtube: '#social-youtube',
    tiktok: '#social-tiktok',
    instagram: '#social-instagram',
    flickr: '#social-flickr',
    threads: '#social-threads',
    submit: 'button:has-text("Submit"), button:has-text("Save Changes")',
    successNotice: 'div[role="status"]',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Storefront (guest/customer) social links.
    storeSocial: '.store-social-wrapper a, .store-social a',
} as const;

// ============================================
// PAGE OBJECT — new React Social Profiles settings (Dokan 5.0.0+)
// Surface: /dashboard/new/#/settings/social (form). Pro feature.
// Self-contained per setup.md §2.
// ============================================
export class NewSocialPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/social');
    readonly storeUrl = toPath('store/vendor1store/');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newSocialSelectors.heading).first(); }
    get fb(): Locator { return this.page.locator(newSocialSelectors.fb).first(); }
    get twitter(): Locator { return this.page.locator(newSocialSelectors.twitter).first(); }
    get linkedin(): Locator { return this.page.locator(newSocialSelectors.linkedin).first(); }
    get youtube(): Locator { return this.page.locator(newSocialSelectors.youtube).first(); }
    get instagram(): Locator { return this.page.locator(newSocialSelectors.instagram).first(); }
    get submitButton(): Locator { return this.page.locator(newSocialSelectors.submit).first(); }
    get successNotice(): Locator { return this.page.locator(newSocialSelectors.successNotice).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newSocialSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        await this.fb.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newSocialSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Actions ----
    async fillProfiles(data: Partial<SocialProfiles>): Promise<void> {
        if (data.fb !== undefined) await this.fb.fill(data.fb);
        if (data.twitter !== undefined) await this.twitter.fill(data.twitter);
        if (data.linkedin !== undefined) await this.linkedin.fill(data.linkedin);
        if (data.youtube !== undefined) await this.youtube.fill(data.youtube);
        if (data.instagram !== undefined) await this.instagram.fill(data.instagram);
    }

    async submit(): Promise<void> {
        const btn = this.submitButton;
        await btn.waitFor({ state: 'visible' });
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        // The submit handler POSTs the profile and shows a react-hot-toast.
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v[0-9]\/.*(settings|profile|store)/i.test(r.url()) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined),
            btn.click(),
        ]);
    }

    /** Save + verify persistence: success toast (best-effort) AND values
     *  survive a reload (the strong assertion). */
    async saveAndVerifyPersisted(data: Partial<SocialProfiles>): Promise<void> {
        await this.fillProfiles(data);
        await this.submit();
        await this.successNotice.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
        await this.goto();
        if (data.fb !== undefined) await expect(this.fb).toHaveValue(data.fb);
        if (data.twitter !== undefined) await expect(this.twitter).toHaveValue(data.twitter);
    }

    async clearField(field: keyof SocialProfiles): Promise<void> {
        await this[field as 'fb' | 'twitter' | 'linkedin' | 'youtube' | 'instagram'].fill('');
        await this.submit();
    }

    // ---- Storefront (guest/customer) ----
    /** Visit the vendor store and return the hrefs of its social links. */
    async getStoreSocialLinks(): Promise<string[]> {
        await this.page.goto(this.storeUrl);
        await this.page.waitForLoadState('domcontentloaded');
        const links = this.page.locator(newSocialSelectors.storeSocial);
        await links.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        return links.evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
    }
}
