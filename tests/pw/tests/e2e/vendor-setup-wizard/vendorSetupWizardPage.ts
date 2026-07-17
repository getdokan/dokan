import { Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// SELECTORS — verified live against the React wizard (role/name, label bindings
// and data-testids each resolve to exactly one element per step).
export const wizardSelectors = {
    countryField: 'dokan-address-country',
    stateField: 'dokan-address-state',
};

// TEST DATA ------------------------------------------------------
export const wizardData = {
    store: {
        country: 'United States (US)',
        countrySearch: 'United States',
        state: 'New York',
        city: faker.location.city(),
        zip: '10006',
        street1: faker.location.streetAddress(),
        street2: `Suite ${faker.number.int({ min: 1, max: 99 })}`,
    },
    paypalEmail: faker.internet.email().toLowerCase(),
    partialBankHolder: 'Only Holder Name',
};

// PAGE OBJECT ----------------------------------------------------
export class VendorSetupWizardPage {
    constructor(private page: Page) {}

    async gotoWizard(): Promise<void> {
        await this.page.goto(toPath('?page=dokan-seller-setup'), { waitUntil: 'domcontentloaded' });
        await closeAnnouncementModal(this.page);
    }

    async expectWelcome(): Promise<void> {
        await expect(this.page.getByRole('heading', { name: 'Welcome to the Marketplace!' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Start Journey' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Skip', exact: true })).toBeVisible();
    }

    async startJourney(): Promise<void> {
        await this.page.getByRole('link', { name: 'Start Journey' }).click();
        await expect(this.page).toHaveURL(/step=store/);
        await expect(this.page.getByRole('heading', { name: 'Store', exact: true })).toBeVisible();
    }

    private async pickOption(fieldTestId: string, search: string, option: string): Promise<void> {
        const trigger = this.page.getByTestId(fieldTestId).getByRole('combobox');
        // The popup re-renders while filtering, which can swallow the option click —
        // retry the whole pick until the trigger reflects the chosen value.
        await expect(async () => {
            await trigger.click();
            // One popup at a time — the search box placeholder differs per field.
            await this.page.getByPlaceholder(/Search (country|state)/).fill(search);
            await this.page.getByRole('option', { name: option, exact: true }).click();
            await expect(trigger).toContainText(option, { timeout: 2000 });
        }).toPass();
    }

    async fillStoreStep(store: typeof wizardData.store): Promise<void> {
        await this.pickOption(wizardSelectors.countryField, store.countrySearch, store.country);
        await this.pickOption(wizardSelectors.stateField, store.state, store.state);
        await this.page.getByLabel('City').fill(store.city);
        await this.page.getByLabel('Post/ZIP Code').fill(store.zip);
        await this.page.getByLabel('Street', { exact: true }).fill(store.street1);
        await this.page.getByLabel('Street 2').fill(store.street2);
    }

    async submitStoreStep(): Promise<void> {
        await this.page.getByRole('button', { name: 'Next' }).click();
        await expect(this.page).toHaveURL(/step=payment/);
        await expect(this.page.getByRole('heading', { name: 'Payment', exact: true })).toBeVisible();
    }

    async expectStorePrefilled(store: typeof wizardData.store): Promise<void> {
        await expect(this.page.getByTestId(wizardSelectors.countryField).getByRole('combobox')).toContainText(store.country);
        await expect(this.page.getByTestId(wizardSelectors.stateField).getByRole('combobox')).toContainText(store.state);
        await expect(this.page.getByLabel('City')).toHaveValue(store.city);
        await expect(this.page.getByLabel('Post/ZIP Code')).toHaveValue(store.zip);
        await expect(this.page.getByLabel('Street', { exact: true })).toHaveValue(store.street1);
        await expect(this.page.getByLabel('Street 2')).toHaveValue(store.street2);
    }

    async fillPaypal(email: string): Promise<void> {
        await this.page.getByRole('button', { name: 'PayPal', exact: true }).click();
        await this.page.getByLabel('PayPal Email').fill(email);
    }

    async submitPaymentStep(): Promise<void> {
        await this.page.getByRole('button', { name: 'Next' }).click();
        await expect(this.page).toHaveURL(/step=next_steps/);
    }

    async expectReadyAndExplore(): Promise<void> {
        await expect(this.page.getByRole('heading', { name: /Congratulations/ })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'View Site' })).toBeVisible();
        await this.page.getByRole('link', { name: 'Explore Dashboard' }).click();
        await expect(this.page).toHaveURL(/\/dashboard\//);
    }

    async skipFromWelcome(): Promise<void> {
        await this.page.getByRole('link', { name: 'Skip', exact: true }).click();
        await expect(this.page).toHaveURL(/\/dashboard\//);
    }

    async submitPartialBank(holderName: string): Promise<void> {
        await this.page.getByRole('button', { name: 'Bank Transfer' }).click();
        await this.page.getByLabel('Account Holder Name').fill(holderName);
        await this.page.getByRole('button', { name: 'Next' }).click();
        // The onboarding endpoint rejects a partial bank slice; the engine surfaces it inline.
        await expect(this.page.getByRole('alert')).toBeVisible();
        await expect(this.page).toHaveURL(/step=payment/);
    }

    async expectWizardHiddenFromGuest(): Promise<void> {
        // Logged-out requests fall through to the normal site — the wizard never renders.
        await expect(this.page.locator('body.dokan-vendor-setup-wizard')).toHaveCount(0);
        await expect(this.page.getByRole('heading', { name: 'Welcome to the Marketplace!' })).toBeHidden();
    }
}
