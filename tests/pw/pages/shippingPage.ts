import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
// import { shipping } from '@utils/interfaces';

// selectors
const woocommerceSettings = selector.admin.wooCommerce.settings;

export class ShippingPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Shipping Methods

    // Admin Setup Woocommerce Settings
    async setWoocommerceShippingSettings(data: any) {
        await this.enablePasswordInputField(data);
        await this.addShippingMethod(data.shipping.shippingMethods.flatRate);
        await this.addShippingMethod(data.shipping.shippingMethods.freeShipping);
        await this.addShippingMethod(data.shipping.shippingMethods.tableRateShipping);
        await this.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping);
        await this.addShippingMethod(data.shipping.shippingMethods.vendorShipping);
        await this.deleteShippingMethod(data.shipping.shippingMethods.flatRate);
        await this.deleteShippingZone(data.shipping.shippingZone);
    }

    // Enable-Disable Shipping
    async enableShipping(enable = true) {
        await this.goToWooCommerceSettings();
        await this.click(woocommerceSettings.enableShipping);
        enable
            ? await this.setDropdownOptionSpan(woocommerceSettings.enableShippingValues, data.shipping.enableShipping)
            : await this.setDropdownOptionSpan(woocommerceSettings.enableShippingValues, data.shipping.disableShipping);
        await this.click(woocommerceSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, data.shipping.saveSuccessMessage);
    }

    // Admin Add Shipping Method
    async addShippingMethod(shipping: any) {
        await this.goToWooCommerceSettings();

        await this.click(woocommerceSettings.shipping);

        const zoneIsVisible = await this.isVisible(woocommerceSettings.shippingZoneCell(shipping.shippingZone));
        if (!zoneIsVisible) {
            // Add Shipping Zone
            await this.click(woocommerceSettings.addShippingZone);
            await this.clearAndType(woocommerceSettings.zoneName, shipping.shippingZone);
            // await this.selectByValue(woocommerceSettings.zoneRegions, shippingCountry) //use select values  'country:US',
            await this.click(woocommerceSettings.zoneRegions);
            await this.type(woocommerceSettings.zoneRegions, shipping.shippingCountry);
            await this.press(data.key.enter);
        } else {
            // Edit Shipping Zone
            await this.hover(woocommerceSettings.shippingZoneCell(shipping.shippingZone));
            await this.click(woocommerceSettings.editShippingMethod(shipping.shippingZone));
        }

        const methodIsVisible = await this.isVisible(woocommerceSettings.shippingMethodCell(helpers.replaceAndCapitalize(shipping.shippingMethod)));
        if (!methodIsVisible) {
            // Add Shipping Method
            await this.click(woocommerceSettings.addShippingMethods);
            await this.selectByValue(woocommerceSettings.shippingMethod, shipping.selectShippingMethod);
            await this.click(woocommerceSettings.addShippingMethod);
        }

        // Edit Shipping Method Options
        await this.hover(woocommerceSettings.shippingMethodCell(shipping.shippingMethod));
        await this.click(woocommerceSettings.editShippingMethod(shipping.shippingMethod));

        switch (shipping.selectShippingMethod) {
            // Flat Rate
            case 'flat_rate':
                await this.clearAndType(woocommerceSettings.flatRateMethodTitle, shipping.shippingMethod);
                await this.selectByValue(woocommerceSettings.flatRateTaxStatus, shipping.taxStatus);
                await this.clearAndType(woocommerceSettings.flatRateCost, shipping.shippingCost);
                break;

            // Free Shipping
            case 'free_shipping':
                await this.clearAndType(woocommerceSettings.freeShippingTitle, shipping.shippingMethod);
                // await this.selectByValue(woocommerceSettings.freeShippingRequires, shipping.freeShippingRequires)
                // await this.clearAndType(woocommerceSettings.freeShippingMinimumOrderAmount,shipping.freeShippingMinimumOrderAmount)
                // await this.check(woocommerceSettings.freeShippingCouponsDiscounts)
                break;

            // Local Pickup
            case 'local_pickup':
                await this.clearAndType(woocommerceSettings.localPickupTitle, shipping.shippingMethod);
                await this.selectByValue(woocommerceSettings.localPickupTaxStatus, shipping.taxStatus);
                await this.clearAndType(woocommerceSettings.localPickupCost, shipping.shippingCost);
                break;

            // Dokan Table Rate Shipping
            case 'dokan_table_rate_shipping':
                await this.clearAndType(woocommerceSettings.dokanTableRateShippingMethodTitle, shipping.shippingMethod);
                break;

            // Dokan Distance Rate Shipping
            case 'dokan_distance_rate_shipping':
                await this.clearAndType(woocommerceSettings.dokanDistanceRateShippingMethodTitle, shipping.shippingMethod);
                break;

            // Vendor Shipping
            case 'dokan_vendor_shipping':
                await this.clearAndType(woocommerceSettings.vendorShippingMethodTitle, shipping.shippingMethod);
                await this.selectByValue(woocommerceSettings.vendorShippingTaxStatus, shipping.taxStatus);
                break;

            default:
                break;
        }

        await this.click(woocommerceSettings.shippingMethodSaveChanges);
        await this.toBeVisible(woocommerceSettings.shippingMethodCell(shipping.shippingMethod));
    }

    // Admin Delete Shipping Zone
    async deleteShippingZone(shippingZone: string) {
        await this.click(woocommerceSettings.shipping);

        await this.hover(woocommerceSettings.shippingZoneCell(shippingZone));
        await this.clickAndAccept(woocommerceSettings.deleteShippingZone(shippingZone));

        await this.notToBeVisible(woocommerceSettings.shippingZoneCell(shippingZone));
    }

    // Admin Delete Shipping Method
    async deleteShippingMethod(shipping: any) {
        await this.click(woocommerceSettings.shipping);

        await this.hover(woocommerceSettings.shippingZoneCell(shipping.shippingZone));
        await this.click(woocommerceSettings.editShippingZone(shipping.shippingZone));
        await this.hover(woocommerceSettings.shippingMethodCell(shipping.shippingMethod));
        await this.click(woocommerceSettings.deleteShippingMethod(shipping.shippingMethod));
        await this.click(woocommerceSettings.shippingZoneSaveChanges);

        await this.notToBeVisible(woocommerceSettings.shippingMethodCell(shipping.shippingMethod));
    }
}
