import { Page, expect, APIRequestContext } from '@playwright/test';
import { toPath, helpers, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';

// ============================================================================
// Privacy Policy & Store Contact form — CUSTOMER-facing single-store surface.
//
// Ported from the pre-refactor `tests/pw/pages/privacyPolicyPage.ts`
// (git e2ec507de) into the current self-contained page-object style: raw
// page/locator/expect calls, co-located selectors, and REAL @utils wired in
// (testData / dbData / dbUtils / apiUtils) so the spec's beforeAll/afterAll
// toggle real Dokan options (dokan_privacy / dokan_appearance) and real
// sidebar widgets, and navigate real store permalinks.
//
// Selector strings and UI flow are preserved verbatim from the reference's
// `selector.customer.cSingleStore.storeContactForm` group.
// ============================================================================

// Re-export the REAL test data + db helpers under the names the spec imports.
export { data, dbData, dbUtils };

/**
 * Seed the privacy-policy prerequisite the store contact form depends on.
 *
 * The `a.dokan-privacy-policy-link` (asserted by `goToPrivacyPolicy`) is only
 * rendered by `dokan_privacy_policy_text()` when BOTH `enable_privacy` is 'on'
 * AND `dokan_privacy.privacy_page` points at a real page (see
 * includes/functions.php:3316-3323 + :3296-3297). A fresh CI setup can leave
 * `privacy_page` empty (the option is reset to `privacyPolicySettings`, whose
 * `privacy_page` is ''), so the link never renders and the test fails with
 * "element(s) not found". The local shared Docker masked this because a prior
 * run had left `privacy_page` populated.
 *
 * This mirrors `_env.setup.ts` ('admin set dokan privacy policy settings',
 * lines 265-266): create/reuse a PUBLISHED "Privacy Policy" page (its permalink
 * contains "privacy-policy", satisfying the spec's `/privacy-policy/` waitForURL)
 * and point Dokan's `privacy_page` at it. Idempotent via `createPage` dedup.
 */
export async function seedPrivacyPage(apiUtils: RealApiUtils): Promise<void> {
    const [, pageId] = await apiUtils.createPage(payloads.privacyPolicyPage, payloads.adminAuth);
    await dbUtils.updateOptionValue(dbData.dokan.optionName.privacyPolicy, { enable_privacy: 'on', privacy_page: pageId });
}

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)` and only ever calls `dispose()` on
 * it (it seeds/asserts through `dbUtils`, not the REST layer). The real
 * ApiUtils requires an APIRequestContext, so we accept null and make dispose a
 * no-op when there is no context to tear down.
 */
export class ApiUtils extends RealApiUtils {
    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
    }

    override async dispose(): Promise<void> {
        if (this.request) {
            await super.dispose();
        }
    }
}

// Store-contact-form selectors (verbatim from pre-refactor cSingleStore group).
export const privacyPolicySelectors = {
    storeContactForm: 'form#dokan-form-contact-seller',
    name: 'form#dokan-form-contact-seller input[placeholder="Your Name"]',
    email: 'form#dokan-form-contact-seller input[placeholder="you@example.com"]',
    message: 'form#dokan-form-contact-seller textarea[name="message"]',
    sendMessage: 'input[name="store_message_send"]',
    successMessage: 'div.alert.alert-success',
    privacyPolicy: 'div.dokan-privacy-policy-text p',
    privacyPolicyLink: 'a.dokan-privacy-policy-link',
} as const;

export interface StoreContactData {
    name: string;
    email: string;
    message: string;
}

export class PrivacyPolicyPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // Absolute single-store URL for a given store name (slugified like the reference).
    private storeUrl(storeName: string): string {
        return toPath(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
    }

    // contact vendor
    async contactVendor(storeName: string, storeContactData: StoreContactData): Promise<void> {
        const url = this.storeUrl(storeName);
        // Reference: toPass( gotoUntilNetworkidle(..., force=true) -> reload; toBeVisible(form) )
        await expect(async () => {
            await this.page.goto(url, { waitUntil: 'networkidle' });
            await this.page.reload();
            await expect(this.page.locator(privacyPolicySelectors.storeContactForm)).toBeVisible();
        }).toPass();

        await this.page.locator(privacyPolicySelectors.name).fill(storeContactData.name);
        await this.page.locator(privacyPolicySelectors.email).fill(storeContactData.email);
        await this.page.locator(privacyPolicySelectors.message).fill(storeContactData.message);

        // clickAndAcceptAndWaitForResponse(ajax, sendMessage): accept dialog + wait for ajax + click
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.ajax) && resp.status() === 200),
            this.page.locator(privacyPolicySelectors.sendMessage).click(),
        ]);

        await expect(this.page.locator(privacyPolicySelectors.successMessage)).toContainText('Email sent successfully!');
    }

    // go to privacy policy
    async goToPrivacyPolicy(storeName: string): Promise<void> {
        await this.page.goto(this.storeUrl(storeName), { waitUntil: 'networkidle' });

        // forceLinkToSameTab: assert the link opens in a new tab, then rewrite it to same-tab.
        await expect(this.page.locator(privacyPolicySelectors.privacyPolicyLink)).toHaveAttribute('target', '_blank');
        await this.page.locator(privacyPolicySelectors.privacyPolicyLink).evaluate(el => el.setAttribute('target', '_self'));

        // clickAndWaitForUrl( stringToRegex('privacy-policy'), link )
        await Promise.all([
            this.page.waitForURL(/privacy-policy/, { waitUntil: 'domcontentloaded' }),
            this.page.locator(privacyPolicySelectors.privacyPolicyLink).click(),
        ]);
    }

    // privacy policy disabled -> the policy text must not render on the contact form
    async disablePrivacyPolicy(storeName: string): Promise<void> {
        await this.page.goto(this.storeUrl(storeName), { waitUntil: 'networkidle' });
        await expect(this.page.locator(privacyPolicySelectors.privacyPolicy)).toBeHidden();
    }

    // store contact form disabled -> the whole contact form must not render
    async disableStoreContactForm(storeName: string): Promise<void> {
        await this.page.goto(this.storeUrl(storeName), { waitUntil: 'networkidle' });
        await expect(this.page.locator(privacyPolicySelectors.storeContactForm)).toBeHidden();
    }
}
