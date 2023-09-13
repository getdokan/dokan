import { Page, expect } from '@playwright/test';
// import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor, deliveryTime } from '@utils/interfaces';

export class VendorDeliveryTimePage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // delivery time

    // vendor delivery time render properly
    async vendorDeliveryTimeRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);

        // delivery time and store pickup text is visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTime.deliveryTimeAndStorePickup,
        );

        // delivery time calendar is visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTime.deliveryTimeCalender,
        );

        // delivery time filter elements are visible
        await this.multipleElementVisible(selector.vendor.vDeliveryTime.filter);

        // delivery time navigation elements are visible
        await this.multipleElementVisible(
            selector.vendor.vDeliveryTime.navigation,
        );
    }

    // vendor delivery time settings render properly
    async vendorDeliveryTimeSettingsRenderProperly() {
        await this.goIfNotThere(
            data.subUrls.frontend.vDashboard.settingsDeliveryTime,
        );

        // settings text is visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.settingsText,
        );

        // visit store link is visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.visitStore,
        );

        // delivery support elements are visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.homeDelivery,
        );
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.storePickup,
        );
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer,
        );
        await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.timeSlot);
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.orderPerSlot,
        );
        await this.notToHaveCount(
            selector.vendor.vDeliveryTimeSettings.deliveryDaySwitches,
            0,
        );

        // update settings is visible
        await this.toBeVisible(
            selector.vendor.vDeliveryTimeSettings.updateSettings,
        );
    }

    // vendor set delivery settings
    async setDeliveryTimeSettings(
        deliveryTime: vendor['deliveryTime'],
    ): Promise<void> {
        await this.goIfNotThere(
            data.subUrls.frontend.vDashboard.settingsDeliveryTime,
        );
        // delivery support
        await this.check(selector.vendor.vDeliveryTimeSettings.homeDelivery);
        await this.check(selector.vendor.vDeliveryTimeSettings.storePickup);
        await this.clearAndType(
            selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer,
            deliveryTime.deliveryBlockedBuffer,
        );
        await this.clearAndType(
            selector.vendor.vDeliveryTimeSettings.timeSlot,
            deliveryTime.timeSlot,
        );
        await this.clearAndType(
            selector.vendor.vDeliveryTimeSettings.orderPerSlot,
            deliveryTime.orderPerSlot,
        );
        for (const day of deliveryTime.days) {
            await this.enableSwitcherDeliveryTime(
                selector.vendor.vDeliveryTimeSettings.deliveryDaySwitch(day),
            );
            if (deliveryTime.choice === 'full-day') {
                await this.click(
                    selector.vendor.vDeliveryTimeSettings.openingTime(day),
                );
                await this.page
                    .getByRole('listitem')
                    .filter({ hasText: 'Full day' })
                    .click();
            } else {
                await this.setAttributeValue(
                    selector.vendor.vDeliveryTimeSettings.openingTime(day),
                    'value',
                    deliveryTime.openingTime,
                );
                await this.setAttributeValue(
                    selector.vendor.vDeliveryTimeSettings.openingTimeHiddenInput(
                        day,
                    ),
                    'value',
                    deliveryTime.openingTime,
                );
                await this.setAttributeValue(
                    selector.vendor.vDeliveryTimeSettings.closingTime(day),
                    'value',
                    deliveryTime.closingTime,
                );
                await this.setAttributeValue(
                    selector.vendor.vDeliveryTimeSettings.closingTimeHiddenInput(
                        day,
                    ),
                    'value',
                    deliveryTime.closingTime,
                );
            }
        }
        await this.clickAndWaitForResponseAndLoadState(
            data.subUrls.frontend.vDashboard.settingsDeliveryTime,
            selector.vendor.vDeliveryTimeSettings.updateSettings,
            302,
        );
        await this.toContainText(
            selector.vendor.vDeliveryTimeSettings.settingsSuccessMessage,
            deliveryTime.saveSuccessMessage,
        );
    }

    // filter delivery time
    async filterDeliveryTime(value: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);
        await this.selectByValue(
            selector.vendor.vDeliveryTime.filter.deliveryTimeFilter,
            value,
        );
        await this.clickAndWaitForResponseAndLoadState(
            data.subUrls.frontend.vDashboard.deliveryTime,
            selector.vendor.vDeliveryTime.filter.filter,
        );
        // todo: add more assertion
        // todo: need order via delivery time; via api for assertion
    }

    // update calender views
    async updateCalendarView(value: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);

        await this.click(
            selector.vendor.vDeliveryTime.navigation[
                value as keyof typeof selector.vendor.vDeliveryTime.navigation
            ],
        );
        const currentView = await this.getAttributeValue(
            selector.vendor.vDeliveryTime.navigation[
                value as keyof typeof selector.vendor.vDeliveryTime.navigation
            ],
            'aria-pressed',
        );
        expect(currentView).toContain('true');
    }

    // customer

    // place order with delivery time and store pickup
    async placeOrderWithDeliverTimeStorePickup(
        deliveryType: string,
        deliveryTime: deliveryTime,
        paymentMethod = 'bank',
    ) {
        await this.goToCheckout();

        switch (deliveryType) {
            case 'delivery-time':
                await this.click(selector.customer.cDeliveryTime.delivery);
                await this.click(
                    selector.customer.cDeliveryTime.deliveryTimeInput,
                );
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cDeliveryTime.deliveryDate(
                        deliveryTime.date,
                    ),
                );
                await this.selectByNumber(
                    selector.customer.cDeliveryTime.timePicker,
                    1,
                );
                break;

            case 'store-pickup':
                await this.click(selector.customer.cDeliveryTime.storePickup);
                await this.click(
                    selector.customer.cDeliveryTime.deliveryTimeInput,
                );
                await this.clickAndWaitForResponse(
                    data.subUrls.ajax,
                    selector.customer.cDeliveryTime.deliveryDate(
                        deliveryTime.date,
                    ),
                );
                await this.selectByNumber(
                    selector.customer.cDeliveryTime.timePicker,
                    1,
                );
                await this.selectByNumber(
                    selector.customer.cDeliveryTime.locationPicker,
                    1,
                );
                break;

            default:
                break;
        }

        await this.paymentOrder(paymentMethod);

        if (deliveryType == 'delivery-time') {
            await this.toBeVisible(
                selector.customer.cDeliveryTime.orderDetails
                    .deliveryTimeDetails,
            );
            await this.toContainText(
                selector.customer.cDeliveryTime.orderDetails.deliveryTimeTitle,
                'Delivery Date',
            );
        } else {
            await this.toBeVisible(
                selector.customer.cDeliveryTime.orderDetails.storePickupDetails,
            );
            await this.toContainText(
                selector.customer.cDeliveryTime.orderDetails.storePickupTitle,
                'Store location pickup',
            );
        }
    }
}
