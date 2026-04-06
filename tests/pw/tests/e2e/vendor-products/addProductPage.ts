import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class AddProductPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================
    vendor = {
        productsUrl: `${BASE_URL}/dashboard/products/`,
        addNewProductButton: 'a',
        productFormHeading: 'h1',
        productTitle: '//input[@id="inspector-input-control-0"]',
        productType: "//div[@id='dokan-form-field-type']//div//div[@class='react-select__input-container css-97oud1']",
        regularPrice: '#regular_price',
        salePrice: '#sale_price',
        downloadableCheckbox: ('input.components-checkbox-control__input')[0],
        virtualCheckbox: '#_virtual',
        saveProductButton:'span:has-text("Save Changes")',
        updateSuccessMessage: 'p:has-text("Product saved successfully")',
        titleRequiredError: "span.error[for='post_title']",
        descriptionRequiredError: '.dokan-alert-danger',
        productSearchInput: '//input[@name="product_search_name"]',
        searchButton: 'button[name="product_listing_search"]',
        firstProductRowTitle: 'table.dokan-table tbody tr td[data-title="Name"] a',
        descriptionIframe: 'iframe#post_content_ifr',
        shortDescription: "//div[@data-placeholder='Enter product short description']",
        longDescription: "//div[@data-placeholder='Enter product description']",
        
        downloadableOptions: {
            addFileButton: 'button.insert-file-row',
            fileNameInput: "input[placeholder='File Name']",
            fileUrlInput: "input[placeholder='http://']",
            downloadLimitInput: '#_download_limit',
            downloadExpiryInput: '#_download_expiry',
        },
    };

    testData = {
        simple: {
            short_description: faker.lorem.paragraph(4),
            long_description: faker.lorem.paragraph(10),
            price: '99',
        },
        downloadable: {
            fileName: 'Sample PDF',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            downloadLimit: '3',
            downloadExpiry: '7',
        },
    };

    // ============================================
    // HELPER METHODS
    // ============================================
    makeProductName = () => faker.commerce.productName();
    

    async waitForPageReady() {
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goToProductsPage() {
        await this.page.goto(this.vendor.productsUrl);
        await this.waitForPageReady()
        //await this.page.waitForLoadState("networkidle", { timeout: 10000000 });
        await this.page.getByRole('link', { name: 'Add new product' }).waitFor({ state: 'visible' });
    }

    async openAddProductForm() {
        await this.page.getByRole('link', { name: 'Add new product' }).click();
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(this.vendor.productTitle).waitFor({ state: 'visible' });
    }

    async isAddProductHeadingVisible(): Promise<boolean> {
        return this.page.getByText('New Product', { exact: true }).isVisible();
    }

    async fillTitle(title: string) {
        await this.page.locator(this.vendor.productTitle).fill(title);
    }

    async fillRegularPrice(price: string) {
        await this.page.locator(this.vendor.regularPrice).fill(price);
    }

    async fillShortDescription(short_description: string) {
        await this.page.locator(this.vendor.shortDescription).fill(short_description);
    }

    async fillLongDescription(long_description: string) {
        await this.page.locator(this.vendor.longDescription).fill(long_description);
    }

    async selectSimpleProductType() {
        await this.page.locator('.react-select__input-container').first().click();
        await this.page.getByRole('option', { name: 'Simple', exact: true }).click();
    }

    async saveProduct() {
        // await Promise.all([
        //     this.page.waitForResponse(
        //         (response) =>
        //             response.url().includes('/dashboard/products/') &&
        //             response.request().method() === 'POST'
        //     ),
        //     this.page.locator(this.vendor.saveProductButton).click(),
        // ]);
        // await Promise.all([
        //     this.page.waitForResponse(
        //         (response) =>
        //             response.url().includes('/dashboard/products/') &&
        //             response.request().method() === 'POST'
        //     ),
        await this.page.locator(this.vendor.saveProductButton).click()
        
    }

    async getSuccessMessage(): Promise<string> {
        const success = this.page.locator(this.vendor.updateSuccessMessage).first();
        await success.waitFor({ state: 'visible' });
        return (await success.textContent())?.trim() ?? '';
    }

    async searchProduct(productName: string) {
        await this.page.locator(this.vendor.productSearchInput).fill(productName);
        await this.page.locator(this.vendor.searchButton).click({delay: 1000});
        await this.page.waitForLoadState('networkidle');
    }

    async getFirstProductTitle(): Promise<string> {
        const title = this.page.locator(this.vendor.firstProductRowTitle).first();
        await title.waitFor({ state: 'visible' });
        return (await title.textContent())?.trim() ?? '';
    }

    async enableDownloadable() {
        const downloadable = this.page.getByRole('checkbox', { name: 'Downloadable' })
        await downloadable.check();
        if (!(await downloadable.isChecked())) {
            await downloadable.check();
        }
    }

    async enableVirtual() {
        const virtual = this.page.getByRole('checkbox', { name: 'Virtual' })
        if (!(await virtual.isChecked())) {
            await virtual.check();
        }
    }

    async isDownloadableChecked(): Promise<boolean> {
        const downloadable = this.page.getByRole('checkbox', { name: 'Downloadable' })
        return await downloadable.isChecked();
    }

    async isVirtualChecked(): Promise<boolean> {
        const virtual = this.page.getByRole('checkbox', { name: 'Virtual' })
        return await virtual.isChecked();
    }

    async fillDownloadableFields() {
        await this.page.locator('button').filter({ hasText: 'Choose' }).first().click();
        const chooseFileButton = this.page.locator('button').filter({ hasText: 'Upload Files' });
        await chooseFileButton.click();
        await this.page.locator('#__wp-uploader-id-4').click();

        
        await this.page.locator(this.vendor.downloadableOptions.fileNameInput).fill(this.testData.downloadable.fileName);
        await this.page.locator(this.vendor.downloadableOptions.fileUrlInput).fill(this.testData.downloadable.fileUrl);
        await this.page.locator(this.vendor.downloadableOptions.downloadLimitInput).fill(this.testData.downloadable.downloadLimit);
        await this.page.locator(this.vendor.downloadableOptions.downloadExpiryInput).fill(this.testData.downloadable.downloadExpiry);
    }

    async getDownloadableFileName(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.fileNameInput)
                .first()
                .inputValue()
        ).trim();
    }

    async getDownloadableFileUrl(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.fileUrlInput)
                .first()
                .inputValue()
        ).trim();
    }

    async getDownloadLimit(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.downloadLimitInput)
                .inputValue()
        ).trim();
    }

    async getDownloadExpiry(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.downloadExpiryInput)
                .inputValue()
        ).trim();
    }

    async saveWithoutRequiredFields() {
        await this.page.locator(this.vendor.saveProductButton).isDisabled();
    }

    async getTitleRequiredErrorText(): Promise<string> {
        const err = this.page.locator(this.vendor.titleRequiredError).first();
        await err.waitFor({ state: 'visible' });
        return (await err.textContent())?.trim() ?? '';
    }

    async getDescriptionRequiredErrorText(): Promise<string> {
        const err = this.page.locator(this.vendor.descriptionRequiredError).first();
        await err.waitFor({ state: 'visible' });
        return (await err.textContent())?.trim() ?? '';
    }
}
