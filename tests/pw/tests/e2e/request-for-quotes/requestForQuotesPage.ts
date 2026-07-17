import { Page, Response, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Request for Quotation — ported from the pre-refactor page object
// (git e2ec507de:tests/pw/pages/requestForQuotationsPage.ts) into the current
// self-contained architecture. Covers the admin Quotes List CRUD/bulk surface
// (wp-admin admin.php?page=dokan#/request-for-quote), the vendor dashboard
// "Request for Quotation" screens, and the customer/guest request-for-quote
// storefront + my-account flows.
//
// Base-class helpers from the reference are inlined as raw Playwright:
//   toBeVisible(x)                          -> expect(page.locator(x)).toBeVisible()
//   notToBeVisible(x)                       -> expect(page.locator(x)).toBeHidden()
//   toContainText(x,t)                      -> expect(page.locator(x)).toContainText(t)
//   multipleElementVisible(group)           -> recurse-assert every string selector visible
//   clearAndType(x,v)                       -> page.locator(x).fill(v)
//   click(x)/hover(x)/press(k)              -> page.locator(x).click()/.hover()/keyboard.press(k)
//   selectByValue(x,v)                      -> page.selectOption(x,{value})
//   getElementText(x)                       -> page.locator(x).textContent()
//   isVisible(x)                            -> short poll -> boolean
//   goto(u)/goIfNotThere(u)                 -> page.goto(toPath(u)) [conditionally]
//   clickAndWaitForResponse(u,x,c)          -> Promise.all([waitForResponse, click])
//   clickAndWaitForResponseAndLoadState     -> + waitForLoadState('load')
//   clickAndWaitForLoadState(x,s)           -> Promise.all([waitForLoadState, click])
//   typeAndWaitForResponse(u,x,v,c)         -> Promise.all([waitForResponse, fill])
//   forceLinkToSameTab(x)                   -> flip target=_blank -> _self
// ============================================================================

// ---------------------------------------------------------------------------
// Re-export the REAL shared test data, payloads and db helpers so the spec's
// import contract ({ RequestForQuotationsPage, ApiUtils, data, dbUtils,
// payloads }) is wired to the real utilities (not local no-op stubs).
// ---------------------------------------------------------------------------
export { data };
export { payloads } from '@utils/payloads';
export { dbUtils } from '@utils/dbUtils';

// Method parameter shapes are derived from the real testData entries the spec
// passes in, guaranteeing exact structural compatibility.
type QuoteData = ReturnType<typeof data.requestForQuotation.quote>;
type GuestData = ReturnType<typeof data.requestForQuotation.guest>;
type VendorQuoteData = typeof data.requestForQuotation.vendorUpdateQuote & { productName: string };
type CustomerQuoteData = typeof data.requestForQuotation.customerQuoteProduct & { productName: string };

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)` but the real ApiUtils requires an
 * APIRequestContext. When null is passed we lazily create our own request
 * context and swap it in before the first real REST call (create product /
 * quote request / quote rule, update payment gateway, convert to order or
 * dispose). Mirrors the sibling ported suites.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
    }

    override async patch(...args: Parameters<RealApiUtils['patch']>): ReturnType<RealApiUtils['patch']> {
        await this.ready();
        return super.patch(...args);
    }

    override async delete(...args: Parameters<RealApiUtils['delete']>): ReturnType<RealApiUtils['delete']> {
        await this.ready();
        return super.delete(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SELECTORS (ported verbatim from pre-refactor selectors.ts)
//   admin    -> selector.admin.dokan.requestForQuotation (quotes list only)
//   vendor   -> selector.vendor.vRequestQuotes
//   customer -> selector.customer.cRequestForQuote
// plus the order-details / checkout / my-orders selectors the pay flow needs.
// ============================================================================
const rfqAdmin = {
    menus: {
        quoteList: '//a[normalize-space()="Quotes List"]',
        quoteRules: '//a[normalize-space()="Quote Rules"]',
    },

    quotesList: {
        quotesText: '.dokan-quote-wrapper h1',
        newQuote: '.page-title-action',

        // Nav Tabs
        navTabs: {
            all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
            pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
            draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
            converted: '//ul[@class="subsubsub"]//li//a[contains(text(),"Converted")]',
            approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
            trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
        },

        // Bulk Actions
        bulkActions: {
            selectAll: 'thead .manage-column input',
            selectAction: '.tablenav.top #bulk-action-selector-top', // trash
            applyAction: '.tablenav.top .button.action',
        },

        // Table
        table: {
            quotesTable: '.dokan-quote-wrapper table',
            quoteColumn: 'thead th.sl',
            customerColumn: 'thead th.customer_name',
            statusColumn: 'thead th.status',
            storeColumn: 'thead th.store_name',
            dateColumn: 'thead th.created_at',
        },

        noRowsFound: '//td[normalize-space()="No quote found."]',
        quoteCell: (title: string) => `//strong[normalize-space()="Quote ${title}"]/../..`,
        quoteEdit: (title: string) => `//a[normalize-space()="Quote ${title}"]/../..//span[@class="edit"]`,
        quoteTrash: (title: string) => `//a[normalize-space()="Quote ${title}"]/../..//span[@class="trash"]`,
        quotePermanentlyDelete: (title: string) => `//strong[normalize-space()="Quote ${title}"]/../..//span[@class="delete"]`,
        quoteRestore: (title: string) => `//strong[normalize-space()="Quote ${title}"]/../..//span[@class="restore"]`,

        approveQuote: 'input[value="Approve Quote"]',
        convertToOrder: 'input[value="Convert to Order"]',

        addNewQuote: {
            // title
            quoteTitle: '#title',

            // customer information
            quoteUserDropDown: '//th[normalize-space()="Quote user"]/..//div[@class="multiselect__select"]',
            quoteUserInput: '//th[normalize-space()="Quote user"]/..//input[@class="multiselect__input"]',
            selectedInput: (input: string) => `//span[@class="multiselect__option multiselect__option--highlight"]//span[normalize-space(text())="${input}"]`,
            selectedResult: (input: string) => `//span[@class="multiselect__single" and normalize-space(text())="${input}"]`,
            companyName: 'input[placeholder="Company Name"]',
            phoneNumber: 'input[name="phone_field"]',

            // quote details
            addProducts: 'input[value="Add product(s)"]',
            quoteVendorDropdown: '#select-vendor-store .multiselect__select',
            quoteVendorInput: '#select-vendor-store .multiselect__input',
            quoteProductDropdown: '.dokan-modal .multiselect__select',
            quoteProductInput: '.dokan-modal .multiselect__input',
            quoteProductQuantity: '#quantity',
            addToQuote: '//button[normalize-space()="Add to quote"]',
            offerPrice: '#offer_price',
            offerProductQuantity: 'input[name="offer_product_quantity"]',
            shippingCost: 'input[name="shipping_cost"]',

            // publish
            create: 'input[value="Create"]',
        },
    },
} as const;

const rfqVendor = {
    requestQuotesText: '//h1[normalize-space()="Request for Quotation"]',
    noQuoteMessage: '//div[contains(@class, "woocommerce-message woocommerce-message--info")]',
    goToShop: '//a[normalize-space()="Go to shop"]',

    // table
    table: {
        quoteTable: 'table.my_account_quotes',
        quoteColumn: '//th[normalize-space()="Quote #"]',
        statusColumn: '//th[normalize-space()="Status"]',
        customerColumn: '//th[normalize-space()="Customer"]',
        dateColumn: '//th[normalize-space()="Date"]',
    },

    viewQuoteDetails: (quoteId: string) => `//a[normalize-space()="Quote ${quoteId}"]`,

    quoteDetails: {
        quoteItemDetails: {
            table: {
                quoteDetailsTable: '//table[contains(@class,"quote_details") and contains(@class,"cart")]',
                productNameColumn: '//th[@class="product-name"]',
                originalPriceColumn: '//th[normalize-space()="Original Price"]',
                offeredPriceColumn: '//th[normalize-space()="My Offer"]',
                quantityColumn: '//th[@class="product-quantity"]',
                subtotalColumn: '//th[@class="product-subtotal"]',
            },
        },

        offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text my-offer offered-price-input text"]`,
        shippingCost: 'input#shipping-cost',
        reply: 'textarea#additional-msg',

        updateQuote: '//button[normalize-space()="Update"]',
        approveThisQuote: 'button[name="approved_by_vendor_button"]',
        convertToOrder: 'button[name="dokan_convert_to_order_customer"]',

        // The classic vendor dashboard quote-details template does not print WC
        // transient notices (no wc_print_notices() call); the real success
        // feedback is the server-rendered status notice in #dokan-quote-notice.
        message: '.woocommerce-message',
        updateNotice: '#dokan-quote-notice .quote-notice.update-notice',
        convertedNotice: '#dokan-quote-notice .quote-notice.converted-notice',
    },
} as const;

const rfqCustomer = {
    singleProductDetails: {
        addToQuote: '.cart a.dokan_request_button',
        viewQuote: '.added_to_quote',
    },

    orderDetails: {
        quoteNoteOnOrderDetails: '//td[normalize-space()="Created by converting quote to order."]',
    },

    // request for quote
    requestForQuote: {
        requestForQuoteText: '//h1[normalize-space()="Request for Quote"]',
        noQuotesFound: '//p[@class="cart-empty"]',
        returnToShop: '//a[normalize-space()="Return To Shop"]',

        quoteItemDetails: {
            table: {
                quoteDetailsTable: '//table[contains(@class,"quote_details") and contains(@class,"cart")]',
                productColumn: '//th[@class="product-name"]',
                priceColumn: '//th[normalize-space()="Price"]',
                offeredPriceColumn: '//th[normalize-space()="Offered Price"]',
                quantityColumn: '//th[@class="product-quantity"]',
                subtotalColumn: '//th[normalize-space()="Subtotal"]',
                offeredSubtotalColumn: '//th[normalize-space()="Offered Subtotal"]',
            },
        },

        quoteTotals: {
            quoteTotalsTitle: '//h2[normalize-space()="Quote totals"]',
            quoteTotalsDiv: '.cart_totals',
            quoteTotalsTable: '//div[@class="cart_totals"]//table[contains(@class,"table_quote_totals")]',
            subTotalText: '//tr[@class="cart-subtotal"]',
            offeredPriceSubtotalText: '//tr[@class="cart-subtotal offered"]//th',
            subTotalValue: '//td[@data-title="Subtotal (standard)"]',
            offeredPriceSubtotalValue: '//td[@data-title="Offered Price Subtotal"]',
        },

        offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text offered-price-input text"]`,
        quantityInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class="quantity"]//input`,

        expectedDelivery: 'input[name="expected_delivery_date"]',
        additionalMessage: 'textarea[name="customer_additional_msg"]',

        updateQuote: 'button#dokan_update_quote_btn',
        placeQuote: 'button[name="dokan_checkout_place_quote"]',

        guest: {
            fullName: 'input[name="name_field"]',
            email: 'input[name="email_field"]',
            companyName: 'input[name="company_field"]',
            phoneNumber: 'input[name="phone_field"]',

            address: {
                country: 'select[name="country"]',
                state: 'select[name="state_address"]',
                city: 'input[name="city"]',
                postCode: 'input[name="post_code"]',
                addressLine1: 'input[name="addr_line_1"]',
                addressLine2: 'input[name="addr_line_2"]',
            },
        },

        message: '.woocommerce-message',
    },

    // requested quote
    requestedQuote: {
        requestedQuoteText: '//h1[normalize-space()="Requested Quotes"]',
        noQuoteMessage: '//div[contains(@class, "woocommerce-message woocommerce-message--info")]',
        goToShop: '//a[normalize-space()="Go to shop"]',

        // table
        table: {
            quoteTable: 'table.my_account_quotes',
            quoteColumn: '//th[normalize-space()="Quote #"]',
            statusColumn: '//th[normalize-space()="Status"]',
            vendorColumn: '//th[normalize-space()="Vendor"]',
            dateColumn: '//th[normalize-space()="Date"]',
        },

        viewQuoteDetails: (quoteId: string) => `//a[normalize-space()="Quote ${quoteId}"]`,

        requestedQuoteDetails: {
            requestedQuoteText: '//h1[normalize-space()="Requested Quotes"]',

            basicDetails: {
                quoteNumber: 'h3.quote-no',
            },

            viewOrder: '//a[normalize-space()="View Order"]',

            offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text offered-price-input text"]`,
            quantityInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class="quantity"]//input`,

            updateQuote: 'button[name="dokan_update_quote"]',

            message: '.woocommerce-message',
        },
    },
} as const;

// Order-details / checkout / my-orders selectors used by the pay-converted-quote flow.
const orderDetailsSelectors = {
    orderNumber: '.order-number',
} as const;

const myOrdersSelectors = {
    orderPay: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]/../..//a[@class="button pay"]`,
} as const;

const checkoutSelectors = {
    directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
    placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
} as const;

const orderReceivedSelectors = {
    orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
} as const;

export class RequestForQuotationsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Helpers (ported from the pre-refactor basePage as raw Playwright)
    // ------------------------------------------------------------------

    // Resolve a sub-path to a full URL (pass-through for absolute links).
    private resolveUrl(subPath: string): string {
        return subPath.startsWith('http') ? subPath : toPath(subPath);
    }

    // Whether the browser is currently on the given sub-path (trailing slash agnostic).
    private isCurrentUrl(subPath: string): boolean {
        const currentURL = new URL(this.page.url()).href.replace(/[/]$/, '');
        return currentURL === this.resolveUrl(subPath).replace(/[/]$/, '');
    }

    // Navigate to a sub-path.
    private async gotoSubPath(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(this.resolveUrl(subPath), { waitUntil });
    }

    // Navigate only if not already on the sub-path; optionally force a reload.
    private async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded', force = false): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            await this.gotoSubPath(subPath, waitUntil);
        }
        if (force) {
            await this.page.reload();
        }
    }

    // Assert every string selector in a (possibly nested) object is visible.
    // Recurses into plain objects; skips function selectors (they need args).
    private async multipleElementVisible(group: { [key: string]: unknown }): Promise<void> {
        for (const key of Object.keys(group)) {
            const value = group[key];
            if (typeof value === 'function') {
                continue;
            } else if (value !== null && typeof value === 'object') {
                await this.multipleElementVisible(value as { [key: string]: unknown });
            } else if (typeof value === 'string') {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // Short-poll visibility check returning a boolean (never throws).
    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    // Click a selector and wait for a matching REST response.
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    // Click a selector and wait for both the 'load' state and a matching response.
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    // Click a selector and wait for a load state.
    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    // Fill an input and wait for a matching REST response (dokan multiselect search).
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
        return response;
    }

    // Flip a target=_blank link so it opens in the same tab.
    private async forceLinkToSameTab(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveAttribute('target', '_blank');
        await this.page.locator(selector).evaluate(el => el.setAttribute('target', '_self'));
    }

    // ==================================================================
    // ADMIN — quotes
    // ==================================================================

    // quotes render properly
    async adminQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // request for quote menus are visible
        await this.multipleElementVisible(rfqAdmin.menus);

        // quotes text is visible
        await expect(this.page.locator(rfqAdmin.quotesList.quotesText)).toBeVisible();

        // new quote is visible
        await expect(this.page.locator(rfqAdmin.quotesList.newQuote)).toBeVisible();

        // nav tabs are visible
        await this.multipleElementVisible(rfqAdmin.quotesList.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(rfqAdmin.quotesList.bulkActions);

        // quotes table elements are visible
        await this.multipleElementVisible(rfqAdmin.quotesList.table);
    }

    // update quote fields
    private async updateQuoteFields(quote: QuoteData, action = 'create'): Promise<void> {
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.quoteTitle).fill(quote.title);

        // customer information
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.quoteUserDropDown).click();
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.addNewQuote.quoteUserInput, quote.user);
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedInput(`${quote.user}( ${quote.email} )`)).click();
        await expect(this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedResult(`${quote.user}( ${quote.email} )`))).toBeVisible();

        await this.page.locator(rfqAdmin.quotesList.addNewQuote.companyName).fill(quote.companyName);
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.phoneNumber).fill(quote.phoneNumber);

        // quote product
        if (action === 'create') {
            await this.page.locator(rfqAdmin.quotesList.addNewQuote.quoteVendorDropdown).click();
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, rfqAdmin.quotesList.addNewQuote.quoteVendorInput, quote.vendor);
            await this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedInput(quote.vendor)).click();
            await expect(this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedResult(quote.vendor))).toBeVisible();

            await this.page.locator(rfqAdmin.quotesList.addNewQuote.addProducts).click();
            await this.page.locator(rfqAdmin.quotesList.addNewQuote.quoteProductDropdown).click();
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, rfqAdmin.quotesList.addNewQuote.quoteProductInput, quote.product);
            await this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedInput(quote.product)).click();
            await expect(this.page.locator(rfqAdmin.quotesList.addNewQuote.selectedResult(quote.product))).toBeVisible();
            await this.page.locator(rfqAdmin.quotesList.addNewQuote.quoteProductQuantity).fill(quote.quantity);

            await this.page.locator(rfqAdmin.quotesList.addNewQuote.addToQuote).click();
        }

        await this.page.locator(rfqAdmin.quotesList.addNewQuote.offerPrice).fill(quote.offerPrice);
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.offerProductQuantity).fill(quote.offerProductQuantity);
        await this.page.locator(rfqAdmin.quotesList.addNewQuote.shippingCost).fill(quote.shippingCost);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.addNewQuote.create);
    }

    // add quote
    async addQuote(quote: QuoteData): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.page.locator(rfqAdmin.quotesList.newQuote).click();
        await this.updateQuoteFields(quote, 'create');
    }

    // edit quote
    async editQuote(quote: QuoteData): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.page.locator(rfqAdmin.quotesList.quoteCell(quote.id)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quoteEdit(quote.id));
        await this.updateQuoteFields(quote, 'update');
    }

    // update quote (trash / permanently-delete / restore)
    async updateQuote(quoteId: string, action: string): Promise<void> {
        await this.gotoSubPath(data.subUrls.backend.dokan.requestForQuote);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.navTabs.pending);
                await expect(this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId))).toBeVisible();
                await this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId)).hover();
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quoteTrash(quoteId));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.navTabs.trash);
                await expect(this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId))).toBeVisible();
                await this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId)).hover();
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quotePermanentlyDelete(quoteId));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.navTabs.trash);
                await expect(this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId))).toBeVisible();
                await this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId)).hover();
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quoteRestore(quoteId));
                break;

            default:
                break;
        }
    }

    // approve quote
    async approveQuote(quoteId: string): Promise<void> {
        await this.gotoSubPath(data.subUrls.backend.dokan.requestForQuote);
        await this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quoteEdit(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.approveQuote);
    }

    // convert quote to order
    async convertQuoteToOrder(quoteId: string): Promise<void> {
        await this.gotoSubPath(data.subUrls.backend.dokan.requestForQuote);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.navTabs.approved);
        await this.page.locator(rfqAdmin.quotesList.quoteCell(quoteId)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.quoteEdit(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.convertToOrder);
    }

    // quotes bulk action
    async quotesBulkAction(action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // ensure row exists
        await expect(this.page.locator(rfqAdmin.quotesList.noRowsFound)).toBeHidden();

        await this.page.locator(rfqAdmin.quotesList.bulkActions.selectAll).click();
        await this.page.selectOption(rfqAdmin.quotesList.bulkActions.selectAction, { value: action });
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, rfqAdmin.quotesList.bulkActions.applyAction);
    }

    // ==================================================================
    // VENDOR
    // ==================================================================

    // vendor request quotes render properly
    async vendorRequestQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);

        // request quotes text is visible
        await expect(this.page.locator(rfqVendor.requestQuotesText)).toBeVisible();

        const noQuoteRequests = await this.isVisible(rfqVendor.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await expect(this.page.locator(rfqVendor.goToShop)).toBeVisible();
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(rfqVendor.table);
        }
    }

    // vendor view request quote details
    async vendorViewQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);
        await this.clickAndWaitForLoadState(rfqVendor.viewQuoteDetails(quoteTitle));

        // quote item details elements are visible
        await this.multipleElementVisible(rfqVendor.quoteDetails.quoteItemDetails.table);
    }

    // vendor update quote request
    async vendorUpdateQuoteRequest(quoteId: string, quote: VendorQuoteData): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.page.locator(rfqVendor.quoteDetails.offeredPriceInput(quote.productName)).fill(quote.offeredPrice);
        await this.page.locator(rfqVendor.quoteDetails.shippingCost).fill(quote.shippingCost);
        await this.page.locator(rfqVendor.quoteDetails.reply).fill(quote.reply);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), rfqVendor.quoteDetails.updateQuote);
        // Changing the offered price flips the quote status to "updated"; the real
        // UI confirms this via the server-rendered status notice.
        await expect(this.page.locator(rfqVendor.quoteDetails.updateNotice)).toContainText('Updated Quote has been sent successfully to the customer.');
    }

    // vendor approve quote request
    async vendorApproveQuoteRequest(quoteId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), rfqVendor.quoteDetails.approveThisQuote);
        // Approving (without altering the offer) moves the quote to "approve"; the
        // approve button is replaced by the "Convert to Order" button.
        await expect(this.page.locator(rfqVendor.quoteDetails.convertToOrder)).toBeVisible();
    }

    // vendor convert quote to order
    async vendorConvertQuoteToOrder(quoteId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        const needApproval = await this.isVisible(rfqVendor.quoteDetails.approveThisQuote);
        if (needApproval) {
            await this.vendorApproveQuoteRequest(quoteId);
        }
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), rfqVendor.quoteDetails.convertToOrder);
        await expect(this.page.locator(rfqVendor.quoteDetails.convertedNotice)).toContainText('The Quote Has been Converted to an Order.');
    }

    // ==================================================================
    // CUSTOMER
    // ==================================================================

    // customer request for quote render properly
    async requestForQuoteRenderProperly(link?: string): Promise<void> {
        if (link) {
            await this.gotoSubPath(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
            // request for quote text is visible
            await expect(this.page.locator(rfqCustomer.requestForQuote.requestForQuoteText)).toBeVisible();
        }

        const noQuote = await this.isVisible(rfqCustomer.requestForQuote.noQuotesFound);

        if (noQuote) {
            await expect(this.page.locator(rfqCustomer.requestForQuote.noQuotesFound)).toContainText('Your quote is currently empty.');
            console.log('No quotes found on request for quote page');
            await expect(this.page.locator(rfqCustomer.requestForQuote.returnToShop)).toBeVisible();
        } else {
            // quote item table details elements are visible
            await this.multipleElementVisible(rfqCustomer.requestForQuote.quoteItemDetails.table);

            // quote total details elements are visible
            await this.multipleElementVisible(rfqCustomer.requestForQuote.quoteTotals);

            // update quote is visible
            await expect(this.page.locator(rfqCustomer.requestForQuote.updateQuote)).toBeVisible();
        }
    }

    // requested quotes render properly
    async requestedQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

        // requested quotes text is visible
        await expect(this.page.locator(rfqCustomer.requestedQuote.requestedQuoteText)).toBeVisible();

        const noQuoteRequests = await this.isVisible(rfqCustomer.requestedQuote.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await expect(this.page.locator(rfqCustomer.requestedQuote.goToShop)).toBeVisible();
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(rfqCustomer.requestedQuote.table);
        }
    }

    // customer view requested quote details
    async customerViewRequestedQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);
        await this.clickAndWaitForLoadState(rfqCustomer.requestedQuote.viewQuoteDetails(quoteTitle));
    }

    // customer update requested quote
    async customerUpdateRequestedQuote(quoteId: string, quote: CustomerQuoteData): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.quoteDetails(quoteId));
        await this.page.locator(rfqCustomer.requestedQuote.requestedQuoteDetails.offeredPriceInput(quote.productName)).fill(quote.offeredPrice);
        await this.page.locator(rfqCustomer.requestedQuote.requestedQuoteDetails.quantityInput(quote.productName)).fill(quote.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.quoteDetails(quoteId), rfqCustomer.requestedQuote.requestedQuoteDetails.updateQuote);
        await expect(this.page.locator(rfqCustomer.requestedQuote.requestedQuoteDetails.message)).toContainText('Your quote has been successfully updated.');
    }

    // customer pay converted quote
    async payConvertedQuote(quoteId: string): Promise<void> {
        await this.gotoSubPath(data.subUrls.frontend.quoteDetails(quoteId));
        await this.forceLinkToSameTab(rfqCustomer.requestedQuote.requestedQuoteDetails.viewOrder);
        await this.clickAndWaitForLoadState(rfqCustomer.requestedQuote.requestedQuoteDetails.viewOrder);
        await expect(this.page.locator(rfqCustomer.orderDetails.quoteNoteOnOrderDetails)).toBeVisible();
        const orderId = ((await this.page.locator(orderDetailsSelectors.orderNumber).textContent()) ?? '').trim();
        await this.payPendingOrder(orderId, 'bank');
    }

    // pay a pending order from the my-orders page (ported from myOrdersPage/customerPage)
    private async payPendingOrder(orderId: string, paymentMethod = 'bank'): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.page.reload();
        await this.clickAndWaitForResponse(data.subUrls.frontend.orderPay, myOrdersSelectors.orderPay(orderId));
        await this.paymentOrder(paymentMethod);
    }

    // select the payment method and place the order (bank/direct-bank-transfer supported)
    private async paymentOrder(paymentMethod = 'bank'): Promise<void> {
        switch (paymentMethod) {
            case 'bank':
                await this.page.locator(checkoutSelectors.directBankTransfer).click();
                break;

            default:
                break;
        }

        await this.page.locator(checkoutSelectors.placeOrder).focus();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, checkoutSelectors.placeOrder);
        await expect(this.page.locator(orderReceivedSelectors.orderReceivedSuccessMessage)).toBeVisible();
    }

    // customer quote product (logged-in customer or guest)
    async customerQuoteProduct(quote: CustomerQuoteData, guest?: GuestData): Promise<string | void> {
        // Go to the single product page via its canonical WooCommerce permalink.
        // The shared `productDetails` sub-url (shop/uncategorized/<slug>) 404s for
        // products seeded into a non-default category (CATEGORY_ID), so use the
        // deterministic /product/<slug>/ permalink where the add-to-quote button
        // renders inside form.cart.
        await this.goIfNotThere(`product/${helpers.slugify(quote.productName)}`);
        await this.clickAndWaitForResponse(data.subUrls.ajax, rfqCustomer.singleProductDetails.addToQuote);

        const viewQuoteIsVisible = await this.isVisible(rfqCustomer.singleProductDetails.viewQuote);
        if (viewQuoteIsVisible) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, rfqCustomer.singleProductDetails.viewQuote);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
        }

        await this.page.locator(rfqCustomer.requestForQuote.quantityInput(quote.productName)).fill(quote.quantity);

        if (guest) {
            await this.page.locator(rfqCustomer.requestForQuote.guest.fullName).fill(guest.fullName);
            await this.page.locator(rfqCustomer.requestForQuote.guest.email).fill(guest.email);
            await this.page.locator(rfqCustomer.requestForQuote.guest.phoneNumber).fill(guest.phoneNumber);

            await this.page.selectOption(rfqCustomer.requestForQuote.guest.address.country, { value: guest.address.countrySelectValue });
            await this.page.selectOption(rfqCustomer.requestForQuote.guest.address.state, { value: guest.address.stateSelectValue });
            await this.page.locator(rfqCustomer.requestForQuote.guest.address.city).fill(guest.address.city);
            await this.page.locator(rfqCustomer.requestForQuote.guest.address.postCode).fill(guest.address.postCode);
            await this.page.locator(rfqCustomer.requestForQuote.guest.address.addressLine1).fill(guest.address.addressLine1);
            await this.page.locator(rfqCustomer.requestForQuote.guest.address.addressLine2).fill(guest.address.addressLine2);
        }

        await this.page.locator(rfqCustomer.requestForQuote.expectedDelivery).fill(quote.expectedDelivery);
        await this.page.locator(rfqCustomer.requestForQuote.additionalMessage).fill(quote.additionalMessage);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, rfqCustomer.requestForQuote.placeQuote, 302);
        await expect(this.page.locator(rfqCustomer.requestedQuote.requestedQuoteDetails.requestedQuoteText)).toBeVisible();

        if (!guest) {
            const quoteNumber = (await this.page.locator(rfqCustomer.requestedQuote.requestedQuoteDetails.basicDetails.quoteNumber).textContent())?.trim().match(/\d+/)?.[0];
            return quoteNumber;
        }
    }
}
