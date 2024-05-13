import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const vendorSettings = selector.vendor.vStoreSettings;

export class VendorSettingsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor settings

    // vendor settings render properly
    async vendorStoreSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

        // settings text is visible
        await this.toBeVisible(vendorSettings.settingsText);

        // todo: update for lite

        // visit store link is visible
        await this.toBeVisible(vendorSettings.banner);
        await this.toBeVisible(vendorSettings.profilePicture);
        await this.toBeVisible(vendorSettings.storeName);
        await this.toBeVisible(vendorSettings.phoneNo);
        DOKAN_PRO && (await this.toBeVisible(vendorSettings.multipleLocation));

        // store address location elements are visible
        const { saveLocation, cancelSaveLocation, deleteSaveLocation, ...address } = vendorSettings.address;
        await this.multipleElementVisible(address);
        DOKAN_PRO && (await this.toBeVisible(saveLocation));

        // company info elements are visible
        DOKAN_PRO && (await this.multipleElementVisible(vendorSettings.companyInfo));

        await this.toBeVisible(vendorSettings.email);

        // map is visible
        // await this.toBeVisible(vendorSettings.map); //TODO: g_map value not found

        // todo: catalog, discount, vacation, open close, store category

        // biography is visible
        DOKAN_PRO && (await this.toBeVisible(vendorSettings.biographyIframe));

        // todo: min-max, store-support

        // update settings are visible
        await this.toBeVisible(vendorSettings.updateSettingsTop);
        await this.toBeVisible(vendorSettings.updateSettings);
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
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorSettings.updateSettings);
        await this.toContainText(vendorSettings.updateSettingsSuccessMessage, 'Your information has been saved successfully');
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
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorSettings.updateSettings);
        await this.toContainText(vendorSettings.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set basic info settings
    async basicInfoSettings(vendorInfo: vendor['vendorInfo']): Promise<void> {
        // store basic info
        await this.clearAndType(vendorSettings.storeName, vendorInfo.storeName);
        await this.clearAndType(vendorSettings.phoneNo, vendorInfo.phoneNumber);
        // email
        await this.check(vendorSettings.email);
    }

    // vendor set store address
    async setStoreAddress(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.clearAndType(vendorSettings.address.street, vendorInfo.street1);
        await this.clearAndType(vendorSettings.address.street2, vendorInfo.street2);
        await this.clearAndType(vendorSettings.address.city, vendorInfo.city);
        await this.clearAndType(vendorSettings.address.postOrZipCode, vendorInfo.zipCode);
        await this.selectByValue(vendorSettings.address.country, vendorInfo.countrySelectValue);
        await this.selectByValue(vendorSettings.address.state, vendorInfo.stateSelectValue);
    }

    // vendor set company info
    async setCompanyInfo(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.clearAndType(vendorSettings.companyInfo.companyName, vendorInfo.companyName);
        await this.clearAndType(vendorSettings.companyInfo.companyId, vendorInfo.companyId);
        await this.clearAndType(vendorSettings.companyInfo.vatOrTaxNumber, vendorInfo.vatNumber);
        await this.clearAndType(vendorSettings.companyInfo.nameOfBank, vendorInfo.bankName);
        await this.clearAndType(vendorSettings.companyInfo.bankIban, vendorInfo.bankIban);
    }

    // vendor set map settings
    async mapSettings(mapLocation: string): Promise<void> {
        const geoLocationEnabled = await this.isVisible(vendorSettings.map);
        if (geoLocationEnabled) {
            await this.typeAndWaitForResponse(data.subUrls.gmap, vendorSettings.map, mapLocation);
            await this.press(data.key.arrowDown);
            await this.press(data.key.enter);
        }
    }

    // vendor set terms and conditions settings
    async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
        const tocEnabled = await this.isVisible(vendorSettings.termsAndConditions);
        if (tocEnabled) {
            await this.check(vendorSettings.termsAndConditions);
            await this.typeFrameSelector(vendorSettings.termsAndConditionsIframe, vendorSettings.termsAndConditionsHtmlBody, termsAndConditions);
        }
    }

    // vendor set opening closing time settings
    async openingClosingTimeSettings(openingClosingTime: vendor['vendorInfo']['openingClosingTime']): Promise<void> {
        const openCloseTimeEnabled = await this.isVisible(vendorSettings.storeOpeningClosingTime);
        if (openCloseTimeEnabled) {
            await this.check(vendorSettings.storeOpeningClosingTime);
            for (const day of openingClosingTime.days) {
                if (DOKAN_PRO) {
                    await this.enableSwitcherDeliveryTime(vendorSettings.openingClosingTimeSwitch(day));
                    await this.setAttributeValue(vendorSettings.openingTime(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(vendorSettings.openingTimeHiddenInput(day), 'value', openingClosingTime.openingTime);
                    await this.setAttributeValue(vendorSettings.closingTime(day), 'value', openingClosingTime.closingTime);
                    await this.setAttributeValue(vendorSettings.closingTimeHiddenInput(day), 'value', openingClosingTime.closingTime);
                } else {
                    // lite
                    await this.selectByValue(vendorSettings.lite.openingClosingTimeEnable(day), openingClosingTime.statusLite);
                    await this.clearAndType(vendorSettings.lite.openingTimeInput(day), openingClosingTime.openingTime);
                    await this.clearAndType(vendorSettings.lite.closingTimeInput(day), openingClosingTime.closingTime);
                }
            }
            await this.clearAndType(vendorSettings.storeOpenNotice, openingClosingTime.storeOpenNotice);
            await this.clearAndType(vendorSettings.storeCloseNotice, openingClosingTime.storeCloseNotice);
        }
    }

    // vendor set vacation settings
    async vacationSettings(vacation: vendor['vendorInfo']['vacation']): Promise<void> {
        const vacationModeEnabled = await this.isVisible(vendorSettings.goToVacation);
        if (vacationModeEnabled) {
            await this.check(vendorSettings.goToVacation);
            await this.selectByValue(vendorSettings.closingStyle, vacation.closingStyle);

            switch (vacation.closingStyle) {
                // instantly close
                case 'instantly':
                    await this.clearAndType(vendorSettings.setVacationMessageInstantly, vacation.instantly.vacationMessage);
                    break;

                // datewise close
                case 'datewise': {
                    const vacationDayFrom = vacation.datewise.vacationDayFrom();
                    const vacationDayTo = vacation.datewise.vacationDayTo(vacationDayFrom);
                    await this.setAttributeValue(vendorSettings.vacationDateRange, 'value', helpers.dateFormatFYJ(vacationDayFrom) + ' - ' + helpers.dateFormatFYJ(vacationDayTo));
                    await this.setAttributeValue(vendorSettings.vacationDateRangeFrom, 'value', vacationDayFrom);
                    await this.setAttributeValue(vendorSettings.vacationDateRangeTo, 'value', vacationDayTo);
                    await this.clearAndType(vendorSettings.setVacationMessageDatewise, vacation.datewise.vacationMessage);
                    await this.clickAndWaitForResponse(data.subUrls.ajax, vendorSettings.saveVacationEdit);
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
        const noVacationIsSetIsVisible = await this.isVisible(vendorSettings.noVacationIsSet);
        if (!noVacationIsSetIsVisible) {
            await this.hover(vendorSettings.vacationRow);
            await this.click(vendorSettings.deleteSavedVacationSchedule);
            await this.clickAndWaitForResponse(data.subUrls.ajax, vendorSettings.confirmDeleteSavedVacationSchedule);
        }

        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorSettings.updateSettings);
        await this.toContainText(vendorSettings.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set catalog mode settings
    async catalogModeSettings(): Promise<void> {
        const catalogModeEnabled = await this.isVisible(vendorSettings.removeAddToCartButton);
        if (catalogModeEnabled) {
            await this.check(vendorSettings.removeAddToCartButton);
            await this.check(vendorSettings.hideProductPrice);
            await this.checkIfVisible(vendorSettings.enableRequestQuoteSupport);
        }
    }

    // reset catalog
    async resetCatalog(): Promise<void> {
        await this.uncheck(vendorSettings.removeAddToCartButton);
        // update settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorSettings.updateSettings);
        await this.toContainText(vendorSettings.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);
    }

    // vendor set discount settings
    async discountSettings(amountDiscount: vendor['vendorInfo']['amountDiscount']): Promise<void> {
        const discountEnabled = await this.isVisible(vendorSettings.enableStoreWideDiscount);
        if (discountEnabled) {
            await this.check(vendorSettings.enableStoreWideDiscount);
            await this.clearAndType(vendorSettings.minimumOrderAmount, amountDiscount.minimumOrderAmount);
            await this.clearAndType(vendorSettings.percentage, amountDiscount.discountPercentage);
        }
    }

    // vendor set biography settings
    async biographySettings(biography: string): Promise<void> {
        await this.typeFrameSelector(vendorSettings.biographyIframe, vendorSettings.biographyHtmlBody, biography);
    }

    // vendor set store support settings
    async storeSupportSettings(supportButtonText: string): Promise<void> {
        const storeSupportEnabled = await this.isVisible(vendorSettings.removeAddToCartButton);
        if (storeSupportEnabled) {
            await this.check(vendorSettings.showSupportButtonInStore);
            await this.check(vendorSettings.showSupportButtonInSingleProduct);
            await this.clearAndType(vendorSettings.supportButtonText, supportButtonText);
        }
    }

    // vendor set minmax settings
    async minMaxSettings(minMax: vendor['vendorInfo']['minMax']): Promise<void> {
        const minMaxEnabled = await this.isVisible(vendorSettings.enableMinMaxQuantities);
        if (minMaxEnabled) {
            // min max quantities
            await this.check(vendorSettings.enableMinMaxQuantities);
            await this.clearAndType(vendorSettings.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
            await this.clearAndType(vendorSettings.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);

            // min max amount
            await this.check(vendorSettings.enableMinMaxAmount);
            await this.clearAndType(vendorSettings.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
            await this.clearAndType(vendorSettings.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
            await this.click(vendorSettings.clear);
            await this.click(vendorSettings.selectAll);
            const multipleCategory = await this.isVisible(vendorSettings.selectCategorySearch);
            if (multipleCategory) {
                await this.select2ByTextMultiSelector(vendorSettings.selectCategorySearch, vendorSettings.selectCategorySearchedResult, minMax.category);
            } else {
                await this.selectByLabel(vendorSettings.selectCategory, minMax.category);
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
