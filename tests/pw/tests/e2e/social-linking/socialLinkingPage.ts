import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Ported from the legacy vendor Social Profile settings flow (pre-5.0 classic
// vendor dashboard). Surface: /dashboard/settings/social — the vendor Settings
// "Social Profile" tab where a vendor stores their public social links.
export const socialLinkingData = {
    // Classic vendor-dashboard settings sub-path (no `new/#` React prefix).
    subUrl: 'dashboard/settings/social',
    saveSuccessMessage: 'Your settings have been saved.',
    // Recognisable, valid URLs per platform. Legacy reused the flickr value for
    // threads; each platform gets its own distinct URL here so per-field value
    // assertions can never pass by coincidence.
    profiles: {
        facebook: 'https://www.facebook.com/',
        twitter: 'https://www.twitter.com/',
        pinterest: 'https://www.pinterest.com/',
        linkedin: 'https://www.linkedin.com/',
        youtube: 'https://www.youtube.com/',
        instagram: 'https://www.instagram.com/',
        flickr: 'https://www.flickr.com/',
        threads: 'https://www.threads.net/',
    },
} as const;

export type SocialProfileUrls = typeof socialLinkingData.profiles;

// ============================================
// SELECTORS — co-located, ported verbatim from the legacy
// `selector.vendor.vSocialProfileSettings` group. The platform inputs use the
// classic `settings[social][<network>]` id, escaped for CSS `[` / `]`.
// ============================================
export const socialLinkingSelectors = {
    heading: '.dokan-settings-content h1',
    visitStore: '//a[normalize-space()="Visit Store"]',
    platforms: {
        facebook: '#settings\\[social\\]\\[fb\\]',
        twitter: '#settings\\[social\\]\\[twitter\\]',
        pinterest: '#settings\\[social\\]\\[pinterest\\]',
        linkedin: '#settings\\[social\\]\\[linkedin\\]',
        youtube: '#settings\\[social\\]\\[youtube\\]',
        instagram: '#settings\\[social\\]\\[instagram\\]',
        flickr: '#settings\\[social\\]\\[flickr\\]',
        threads: '#settings\\[social\\]\\[threads\\]',
    },
    updateSettings: 'input[value="Update Settings"]',
    updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — vendor Social Profile settings (classic vendor dashboard).
// Self-contained: raw Playwright calls, no @pages base classes.
// ============================================
export class SocialLinkingPage {
    readonly page: Page;
    readonly url = toPath(socialLinkingData.subUrl);

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(socialLinkingSelectors.heading).first(); }
    get visitStore(): Locator { return this.page.locator(socialLinkingSelectors.visitStore).first(); }
    get updateSettingsButton(): Locator { return this.page.locator(socialLinkingSelectors.updateSettings).first(); }
    get successMessage(): Locator { return this.page.locator(socialLinkingSelectors.updateSettingsSuccessMessage).first(); }

    platformInput(network: keyof SocialProfileUrls): Locator {
        return this.page.locator(socialLinkingSelectors.platforms[network]).first();
    }

    // ---- Navigation ----
    // Ports the legacy `goIfNotThere(...)`: land on the settings page and wait
    // for it to settle (classic PHP/Vue page, not a React SPA).
    async goto(): Promise<void> {
        await this.page.goto(this.url, { waitUntil: 'networkidle' });
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(socialLinkingSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Reads / assertions ----
    // Port of `vendorSocialProfileSettingsRenderProperly()`: heading, Visit Store
    // link, every platform input, and the Update Settings button are all visible.
    async renderProperly(): Promise<void> {
        await this.goto();
        await expect(this.heading).toBeVisible();
        await expect(this.visitStore).toBeVisible();
        for (const selector of Object.values(socialLinkingSelectors.platforms)) {
            await expect(this.page.locator(selector).first()).toBeVisible();
        }
        await expect(this.updateSettingsButton).toBeVisible();
    }

    // ---- Actions ----
    async fillProfiles(urls: Partial<SocialProfileUrls>): Promise<void> {
        for (const [network, value] of Object.entries(urls) as [keyof SocialProfileUrls, string][]) {
            if (value !== undefined) {
                await this.platformInput(network).fill(value);
            }
        }
    }

    // Port of `setSocialProfile(urls)`: fill every platform, submit by pressing
    // Enter on the Update Settings button, assert the success banner, then assert
    // each field kept the value it was given (the persistence check).
    async setSocialProfile(urls: SocialProfileUrls = socialLinkingData.profiles): Promise<void> {
        await this.goto();
        await this.fillProfiles(urls);
        await this.updateSettingsButton.press('Enter');
        await expect(this.successMessage).toContainText(socialLinkingData.saveSuccessMessage);
        for (const [network, value] of Object.entries(urls) as [keyof SocialProfileUrls, string][]) {
            await expect(this.platformInput(network)).toHaveValue(value);
        }
    }
}
