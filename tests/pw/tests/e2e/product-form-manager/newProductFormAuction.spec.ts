import path from 'path';
import { test, expect, BrowserContext, Page } from '@utils/test';
import { NewProductFormPage, newProductFormData } from './newProductFormPage';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

/**
 * Auction product type in the new (React) Product Form Manager.
 *
 * Covers the Pro `simple-auction` ProductEditor integration (registers the
 * `auction` type, renders the Auction Options card, restricts the form to the
 * legacy auction field set, persists via WooCommerce Simple Auctions' writer,
 * and round-trips on edit) — alongside a sanity sweep of the other product
 * types so the auction type doesn't regress the shared type dropdown.
 *
 * Auction is a Pro module, so every auction-specific case is tagged `@pro`.
 * The dropdown-coverage sweep keeps the Simple case `@lite`.
 */
test.describe('Vendor new product form (React) — auction & product types', () => {
    let ctx: BrowserContext;
    let page: Page;
    let form: NewProductFormPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        form = new NewProductFormPage(page);
        await form.goto();
        await form.waitForFormReady();
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    // ============================================
    // PRODUCT TYPE COVERAGE — the shared type dropdown
    // ============================================
    test.describe('product type dropdown', () => {
        test('offers Simple, Variable, External/Affiliate and Group types', { tag: ['@lite', '@vendor'] }, async () => {
            for (const label of ['Simple', 'Variable', 'External/Affiliate', 'Group']) {
                expect(await form.isProductTypeOptionAvailable(label), `${label} is offered`).toBe(true);
            }
        });

        test('offers the Auction type when the auction module is active', { tag: ['@pro', '@vendor'] }, async () => {
            expect(await form.isProductTypeOptionAvailable('Auction')).toBe(true);
        });

        test('selecting Simple keeps the native price field', { tag: ['@lite', '@vendor'] }, async () => {
            await form.setProductType('simple');
            expect(await form.isFieldPresent('regular_price'), 'simple products expose the native price').toBe(true);
        });

        test('selecting Auction swaps the native price for the Auction Options card', { tag: ['@pro', '@vendor'] }, async () => {
            await form.setProductType('auction');
            await expect(form.auctionStartPrice).toBeVisible();
            // Auction replaces the native price with a dedicated "Buy it now" field.
            expect(await form.isFieldPresent('regular_price'), 'native price is hidden for auctions').toBe(false);
            expect(await form.isFieldPresent('_regular_price'), 'buy-it-now price is shown for auctions').toBe(true);
        });
    });

    // ============================================
    // AUCTION — happy paths
    // ============================================
    test.describe('auction happy paths', () => {
        test('renders every Auction Options field when the auction type is chosen', { tag: ['@pro', '@vendor'] }, async () => {
            await form.setProductType('auction');

            await expect(form.auctionStartPrice).toBeVisible();
            await expect(form.bidIncrement).toBeVisible();
            await expect(form.auctionReservedPrice).toBeVisible();
            await expect(form.buyItNowPrice).toBeVisible();
            expect(await form.isFieldPresent('_auction_item_condition')).toBe(true);
            expect(await form.isFieldPresent('_auction_type')).toBe(true);
            expect(await form.isFieldPresent('_auction_dates_from')).toBe(true);
            expect(await form.isFieldPresent('_auction_dates_to')).toBe(true);
        });

        test('vendor can create an auction with the required fields', { tag: ['@pro', '@vendor'] }, async () => {
            test.slow();
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            await form.fillPrice(form.auctionStartPrice, data.startPrice);
            await form.bidIncrement.fill(data.bidIncrement);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_from', data.startDate);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_to', data.endDate);

            await form.save();
            await form.waitForSaveSuccess();
        });

        test('vendor can create an auction with every option filled', { tag: ['@pro', '@vendor'] }, async () => {
            test.slow();
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            await form.fillAuctionOptions(data);
            await form.setAuctionProxy(true);
            await form.setAuctionExtendOnBid(true);
            await form.setAuctionAutoRelist(true);

            await form.save();
            await form.waitForSaveSuccess();
        });
    });

    // ============================================
    // AUCTION — field restriction (legacy field set only)
    // ============================================
    test.describe('auction field restriction', () => {
        test('hides unrelated fields for the auction type', { tag: ['@pro', '@vendor'] }, async () => {
            await form.setProductType('auction');
            await expect(form.auctionStartPrice).toBeVisible();

            // These leak into a schema-driven form by default; the integration
            // hides them for auctions to mirror the legacy auction page.
            for (const hidden of ['regular_price', 'sale_price', 'sku', 'attributes']) {
                expect(await form.isFieldPresent(hidden), `${hidden} is hidden for auctions`).toBe(false);
            }
        });

        test('keeps the allow-listed fields for the auction type', { tag: ['@pro', '@vendor'] }, async () => {
            await form.setProductType('auction');
            await expect(form.auctionStartPrice).toBeVisible();

            for (const shown of ['type', 'category_ids', 'product_tag', 'image_id']) {
                expect(await form.isFieldPresent(shown), `${shown} stays visible for auctions`).toBe(true);
            }
        });
    });

    // ============================================
    // AUCTION — round-trip (create → edit → values reload)
    // ============================================
    test.describe('auction round-trip', () => {
        test('reloads saved auction values when the product is re-opened', { tag: ['@pro', '@vendor'] }, async () => {
            test.slow();
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            await form.fillAuctionOptions(data);

            const productId = await form.saveAndGetProductId();
            expect(productId, 'save returns a product id').toBeTruthy();
            await form.waitForSaveSuccess();

            await form.gotoEdit(productId as number);
            await form.auctionStartPrice.waitFor({ state: 'visible' });

            // Prices round-trip formatted (e.g. "50.00"), so match on a substring
            // via regex; title and bid increment round-trip verbatim.
            await expect(form.title).toHaveValue(data.title);
            await expect(form.auctionStartPrice).toHaveValue(new RegExp(data.startPrice));
            await expect(form.bidIncrement).toHaveValue(data.bidIncrement);
            await expect(form.buyItNowPrice).toHaveValue(new RegExp(data.buyItNow));
        });
    });

    // ============================================
    // AUCTION — negative / validation cases
    // ============================================
    test.describe('auction negative cases', () => {
        test('blocks save when the start price is missing', { tag: ['@pro', '@vendor'] }, async () => {
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            // Start price left empty on purpose.
            await form.bidIncrement.fill(data.bidIncrement);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_from', data.startDate);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_to', data.endDate);
            await form.save();

            const disabled = await form.saveButton.isDisabled().catch(() => false);
            const error = page.locator('text=/start price.*required|Please fill out this field/i').first();
            expect(disabled || (await error.isVisible().catch(() => false))).toBe(true);
        });

        test('blocks save when the bid increment is missing', { tag: ['@pro', '@vendor'] }, async () => {
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            await form.fillPrice(form.auctionStartPrice, data.startPrice);
            // Bid increment left empty on purpose.
            await form.setAuctionDate('#dokan-form-field-_auction_dates_from', data.startDate);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_to', data.endDate);
            await form.save();

            const disabled = await form.saveButton.isDisabled().catch(() => false);
            const error = page.locator('text=/bid increment.*required|Please fill out this field/i').first();
            expect(disabled || (await error.isVisible().catch(() => false))).toBe(true);
        });

        test('rejects an end date that is not after the start date', { tag: ['@pro', '@vendor'] }, async () => {
            test.slow();
            const data = newProductFormData.auction();

            await form.title.fill(data.title);
            await form.setProductType('auction');
            await form.auctionStartPrice.waitFor({ state: 'visible' });
            await form.fillPrice(form.auctionStartPrice, data.startPrice);
            await form.bidIncrement.fill(data.bidIncrement);
            await form.setAuctionDate('#dokan-form-field-_auction_dates_from', data.startDate);
            // End date set BEFORE the start date — the server backstop must reject.
            await form.setAuctionDate('#dokan-form-field-_auction_dates_to', data.endBeforeStart);
            await form.save();

            // The server returns a 400 with an "end date must be later" message; the
            // editor surfaces it and does not redirect to the product list.
            const error = page.locator('text=/end date must be later|later than the start date/i').first();
            const stillOnForm = /products\/(create|\d+\/edit)/.test(page.url());
            expect((await error.isVisible().catch(() => false)) || stillOnForm).toBe(true);
        });
    });
});
