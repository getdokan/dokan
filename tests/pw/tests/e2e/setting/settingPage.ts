import { Page, Response, expect } from '@playwright/test';
import { toPath, closeAnnouncementModal, helpers } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

// The spec imports these names from this module. They are wired to the REAL
// @utils (not local stubs) and re-exported so the import contract is preserved.
export { ApiUtils, dbUtils, dbData, data, helpers, payloads };

const DOKAN_PRO = process.env.DOKAN_PRO;

// ============================================================================
// CO-LOCATED SELECTORS (ported verbatim from the pre-refactor pages/selectors.ts
// groups this page object referenced: frontend, customer.*, vendor.*)
// ============================================================================

const selectors = {
    frontend: {
        pageNotFound: '//h1[text()="Oops! That page can’t be found."]',
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
    },
    customer: {
        cRegistration: {
            regEmail: '#reg_email',
        },
        cDashboard: {
            termsAndConditions: '#tc_agree',
        },
        cSingleStore: {
            singleStoreDiv: 'div.dokan-single-store',
            productCard: {
                card: '.seller-items .product',
            },
        },
        cSingleProduct: {
            menus: {
                vendorInfo: '.tabs .seller_tab a',
                moreProducts: '.tabs .more_seller_product_tab a',
            },
            // Product vendor info (asserted as a group via multipleElementVisible)
            vendorInfo: {
                storeName: '.store-name',
                vendor: '.seller-name',
                storeAddress: '.store-address',
            },
            moreProducts: {
                noProductsDiv: 'div#tab-more_seller_product',
                moreProductsDiv: '#tab-more_seller_product .products',
                product: '#tab-more_seller_product .product',
            },
        },
        cWooSelector: {
            wooCommerceError: 'div.woocommerce-error',
        },
    },
    vendor: {
        vRegistration: {
            regEmail: 'input#reg_email',
            regPassword: 'input#reg_password',
            regVendor: '//input[@value="seller"]',
            firstName: 'input#first-name',
            lastName: 'input#last-name',
            shopName: 'input#company-name',
            shopUrl: 'input#seller-url',
            street1: 'input#dokan_address\\[street_1\\]',
            street2: 'input#dokan_address\\[street_2\\]',
            city: 'input#dokan_address\\[city\\]',
            zipCode: 'input#dokan_address\\[zip\\]',
            country: 'select#dokan_address_country',
            state: 'select#dokan_address_state',
            companyName: 'input#dokan-company-name',
            companyId: 'input#dokan-company-id-number',
            vatNumber: 'input#dokan-vat-number',
            bankName: 'input#dokan-bank-name',
            bankIban: 'input#dokan-bank-iban',
            phone: 'input#shop-phone',
            subscriptionPack: '#dokan-subscription-pack',
            register: 'button.woocommerce-Button',
        },
        vSetup: {
            setupLogoImage: 'h1#wc-logo img',
            setupWizardContent: '//div[@class="wc-setup-content"]//div//p',
            letsGo: '.lets-go-btn',
            notRightNow: '.not-right-now-btn',
            // Store setup
            street1: '#address\\[street_1\\]',
            street2: '#address\\[street_2\\]',
            city: '#address\\[city\\]',
            zipCode: '#address\\[zip\\]',
            country: '#select2-addresscountry-container',
            countryInput: '//input[@class="select2-search__field" and @aria-owns="select2-addresscountry-results"]',
            state: '#select2-calc_shipping_state-container',
            stateInput: '//input[@class="select2-search__field" and @aria-owns="select2-calc_shipping_state-results"]',
            storeCategories: '//select[contains(@id,"dokan_store_categories")]/..//span[@class="select2-selection select2-selection--multiple"]',
            storeCategoriesInput: '//input[@class="select2-search__field" and @aria-owns="select2-dokan_store_categories-results"]',
            highlightedResult: '.select2-results__option.select2-results__option--highlighted',
            selectedStoreCategories: '//select[contains(@id,"dokan_store_categories")]/..//li[@class="select2-selection__choice"]',
            map: 'input#dokan-map-add',
            mapResultFirst: '(//ul//li[@class="ui-menu-item"]//div[@class="ui-menu-item-wrapper"])[1]',
            email: '//input[@id="show_email"]/..//label',
            continueStoreSetup: '.store-step-continue',
            // Payment setup
            paypal: '//input[@name="settings[paypal][email]"]',
            bankAccountName: '#ac_name',
            bankAccountType: '#ac_type',
            bankRoutingNumber: '//input[@name="settings[bank][routing_number]"]',
            bankAccountNumber: '//input[@name="settings[bank][ac_number]"]',
            bankName: '//input[@name="settings[bank][bank_name]"]',
            bankAddress: '//textarea[@name="settings[bank][bank_addr]"]',
            bankIban: '//input[@name="settings[bank][iban]"]',
            bankSwiftCode: '//input[@name="settings[bank][swift]"]',
            declaration: '#declaration',
            customPayment: '//input[@name="settings[dokan_custom][value]"]',
            skrill: '//input[@name="settings[skrill][email]"]',
            continuePaymentSetup: '.payment-continue-btn',
            skipTheStepVerifications: '.payment-step-skip-btn',
            goToStoreDashboard: '.wc-setup-actions.step .button',
        },
        verifications: {
            firstVerificationMethod: '(//div[@class="dokan-panel-heading"]//strong)[1]',
            startVerification: (methodName: string) => `//strong[text()='${methodName}']/../..//button[contains(@class,'dokan-vendor-verification-start')]`,
            uploadFiles: (methodName: string) => `//strong[text()='${methodName}']/../..//a[@data-uploader_button_text='Add File']`,
            submit: (methodName: string) => `//strong[text()='${methodName}']/../..//input[contains(@class,'dokan_vendor_verification_submit')]`,
            verificationStatus: (methodName: string, status: string) => `//strong[text()='${methodName}']/../..//p//label[contains(@class,'${status}')]`,
            requestCreateSuccessMessage: '//div[text()="Verification Request Creation Successfully."]',
        },
        vDashboard: {
            dokanNotice: 'div.dokan-alert.dokan-alert-warning',
            menus: {
                primary: {
                    dashboard: 'ul.dokan-dashboard-menu li.dashboard a',
                },
            },
        },
        vStoreSettings: {
            toc: {
                termsAndConditions: '//label[contains(text(), "Terms and Conditions")]/..//input[@type="checkbox"]',
                termsAndConditionsIframe: '#dokan_tnc_text iframe',
            },
        },
        orders: {
            search: {
                searchInput: '//input[@placeholder="Search Orders"]',
                searchBtn: '//button[normalize-space()="Filter"]',
            },
            numberOfRowsFound: '.dokan-table.dokan-table tbody tr',
            orderLink: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/..`,
            view: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='View']`,
            orderDetails: {
                orderNumber: '//strong[contains(text(),"Order#")]',
            },
            status: {
                edit: '.dokan-edit-status',
            },
        },
    },
    wpMedia: {
        mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
        uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
    },
} as const;

const registrationVendor = selectors.vendor.vRegistration;
const setupWizardVendor = selectors.vendor.vSetup;
const verificationsVendor = selectors.vendor.verifications;
const vendorDashboard = selectors.vendor.vDashboard;
const ordersVendor = selectors.vendor.orders;

// ============================================================================
// PAGE OBJECT
// ============================================================================

export class SettingPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- internal helpers (raw Playwright, no external base page) -----------

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/\/$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goto(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil });
        await closeAnnouncementModal(this.page);
    }

    private async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil });
                await closeAnnouncementModal(this.page);
                expect(this.getCurrentUrl()).toMatch(subPath);
            }).toPass();
        }
    }

    private async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async focusAndClick(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.focus();
        await locator.click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async type(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(text, { delay: 100 });
    }

    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    private async check(selector: string): Promise<void> {
        await this.page.locator(selector).check();
    }

    private async selectByLabel(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { label: value });
    }

    private async selectByValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { value });
    }

    private async waitForVisibleLocator(selector: string): Promise<void> {
        await this.page.locator(selector).waitFor({ state: 'visible' });
    }

    private async uploadFile(selector: string, files: string | string[]): Promise<void> {
        await this.page.setInputFiles(selector, files);
    }

    // Polls up to `timeout` seconds; returns whether the element became visible.
    private async isVisible(selector: string, timeout = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                if (await this.page.locator(selector).isVisible()) return true;
            } catch {
                /* empty */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) interval = 100;
            else if (interval === 100) interval = 500;
        }
        return false;
    }

    private async hasText(selector: string, text: string): Promise<boolean> {
        const elementText = await this.page.locator(selector).textContent();
        return elementText?.trim() === text;
    }

    private async getMultipleElementTexts(selector: string): Promise<string[]> {
        return await this.page.locator(selector).allTextContents();
    }

    private async checkIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector)) {
            await this.check(selector);
        }
    }

    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1)) {
            await this.click(selector);
        }
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [, response] = await Promise.all([
            this.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
        return response;
    }

    // assertions
    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async toHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async toHaveAttribute(selector: string, attribute: string, value: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
    }

    // Recursively assert every leaf selector in an object is visible; skip
    // function-valued selector builders (matches the pre-refactor semantics).
    private async multipleElementVisible(group: Record<string, unknown>): Promise<void> {
        for (const key in group) {
            const value = group[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else if (typeof value === 'string') {
                await this.toBeVisible(value);
            }
        }
    }

    // Lightweight frontend logout (my-account -> logout link).
    private async logout(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        await this.clickAndWaitForLoadState(selectors.frontend.customerLogout);
    }

    // Upload/select media via the WP media modal (used by Pro vendor verifications).
    private async uploadMedia(file: string): Promise<void> {
        await this.click(selectors.wpMedia.mediaLibrary);
        const uploadedMediaIsVisible = await this.isVisible(selectors.wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.click(selectors.wpMedia.uploadedMediaFirst);
        } else {
            await this.click(selectors.wpMedia.uploadFiles);
            await this.uploadFile(selectors.wpMedia.selectFilesInput, file);
        }
        await expect(async () => {
            if (!(await this.page.isEnabled(selectors.wpMedia.select))) {
                await this.click(selectors.wpMedia.selectUploadedMedia);
            }
            await expect(this.page.locator(selectors.wpMedia.select)).toBeEnabled();
        }).toPass();
        await this.click(selectors.wpMedia.select);
        await this.clickIfVisible(selectors.wpMedia.crop);
    }

    // ---- navigation ---------------------------------------------------------

    async goToMyAccount(): Promise<void> {
        await this.goto(data.subUrls.frontend.myAccount);
    }

    async goToProductDetails(productName: string): Promise<void> {
        // The live WooCommerce product permalink base is `/product/<slug>/`.
        // (The shared `subUrls.frontend.productDetails` builder points at the
        // stale `shop/uncategorized/<slug>` structure, which 404s here.)
        await this.goto(`product/${helpers.slugify(productName)}`);
    }

    // ---- vendor registration + setup wizard (ported from vendorPage.ts) -----

    async openVendorRegistrationForm(): Promise<void> {
        await this.goto(data.subUrls.frontend.myAccount);
        const regIsVisible = await this.isVisible(selectors.customer.cRegistration.regEmail);
        if (!regIsVisible) {
            await this.logout();
        }
        await this.focusAndClick(registrationVendor.regVendor);
        await this.waitForVisibleLocator(registrationVendor.firstName);
    }

    async vendorRegister(vendorInfo: typeof data.vendor.vendorInfo, setupWizardData: typeof data.vendorSetupWizard): Promise<void> {
        const username = vendorInfo.firstName() + vendorInfo.lastName().replace("'", '');

        await this.goToMyAccount();
        const regIsVisible = await this.isVisible(selectors.customer.cRegistration.regEmail);
        if (!regIsVisible) {
            await this.logout();
        }
        await this.clearAndType(registrationVendor.regEmail, username + data.vendor.vendorInfo.emailDomain);
        await this.clearAndType(registrationVendor.regPassword, vendorInfo.password);
        await this.focusAndClick(registrationVendor.regVendor);
        await this.waitForVisibleLocator(registrationVendor.firstName);
        await this.clearAndType(registrationVendor.firstName, username);
        await this.clearAndType(registrationVendor.lastName, vendorInfo.lastName());
        await this.clearAndType(registrationVendor.shopName, vendorInfo.shopName());
        await this.click(registrationVendor.shopUrl);

        // fill address if enabled on registration
        if (vendorInfo.addressFieldsEnabled) {
            await this.clearAndType(registrationVendor.street1, vendorInfo.street1);
            await this.clearAndType(registrationVendor.street2, vendorInfo.street2);
            await this.clearAndType(registrationVendor.city, vendorInfo.city);
            await this.clearAndType(registrationVendor.zipCode, vendorInfo.zipCode);
            await this.selectByValue(registrationVendor.country, vendorInfo.countrySelectValue);
            await this.selectByValue(registrationVendor.state, vendorInfo.stateSelectValue);
        }
        // eu compliance fields (pro)
        if (DOKAN_PRO) {
            await this.clearAndType(registrationVendor.companyName, vendorInfo.companyName);
            await this.clearAndType(registrationVendor.companyId, vendorInfo.companyId);
            await this.clearAndType(registrationVendor.vatNumber, vendorInfo.vatNumber);
            await this.clearAndType(registrationVendor.bankName, vendorInfo.bankName);
            await this.clearAndType(registrationVendor.bankIban, vendorInfo.bankIban);
        }
        await this.clearAndType(registrationVendor.phone, vendorInfo.phoneNumber);
        await this.checkIfVisible(selectors.customer.cDashboard.termsAndConditions);

        // add subscription pack if enabled (pro)
        const subscriptionPackIsVisible = await this.isVisible(registrationVendor.subscriptionPack);
        if (subscriptionPackIsVisible) {
            await this.selectByLabel(registrationVendor.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
        }

        // complete setup wizard if enabled
        if (setupWizardData.setupWizardEnabled) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.setupWizard, registrationVendor.register);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, registrationVendor.register);
        }

        const registrationErrorIsVisible = await this.isVisible(selectors.customer.cWooSelector.wooCommerceError);
        if (registrationErrorIsVisible) {
            const hasError = await this.hasText(selectors.customer.cWooSelector.wooCommerceError, data.customer.registration.registrationErrorMessage);
            if (hasError) {
                console.log('User already exists!!');
                return;
            }
        }
        if (subscriptionPackIsVisible) {
            // Pro-only: paying for the subscription pack requires the full checkout
            // flow (customerPage.placeOrder). Not reachable in the @lite settings
            // suite (no subscription pack is rendered), so it is intentionally not
            // ported here — fail loud rather than silently continue if ever hit.
            throw new Error('vendor subscription checkout (placeOrder) is not ported in the settings suite');
        }
        if (setupWizardData.setupWizardEnabled) await this.vendorSetupWizard(setupWizardData);
    }

    async vendorSetupWizard(setupWizardData: typeof data.vendorSetupWizard): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.setupWizard);

        if (setupWizardData.choice) {
            await this.click(setupWizardVendor.letsGo);
            await this.clearAndType(setupWizardVendor.street1, setupWizardData.street1);
            await this.clearAndType(setupWizardVendor.street2, setupWizardData.street2);
            await this.clearAndType(setupWizardVendor.city, setupWizardData.city);
            await this.clearAndType(setupWizardVendor.zipCode, setupWizardData.zipCode);
            await this.click(setupWizardVendor.country);
            await this.type(setupWizardVendor.countryInput, setupWizardData.country);
            await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.country);
            await this.press(data.key.enter);
            await this.click(setupWizardVendor.state);
            await this.type(setupWizardVendor.stateInput, setupWizardData.state);
            await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.state);
            await this.press(data.key.enter);

            // store categories
            const storeCategoriesEnabled = await this.isVisible(setupWizardVendor.storeCategories);
            if (storeCategoriesEnabled) {
                const allStoreCategories = await this.getMultipleElementTexts(setupWizardVendor.selectedStoreCategories);
                const categoryIsSelected = allStoreCategories.includes('×' + setupWizardData.storeCategory);
                if (!categoryIsSelected) {
                    await this.click(setupWizardVendor.storeCategories);
                    await this.type(setupWizardVendor.storeCategoriesInput, setupWizardData.storeCategory);
                    await this.toContainText(setupWizardVendor.highlightedResult, setupWizardData.storeCategory);
                    await this.click(setupWizardVendor.highlightedResult);
                }
            }

            // map
            const geoLocationEnabled = await this.isVisible(setupWizardVendor.map);
            if (geoLocationEnabled) {
                await this.typeAndWaitForResponse(data.subUrls.gmap, setupWizardVendor.map, setupWizardData.mapLocation);
                await this.click(setupWizardVendor.mapResultFirst);
            }

            await this.check(setupWizardVendor.email);
            await this.clickAndWaitForLoadState(setupWizardVendor.continueStoreSetup);

            // payment
            await this.clearAndType(setupWizardVendor.paypal, setupWizardData.paypal());
            await this.clearAndType(setupWizardVendor.bankAccountName, setupWizardData.bankAccountName);
            await this.selectByValue(setupWizardVendor.bankAccountType, setupWizardData.bankAccountType);
            await this.clearAndType(setupWizardVendor.bankAccountNumber, setupWizardData.bankAccountNumber);
            await this.clearAndType(setupWizardVendor.bankRoutingNumber, setupWizardData.bankRoutingNumber);
            await this.clearAndType(setupWizardVendor.bankName, setupWizardData.bankName);
            await this.clearAndType(setupWizardVendor.bankAddress, setupWizardData.bankAddress);
            await this.clearAndType(setupWizardVendor.bankIban, setupWizardData.bankIban);
            await this.clearAndType(setupWizardVendor.bankSwiftCode, setupWizardData.bankSwiftCode);
            await this.check(setupWizardVendor.declaration);
            // custom method
            if (await this.isVisible(setupWizardVendor.customPayment)) {
                await this.clearAndType(setupWizardVendor.customPayment, setupWizardData.customPayment);
            }
            // skrill
            if (await this.isVisible(setupWizardVendor.skrill)) {
                await this.clearAndType(setupWizardVendor.skrill, setupWizardData.skrill);
            }
            await this.clickAndWaitForLoadState(setupWizardVendor.continuePaymentSetup);

            // verifications (pro)
            if (DOKAN_PRO) {
                const method = await this.page.locator(verificationsVendor.firstVerificationMethod).textContent();
                if (method) {
                    await this.click(verificationsVendor.startVerification(method));
                    await this.click(verificationsVendor.uploadFiles(method));
                    await this.uploadMedia(setupWizardData.file);
                    await this.clickAndWaitForResponse(data.subUrls.ajax, verificationsVendor.submit(method));
                    await this.toBeVisible(verificationsVendor.requestCreateSuccessMessage);
                    await this.toBeVisible(verificationsVendor.verificationStatus(method, 'pending'));
                }
                await this.click(setupWizardVendor.skipTheStepVerifications);
            }
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, setupWizardVendor.goToStoreDashboard);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, setupWizardVendor.notRightNow);
        }
        await this.toBeVisible(vendorDashboard.menus.primary.dashboard);
    }

    // ---- order details (ported from ordersPage.ts) --------------------------

    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);
        await this.clearAndType(ordersVendor.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.search.searchBtn);
        await this.toHaveCount(ordersVendor.numberOfRowsFound, 1);
        await this.toBeVisible(ordersVendor.orderLink(orderNumber));
    }

    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));
        await this.toContainText(ordersVendor.orderDetails.orderNumber, orderNumber);
    }

    // ========================================================================
    // SETTINGS TEST FLOWS (public API consumed by setting.spec.ts)
    // ========================================================================

    // general settings

    async vendorStoreUrlSetting(storeName: string, storeUrl: string): Promise<void> {
        // previous url now 404s (custom_store_url changed)
        await this.goto(data.subUrls.frontend.vendorDetails(storeName));
        await this.toBeVisible(selectors.frontend.pageNotFound);

        // new url resolves to the single store
        await this.goto(`${storeUrl}/${storeName}`);
        await this.toBeVisible(selectors.customer.cSingleStore.singleStoreDiv);
    }

    async vendorSetupWizardLogoAndMessageSetting(logoUrl: string, setupWizardMessage: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.setupWizard);
        await this.toHaveAttribute(setupWizardVendor.setupLogoImage, 'src', logoUrl);
        await this.toContainText(setupWizardVendor.setupWizardContent, setupWizardMessage);
    }

    async disableVendorSetupWizardSetting(): Promise<void> {
        await this.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, setupWizardEnabled: false, choice: false });
        await this.toBeVisible(vendorDashboard.menus.primary.dashboard);
    }

    async setStoreTermsAndConditions(status: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        if (status == 'on') {
            await this.toBeVisible(selectors.vendor.vStoreSettings.toc.termsAndConditions);
            await this.toBeVisible(selectors.vendor.vStoreSettings.toc.termsAndConditionsIframe);
        } else {
            await this.notToBeVisible(selectors.vendor.vStoreSettings.toc.termsAndConditions);
            await this.notToBeVisible(selectors.vendor.vStoreSettings.toc.termsAndConditionsIframe);
        }
    }

    async setStoreProductsPerPage(storeName: string, count: number): Promise<void> {
        await this.goto(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.toHaveCount(selectors.customer.cSingleStore.productCard.card, count);
    }

    async enableAddressFieldsOnRegistration(status: string): Promise<void> {
        await this.openVendorRegistrationForm();
        if (status == 'on') {
            await this.toBeVisible(registrationVendor.street1);
            await this.toBeVisible(registrationVendor.street2);
            await this.toBeVisible(registrationVendor.city);
            await this.toBeVisible(registrationVendor.zipCode);
            await this.toBeVisible(registrationVendor.country);
        } else {
            await this.notToBeVisible(registrationVendor.street1);
            await this.notToBeVisible(registrationVendor.street2);
            await this.notToBeVisible(registrationVendor.city);
            await this.notToBeVisible(registrationVendor.zipCode);
            await this.notToBeVisible(registrationVendor.country);
        }
    }

    async enableStoreTermsAndConditionsOnRegistration(status: string): Promise<void> {
        await this.openVendorRegistrationForm();
        if (status == 'on') {
            await this.toBeVisible(selectors.customer.cDashboard.termsAndConditions);
        } else {
            await this.notToBeVisible(selectors.customer.cDashboard.termsAndConditions);
        }
    }

    async setShowVendorInfo(productName: string, status: string): Promise<void> {
        await this.goToProductDetails(productName);
        if (status == 'on') {
            await this.toBeVisible(selectors.customer.cSingleProduct.menus.vendorInfo);
            await this.click(selectors.customer.cSingleProduct.menus.vendorInfo);
            await this.multipleElementVisible(selectors.customer.cSingleProduct.vendorInfo);
        } else {
            await this.notToBeVisible(selectors.customer.cSingleProduct.menus.vendorInfo);
        }
    }

    async enableMoreProductsTab(productName: string, status: string): Promise<void> {
        await this.goToProductDetails(productName);
        if (status == 'on') {
            await this.click(selectors.customer.cSingleProduct.menus.moreProducts);
            const hasMoreProducts = await this.isVisible(selectors.customer.cSingleProduct.moreProducts.moreProductsDiv);
            if (hasMoreProducts) {
                await this.toBeVisible(selectors.customer.cSingleProduct.moreProducts.moreProductsDiv);
                await this.notToHaveCount(selectors.customer.cSingleProduct.moreProducts.product, 0);
            } else {
                await this.toContainText(selectors.customer.cSingleProduct.moreProducts.noProductsDiv, 'No product has been found!');
            }
        } else {
            await this.notToBeVisible(selectors.customer.cSingleProduct.menus.moreProducts);
        }
    }

    // selling settings

    async enableVendorSelling(status: string): Promise<void> {
        await this.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice: false });
        if (status == 'on') {
            await this.notToBeVisible(vendorDashboard.dokanNotice);
        } else {
            await this.toBeVisible(vendorDashboard.dokanNotice);
            await this.toContainText(vendorDashboard.dokanNotice, 'Error! Your account is not enabled for selling, please contact the admin');
        }
    }

    async setOrderStatusChangeCapability(orderNumber: string, status: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        if (status == 'on') {
            await this.toBeVisible(ordersVendor.status.edit);
        } else {
            await this.notToBeVisible(ordersVendor.status.edit);
        }
    }
}
