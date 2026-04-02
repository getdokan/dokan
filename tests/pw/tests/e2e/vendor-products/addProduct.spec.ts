import { test, expect } from '@playwright/test';
import { AddProductPage } from './addProductPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'); // Vendor 1 session storage

// ============================================
// TEST SETUP
// ============================================
test.describe('Vendor Add Product Tests @lite', () => {
    test('Test Case 1 - Vendor Can Open Add New Product Page', async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);

        // Navigate to product listing and open add product form
        await addProductPage.goToProductsPage();
        await addProductPage.openAddProductForm();

        // Verify add product form heading is visible
        const isHeadingVisible = await addProductPage.isAddProductHeadingVisible();
        expect(isHeadingVisible, '"Add New Product" heading should be visible').toBe(true);

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });

    test('Test Case 2 - Vendor Adds a Simple Product', async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);
        const productName = addProductPage.makeProductName();

        // Open add product form
        await addProductPage.goToProductsPage();
        await addProductPage.openAddProductForm();

        // Fill required fields for a simple product
        await addProductPage.selectSimpleProductType();
        await addProductPage.fillTitle(productName);
        await addProductPage.fillRegularPrice(addProductPage.testData.simple.price);
        await addProductPage.fillShortDescription(addProductPage.testData.simple.short_description);
        await addProductPage.fillLongDescription(addProductPage.testData.simple.long_description);


        // Save and verify success
        await addProductPage.saveProduct();
        const successMessage = await addProductPage.getSuccessMessage();
        expect(
            successMessage,
            'Success message should indicate product save/update success'
          ).toMatch(/product.*(saved|updated).*success/i);
        // Verify created product appears in product listing
        await addProductPage.goToProductsPage();
        await addProductPage.searchProduct(productName);
        const firstProductTitle = await addProductPage.getFirstProductTitle();
        expect(firstProductTitle, 'Created product should be listed in vendor products table').toContain(productName);

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });


    // TODO: test is incomplete, need to fix it
    test('Test Case 3 - Vendor Adds a Downloadable Product', async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);
        const productName = addProductPage.makeProductName();

        // Open add product form and fill base product data
        await addProductPage.goToProductsPage();
        await addProductPage.openAddProductForm();
        await addProductPage.fillTitle(productName);
        await addProductPage.fillRegularPrice(addProductPage.testData.simple.price);
        await addProductPage.fillShortDescription(addProductPage.testData.simple.short_description);
        await addProductPage.fillLongDescription(addProductPage.testData.simple.long_description);


        // Enable downloadable option and fill downloadable fields
        await addProductPage.enableDownloadable();
        //await addProductPage.fillDownloadableFields();

        // Save and verify checkbox + downloadable data persisted
        await addProductPage.saveProduct();
        const isDownloadableChecked = await addProductPage.isDownloadableChecked();
        expect(isDownloadableChecked, 'Downloadable checkbox should remain enabled after save').toBe(true);
        // expect(await addProductPage.getDownloadableFileName(), 'Downloadable file name should be saved').toBe(addProductPage.testData.downloadable.fileName);
        // expect(await addProductPage.getDownloadableFileUrl(), 'Downloadable file URL should be saved').toBe(addProductPage.testData.downloadable.fileUrl);
        // expect(await addProductPage.getDownloadLimit(), 'Download limit should be saved').toBe(addProductPage.testData.downloadable.downloadLimit);
        // expect(await addProductPage.getDownloadExpiry(), 'Download expiry should be saved').toBe(addProductPage.testData.downloadable.downloadExpiry);

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });


    // TODO: Test is incomplete, need to fix it
    test('Test Case 4 - Vendor Adds a Virtual Product', async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);
        const productName = addProductPage.makeProductName();

        // Open add product form and fill base product data
        await addProductPage.goToProductsPage();
        await addProductPage.openAddProductForm();
        await addProductPage.fillTitle(productName);
        await addProductPage.fillRegularPrice(addProductPage.testData.simple.price);
        await addProductPage.fillShortDescription(addProductPage.testData.simple.short_description);
        await addProductPage.fillLongDescription(addProductPage.testData.simple.long_description);


        // Enable virtual option and save
        await addProductPage.enableVirtual();
        await addProductPage.saveProduct();

        // Verify virtual option remains enabled after save
        const isVirtualChecked = await addProductPage.isVirtualChecked();
        expect(isVirtualChecked, 'Virtual checkbox should remain enabled after save').toBe(true);

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });

    // 
    test('Test Case 5 - Vendor Sees Required Field Validation on Empty Save', async ({ browser }) => {
        // Using vendor session storage
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);

        // Open add product form and save without required fields
        await addProductPage.goToProductsPage();
        await addProductPage.openAddProductForm();
        await addProductPage.saveWithoutRequiredFields();

        // Verify required title and description validation errors
        // const titleError = await addProductPage.getTitleRequiredErrorText();
        // expect(titleError, 'Title required validation error should be shown').toContain('required');

        // const descriptionError = await addProductPage.getDescriptionRequiredErrorText();
        // expect(descriptionError, 'Description required validation error should be shown').toContain('Description is a required field');

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });
});
