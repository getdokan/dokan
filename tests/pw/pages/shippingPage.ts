import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { shipping, shippingZone } from '@utils/interfaces';

// selectors
const woocommerceSettings = selector.admin.wooCommerce.settings;
const generalSettings = selector.admin.wooCommerce.settings.general;
const shippingSettings = selector.admin.wooCommerce.settings.shipping;

export class ShippingPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    async goToShippingSettings() {
        await this.goIfNotThere(data.subUrls.backend.wc.shippingSettings);
    }

    // admin enable disable shipping
    async enableShipping(enable = true) {
        await this.goToWooCommerceSettings();
        await this.click(generalSettings.enableShipping);
        if (enable) {
            await this.setDropdownOptionSpan(generalSettings.enableShippingValues, data.shipping.enableShipping);
        } else {
            await this.setDropdownOptionSpan(generalSettings.enableShippingValues, data.shipping.disableShipping);
        }
        await this.removeAttribute(generalSettings.generalSaveChanges, 'disabled');
        await this.click(generalSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, data.shipping.saveSuccessMessage);
    }

    // admin add shipping zone
    async addShippingZone(shippingZone: shippingZone) {
        await this.goToShippingSettings();

        // add shipping zone
        await this.clickAndWaitForLoadState(shippingSettings.addShippingZone);
        // zone
        await this.clearAndType(shippingSettings.zoneName, shippingZone.zoneName);
        // zone regions
        await this.click(shippingSettings.zoneRegionsInput);
        await this.clearAndType(shippingSettings.zoneRegionsInput, shippingZone.zoneRegion);
        await this.click(shippingSettings.zoneRegionsSearchedResult(shippingZone.zoneRegion));
        await this.press(data.key.escape);

        await this.clickAndWaitForResponse(data.subUrls.ajax, shippingSettings.saveShippingZone);
    }

    // admin add shipping method
    async addShippingMethod(zoneId: string, shipping: shipping, edit: boolean = false) {
        await this.goIfNotThere(data.subUrls.backend.wc.shippingZone(zoneId));

        if (!edit) {
            // add shipping method
            await this.click(shippingSettings.addShippingMethods);
            await this.toBeVisible(shippingSettings.shippingMethodModal);
            await this.click(shippingSettings.shippingMethod(shipping.selectMethodName));
            await this.clickAndWaitForResponse(data.subUrls.ajax, shippingSettings.continue);
        } else {
            // edit shipping method
            await this.click(shippingSettings.editShippingMethod(shipping.methodName));
        }

        switch (shipping.selectMethodName) {
            // flat rate
            case 'flat_rate':
                await this.clearAndType(shippingSettings.flatRateMethodTitle, shipping.methodName);
                await this.selectByValue(shippingSettings.flatRateTaxStatus, shipping.taxStatus as string);
                await this.clearAndType(shippingSettings.flatRateCost, shipping.shippingCost as string);
                break;

            // free shipping
            case 'free_shipping':
                await this.clearAndType(shippingSettings.freeShippingTitle, shipping.methodName);
                await this.selectByValue(shippingSettings.freeShippingRequires, shipping.freeShippingRequires as string);
                if (shipping.freeShippingRequires !== 'coupon') {
                    await this.clearAndType(shippingSettings.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount as string);
                    await this.check(shippingSettings.freeShippingCouponsDiscounts);
                }
                break;

            // vendor table rate shipping
            case 'vendor_table_rate_shipping':
                await this.clearAndType(shippingSettings.vendorTableRateShippingMethodTitle, shipping.methodName);
                break;

            // zone distance rate shipping
            case 'vendor_distance_rate_shipping':
                await this.clearAndType(shippingSettings.vendorDistanceRateShippingMethodTitle, shipping.methodName);
                break;

            // zone shipping
            case 'vendor_vendor_shipping':
                await this.clearAndType(shippingSettings.vendorShippingMethodTitle, shipping.methodName);
                await this.selectByValue(shippingSettings.vendorShippingTaxStatus, shipping.taxStatus as string);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.ajax, shippingSettings.createAndSave);
        await this.toBeVisible(shippingSettings.shippingMethodRow(shipping.methodName));
    }

    // admin delete shipping zone
    async deleteShippingZone(zoneName: string) {
        await this.goto(data.subUrls.backend.wc.shippingSettings);

        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, shippingSettings.deleteShippingZone(zoneName));
        await this.notToBeVisible(shippingSettings.shippingZoneRow(zoneName));
    }

    // admin delete shipping method
    async deleteShippingMethod(zoneName: string, methodName: string) {
        await this.goto(data.subUrls.backend.wc.shippingSettings);

        await this.click(shippingSettings.editShippingZone(zoneName));
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, shippingSettings.deleteShippingMethod(methodName));
        await this.notToBeVisible(shippingSettings.shippingMethodRow(methodName));
    }
}
