import { test, expect, Page, BrowserContext } from '@utils/test';
import { NewSocialPage, newSocialData } from './newSocialPage';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Social Profiles
// settings. Surface: /dashboard/new/#/settings/social  (form, Pro).
// Ported from the legacy `social-linking` spec, driving the React UI, with the
// cross-role business flow (vendor saves -> guest sees on storefront).
// ============================================

test.describe('Social Profiles (React) functionality', () => {
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let social: NewSocialPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            social = new NewSocialPage(page);
            await social.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view social profiles settings page (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(social.heading).toBeVisible();
            await expect(social.fb).toBeVisible();
            expect(await social.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can save social profile links (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await social.saveAndVerifyPersisted(newSocialData.profiles());
        });

        test('vendor social links persist after reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const data = newSocialData.profiles();
            await social.fillProfiles(data);
            await social.submit();
            await social.goto();
            await expect(social.fb).toHaveValue(data.fb);
            await expect(social.linkedin).toHaveValue(data.linkedin);
        });

        test('vendor can clear a social link (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await social.saveAndVerifyPersisted({ instagram: newSocialData.profiles().instagram });
            await social.clearField('instagram');
            await social.goto();
            await expect(social.instagram).toHaveValue('');
        });
    });

    test.describe('business flow', () => {
        test('vendor sets social links then guest sees them on the storefront (React)', { tag: ['@pro', '@vendor', '@guest', '@new-ui'] }, async ({ browser }) => {
            // 1. Vendor saves social profiles in the React settings form.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const social = new NewSocialPage(vPage);
            await social.goto();
            const data = newSocialData.profiles();
            await social.saveAndVerifyPersisted(data);
            await vPage.close();
            await vCtx.close();

            // 2. A guest (fresh, unauthenticated context) visits the store and
            //    sees the saved links rendered in the store social widget.
            const gCtx = await browser.newContext();
            const gPage = await gCtx.newPage();
            const guest = new NewSocialPage(gPage);
            const links = await guest.getStoreSocialLinks();
            expect(links.length, 'store renders social links').toBeGreaterThan(0);
            expect(links.some(href => href.includes(newSocialData.handle)), `a saved link (${newSocialData.handle}) is shown on the storefront`).toBe(true);
            await gPage.close();
            await gCtx.close();
        });
    });
});
