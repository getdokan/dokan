import { test, expect, Page, BrowserContext } from '@utils/test';
import { NewShippingPage, newShippingData } from './newShippingPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// Build a one-of-a-kind Method Title so a row can be asserted/removed in
// isolation even if a same-type ("Flat rate") method is left over from another
// test or a previous run — a generic `/Flat rate/i` locator would otherwise
// stay visible after we delete OUR method and break the removal assertion.
const uniqueTitle = (label: string): string => `${label} PW-${Date.now()}`;

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Shipping settings.
// Surface: /dashboard/new/#/settings/shipping  (DataViews zones list, Pro).
// Ported from the legacy `vendor-shipping` spec, driving the React UI.
// The seeded fixture has one "US" zone with no methods; destructive edits add
// throwaway methods and clean them up so the seeded zone keeps working.
// ============================================

test.describe('Shipping (React) functionality', () => {
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let shipping: NewShippingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            shipping = new NewShippingPage(page);
            await shipping.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view shipping settings page with the zone table (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(shipping.heading).toBeVisible();
            await expect(shipping.table).toBeVisible();
            await expect(shipping.policyButton).toBeVisible();
            expect(await shipping.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the seeded US zone row (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(shipping.seededZoneRow()).toBeVisible();
            expect(await shipping.getRowCount(), 'at least the seeded zone row').toBeGreaterThan(0);
        });

        test('vendor can open a zone and reach the zone edit view (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            expect(shipping.isOnZoneEditView(), 'URL hash is #/settings/shipping/:zoneID').toBe(true);
            await expect(shipping.shippingMethodsHeading).toBeVisible();
            await expect(shipping.addMethodButton).toBeVisible();
        });

        test('vendor can open a zone via the row action menu (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneViaRowAction(0);
            expect(shipping.isOnZoneEditView(), 'URL hash is #/settings/shipping/:zoneID').toBe(true);
            await expect(shipping.shippingMethodsHeading).toBeVisible();
        });

        test('vendor can add flat rate shipping to a zone (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            // The shared US zone is polluted with leftover generic "Flat Rate"
            // rows from prior runs, so add the method under a UNIQUE per-run
            // Method Title and assert presence/removal of THAT exact row only —
            // a generic `/Flat rate/i` row would stay visible after our delete
            // and the removal assertion could never hold.
            const title = uniqueTitle('Flat rate');
            await shipping.addMethodWithUniqueTitle(newShippingData.methods.flatRate, title, newShippingData.editedCost);
            expect(await shipping.isMethodListedExact(title), 'flat rate listed').toBe(true);
            // Clean up so the seeded zone is left as found.
            await shipping.deleteShippingMethod(title);
        });

        test('vendor can add free shipping to a zone (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            const title = uniqueTitle('Free shipping');
            await shipping.addMethodWithUniqueTitle(newShippingData.methods.freeShipping, title);
            expect(await shipping.isMethodListedExact(title), 'free shipping listed').toBe(true);
            await shipping.deleteShippingMethod(title);
        });

        test('vendor can edit a shipping method (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            // The methods table's title column renders the method's Method Title
            // (settings.title), so editing the title DOES change the visible row
            // label. Rename to a unique title with literal parentheses to prove
            // the edit persisted; the exact-title locator matches it literally
            // (an unescaped `(PW edited)` in a regex would be a capture group and
            // would match "Flat rate PW edited", not the real "(PW edited)").
            // addMethodWithUniqueTitle adds a flat-rate method then renames the
            // JUST-ADDED row (last same-type row) — never a leftover from a
            // prior run on the polluted shared zone.
            const newTitle = `Flat rate (PW edited ${Date.now()})`;
            await shipping.addMethodWithUniqueTitle(newShippingData.methods.flatRate, newTitle, newShippingData.editedCost);
            expect(await shipping.isMethodListedExact(newTitle), 'edited title listed').toBe(true);
            // Clean up the throwaway method (now under the new title).
            await shipping.deleteShippingMethod(newTitle);
        });

        test('vendor can delete a shipping method (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            // Unique title so the post-delete absence assertion targets exactly
            // this method — the shared US zone keeps leftover generic same-type
            // rows from prior runs, which a loose matcher would never see go away.
            const title = uniqueTitle('Free shipping');
            await shipping.addMethodWithUniqueTitle(newShippingData.methods.freeShipping, title);
            expect(await shipping.isMethodListedExact(title), 'method present before delete').toBe(true);
            await shipping.deleteShippingMethod(title);
            expect(await shipping.isMethodListedExact(title), 'method gone after delete').toBe(false);
        });

        test('vendor can open the shipping policy section (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openShippingPolicies();
            expect(shipping.isOnPolicyView(), 'URL hash is #/settings/shipping/settings').toBe(true);
            await expect(shipping.processingTimeHeading).toBeVisible();
            await expect(shipping.refundPolicyHeading).toBeVisible();
        });

        test('vendor shipping page survives a reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(shipping.seededZoneRow()).toBeVisible();
            await shipping.reload();
            await expect(shipping.heading).toBeVisible();
            await expect(shipping.seededZoneRow()).toBeVisible();
            expect(await shipping.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });

        test('added method persists in the zone after reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            // Give the throwaway method a unique title so the persistence and
            // cleanup assertions target THIS method only — a generic
            // `/Flat rate/i` locator would also match any leftover same-type row
            // and the post-delete "hidden" assertion could never hold.
            const title = uniqueTitle('Flat rate');
            await shipping.addMethodWithUniqueTitle(newShippingData.methods.flatRate, title, newShippingData.editedCost);
            await shipping.page.reload({ waitUntil: 'domcontentloaded' });
            await shipping.waitForZoneEditReady();
            expect(await shipping.isMethodListedExact(title), 'method survives reload').toBe(true);
            await shipping.deleteShippingMethod(title);
        });

        // ---- Edge / negative ----
        test('opening the add-method modal then closing leaves the zone unchanged (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await shipping.openZoneByName();
            const before = await shipping.getMethodRowCount();
            await shipping.addMethodButton.click();
            await expect(shipping.dialog).toBeVisible();
            // Close without choosing a method.
            await shipping.page.locator('[role="dialog"] button[aria-label="Close"]').first().click();
            await expect(shipping.dialog).toBeHidden();
            expect(await shipping.getMethodRowCount(), 'no method added on cancel').toBe(before);
        });
    });

    test.describe('admin', () => {
        // The shipping zones surface is the *vendor* React dashboard. An admin
        // account is not a vendor store, so it has no shipping menu/zone there.
        // The meaningful admin-side parity check is that the route does not leak
        // a PHP fatal / blank crash when an admin (non-vendor) loads it — it
        // should render the dashboard shell or a graceful not-found, never a
        // fatal. (Admin shipping management proper lives in wp-admin / WC, not
        // this React surface.)
        test('admin loading the vendor shipping route does not produce a PHP fatal (React)', { tag: ['@pro', '@admin', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const shipping = new NewShippingPage(page);
            await page.goto(shipping.url);
            await page.waitForLoadState('domcontentloaded');
            await shipping.waitForReactReady().catch(() => undefined);
            expect(await shipping.hasNoPhpFatal(), 'no PHP fatal for admin').toBe(true);
            await page.close();
            await ctx.close();
        });
    });

    test.describe('customer', () => {
        // A customer is also not a vendor, so the React shipping settings route
        // is not their surface. The customer-facing parity is "a customer at
        // checkout sees the vendor's shipping option". Full WC Blocks checkout
        // (cart hydration + billing combobox + shipping recalculation) is heavy
        // and non-deterministic in this environment, so per the task spec it is
        // skipped with an explicit reason rather than faked. The deterministic
        // half (vendor configures a method, it is reflected) is covered by the
        // vendor + business-flow tests above/below.
        test('customer at checkout sees the vendor shipping option (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async () => {
            test.skip(true, 'WC Blocks checkout shipping recalculation for a vendor per-zone method is not deterministic here; vendor-side configuration is covered by the React vendor tests.');
        });

        test('customer loading the vendor shipping route does not produce a PHP fatal (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const shipping = new NewShippingPage(page);
            await page.goto(shipping.url);
            await page.waitForLoadState('domcontentloaded');
            await shipping.waitForReactReady().catch(() => undefined);
            expect(await shipping.hasNoPhpFatal(), 'no PHP fatal for customer').toBe(true);
            await page.close();
            await ctx.close();
        });
    });

    test.describe('business flow', () => {
        test('vendor configures a flat-rate method on the zone and it is reflected back in the React UI (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Cross-role intent is "vendor configures shipping -> customer
            // checkout reflects it". The customer/checkout half is skipped above
            // with a documented reason (non-deterministic WC Blocks checkout), so
            // this flow verifies the vendor-side end-to-end: open zone -> add a
            // method -> the method is listed AND survives a fresh navigation
            // (i.e. it was persisted, which is exactly what checkout consumes).
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const shipping = new NewShippingPage(page);

            // Unique title so this flow's assertions/cleanup target exactly the
            // method it configures, independent of any other same-type row.
            const title = uniqueTitle('Flat rate');
            try {
                await shipping.goto();
                await shipping.openZoneByName();
                await shipping.addMethodWithUniqueTitle(newShippingData.methods.flatRate, title, newShippingData.editedCost);
                expect(await shipping.isMethodListedExact(title), 'method configured').toBe(true);

                // Re-navigate from scratch to prove persistence (checkout reads
                // this same persisted zone data).
                await shipping.goto();
                await shipping.openZoneByName();
                expect(await shipping.isMethodListedExact(title), 'method persisted across navigation').toBe(true);

                // Clean up so the seeded zone is left as found.
                await shipping.deleteShippingMethod(title);
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
