import { Page, expect, test } from '@playwright/test';
import { MinMaxQuantitiesPage, api, payloads } from './minMaxQuantitiesPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Min max quantities test', () => {
    let admin: MinMaxQuantitiesPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new MinMaxQuantitiesPage(aPage);
        await api.init();
    });

    test.afterAll(async () => {
        await api.activateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await aPage?.close();
        await api.dispose();
    });

    test('admin can enable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableMinMaxQuantitiesModule();
    });

    test('admin can disable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await admin.disableMinMaxQuantitiesModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Min/Max Quantities (React) Tests @pro', () => {
    test('Test Case 1 - Admin settings page renders without fatal', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/settings`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

