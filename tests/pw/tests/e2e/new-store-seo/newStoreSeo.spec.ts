import { test, expect, Page, BrowserContext } from '@utils/test';
import { NewStoreSeoPage, newStoreSeoData } from './newStoreSeoPage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Store SEO settings.
// Surface: /dashboard/new/#/settings/seo  (form, Pro).
// Ported from the legacy `store-seo` spec, driving the React UI, with the
// cross-role business flow (vendor saves SEO -> guest sees it in the store
// <head>). Store SEO is a vendor-only dashboard route (capability
// `dokan_view_store_seo_menu`), so there are no admin/customer dashboard cases.
// ============================================

test.describe('Store SEO (React) functionality', () => {
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let seo: NewStoreSeoPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            seo = new NewStoreSeoPage(page);
            await seo.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view store SEO settings page (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(seo.heading).toBeVisible();
            await expect(seo.metaTitle).toBeVisible();
            await expect(seo.metaDesc).toBeVisible();
            await expect(seo.metaKeywords).toBeVisible();
            await expect(seo.ogTitle).toBeVisible();
            await expect(seo.twitterTitle).toBeVisible();
            await expect(seo.saveButton).toBeVisible();
            expect(await seo.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can save SEO meta + Facebook + X fields (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const data = newStoreSeoData.seo();
            await seo.fillSeo(data);
            await seo.save();
            await expect(seo.successNotice).toBeVisible();
        });

        test('vendor store SEO values persist after reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Strong assertion: every saved field survives a full reload.
            await seo.saveAndVerifyPersisted(newStoreSeoData.seo());
        });

        test('vendor can update a single SEO field (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const updated = `${newStoreSeoData.seo().metaTitle} updated`;
            await seo.saveAndVerifyPersisted({ metaTitle: updated });
            await expect(seo.metaTitle).toHaveValue(updated);
        });

        test('vendor can clear a saved SEO field (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // First seed a value, then clear it and confirm the empty state persists.
            await seo.saveAndVerifyPersisted({ metaKeywords: newStoreSeoData.seo().metaKeywords });
            await seo.saveAndVerifyPersisted({ metaKeywords: '' });
            await expect(seo.metaKeywords).toHaveValue('');
        });
    });

    test.describe('business flow', () => {
        test('vendor sets store SEO then a guest sees it in the storefront head (React)', { tag: ['@pro', '@vendor', '@guest', '@new-ui'] }, async ({ browser }) => {
            const data = newStoreSeoData.seo();

            // 1. Vendor saves SEO meta + og + twitter in the React settings form.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const seo = new NewStoreSeoPage(vPage);
            await seo.goto();
            await seo.saveAndVerifyPersisted(data);
            await vPage.close();
            await vCtx.close();

            // 2. A guest (fresh, unauthenticated context) visits the store and
            //    the saved values are reflected in the page <head>.
            const gCtx = await browser.newContext();
            const gPage = await gCtx.newPage();
            const guest = new NewStoreSeoPage(gPage);
            const head = await guest.getStorefrontSeo();

            // Meta title drives the document <title> (document_title_parts filter).
            expect(head.title, 'storefront <title> reflects saved SEO title').toContain(newStoreSeoData.handle);
            // og / twitter social tags are printed into the head from user meta.
            expect(head.ogTitle, 'og:title reflects saved Facebook title').toBe(data.ogTitle);
            expect(head.ogDescription, 'og:description reflects saved Facebook description').toBe(data.ogDesc);
            expect(head.twitterTitle, 'twitter:title reflects saved X title').toBe(data.twitterTitle);
            expect(head.twitterDescription, 'twitter:description reflects saved X description').toBe(data.twitterDesc);

            await gPage.close();
            await gCtx.close();
        });
    });
});
