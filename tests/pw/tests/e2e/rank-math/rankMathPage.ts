// tests/e2e/rank-math/rankMathPage.ts
//
// Page object + REST seeder for the Dokan Pro "Rank Math SEO" module.
//
// The module (dokan-pro/modules/rank-math) injects a Rank Math SEO panel into
// the vendor product editor and exposes two REST routes under `dokan/v2/rank-math`:
//   • POST .../{id}/store-current-editable-post  → stores the post id in user meta
//   • GET  .../{id}/editor-data                  → re-seeds the metabox payload on SPA switch
//
// The module short-circuits unless the Rank Math SEO plugin is present
// (DependencyNotice) and the current user has `dokan_edit_product`. The
// vendor-facing UI assertions are therefore written resiliently — they prove the
// module loaded (SEO section heading / mount node) OR that the dependency notice
// is shown, and always guard against a fatal error, mirroring the storeSeo suite.

import { Page, APIResponse, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { responseBody } from '@utils/interfaces';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { toPath, SERVER_URL, closeAnnouncementModal } from '@utils/helpers';

const { PRODUCT_EDIT_NONCE } = process.env;

// SELECTORS ------------------------------------------------------
export const rankMathSelectors = {
    // Legacy (pre-5.0.0) vendor product editor — templates/product-seo-content.php
    legacy: {
        sectionHeading: 'h2:has-text("Rank Math SEO")',
        mountWrapper: '#rank-math-metabox-wrapper',
        hiddenTitle: '#title',
        hiddenPostName: '#post_name',
    },
    // New (5.0.0+) Product Form Manager card — ProductEditorFields::SECTION_RANK_MATH_SEO
    newEditor: {
        seoCard: 'text=Rank Math SEO',
        panelDescription: 'text=Manage SEO for this product',
    },
    // Proves the module booted even when the Rank Math plugin itself is missing.
    dependencyNotice: 'text=/Rank Math SEO/i',
    fatal: 'text=/Fatal error|Parse error|There has been a critical error|critical error/i',
};

// REST seeder + module helpers (used by spec beforeAll/afterAll and tests) ----
export const api = {
    utils: null as unknown as ApiUtils,

    async init(): Promise<void> {
        this.utils = new ApiUtils(await request.newContext());
    },

    async dispose(): Promise<void> {
        await this.utils?.dispose();
    },

    // Seed a published simple product owned by the given vendor (defaults to vendor1).
    async createVendorProduct(auth = payloads.vendorAuth): Promise<string> {
        const [, productId] = await this.utils.createProduct(payloads.createProductRequiredFields(), auth);
        return productId;
    },

    async deleteProduct(productId: string, auth = payloads.adminAuth): Promise<void> {
        if (productId) {
            await this.utils.deleteProduct(productId, auth);
        }
    },

    async activateRankMath(): Promise<void> {
        await this.utils.activateModules(payloads.moduleIds.rankMath, payloads.adminAuth);
    },

    async deactivateRankMath(): Promise<void> {
        await this.utils.deactivateModules(payloads.moduleIds.rankMath, payloads.adminAuth);
    },

    async isRankMathActive(): Promise<boolean> {
        const ids = await this.utils.getAllModuleIds({ status: 'active' }, payloads.adminAuth);
        return ids.includes(payloads.moduleIds.rankMath);
    },

    // POST .../{id}/store-current-editable-post — returns the raw [response, body].
    // assert=false so non-2xx responses (negative cases) don't throw before we assert.
    async storeCurrentEditablePost(productId: string, auth?: Record<string, string>): Promise<[APIResponse, responseBody]> {
        return this.utils.post(endPoints.rankMath(productId), { headers: auth }, false);
    },

    // GET .../{id}/editor-data — sibling read route the SPA hits on product switch.
    async getEditorData(productId: string, auth?: Record<string, string>): Promise<[APIResponse, responseBody]> {
        const url = `${SERVER_URL}/dokan/v2/rank-math/${productId}/editor-data`;
        return this.utils.get(url, { headers: auth }, false);
    },
};

// PAGE OBJECT ----------------------------------------------------
export class RankMathPage {
    constructor(readonly page: Page) {
        // Auto-dismiss the Dokan Pro vendor announcement modal (setup.md §10).
        void closeAnnouncementModal(page);
    }

    // Open a seeded product in the vendor (legacy) product editor.
    async gotoVendorProductEditor(productId: string): Promise<void> {
        await this.page.goto(toPath(`dashboard/new/#products/${productId}/edit`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
    }

    // Hard guard: the editor never renders a PHP fatal / critical error.
    async assertNoFatal(): Promise<void> {
        const fatal = await this.page
            .locator(rankMathSelectors.fatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        expect(fatal).toBe(false);
    }

    // Hard guard: the editor renders substantial content (not a blank/500 page).
    async assertRendersContent(minChars = 50): Promise<void> {
        const bodyText = await this.page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(minChars);
    }

    // The Rank Math SEO surface is discoverable: the metabox mount node, the
    // section heading, or — when the Rank Math plugin is absent — the dependency
    // notice. Any of these proves the module booted on this page.
    async assertSeoSectionPresent(): Promise<void> {
        const candidates = [rankMathSelectors.legacy.mountWrapper, rankMathSelectors.legacy.sectionHeading, rankMathSelectors.dependencyNotice];
        let found = false;
        for (const selector of candidates) {
            const visible = await this.page
                .locator(selector)
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false);
            if (visible) {
                found = true;
                break;
            }
        }
        expect(found, 'Rank Math SEO section / dependency notice should be present').toBe(true);
    }

    // Negative: with the module disabled the metabox mount node must NOT render.
    async assertSeoSectionAbsent(): Promise<void> {
        await expect(this.page.locator(rankMathSelectors.legacy.mountWrapper)).toHaveCount(0);
    }
}
