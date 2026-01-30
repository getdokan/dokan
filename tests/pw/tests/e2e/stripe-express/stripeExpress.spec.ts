import { test, expect, Page } from '@playwright/test';
import { StripeExpressPage } from './stripeExpressPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');        // Admin session storage
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');       // Vendor 1 session storage
const v2 = path.join(__dirname, '../../../playwright/.auth/vendor2StorageState.json');      // Vendor 2 session storage
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');     // Customer 1 session storage

// ============================================
// TEST SETUP
// ============================================

test.describe('Stripe Express Tests @lite', () => {
    // Each test will create its own context and page with the appropriate storage state
    let isStripeExpressEnabled = false;

    // ============================================
    // TEST CASES
    // ============================================
    // Note: To use a specific user session, create context with storageState
    // Example: 
    // const context = await browser.newContext({ storageState: a1 });
    // const page = await context.newPage();

    test('Test Case 1 - Verify Stripe Express is Enabled', async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const stripeExpressPage = new StripeExpressPage(adminPage);
        
        // Navigate to Stripe Express settings page
        await stripeExpressPage.goToStripeExpressSettings();
        
        // Check if Stripe Express is enabled
        isStripeExpressEnabled = await stripeExpressPage.isStripeExpressEnabled();
        
        // Assert that Stripe Express is enabled
        expect(isStripeExpressEnabled, 'Stripe Express must be enabled to run tests').toBe(true);
        
        await adminPage.close();
        await context.close();
    });

    test('Test Case 2 - Placeholder', async ({ browser }) => {
        test.skip(!isStripeExpressEnabled, 'Stripe Express is not enabled - skipping test');
        
        // Example: Using vendor 1 session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const vendorStripeExpressPage = new StripeExpressPage(vendorPage);
        
        // TODO: Add test steps here
        
        await vendorPage.close();
        await context.close();
    });

    test('Test Case 3 - Enable Stripe Express Module and Disable Stripe Connect Module', async ({ browser }) => {
        test.skip(!isStripeExpressEnabled, 'Stripe Express is not enabled - skipping test');
        
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const stripeExpressPage = new StripeExpressPage(adminPage);
        
        // Navigate to modules page
        await stripeExpressPage.goToModulesPage();
        
        // Search for Stripe Express
        await stripeExpressPage.searchModule('Stripe Express');
        
        // Enable Stripe Express if disabled, or pass if already enabled
        await stripeExpressPage.enableModuleIfDisabled('Stripe Express');
        
        // Verify Stripe Express is enabled
        const isStripeExpressModuleEnabled = await stripeExpressPage.getModuleToggleState('Stripe Express');
        expect(isStripeExpressModuleEnabled, 'Stripe Express module should be enabled').toBe(true);
        
        // Clear search
        await stripeExpressPage.clearSearch();
        
        // Search for Stripe Connect
        await stripeExpressPage.searchModule('Stripe Connect');
        
        // Disable Stripe Connect if enabled, or pass if already disabled
        await stripeExpressPage.disableModuleIfEnabled('Stripe Connect');
        
        // Verify Stripe Connect is disabled
        const isStripeConnectModuleEnabled = await stripeExpressPage.getModuleToggleState('Stripe Connect');
        expect(isStripeConnectModuleEnabled, 'Stripe Connect module should be disabled').toBe(false);
        
        await adminPage.close();
        await context.close();
    });

    test('Test Case 4 - Verify Visit Express Dashboard Button is Visible', async ({ browser }) => {
        test.skip(!isStripeExpressEnabled, 'Stripe Express is not enabled - skipping test');
        
        // Using vendor 1 session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const stripeExpressPage = new StripeExpressPage(vendorPage);
        
        // Navigate to Stripe Express onboarding page
        await stripeExpressPage.goToStripeExpressOnboarding();
        
        // Check if the "Visit Express Dashboard" button is visible
        const isButtonVisible = await stripeExpressPage.isVisitExpressDashboardButtonVisible();
        expect(isButtonVisible, 'Visit Express Dashboard button should be visible').toBe(true);
        
        // Verify the button text
        const buttonText = await stripeExpressPage.getVisitExpressDashboardButtonText();
        expect(buttonText, 'Button should have correct text').toBe('Visit Express Dashboard');
        
        await vendorPage.close();
        await context.close();
    });

    test('Test Case 5 - Placeholder', async ({ browser }) => {
        test.skip(!isStripeExpressEnabled, 'Stripe Express is not enabled - skipping test');
        
        // TODO: Add test steps
    });
});
