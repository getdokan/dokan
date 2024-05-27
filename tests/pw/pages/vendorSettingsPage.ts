import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const settingsVendor = selector.vendor.vStoreSettings;

export class VendorSettingsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor settings

    // vendor settings render properly
    async vendorStoreSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        // settings text is visible
        await this.toBeVisible(settingsVendor.settingsText);

        // todo: update for lite

        // visit store link is visible
        await this.toBeVisible(settingsVendor.banner);
        await this.toBeVisible(settingsVendor.profilePicture);
        await this.toBeVisible(settingsVendor.storeName);
        await this.toBeVisible(settingsVendor.phoneNo);
        DOKAN_PRO && (await this.toBeVisible(settingsVendor.multipleLocation));

        // store address location elements are visible
        const { saveLocation, cancelSaveLocation, deleteSaveLocation, ...address } = settingsVendor.address;
        await this.multipleElementVisible(address);
        DOKAN_PRO && (await this.toBeVisible(saveLocation));

        // company info elements are visible
        DOKAN_PRO && (await this.multipleElementVisible(settingsVendor.companyInfo));

        await this.toBeVisible(settingsVendor.email);

        // map is visible
        // await this.toBeVisible(settingsVendor.map); //TODO: g_map value not found

        // todo: catalog, discount, vacation, open close, store category

        // biography is visible
        DOKAN_PRO && (await this.toBeVisible(settingsVendor.biographyIframe));

        // todo: min-max, store-support

        // update settings are visible
        await this.toBeVisible(settingsVendor.updateSettingsTop);
        await this.toBeVisible(settingsVendor.updateSettings);
    }

    // vendor shipstation render properly
    async vendorShipstationSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

        // shipstation text is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.shipStationText);

        // visit store link is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.visitStore);

        // authentication key is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.authenticationKey);

        // export order statuses is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.exportOrderStatusesInput);

        // Shipped Order Status is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.shippedOrderStatusDropdown);

        // save changes is visible
        await this.toBeVisible(selector.vendor.vShipStationSettings.saveChanges);
    }

    // vendor social profile render properly
    async vendorSocialProfileSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);

        // social profile text is visible
        await this.toBeVisible(selector.vendor.vSocialProfileSettings.socialProfileText);

        // visit store link is visible
        await this.toBeVisible(selector.vendor.vSocialProfileSettings.visitStore);

        // social platform elements are visible
        await this.multipleElementVisible(selector.vendor.vSocialProfileSettings.platforms);

        // update settings is visible
        await this.toBeVisible(selector.vendor.vSocialProfileSettings.updateSettings);
    }

    // vendor rma render properly
    async vendorRmaSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);

        // return and warranty text is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.returnAndWarrantyText);

        // visit store link is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.visitStore);

        // rma label input is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.label);

        // rma type input is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.type);

        // rma policy input is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.refundPolicyIframe);

        // save changes is visible
        await this.toBeVisible(selector.vendor.vRmaSettings.saveChanges);
    }

    // vendor store seo render properly
    async vendorStoreSeoSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        // store seo text is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.storeSeoText);

        // visit store link is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.visitStore);

        // seo title is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.seoTitle);

        // meta description is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.metaDescription);

        // meta keywords is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.metaKeywords);

        // store seo facebook elements are visible
        await this.multipleElementVisible(selector.vendor.vStoreSeoSettings.facebook);

        // store seo twitter elements are visible
        await this.multipleElementVisible(selector.vendor.vStoreSeoSettings.twitter);

        // save changes is visible
        await this.toBeVisible(selector.vendor.vStoreSeoSettings.saveChanges);
    }

    // store settings

    // update store map via settings save
    async updateStoreMapViaSettingsSave() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, 'Your information has been saved successfully');
    }

    // vendor set store settings
    async setStoreSettings(vendorInfo: vendor['vendorInfo'], topic: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        switch (topic) {
            case 'banner-profile':
                // await this.bannerAndProfilePictureSettings(); // todo:
                break;

            case 'basic':
                await this.basicInfoSettings(vendorInfo);
                break;

            case 'address':
                await this.setStoreAddress(vendorInfo);
                break;

            case 'company-info':
                await this.setCompanyInfo(vendorInfo);
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

    // vendor set company info
    async setCompanyInfo(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.clearAndType(settingsVendor.companyInfo.companyName, vendorInfo.companyName);
        await this.clearAndType(settingsVendor.companyInfo.companyId, vendorInfo.companyId);
        await this.clearAndType(settingsVendor.companyInfo.vatOrTaxNumber, vendorInfo.vatNumber);
        await this.clearAndType(settingsVendor.companyInfo.nameOfBank, vendorInfo.bankName);
        await this.clearAndType(settingsVendor.companyInfo.bankIban, vendorInfo.bankIban);
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
        const tocEnabled = await this.isVisible(settingsVendor.termsAndConditions);
        if (tocEnabled) {
            await this.check(settingsVendor.termsAndConditions);
            await this.typeFrameSelector(settingsVendor.termsAndConditionsIframe, settingsVendor.termsAndConditionsHtmlBody, termsAndConditions);
        }
    }

    // vendor set opening closing time settings
    async openingClosingTimeSettings(openingClosingTime: vendor['vendorInfo']['openingClosingTime']): Promise<void> {
        const openCloseTimeEnabled = await this.isVisible(settingsVendor.storeOpeningClosingTime);
        if (openCloseTimeEnabled) {
            await this.check(settingsVendor.storeOpeningClosingTime);
            for (const day of openingClosingTime.days) {
                if (DOKAN_PRO) {
                    await this.enableSwitcherDeliveryTime(settingsVendor.openingClosingTimeSwitch(day));
                    await this.setAttributeValue(settingsVendor.openingTime(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(settingsVendor.openingTimeHiddenInput(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(settingsVendor.closingTime(day), 'value', openingClosingTime.closingTime);
                    await this.setAttributeValue(settingsVendor.closingTimeHiddenInput(day), 'value', openingClosingTime.closingTime);
                } else {
                    // lite
                    await this.selectByValue(settingsVendor.lite.openingClosingTimeEnable(day), openingClosingTime.statusLite);
                    await this.clearAndType(settingsVendor.lite.openingTimeInput(day), openingClosingTime.openingTime);
                    await this.clearAndType(settingsVendor.lite.closingTimeInput(day), openingClosingTime.closingTime);
                }
            }
            await this.clearAndType(settingsVendor.storeOpenNotice, openingClosingTime.storeOpenNotice);
            await this.clearAndType(settingsVendor.storeCloseNotice, openingClosingTime.storeCloseNotice);
        }
    }

    // vendor set vacation settings
    async vacationSettings(vacation: vendor['vendorInfo']['vacation']): Promise<void> {
        const vacationModeEnabled = await this.isVisible(settingsVendor.goToVacation);
        if (vacationModeEnabled) {
            await this.check(settingsVendor.goToVacation);
            await this.selectByValue(settingsVendor.closingStyle, vacation.closingStyle);

            switch (vacation.closingStyle) {
                // instantly close
                case 'instantly':
                    await this.clearAndType(settingsVendor.setVacationMessageInstantly, vacation.instantly.vacationMessage);
                    break;

                // datewise close
                case 'datewise': {
                    const vacationDayFrom = vacation.datewise.vacationDayFrom();
                    const vacationDayTo = vacation.datewise.vacationDayTo(vacationDayFrom);
                    await this.setAttributeValue(settingsVendor.vacationDateRange, 'value', `${helpers.dateFormatFYJ(vacationDayFrom)} - ${helpers.dateFormatFYJ(vacationDayTo)}`);
                    await this.setAttributeValue(settingsVendor.vacationDateRangeFrom, 'value', vacationDayFrom);
                    await this.setAttributeValue(settingsVendor.vacationDateRangeTo, 'value', vacationDayTo);
                    await this.clearAndType(settingsVendor.setVacationMessageDatewise, vacation.datewise.vacationMessage);
                    await this.clickAndWaitForResponse(data.subUrls.ajax, settingsVendor.saveVacationEdit);
                    break;
                }

                default:
                    break;
            }
        }
    }

    // vendor delete pervious datewise vacation settings if any
    async deletePreviousDatewiseVacation() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        const noVacationIsSetIsVisible = await this.isVisible(settingsVendor.noVacationIsSet);
        if (!noVacationIsSetIsVisible) {
            await this.hover(settingsVendor.vacationRow);
            await this.click(settingsVendor.deleteSavedVacationSchedule);
            await this.clickAndWaitForResponse(data.subUrls.ajax, settingsVendor.confirmDeleteSavedVacationSchedule);
        }

        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set catalog mode settings
    async catalogModeSettings(): Promise<void> {
        const catalogModeEnabled = await this.isVisible(settingsVendor.removeAddToCartButton);
        if (catalogModeEnabled) {
            await this.check(settingsVendor.removeAddToCartButton);
            await this.check(settingsVendor.hideProductPrice);
            await this.checkIfVisible(settingsVendor.enableRequestQuoteSupport);
        }
    }

    // reset catalog
    async resetCatalog(): Promise<void> {
        await this.uncheck(settingsVendor.removeAddToCartButton);
        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set discount settings
    async discountSettings(amountDiscount: vendor['vendorInfo']['amountDiscount']): Promise<void> {
        const discountEnabled = await this.isVisible(settingsVendor.enableStoreWideDiscount);
        if (discountEnabled) {
            await this.check(settingsVendor.enableStoreWideDiscount);
            await this.clearAndType(settingsVendor.minimumOrderAmount, amountDiscount.minimumOrderAmount);
            await this.clearAndType(settingsVendor.percentage, amountDiscount.discountPercentage);
        }
    }

    // vendor set biography settings
    async biographySettings(biography: string): Promise<void> {
        await this.typeFrameSelector(settingsVendor.biographyIframe, settingsVendor.biographyHtmlBody, biography);
    }

    // vendor set store support settings
    async storeSupportSettings(supportButtonText: string): Promise<void> {
        const storeSupportEnabled = await this.isVisible(settingsVendor.removeAddToCartButton);
        if (storeSupportEnabled) {
            await this.check(settingsVendor.showSupportButtonInStore);
            await this.check(settingsVendor.showSupportButtonInSingleProduct);
            await this.clearAndType(settingsVendor.supportButtonText, supportButtonText);
        }
    }

    // vendor set minmax settings
    async minMaxSettings(minMax: vendor['vendorInfo']['minMax']): Promise<void> {
        const minMaxEnabled = await this.isVisible(settingsVendor.enableMinMaxQuantities);
        if (minMaxEnabled) {
            // min max quantities
            await this.check(settingsVendor.enableMinMaxQuantities);
            await this.clearAndType(settingsVendor.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
            await this.clearAndType(settingsVendor.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);

            // min max amount
            await this.check(settingsVendor.enableMinMaxAmount);
            await this.clearAndType(settingsVendor.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
            await this.clearAndType(settingsVendor.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
            await this.click(settingsVendor.clear);
            await this.click(settingsVendor.selectAll);
            const multipleCategory = await this.isVisible(settingsVendor.selectCategorySearch);
            if (multipleCategory) {
                await this.select2ByTextMultiSelector(settingsVendor.selectCategorySearch, settingsVendor.selectCategorySearchedResult, minMax.category);
            } else {
                await this.selectByLabel(settingsVendor.selectCategory, minMax.category);
            }
        }
    }

    // vendor set Shipstation settings
    async setShipStation(shipStation: vendor['shipStation']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

        const allStatus = await this.getMultipleElementTexts(selector.vendor.vShipStationSettings.selectedStatus);
        const statusIsSelected = allStatus.includes('×' + shipStation.status);
        if (!statusIsSelected) {
            await this.clearAndType(selector.vendor.vShipStationSettings.exportOrderStatusesInput, shipStation.status);
            await this.toContainText(selector.vendor.vShipStationSettings.result, shipStation.status);
            await this.press(data.key.enter);
        }

        // await this.click(selector.vendor.vShipStationSettings.shippedOrderStatusDropdown);
        // await this.clearAndType(selector.vendor.vShipStationSettings.shippedOrderStatusInput, shipStation.status);// todo: need to fix -> locator issue
        // await this.toContainText(selector.vendor.vShipStationSettings.result, shipStation.status);
        // await this.press(data.key.enter);

        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShipStationSettings.saveChanges);
        await this.toContainText(selector.vendor.vShipStationSettings.saveSuccessMessage, 'Your changes has been updated!');
        await this.click(selector.vendor.vShipStationSettings.successOk);
    }

    // vendor set social profile settings
    async setSocialProfile(urls: vendor['socialProfileUrls']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.facebook, urls.facebook);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.twitter, urls.twitter);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.pinterest, urls.pinterest);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.linkedin, urls.linkedin);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.youtube, urls.youtube);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.instagram, urls.instagram);
        await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.flickr, urls.flickr);
        await this.keyPressOnLocator(selector.vendor.vSocialProfileSettings.updateSettings, data.key.enter);
        await this.toContainText(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage, urls.saveSuccessMessage);
    }

    // vendor set rma settings
    async setRmaSettings(rma: vendor['rma']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);
        await this.clearAndType(selector.vendor.vRmaSettings.label, rma.label);
        await this.selectByValue(selector.vendor.vRmaSettings.type, rma.type);
        await this.selectByValue(selector.vendor.vRmaSettings.length, rma.rmaLength);
        // todo: add addon
        if (rma.rmaLength === 'limited') {
            await this.clearAndType(selector.vendor.vRmaSettings.lengthValue, rma.lengthValue);
            await this.selectByValue(selector.vendor.vRmaSettings.lengthDuration, rma.lengthDuration);
        }
        // check if refund reason exists
        const refundReasonIsVisible = await this.isVisible(selector.vendor.vRmaSettings.refundReasonsFirst);
        if (refundReasonIsVisible) {
            await this.checkMultiple(selector.vendor.vRmaSettings.refundReasons);
        }
        await this.typeFrameSelector(selector.vendor.vRmaSettings.refundPolicyIframe, selector.vendor.vRmaSettings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsRma, selector.vendor.vRmaSettings.saveChanges, 302);
        await this.toContainText(selector.vendor.vRmaSettings.updateSettingsSuccessMessage, rma.saveSuccessMessage);
    }

    // vendor set seo settings
    async setStoreSeo(seo: vendor['seo']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

        await this.clearAndType(selector.vendor.vStoreSeoSettings.seoTitle, seo.seoTitle);
        await this.clearAndType(selector.vendor.vStoreSeoSettings.metaDescription, seo.metaDescription);
        await this.clearAndType(selector.vendor.vStoreSeoSettings.metaKeywords, seo.metaKeywords);

        await this.clearAndType(selector.vendor.vStoreSeoSettings.facebook.facebookTitle, seo.facebookTitle);
        await this.clearAndType(selector.vendor.vStoreSeoSettings.facebook.facebookDescription, seo.facebookDescription);

        await this.clearAndType(selector.vendor.vStoreSeoSettings.twitter.twitterTitle, seo.twitterTitle);
        await this.clearAndType(selector.vendor.vStoreSeoSettings.twitter.twitterDescription, seo.twitterDescription);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSeoSettings.saveChanges);
        await this.toContainText(selector.vendor.vStoreSeoSettings.updateSettingsSuccessMessage, 'Your changes has been updated!');
    }
}
