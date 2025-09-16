import { Page, expect } from '@playwright/test';

const { BASE_URL } = process.env;

export class VendorBookingPage {
    constructor(private page: Page) {}

    // Navigation methods
    async navigateToDashboard() {
        await this.page.goto(`${BASE_URL}/dashboard/`);
    }

    async navigateToBookingProducts() {
        await this.page.getByRole('link', { name: ' Booking' }).click();
    }

    async navigateToAddNewBookingProduct() {
        await this.page.getByRole('link', { name: '  Add New Booking Product' }).click();
    }

    // Product creation methods
    async fillBasicProductInformation(title: string, isVirtual: boolean = true) {
        await this.page.getByRole('textbox', { name: 'Title' }).fill(title);
        if (isVirtual) {
            await this.page.getByRole('checkbox', { name: 'Virtual' }).check();
        }
    }

    async setBookingDuration(duration: string) {
        await this.page.locator('[id="_wc_booking_duration"]').fill(duration);
    }

    async enableBookingOptions() {
        await this.page.getByRole('checkbox', { name: 'Enable Calendar Range Picker' }).check();
        await this.page.getByRole('checkbox', { name: 'Requires Confirmation ' }).check();
        await this.page.getByRole('checkbox', { name: 'Can Be Cancelled ? ' }).check();
    }

    async setCancellationSettings(days: string, unit: string = 'day') {
        await this.page.getByRole('spinbutton', { name: 'Booking can be cancelled' }).fill(days);
        await this.page.locator('[id="_wc_booking_cancel_limit_unit"]').selectOption(unit);
    }

    async configureAvailabilitySettings(maxBookings: string, minWindow: string, maxWindow: string) {
        await this.page.getByRole('spinbutton', { name: 'Max bookings per block' }).fill(maxBookings);
        await this.page.getByRole('spinbutton', { name: 'Minimum booking window ( into' }).fill(minWindow);
        await this.page.getByRole('spinbutton', { name: 'Maximum booking window ( into' }).fill(maxWindow);
    }

    async setPricing(baseCost: string, blockCost: string) {
        await this.page.getByRole('spinbutton', { name: 'Base cost' }).fill(baseCost);
        await this.page.getByRole('spinbutton', { name: 'Block cost' }).fill(blockCost);
    }

    async enablePersonsAndResources() {
        await this.page.getByRole('checkbox', { name: 'Has persons' }).check();
        await this.page.getByRole('checkbox', { name: 'Has resources' }).check();
    }

    async setPersonLimits(minPersons: string, maxPersons: string) {
        await this.page.getByRole('spinbutton', { name: 'Min persons ' }).fill(minPersons);
        await this.page.getByRole('spinbutton', { name: 'Max persons ' }).fill(maxPersons);
    }

    async enablePersonCalculationOptions() {
        await this.page.getByRole('checkbox', { name: 'Multiply all costs by person' }).check();
        await this.page.getByRole('checkbox', { name: 'Count persons as bookings' }).check();
        await this.page.getByRole('checkbox', { name: 'Enable person types' }).check();
    }

    async addPersonType(name: string, baseCost: string, blockCost: string, minPersons: string, maxPersons: string, isFirst: boolean = false) {
        await this.page.getByRole('button', { name: 'Add Person Type' }).click();
        
        if (isFirst) {
            await this.page.getByRole('textbox', { name: 'Name' }).fill(name);
            await this.page.getByRole('cell', { name: 'Base Cost:' }).getByPlaceholder('0.00').fill(baseCost);
            await this.page.getByRole('cell', { name: 'Block Cost:' }).getByPlaceholder('0.00').fill(blockCost);
            await this.page.locator('input[name="person_min\\[0\\]"]').fill(minPersons);
            await this.page.locator('input[name="person_max\\[0\\]"]').fill(maxPersons);
        } else {
            await this.page.getByRole('cell', { name: 'Person Type Name: Person Type #' }).getByPlaceholder('Name').fill(name);
            await this.page.locator('input[name="person_cost\\[1\\]"]').fill(baseCost);
            await this.page.locator('input[name="person_block_cost\\[1\\]"]').fill(blockCost);
            await this.page.locator('input[name="person_min\\[1\\]"]').fill(minPersons);
            await this.page.locator('input[name="person_max\\[1\\]"]').fill(maxPersons);
        }
    }

    async saveProduct() {
        await this.page.getByRole('button', { name: 'Save Product' }).click();
    }

    async verifyProductCreationSuccess() {
        await expect(this.page.getByText('Success! The product has')).toBeVisible();
    }

    // Product management methods
    async searchProduct(productName: string) {
        await this.page.getByRole('textbox', { name: 'Search Products' }).click();
        await this.page.getByRole('textbox', { name: 'Search Products' }).fill(productName);
        await this.page.locator('button[name="product_listing_search"]').click();
    }

    async deleteProduct(productName: string) {
        await this.page.getByText(productName).hover();
        await this.page.getByRole('link', { name: 'Delete Permanently' }).click();
        await this.page.getByRole('button', { name: 'OK' }).click();
    }

    async verifyProductDeleted() {
        await expect(this.page.locator("//td[normalize-space()='No product found']")).toBeVisible();
    }

    // Complete workflow methods
    async createVirtualBookingProduct(productData: {
        title: string;
        duration: string;
        cancellationDays: string;
        maxBookings: string;
        minWindow: string;
        maxWindow: string;
        baseCost: string;
        blockCost: string;
        minPersons: string;
        maxPersons: string;
        adultPersonType: {
            name: string;
            baseCost: string;
            blockCost: string;
            min: string;
            max: string;
        };
        childPersonType: {
            name: string;
            baseCost: string;
            blockCost: string;
            min: string;
            max: string;
        };
    }) {
        await this.navigateToDashboard();
        await this.navigateToBookingProducts();
        await this.navigateToAddNewBookingProduct();
        
        await this.fillBasicProductInformation(productData.title, true);
        await this.setBookingDuration(productData.duration);
        await this.enableBookingOptions();
        await this.setCancellationSettings(productData.cancellationDays);
        await this.configureAvailabilitySettings(productData.maxBookings, productData.minWindow, productData.maxWindow);
        await this.setPricing(productData.baseCost, productData.blockCost);
        await this.enablePersonsAndResources();
        await this.setPersonLimits(productData.minPersons, productData.maxPersons);
        await this.enablePersonCalculationOptions();
        
        await this.addPersonType(
            productData.adultPersonType.name,
            productData.adultPersonType.baseCost,
            productData.adultPersonType.blockCost,
            productData.adultPersonType.min,
            productData.adultPersonType.max,
            true
        );
        
        await this.addPersonType(
            productData.childPersonType.name,
            productData.childPersonType.baseCost,
            productData.childPersonType.blockCost,
            productData.childPersonType.min,
            productData.childPersonType.max,
            false
        );
        
        await this.saveProduct();
        await this.verifyProductCreationSuccess();
    }

    async deleteBookingProduct(productName: string) {
        await this.navigateToDashboard();
        await this.navigateToBookingProducts();
        await this.searchProduct(productName);
        await this.deleteProduct(productName);
        await this.searchProduct(productName);
        await this.verifyProductDeleted();
    }
}
