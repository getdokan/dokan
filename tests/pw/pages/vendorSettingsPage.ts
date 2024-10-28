import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const settingsVendor = selector.vendor.vStoreSettings;
const settingsShipStation = selector.vendor.vShipStationSettings;
const settingsSocialProfile = selector.vendor.vSocialProfileSettings;
const settingsStoreSeo = selector.vendor.vStoreSeoSettings;
const settingsRma = selector.vendor.vRmaSettings;

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
        if (DOKAN_PRO) {
            await this.toBeVisible(settingsVendor.multipleLocation);
        }

        // store address location elements are visible
        const { saveLocation, cancelSaveLocation, deleteSaveLocation, ...address } = settingsVendor.address;
        await this.multipleElementVisible(address);
        if (DOKAN_PRO) {
            await this.toBeVisible(saveLocation);
        }

        // company info elements are visible
        if (DOKAN_PRO) {
            await this.multipleElementVisible(settingsVendor.companyInfo);
        }

        await this.toBeVisible(settingsVendor.email);

        // map is visible
        // await this.toBeVisible(settingsVendor.map); // TODO: g_map value not found

        // todo: catalog, discount, vacation, open close, store category

        // biography is visible
        if (DOKAN_PRO) {
            await this.toBeVisible(settingsVendor.biographyIframe);
        }

        // todo: min-max, store-support

        // update settings are visible
        await this.toBeVisible(settingsVendor.updateSettingsTop);
        await this.toBeVisible(settingsVendor.updateSettings);
    }

    // vendor shipstation render properly
    async vendorShipstationSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

        // shipStation text is visible
        await this.toBeVisible(settingsShipStation.shipStationText);

        // visit store link is visible
        await this.toBeVisible(settingsShipStation.visitStore);

        // authentication key is visible
        await this.toBeVisible(settingsShipStation.authenticationKey);

        // export order statuses is visible
        await this.toBeVisible(settingsShipStation.exportOrderStatusesInput);

        // Shipped Order Status is visible
        await this.toBeVisible(settingsShipStation.shippedOrderStatusDropdown);

        // save changes is visible
        await this.toBeVisible(settingsShipStation.saveChanges);
    }

    // vendor social profile render properly
    async vendorSocialProfileSettingsRenderProperly() {
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
    async vendorRmaSettingsRenderProperly() {
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
    async vendorStoreSeoSettingsRenderProperly() {
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

    // store settings

    // update store map via settings save
    async updateStoreMapViaSettingsSave() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsVendor.updateSettings);
        await this.toContainText(settingsVendor.updateSettingsSuccessMessage, 'Your information has been saved successfully');
    }

    // save settings
    async saveSettings() {
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
            await this.checkIfVisible(settingsVendor.hideProductPrice);
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
        await this.clearAndType(settingsVendor.minMax.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
        await this.clearAndType(settingsVendor.minMax.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
    }

    // vendor set Shipstation settings
    async setShipStation(shipStation: vendor['shipStation']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

        const allStatus = await this.getMultipleElementTexts(settingsShipStation.selectedStatus);
        const statusIsSelected = allStatus.includes('×' + shipStation.status);
        if (!statusIsSelected) {
            await this.clearAndType(settingsShipStation.exportOrderStatusesInput, shipStation.status);
            await this.toContainText(settingsShipStation.result, shipStation.status);
            await this.press(data.key.enter);
        }

        // await this.click(settingsShipStation.shippedOrderStatusDropdown);
        // await this.clearAndType(settingsShipStation.shippedOrderStatusInput, shipStation.status);// todo: need to fix -> locator issue
        // await this.toContainText(settingsShipStation.result, shipStation.status);
        // await this.press(data.key.enter);

        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, settingsShipStation.saveChanges);
        await this.toContainText(settingsShipStation.saveSuccessMessage, 'Your changes has been updated!');
        await this.click(settingsShipStation.successOk);
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

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsRma, selector.vendor.vRmaSettings.saveChanges, 302);
        await this.toContainText(selector.vendor.vRmaSettings.updateSettingsSuccessMessage, rma.saveSuccessMessage);

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
