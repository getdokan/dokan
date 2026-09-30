import { Page, expect, test } from '@utils/test';
import { PrintfulPage, ApiUtils, payloads } from './printfulPage';
import { dbUtils } from '@utils/dbUtils';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Printful module functionality test', () => {
    let admin: PrintfulPage;
    let vendor: PrintfulPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new PrintfulPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new PrintfulPage(vPage);

        apiUtils = new ApiUtils(null);
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);

        // Deterministic state: the vendor Printful settings screen (connect
        // button + shipping toggles) only registers/renders when the module
        // reports is_printful_ready(). That requires non-empty app_id/app_secret
        // in the dokan_printful option, 'seller' as both the shipping-fee and
        // shipping-tax-fee recipient (dokan_selling), and a Printful-supported
        // store currency (USD is supported by default). Seed the OAuth client
        // creds + recipients so the classic settings surface renders.
        await dbUtils.updateOptionValue('dokan_printful', { app_id: 'dokan-e2e-printful-client-id', app_secret: 'dokan-e2e-printful-client-secret' });
        await dbUtils.updateOptionValue('dokan_selling', { shipping_fee_recipient: 'seller', shipping_tax_fee_recipient: 'seller' });
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
        // Restore the seeded OAuth client creds to their default-empty state so
        // is_printful_ready() returns to its original value for other suites.
        await dbUtils.updateOptionValue('dokan_printful', { app_id: '', app_secret: '' });
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enablePrintfulModule();
    });

    test('vendor can view printful menu page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorPrintfulSettingsRenderProperly();
    });

    test.skip('vendor can connect printful account', { tag: ['@pro', '@vendor'] }, async () => { await vendor.connectPrintful(); });
    test.skip('vendor can disconnect printful account', { tag: ['@pro', '@vendor'] }, async () => { await vendor.disconnectPrintful(); });

    test('vendor can enable printful shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('printful'); });
    test('vendor can enable marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('marketplace'); });
    test('vendor can enable both printful and marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('both'); });

    test('admin can disable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await admin.disablePrintfulModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Printful (React) Tests @pro', () => {
    test('Test Case 1 - Vendor printful page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/printful/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Printful page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/printful/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

