import { Page, expect } from '@playwright/test';
import { helpers, toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

// Re-export the real utilities so the spec's import contract
// (`{ VendorVerificationsPage, ApiUtils, dbUtils, data, payloads }`) resolves to
// the genuine @utils implementations — not local no-op stubs.
export { ApiUtils, dbUtils, data, payloads };

// ---------------------------------------------------------------------------
// Co-located selectors (ported verbatim from the pre-refactor selectors.ts).
// These target the legacy (Vue/PHP) verification surfaces the reference flow
// exercised: admin Dokan settings, the admin Verifications list, the vendor
// dashboard verification settings, the setup wizard, and the storefront badge.
// ---------------------------------------------------------------------------
const selectors = {
    // admin top-level Dokan menu
    menusAdmin: {
        verifications: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Verifications"]',
    },

    // admin > Dokan > Settings
    settingsAdmin: {
        saveChanges: '//input[@id="submit" and @value="Save Changes"]',
        dokanUpdateSuccessMessage: '#setting-message_updated > p > strong',
        menus: {
            vendorVerification: '//div[@class="nav-title" and contains(text(),"Vendor Verification")]',
        },
        vendorVerification: {
            verifiedIconByIcon: (iconName: string) => `//i[@class='${iconName}']//../..`,
            verificationMethodRow: (methodName: string) => `//p[text()[normalize-space()='${methodName}']]/../../..`,
            enableVerificationMethod: (methodName: string) => `//p[text()[normalize-space()='${methodName}']]/../../..//label[@class="switch tips"]`,
            // dokan-pro #5861 replaced the hover-revealed pill buttons with always-visible
            // icon buttons carrying an aria-label. Key off the label, not the utility classes.
            editVerificationMethod: (methodName: string) => `button[aria-label="Edit ${methodName} verification method"]`,
            deleteVerificationMethod: (methodName: string) => `button[aria-label="Delete ${methodName} verification method"]`,
            confirmDelete: '.swal2-confirm',
            methodCreateSuccessMessage: '//div[text()="Created Successfully."]',
            methodUpdateSuccessMessage: '//div[text()="Updated Successfully."]',
            methodDeleteSuccessMessage: '//div[text()="Deleted Successfully."]',
            addNewVerification: {
                addNewVerification: '//button[text()[normalize-space()="Add New"]]',
                label: 'input#label-text',
                helpText: 'input#label-help',
                required: 'input#field-required',
                create: '//span[text()[normalize-space()="Create"]]/..',
                update: '//span[text()[normalize-space()="Update"]]',
            },
        },
    },

    // admin > Dokan > Verifications (request list)
    verificationsAdmin: {
        verificationsDiv: 'div.verification-requests',
        verificationRequestsText: '//h1[normalize-space()="Verification Requests"]',
        navTabs: {
            pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
            approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
            rejected: '//ul[@class="subsubsub"]//li//a[contains(text(),"Rejected")]',
            cancelled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Cancelled")]',
            tabByStatus: (status: string) => `//ul[@class="subsubsub"]//li//a[contains(text(),"${status}")]`,
        },
        bulkActions: {
            selectAll: 'thead .manage-column input',
            selectAction: '.tablenav.top #bulk-action-selector-top', // approved, cancelled, rejected
            applyAction: '//div[@class="tablenav top"]//button[normalize-space()="Apply"]',
        },
        filters: {
            filterByVendors: '(//select[@id="filter-vendors"]/..//span[@class="select2-selection__arrow"])[1]',
            filterByMethods: '(//select[@id="filter-methods"]/..//span[@class="select2-selection__arrow"])[2]',
            reset: '(//button[text()="×"])[1]',
            filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
            result: 'li.select2-results__option.select2-results__option--highlighted',
            filteredResult: (input: string) => `//li[normalize-space()="${input}"]`,
        },
        table: {
            verificationTable: '.verification-requests table',
            requestIdColumn: 'thead th.id',
            methodColumn: 'thead th.method_title',
            documentsColumn: 'thead th.documents',
            statusColumn: 'thead th.status',
            vendorColumn: 'thead th.seller',
            noteColumn: 'thead th.note',
            dateColumn: 'thead th.created',
            actionsColumn: 'thead th.actions',
        },
        numberOfRowsFound: '.tablenav.top .displaying-num',
        noRowsFound: '//td[normalize-space()="No requests found."]',
        verificationRequestCell: (requestId: string) => `//td//strong[contains(text(), '#${requestId}')]/..`,
        verificationRequestDocument: (requestId: string) => `(//td//strong[contains(text(), '#${requestId}')]/../..//a[@target])[1]`,
        verificationRequestApprove: (requestId: string) => `//td//strong[contains(text(), '#${requestId}')]/../..//button[@title='Approve Request']`,
        verificationRequestReject: (requestId: string) => `//td//strong[contains(text(), '#${requestId}')]/../..//button[@title='Reject Request']`,
        verificationRequestAddNote: (requestId: string) => `//td//strong[contains(text(), '#${requestId}')]/../..//button[@title='Add Note']`,
        addNote: '.dokan-modal-content .modal-body textarea',
        updateNote: '.dokan-modal-content .modal-footer button',
    },

    // vendor dashboard > Settings > Verification
    verificationsVendor: {
        verificationSettingsDiv: 'div.dokan-verification-content',
        verificationText: '.dokan-settings-content h1',
        // Scope to the classic settings header — the React dashboard shell also
        // renders a "Visit Store" link, so the bare text match is ambiguous.
        visitStore: '//header[contains(@class,"dokan-dashboard-header")]//a[normalize-space()="Visit Store"]',
        verificationMethodDiv: (methodName: string) => `//strong[text()='${methodName}']/../..`,
        verificationMethodHelpText: (methodName: string) => `//strong[text()='${methodName}']/../..//p`,
        startVerification: (methodName: string) => `//strong[text()='${methodName}']/../..//button[contains(@class,'dokan-vendor-verification-start')]`,
        cancelVerification: (methodName: string) => `//strong[text()='${methodName}']/../..//button[contains(@class,'dokan-vendor-verification-cancel-request')]`,
        uploadFiles: (methodName: string) => `//strong[text()='${methodName}']/../..//a[@data-uploader_button_text='Add File']`,
        submit: (methodName: string) => `//strong[text()='${methodName}']/../..//input[contains(@class,'dokan_vendor_verification_submit')]`,
        cancelSubmit: (methodName: string) => `//strong[text()='${methodName}']/../..//input[contains(@class,'dokan_vendor_verification_cancel')]`,
        verificationStatus: (methodName: string, status: string) => `//strong[text()='${methodName}']/../..//p//label[contains(@class,'${status}')]`,
        verificationRequestDocument: (methodName: string) => `(//strong[text()='${methodName}']/../..//div[@class='dokan-vendor-verification-file-item']//a)[1]`,
        verificationRequestNote: (methodName: string) => `(//strong[text()='${methodName}']/../..//p[text()='Note:']/..//p)[2]`,
        confirmCancelRequest: '.swal2-confirm',
        requestCreateSuccessMessage: '//div[text()="Verification Request Creation Successfully."]',
        requestCancelSuccessMessage: '//div[text()="Verification Request Cancelled Successfully."]',
    },

    // vendor dashboard primary menu + submenu
    //
    // The vendor dashboard navigation moved to a React sidebar
    // (<aside class="dokan-frontend-sidebar">). The legacy Vue/PHP
    // `ul.dokan-dashboard-menu` markup is still emitted but rendered
    // visibility:hidden inside the new wrapper (and the bare `/dashboard/`
    // root now redirects to the React analytics Overview), so the classic
    // `.submenu-item.verification` can never be hovered/seen. The Verification
    // entry now surfaces as a visible link in the React sidebar; its Settings
    // group is expanded on any /dashboard/settings/* route.
    vendorDashboardMenus: {
        settings: '(//ul[@class="dokan-dashboard-menu"]//li[contains(@class,"settings has-submenu")]//a)[1]',
        verification: '.submenu-item.verification',
        sidebarVerification: 'aside.dokan-frontend-sidebar a[href*="settings/verification"]',
    },

    // vendor setup wizard (only the steps the verification flow touches)
    setupWizardVendor: {
        letsGo: '.lets-go-btn',
        street1: '#address\\[street_1\\]',
        street2: '#address\\[street_2\\]',
        city: '#address\\[city\\]',
        zipCode: '#address\\[zip\\]',
        country: '#select2-addresscountry-container',
        countryInput: '//input[@class="select2-search__field" and @aria-owns="select2-addresscountry-results"]',
        state: '#select2-calc_shipping_state-container',
        stateInput: '//input[@class="select2-search__field" and @aria-owns="select2-calc_shipping_state-results"]',
        highlightedResult: '.select2-results__option.select2-results__option--highlighted',
        continueStoreSetup: '.store-step-continue',
        skipTheStepPaymentSetup: '.payment-step-skip-btn',
    },

    // storefront single store (verified badge)
    singleStoreCustomer: {
        verifiedIcon: '//div[@data-original-title="Verified"]',
        verifiedIconByIcon: (icon: string) => `//div[@data-original-title="Verified"]//i[@class="${icon}"]`,
    },

    // storefront store list (search)
    storeListCustomer: {
        filterButton: 'button.dokan-store-list-filter-button',
        searchVendor: '.store-search-input',
        apply: '#apply-filter-btn',
        visitStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//a[@title='Visit Store']`,
    },

    // WordPress media uploader
    wpMedia: {
        uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
        mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
    },
} as const;

// convenience aliases (mirror the reference's local selector groups)
const settingsAdmin = selectors.settingsAdmin;
const verificationsAdmin = selectors.verificationsAdmin;
const verificationsVendor = selectors.verificationsVendor;
const setupWizardVendor = selectors.setupWizardVendor;
const singleStoreCustomer = selectors.singleStoreCustomer;

type VerificationMethodDetails = { title: string; help_text: string; required: boolean };
type VerificationSubmission = { method: string; file: string };
type SetupWizardAddress = { street1: string; street2: string; city: string; zipCode: string; country: string; state: string };

export class VendorVerificationsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---------------------------------------------------------------------
    // ported base-class helpers (raw Playwright equivalents)
    // ---------------------------------------------------------------------

    private async goto(subPath: string, force = false): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        if (force) await this.page.reload();
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    private async goToDokanSettings(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
    }

    private async isVisibleWait(selector: string, timeoutMs = 2000): Promise<boolean> {
        return await this.page
            .locator(selector)
            .first()
            .waitFor({ state: 'visible', timeout: timeoutMs })
            .then(() => true)
            .catch(() => false);
    }

    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisibleWait(selector, 1000)) {
            await this.page.locator(selector).click();
        }
    }

    private async reloadIfVisible(selector: string): Promise<void> {
        if (await this.isVisibleWait(selector, 2000)) {
            await this.page.reload();
        }
    }

    private async clickAndWaitForLoadState(selector: string): Promise<void> {
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([this.page.waitForLoadState('load'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
    }

    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        this.page.once('dialog', dialog => dialog.accept().catch(() => undefined));
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForUrl(url: string | RegExp, selector: string): Promise<void> {
        await Promise.all([this.page.waitForURL(url, { waitUntil: 'domcontentloaded' }), this.page.locator(selector).click()]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // admin settings switcher: click only when currently OFF; returns true when it toggled.
    private async enableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<boolean> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getBackgroundColor(spanSelector);
        if (!value.includes('rgb(0, 144, 255)')) {
            await this.clickAndWaitForResponse(subUrl, spanSelector, code);
            return true;
        }
        return false;
    }

    // admin settings switcher: click only when currently ON; returns true when it toggled.
    private async disableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<boolean> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getBackgroundColor(spanSelector);
        if (value.includes('rgb(0, 144, 255)')) {
            await this.clickAndWaitForResponse(subUrl, spanSelector, code);
            return true;
        }
        return false;
    }

    private async getBackgroundColor(selector: string): Promise<string> {
        return await this.page.locator(selector).first().evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    private async forceLinkToSameTab(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveAttribute('target', '_blank');
        await this.page.locator(selector).evaluate(el => el.setAttribute('target', '_self'));
    }

    // assert every string leaf of a selector group is visible (functions are skipped)
    private async multipleElementVisible(group: Record<string, any>): Promise<void> {
        for (const key in group) {
            const value = group[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value);
            } else {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // WordPress media modal: pick the first uploaded item or upload the given file, then Select.
    private async uploadMedia(file: string): Promise<void> {
        await this.page.locator(selectors.wpMedia.mediaLibrary).click();
        const uploadedMediaVisible = await this.isVisibleWait(selectors.wpMedia.uploadedMediaFirst, 3000);
        if (uploadedMediaVisible) {
            await this.page.locator(selectors.wpMedia.uploadedMediaFirst).click();
        } else {
            await this.page.locator(selectors.wpMedia.uploadFiles).click();
            await this.page.setInputFiles(selectors.wpMedia.selectFilesInput, file);
        }

        await expect(async () => {
            const isEnabled = await this.page.locator(selectors.wpMedia.select).isEnabled();
            if (!isEnabled) {
                await this.page.locator(selectors.wpMedia.selectUploadedMedia).click();
            }
            await expect(this.page.locator(selectors.wpMedia.select)).toBeEnabled();
        }).toPass();

        await this.page.locator(selectors.wpMedia.select).click();
        await this.clickIfVisible(selectors.wpMedia.crop);
    }

    // ---------------------------------------------------------------------
    // module enable / disable
    // ---------------------------------------------------------------------

    // enable vendor verification module
    async enableVendorVerificationModule(): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan);
        await expect(this.page.locator(selectors.menusAdmin.verifications)).toBeHidden();

        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(settingsAdmin.menus.vendorVerification)).toBeVisible();

        // vendor dashboard menu (React sidebar — driven from a settings sub-page
        // where the Settings group is expanded and the classic menu is hidden)
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await expect(this.page.locator(selectors.vendorDashboardMenus.sidebarVerification).first()).toBeVisible();
    }

    // disable vendor verification module
    async disableVendorVerificationModule(): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan, true);
        await expect(this.page.locator(selectors.menusAdmin.verifications)).toBeHidden();

        // dokan menu page
        await this.goto(data.subUrls.backend.dokan.verifications, true);
        await expect(this.page.locator(verificationsAdmin.verificationsDiv)).toBeHidden();

        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(settingsAdmin.menus.vendorVerification)).toBeHidden();

        // vendor dashboard menu (React sidebar — the Verification entry is gone
        // once the module is deactivated)
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await expect(this.page.locator(selectors.vendorDashboardMenus.sidebarVerification)).toBeHidden();

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.settingsVerification);
        await expect(this.page.locator(verificationsVendor.verificationSettingsDiv)).toBeHidden();
    }

    // ---------------------------------------------------------------------
    // verification methods (admin settings)
    // ---------------------------------------------------------------------

    // change verified icon and confirm it renders on the store profile
    async changeVerifiedIcon(icon: string, storeName: string): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsAdmin.menus.vendorVerification).click();

        await this.page.locator(settingsAdmin.vendorVerification.verifiedIconByIcon(icon)).click();

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await expect(this.page.locator(settingsAdmin.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.vendorVerification.saveSuccessMessage);

        // single store page
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await expect(this.page.locator(singleStoreCustomer.verifiedIconByIcon(icon))).toBeVisible();
    }

    // fill the add/edit verification method modal fields
    private async updateVerificationMethod(verificationMethod: VerificationMethodDetails): Promise<void> {
        await this.page.locator(settingsAdmin.vendorVerification.addNewVerification.label).fill(verificationMethod.title);
        await this.page.locator(settingsAdmin.vendorVerification.addNewVerification.helpText).fill(verificationMethod.help_text);
        if (verificationMethod.required) {
            await this.page.locator(settingsAdmin.vendorVerification.addNewVerification.required).check();
        }
    }

    // add verification method
    async addVendorVerificationMethod(verificationMethod: VerificationMethodDetails): Promise<void> {
        await this.goToDokanSettings();
        await this.page.reload();
        await this.page.locator(settingsAdmin.menus.vendorVerification).click();

        await this.page.locator(settingsAdmin.vendorVerification.addNewVerification.addNewVerification).click();
        await this.updateVerificationMethod(verificationMethod);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.addNewVerification.create, 201);
        await expect(this.page.locator(settingsAdmin.vendorVerification.methodCreateSuccessMessage)).toBeVisible();

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await expect(this.page.locator(settingsAdmin.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // edit verification method
    async editVendorVerificationMethod(methodName: string, verificationMethod: VerificationMethodDetails): Promise<void> {
        await this.goToDokanSettings();
        await this.page.reload();
        await this.page.locator(settingsAdmin.menus.vendorVerification).click();

        await this.page.locator(settingsAdmin.vendorVerification.editVerificationMethod(methodName)).click();
        await this.updateVerificationMethod(verificationMethod);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.addNewVerification.update);
        await expect(this.page.locator(settingsAdmin.vendorVerification.methodUpdateSuccessMessage)).toBeVisible();

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await expect(this.page.locator(settingsAdmin.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // delete verification method
    async deleteVendorVerificationMethod(methodName: string): Promise<void> {
        await this.goToDokanSettings();
        await this.page.reload();
        await this.page.locator(settingsAdmin.menus.vendorVerification).click();

        await this.page.locator(settingsAdmin.vendorVerification.deleteVerificationMethod(methodName)).click();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.confirmDelete, 204);
        await expect(this.page.locator(settingsAdmin.vendorVerification.methodDeleteSuccessMessage)).toBeVisible();

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await expect(this.page.locator(settingsAdmin.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // update verification method status (enable/disable switcher)
    async updateVerificationMethodStatus(methodName: string, status: string): Promise<void> {
        await this.goToDokanSettings();
        await this.page.reload();
        await this.page.locator(settingsAdmin.menus.vendorVerification).click();

        const toggled =
            status === 'enable'
                ? await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.enableVerificationMethod(methodName))
                : await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsAdmin.vendorVerification.enableVerificationMethod(methodName));
        if (toggled) {
            await expect(this.page.locator(settingsAdmin.vendorVerification.methodUpdateSuccessMessage)).toBeVisible();
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await expect(this.page.locator(settingsAdmin.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.vendorVerification.saveSuccessMessage);
    }

    // ---------------------------------------------------------------------
    // verification requests (admin list)
    // ---------------------------------------------------------------------

    // admin verifications page renders properly
    async adminVerificationsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        const noVerificationRequests = await this.isVisibleWait(verificationsAdmin.noRowsFound);

        if (noVerificationRequests) {
            await expect(this.page.locator(verificationsAdmin.noRowsFound)).toContainText('No requests found.');
            console.log('No verification request found');
        } else {
            // verification requests text is visible
            await expect(this.page.locator(verificationsAdmin.verificationRequestsText)).toBeVisible();

            // navTab elements are visible (tabByStatus function is skipped)
            await this.multipleElementVisible(verificationsAdmin.navTabs);

            // bulk action elements are visible
            await this.multipleElementVisible(verificationsAdmin.bulkActions);

            // filter elements are visible
            await expect(this.page.locator(verificationsAdmin.filters.filterByVendors)).toBeVisible();
            await expect(this.page.locator(verificationsAdmin.filters.filterByMethods)).toBeVisible();

            // verification table elements are visible
            await this.multipleElementVisible(verificationsAdmin.table);
        }
    }

    // filter verification requests
    async filterVerificationRequests(input: string, action: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.verifications);

        // reset previous filter if visible
        await this.clickIfVisible(verificationsAdmin.filters.reset);

        switch (action) {
            case 'by-status': {
                await this.clickAndWaitForLoadState(verificationsAdmin.navTabs.tabByStatus(input));
                return;
            }

            case 'by-vendor':
                await this.page.locator(verificationsAdmin.filters.filterByVendors).click();
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, verificationsAdmin.filters.filterInput, input);
                await expect(this.page.locator(verificationsAdmin.filters.result)).toContainText(input);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.filters.filteredResult(input));
                break;

            case 'by-verification-method':
                await this.page.locator(verificationsAdmin.filters.filterByMethods).click();
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, verificationsAdmin.filters.filterInput, input);
                await expect(this.page.locator(verificationsAdmin.filters.result)).toContainText(input);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.filters.filteredResult(input));
                break;

            default:
                break;
        }
        await expect(this.page.locator(verificationsAdmin.numberOfRowsFound)).not.toHaveText('0 items');
        await expect(this.page.locator(verificationsAdmin.noRowsFound)).toBeHidden();
    }

    // reset filter
    async resetFilter(): Promise<void> {
        await expect(this.page.locator(verificationsAdmin.filters.reset)).toBeVisible();
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.filters.reset);
        await expect(this.page.locator(verificationsAdmin.filters.reset)).toBeHidden();
    }

    // add note to verification request
    async addNoteVerificationRequest(requestId: string, note: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        await this.page.locator(verificationsAdmin.verificationRequestAddNote(requestId)).click();
        await this.page.locator(verificationsAdmin.addNote).fill(note);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.updateNote);
    }

    // view verification request document
    async viewVerificationRequestDocument(requestId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);
        await this.forceLinkToSameTab(verificationsAdmin.verificationRequestDocument(requestId));
        const documentLink = (await this.page.locator(verificationsAdmin.verificationRequestDocument(requestId)).getAttribute('href')) as string;
        await this.clickAndWaitForUrl(documentLink, verificationsAdmin.verificationRequestDocument(requestId));
        await expect(this.page.locator('body img')).toHaveAttribute('src', documentLink);
    }

    // approve/reject verification request
    async updateVerificationRequest(requestId: string, action: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.verifications);

        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.verificationRequestApprove(requestId));
                await expect(this.page.locator(verificationsAdmin.verificationRequestCell(requestId))).toBeHidden();
                await this.clickAndWaitForLoadState(verificationsAdmin.navTabs.approved);
                break;

            case 'reject':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.verificationRequestReject(requestId));
                await expect(this.page.locator(verificationsAdmin.verificationRequestCell(requestId))).toBeHidden();
                await this.clickAndWaitForLoadState(verificationsAdmin.navTabs.rejected);
                break;

            default:
                break;
        }
        await expect(this.page.locator(verificationsAdmin.verificationRequestCell(requestId))).toBeVisible();
    }

    // verification request bulk action
    async verificationRequestBulkAction(action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.verifications);
        await this.reloadIfVisible(verificationsAdmin.filters.reset);

        // ensure row exists
        await expect(this.page.locator(verificationsAdmin.noRowsFound)).toBeHidden();

        await this.page.locator(verificationsAdmin.bulkActions.selectAll).click();
        await this.page.selectOption(verificationsAdmin.bulkActions.selectAction, { value: action });
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.verifications, verificationsAdmin.bulkActions.applyAction);
    }

    // ---------------------------------------------------------------------
    // vendor (dashboard + setup wizard)
    // ---------------------------------------------------------------------

    // vendor verification settings render properly
    async vendorVerificationsSettingsRenderProperly(methodName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

        // verification text is visible
        await expect(this.page.locator(verificationsVendor.verificationText)).toBeVisible();

        // visit store link is visible
        await expect(this.page.locator(verificationsVendor.visitStore)).toBeVisible();

        // verification method
        await expect(this.page.locator(verificationsVendor.verificationMethodDiv(methodName))).toBeVisible();
        await expect(this.page.locator(verificationsVendor.startVerification(methodName))).toBeVisible();

        await this.page.locator(verificationsVendor.startVerification(methodName)).click();

        await expect(this.page.locator(verificationsVendor.verificationMethodHelpText(methodName))).toBeVisible();
        await expect(this.page.locator(verificationsVendor.uploadFiles(methodName))).toBeVisible();
        await expect(this.page.locator(verificationsVendor.submit(methodName))).toBeVisible();
        await expect(this.page.locator(verificationsVendor.cancelSubmit(methodName))).toBeVisible();
    }

    // advance the setup wizard up to the verification step
    private async gotoSetupWizardVerification(): Promise<void> {
        // Always navigate fresh — the shared vendor page is reused across tests,
        // so `goIfNotThere` would leave us on a later wizard step (no "Let's Go"
        // intro) whenever the previous test ended on the wizard.
        await this.goto(data.subUrls.frontend.vDashboard.setupWizard);
        await this.page.locator(setupWizardVendor.letsGo).click();
        await this.completeAddressStep(data.vendorSetupWizard);
        await this.page.locator(setupWizardVendor.skipTheStepPaymentSetup).click();
    }

    // vendor submit verification request
    async submitVerificationRequest(verification: VerificationSubmission, setupWizard = false): Promise<void> {
        if (!setupWizard) {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
            await this.page.reload();
        } else {
            await this.gotoSetupWizardVerification();
        }

        await this.page.locator(verificationsVendor.startVerification(verification.method)).click();
        await this.page.locator(verificationsVendor.uploadFiles(verification.method)).click();
        await this.uploadMedia(verification.file);
        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.submit(verification.method));

        await expect(this.page.locator(verificationsVendor.requestCreateSuccessMessage)).toBeVisible();
        await expect(this.page.locator(verificationsVendor.verificationStatus(verification.method, 'pending'))).toBeVisible();
    }

    // vendor cancel verification request
    async cancelVerificationRequest(verificationMethod: string, setupWizard = false): Promise<void> {
        if (!setupWizard) {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
            await this.page.reload();
        } else {
            await this.gotoSetupWizardVerification();
        }

        await this.page.locator(verificationsVendor.cancelVerification(verificationMethod)).click();
        await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.confirmCancelRequest);
        await expect(this.page.locator(verificationsVendor.requestCancelSuccessMessage)).toBeVisible();
    }

    // vendor view verification request document
    async vendorViewVerificationRequestDocument(methodName: string, setupWizard = false): Promise<void> {
        if (!setupWizard) {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
        } else {
            await this.gotoSetupWizardVerification();
        }
        await this.forceLinkToSameTab(verificationsVendor.verificationRequestDocument(methodName));
        const documentLink = (await this.page.locator(verificationsVendor.verificationRequestDocument(methodName)).getAttribute('href')) as string;
        await this.clickAndWaitForUrl(documentLink, verificationsVendor.verificationRequestDocument(methodName));
        await expect(this.page.locator('body img')).toHaveAttribute('src', documentLink);
    }

    // vendor view verification request note
    async viewVerificationRequestNote(methodName: string, note: string, setupWizard = false): Promise<void> {
        if (!setupWizard) {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
        } else {
            await this.gotoSetupWizardVerification();
        }

        await expect(this.page.locator(verificationsVendor.verificationRequestNote(methodName))).toContainText(note);
    }

    // vendor view verification methods on setup wizard
    // The wizard was redesigned to surface BOTH required and non-required enabled
    // methods (grouped into "Required Verification Methods" and a plain group),
    // so both render on the wizard — verified against the live setup-wizard.php.
    async viewVerificationMethods(requiredMethod: string, nonRequiredMethod: string): Promise<void> {
        await this.gotoSetupWizardVerification();

        await expect(this.page.locator(verificationsVendor.verificationMethodDiv(requiredMethod))).toBeVisible();
        await expect(this.page.locator(verificationsVendor.verificationMethodDiv(nonRequiredMethod))).toBeVisible();
    }

    // complete the setup wizard address step
    private async completeAddressStep(setupWizardData: SetupWizardAddress): Promise<void> {
        await this.page.locator(setupWizardVendor.street1).fill(setupWizardData.street1);
        await this.page.locator(setupWizardVendor.street2).fill(setupWizardData.street2);
        await this.page.locator(setupWizardVendor.city).fill(setupWizardData.city);
        await this.page.locator(setupWizardVendor.zipCode).fill(setupWizardData.zipCode);
        await this.page.locator(setupWizardVendor.country).click();
        await this.page.locator(setupWizardVendor.countryInput).pressSequentially(setupWizardData.country, { delay: 100 });
        await expect(this.page.locator(setupWizardVendor.highlightedResult)).toContainText(setupWizardData.country);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(setupWizardVendor.state).click();
        await this.page.locator(setupWizardVendor.stateInput).pressSequentially(setupWizardData.state, { delay: 100 });
        // Commit the state select2 selection (mirrors the country step above). For a
        // country that has states (e.g. US), the store-step "Continue" handler blocks
        // and returns when `address[state]` is empty. The old code only filtered the
        // search box without choosing an option, so it relied on the vendor already
        // having a state saved in dokan_profile_settings — true for the accumulated
        // local Docker (state=NY) but absent on a fresh CI vendor, which is why these
        // setup-wizard tests failed only in CI. Select the highlighted state so the
        // hidden <select> gets a real value before continuing.
        await expect(this.page.locator(setupWizardVendor.highlightedResult)).toContainText(setupWizardData.state);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(setupWizardVendor.continueStoreSetup).click();
    }

    // ---------------------------------------------------------------------
    // customer (storefront)
    // ---------------------------------------------------------------------

    // storefront store-list search
    private async searchStore(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.page.locator(selectors.storeListCustomer.filterButton).click();
        await this.page.locator(selectors.storeListCustomer.searchVendor).fill(storeName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.storeListing, selectors.storeListCustomer.apply);
        await expect(this.page.locator(selectors.storeListCustomer.visitStore(storeName))).toBeVisible();
    }

    // customer views verified badge (store list + single store)
    async viewVerifiedBadge(storeName: string): Promise<void> {
        // store listing page
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.searchStore(storeName);
        await expect(this.page.locator(singleStoreCustomer.verifiedIcon)).toBeVisible();

        // single store page
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await expect(this.page.locator(singleStoreCustomer.verifiedIcon)).toBeVisible();
    }
}
