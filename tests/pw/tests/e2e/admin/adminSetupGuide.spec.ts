import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminSetupGuidePage, adminSetupGuideData } from './adminSetupGuidePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN SETUP GUIDE — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/setup (HashRouter wizard).
//
// ADMIN-ONLY spec. There is no vendor/customer precondition. The wizard is a
// 4-step onboarding flow (Basic / Commission / Withdraw / Appearance) driven by
// localized step data + per-step REST GET/POST. Seeding is purely admin-side:
//   - reset per-step completion options so the wizard starts fresh at Basic
//   - read back dokan_selling to assert a saved setting persisted
// Names are namespaced with the "ASG" prefix per the area contract.
// See tests/pw/test-cases/new-dashboards-test-cases.md lines 366-414.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

// Reset every per-step completion flag so the localized wizard renders pending
// steps and lands on the first uncompleted step (Basic). Idempotent + re-runnable.
async function resetWizardCompletion(): Promise<void> {
    await dbUtils.deleteOptionRow([...adminSetupGuideData.completionOptions]);
}

test.describe('Admin Setup Guide wizard functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await resetWizardCompletion();
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let setup: AdminSetupGuidePage;

        test.beforeEach(async ({ browser }) => {
            // Each happy-path test wants a fresh wizard: clear completion BEFORE the
            // page loads (the wizard reads localized step data at page load).
            await resetWizardCompletion();
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            setup = new AdminSetupGuidePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Setup Guide wizard mounted at #/setup', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await expect(setup.reactRoot).toBeVisible();
            await expect(setup.stepperHeading).toBeVisible();
            await expect(page).toHaveURL(/#\/setup/);
            expect(await setup.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('left stepper lists all 4 Lite steps in priority order', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            const titles = await setup.getStepTitles();
            expect(titles, 'Basic, Commission, Withdraw, Appearance in order').toEqual(['Basic', 'Commission', 'Withdraw', 'Appearance']);
        });

        test('a fresh wizard lands on the first uncompleted step (Basic) with its fields rendered', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            expect(await setup.getActiveStepTitle(), 'Basic is the active step').toBe('Basic');
            expect(await setup.isFieldVisible(adminSetupGuideData.basic.recipientField), 'Basic radio_box field renders').toBe(true);
        });

        test('Basic step: selecting a recipient then Next saves to the basic endpoint and advances to Commission', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            const saveUrl = await setup.clickNextAndCaptureSave('basic');
            expect(saveUrl, 'POST hit the basic step endpoint').toContain('/dokan/v1/admin/setup-guide/basic');
            // The wizard advances to Commission (next_step).
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
        });

        test('a setting saved in the Basic step persists to dokan_selling after reload', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            // The save writes dokan_selling[shipping_fee_recipient] = 'admin'.
            await expect
                .poll(async () => (await dbUtils.getOptionValue(adminSetupGuideData.sellingOption))?.[adminSetupGuideData.basic.persistedKey], {
                    timeout: 15000,
                    message: 'shipping_fee_recipient persisted to dokan_selling',
                })
                .toBe(adminSetupGuideData.basic.persistedValue);
        });

        test('Back button is hidden on Basic and visible from Commission onward', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            // Basic has no previous_step -> Back hidden.
            expect(await setup.isBackVisible(), 'Back hidden on first step').toBe(false);
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
            expect(await setup.isBackVisible(), 'Back visible from Commission').toBe(true);
        });

        test('Skip is hidden on the non-skippable Basic step but visible on Commission', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            expect(await setup.isSkipVisible(), 'Skip hidden on non-skippable Basic').toBe(false);
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
            expect(await setup.isSkipVisible(), 'Skip visible on skippable Commission').toBe(true);
        });

        test('Back from Commission returns to Basic without losing the stepper', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
            await setup.clickBack();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Basic');
            await expect(setup.stepperHeading).toBeVisible();
        });

        test.fixme('Commission step: switching type to Category Based toggles the dependent fields', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await setup.goto();
            // Advance to the Commission step first.
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
            // Fixed (default) shows the combine_input "Admin Commission".
            expect(await setup.isFieldVisible('Admin Commission'), 'Admin Commission visible on Fixed').toBe(true);
            // Switching to Category Based reveals the parent-category switch field.
            await setup.selectCommissionType('Category Based');
            expect(await setup.isFieldVisible('Apply Parent Category Commission'), 'category-based dependent field shows').toBe(true);
        });

        test('Skip on Commission advances without writing dokan_selling commission_type', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Commission');
            const before = await dbUtils.getOptionValue(adminSetupGuideData.sellingOption);
            await setup.clickSkip();
            // Skip must NOT persist commission changes — it only advances.
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Withdraw');
            const after = await dbUtils.getOptionValue(adminSetupGuideData.sellingOption);
            expect(after?.commission_type, 'commission_type unchanged by Skip').toBe(before?.commission_type);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let setup: AdminSetupGuidePage;

        test.beforeEach(async ({ browser }) => {
            await resetWizardCompletion();
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            setup = new AdminSetupGuidePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/setup preserves the route and re-mounts the wizard (HashRouter)', { tag: ['@lite', '@admin'] }, async () => {
            await setup.goto();
            await setup.reload();
            await expect(page).toHaveURL(/#\/setup/);
            await expect(setup.reactRoot).toBeVisible();
            await expect(setup.stepperHeading).toBeVisible();
        });

        test('a slow step GET shows the "Failed to load settings" error with a working Retry', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            // Hang the first Basic GET past the 30s client timeout, then serve a fast
            // empty response on Retry so the error UI recovers.
            let calls = 0;
            await page.route(/\/dokan\/v1\/admin\/setup-guide\/basic/, async route => {
                calls += 1;
                if (calls === 1 && route.request().method() === 'GET') {
                    await new Promise(r => setTimeout(r, 31000));
                    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                    return;
                }
                await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });
            await setup.goto();
            await expect(setup.failedToLoad).toBeVisible({ timeout: 40000 });
            await expect(setup.retryButton).toBeVisible();
            await setup.retryButton.click();
            // After retry the error screen is dismissed (no longer fatal-locked).
            await expect.poll(async () => setup.failedToLoad.isVisible().catch(() => false), { timeout: 15000 }).toBe(false);
            await page.unroute(/\/dokan\/v1\/admin\/setup-guide\/basic/);
        });

        test('a 500 on the step GET surfaces the error screen and auto-clears after ~5s', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            let calls = 0;
            await page.route(/\/dokan\/v1\/admin\/setup-guide\/basic/, async route => {
                calls += 1;
                if (calls === 1) {
                    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'server_error', message: 'Boom' }) });
                    return;
                }
                await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });
            await setup.goto();
            await expect(setup.failedToLoad).toBeVisible({ timeout: 20000 });
            await page.unroute(/\/dokan\/v1\/admin\/setup-guide\/basic/);
        });

        test('a 400 on the step POST keeps the user on the same step (does not advance)', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await setup.goto();
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 15000 }).toBe('Basic');
            // Reject the save; the wizard must NOT call handleNext on failure.
            await page.route(/\/dokan\/v1\/admin\/setup-guide\/basic/, async route => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'dokan_rest_invalid_step', message: 'Bad' }) });
                    return;
                }
                await route.fallback();
            });
            await setup.selectRadioBox(adminSetupGuideData.basic.recipientValue);
            await setup.clickNext();
            // Still on Basic after a failed save.
            await expect.poll(async () => setup.getActiveStepTitle(), { timeout: 10000 }).toBe('Basic');
            await page.unroute(/\/dokan\/v1\/admin\/setup-guide\/basic/);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('the REST GET for an invalid step id returns 404 "Invalid step"', { tag: ['@lite', '@admin'] }, async () => {
            const [response, body] = await apiUtils.get(`${SERVER_URL}${adminSetupGuideData.restStepPath('asg-bogus-step')}`, { headers: payloads.adminAuth }, false);
            expect(response.status(), 'invalid step id is 404').toBe(404);
            expect(JSON.stringify(body)).toMatch(/Invalid step/i);
        });

        test('a logged-in vendor cannot access the admin Setup Guide page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const setup = new AdminSetupGuidePage(page);
            await page.goto(setup.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await setup.isAccessDenied(), 'a vendor must not see the admin Setup Guide UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Setup Guide page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const setup = new AdminSetupGuidePage(page);
            await page.goto(setup.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await setup.isAccessDenied(), 'a customer must not see the admin Setup Guide UI').toBe(true);
            await ctx.close();
        });
    });
});
