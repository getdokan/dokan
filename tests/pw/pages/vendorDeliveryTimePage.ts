import { Page, expect } from '@playwright/test';
// import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor, deliveryTime } from '@utils/interfaces';

// selectors
const deliveryTimeCustomer = selector.customer.cDeliveryTime;
const deliveryTimeVendor = selector.vendor.vDeliveryTime;
const deliveryTimeSettingsVendor = selector.vendor.vDeliveryTimeSettings;

export class VendorDeliveryTimePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // delivery time

    // vendor delivery time render properly
    async vendorDeliveryTimeRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);

        // delivery time and store pickup text is visible
        await this.toBeVisible(deliveryTimeVendor.deliveryTimeAndStorePickup);

        // delivery time calendar is visible
        await this.toBeVisible(deliveryTimeVendor.deliveryTimeCalender);

        // delivery time filter elements are visible
        await this.multipleElementVisible(deliveryTimeVendor.filter);

        // delivery time navigation elements are visible
        await this.multipleElementVisible(deliveryTimeVendor.navigation);
    }

    // vendor delivery time settings render properly
    async vendorDeliveryTimeSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTime);

        // settings text is visible
        await this.toBeVisible(deliveryTimeSettingsVendor.settingsText);

        // visit store link is visible
        await this.toBeVisible(deliveryTimeSettingsVendor.visitStore);

        // delivery support elements are visible
        await this.toBeVisible(deliveryTimeSettingsVendor.homeDelivery);
        await this.toBeVisible(deliveryTimeSettingsVendor.storePickup);
        await this.toBeVisible(deliveryTimeSettingsVendor.deliveryBlockedBuffer);
        await this.toBeVisible(deliveryTimeSettingsVendor.timeSlot);
        await this.toBeVisible(deliveryTimeSettingsVendor.orderPerSlot);
        await this.notToHaveCount(deliveryTimeSettingsVendor.deliveryDaySwitches, 0);

        // update settings is visible
        await this.toBeVisible(deliveryTimeSettingsVendor.updateSettings);
    }

    // vendor set delivery settings
    async setDeliveryTimeSettings(deliveryTime: vendor['deliveryTime']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTime);
        // delivery support
        await this.check(deliveryTimeSettingsVendor.homeDelivery);
        await this.check(deliveryTimeSettingsVendor.storePickup);
        await this.clearAndType(deliveryTimeSettingsVendor.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer);
        await this.clearAndType(deliveryTimeSettingsVendor.timeSlot, deliveryTime.timeSlot);
        await this.clearAndType(deliveryTimeSettingsVendor.orderPerSlot, deliveryTime.orderPerSlot);
        for (const day of deliveryTime.days) {
            await this.enableSwitcherDeliveryTime(deliveryTimeSettingsVendor.deliveryDaySwitch(day));
            if (deliveryTime.choice === 'full-day') {
                await this.click(deliveryTimeSettingsVendor.openingTime(day));
                await this.page.getByRole('listitem').filter({ hasText: 'Full day' }).click();
            } else {
                await this.setAttributeValue(deliveryTimeSettingsVendor.openingTime(day), 'value', deliveryTime.openingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.openingTimeHiddenInput(day), 'value', deliveryTime.openingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.closingTime(day), 'value', deliveryTime.closingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.closingTimeHiddenInput(day), 'value', deliveryTime.closingTime);
            }
        }
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsDeliveryTime, deliveryTimeSettingsVendor.updateSettings, 302);
        await this.toContainText(deliveryTimeSettingsVendor.settingsSuccessMessage, deliveryTime.saveSuccessMessage);
    }

    // filter delivery time
    async filterDeliveryTime(value: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);
        await this.selectByValue(deliveryTimeVendor.filter.deliveryTimeFilter, value);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.deliveryTime, deliveryTimeVendor.filter.filter);
        // todo: add more assertion
        // todo: need order via delivery time; via api for assertion
    }

    // update calender views
    async updateCalendarView(value: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);

        await this.click(deliveryTimeVendor.navigation[value as keyof typeof deliveryTimeVendor.navigation]);
        const currentView = await this.getAttributeValue(deliveryTimeVendor.navigation[value as keyof typeof deliveryTimeVendor.navigation], 'aria-pressed');
        expect(currentView).toContain('true');
    }

    // customer

    // place order with delivery time and store pickup
    async placeOrderWithDeliverTimeStorePickup(deliveryType: string, deliveryTime: deliveryTime, paymentMethod = 'bank') {
        await this.goToCheckout();

        switch (deliveryType) {
            case 'delivery-time':
                await this.click(deliveryTimeCustomer.delivery);
                await this.click(deliveryTimeCustomer.deliveryTimeInput);
                await this.clickAndWaitForResponse(data.subUrls.ajax, deliveryTimeCustomer.deliveryDate(deliveryTime.date));
                await this.selectByNumber(deliveryTimeCustomer.timePicker, 1);
                break;

            case 'store-pickup':
                await this.click(deliveryTimeCustomer.storePickup);
                await this.click(deliveryTimeCustomer.deliveryTimeInput);
                await this.clickAndWaitForResponse(data.subUrls.ajax, deliveryTimeCustomer.deliveryDate(deliveryTime.date));
                await this.selectByNumber(deliveryTimeCustomer.timePicker, 1);
                await this.selectByNumber(deliveryTimeCustomer.locationPicker, 1);
                break;

            default:
                break;
        }

        await this.paymentOrder(paymentMethod);

        if (deliveryType == 'delivery-time') {
            await this.toBeVisible(deliveryTimeCustomer.orderDetails.deliveryTimeDetails);
            await this.toContainText(deliveryTimeCustomer.orderDetails.deliveryTimeTitle, 'Delivery Date');
        } else {
            await this.toBeVisible(deliveryTimeCustomer.orderDetails.storePickupDetails);
            await this.toContainText(deliveryTimeCustomer.orderDetails.storePickupTitle, 'Store location pickup');
        }
    }
}
