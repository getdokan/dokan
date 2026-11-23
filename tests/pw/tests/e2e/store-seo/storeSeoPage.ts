import { Page, expect, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';
import { ApiUtils as BaseApiUtils } from '@utils/apiUtils';

// Re-exported real utils so any spec's import contract resolves to the live
// implementations (not local stubs).
export { dbData } from '@utils/dbData';
export { dbUtils } from '@utils/dbUtils';
export { payloads } from '@utils/payloads';
export { data } from '@utils/testData';

// The real ApiUtils (all methods inherited — setStoreSettings, dispose, etc.).
// Constructor is widened to accept `null` so specs can instantiate it as
// `new ApiUtils(null)` inside skipped/setup-only blocks where the request
// context is never actually exercised.
export class ApiUtils extends BaseApiUtils {
    constructor(request: APIRequestContext | null = null) {
        super(request as APIRequestContext);
    }
}

// Co-located selectors — inlined from the pre-refactor selectors.ts groups
// (vStoreSeoSettings, wpMedia). This is the LEGACY (jQuery/PHP) vendor
// dashboard Store SEO surface at /dashboard/settings/seo — hyphen-cased input
// ids (#dokan-seo-*), an admin-ajax save, and a `.dokan-alert` success notice.
// The React 5.0.0+ rewrite of this same surface lives in `newStoreSeoPage.ts`.
export const storeSeoSelectors = {
    vStoreSeoSettings: {
        storeSeoText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        seoTitle: '#dokan-seo-meta-title',
        metaDescription: '#dokan-seo-meta-desc',
        metaKeywords: '#dokan-seo-meta-keywords',

        facebook: {
            facebookTitle: '#dokan-seo-og-title',
            facebookDescription: '#dokan-seo-og-desc',
            facebookImage: '//label[contains( text(), "Facebook Image :")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            uploadedFacebookImage: '//label[@for="dokan-seo-og-image"]/..//div[@class="dokan-left gravatar-wrap"]',
        },

        twitter: {
            twitterTitle: '#dokan-seo-twitter-title',
            twitterDescription: '#dokan-seo-twitter-desc',
            twitterImage: '//label[contains( text(), "Twitter Image")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            uploadedTwitterImage: '//label[@for="dokan-seo-twitter-image"]/..//div[@class="dokan-left gravatar-wrap"]',
        },

        saveChanges: '#dokan-store-seo-form-submit',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success',
    },

    wpMedia: {
        uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
        mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
    },
} as const;

// Aliases mirroring the pre-refactor local consts so the ported method bodies
// read identically to the reference.
const settingsStoreSeo = storeSeoSelectors.vStoreSeoSettings;
const wpMedia = storeSeoSelectors.wpMedia;

// Legacy vendor Store SEO settings page object (Pro feature — capability
// `dokan_view_store_seo_menu`). Ported from the pre-refactor
// vendorSettingsPage SEO methods into the current self-contained architecture.
export class StoreSeoPage {
    readonly page: Page;
    readonly url = toPath(data.subUrls.frontend.vDashboard.settingsSeo);

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    /**
     * Raw-Playwright ports of the pre-refactor base-class helpers used by the
     * Store SEO flow.
     */

    // navigate to subPath only if not already there
    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    // assert element to be visible
    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    // assert element to contain text
    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    // assert element to have value
    private async toHaveValue(selector: string, value: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    // recursively assert every string selector in an object is visible (skips functions)
    private async multipleElementVisible(selectors: { [key: string]: any }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value);
            } else {
                await this.toBeVisible(value);
            }
        }
    }

    // poll for visibility, returns boolean
    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutSec * 1000) {
            if (await this.page.locator(selector).isVisible().catch(() => false)) return true;
            await this.page.waitForTimeout(100);
        }
        return false;
    }

    // click element
    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    // click element if visible
    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1)) {
            await this.click(selector);
        }
    }

    // clear input field and type
    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    // click, wait for a matching response and for load state
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([this.page.waitForLoadState('load'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
    }

    // upload media through the WP media modal
    private async uploadMedia(file: string): Promise<void> {
        await this.click(wpMedia.mediaLibrary);
        const uploadedMediaIsVisible = await this.isVisible(wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.click(wpMedia.uploadedMediaFirst);
        } else {
            await this.click(wpMedia.uploadFiles);
            await this.page.setInputFiles(wpMedia.selectFilesInput, file);
        }
        await expect(async () => {
            await this.click(wpMedia.select);
            await expect(this.page.locator(wpMedia.select)).toBeHidden();
        }).toPass();
    }

    /**
     * Store SEO flows.
     */

    // navigate to the Store SEO settings page
    async goto(): Promise<void> {
        await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    }

    // vendor store seo render properly
    async vendorStoreSeoSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        // store seo text is visible
        await this.toBeVisible(settingsStoreSeo.storeSeoText);

        // visit store link is visible
        await this.toBeVisible(settingsStoreSeo.visitStore);

        // seo title is visible
        await this.toBeVisible(settingsStoreSeo.seoTitle);

        // meta description is visible
        await this.toBeVisible(settingsStoreSeo.metaDescription);

        // meta keywords is visible
        await this.toBeVisible(settingsStoreSeo.metaKeywords);

        // store seo facebook elements are visible
        const { facebookImage, uploadedFacebookImage, ...facebook } = settingsStoreSeo.facebook;
        await this.multipleElementVisible(facebook);

        // store seo twitter elements are visible
        const { twitterImage, uploadedTwitterImage, ...twitter } = settingsStoreSeo.twitter;
        await this.multipleElementVisible(twitter);

        // save changes is visible
        await this.toBeVisible(settingsStoreSeo.saveChanges);
    }

    // vendor set seo settings
    async setStoreSeo(seo: vendor['seo']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        await this.clearAndType(settingsStoreSeo.seoTitle, seo.seoTitle);
        await this.clearAndType(settingsStoreSeo.metaDescription, seo.metaDescription);
        await this.clearAndType(settingsStoreSeo.metaKeywords, seo.metaKeywords);

        await this.clearAndType(settingsStoreSeo.facebook.facebookTitle, seo.facebookTitle);
        await this.clearAndType(settingsStoreSeo.facebook.facebookDescription, seo.facebookDescription);
        await this.clickIfVisible(settingsStoreSeo.facebook.uploadedFacebookImage);
        await this.click(settingsStoreSeo.facebook.facebookImage);
        await this.uploadMedia(seo.facebookImage);

        await this.clearAndType(settingsStoreSeo.twitter.twitterTitle, seo.twitterTitle);
        await this.clearAndType(settingsStoreSeo.twitter.twitterDescription, seo.twitterDescription);
        await this.clickIfVisible(settingsStoreSeo.twitter.uploadedTwitterImage);
        await this.click(settingsStoreSeo.twitter.twitterImage);
        await this.uploadMedia(seo.twitterImage);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsStoreSeo.saveChanges);
        await this.toContainText(settingsStoreSeo.updateSettingsSuccessMessage, 'Your changes has been updated!');

        await this.toHaveValue(settingsStoreSeo.seoTitle, seo.seoTitle);
        await this.toHaveValue(settingsStoreSeo.metaDescription, seo.metaDescription);
        await this.toHaveValue(settingsStoreSeo.metaKeywords, seo.metaKeywords);

        await this.toHaveValue(settingsStoreSeo.facebook.facebookTitle, seo.facebookTitle);
        await this.toHaveValue(settingsStoreSeo.facebook.facebookDescription, seo.facebookDescription);
        await this.toBeVisible(settingsStoreSeo.facebook.uploadedFacebookImage);

        await this.toHaveValue(settingsStoreSeo.twitter.twitterTitle, seo.twitterTitle);
        await this.toHaveValue(settingsStoreSeo.twitter.twitterDescription, seo.twitterDescription);
        await this.toBeVisible(settingsStoreSeo.twitter.uploadedTwitterImage);
    }
}
