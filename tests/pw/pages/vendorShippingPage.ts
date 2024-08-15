import { Page, expect } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor, shipping } from '@utils/interfaces';

// selectors
const vendorShipping = selector.vendor.vShippingSettings;

export class VendorShippingPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor shipping settings

    // vendor shipping render properly
    async vendorShippingSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);

        // shipstation text is visible
        await this.toBeVisible(vendorShipping.shippingSettingsText);

        // visit store link is visible
        await this.toBeVisible(vendorShipping.visitStore);

        // add shipping policies is visible
        await this.toBeVisible(vendorShipping.shippingPolicies.clickHereToAddShippingPolicies);

        // previous shipping settings link is visible
        await this.toBeVisible(vendorShipping.shippingPolicies.clickHereToAddShippingPolicies);

        // shipping zone table elements are visible
        await this.multipleElementVisible(vendorShipping.table);

        await this.clickAndWaitForLoadState(vendorShipping.shippingPolicies.clickHereToAddShippingPolicies);

        // shipping policy elements are visible
        const { clickHereToAddShippingPolicies, ...companyVerifications } = vendorShipping.shippingPolicies;
        await this.multipleElementVisible(companyVerifications);

        await this.clickAndWaitForLoadState(vendorShipping.shippingPolicies.backToZoneList);

        await this.clickAndWaitForLoadState(vendorShipping.previousShippingSettings.previousShippingSettings);

        // previous shipping settings elements are visible
        const { previousShippingSettings, ...previousShipping } = vendorShipping.previousShippingSettings;
        await this.multipleElementVisible(previousShipping);

        // await this.goBack();
    }

    // set shipping policies
    async setShippingPolicies(shippingPolicy: vendor['shipping']['shippingPolicy']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
        await this.click(vendorShipping.shippingPolicies.clickHereToAddShippingPolicies);
        await this.selectByValue(vendorShipping.shippingPolicies.processingTime, shippingPolicy.processingTime);
        await this.clearAndType(vendorShipping.shippingPolicies.shippingPolicy, shippingPolicy.shippingPolicy);
        await this.clearAndType(vendorShipping.shippingPolicies.refundPolicy, shippingPolicy.refundPolicy);
        await this.clickAndWaitForResponse(data.subUrls.ajax, vendorShipping.shippingPolicies.saveSettings);
        await this.toContainText(vendorShipping.updateSettingsSuccessMessage, shippingPolicy.saveSuccessMessage);
    }

    // vendor set all shipping settings
    async setAllShippingSettings(): Promise<void> {
        await this.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate);
        await this.addShippingMethod(data.vendor.shipping.shippingMethods.freeShipping);
        await this.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup);
        await this.addShippingMethod(data.vendor.shipping.shippingMethods.tableRateShipping);
        await this.addShippingMethod(data.vendor.shipping.shippingMethods.distanceRateShipping);
    }

    // vendor add shipping method
    async addShippingMethod(shipping: any, forceAdd = false, skip?: boolean): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
        // edit shipping zone
        await this.hover(vendorShipping.shippingZoneCell(shipping.shippingZone));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorShipping.editShippingZone(shipping.shippingZone));

        // add shipping method if not available
        let methodExists = await this.isVisible(vendorShipping.shippingMethodCell(shipping.shippingMethod));
        if (!methodExists || forceAdd) {
            await this.click(vendorShipping.addShippingMethod);
            await this.selectByValue(vendorShipping.shippingMethod, shipping.selectShippingMethod);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorShipping.shippingMethodPopupAddShippingMethod);
            await expect(this.page.getByText(shipping.shippingMethodSaveSuccessMessage)).toBeVisible();
            await expect(this.page.getByText(shipping.zoneSaveSuccessMessage)).toBeVisible();
            methodExists = true;
        }

        // option to skip if shipping method is already available
        if (methodExists && skip) {
            return;
        }

        // edit shipping method
        await this.hover(vendorShipping.shippingMethodCell(shipping.shippingMethod));
        await this.click(vendorShipping.editShippingMethod(shipping.shippingMethod));

        switch (shipping.selectShippingMethod) {
            // flat rate
            case 'flat_rate':
                await this.clearAndType(vendorShipping.flatRateMethodTitle, shipping.shippingMethodTitle);
                await this.clearAndType(vendorShipping.flatRateCost, shipping.shippingCost);
                await this.selectByValue(vendorShipping.flatRateTaxStatus, shipping.taxStatus);
                await this.clearAndType(vendorShipping.flatRateDescription, shipping.description);
                await this.selectByValue(vendorShipping.flatRateCalculationType, shipping.calculationType);
                break;

            // free shipping
            case 'free_shipping':
                await this.clearAndType(vendorShipping.freeShippingTitle, shipping.shippingMethodTitle);
                await this.selectByValue(vendorShipping.freeShippingOptions, shipping.freeShippingOption);
                await this.clearAndType(vendorShipping.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount);
                break;

            // local pickup
            case 'local_pickup':
                await this.clearAndType(vendorShipping.localPickupTitle, shipping.shippingMethodTitle);
                await this.clearAndType(vendorShipping.localPickupCost, shipping.shippingCost);
                await this.selectByValue(vendorShipping.localPickupTaxStatus, shipping.taxStatus);
                await this.clearAndType(vendorShipping.flatRateDescription, shipping.description);
                break;

            // dokan table rate shipping
            case 'dokan_table_rate_shipping':
                await this.clearAndType(vendorShipping.tableRateShippingMethodTitle, shipping.shippingMethodTitle);
                await this.selectByValue(vendorShipping.tableRateShippingTaxStatus, shipping.taxStatus);
                await this.selectByValue(vendorShipping.tableRateShippingTaxIncludedInShippingCosts, shipping.taxIncludedInShippingCosts);
                await this.clearAndType(vendorShipping.tableRateShippingHandlingFee, shipping.handlingFee);
                await this.clearAndType(vendorShipping.tableRateShippingMaximumShippingCost, shipping.maximumShippingCost);
                // rates
                // await this.selectByValue(vendorShipping.tableRateShippingCalculationType,  shipping.calculationType)
                await this.clearAndType(vendorShipping.tableRateShippingHandlingFeePerOrder, shipping.handlingFeePerOrder);
                await this.clearAndType(vendorShipping.tableRateShippingMinimumCostPerOrder, shipping.minimumCostPerOrder);
                await this.clearAndType(vendorShipping.tableRateShippingMaximumCostPerOrder, shipping.maximumCostPerOrder);
                await this.click(vendorShipping.tableRateShippingUpdateSettings);
                await this.toContainText(vendorShipping.tableRateShippingUpdateSettingsSuccessMessage, shipping.tableRateSaveSuccessMessage);
                return;

            // dokan distance rate shipping
            case 'dokan_distance_rate_shipping':
                await this.clearAndType(vendorShipping.distanceRateShippingMethodTitle, shipping.shippingMethodTitle);
                await this.selectByValue(vendorShipping.distanceRateShippingTaxStatus, shipping.taxStatus);
                await this.selectByValue(vendorShipping.distanceRateShippingTransportationMode, shipping.transportationMode);
                await this.selectByValue(vendorShipping.distanceRateShippingAvoid, shipping.avoid);
                await this.selectByValue(vendorShipping.distanceRateShippingDistanceUnit, shipping.distanceUnit);
                await this.check(vendorShipping.distanceRateShippingShowDistance);
                await this.check(vendorShipping.distanceRateShippingShowDuration);
                // shipping address
                await this.clearAndType(vendorShipping.distanceRateShippingAddress1, shipping.street1);
                await this.clearAndType(vendorShipping.distanceRateShippingAddress2, shipping.street2);
                await this.clearAndType(vendorShipping.distanceRateShippingCity, shipping.city);
                await this.clearAndType(vendorShipping.distanceRateShippingZipOrPostalCode, shipping.zipCode);
                await this.clearAndType(vendorShipping.distanceRateShippingStateOrProvince, shipping.state);
                await this.selectByValue(vendorShipping.distanceRateShippingCountry, shipping.country);
                await this.click(vendorShipping.distanceRateShippingUpdateSettings);
                await this.toContainText(vendorShipping.distanceRateShippingUpdateSettingsSuccessMessage, shipping.distanceRateSaveSuccessMessage);
                return;

            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorShipping.shippingSettingsSaveSettings);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorShipping.saveChanges);
        await this.toContainText(vendorShipping.updateSettingsSuccessMessage, shipping.saveSuccessMessage);
    }

    // vendor add shipping method
    async deleteShippingMethod(shipping: shipping['shippingMethods']['flatRate']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);

        // edit shipping zone
        await this.hover(vendorShipping.shippingZoneCell(shipping.shippingZone));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, vendorShipping.editShippingZone(shipping.shippingZone));

        const noOfMethods = await this.countLocator(vendorShipping.shippingMethodCell(shipping.shippingMethod));

        if (noOfMethods > 1) {
            this.lastLocator(vendorShipping.shippingMethodCell(shipping.shippingMethod)).hover();
            const deleteMethod = this.lastLocator(vendorShipping.deleteShippingMethod(shipping.shippingMethod));
            await this.clickLocatorAndWaitForResponse(data.subUrls.ajax, deleteMethod);
            await this.toHaveCount(vendorShipping.shippingMethodCell(shipping.shippingMethod), noOfMethods - 1);
        } else {
            await this.hover(vendorShipping.shippingMethodCell(shipping.shippingMethod));
            await this.clickAndWaitForResponse(data.subUrls.ajax, vendorShipping.deleteShippingMethod(shipping.shippingMethod));
            await this.notToBeVisible(vendorShipping.shippingZoneCell(shipping.shippingZone));
        }
    }
}
