import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
// import { shipping } from '@utils/interfaces';

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
        await this.click(selector.admin.wooCommerce.settings.enableShipping);
        enable
            ? await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.enableShipping)
            : await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.disableShipping);
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges);
        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, data.shipping.saveSuccessMessage);
    }

    // Admin Add Shipping Method
    async addShippingMethod(shipping: any) {
        await this.goToWooCommerceSettings();

        await this.click(selector.admin.wooCommerce.settings.shipping);

        const zoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone));
        if (!zoneIsVisible) {
            // Add Shipping Zone
            await this.click(selector.admin.wooCommerce.settings.addShippingZone);
            await this.clearAndType(selector.admin.wooCommerce.settings.zoneName, shipping.shippingZone);
            // await this.selectByValue(selector.admin.wooCommerce.settings.zoneRegions, shippingCountry) //use select values  'country:US',
            await this.click(selector.admin.wooCommerce.settings.zoneRegions);
            await this.type(selector.admin.wooCommerce.settings.zoneRegions, shipping.shippingCountry);
            await this.press(data.key.enter);
        } else {
            // Edit Shipping Zone
            await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone));
            await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingZone));
        }

        const methodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(helpers.replaceAndCapitalize(shipping.shippingMethod)));
        if (!methodIsVisible) {
            // Add Shipping Method
            await this.click(selector.admin.wooCommerce.settings.addShippingMethods);
            await this.selectByValue(selector.admin.wooCommerce.settings.shippingMethod, shipping.selectShippingMethod);
            await this.click(selector.admin.wooCommerce.settings.addShippingMethod);
        }

        // Edit Shipping Method Options
        await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod));
        await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingMethod));

        switch (shipping.selectShippingMethod) {
            // Flat Rate
            case 'flat_rate':
                await this.clearAndType(selector.admin.wooCommerce.settings.flatRateMethodTitle, shipping.shippingMethod);
                await this.selectByValue(selector.admin.wooCommerce.settings.flatRateTaxStatus, shipping.taxStatus);
                await this.clearAndType(selector.admin.wooCommerce.settings.flatRateCost, shipping.shippingCost);
                break;

            // Free Shipping
            case 'free_shipping':
                await this.clearAndType(selector.admin.wooCommerce.settings.freeShippingTitle, shipping.shippingMethod);
                // await this.selectByValue(selector.admin.wooCommerce.settings.freeShippingRequires, shipping.freeShippingRequires)
                // await this.clearAndType(selector.admin.wooCommerce.settings.freeShippingMinimumOrderAmount,shipping.freeShippingMinimumOrderAmount)
                // await this.check(selector.admin.wooCommerce.settings.freeShippingCouponsDiscounts)
                break;

            // Local Pickup
            case 'local_pickup':
                await this.clearAndType(selector.admin.wooCommerce.settings.localPickupTitle, shipping.shippingMethod);
                await this.selectByValue(selector.admin.wooCommerce.settings.localPickupTaxStatus, shipping.taxStatus);
                await this.clearAndType(selector.admin.wooCommerce.settings.localPickupCost, shipping.shippingCost);
                break;

            // Dokan Table Rate Shipping
            case 'dokan_table_rate_shipping':
                await this.clearAndType(selector.admin.wooCommerce.settings.dokanTableRateShippingMethodTitle, shipping.shippingMethod);
                break;

            // Dokan Distance Rate Shipping
            case 'dokan_distance_rate_shipping':
                await this.clearAndType(selector.admin.wooCommerce.settings.dokanDistanceRateShippingMethodTitle, shipping.shippingMethod);
                break;

            // Vendor Shipping
            case 'dokan_vendor_shipping':
                await this.clearAndType(selector.admin.wooCommerce.settings.vendorShippingMethodTitle, shipping.shippingMethod);
                await this.selectByValue(selector.admin.wooCommerce.settings.vendorShippingTaxStatus, shipping.taxStatus);
                break;

            default:
                break;
        }

        await this.click(selector.admin.wooCommerce.settings.shippingMethodSaveChanges);
        await this.toBeVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod));
    }

    // Admin Delete Shipping Zone
    async deleteShippingZone(shippingZone: string) {
        await this.click(selector.admin.wooCommerce.settings.shipping);

        await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone));
        await this.clickAndAccept(selector.admin.wooCommerce.settings.deleteShippingZone(shippingZone));

        const shippingZoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone));
        expect(shippingZoneIsVisible).toBe(false);
    }

    // Admin Delete Shipping Method
    async deleteShippingMethod(shipping: any) {
        await this.click(selector.admin.wooCommerce.settings.shipping);

        await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone));
        await this.click(selector.admin.wooCommerce.settings.editShippingZone(shipping.shippingZone));
        await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod));
        await this.click(selector.admin.wooCommerce.settings.deleteShippingMethod(shipping.shippingMethod));
        await this.click(selector.admin.wooCommerce.settings.shippingZoneSaveChanges);

        const shippingMethodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod));
        expect(shippingMethodIsVisible).toBe(false);
    }
}
