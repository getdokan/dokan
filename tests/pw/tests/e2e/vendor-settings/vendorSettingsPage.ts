import { Page, expect, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';
import { ApiUtils as BaseApiUtils } from '@utils/apiUtils';

// Re-exported real utils so the spec's import contract resolves to the live
// implementations (not local stubs).
export { dbData } from '@utils/dbData';
export { dbUtils } from '@utils/dbUtils';
export { payloads } from '@utils/payloads';
export { data } from '@utils/testData';

// The real ApiUtils (all methods inherited — setStoreSettings, dispose, etc.).
// Constructor is widened to accept `null` because the spec instantiates it as
// `new ApiUtils(null)` inside a `describe.skip` block where the request context
// is never actually exercised.
export class ApiUtils extends BaseApiUtils {
    constructor(request: APIRequestContext | null = null) {
        super(request as APIRequestContext);
    }
}

const { DOKAN_PRO } = process.env;

// Co-located selectors (inlined from the pre-refactor selectors.ts groups:
// vStoreSettings, vShipStationSettings, vSocialProfileSettings,
// vStoreSeoSettings, vRmaSettings, wpMedia).
export const vendorSettingsSelectors = {
    vStoreSettings: {
        settingsText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        // wp image upload
        wpUploadFiles: '#menu-item-upload',
        uploadedMedia: '.attachment-preview',
        selectFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@class="browser button button-hero"]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',

        // banner and profile picture
        banner: '.dokan-banner .dokan-banner-drag',
        bannerHelpText: 'div.dokan-banner p.help-block',
        bannerImage: '//div[@class="image-wrap"]//img[@class="dokan-banner-img"]',
        uploadedBanner: 'div#dokan-profile-picture-wrapper div.gravatar-wrap',
        removeBannerImage: '.close.dokan-remove-banner-image',

        profilePicture: '.dokan-pro-gravatar-drag',
        profilePictureImage: '//div[@class="dokan-left gravatar-wrap"]//img[@class="dokan-gravatar-img"]',
        uploadedProfilePicture: 'div#dokan-profile-picture-wrapper div.gravatar-wrap',
        removeProfilePictureImage: '.dokan-close.dokan-remove-gravatar-image',

        // basic store Info
        storeName: '#dokan_store_name',
        phoneNo: '#setting_phone',

        // store categories
        storeCategories: {
            storeCategoryDropDown: '//label[contains(text(), "Store Category")]/..//span[@class="select2-selection__arrow"]',
            storeCategoryInput: '//span[@class="select2-search select2-search--dropdown"]//input[@role="searchbox"]',
            storeCategoriesInput: '//label[contains(text(), "Store Categories")]/..//input[@class="select2-search__field"]',
            result: '.select2-results__option.select2-results__option--highlighted',
        },

        multipleLocation: '#multiple-store-location',
        addLocation: '#show-add-store-location-section-btn',
        editLocation: '.store-pickup-location-edit-btn',
        locationName: '#store-location-name-input',

        // address
        address: {
            street: '#dokan_address\\[street_1\\]',
            street2: '#dokan_address\\[street_2\\]',
            city: '#dokan_address\\[city\\]',
            postOrZipCode: '#dokan_address\\[zip\\]',
            country: '#dokan_address_country',
            state: '#dokan-states-box #dokan_address_state',
            saveLocation: '#dokan-save-store-location-btn',
            cancelSaveLocation: '#cancel-store-location-section-btn',
            deleteSaveLocation: '.store-pickup-location-delete-btn',
        },

        // eu compliance info
        euFields: {
            companyName: '#settings_dokan_company_name',
            companyId: '#settings_dokan_company_id_number',
            vatOrTaxNumber: '#setting_vat_number',
            nameOfBank: '#setting_bank_name',
            bankIban: '#setting_bank_iban',
        },

        // email
        email: '//label[contains(text(), "Email")]/..//input[@type="checkbox"]',

        // map
        map: '#dokan-map-add',

        // terms and conditions
        toc: {
            termsAndConditions: '//label[contains(text(), "Terms and Conditions")]/..//input[@type="checkbox"]',
            termsAndConditionsIframe: '#dokan_tnc_text iframe',
            termsAndConditionsHtmlBody: '#tinymce',
        },

        storeOpeningClosingTime: {
            // store opening closing time
            storeOpeningClosingTime: 'input#dokan-store-time-enable',

            // lite locators
            lite: {
                openingClosingTimeEnable: (day: string) => `select[name="${day}[working_status]"]`,
                openingTimeInput: (day: string) => `input#opening-time\\[${day}\\]`,
                closingTimeInput: (day: string) => `input#closing-time\\[${day}\\]`,
            },
            openingClosingTimeSwitch: (day: string) => `//label[@for='${day}-working-status']/p[@class='switch tips']`,
            openingTime: (day: string) => `input#opening-time-${day}`,
            openingTimeHiddenInput: (day: string) => `//input[@name='opening_time[${day}][]']`,
            closingTime: (day: string) => `input#closing-time-${day}`,
            closingTimeHiddenInput: (day: string) => `//input[@name='closing_time[${day}][]']`,
            storeOpenNotice: '//input[@name="dokan_store_open_notice"]',
            storeCloseNotice: '//input[@name="dokan_store_close_notice"]',
        },

        // vacation
        vacation: {
            vacationDiv: 'fieldset#dokan-seller-vacation-settings',
            goToVacation: '#dokan-seller-vacation-activate',
            closingStyle: 'label .form-control',
            setVacationMessageInstantly: '//textarea[@id="dokan-seller-vacation-message" and @name="setting_vacation_message"]',
            setVacationMessageDatewise: '//textarea[@id="dokan-seller-vacation-message" and @name="dokan_seller_vacation_datewise_message"]',
            vacationDateRange: '#dokan-seller-vacation-date-from-range',
            vacationDateRangeFrom: 'input#dokan-seller-vacation-date-from',
            vacationDateRangeTo: 'input#dokan-seller-vacation-date-to',
            saveVacationEdit: '#dokan-seller-vacation-save-edit',
            cancelVacationEdit: '#dokan-seller-vacation-cancel-edit',
            noVacationIsSet: '//td[contains( text(),"No vacation is set")]',
            vacationRow: '//td[@class="dokan-seller-vacation-list-action"]/..',
            editSavedVacationSchedule: '.dokan-seller-vacation-list-action .fas',
            deleteSavedVacationSchedule: '.dokan-seller-vacation-remove-schedule',
            confirmDeleteSavedVacationSchedule: '.swal2-confirm',
            cancelDeleteSavedVacationSchedule: '.swal2-cancel',
        },

        // catalog mode
        catalogMode: {
            removeAddToCartButton: 'input#catalog_mode_hide_add_to_cart_button',
            hideProductPrice: 'input#catalog_mode_hide_product_price',
            enableRequestQuoteSupport: 'input#catalog_mode_request_a_quote_support',
        },

        // discount
        discount: {
            enableStoreWideDiscount: '#lbl_setting_minimum_quantity',
            minimumOrderAmount: '#setting_minimum_order_amount',
            percentage: '#setting_order_percentage',
        },

        // biography
        biography: {
            biographyIframe: '#wp-vendor_biography-wrap iframe',
            biographyHtmlBody: '#tinymce',
        },

        // store support
        storeSupport: {
            showSupportButtonInStore: '#support_checkbox',
            showSupportButtonInSingleProduct: '#support_checkbox_product',
            supportButtonText: '#dokan_support_btn_name',
        },

        // live chat
        liveChat: 'input#live_chat',

        // min-max
        minMax: {
            minMaxDiv: 'fieldset#min_max_amount',
            minimumAmountToPlaceAnOrder: 'input#min_amount_to_order',
            maximumAmountToPlaceAnOrder: 'input#max_amount_to_order',
        },

        // Update Settings
        updateSettingsTop: 'button.dokan-update-setting-top-button',
        updateSettings: '//input[@name="dokan_update_store_settings"]',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
    },

    vShipStationSettings: {
        shipStationSettingsDiv: 'div#dokan-shipstation-vendor-settings',
        shipStationText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        generateCredentials: 'button#dokan-shipstation-generate-credentials-btn',
        generateSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="API credentials generated successfully."]',
        revokeCredentials: 'button#dokan-shipstation-revoke-credentials-btn',
        confirmGeneration: 'button.swal2-confirm',
        confirmRevoke: 'button.swal2-confirm',
        revokeSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="API credentials revoked successfully."]',

        credentials: {
            authenticationKey: '//label[normalize-space()="Authentication Key"]/..//code',
            consumerKey: '//label[normalize-space()="Consumer Key"]/..//code',
            consumerSecret: '//label[normalize-space()="Consumer Secret"]/..//code',
        },
        secretKeyHideWarning: '//p[normalize-space(text())="Note: Once this page is refreshed, the consumer secret will no longer be available."]',

        selectedStatus: '//label[@for="dokan-shipstation-export-statuses"]/..//li[@class="select2-selection__choice"]',
        exportOrderStatusesInput: '//label[normalize-space()="Export Order Statuses"]/..//span[@class="select2-selection select2-selection--multiple"]//input[@class="select2-search__field"]',
        shippedOrderStatusDropdown: '.select2-selection__arrow',
        shippedOrderStatusInput: '(//input[@class="select2-search__field"])[2]',
        result: '.select2-results__option.select2-results__option--highlighted',

        saveChanges: '#dokan-store-shipstation-form-submit',
        saveSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="Settings saved successfully."]',
    },

    vSocialProfileSettings: {
        socialProfileText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        platforms: {
            facebook: '#settings\\[social\\]\\[fb\\]',
            twitter: '#settings\\[social\\]\\[twitter\\]',
            pinterest: '#settings\\[social\\]\\[pinterest\\]',
            linkedin: '#settings\\[social\\]\\[linkedin\\]',
            youtube: '#settings\\[social\\]\\[youtube\\]',
            instagram: '#settings\\[social\\]\\[instagram\\]',
            flickr: '#settings\\[social\\]\\[flickr\\]',
            threads: '#settings\\[social\\]\\[threads\\]',
        },

        updateSettings: 'input[value="Update Settings"]',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
    },

    vStoreSeoSettings: {
        storeSeoText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        seoTitle: '#dokan-seo-meta-title',
        metaDescription: '#dokan-seo-meta-desc',
        metaKeywords: '#dokan-seo-meta-keywords',

        facebook: {
            facebookTitle: '#dokan-seo-og-title',
            facebookDescription: '#dokan-seo-og-desc',
            facebookImage: '//label[contains( text(), "Facebook Image :")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            uploadedFacebookImage: '//label[@for="dokan-seo-og-image"]/..//div[@class="dokan-left gravatar-wrap"]',
        },

        twitter: {
            twitterTitle: '#dokan-seo-twitter-title',
            twitterDescription: '#dokan-seo-twitter-desc',
            twitterImage: '//label[contains( text(), "Twitter Image")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            uploadedTwitterImage: '//label[@for="dokan-seo-twitter-image"]/..//div[@class="dokan-left gravatar-wrap"]',
        },

        saveChanges: '#dokan-store-seo-form-submit',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success',
    },

    vRmaSettings: {
        rmaSettingsDiv: 'div.dokan-rma-wrapper',
        returnAndWarrantyText: '.dokan-settings-content h1',
        visitStore: '//a[normalize-space()="Visit Store"]',

        label: '#dokan-rma-label',
        type: '#dokan-warranty-type',
        length: '#dokan-warranty-length',
        lengthValue: '//input[@name="warranty_length_value"]',
        lengthDuration: '#dokan-warranty-length-duration',
        addonCost: 'input#warranty_addon_price\\[\\]',
        addonDurationLength: 'input#warranty_addon_length\\[\\]',
        addonDurationType: 'select#warranty_addon_duration\\[\\]',
        refundReasons: '#dokan-store-rma-form .checkbox input',
        refundReasonsFirst: '(//form[@id="dokan-store-rma-form"]//div[@class="checkbox"]//input)[1]',
        rmaPolicyIframe: '#wp-warranty_policy-wrap iframe',
        rmaPolicyHtmlBody: '#tinymce',
        saveChanges: '#dokan-store-rma-form-submit',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success',
    },

    wpMedia: {
        uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
        mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
    },
} as const;

// Aliases mirroring the pre-refactor local consts so the ported method bodies
// read identically to the reference.
const settingsVendor = vendorSettingsSelectors.vStoreSettings;
const settingsShipStation = vendorSettingsSelectors.vShipStationSettings;
const settingsSocialProfile = vendorSettingsSelectors.vSocialProfileSettings;
const settingsStoreSeo = vendorSettingsSelectors.vStoreSeoSettings;
const settingsRma = vendorSettingsSelectors.vRmaSettings;
const wpMedia = vendorSettingsSelectors.wpMedia;

export class VendorSettingsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    /**
     * Raw-Playwright ports of the pre-refactor base-class helpers.
     */

    // navigate to subPath only if not already there
    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    // assert element to be visible
    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    // assert element to contain text
    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    // assert element to have value
    private async toHaveValue(selector: string, value: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    // assert select element to have selected value (retries)
    private async toHaveSelectedValue(selector: string, value: string): Promise<void> {
        await expect(async () => {
            const selectedValue = await this.page.locator(selector).evaluate((el: HTMLSelectElement) => el.value);
            expect(selectedValue).toBe(value);
        }).toPass();
    }

    // assert element inside iframe to contain text (retries)
    private async toContainTextFrameLocator(frame: string, frameSelector: string, text: string): Promise<void> {
        await expect(async () => {
            await expect(this.page.frameLocator(frame).locator(frameSelector)).toContainText(text);
        }).toPass();
    }

    // recursively assert every string selector in an object is visible (skips functions)
    private async multipleElementVisible(selectors: { [key: string]: any }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value);
            } else {
                await this.toBeVisible(value);
            }
        }
    }

    // poll for visibility, returns boolean
    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutSec * 1000) {
            if (await this.page.locator(selector).isVisible().catch(() => false)) return true;
            await this.page.waitForTimeout(100);
        }
        return false;
    }

    // click element
    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    // click element if visible
    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1)) {
            await this.click(selector);
        }
    }

    // clear input field and type
    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    // check checkbox/radio and confirm
    private async check(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.check();
        await expect(locator).toBeChecked();
    }

    // uncheck checkbox/radio
    private async uncheck(selector: string): Promise<void> {
        await this.page.locator(selector).uncheck();
    }

    // check checkbox/radio only if visible
    private async checkIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector)) {
            await this.check(selector);
        }
    }

    // check every matched checkbox and confirm
    private async checkMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await expect(async () => {
                await element.check();
                await expect(element).toBeChecked();
            }).toPass();
        }
    }

    // assert every matched checkbox is checked
    private async toBeCheckedMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await expect(element).toBeChecked();
        }
    }

    // select option by value
    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    // keyboard press
    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    // keyboard press focused on a locator
    private async keyPressOnLocator(selector: string, key: string): Promise<void> {
        await this.page.locator(selector).press(key);
    }

    // hover over element
    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    // set an attribute value via DOM
    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page.locator(selector).evaluate((element, [attr, val]) => element.setAttribute(attr as string, val as string), [attribute, value]);
    }

    // get text content of every matched element
    private async getMultipleElementTexts(selector: string): Promise<string[]> {
        return await this.page.locator(selector).allTextContents();
    }

    // type inside an iframe body
    private async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        await this.page.frameLocator(frame).locator(frameSelector).fill(text);
    }

    // enable a delivery-time switcher only if not already active
    private async enableSwitcherDeliveryTime(selector: string): Promise<void> {
        const toggle = selector + '//div[contains(@class,"minitoggle")]';
        const classValue = (await this.page.locator(toggle).getAttribute('class')) ?? '';
        if (!classValue.includes('active')) {
            await this.click(toggle);
        }
    }

    // fill input and wait for a matching response
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // click and wait for a matching response
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    // click, wait for a matching response and for load state
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([this.page.waitForLoadState('load'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
    }

    // accept a dialog, click and wait for a matching response
    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    // upload media through the WP media modal
    private async uploadMedia(file: string): Promise<void> {
        await this.click(wpMedia.mediaLibrary);
        const uploadedMediaIsVisible = await this.isVisible(wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.click(wpMedia.uploadedMediaFirst);
        } else {
            await this.click(wpMedia.uploadFiles);
            await this.page.setInputFiles(wpMedia.selectFilesInput, file);
        }
        await expect(async () => {
            await this.click(wpMedia.select);
            await expect(this.page.locator(wpMedia.select)).toBeHidden();
        }).toPass();
    }

    /**
     * vendor settings render properly
     */

    // vendor store settings render properly
    async vendorStoreSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        // settings text is visible
        await this.toBeVisible(settingsVendor.settingsText);

        // visit store link is visible
        await this.toBeVisible(settingsVendor.banner);
        await this.toBeVisible(settingsVendor.profilePicture);
        await this.toBeVisible(settingsVendor.storeName);
        await this.toBeVisible(settingsVendor.phoneNo);
        if (DOKAN_PRO) {
            await this.toBeVisible(settingsVendor.multipleLocation);
        }

        // store address location elements are visible
        const { saveLocation, cancelSaveLocation, deleteSaveLocation, ...address } = settingsVendor.address;
        await this.multipleElementVisible(address);
        if (DOKAN_PRO) {
            await this.toBeVisible(saveLocation);
        }

        // eu compliance elements are visible
        if (DOKAN_PRO) {
            await this.multipleElementVisible(settingsVendor.euFields);
        }

        await this.toBeVisible(settingsVendor.email);

        // dokan pro options are visible
        if (DOKAN_PRO) {
            // catalog is visible
            await this.toBeVisible(settingsVendor.catalogMode.removeAddToCartButton);

            // open close is visible
            await this.toBeVisible(settingsVendor.storeOpeningClosingTime.storeOpeningClosingTime);

            // vacation  is visible
            await this.toBeVisible(settingsVendor.vacation.vacationDiv);

            // discount is visible
            await this.toBeVisible(settingsVendor.discount.enableStoreWideDiscount);

            // biography is visible
            await this.toBeVisible(settingsVendor.biography.biographyIframe);

            // store support elements are visible
            await this.multipleElementVisible(settingsVendor.storeSupport);

            // min max elements are visible
            await this.multipleElementVisible(settingsVendor.minMax);
        }

        // update settings are visible
        await this.toBeVisible(settingsVendor.updateSettingsTop);
        await this.toBeVisible(settingsVendor.updateSettings);
    }

    // vendor ShipStation render properly
    async vendorShipStationSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipStation);

        // shipStation text is visible
        await this.toBeVisible(settingsShipStation.shipStationText);

        // visit store link is visible
        await this.toBeVisible(settingsShipStation.visitStore);

        const isCredentialsGenerated = await this.isVisible(settingsShipStation.revokeCredentials);

        if (isCredentialsGenerated) {
            await this.multipleElementVisible(settingsShipStation.credentials);
        } else {
            await this.toBeVisible(settingsShipStation.generateCredentials);
        }

        // export order statuses is visible
        await this.toBeVisible(settingsShipStation.exportOrderStatusesInput);

        // Shipped Order Status is visible
        await this.toBeVisible(settingsShipStation.shippedOrderStatusDropdown);

        // save changes is visible
        await this.toBeVisible(settingsShipStation.saveChanges);
    }

    // vendor social profile render properly
    async vendorSocialProfileSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);

        // social profile text is visible
        await this.toBeVisible(settingsSocialProfile.socialProfileText);

        // visit store link is visible
        await this.toBeVisible(settingsSocialProfile.visitStore);

        // social platform elements are visible
        await this.multipleElementVisible(settingsSocialProfile.platforms);

        // update settings is visible
        await this.toBeVisible(settingsSocialProfile.updateSettings);
    }

    // vendor rma render properly
    async vendorRmaSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);

        // return and warranty text is visible
        await this.toBeVisible(settingsRma.returnAndWarrantyText);

        // visit store link is visible
        await this.toBeVisible(settingsRma.visitStore);

        // rma label input is visible
        await this.toBeVisible(settingsRma.label);

        // rma type input is visible
        await this.toBeVisible(settingsRma.type);

        // rma policy input is visible
        await this.toBeVisible(settingsRma.rmaPolicyIframe);

        // save changes is visible
        await this.toBeVisible(settingsRma.saveChanges);
    }

    // vendor store seo render properly
    async vendorStoreSeoSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        // store seo text is visible
        await this.toBeVisible(settingsStoreSeo.storeSeoText);

        // visit store link is visible
        await this.toBeVisible(settingsStoreSeo.visitStore);

        // seo title is visible
        await this.toBeVisible(settingsStoreSeo.seoTitle);

        // meta description is visible
        await this.toBeVisible(settingsStoreSeo.metaDescription);

        // meta keywords is visible
        await this.toBeVisible(settingsStoreSeo.metaKeywords);

        // store seo facebook elements are visible
        const { facebookImage, uploadedFacebookImage, ...facebook } = settingsStoreSeo.facebook;
        await this.multipleElementVisible(facebook);

        // store seo twitter elements are visible
        const { twitterImage, uploadedTwitterImage, ...twitter } = settingsStoreSeo.twitter;
        await this.multipleElementVisible(twitter);

        // save changes is visible
        await this.toBeVisible(settingsStoreSeo.saveChanges);
    }

    /**
     * store settings
     */

    // update store map via settings save
    async updateStoreMapViaSettingsSave(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, 'Your information has been saved successfully');
    }

    // save settings
    async saveSettings(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsRma, settingsRma.saveChanges, 302);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, 'Your information has been saved successfully');
    }

    // vendor set store settings
    async setStoreSettings(vendorInfo: vendor['vendorInfo'], topic: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        switch (topic) {
            case 'banner':
                await this.addBannerSettings(vendorInfo.banner);
                break;

            case 'profile-picture':
                await this.addProfilePictureSettings(vendorInfo.profilePicture);
                break;

            case 'basic':
                await this.basicInfoSettings(vendorInfo);
                break;

            case 'address':
                await this.setStoreAddress(vendorInfo);
                break;

            case 'euCompliance':
                await this.setEuComplianceInfo(vendorInfo);
                break;

            case 'map':
                await this.mapSettings(vendorInfo.mapLocation);
                break;

            case 'toc':
                await this.termsAndConditionsSettings(vendorInfo.termsAndConditions);
                break;

            case 'open-close':
                await this.openingClosingTimeSettings(vendorInfo.openingClosingTime);
                break;

            case 'vacation':
                await this.vacationSettings(vendorInfo.vacation);
                break;

            case 'catalog':
                await this.catalogModeSettings();
                break;

            case 'discount':
                await this.discountSettings(vendorInfo.amountDiscount);
                break;

            case 'biography':
                await this.biographySettings(vendorInfo.biography);
                break;

            case 'store-support':
                await this.storeSupportSettings(vendorInfo.supportButtonText);
                break;

            case 'liveChat':
                await this.liveChatSettings();
                break;

            case 'min-max':
                await this.minMaxSettings(vendorInfo.minMax);
                break;

            default:
                break;
        }

        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set banner settings
    async addBannerSettings(banner: string): Promise<void> {
        await this.clickIfVisible(settingsVendor.uploadedBanner);
        await this.click(settingsVendor.banner);
        await this.uploadMedia(banner);
    }

    // vendor set profile picture settings
    async addProfilePictureSettings(profilePicture: string): Promise<void> {
        await this.clickIfVisible(settingsVendor.uploadedProfilePicture);
        await this.click(settingsVendor.profilePicture);
        await this.uploadMedia(profilePicture);
    }

    // vendor set basic info settings
    async basicInfoSettings(vendorInfo: vendor['vendorInfo']): Promise<void> {
        // store basic info
        await this.clearAndType(settingsVendor.storeName, vendorInfo.storeName);
        await this.clearAndType(settingsVendor.phoneNo, vendorInfo.phoneNumber);
        // email
        await this.check(settingsVendor.email);
    }

    // vendor set store address
    async setStoreAddress(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.clearAndType(settingsVendor.address.street, vendorInfo.street1);
        await this.clearAndType(settingsVendor.address.street2, vendorInfo.street2);
        await this.clearAndType(settingsVendor.address.city, vendorInfo.city);
        await this.clearAndType(settingsVendor.address.postOrZipCode, vendorInfo.zipCode);
        await this.selectByValue(settingsVendor.address.country, vendorInfo.countrySelectValue);
        await this.selectByValue(settingsVendor.address.state, vendorInfo.stateSelectValue);
    }

    // vendor set eu compliance info
    async setEuComplianceInfo(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.clearAndType(settingsVendor.euFields.companyName, vendorInfo.companyName);
        await this.clearAndType(settingsVendor.euFields.companyId, vendorInfo.companyId);
        await this.clearAndType(settingsVendor.euFields.vatOrTaxNumber, vendorInfo.vatNumber);
        await this.clearAndType(settingsVendor.euFields.nameOfBank, vendorInfo.bankName);
        await this.clearAndType(settingsVendor.euFields.bankIban, vendorInfo.bankIban);
    }

    // vendor set map settings
    async mapSettings(mapLocation: string): Promise<void> {
        const geoLocationEnabled = await this.isVisible(settingsVendor.map);
        if (geoLocationEnabled) {
            await this.typeAndWaitForResponse(data.subUrls.gmap, settingsVendor.map, mapLocation);
            await this.press(data.key.arrowDown);
            await this.press(data.key.enter);
        }
    }

    // vendor set terms and conditions settings
    async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
        const tocEnabled = await this.isVisible(settingsVendor.toc.termsAndConditions);
        if (tocEnabled) {
            await this.check(settingsVendor.toc.termsAndConditions);
            await this.typeFrameSelector(settingsVendor.toc.termsAndConditionsIframe, settingsVendor.toc.termsAndConditionsHtmlBody, termsAndConditions);
        }
    }

    // vendor set opening closing time settings
    async openingClosingTimeSettings(openingClosingTime: vendor['vendorInfo']['openingClosingTime']): Promise<void> {
        const openCloseTimeEnabled = await this.isVisible(settingsVendor.storeOpeningClosingTime.storeOpeningClosingTime);
        if (openCloseTimeEnabled) {
            await this.check(settingsVendor.storeOpeningClosingTime.storeOpeningClosingTime);
            for (const day of openingClosingTime.days) {
                if (DOKAN_PRO) {
                    await this.enableSwitcherDeliveryTime(settingsVendor.storeOpeningClosingTime.openingClosingTimeSwitch(day));
                    await this.setAttributeValue(settingsVendor.storeOpeningClosingTime.openingTime(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(settingsVendor.storeOpeningClosingTime.openingTimeHiddenInput(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(settingsVendor.storeOpeningClosingTime.closingTime(day), 'value', openingClosingTime.closingTime);
                    await this.setAttributeValue(settingsVendor.storeOpeningClosingTime.closingTimeHiddenInput(day), 'value', openingClosingTime.closingTime);
                } else {
                    // lite
                    await this.selectByValue(settingsVendor.storeOpeningClosingTime.lite.openingClosingTimeEnable(day), openingClosingTime.statusLite);
                    await this.clearAndType(settingsVendor.storeOpeningClosingTime.lite.openingTimeInput(day), openingClosingTime.openingTime);
                    await this.clearAndType(settingsVendor.storeOpeningClosingTime.lite.closingTimeInput(day), openingClosingTime.closingTime);
                }
            }
            await this.clearAndType(settingsVendor.storeOpeningClosingTime.storeOpenNotice, openingClosingTime.storeOpenNotice);
            await this.clearAndType(settingsVendor.storeOpeningClosingTime.storeCloseNotice, openingClosingTime.storeCloseNotice);
        }
    }

    // vendor set vacation settings
    async vacationSettings(vacation: vendor['vendorInfo']['vacation']): Promise<void> {
        const vacationModeEnabled = await this.isVisible(settingsVendor.vacation.goToVacation);
        if (vacationModeEnabled) {
            await this.check(settingsVendor.vacation.goToVacation);
            await this.selectByValue(settingsVendor.vacation.closingStyle, vacation.closingStyle);

            switch (vacation.closingStyle) {
                // instantly close
                case 'instantly':
                    await this.clearAndType(settingsVendor.vacation.setVacationMessageInstantly, vacation.instantly.vacationMessage);
                    break;

                // datewise close
                case 'datewise': {
                    const vacationDayFrom = vacation.datewise.vacationDayFrom();
                    const vacationDayTo = vacation.datewise.vacationDayTo(vacationDayFrom);
                    await this.setAttributeValue(settingsVendor.vacation.vacationDateRange, 'value', `${helpers.dateFormatFYJ(vacationDayFrom)} - ${helpers.dateFormatFYJ(vacationDayTo)}`);
                    await this.setAttributeValue(settingsVendor.vacation.vacationDateRangeFrom, 'value', vacationDayFrom);
                    await this.setAttributeValue(settingsVendor.vacation.vacationDateRangeTo, 'value', vacationDayTo);
                    await this.clearAndType(settingsVendor.vacation.setVacationMessageDatewise, vacation.datewise.vacationMessage);
                    await this.clickAndWaitForResponse(data.subUrls.ajax, settingsVendor.vacation.saveVacationEdit);
                    break;
                }

                default:
                    break;
            }
        }
    }

    // vendor delete previous datewise vacation settings if any
    async deletePreviousDatewiseVacation(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        const noVacationIsSetIsVisible = await this.isVisible(settingsVendor.vacation.noVacationIsSet);
        if (!noVacationIsSetIsVisible) {
            await this.hover(settingsVendor.vacation.vacationRow);
            await this.click(settingsVendor.vacation.deleteSavedVacationSchedule);
            await this.clickAndWaitForResponse(data.subUrls.ajax, settingsVendor.vacation.confirmDeleteSavedVacationSchedule);
        }

        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set catalog mode settings
    async catalogModeSettings(): Promise<void> {
        const catalogModeEnabled = await this.isVisible(settingsVendor.catalogMode.removeAddToCartButton);
        if (catalogModeEnabled) {
            await this.check(settingsVendor.catalogMode.removeAddToCartButton);
            await this.checkIfVisible(settingsVendor.catalogMode.hideProductPrice);
            await this.checkIfVisible(settingsVendor.catalogMode.enableRequestQuoteSupport);
        }
    }

    // reset catalog
    async resetCatalog(): Promise<void> {
        await this.uncheck(settingsVendor.catalogMode.removeAddToCartButton);
        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set discount settings
    async discountSettings(amountDiscount: vendor['vendorInfo']['amountDiscount']): Promise<void> {
        const discountEnabled = await this.isVisible(settingsVendor.discount.enableStoreWideDiscount);
        if (discountEnabled) {
            await this.check(settingsVendor.discount.enableStoreWideDiscount);
            await this.clearAndType(settingsVendor.discount.minimumOrderAmount, amountDiscount.minimumOrderAmount);
            await this.clearAndType(settingsVendor.discount.percentage, amountDiscount.discountPercentage);
        }
    }

    // vendor set biography settings
    async biographySettings(biography: string): Promise<void> {
        await this.typeFrameSelector(settingsVendor.biography.biographyIframe, settingsVendor.biography.biographyHtmlBody, biography);
    }

    // vendor set store support settings
    async storeSupportSettings(supportButtonText: string): Promise<void> {
        await this.check(settingsVendor.storeSupport.showSupportButtonInStore);
        await this.check(settingsVendor.storeSupport.showSupportButtonInSingleProduct);
        await this.clearAndType(settingsVendor.storeSupport.supportButtonText, supportButtonText);
    }

    // vendor set live chat settings
    async liveChatSettings(): Promise<void> {
        await this.check(settingsVendor.liveChat);
    }

    // vendor set minmax settings
    async minMaxSettings(minMax: vendor['vendorInfo']['minMax']): Promise<void> {
        await this.clearAndType(settingsVendor.minMax.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
        await this.clearAndType(settingsVendor.minMax.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
    }

    // vendor set ShipStation settings
    async setShipStation(shipStation: vendor['shipStation']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipStation);

        // export order statuses
        const allStatus = await this.getMultipleElementTexts(settingsShipStation.selectedStatus);
        const statusIsSelected = allStatus.includes(`×${shipStation.status}`);
        if (!statusIsSelected) {
            await this.clearAndType(settingsShipStation.exportOrderStatusesInput, shipStation.status);
            await this.toContainText(settingsShipStation.result, shipStation.status);
            await this.press(data.key.enter);
        }

        // shipped order status
        await this.click(settingsShipStation.shippedOrderStatusDropdown);
        await this.clearAndType(settingsShipStation.shippedOrderStatusInput, shipStation.status);
        await this.toContainText(settingsShipStation.result, shipStation.status);
        await this.press(data.key.enter);

        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.shipStation, settingsShipStation.saveChanges, 201);
        await this.toBeVisible(settingsShipStation.saveSuccessMessage);
    }

    // vendor set social profile settings
    async setSocialProfile(urls: vendor['socialProfileUrls']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);
        await this.clearAndType(settingsSocialProfile.platforms.facebook, urls.facebook);
        await this.clearAndType(settingsSocialProfile.platforms.twitter, urls.twitter);
        await this.clearAndType(settingsSocialProfile.platforms.pinterest, urls.pinterest);
        await this.clearAndType(settingsSocialProfile.platforms.linkedin, urls.linkedin);
        await this.clearAndType(settingsSocialProfile.platforms.youtube, urls.youtube);
        await this.clearAndType(settingsSocialProfile.platforms.instagram, urls.instagram);
        await this.clearAndType(settingsSocialProfile.platforms.flickr, urls.flickr);
        await this.clearAndType(settingsSocialProfile.platforms.threads, urls.flickr);
        await this.keyPressOnLocator(settingsSocialProfile.updateSettings, data.key.enter);
        await this.toContainText(settingsSocialProfile.updateSettingsSuccessMessage, urls.saveSuccessMessage);
        await this.toHaveValue(settingsSocialProfile.platforms.facebook, urls.facebook);
        await this.toHaveValue(settingsSocialProfile.platforms.twitter, urls.twitter);
        await this.toHaveValue(settingsSocialProfile.platforms.pinterest, urls.pinterest);
        await this.toHaveValue(settingsSocialProfile.platforms.linkedin, urls.linkedin);
        await this.toHaveValue(settingsSocialProfile.platforms.youtube, urls.youtube);
        await this.toHaveValue(settingsSocialProfile.platforms.instagram, urls.instagram);
        await this.toHaveValue(settingsSocialProfile.platforms.flickr, urls.flickr);
        await this.toHaveValue(settingsSocialProfile.platforms.threads, urls.flickr);
    }

    // vendor set rma settings
    async setRmaSettings(rma: vendor['rma']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);
        await this.clearAndType(settingsRma.label, rma.label);
        await this.selectByValue(settingsRma.type, rma.type);

        if (rma.type === 'included_warranty') {
            await this.selectByValue(settingsRma.length, rma.length);
            if (rma.length === 'limited') {
                await this.clearAndType(settingsRma.lengthValue, rma.lengthValue);
                await this.selectByValue(settingsRma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.clearAndType(settingsRma.addonCost, rma.addon.cost);
            await this.clearAndType(settingsRma.addonDurationLength, rma.addon.durationLength);
            await this.selectByValue(settingsRma.addonDurationType, rma.addon.durationType);
        }
        const refundReasonIsVisible = await this.isVisible(settingsRma.refundReasonsFirst);
        if (refundReasonIsVisible) {
            await this.checkMultiple(settingsRma.refundReasons);
        }
        await this.typeFrameSelector(settingsRma.rmaPolicyIframe, settingsRma.rmaPolicyHtmlBody, rma.refundPolicy);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsRma, settingsRma.saveChanges, 302);
        await this.toContainText(settingsRma.updateSettingsSuccessMessage, rma.saveSuccessMessage);

        await this.toHaveValue(settingsRma.label, rma.label);
        await this.toHaveSelectedValue(settingsRma.type, rma.type);
        if (rma.type === 'included_warranty') {
            await this.toHaveSelectedValue(settingsRma.length, rma.length);
            if (rma.length === 'limited') {
                await this.toHaveValue(settingsRma.lengthValue, rma.lengthValue);
                await this.toHaveSelectedValue(settingsRma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.toHaveValue(settingsRma.addonCost, rma.addon.cost);
            await this.toHaveValue(settingsRma.addonDurationLength, rma.addon.durationLength);
            await this.toHaveSelectedValue(settingsRma.addonDurationType, rma.addon.durationType);
        }

        if (refundReasonIsVisible) {
            await this.toBeCheckedMultiple(settingsRma.refundReasons);
        }
        await this.toContainTextFrameLocator(settingsRma.rmaPolicyIframe, settingsRma.rmaPolicyHtmlBody, rma.refundPolicy);
    }

    // vendor set seo settings
    async setStoreSeo(seo: vendor['seo']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        await this.clearAndType(settingsStoreSeo.seoTitle, seo.seoTitle);
        await this.clearAndType(settingsStoreSeo.metaDescription, seo.metaDescription);
        await this.clearAndType(settingsStoreSeo.metaKeywords, seo.metaKeywords);

        await this.clearAndType(settingsStoreSeo.facebook.facebookTitle, seo.facebookTitle);
        await this.clearAndType(settingsStoreSeo.facebook.facebookDescription, seo.facebookDescription);
        await this.clickIfVisible(settingsStoreSeo.facebook.uploadedFacebookImage);
        await this.click(settingsStoreSeo.facebook.facebookImage);
        await this.uploadMedia(seo.facebookImage);

        await this.clearAndType(settingsStoreSeo.twitter.twitterTitle, seo.twitterTitle);
        await this.clearAndType(settingsStoreSeo.twitter.twitterDescription, seo.twitterDescription);
        await this.clickIfVisible(settingsStoreSeo.twitter.uploadedTwitterImage);
        await this.click(settingsStoreSeo.twitter.twitterImage);
        await this.uploadMedia(seo.twitterImage);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsStoreSeo.saveChanges);
        await this.toContainText(settingsStoreSeo.updateSettingsSuccessMessage, 'Your changes has been updated!');

        await this.toHaveValue(settingsStoreSeo.seoTitle, seo.seoTitle);
        await this.toHaveValue(settingsStoreSeo.metaDescription, seo.metaDescription);
        await this.toHaveValue(settingsStoreSeo.metaKeywords, seo.metaKeywords);

        await this.toHaveValue(settingsStoreSeo.facebook.facebookTitle, seo.facebookTitle);
        await this.toHaveValue(settingsStoreSeo.facebook.facebookDescription, seo.facebookDescription);
        await this.toBeVisible(settingsStoreSeo.facebook.uploadedFacebookImage);

        await this.toHaveValue(settingsStoreSeo.twitter.twitterTitle, seo.twitterTitle);
        await this.toHaveValue(settingsStoreSeo.twitter.twitterDescription, seo.twitterDescription);
        await this.toBeVisible(settingsStoreSeo.twitter.uploadedTwitterImage);
    }
}
