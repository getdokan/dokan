//COVERAGE_TAG: PUT /dokan/v1/vendor-onboarding/store
//COVERAGE_TAG: PUT /dokan/v1/vendor-onboarding/payment

import { test, expect, request, Page } from '@utils/test';
import { LoginPage } from '@pages/loginPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { VendorSetupWizardPage, wizardData } from './vendorSetupWizardPage';

const { USER_PASSWORD } = process.env;

test.describe('Vendor setup wizard (React) functionality', () => {
    let apiUtils: ApiUtils;
    let wizard: VendorSetupWizardPage;
    let vPage: Page;
    let sellerId: string;
    let originalSetupWizard: string;

    test.beforeAll(async ({ browser }) => {
        apiUtils = new ApiUtils(await request.newContext());

        // The React wizard is gated behind the appearance switch; a partially-seeded
        // env would otherwise render the legacy wizard and fail every assertion here.
        const [originalAppearance] = await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { vendor_setup_wizard: 'latest' });
        originalSetupWizard = originalAppearance?.vendor_setup_wizard ?? 'legacy';

        // A fresh vendor per worker: the wizard SAVES profile data, and mutating
        // the shared vendor1 fixture would bleed into parallel specs.
        const storePayload = payloads.createStore();
        [, sellerId] = await apiUtils.createStore(storePayload, payloads.adminAuth, true);

        const context = await browser.newContext();
        vPage = await context.newPage();
        await new LoginPage(vPage).login({ username: storePayload.user_login, password: String(USER_PASSWORD) });
        wizard = new VendorSetupWizardPage(vPage);
    });

    test.afterAll(async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { vendor_setup_wizard: originalSetupWizard });
        await vPage?.close();
        await apiUtils?.dispose();
    });

    test.describe('happy paths', () => {
        test('vendor can view the setup wizard welcome screen', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
            await wizard.gotoWizard();
            await wizard.expectWelcome();
        });

        test('vendor can complete the setup wizard end to end', { tag: ['@lite', '@vendor'] }, async () => {
            await wizard.gotoWizard();
            await wizard.markPage();
            await wizard.startJourney();
            await wizard.expectStepRail(1);

            await wizard.fillStoreStep(wizardData.store);
            await wizard.submitStoreStep();
            await wizard.expectStepRail(2);

            // Steps swap client-side: the whole wizard is one page load.
            await wizard.expectSamePageLoad();

            const afterStore = await dbUtils.getUserMeta(sellerId, 'dokan_profile_settings');
            expect(afterStore.address).toMatchObject({
                street_1: wizardData.store.street1,
                street_2: wizardData.store.street2,
                city: wizardData.store.city,
                zip: wizardData.store.zip,
                country: 'US',
                state: 'NY',
            });

            await wizard.fillPaypal(wizardData.paypalEmail);
            await wizard.submitPaymentStep();

            const afterPayment = await dbUtils.getUserMeta(sellerId, 'dokan_profile_settings');
            expect(afterPayment.payment.paypal.email).toBe(wizardData.paypalEmail);

            await wizard.expectReadyAndExplore();
        });

        test('vendor can skip the setup wizard from the welcome screen', { tag: ['@lite', '@vendor'] }, async () => {
            await wizard.gotoWizard();
            await wizard.skipFromWelcome();
        });
    });

    test.describe('edge cases', () => {
        test('store step shows previously saved values on revisit', { tag: ['@lite', '@vendor'] }, async () => {
            await wizard.gotoWizard();
            await wizard.startJourney();
            await wizard.fillStoreStep(wizardData.store);
            await wizard.submitStoreStep();

            await wizard.gotoWizard();
            await wizard.startJourney();
            await wizard.expectStorePrefilled(wizardData.store);
        });

        test('a half-filled bank form is accepted, since payment can be finished later', { tag: ['@lite', '@vendor'] }, async () => {
            await wizard.gotoWizard();
            await wizard.startJourney();
            await wizard.fillStoreStep(wizardData.store);
            await wizard.submitStoreStep();
            await wizard.submitPartialBank(wizardData.partialBankHolder);

            const meta = await dbUtils.getUserMeta(sellerId, 'dokan_profile_settings');
            expect(meta.payment.bank.ac_name).toBe(wizardData.partialBankHolder);
        });
    });

    test.describe('negative cases', () => {
        test('a malformed payment email is rejected on the payment step', { tag: ['@lite', '@vendor', '@negative'] }, async () => {
            await wizard.gotoWizard();
            await wizard.startJourney();
            await wizard.fillStoreStep(wizardData.store);
            await wizard.submitStoreStep();
            await wizard.submitMalformedPaypal(wizardData.malformedEmail);
        });

        test('guest cannot access the wizard from its URL', { tag: ['@lite', '@guest', '@negative'] }, async ({ browser }) => {
            const guestContext = await browser.newContext();
            const gPage = await guestContext.newPage();
            const guestWizard = new VendorSetupWizardPage(gPage);
            await guestWizard.gotoWizard();
            await guestWizard.expectWizardHiddenFromGuest();
            await gPage.close();
        });
    });
});
