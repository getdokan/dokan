import { Page, Response, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, parseBoolean, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Dokan Tools (admin) — ported from the pre-refactor page object
// (git e2ec507de:tests/pw/pages/toolsPage.ts) into the current self-contained
// architecture. The Tools screen is the classic WP-admin metabox surface under
// `admin.php?page=dokan#/tools`: Page Installation, Regenerate Order Commission,
// Check for Duplicate Orders, Dokan Setup Wizard, Regenerate Variable Product
// Variations Author IDs, Import Dummy Data and Test Distance Matrix API.
//
// Base-class helpers from the reference are inlined as raw Playwright:
//   toBeVisible(x)                    -> expect(page.locator(x)).toBeVisible()
//   multipleElementVisible(group)     -> loop-assert Object.values(group) visible
//   clickAndWaitForResponse(u,s,c)    -> Promise.all([waitForResponse, click])
//   clickAndWaitForLoadState(s)       -> Promise.all([waitForLoadState, click])
//   clearAndType(s,v)                 -> page.locator(s).fill(v)
//   toContainText(s,t)                -> expect(page.locator(s)).toContainText(t)
//   goIfNotThere(u)                   -> goto(u) only when not already there
// ============================================================================

// Re-export the REAL shared test data, payloads and db helpers so the spec's
// import contract ({ ToolsPage, ApiUtils, data, payloads, dbUtils }) is wired to
// the real utilities (not local no-op stubs).
export { data };
export { payloads } from '@utils/payloads';
export { dbUtils } from '@utils/dbUtils';

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)` but the real ApiUtils requires an
 * APIRequestContext. When null is passed we lazily create our own request
 * context and swap it in before the first real REST call (import/clear dummy
 * data) or dispose. Mirrors the sibling ported suites.
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

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
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
// SELECTORS (recovered from pre-refactor selectors.ts -> selector.admin.dokan)
// ============================================================================
const toolsAdmin = {
    toolsText: '.tools-page h1',

    // Page Installation
    pageInstallation: {
        pageInstallation: '//span[normalize-space()="Page Installation"]/../../..',
        collapsibleButton: '//span[normalize-space()="Page Installation"]/../../..//button',
        allPagesCreated: '//a[normalize-space()="All Pages Created"]',
        installDokanPages: '//a[normalize-space()="Install Dokan Pages"]',
        pageCreatedSuccessMessage: '//div[contains(text(), "All the default pages has been created!")]',
    },

    // Regenerate Order Commission
    regenerateOrderCommission: {
        regenerateOrderCommission: '//span[normalize-space()="Regenerate Order Commission"]/../../..',
        collapsibleButton: '//span[normalize-space()="Regenerate Order Commission"]/../../..//button',
        regenerate: '//span[normalize-space()="Regenerate Order Commission"]/../../..//a[normalize-space()="Regenerate"]',
        regenerateOrderCommissionSuccessMessage: '//div[contains(text(), "Your orders have been successfully queued for processing. You will be notified once the task has been completed.")]',
    },

    // Check for Duplicate Orders
    checkForDuplicateOrders: {
        checkForDuplicateOrders: '//span[normalize-space()="Check for Duplicate Orders"]/../../..',
        collapsibleButton: '//span[normalize-space()="Check for Duplicate Orders"]/../../..//button',
        checkOrders: '//a[normalize-space()="Check Orders"]',
    },

    // Dokan Setup Wizard
    dokanSetupWizard: {
        dokanSetupWizard: '//span[normalize-space()="Dokan Setup Wizard"]/../../..',
        collapsibleButton: '//span[normalize-space()="Dokan Setup Wizard"]/../../..//button',
        openSetupWizard: '//a[normalize-space()="Open Setup Wizard"]',
    },

    // Regenerate Variable Product Variations Author IDs
    regenerateVariableProductVariationsAuthorIds: {
        regenerateVariableProductVariationsAuthorIds: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..',
        collapsibleButton: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..//button',
        regenerate: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..//a[normalize-space()="Regenerate"]',
    },

    // Import Dummy Data
    importDummyData: {
        importDummyData: '//span[normalize-space()="Import Dummy Data"]/../../..',
        collapsibleButton: '//span[normalize-space()="Import Dummy Data"]/../../..//button',
        import: '//span[normalize-space()="Import Dummy Data"]/../../..//a',
    },

    // Test Distance Matrix API (Google MAP)
    testDistanceMatrixApi: {
        testDistanceMatrixApi: '//span[normalize-space()="Test Distance Matrix API (Google MAP)"]/../../..',
        collapsibleButton: '//span[normalize-space()="Test Distance Matrix API (Google MAP)"]/../../..//button[@class="handlediv"]',
        address1: '#address1',
        address2: '#address2',
        getDistance: '//button[normalize-space()="Get Distance"]',
        enabledSuccess: '//div[@class="formatted-message success"]',
    },
} as const;

// Dummy data importer/clear controls (selector.admin.dokan.dummyData)
const dummyDataAdmin = {
    runTheImporter: '.dokan-import-continue-btn',
    importComplete: '//p[normalize-space()="Import complete!"]',
    clearDummyData: '.cancel-btn.dokan-import-continue-btn',
    confirmClearDummyData: '.swal2-actions .swal2-confirm',
} as const;

// Dokan Setup Wizard steps (selector.admin.dokan.setupWizard)
const setupWizardAdmin = {
    letsGo: '.button-primary',
    // Store
    vendorStoreURL: 'input[name="storename"]',
    shippingFeeRecipient: '#shipping_fee_recipient',
    taxFeeRecipient: '#tax_fee_recipient',
    mapApiSource: '#map_api_source',
    googleMapApiKey: '#gmap_api_key',
    shareEssentialsOff: '.switch-label',
    sellingProductTypes: '#dokan_digital_product',
    continue: '//input[@value="Continue"]',
    // Selling
    newVendorEnableSelling: '//label[@for="new_seller_enable_selling" and @class="switch-label"]',
    orderStatusChange: '//label[@for="order_status_change" and @class="switch-label"]',
    // Commission
    commissionType: 'select#_subscription_product_admin_commission_type, select#dokan_selling\\[commission_type\\]',
    percentage: 'input#percentage-val-id',
    fixed: 'input#fixed-val-id',
    // Withdraw
    payPal: '//label[@for="withdraw_methods[paypal]" and @class="switch-label"]',
    bankTransfer: '//label[@for="withdraw_methods[bank]" and @class="switch-label"]',
    custom: '//label[@for="withdraw_methods[dokan_custom]" and @class="switch-label"]',
    skrill: '//label[@for="withdraw_methods[skrill]" and @class="switch-label"]',
    minimumWithdrawLimit: '#withdraw_limit',
    orderStatusForWithdrawCompleted: '//label[@for="withdraw_order_status[wc-completed]"]',
    orderStatusForWithdrawProcessing: '//label[@for="withdraw_order_status[wc-processing]"]',
    // Recommended
    weMail: '//label[@for="dokan_recommended_wemail"]',
    wooCommerceConversionTracking: '//label[@for="dokan_recommended_wc_conversion_tracking"]',
    texty: '//label[@for="dokan_recommended_texty"]',
    continueRecommended: '.button-primary',
    // Ready!
    visitDokanDashboard: '//a[contains(text(),"Visit Dokan Dashboard")]',
} as const;

// End-of-wizard landing assertion (selector.admin.dokan.dashboard.dashboardText)
const adminDashboardText = '.wrap h1';

// Distance Matrix API address input shape (interfaces.tools['distanceMatrixApi'])
interface DistanceMatrixApiAddress {
    address1: string;
    address2: string;
    address3: string;
    address4: string;
}

// Setup wizard input shape (interfaces.dokanSetupWizard, only the used fields)
interface SetupWizardData {
    vendorStoreURL: string;
    shippingFeeRecipient: string;
    taxFeeRecipient: string;
    mapApiSource: string;
    googleMapApiKey: string;
    sellingProductTypes: string;
    commission: {
        commissionType: string;
        commissionPercentage: string;
        commissionFixed: string;
    };
    minimumWithdrawLimit: string;
}

export class ToolsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw helpers (ported base-class semantics) ----

    // goIfNotThere: navigate only when not already on the target sub-path.
    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    // toBeVisible for every string value of a selector group.
    private async multipleElementVisible(selectors: Record<string, string>): Promise<void> {
        for (const selector of Object.values(selectors)) {
            await expect(this.page.locator(selector)).toBeVisible();
        }
    }

    // clickAndWaitForResponse: click, resolving on the matching XHR response.
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    // clickAndWaitForLoadState: click, resolving on the next load state.
    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    // clickAndWaitForResponsesSequentially: click once, then await each response in order.
    private async clickAndWaitForResponsesSequentially(subUrls: string[], selector: string, code = 200): Promise<void> {
        await this.page.locator(selector).click();
        for (const subUrl of subUrls) {
            await this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code);
        }
    }

    // clickAndAcceptAndWaitForResponseAndLoadState: auto-accept the confirm dialog,
    // click, and resolve on both the response and the load state.
    private async clickAcceptAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        // page.once so only THIS dialog is accepted.
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.waitForLoadState('domcontentloaded'),
            this.page.locator(selector).click(),
        ]);
    }

    // setup-wizard switch/checkbox toggles keyed off the ::before background color
    // (rgb(201,186,248) switch ON, rgb(112,71,235) checkbox ON).
    private async getSwitcherBg(selector: string): Promise<string> {
        return await this.page.locator(selector).evaluate(el => window.getComputedStyle(el, '::before').getPropertyValue('background-color'));
    }

    private async enableSwitcherSetupWizard(selector: string): Promise<void> {
        const value = await this.getSwitcherBg(selector);
        if (!value.includes('rgb(201, 186, 248)') && !value.includes('rgb(112, 71, 235)')) {
            const target = selector.includes('withdraw_methods') ? `${selector}/..` : selector;
            await this.page.locator(target).click();
        }
    }

    private async disableSwitcherSetupWizard(selector: string): Promise<void> {
        const value = await this.getSwitcherBg(selector);
        if (value.includes('rgb(201, 186, 248)') || value.includes('rgb(112, 71, 235)')) {
            const target = selector.includes('withdraw_methods') ? `${selector}/..` : selector;
            await this.page.locator(target).click();
        }
    }

    // ---- tools ----

    // tools render properly
    async adminToolsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);

        // tools text is visible
        await expect(this.page.locator(toolsAdmin.toolsText)).toBeVisible();

        // Page Installation elements are visible.
        // A freshly-loaded Tools page renders the "Install Dokan Pages" button, not
        // "All Pages Created": checkAllPages() sets exists via `'1' === all_pages_exists`
        // but the AJAX (ToolsActions::check_all_dokan_pages_exists) returns a PHP boolean,
        // so the "All Pages Created" branch never renders on initial load — it only appears
        // after clicking install (covered by the page-installation test).
        const { allPagesCreated, pageCreatedSuccessMessage, ...pageInstallation } = toolsAdmin.pageInstallation;
        await this.multipleElementVisible(pageInstallation);

        // Regenerate Order Commission elements are visible
        const { regenerateOrderCommissionSuccessMessage, ...regenerateOrderCommission } = toolsAdmin.regenerateOrderCommission;
        await this.multipleElementVisible(regenerateOrderCommission);

        // Check for Duplicate Orders elements are visible
        await this.multipleElementVisible(toolsAdmin.checkForDuplicateOrders);

        // NOTE: the "Dokan Setup Wizard" tool section was removed from the classic Tools
        // page (Tools.vue getTypes() no longer registers it), so it is not asserted here.

        // Regenerate Variable Product Variations Author IDs elements are visible
        await this.multipleElementVisible(toolsAdmin.regenerateVariableProductVariationsAuthorIds);

        // Import Dummy Data elements are visible
        await this.multipleElementVisible(toolsAdmin.importDummyData);

        // Test Distance Matrix API (Google MAP) elements are visible
        const { enabledSuccess, ...testDistanceMatrixApi } = toolsAdmin.testDistanceMatrixApi;
        await this.multipleElementVisible(testDistanceMatrixApi);
    }

    // dokan page installation
    async dokanPageInstallation(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.backend.dokan.tools), { waitUntil: 'domcontentloaded' });
        await this.page.reload(); // todo: fix this
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.pageInstallation.installDokanPages, 201);
        await expect(this.page.locator(toolsAdmin.pageInstallation.pageCreatedSuccessMessage)).toBeVisible();
        await expect(this.page.locator(toolsAdmin.pageInstallation.allPagesCreated)).toBeVisible();
    }

    // regenerate order commission
    async regenerateOrderCommission(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.regenerateOrderCommission.regenerate);
        await expect(this.page.locator(toolsAdmin.regenerateOrderCommission.regenerateOrderCommissionSuccessMessage)).toBeVisible();
    }

    // check for duplicate orders
    async checkForDuplicateOrders(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.checkForDuplicateOrders.checkOrders);
    }

    // regenerate variable product variations author IDs
    async regenerateVariableProductVariationsAuthorIds(): Promise<void> {
        // Load the Tools page FRESH (goto + reload) instead of reusing the current page.
        // "Regenerate Order Commission" and "Regenerate Variable Product Variations Author
        // IDs" share ONE reactive Vue flag `disableRegenerateButton`. A prior sibling test
        // (regenerate order commission) sets it to true, which re-renders BOTH regenerate
        // buttons as `<a class="button button-disabled">` WITHOUT the @click handler. Because
        // the whole suite reuses a single page and goIfNotThere() never reloads once on the
        // Tools URL, without a fresh load the variations "Regenerate" the test clicks is the
        // dead disabled button — the click fires no AJAX and waitForResponse times out. This
        // reproduces only when a prior regenerate ran first (masked locally under accumulated
        // NO_SETUP state, surfaced by CI's ordered full-file run). Reloading reinitializes the
        // Tools component with the flag reset to false, restoring the clickable primary button.
        await this.page.goto(toPath(data.subUrls.backend.dokan.tools), { waitUntil: 'domcontentloaded' });
        await this.page.reload({ waitUntil: 'networkidle' });

        // The classic Vue app binds the @click handler asynchronously after mount; re-click
        // until the AJAX request actually fires (mirrors products/productsPage.ts saveProduct).
        await expect(async () => {
            const [response] = await Promise.all([
                this.page.waitForResponse(resp => resp.url().includes(data.subUrls.ajax) && resp.status() === 200, { timeout: 15000 }),
                this.page.locator(toolsAdmin.regenerateVariableProductVariationsAuthorIds.regenerate).click(),
            ]);
            expect(response.status()).toBe(200);
        }).toPass({ intervals: [1000, 2000, 3000], timeout: 90000 });
    }

    // import dummy data
    async importDummyData(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForLoadState(toolsAdmin.importDummyData.import);
        const urls = [
            data.subUrls.api.dokan.dummyDataImport,
            data.subUrls.api.dokan.dummyDataImport,
            data.subUrls.api.dokan.dummyDataImport,
            data.subUrls.api.dokan.dummyDataImport,
            data.subUrls.api.dokan.dummyDataImport,
        ];
        await this.clickAndWaitForResponsesSequentially(urls, dummyDataAdmin.runTheImporter);
        await expect(this.page.locator(dummyDataAdmin.importComplete)).toBeVisible();
    }

    // clear dummy data
    async clearDummyData(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, toolsAdmin.importDummyData.import);
        await this.page.locator(dummyDataAdmin.clearDummyData).click();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, dummyDataAdmin.confirmClearDummyData);
    }

    // test distance matrix API
    async testDistanceMatrixApi(address: DistanceMatrixApiAddress): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);

        await this.page.locator(toolsAdmin.testDistanceMatrixApi.address1).fill(address.address3);
        await this.page.locator(toolsAdmin.testDistanceMatrixApi.address2).fill(address.address4);
        await this.page.locator(toolsAdmin.testDistanceMatrixApi.getDistance).click();
        await expect(this.page.locator(toolsAdmin.testDistanceMatrixApi.enabledSuccess)).toContainText('Distance Matrix API is enabled.');
    }

    // set dokan setup wizard (ported from AdminPage.setDokanSetupWizard;
    // the spec case is test.skip but the method must exist and be real).
    async setDokanSetupWizard(dokanSetupWizard: SetupWizardData): Promise<void> {
        const isPro = parseBoolean(process.env.DOKAN_PRO);
        await this.goIfNotThere(data.subUrls.backend.dokan.setupWizard);
        await this.page.locator(setupWizardAdmin.letsGo).click();

        // Store
        await this.page.locator(setupWizardAdmin.vendorStoreURL).fill(dokanSetupWizard.vendorStoreURL);
        await this.page.selectOption(setupWizardAdmin.shippingFeeRecipient, { value: dokanSetupWizard.shippingFeeRecipient });
        await this.page.selectOption(setupWizardAdmin.taxFeeRecipient, { value: dokanSetupWizard.taxFeeRecipient });
        await this.page.selectOption(setupWizardAdmin.mapApiSource, { value: dokanSetupWizard.mapApiSource });
        await this.page.locator(setupWizardAdmin.googleMapApiKey).fill(dokanSetupWizard.googleMapApiKey);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.shareEssentialsOff);
        if (isPro) {
            await this.page.selectOption(setupWizardAdmin.sellingProductTypes, { value: dokanSetupWizard.sellingProductTypes });
        }
        await this.clickAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.dokan.setupWizardStore, setupWizardAdmin.continue, 302);

        // Selling
        await this.enableSwitcherSetupWizard(setupWizardAdmin.newVendorEnableSelling);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusChange);
        await this.clickAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.dokan.setupWizardSelling, setupWizardAdmin.continue, 302);

        // Commission
        await this.page.selectOption(setupWizardAdmin.commissionType, { value: dokanSetupWizard.commission.commissionType });
        await this.page.locator(setupWizardAdmin.percentage).fill(dokanSetupWizard.commission.commissionPercentage);
        await this.page.locator(setupWizardAdmin.fixed).fill(dokanSetupWizard.commission.commissionFixed);
        await this.clickAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.dokan.setupWizardCommission, setupWizardAdmin.continue, 302);

        // Withdraw
        await this.enableSwitcherSetupWizard(setupWizardAdmin.payPal);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.bankTransfer);
        if (isPro) {
            await this.enableSwitcherSetupWizard(setupWizardAdmin.custom);
            await this.enableSwitcherSetupWizard(setupWizardAdmin.skrill);
        }
        await this.page.locator(setupWizardAdmin.minimumWithdrawLimit).fill(dokanSetupWizard.minimumWithdrawLimit);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusForWithdrawCompleted);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusForWithdrawProcessing);
        await this.clickAcceptAndWaitForResponseAndLoadState(data.subUrls.backend.dokan.setupWizardWithdraw, setupWizardAdmin.continue, 302);

        // Recommended
        await this.disableSwitcherSetupWizard(setupWizardAdmin.weMail);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.wooCommerceConversionTracking);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.texty);
        await this.page.locator(setupWizardAdmin.continueRecommended).click();

        // Ready!
        await this.page.locator(setupWizardAdmin.visitDokanDashboard).click();
        await expect(this.page.locator(adminDashboardText)).toBeVisible();
    }
}
