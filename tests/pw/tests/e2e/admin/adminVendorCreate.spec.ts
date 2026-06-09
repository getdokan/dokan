import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminVendorCreatePage, adminVendorCreateData } from './adminVendorCreatePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { faker } from '@faker-js/faker';
import path from 'path';

// ============================================
// ADMIN VENDOR CREATE — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/create (Create.tsx).
//
// ADMIN-ONLY spec. The form renders without any vendor/customer precondition, so
// there is nothing to seed for the happy paths. The one fixture this spec seeds
// via REST (apiUtils.createStore, admin auth) is a single pre-existing vendor —
// used to assert the live "Not Available" username/email availability checks.
// New vendors are created with a unique faker-based email/username/store per run
// and cleaned up via apiUtils in afterAll. This spec never drives the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
// Store names created by happy-path UI submissions, cleaned up in afterAll.
const createdStoreNames: string[] = [];

// A unique vendor identity for a create test — namespaced "AVC" + faker entropy
// so parallel runs never collide and required-field validation has real input.
function uniqueVendor(): { storeName: string; email: string; username: string; password: string } {
    const tag = faker.string.alphanumeric(6).toLowerCase();
    return {
        storeName: `AVC New ${tag}`,
        email: `avc_${tag}@example.test`,
        username: `avc_${tag}`,
        password: faker.internet.password({ length: 16 }),
    };
}

test.describe('Admin Vendor Create functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // Seed one existing vendor (idempotent — createStore updates if present)
        // so the availability-check negatives have a real collision target.
        await apiUtils.createStore(
            {
                ...payloads.createStore(),
                store_name: adminVendorCreateData.existing.storeName,
                user_login: adminVendorCreateData.existing.userLogin,
                email: adminVendorCreateData.existing.email,
            },
            payloads.adminAuth,
        );
    });

    test.afterAll(async () => {
        // Best-effort cleanup of vendors created through the UI this run.
        for (const name of createdStoreNames) {
            const sellerId = await apiUtils.getSellerId(name, payloads.adminAuth).catch(() => '');
            if (sellerId) {
                await apiUtils.deleteUser(sellerId, payloads.adminAuth).catch(() => undefined);
            }
        }
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let createVendor: AdminVendorCreatePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            createVendor = new AdminVendorCreatePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Add New Vendor form with the General/Commission/Social tabs', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await expect(createVendor.reactRoot).toBeVisible();
            await expect(createVendor.heading).toBeVisible();
            await expect(createVendor.backLink).toBeVisible();
            await expect(createVendor.tab(/^General$/)).toBeVisible();
            await expect(createVendor.tab(/^Commission$/)).toBeVisible();
            await expect(createVendor.tab(/^Social Options$/)).toBeVisible();
            expect(await createVendor.isTabActive(/^General$/), 'General tab is active by default').toBe(true);
            expect(await createVendor.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the General tab renders all required fields (store name, email, username, password)', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await expect(createVendor.storeNameInput).toBeVisible();
            await expect(createVendor.storeUrlInput).toBeVisible();
            await expect(createVendor.emailInput).toBeVisible();
            await expect(createVendor.usernameInput).toBeVisible();
            await expect(createVendor.passwordInput).toBeVisible();
            await expect(createVendor.firstNameInput).toBeVisible();
            await expect(createVendor.lastNameInput).toBeVisible();
            await expect(createVendor.addVendorButton).toBeVisible();
        });

        test('filling valid required data and submitting creates the vendor and lands on the list', { tag: ['@lite', '@admin'] }, async () => {
            const v = uniqueVendor();
            createdStoreNames.push(v.storeName);
            await createVendor.goto();
            await createVendor.fillRequiredFields(v);
            await createVendor.submitAndExpectSuccess();
            await expect(page).toHaveURL(/#\/vendors$/);

            // Verify the vendor truly exists via REST (not just the UI navigation).
            await expect.poll(async () => apiUtils.getSellerId(v.storeName, payloads.adminAuth).catch(() => ''), { timeout: 15000 }).toBeTruthy();
        });

        test('typing a store name auto-derives a kebab-case store URL slug', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.fillStoreName('AVC Slug Derive Shop');
            const slug = await createVendor.readStoreUrl();
            expect(slug, 'store URL is derived as kebab-case of the store name').toMatch(/avc-slug-derive-shop/);
        });

        test('focusing the empty password field auto-generates a value and Generate replaces it', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.passwordInput.click(); // onFocus generates when empty.
            await page.waitForTimeout(400);
            const first = await createVendor.readPassword();
            expect(first.length, 'a password is auto-generated on focus').toBeGreaterThan(0);
            const second = await createVendor.clickGenerate();
            expect(second.length, 'Generate produces a non-empty password').toBeGreaterThan(0);
            expect(second, 'Generate replaces the previous password').not.toBe(first);
        });

        test('switching to the Commission tab activates it', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.clickTab(/^Commission$/);
            expect(await createVendor.isTabActive(/^Commission$/), 'Commission tab becomes active').toBe(true);
        });

        test('a free store URL slug shows the live "Available" indicator', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.fillStoreUrl(`avc-free-${faker.string.alphanumeric(6).toLowerCase()}`);
            expect(await createVendor.isStoreUrlAvailable(), 'a never-used slug is reported Available').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let createVendor: AdminVendorCreatePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            createVendor = new AdminVendorCreatePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('phone field strips disallowed characters, keeping only digits and . - _ ( ) +', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.fillPhone('abc+1 (800) 555-1234xyz');
            const phone = await createVendor.readPhone();
            expect(phone, 'letters and spaces are stripped from the phone field').toBe('+1(800)555-1234');
        });

        test('reloading the deep-linked #/vendors/create URL re-mounts the create form', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.reload();
            await expect(page).toHaveURL(/#\/vendors\/create/);
            await expect(createVendor.reactRoot).toBeVisible();
            await expect(createVendor.heading).toBeVisible();
            expect(await createVendor.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });

        test('an already-registered username shows the "Not Available" indicator', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.fillUsername(adminVendorCreateData.existing.userLogin);
            expect(await createVendor.isNotAvailableShown(), 'a taken username is flagged Not Available').toBe(true);
        });

        test('an already-registered email shows the "Not Available" indicator', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            await createVendor.fillEmail(adminVendorCreateData.existing.email);
            expect(await createVendor.isNotAvailableShown(), 'a taken email is flagged Not Available').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let createVendor: AdminVendorCreatePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            createVendor = new AdminVendorCreatePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('submitting with all required fields empty blocks the POST and surfaces required-field errors', { tag: ['@lite', '@admin'] }, async () => {
            await createVendor.goto();
            const posted = await createVendor.submitAndDetectPost();
            expect(posted, 'client-side validateForm must block the create POST').toBe(false);
            await expect(page).toHaveURL(/#\/vendors\/create/);
            expect(await createVendor.hasFieldError(/Store Name is required|required/i), 'a required-field error renders').toBe(true);
        });

        test('a logged-in vendor cannot access the admin Vendor Create page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vendorView = new AdminVendorCreatePage(vpage);
            await vpage.goto(vendorView.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vendorView.isAccessDenied(), 'a vendor must not see the admin create form').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot access the admin Vendor Create page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const customerView = new AdminVendorCreatePage(cpage);
            await cpage.goto(customerView.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await customerView.isAccessDenied(), 'a customer must not see the admin create form').toBe(true);
            await cctx.close();
        });
    });
});
